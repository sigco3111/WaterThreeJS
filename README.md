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
- **Screen-space reflections**: the reflection ray is marched through the
  pre-water colour+depth buffer, so the island (and anything above water) is
  mirrored on the surface, falling back to the sky where the ray finds nothing.
- Three cascades of scrolling **detail normals** (coarse → capillary, the finest
  distance-faded to stop the horizon shimmering) layered over the Gerstner base.
- Physically-based shading: Schlick **Fresnel**, sky **reflection**, depth-based
  **refraction** with Beer–Lambert absorption (bright turquoise shallows fading to
  dark saturated deep), **subsurface scattering** on back-lit crests, sharp
  **sun glints**, and **layered foam** — a dense cap on breaking crests that
  dissolves softly into feathered, flow-aligned trails, so it never looks like a
  hard white stamp.
- A shared analytic **atmosphere** with **drifting procedural clouds** powers both
  the sky dome and the water reflections, so the horizon, clouds and sun always
  match exactly. Full time-of-day control from golden hour to noon.
- **Volumetric clouds** (toggle-able): a true raymarch through a camera-following
  high-altitude slab — 3D fBm density with height-falling coverage for organic
  rolling tops, a light-march for self-shadowing, a Henyey–Greenstein backlit
  silver lining and detail-erosion wisps — rendered at half-res, blurred, and
  composited into the HDR buffer before tone-map. Live controls for coverage,
  density, cloud size, roundness, wispiness, altitude, thickness, wind and light.

**Shore & island**
- A sand **island** heightfield rises from the seabed, through the waterline, up
  to dry dunes — dry → wet → submerged sand blended across the beach.
- The **shoreline** reads from the water-column depth: shallows go clear and
  turquoise (caustic-lit sand shows through), and an animated **foam band** piles
  up where the waves wash the beach.

**Floating objects**
- Drop **spheres / cubes** onto the sea (GUI buttons or **double-click** the
  water; Shift-double-click = cube). Each is a lightweight **buoyancy** body: it
  bobs on the wave surface, tilts to the local wave normal, drifts gently down
  the slope, and its submerged half shows through the water (refracted + tinted).
  The solver is **sub-stepped** and damped against the water's own velocity, so
  bodies ride a rising wave instead of being flung off it.
- **Grab and drag** any object with the mouse to reposition it, and release to
  fling it (dragging on open water still orbits the camera).
- **Terrain collision** — where the water is too shallow to float them (the
  island shelf / beach) they come to rest on the sand instead of sinking through,
  using a CPU mirror of the island heightfield.

**Underwater**
- Beer–Lambert **absorption / fog** — red light dies first, blue survives, giving
  the water real depth.
- Raymarched **volumetric god-rays** reconstructed from the depth buffer and
  modulated by a caustic pattern projected along the sun direction.
- Animated **caustics** on a rolling, rippled sandy **seabed**.
- **Snell's window**: from below, the surface reads as a bright, clear rippling
  ceiling — the whole sky refracted through the window with silvery caustic
  shimmer, the water glowing sunlit turquoise toward the surface (never black)
  and darkening with depth.
- Drifting **marine-snow** particles for a sense of scale.

**Pipeline**
- HDR (half-float) rendering with a separate refraction pass and depth textures.
- Post: threshold **bloom**, the underwater volumetrics pass, **ACES** filmic
  tone-mapping and sRGB output.
- Camera glides seamlessly between above- and below-water; the exact wave height
  at the camera is evaluated on the CPU to detect immersion.
- Six one-click **cinematic presets** — *Tropical Noon, Golden Hour, Crimson
  Sunset, Blue Hour, Clear Dawn, Stormy Seas* — each retunes the sun, water
  colour, waves, foam and post together for a complete look.
- Live, restyled **GUI** (glass panel, cyan accents) for the preset selector,
  waves, sun, surface, colour, foam, floating objects, underwater and post.

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
  Island.js           Sand island heightfield: beach, wet/dry sand, caustics (+ CPU height)
  FloatingBodies.js   Buoyant dropped primitives: bob, tilt, terrain collision
  Particles.js        Marine-snow point field
  Clouds.js           Volumetric sky clouds — box-confined raymarch, low-res
  Post.js             Underwater volumetrics + cloud composite + bloom + ACES
  shaders/common.js   Shared GLSL: noise, atmosphere, Gerstner, caustics, tint
```

Everything outputs **linear HDR**; tone-mapping happens once in the final
composite so reflections, refraction and bloom all stay energy-consistent.

## Requirements

A WebGL2-capable browser (Chrome, Edge, Firefox, Safari). The scene targets
desktop GPUs; on lighter hardware, reduce the wave grid `segments` in
`src/Ocean.js` and the god-ray step count in `src/Post.js`.
