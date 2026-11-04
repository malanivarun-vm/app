# Full Throttle — Varun Malani's Hybrid Hypercar Showroom Portfolio

A single-page portfolio that presents Varun Malani, a Bangalore product manager, as a hybrid hypercar on a spotlighted showroom platform. Visitors press "Start the engine", the car lights up under a garage spotlight, and every part of the car — engine, tyres, fuel tank, suspension, cockpit, headlights, sat nav — opens a sleek side panel telling one chapter of his career.

## Who it's for

Hiring managers, senior PM recruiters, and collaborators who should feel they are meeting a person, not reading a resume. Secondarily, the Wispr team, who should read the headlights and sat-nav panels as a working product mind showing up with ideas, not a cover letter.

## Core features and experience

1. **Cinematic entry sequence.** The page opens on a dark garage with a loading bar while the 3D model loads. A small pop-up says "Start the engine" — pressing it fires a short synthesized V12-style startup sound and rev, the spotlight snaps on, and the car is revealed on a slowly turning platform while the title reveals line by line.
2. **Title.** "Full Throttle" as the display title with "Varun's journey through the lens of his passion" kept as the supporting line underneath, so the agreed framing survives inside the stronger headline.
3. **Interactive 3D hero.** The provided GLB model, centred on a turntable. Drag to rotate, scroll/pinch to zoom. If the model file is large, it is Draco-compressed as part of the build. If the model fails to load, a side-view image of a dark hypercar appears with the same hotspots as labelled buttons, so the page never breaks.
4. **Seven hotspot chapters**, each pinned to the car and opening a side panel. Hotspots track their part as the car rotates; if attachment proves unreliable, they degrade to labelled buttons arranged around the car (the guaranteed-working fallback):
   - **The Engine** — the two motors: motor one is operations (margin turned from -6% to +3%, ₹50 Cr payouts at 99% accuracy, 5% margin growth); motor two is product (85% feature adoption, 30% faster go-lives, 8+ years in payroll/SaaS, now powering SMBs with AI).
   - **The Tyres** — the ops-to-product journey where he meets the road: the four firms — Saint-Gobain, Mazda Motor Europe, Gurpreet Enterprises, Smartstaff — one tyre each.
   - **Fuel Tank** — what drives him, drafted from his profile: autonomy, building teams that run themselves, learning fast in real problems, and a lifelong love of cars and F1.
   - **Suspension** — adaptability, three pivot moments: engineer to techno-commercial at Saint-Gobain, the move to Germany and the winding path from ops to product at Smartstaff, and the current independent AI-building chapter.
   - **Cockpit** — the driver's view where each project is a control: infotainment screen (Events OS), dashboard dials (Vitae), glove box (Remi), overhead light (Andiamo), plus switches for the Blinkit DSM Hub, YouTube 2.0, Lumi, Judgement and Don't Blink case studies.
   - **Headlights** — growth ideas for Wispr Flow in India. The switch has low beam (short-term ideas) and high beam (long-term ideas); each flip reveals the next idea down the beam. Shipped as clearly-labelled drafts to be replaced with Varun's real ideas.
   - **Sat Nav** — where he's headed next and why Wispr: the route to voice-first products that fit existing behaviour, drawn from his own Events OS and Remi theses.
5. **Sound and controls.** An engine idle sound, off by default, with a visible toggle. Everything works by click and tap; no interaction requires a microphone in this phase.
6. **Footer.** A "Built by voice with Wispr Flow" badge, LinkedIn (linkedin.com/in/malanivarun), email (malanivarun@gmail.com), and Bangalore, India. An original SVG badge — a VM monogram inside a tachometer arc — serves as logo and favicon.
7. **Mobile.** Fully responsive with reduced effects: slower/simpler turntable, lighter particles, panels as full-width sheets, same content.

## User flow

Open page → loading bar fills while the model loads → "Start the engine" pop-up → press it → startup sound + spotlight reveal + title animation → the car turns slowly under the spotlight → visitor drags to rotate, pinches/scrolls to zoom → glowing hotspots or labelled buttons invite a click → side panel slides in with that chapter → close, explore the next part → finish at the sat nav, badge and footer → contact via LinkedIn or email.

## UI/UX feel

- **Art direction:** a private hypercar garage at night — near-black carbon surfaces, one hard spotlight cone with volumetric haze, deep racing-red accents used sparingly for glow, needles and active states. Film grain overlay. No Ferrari marks, names or logos anywhere in text; the car stands on its own shape.
- **Type:** condensed display type for the big headlines (racing livery energy), a technical monospace for spec labels and hotspots, a clean humanist body face. Numbers always set as instrument readouts.
- **Motion:** masked line-by-line title reveal on start; staggered panel content entrances; needle and gauge animations in the cockpit; one slow editorial marquee strip of career metrics (85% adoption · ₹50 Cr payouts · -6% → +3% margin · 30% faster go-lives); lenis smooth momentum scrolling; framer-motion scroll-reveals and micro-interactions throughout; the 3D hero itself is the parallax/3D moment. Reduced effect set on phones and for prefers-reduced-motion.

## Implementation phases

**Phase 1 — MVP (built now).** The full single page: loading bar, start-engine sequence with sound, 3D hero with drag/zoom and turntable, all seven hotspot chapters with panels and real profile content, draft Wispr headlight ideas labelled as drafts, cockpit project mapping, model-failure fallback image with hotspots, idle-sound toggle, marquee metrics strip, badge, footer, mobile-responsive with reduced effects, favicon/logo.

**Phase 2 — Voice commands.** Web Speech API mic button with a "give it a try" hint, recognised words shown on screen, and the six sayings wired to actions ("Start the engine", "Turn on the headlights", "Show me the cockpit", "Let's see what drives you", "What's the suspension like?", "Where are we going?"). Full click fallback everywhere; graceful hide on unsupported browsers.

**Phase 3 — Content and polish pass.** Replace draft Wispr ideas and fuel copy with Varun's final words, revisit the title if wanted, tune sound design and performance, add social share preview for LinkedIn.

## Assumptions

- Title reads "Full Throttle" with "Varun's journey through the lens of his passion" as the subtitle, per the answer given.
- Headlight content ships as 3 labelled draft short-term and 3 draft long-term ideas for Wispr Flow in India, clearly marked for replacement; sat-nav "why Wispr" copy is drafted from his projects' voice-first and fit-existing-behaviour themes.
- Fuel tank copy is drafted from the profile (autonomy, teams, learning fast, cars/F1) until he refines it.
- The "four firms" for the tyres are Saint-Gobain, Mazda Motor Europe, Gurpreet Enterprises and Smartstaff; the cockpit mapping of projects to controls is a proposal he can reshuffle later.
- Every number on the page comes exactly from his supplied profile and project files — nothing invented, no rounding.
- Engine sounds are synthesized in the browser (Web Audio), so no copyrighted recordings and no audio downloads.
- The car model is used as geometry only; no Ferrari wordmarks, badges or textures with brand logos are displayed.
- Voice commands are deliberately deferred to Phase 2, as chosen; in Phase 1 everything is clickable.
- No backend features are needed: content is compiled into the page, and contact happens via LinkedIn/email links.
