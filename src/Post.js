import * as THREE from 'three';
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import { NOISE, CAUSTICS } from './shaders/common.js';

const halfFloatRT = (w, h, depth = false) => {
  const opts = {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: depth,
  };
  const rt = new THREE.WebGLRenderTarget(w, h, opts);
  if (depth) {
    rt.depthTexture = new THREE.DepthTexture(w, h);
    rt.depthTexture.type = THREE.UnsignedIntType;
  }
  return rt;
};

// Full post chain: underwater absorption + volumetric god-rays (reconstructed
// from the depth buffer), threshold bloom for sun glints, then ACES tone-map
// and sRGB encode to the screen.
export class Post {
  constructor(renderer, width, height, sunDir, deepColor) {
    this.renderer = renderer;
    this.quad = new FullScreenQuad();

    this.sceneRT = halfFloatRT(width, height);
    const bw = Math.max(1, width >> 1);
    const bh = Math.max(1, height >> 1);
    this.brightRT = halfFloatRT(bw, bh);
    this.blurA = halfFloatRT(bw, bh);
    this.blurB = halfFloatRT(bw, bh);

    // ---- Underwater volumetrics --------------------------------------------
    this.underwaterMat = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        tDepth: { value: null },
        uInvProjView: { value: new THREE.Matrix4() },
        uCameraPos: { value: new THREE.Vector3() },
        uSunDir: { value: sunDir.clone() },
        uTime: { value: 0 },
        uUnderwater: { value: 0 },
        uSurfaceY: { value: 0 },
        uDeepColor: { value: deepColor.clone() },
        uShaftColor: { value: new THREE.Color(1.0, 0.98, 0.9) },
        uExtinction: { value: new THREE.Vector3(0.05, 0.031, 0.022) },
        uFogStrength: { value: 1.0 },
        uShaftDensity: { value: 0.05 },
        uMaxDist: { value: 140.0 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        ${NOISE}
        ${CAUSTICS}
        varying vec2 vUv;
        uniform sampler2D tDiffuse;
        uniform sampler2D tDepth;
        uniform mat4 uInvProjView;
        uniform vec3 uCameraPos;
        uniform vec3 uSunDir;
        uniform float uTime;
        uniform float uUnderwater;
        uniform float uSurfaceY;
        uniform vec3 uDeepColor;
        uniform vec3 uShaftColor;
        uniform vec3 uExtinction;
        uniform float uFogStrength;
        uniform float uShaftDensity;
        uniform float uMaxDist;

        float hg(float c, float g){
          float g2 = g * g;
          return (1.0 - g2) / (12.5663706 * pow(1.0 + g2 - 2.0 * g * c, 1.5));
        }

        void main(){
          vec3 col = texture2D(tDiffuse, vUv).rgb;
          if (uUnderwater < 0.5){ gl_FragColor = vec4(col, 1.0); return; }

          // Reconstruct world position from depth.
          float d = texture2D(tDepth, vUv).x;
          vec4 clip = vec4(vUv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0);
          vec4 wp = uInvProjView * clip;
          wp /= wp.w;
          vec3 worldPos = wp.xyz;

          vec3 toFrag = worldPos - uCameraPos;
          float viewDist = length(toFrag);
          vec3 rd = toFrag / max(viewDist, 1e-3);

          // Beer-Lambert absorption toward the deep-water colour.
          float dist = min(viewDist, uMaxDist * 3.0);
          vec3 trans = exp(-uExtinction * dist);
          vec3 col2 = col * trans + uDeepColor * (1.0 - trans) * uFogStrength;

          // Volumetric shafts: march the view ray, sampling a caustic pattern
          // projected up the sun direction to the surface.
          float dither = fract(sin(dot(vUv, vec2(12.9898, 78.233)) + uTime) * 43758.5453);
          float marchLen = min(viewDist, uMaxDist);
          const int STEPS = 28;
          float dt = marchLen / float(STEPS);
          float acc = 0.0;
          for (int i = 0; i < STEPS; i++){
            float s = (float(i) + dither) * dt;
            vec3 p = uCameraPos + rd * s;
            float below = uSurfaceY - p.y;
            if (below <= 0.0) continue;
            float proj = below / max(uSunDir.y, 0.15);
            vec2 sxz = (p + uSunDir * proj).xz;
            float shaft = caustics(sxz * 0.03 + uSunDir.xz * uTime * 0.25, uTime * 0.5);
            acc += shaft * exp(-below * 0.03);
          }
          acc *= dt;
          float phase = hg(clamp(dot(rd, uSunDir), -1.0, 1.0), 0.72);
          vec3 rays = uShaftColor * acc * uShaftDensity * phase;

          gl_FragColor = vec4(col2 + rays, 1.0);
        }
      `,
    });

    // ---- Bloom bright-pass --------------------------------------------------
    this.brightMat = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uThreshold: { value: 1.15 },
        uKnee: { value: 0.9 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D tDiffuse;
        uniform float uThreshold;
        uniform float uKnee;
        void main(){
          vec3 c = texture2D(tDiffuse, vUv).rgb;
          float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
          float k = smoothstep(uThreshold, uThreshold + uKnee, l);
          gl_FragColor = vec4(c * k, 1.0);
        }
      `,
    });

