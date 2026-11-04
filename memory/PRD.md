# PRD — Full Throttle: Varun Malani's Hybrid Hypercar Showroom Portfolio

## Original problem statement
Build a single-page portfolio for Varun Malani, a product manager in Bangalore, styled as a hybrid hypercar showroom. Dark garage, spotlight on the car, deep red accents, smooth animations. Load the attached GLB 3D car model with 3.js as the hero, centred on a slowly turning platform (drag to rotate, scroll to zoom). "Start the engine" pop-up reveals the car. Title: "Varun's journey through the lens of his passion" (kept as subtitle under the agreed "Full Throttle" display title). Loading bar while the model loads; Draco-compress if large. No Ferrari logos or brand names in page text. Seven clickable hotspots pinned to the car (engine, tyres, fuel, suspension, cockpit, headlights, sat nav) each opening a sleek side panel. Engine idle sound toggle (off by default). Fallback side-view image with hotspots if the model fails. Footer with "Built by voice with Wispr Flow" badge, LinkedIn and email. Fully responsive with reduced effects on phones. Voice commands via Web Speech API (discussed, then deliberately deferred to Phase 2 in the approved plan).

## Architecture
- React (CRA + craco) frontend at /app/frontend; no backend needed — all content compiled into the page.
- 3D: three.js via @react-three/fiber + @react-three/drei (Canvas, OrbitControls, Html hotspots, ContactShadows, MeshReflectorMaterial, custom Lightformer environment).
- Model: public/models/car.glb — original 26MB GLB optimized with gltf-transform (Draco mesh compression + WebP textures) to 1.67MB. Car faces −Z; front/rear mapped from wheel-node world positions. Logo meshes hidden (geometry only, no brand marks shown).
- Sound: 100% synthesized in-browser (Web Audio) — V12-style startup + rev, optional idle loop. No audio files, no copyrighted recordings.
- Fonts self-hosted in public/fonts (Saira Condensed display, Chakra Petch technical labels, Manrope body) for deterministic first paint.
- `?still=1` URL param: light-render mode (no floor reflections, dpr 1, no turntable) for weak devices/test automation.

## User personas
1. Hiring managers / senior PM recruiters — meet a person, not a resume; each car part is a chapter.
2. Wispr team — read the headlights (growth ideas for Wispr Flow in India) and sat nav (why Wispr) as working product thinking.

## Core requirements (static)
- Loading bar → "Start the engine" popup → ignition sound → spotlight reveal → title reveal → turntable with drag/zoom.
- 7 chapters: Engine (two motors), Tyres (four firms), Fuel (motivation), Suspension (three pivots), Cockpit (projects as gauges/switches), Headlights (low/high beam Wispr Flow India ideas — DRAFT labelled), Sat Nav (route + why Wispr).
- Hotspots pinned in 3D space (track rotation, occlusion-tested against a collider box); tyre hotspots open the Tyres panel focused on that firm.
- Metrics marquee; VM tachometer badge (logo + favicon); footer with LinkedIn/email/location/Wispr Flow badge.
- All numbers exactly from the supplied profile/projects files.

## Implemented (2026-11-04)
- Model optimization (26MB → 1.67MB Draco+WebP), scene with platform, spotlight cone, rim lights, red platform ring, dust particles, reflective floor (desktop).
- Full entry sequence with synthesized startup/rev sound; idle sound toggle (verified toggling on).
- 10 hotspots / 7 chapter panels with staggered entrances; cockpit gauges + switch list; headlight low/high beam staggered reveal; sat nav route.
- FallbackStage: generated side-view hypercar image with labelled hotspot buttons (activates on model error or 30s timeout).
- Metrics marquee, footer, badge/favicon, self-hosted fonts, grain overlay, reduced-motion + mobile reduction sets, data-testids throughout.

## Implemented (2026-11-04, round 2)
- Plain pulsing red dots on the car — all label boxes removed; Index panel is the naming source of truth.
- INDEX button (appears after ignition) opening the shared slide-in panel: 7 chapter rows (tap to open) with hints, VOICE COMMANDS section quoting the six sayings, Chrome/Edge + click-fallback note, drag/scroll/tap control hints.
- One-line "FULL THROTTLE" title at all widths + full-width subtitle + legibility scrim behind the title block.
- Voice commands: press-to-talk mic pill, live recognised-words caption strip above the controls, forgiving keyword matching for the six sayings, "Start the engine" runs the full ignition then opens Engine; no-match and mic-error messages; mic hides itself on unsupported browsers; everything stays clickable.
- Mobile title sizing verified at 390px (no clipping); desktop verified at 1440px.

## Verified
- Desktop 1440x900 and mobile 390x844 flows: start → reveal → engine panel → headlight beam switch → tyres panel (firm highlight) → Index panel navigation (Cockpit via Index row) → footer marquee/badge/links; idle toggle class flip; caption strip appears while listening. Webpack compiles clean.
- Voice recognition itself needs a real Chrome/Edge with mic permission (headless test environment can only verify the UI wiring, caption states and fallbacks).
- Sound could not be verified audibly in this environment (no audio output); synthesis code follows standard Web Audio patterns.

## Backlog
- P0: none — core is complete.
- P1: Replace DRAFT headlight ideas and refine fuel-tank copy with Varun's final words; revisit title if wanted.
- P2: Social share polish, performance tuning on low-end devices, OG image refinements, final sound-design pass.
