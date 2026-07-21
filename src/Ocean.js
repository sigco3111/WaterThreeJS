import * as THREE from 'three';
import {
  NOISE,
  OCEAN_GERSTNER,
  DETAIL_NORMAL,
  ATMOSPHERE,
  WATER_TINT,
} from './shaders/common.js';

const fract = (v) => v - Math.floor(v);

// Default wave-field / look configuration. Everything the GUI tweaks lives here.
export const OCEAN_CONFIG = {
  windDir: new THREE.Vector2(1.0, 0.55).normalize(),
  waveCount: 26,
  baseWavelength: 150.0, // metres — the longest swell
  amplitude: 0.72,       // calm tropical sea by default
  choppy: 0.5,
  dirSpread: 0.95,
  freqMul: 1.19,
  ampMul: 0.82,
  speed: 1.0,
  surfaceY: 0.0,
  refractStrength: 0.05,
  detailScale: 0.3,
  detailStrength: 0.12,
  foamThreshold: 0.2,
  foamSoftness: 0.4,
  crestFoamStart: 1.4, // wave height (m) at which whitecaps begin (calm = rare)
  shoreFoamWidth: 3.4, // water-column depth (m) over which shore foam builds
  deepColor: new THREE.Color(0.003, 0.05, 0.1),
  shallowColor: new THREE.Color(0.12, 0.55, 0.55),
  foamColor: new THREE.Color(0.94, 0.97, 0.99),
  sssColor: new THREE.Color(0.1, 0.52, 0.46),
};