    // ---- Separable Gaussian blur -------------------------------------------
    this.blurMat = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uDir: { value: new THREE.Vector2(1, 0) },
        uTexel: { value: new THREE.Vector2(1 / bw, 1 / bh) },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D tDiffuse;
        uniform vec2 uDir;
        uniform vec2 uTexel;
        void main(){
          vec2 o = uDir * uTexel;
          vec3 sum = texture2D(tDiffuse, vUv).rgb * 0.227027;
          sum += texture2D(tDiffuse, vUv + o * 1.3846).rgb * 0.316216;
          sum += texture2D(tDiffuse, vUv - o * 1.3846).rgb * 0.316216;
          sum += texture2D(tDiffuse, vUv + o * 3.2308).rgb * 0.070270;
          sum += texture2D(tDiffuse, vUv - o * 3.2308).rgb * 0.070270;
          gl_FragColor = vec4(sum, 1.0);
        }
      `,
    });

    // ---- Final composite: bloom add, exposure, ACES, sRGB, vignette ---------
    this.compositeMat = new THREE.ShaderMaterial({
      uniforms: {
        tScene: { value: null },
        tBloom: { value: null },
        uBloom: { value: 0.65 },
        uExposure: { value: 1.05 },
        uUnderwater: { value: 0 },
        uVignette: { value: 0.35 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D tScene;
        uniform sampler2D tBloom;
        uniform float uBloom;
        uniform float uExposure;
        uniform float uUnderwater;
        uniform float uVignette;

        vec3 aces(vec3 x){
          const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
          return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
        }
        vec3 toSRGB(vec3 c){
          return mix(c * 12.92,
                     1.055 * pow(max(c, 0.0), vec3(1.0 / 2.4)) - 0.055,
                     step(0.0031308, c));
        }

        void main(){
          vec3 c = texture2D(tScene, vUv).rgb;
          c += texture2D(tBloom, vUv).rgb * uBloom;
          c *= uExposure;
          c = aces(c);

          // Gentle underwater vignette for depth.
          vec2 q = vUv - 0.5;
          float vig = 1.0 - dot(q, q) * uVignette * 2.0;
          c *= mix(1.0, clamp(vig, 0.0, 1.0), uUnderwater);

          gl_FragColor = vec4(toSRGB(c), 1.0);
        }
      `,
    });
  }

  setSize(w, h) {
    const bw = Math.max(1, w >> 1);
    const bh = Math.max(1, h >> 1);
    this.sceneRT.setSize(w, h);
    this.brightRT.setSize(bw, bh);
    this.blurA.setSize(bw, bh);
    this.blurB.setSize(bw, bh);
    this.blurMat.uniforms.uTexel.value.set(1 / bw, 1 / bh);
  }

  _draw(mat, target) {
    this.quad.material = mat;
    this.renderer.setRenderTarget(target);
    this.quad.render(this.renderer);
  }

  render(hdrRT, params) {
    const uw = this.underwaterMat.uniforms;
    uw.tDiffuse.value = hdrRT.texture;
    uw.tDepth.value = hdrRT.depthTexture;
    uw.uInvProjView.value.copy(params.invProjView);
    uw.uCameraPos.value.copy(params.cameraPos);
    uw.uSunDir.value.copy(params.sunDir);
    uw.uTime.value = params.time;
    uw.uUnderwater.value = params.underwater ? 1 : 0;
    uw.uSurfaceY.value = params.surfaceY;

    // 1) underwater volumetrics → sceneRT
    this._draw(this.underwaterMat, this.sceneRT);

    // 2) bright pass → brightRT
    this.brightMat.uniforms.tDiffuse.value = this.sceneRT.texture;
    this._draw(this.brightMat, this.brightRT);

    // 3) two blur iterations (H, V) x2
    let src = this.brightRT;
    for (let i = 0; i < 2; i++) {
      this.blurMat.uniforms.tDiffuse.value = src.texture;
      this.blurMat.uniforms.uDir.value.set(1, 0);
      this._draw(this.blurMat, this.blurA);
      this.blurMat.uniforms.tDiffuse.value = this.blurA.texture;
      this.blurMat.uniforms.uDir.value.set(0, 1);
      this._draw(this.blurMat, this.blurB);
      src = this.blurB;
    }

    // 4) composite → screen
    this.compositeMat.uniforms.tScene.value = this.sceneRT.texture;
    this.compositeMat.uniforms.tBloom.value = this.blurB.texture;
    this.compositeMat.uniforms.uUnderwater.value = params.underwater ? 1 : 0;
    this._draw(this.compositeMat, null);
  }
}
