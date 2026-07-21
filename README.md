# WaterThreeJS

A production-quality, real-time **ocean** rendered with [Three.js](https://threejs.org/) —
above *and* below the surface. Everything is procedural (no textures, no asset
downloads): the waves, the sky, the caustics and the volumetric light are all
generated in shaders.

## Features

**Surface**
- Spectral **Gerstner wave** field — dozens of waves spanning long swells down to
  fine chop, generated procedurally with deep-water dispersion so long waves
  travel faster than short ones.
- Physically-based shading: Schlick **Fresnel**, sky **reflection**, depth-based
  **refraction** with Beer–Lambert absorption, **subsurface scattering** that lights
  up the backs of crests, sharp **sun glints**, and churning **whitecap foam** —
  broad on wave crests, extra on breaking folds, textured by advecting noise.
- A shared analytic **atmosphere** with **drifting procedural clouds** powers both
  the sky dome and the water reflections, so the horizon, clouds and sun always
  match exactly — the sea reflects the same cloudscape overhead. Full time-of-day
  control from golden hour to noon.

**Shore & island**
- A sand **island** heightfield rises from the seabed, through the waterline, up
  to dry dunes — dry → wet → submerged sand blended across the beach.
- The **shoreline** reads from the water-column depth: shallows go clear and
  turquoise (caustic-lit sand shows through), and an animated **foam band** piles
  up where the waves wash the beach.

**Underwater**
- Beer–Lambert **absorption / fog** — red light dies first, blue survives, giving
  the water real depth.
- Raymarched **volumetric god-rays** reconstructed from the depth buffer and
  modulated by a caustic pattern projected along the sun direction.
- Animated **caustics** on a rolling, rippled sandy **seabed**.
- **Snell's window**: from below, the surface shows the compressed bright disc of
  refracted sky ringed by total internal reflection.
- Drifting **marine-snow** particles for a sense of scale.

**Pipeline**
- HDR (half-float) rendering with a separate refraction pass and depth textures.
- Post: threshold **bloom**, the underwater volumetrics pass, **ACES** filmic
  tone-mapping and sRGB output.
- Camera glides seamlessly between above- and below-water; the exact wave height
  at the camera is evaluated on the CPU to detect immersion.
- Live **GUI** (lil-gui) for waves, sun, surface, underwater and post settings.

## Run

```bash
npm install
npm run dev      # opens http://localhost:5173
```

Build for production:

```bash
npm run build
npm run preview
```

## Controls

- **Drag** — orbit the camera
- **Scroll** — zoom
- **Right-drag / two-finger drag** — pan (use it to descend below the surface)
- **GUI › ▼ dive / ▲ surface** — animate across the waterline
- **GUI** (top-right) — tweak waves, time of day, foam, god-rays, exposure…

## Architecture

```
index.html            Boot screen, HUD, canvas
src/
  main.js             Renderer, camera, controls, render passes, immersion logic
  Sky.js              Camera-locked atmosphere dome
  Ocean.js            Gerstner surface mesh + full water shader (+ CPU height fn)
  Floor.js            Sandy seabed with dunes + animated caustics
  Island.js           Sand island heightfield: beach, wet/dry sand, caustics
  Particles.js        Marine-snow point field
  Post.js             Underwater volumetrics + bloom + ACES composite
  shaders/common.js   Shared GLSL: noise, atmosphere, Gerstner, caustics, tint
```

Everything outputs **linear HDR**; tone-mapping happens once in the final
composite so reflections, refraction and bloom all stay energy-consistent.

## Requirements

A WebGL2-capable browser (Chrome, Edge, Firefox, Safari). The scene targets
desktop GPUs; on lighter hardware, reduce the wave grid `segments` in
`src/Ocean.js` and the god-ray step count in `src/Post.js`.