export class Ocean {
  constructor(sunDir, resolution) {
    const c = OCEAN_CONFIG;

    this.uniforms = {
      uTime: { value: 0 },
      uSunDir: { value: sunDir.clone() },

      // wave spectrum
      uWindDir: { value: c.windDir.clone() },
      uWaveCount: { value: c.waveCount },
      uBaseFreq: { value: (2.0 * Math.PI) / c.baseWavelength },
      uAmplitude: { value: c.amplitude },
      uChoppy: { value: c.choppy },
      uDirSpread: { value: c.dirSpread },
      uFreqMul: { value: c.freqMul },
      uAmpMul: { value: c.ampMul },
      uSpeed: { value: c.speed },
      uSurfaceY: { value: c.surfaceY },

      // shading
      uResolution: { value: resolution.clone() },
      uRefractionTex: { value: null },
      uDepthTex: { value: null },
      uNear: { value: 0.1 },
      uFar: { value: 8000 },
      uCameraUnderwater: { value: 0 },
      uRefractStrength: { value: c.refractStrength },
      uDetailScale: { value: c.detailScale },
      uDetailStrength: { value: c.detailStrength },
      uFoamThreshold: { value: c.foamThreshold },
      uFoamSoftness: { value: c.foamSoftness },
      uCrestFoamStart: { value: c.crestFoamStart },
      uShoreFoamWidth: { value: c.shoreFoamWidth },
      uDeepColor: { value: c.deepColor.clone() },
      uShallowColor: { value: c.shallowColor.clone() },
      uFoamColor: { value: c.foamColor.clone() },
      uSSSColor: { value: c.sssColor.clone() },
    };

    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      toneMapped: false,
      uniforms: this.uniforms,
      vertexShader: /* glsl */ `
        precision highp float;
        ${NOISE}
        ${OCEAN_GERSTNER}
        uniform float uSurfaceY;

        varying vec3 vWorldPos;
        varying vec3 vNormal;
        varying float vFold;
        varying float vHeight;
        varying float vViewZ;

        void main(){
          vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          worldPos.y = uSurfaceY;

          WaveSample w = sampleOcean(worldPos.xz);
          vec3 displaced = worldPos + w.displacement;

          vWorldPos = displaced;
          vNormal   = w.normal;
          vFold     = w.fold;
          vHeight   = w.height;

          vec4 viewPos = viewMatrix * vec4(displaced, 1.0);
          vViewZ = viewPos.z;
          gl_Position = projectionMatrix * viewPos;
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        #include <packing>

        // Uniforms first — the shared chunks below (detailNormal) reference them.
        uniform float uTime;
        uniform vec3  uSunDir;
        uniform vec2  uWindDir;
        uniform vec2  uResolution;
        uniform sampler2D uRefractionTex;
        uniform sampler2D uDepthTex;
        uniform float uNear;
        uniform float uFar;
        uniform float uCameraUnderwater;
        uniform float uRefractStrength;
        uniform float uDetailScale;
        uniform float uDetailStrength;
        uniform float uFoamThreshold;
        uniform float uFoamSoftness;
        uniform float uCrestFoamStart;
        uniform float uShoreFoamWidth;
        uniform vec3  uDeepColor;
        uniform vec3  uShallowColor;
        uniform vec3  uFoamColor;
        uniform vec3  uSSSColor;

        ${NOISE}
        ${ATMOSPHERE}
        ${DETAIL_NORMAL}
        ${WATER_TINT}

        varying vec3 vWorldPos;
        varying vec3 vNormal;
        varying float vFold;
        varying float vHeight;
        varying float vViewZ;

        float fresnelF(float c, float f0){
          return f0 + (1.0 - f0) * pow(clamp(1.0 - c, 0.0, 1.0), 5.0);
        }
        float sceneEyeDepth(vec2 uv){
          float d = texture2D(uDepthTex, uv).x;
          return -perspectiveDepthToViewZ(d, uNear, uFar); // positive metres
        }

        void main(){
          vec3 sunDir = normalize(uSunDir);
          vec3 V = normalize(cameraPosition - vWorldPos);
          float sunElev = clamp(sunDir.y, 0.0, 1.0);

          // Base Gerstner normal + fine scrolling ripple detail.
          vec3 N = normalize(vNormal);
          vec3 dN = detailNormal(vWorldPos.xz * uDetailScale, uTime, 1.0);
          N = normalize(vec3(N.x + dN.x * uDetailStrength,
                             N.y,
                             N.z + dN.z * uDetailStrength));
          vec3 Ns = N.y >= 0.0 ? N : -N;      // geometric up (points to the air)
          if (dot(N, V) < 0.0) N = -N;         // shading normal faces the viewer

          bool underwater = uCameraUnderwater > 0.5;
          vec2 screenUV = gl_FragCoord.xy / uResolution;
          vec3 color;
          float shoreFoam = 0.0;

          if (!underwater){
            // ================= ABOVE WATER =================
            vec3 R = reflect(-V, N);
            R.y = max(R.y, 0.015);
            vec3 reflection = atmosphere(R, sunDir);

            float fres = fresnelF(max(dot(N, V), 0.0), 0.02);

            // Refraction of the pre-rendered scene, attenuated by water column.
            float waterEye = -vViewZ;
            vec2  rUV = clamp(screenUV + N.xz * uRefractStrength, vec2(0.001), vec2(0.999));
            float sceneEye = sceneEyeDepth(rUV);
            if (sceneEye < waterEye){ rUV = screenUV; sceneEye = sceneEyeDepth(rUV); }
            float thickness = max(sceneEye - waterEye, 0.0);

            // Clear-water transmission: the seabed shows through, tinted and
            // dimmed by the water column. Bright turquoise over shallow sand,
            // fading to dark saturated deep — the tropical depth gradient.
            vec3 sceneCol = texture2D(uRefractionTex, rUV).rgb;
            vec3 T = exp(-ABSORB * thickness);                 // background transmittance
            vec3 waterCol = mix(uShallowColor, uDeepColor, 1.0 - exp(-thickness * 0.14));
            waterCol *= 0.55 + 0.45 * sunElev;
            vec3 transmitted = sceneCol * T + waterCol * (1.0 - T);

            color = mix(transmitted, reflection, fres);

            // Shoreline: a textured, advecting foam band where water gets shallow.
            float shore = smoothstep(uShoreFoamWidth, 0.12, thickness);
            float sTex = fbm(vWorldPos.xz * 0.5 - uWindDir * uTime * 0.6, 4);
            shoreFoam = shore * smoothstep(0.15, 0.55, sTex);

            // Subsurface translucency: a subtle glow through thin, back-lit
            // crests only — kept gentle so it never washes the sea cyan.
            float back  = pow(max(dot(V, -sunDir), 0.0), 4.0);
            float crest = smoothstep(0.4, 1.8, vHeight) * max(N.y, 0.0);
            color += uSSSColor * back * crest * sunElev * 0.35;

            // Crisp sun sparkle riding on the ripple normals.
            vec3 H = normalize(V + sunDir);
            float spec = pow(max(dot(N, H), 0.0), 400.0);
            color += vec3(1.0, 0.96, 0.86) * spec * 5.0 * sunElev;

          } else {
            // ============ SEEN FROM BELOW (Snell's window) ============
            vec3 I = normalize(vWorldPos - cameraPosition); // toward the surface
            vec3 refr = refract(I, -Ns, 1.333);             // water -> air
            float ci = abs(dot(Ns, I));
            float fres = fresnelF(ci, 0.02);

            if (dot(refr, refr) < 1e-4){
              // Total internal reflection: mirror the underwater volume.
              vec3 rl = reflect(I, -Ns);
              color = mix(uDeepColor * 0.5, uShallowColor * 0.55,
                          clamp(rl.y * 0.5 + 0.5, 0.0, 1.0));
            } else {
              vec3 sky = atmosphere(refr, sunDir);
              vec3 internal = mix(uDeepColor * 0.5, uShallowColor * 0.55,
                                  clamp(-I.y, 0.0, 1.0));
              color = mix(sky, internal, fres);
            }
          }

          // ================= FOAM (both faces) =================
          // Foamy whitecaps: broad foam on wave crests + extra on breaking folds
          // + the shoreline band, carved into clumps by two octaves of advecting
          // noise so it reads as churning foam rather than a flat white sheet.
          float crest = smoothstep(uCrestFoamStart, uCrestFoamStart + 1.6, vHeight);
          float fold  = smoothstep(uFoamThreshold, uFoamThreshold - uFoamSoftness, vFold);
          float foam  = clamp(crest * 0.85 + fold * 0.7 + shoreFoam, 0.0, 1.0);

          // Multi-octave foam texture with a crisp edge (not a soft grey blob).
          vec2 fp = vWorldPos.xz;
          vec2 flow = uWindDir * uTime * 0.5;
          float ftex = fbm(fp * 0.5 + flow, 5) * 0.5
                     + fbm(fp * 1.7 - flow * 1.2, 4) * 0.32
                     + fbm(fp * 5.2 + flow * 0.5, 3) * 0.18;
          foam *= smoothstep(0.46, 0.60, ftex);            // crisp cutoff
          foam = max(foam, shoreFoam * smoothstep(0.30, 0.5, ftex));

          // Fine bubbly structure in the foam itself.
          float bubbles = 0.72 + 0.36 * fbm(fp * 9.0 - flow, 3);
          color = mix(color, uFoamColor * bubbles, clamp(foam, 0.0, 1.0) * 0.96);

          // ================= HORIZON / DISTANCE =================
          float dist = length(cameraPosition - vWorldPos);
          if (!underwater){
            vec3 horizonDir = normalize(vec3(-V.x, 0.02, -V.z));
            vec3 fogCol = atmosphere(horizonDir, sunDir);
            float fogAmt = 1.0 - exp(-dist * 0.00045);
            color = mix(color, fogCol, clamp(fogAmt, 0.0, 1.0));
          } else {
            float fogAmt = 1.0 - exp(-dist * 0.02);
            color = mix(color, uDeepColor * 0.6, clamp(fogAmt, 0.0, 1.0));
          }

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    // A large, dense grid that we keep centred (and grid-snapped) under the
    // camera so detail is always where the viewer is.
    this.size = 6000;
    this.segments = 600;
    const geo = new THREE.PlaneGeometry(this.size, this.size, this.segments, this.segments);
    geo.rotateX(-Math.PI / 2);

    this.mesh = new THREE.Mesh(geo, material);
    this.mesh.frustumCulled = false;

    this._cell = this.size / this.segments;
  }

  update(time, camera) {
    this.uniforms.uTime.value = time;
    // Grid-snap the follow position so vertices stay world-anchored (no crawl).
    const cell = this._cell;
    this.mesh.position.x = Math.round(camera.position.x / cell) * cell;
    this.mesh.position.z = Math.round(camera.position.z / cell) * cell;
  }

  setSun(sunDir) {
    this.uniforms.uSunDir.value.copy(sunDir);
  }

  setResolution(w, h) {
    this.uniforms.uResolution.value.set(w, h);
  }

  // CPU mirror of the vertical wave displacement so the app knows the exact
  // surface height at any point (camera immersion, buoyancy, splash line).
  heightAt(x, z, time) {
    const u = this.uniforms;
    // Exact port of the GLSL hash21(vec2) in common.js.
    const hash21 = (a, b) => {
      let px = fract(a * 123.34);
      let py = fract(b * 456.21);
      const d = px * (px + 45.32) + py * (py + 45.32);
      px += d;
      py += d;
      return fract(px * py);
    };

    const baseAngle = Math.atan2(u.uWindDir.value.y, u.uWindDir.value.x);
    let freq = u.uBaseFreq.value;
    let amp = u.uAmplitude.value;
    const count = u.uWaveCount.value | 0;
    let h = 0;
    for (let i = 0; i < count; i++) {
      const r0 = hash21(i, 1.7);
      const r1 = hash21(i, 9.1);
      const angle = baseAngle + (r0 * 2 - 1) * u.uDirSpread.value;
      const dx = Math.cos(angle);
      const dz = Math.sin(angle);
      const phase = Math.sqrt(9.81 * freq) * u.uSpeed.value;
      const arg = freq * (dx * x + dz * z) + time * phase + r1 * 6.2831853;
      h += amp * Math.sin(arg);
      freq *= u.uFreqMul.value;
      amp *= u.uAmpMul.value;
    }
    return u.uSurfaceY.value + h;
  }
}
