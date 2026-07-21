import * as THREE from 'three';
import { NOISE, CAUSTICS, OCEAN_HEIGHT } from './shaders/common.js';

// A static sand island: a heightfield that rises from the seabed, through the
// waterline (making a beach), up to dry dunes. Shares the seabed's caustics for
// its submerged part and blends dry→wet→underwater sand across the shoreline.
// `waveUniforms` are the ocean's wave-shape uniform objects (passed by
// reference) so the beach knows where the real wavy water surface is.
export class Island {
  constructor(sunDir, seabedDepth = 22, waveUniforms) {
    this.uniforms = {
      uTime: { value: 0 },
      uSunDir: { value: sunDir.clone() },
      uCenter: { value: new THREE.Vector2(0, -110) },
      uRinner: { value: 70.0 },   // radius of the flat top
      uRouter: { value: 175.0 },  // radius where it meets the seabed
      uSeabedY: { value: -seabedDepth },
      uPeakY: { value: 7.0 },
      uSandDry: { value: new THREE.Color(0.64, 0.55, 0.39) },
      uSandWet: { value: new THREE.Color(0.24, 0.19, 0.13) },
      uCausticColor: { value: new THREE.Color(1.0, 0.98, 0.85) },
      // Shared, by reference — auto-synced with the ocean's wave settings.
      uWindDir: waveUniforms.uWindDir,
      uWaveCount: waveUniforms.uWaveCount,
      uBaseFreq: waveUniforms.uBaseFreq,
      uAmplitude: waveUniforms.uAmplitude,
      uDirSpread: waveUniforms.uDirSpread,
      uFreqMul: waveUniforms.uFreqMul,
      uAmpMul: waveUniforms.uAmpMul,
      uSpeed: waveUniforms.uSpeed,
      uSurfaceY: waveUniforms.uSurfaceY,
    };

    const common = /* glsl */ `
      ${NOISE}
      uniform vec2  uCenter;
      uniform float uRinner;
      uniform float uRouter;
      uniform float uSeabedY;
      uniform float uPeakY;

      // World-space terrain height at xz.
      float islandHeight(vec2 p){
        float d = distance(p, uCenter);
        float land = smoothstep(uRouter, uRinner, d);      // 1 inside → 0 outside
        float base = mix(uSeabedY, uPeakY, land);
        // Dunes + finer sand relief; stronger on the exposed land.
        float n = fbm(p * 0.02, 5) * 4.0 + fbm(p * 0.11, 4) * 1.1;
        base += n * (0.35 + 0.65 * land);
        return base;
      }
    `;

    const material = new THREE.ShaderMaterial({
      toneMapped: false,
      uniforms: this.uniforms,
      vertexShader: /* glsl */ `
        precision highp float;
        ${common}
        varying vec3 vWorldPos;
        varying vec3 vNormal;
        void main(){
          vec3 wp = (modelMatrix * vec4(position, 1.0)).xyz;
          float h = islandHeight(wp.xz);
          wp.y = h;
          // Normal via central differences of the height field.
          float e = 0.75;
          float hx = islandHeight(wp.xz + vec2(e, 0.0));
          float hz = islandHeight(wp.xz + vec2(0.0, e));
          vNormal = normalize(vec3(h - hx, e, h - hz));
          vWorldPos = wp;
          gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform float uTime;
        uniform vec3  uSunDir;
        uniform vec3  uSandDry;
        uniform vec3  uSandWet;
        uniform vec3  uCausticColor;
        ${NOISE}
        ${OCEAN_HEIGHT}
        ${CAUSTICS}
        varying vec3 vWorldPos;
        varying vec3 vNormal;

        void main(){
          vec3 sunDir = normalize(uSunDir);
          vec3 N = normalize(vNormal);
          vec2 xz = vWorldPos.xz;
          float y = vWorldPos.y;

          // Depth of water actually standing above this sand, from the real
          // (wavy) ocean surface — positive where submerged. Used ONLY for the
          // caustics (moving light), never for the sand colour.
          float submerged = oceanHeight(xz) - y;

          // Wet/dry sand is a STABLE band tied to the mean waterline — it marks
          // where the sea reaches over time, so it must not flicker wave-to-wave.
          float wetness = smoothstep(1.6, -0.2, y);
          vec3 sand = mix(uSandDry, uSandWet, wetness);
          float swash = smoothstep(1.1, 0.0, abs(y - 0.25));   // damp strip at waterline
          sand = mix(sand, uSandWet * 0.85, swash * 0.55);
          sand *= 0.82 + 0.32 * fbm(xz * 0.5, 3);   // grain

          float ndl = clamp(dot(N, sunDir), 0.0, 1.0);
          vec3 sky = vec3(0.35, 0.5, 0.7);
          vec3 color = sand * (0.35 * sky + 1.05 * ndl);

          // Caustics ONLY where water actually stands above the sand — they
          // fade in just under the waterline and attenuate with water depth.
          if (submerged > 0.0){
            vec2 flow = sunDir.xz * uTime * 0.4;
            float c1 = caustics(xz * 0.05 + flow, uTime * 0.6);
            float c2 = caustics(xz * 0.085 - flow * 0.7 + 15.0, uTime * 0.8);
            float caus = min(c1, c2) + 0.35 * c1 * c2;
            float edge = smoothstep(0.0, 0.5, submerged);      // no caustics on the film's edge
            color += uCausticColor * caus * exp(-submerged * 0.06) * (0.4 + 0.8 * ndl) * edge;
          } else {
            // Slight wet sheen on the exposed sand just above the waterline.
            float sheen = smoothstep(1.4, 0.0, y) * (1.0 - wetness * 0.4);
            vec3 H = normalize(sunDir + normalize(cameraPosition - vWorldPos));
            color += vec3(0.9) * pow(max(dot(N, H), 0.0), 40.0) * sheen * 0.3;
          }

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    // Large enough to cover the whole island footprint with beach margin.
    const geo = new THREE.PlaneGeometry(520, 520, 320, 320);
    geo.rotateX(-Math.PI / 2);
    this.mesh = new THREE.Mesh(geo, material);
    this.mesh.position.set(0, 0, -110);
    this.mesh.frustumCulled = false;
  }

  update(time) {
    this.uniforms.uTime.value = time;
  }

  setSun(sunDir) {
    this.uniforms.uSunDir.value.copy(sunDir);
  }
}
