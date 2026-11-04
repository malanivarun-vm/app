# Full Throttle — Index, Layout Fixes & Voice Commands

A portfolio presented as a hybrid hypercar showroom in a dark garage. This round cleans up the on-screen text, gives every glowing dot a plain-language index, and teaches the car to answer to spoken commands.

## What this round delivers

The black label boxes around the car's hotspots overlap each other and crowd the layout. They go away entirely: the car keeps only plain glowing red dots. A new slide-in Index panel tells the reader what each dot covers, lists the six voice sayings, and the zoom/drag controls. The hero title becomes one line with a full-width subtitle so zooming into the car no longer hides the text. Voice commands arrive in the same pass: a mic button, the recognised words shown live on screen, and the six sayings wired to the car — everything still works by click everywhere.

## Who it's for

Hiring managers and recruiters meeting Varun through the car, who need one glance to understand what the dots mean. Secondarily, voice users on Chrome/Edge who can drive the tour hands-free; everyone else keeps full click and tap.

## Core features and experience

1. **Plain red dots.** Every hotspot becomes a small pulsing red dot — no text on or around the car. Hovering a dot (desktop) brightens it; the open chapter's dot lights up white. Four dots remain on the wheels (the four firms). The Index is the single source of truth for what each dot means.
2. **Index panel.** An "INDEX" button at the top of the screen opens the same slide-in panel the chapters use (right side on desktop, bottom sheet on mobile). Content: a row per chapter — 01 through 07, a red dot glyph, the name, and a one-line hint of what it covers (the tyres row names the four firms); below it a VOICE COMMANDS section quoting the six sayings and what each opens, with a note that the mic needs Chrome/Edge and everything works by click; plus the control hints (drag to rotate, scroll to zoom). Closes with X or Escape.
3. **Title and subtitle fix.** "FULL THROTTLE" sets on a single line at every screen width (the condensed display face scales down fluidly on phones). The subtitle — "Varun's journey through the lens of his passion" — runs as one full-width line beneath it instead of a narrow column. A soft dark scrim behind the title block keeps the text readable when the zoomed-in car passes behind it; because the label boxes are gone, dots passing behind text no longer hide anything.
4. **Voice commands.** A mic pill button sits with the other bottom controls, with a "Give it a try — say: start the engine" hint. Press to talk: the mic listens once, a live caption strip above the bottom controls shows the recognised words in real time, then the matching panel opens:
   - "Start the engine" — if the engine hasn't been started: full ignition sequence, then the Engine panel opens; if already running: opens the Engine panel
   - "Turn on the headlights" — Headlights panel (beams come on with it)
   - "Show me the cockpit" — Cockpit panel
   - "Let's see what drives you" — Fuel Tank panel
   - "What's the suspension like?" — Suspension panel
   - "Where are we going?" — Sat Nav panel
   Matching is forgiving (keyword-based, so phrasing can vary). If nothing matches, the caption says so and suggests a saying. If the browser has no speech recognition, the mic button hides itself and nothing else changes.
5. **Everything else unchanged.** The startup sound, idle toggle, panels, marquee, footer badge, fallback image and mobile reduction sets stay as they are. Headlight ideas and fuel copy remain clearly marked DRAFT until the final text arrives.

## User flow

Open → loading bar → "Start the engine" → title on one line, subtitle full width, car revealed under the spotlight with plain red dots → tap INDEX to learn what the dots cover and which sayings work → either tap a dot or press the mic and say "show me the cockpit" → the caption shows the recognised words and the panel slides in → close, explore the next chapter → end at the sat nav, badge and footer.

## UI/UX feel

The garage art direction is unchanged: near-black carbon, one hard spotlight, deep racing red for active states. The Index, mic button and caption strip speak the same language — mono technical labels, red accents, glassy dark surfaces, spring-panel motion. The caption strip behaves like an instrument readout, appearing only while listening or processing. Motion stays purposeful: masked title reveal (now one line), staggered panel entrances, slow marquee, pulsing dots.

## Implementation phases

**Phase 1 — built now.** Plain red dots replacing all label boxes; Index panel (chapter hints, voice sayings, controls); one-line title + full-width subtitle + legibility scrim; voice commands with press-to-talk mic, live recognised-words caption, forgiving matching, graceful hide on unsupported browsers; mobile and reduced-motion support; every action still clickable.

**Phase 2 — next.** Replace the DRAFT headlight ideas and fuel-tank copy with the final drafts being written now; revisit the title wording if wanted.

**Phase 3 — later.** Performance tuning for low-end devices, social-share preview polish, and a final sound-design pass.

## Assumptions

- Press-to-talk (tap mic, speak, it stops on its own) rather than always-listening — predictable and battery-friendly.
- Voice input uses the browser's built-in speech recognition; nothing is sent anywhere by this site, and the mic appears only where the browser supports it (Chrome/Edge).
- The Index button appears only after the engine has started, so the opening pop-up stays undisturbed.
- Dots have no tooltips at all on the car; the Index panel carries all naming.
- The four tyre dots stay four separate dots; the Index lists the firms beneath chapter 02.
- Headlight ideas and fuel copy are not touched this round — they keep their DRAFT markers.
- Page scrolling stays native; the page is one viewport tall plus a short footer, so no new scrolling dependency is added.
- All sounds remain synthesized in the browser; no audio files.
