import * as THREE from 'three';
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';

// Volumetric sky clouds — a true raymarch through a high-altitude slab that
// follows the camera, rendered at reduced resolution into an HDR buffer
// (scatter.rgb, transmittance.a) and composited into the scene before tone-map.
// Adapted from a box-confined ground-fog raymarch: 3D fBm density carved by a
// height-falling coverage threshold (organic rolling tops), a light-march for
// self-shadowing, a Henyey–Greenstein phase for the backlit silver lining, and
// a detail-erosion octave that frays the edges into wisps.
export class Clouds {
  constructor(renderer, width, height, { scale = 0.72 } = {}) {
    this.renderer = renderer;
    this.scale = scale;
    this.enabled = false;
    this._w = width;
    this._h = height;

    this.rt = new THREE.WebGLRenderTarget(this._rw(), this._rh(), {
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
    });

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tDepth: { value: null },
        uInvProj: { value: new THREE.Matrix4() },
        uInvView: { value: new THREE.Matrix4() },
        uCameraPos: { value: new THREE.Vector3() },
        uTime: { value: 0 },
        uNear: { value: 0.1 },
        uFar: { value: 8000 },

        uHalfXZ: { value: 5000 },     // camera-centred slab half-extent
        uBase: { value: 380 },        // cloud-layer altitude
        uHeight: { value: 150 },      // layer thickness
        uHeightFalloff: { value: 0.38 }, // 1 = hug the base (rolling top)
        uDensity: { value: 0.5 },
        uCoverage: { value: 0.39 },
        uCoverageEdge: { value: 0.16 },
        uNoiseScale: { value: 0.002 }, // smaller = bigger clouds
        uDetail: { value: 0.16 },
        uDetailScale: { value: 4.0 },
        uEdgeFade: { value: 1600 },   // soft fade toward the slab walls
        uWindDir: { value: new THREE.Vector2(1, 0.35).normalize() },
        uWindSpeed: { value: 0.03 },
        uSteps: { value: 96 },
        uMaxSpan: { value: 4200 },
        uLightSteps: { value: 6 },
        uLightStepSize: { value: 34 },
        uAniso: { value: 0.6 },
        uAmbient: { value: 1.0 },
        uSunStrength: { value: 2.7 },
        uFogColor: { value: new THREE.Color(0.42, 0.5, 0.62) }, // shadowed body
        uSunColor: { value: new THREE.Color(1.0, 0.95, 0.86) }, // lit / scattered
        uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        #include <packing>
        uniform sampler2D tDepth;
        uniform mat4 uInvProj, uInvView;
        uniform vec3 uCameraPos, uFogColor, uSunColor, uSunDir;
        uniform vec2 uWindDir;
        uniform float uTime, uNear, uFar, uHalfXZ, uBase, uHeight, uHeightFalloff,
                      uDensity, uCoverage, uCoverageEdge, uNoiseScale, uDetail,
                      uDetailScale, uEdgeFade, uWindSpeed, uSteps, uMaxSpan,
                      uLightSteps, uLightStepSize, uAniso, uAmbient, uSunStrength;
        varying vec2 vUv;

        float hash13(vec3 p) {
          p = fract(p * 0.3183099 + 0.1);
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }
        float vnoise3(vec3 x) {
          vec3 i = floor(x), f = fract(x);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(mix(hash13(i + vec3(0,0,0)), hash13(i + vec3(1,0,0)), f.x),
                mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
            mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x),
                mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y), f.z);
        }
        float fbm3(vec3 p) {
          float v = 0.0, a = 0.5;
          mat3 m = mat3(0.0, 0.8, 0.6, -0.8, 0.36, -0.48, -0.6, -0.48, 0.64);
          for (int i = 0; i < 5; i++) { v += a * vnoise3(p); p = m * p * 2.02; a *= 0.5; }
          return v;
        }

        // Organic cloud density: coverage thins with height so the noise sculpts
        // a rolling top. Slab follows the camera in XZ with soft walls.
        float densityAt(vec3 p) {
          vec2 rel = abs(p.xz - uCameraPos.xz);
          vec2 e = uHalfXZ - rel;
          float edge = smoothstep(0.0, uEdgeFade, min(e.x, e.y));
          if (edge <= 0.001) return 0.0;

          float yl = (p.y - uBase) / max(uHeight, 1e-3);
          if (yl <= 0.0 || yl >= 1.0) return 0.0;
          float floorFade = smoothstep(0.0, 0.10, yl);
          float ceilFade  = smoothstep(1.0, 0.80, yl);

          vec3 drift = vec3(uWindDir.x, 0.06, uWindDir.y) * (uTime * uWindSpeed);
          vec3 q = p * uNoiseScale + drift;
          float n = fbm3(q);

          float cov = uCoverage * (1.0 - uHeightFalloff * yl);
          float th = 1.0 - cov;
          float d = smoothstep(th - uCoverageEdge, th + uCoverageEdge, n);

          if (d > 0.001 && uDetail > 0.0) {
            float hi = fbm3(q * uDetailScale + drift * 2.0 + 19.0);
            d = clamp(d - (1.0 - d) * hi * uDetail, 0.0, 1.0);
          }
          return d * edge * floorFade * ceilFade * uDensity;
        }

        float lightTransmit(vec3 p) {
          vec3 L = normalize(uSunDir);
          float dsum = 0.0;
          for (int j = 0; j < 8; j++) {
            if (float(j) >= uLightSteps) break;
            dsum += densityAt(p + L * (float(j) + 0.5) * uLightStepSize);
          }
          return exp(-dsum * uLightStepSize);
        }
        float hg(float cosT, float g) {
          float g2 = g * g;
          return (1.0 - g2) / (12.5663706 * pow(1.0 + g2 - 2.0 * g * cosT, 1.5));
        }
        vec2 intersectBox(vec3 ro, vec3 rd, vec3 bmin, vec3 bmax) {
          vec3 inv = 1.0 / rd;
          vec3 t0 = (bmin - ro) * inv;
          vec3 t1 = (bmax - ro) * inv;
          vec3 tmin = min(t0, t1), tmax = max(t0, t1);
          return vec2(max(max(tmin.x, tmin.y), tmin.z),
                      min(min(tmax.x, tmax.y), tmax.z));
        }
        vec3 worldFromDepth(vec2 uv, float d) {
          vec4 clip = vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0);
          vec4 view = uInvProj * clip; view /= view.w;
          return (uInvView * view).xyz;
        }

        void main() {
          float depth = texture2D(tDepth, vUv).x;
          // Sky (no geometry) writes the far plane → clouds fill the sky.
          float sceneDist = depth >= 0.9999 ? 1e9 : length(worldFromDepth(vUv, depth) - uCameraPos);

          vec3 ro = uCameraPos;
          // Ray direction from the reconstructed far-plane point.
          vec3 far = worldFromDepth(vUv, 1.0);
          vec3 rd = normalize(far - ro);

          vec3 c = vec3(uCameraPos.x, 0.0, uCameraPos.z);
          vec3 bmin = c + vec3(-uHalfXZ, uBase, -uHalfXZ);
          vec3 bmax = c + vec3(uHalfXZ, uBase + uHeight, uHalfXZ);
          vec2 hit = intersectBox(ro, rd, bmin, bmax);
          float tN = max(hit.x, 0.0);
          float tF = min(min(hit.y, sceneDist), tN + uMaxSpan);
          if (tF <= tN) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }

          float span = tF - tN;
          float stepLen = span / uSteps;
          float cosT = dot(rd, normalize(uSunDir));
          float phase = mix(hg(cosT, uAniso), 0.28, 0.5);

          float dither = hash13(vec3(vUv * 1000.0, fract(uTime)));
          float t = tN + stepLen * dither;
          float transmittance = 1.0;
          vec3 scatter = vec3(0.0);

          for (int i = 0; i < 96; i++) {
            if (float(i) >= uSteps || t > tF) break;
            vec3 p = ro + rd * t;
            float dens = densityAt(p);
            if (dens > 0.001) {
              float lt = lightTransmit(p);
              vec3 lum = uSunColor * (uSunStrength * phase * lt) + uFogColor * uAmbient;
              float ai = 1.0 - exp(-dens * stepLen);
              scatter += transmittance * ai * lum;
              transmittance *= (1.0 - ai);
              if (transmittance < 0.02) break;
            }
            t += stepLen;
          }
          gl_FragColor = vec4(scatter, transmittance);
        }
      `,
    });
    this.quad = new FullScreenQuad(this.material);

    // A light separable blur on the low-res buffer smooths raymarch/dither
    // speckle before it's upsampled and composited.
    this.rtB = this.rt.clone();
    this.blurMat = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uDir: { value: new THREE.Vector2() },
        uTexel: { value: new THREE.Vector2() },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D tDiffuse;
        uniform vec2 uDir, uTexel;
        void main(){
          // Light, tight 3-tap denoise — just enough to knock back dither
          // speckle without softening the cloud edges.
          vec2 o = uDir * uTexel;
          vec4 c = texture2D(tDiffuse, vUv) * 0.5;
          c += (texture2D(tDiffuse, vUv + o) + texture2D(tDiffuse, vUv - o)) * 0.25;
          gl_FragColor = c;
        }
      `,
    });
    this.blurQuad = new FullScreenQuad(this.blurMat);
  }

  _rw() { return Math.max(1, Math.floor(this._w * this.scale)); }
  _rh() { return Math.max(1, Math.floor(this._h * this.scale)); }
  get texture() { return this.rt.texture; }
  get uniforms() { return this.material.uniforms; }

  setSize(w, h) {
    this._w = w;
    this._h = h;
    this.rt.setSize(this._rw(), this._rh());
    this.rtB.setSize(this._rw(), this._rh());
  }

  // Warm, sun-tinted lighting that tracks the time of day.
  setSun(sunDir) {
    const el = Math.max(sunDir.y, 0.0);
    this.material.uniforms.uSunDir.value.copy(sunDir);
    // lit tops: orange near the horizon → warm white overhead
    this.material.uniforms.uSunColor.value.setRGB(1.0, 0.55 + 0.4 * el, 0.32 + 0.6 * el);
    // shadowed bodies: cool blue-grey, a touch darker at low sun
    this.material.uniforms.uFogColor.value.setRGB(0.30 + 0.18 * el, 0.40 + 0.16 * el, 0.55 + 0.12 * el);
  }

  render(dt, camera, depthTexture) {
    const u = this.material.uniforms;
    u.uTime.value += dt;
    u.tDepth.value = depthTexture;
    u.uInvProj.value.copy(camera.projectionMatrixInverse);
    u.uInvView.value.copy(camera.matrixWorld);
    u.uCameraPos.value.copy(camera.position);
    u.uNear.value = camera.near;
    u.uFar.value = camera.far;

    const prev = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.rt);
    this.quad.render(this.renderer);

    // Blur H (rt → rtB) then V (rtB → rt) to de-speckle.
    this.blurMat.uniforms.uTexel.value.set(1 / this._rw(), 1 / this._rh());
    this.blurMat.uniforms.tDiffuse.value = this.rt.texture;
    this.blurMat.uniforms.uDir.value.set(1, 0);
    this.renderer.setRenderTarget(this.rtB);
    this.blurQuad.render(this.renderer);
    this.blurMat.uniforms.tDiffuse.value = this.rtB.texture;
    this.blurMat.uniforms.uDir.value.set(0, 1);
    this.renderer.setRenderTarget(this.rt);
    this.blurQuad.render(this.renderer);

    this.renderer.setRenderTarget(prev);
  }
}
