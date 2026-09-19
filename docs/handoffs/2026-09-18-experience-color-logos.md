# Handoff: 002 · EXPERIENCE, color logos as their own object

Written September 18, 2026, at the end of the pinned-stage session. Main is at 77a0582 (merge of experience-pinned-stage). Read this, then NOTES.md, before touching code.

## Where the section stands (shipped, live on Vercel)

components/ui/experience-section.tsx is a pinned stage:

- The section is 300vh tall. A 100vh `.exp-stage` sticks to the viewport top. Scroll progress through the section steps the active role (Math.round(progress * 2), commits only past 0.5 + 0.08 hysteresis). One role is visible at a time; the others are mounted, inert, and animated out (y -40 past, y +40 next).
- Left: an opaque text card (`.exp-card`, SURFACE #0d0d0d, 14px radius, 1px white 0.08 frame, the WHO card shadow). Sebastian asked for a box behind the copy; it is solid on purpose, translucent scrims have failed on this project three times. A three-tick rail sits inside the card at left 24 and scrolls to a role on click.
- Right: a logo plate (`.exp-panel`, same surface, 3:4, width min(100%, 70vh * 0.75)) with the logo centered at a per-role width (BTS 54%, Radiator 66% with a grayscale filter, Ghost FC 50%), crossfading 0.4s per step.
- A 1px hairline tether (`.exp-tether`) runs from the card's right edge at the active company name's center to the plate's left edge, measured from real element rects in a useLayoutEffect (`measureTether`, depends on `plateRef` and `nameRefs`), redrawn scaleX 0 to 1 on each step, 4px dot at the plate end.
- Physics: `useGravityAnchor(plateRef)` makes the plate the particle network's gravity target; `useClearZone(cardRef, 40)` keeps particles out from under the card. Both live in lib/use-particle-anchor.ts; the canvas side is three static-phase edits in components/ui/particle-canvas.tsx (search `cz.`).
- Mobile (< 768): stage still pinned, flex column, plate first as a 16/7 strip max 180 tall, rail, tether and arrow hidden.
- useOrbReveal takes the stage ref, not the section ref, so the 002 label stays while pinned.

## The next ask, in Sebastian's words

"The logos to have color, and then be off from their box and be their own kind of thing so they also need to be bigger."

So three changes: brand color on the marks, no plate behind them, and a larger mark that reads as its own object on the right.

## Three things to settle before building (consult, do not assume)

1. **The hue-free rule.** NOTES says the home page and components/ui stay hue-free; the periwinkle accent lives on detail pages only. Brand color on the logo marks is a conscious exception. Propose scoping it: brand colors appear only inside logo marks, never in chrome, and the rule in NOTES gets that sentence added. Get Sebastian to say yes to that wording.
2. **The anchor.** The plate is currently the opaque object the network gathers onto. Removing it means the mark itself must become the anchor: pass a `logoRef` (the visible mark's wrapper) to `useGravityAnchor`, and consider a second `useClearZone` on the mark's bounding box so lines do not cross it. The network gathering around a large floating mark is the on-brand version of this; the physics tooling already exists, it only needs the ref swap. The tether's right endpoint also moves from `plateRef` to the mark's rect.
3. **Assets. This is where the real work is.** Inventory as of Sep 18:
   - `public/bts-logo.svg`: brand colors, magenta dots `#ca1c68` and a charcoal wordmark `#23272a`. The wordmark is invisible on black. Make `bts-logo-color.svg` by swapping `.cls-2` to `#ffffff` and keeping `.cls-1`. That is the whole BTS job.
   - `public/radiator-logo.png`: the real red badge (about 83% of its opaque pixels are saturated), but only 250x72. At the sizes this ask implies (a mark 350 to 450px wide) it will be soft. Options: find a larger source on 1800radiator.com (the Sep 15 note records the badge came from `/Content/lang/en/images/ecomboxlogo.png`; look for a bigger header or print asset), vectorize it, or ask Sebastian for the file. Do not upscale the 250px badge and ship it.
   - `public/ghost-fc-logo.png`: 1095x1095 but pure white knockout, zero color. The club's real crest colors are not in the repo. Ask Sebastian for the colored crest. Until it lands, the crest stays white, which is fine as the "title card" role.
   - Radiator currently carries an inline `grayscale(1) brightness(1.35) contrast(1.1)` filter in ROLES; delete it when color ships.

## Directions to put in front of Sebastian (render before asking, as with the earlier passes)

- **A. Floating mark.** No plate. The mark sits alone on the right at roughly 380 to 440px wide, vertically centered on the card, crossfade plus scale per step, tether ends at the mark's left edge. Mark is the gravity anchor. Cheapest and closest to the words used.
- **B. Mark in a well.** Same as A, but a hue-free radial darkening (rgba(0,0,0,0.55) to transparent, about 1.4x the mark) sits behind it so the network dims toward the mark. No edges, so it is not a box. Helps the Radiator badge, which has its own rectangle.
- **C. Mark breaking the card.** The mark overlaps the card's right edge by about a third, so it is literally tethered to the box. Strongest composition, needs the card to lose its right padding and the tether to be rethought (it would be redundant).

Lean toward A with the anchor swap, and offer B as the fallback if the Radiator badge fights the network.

## Code map for the change

- `ROLES[i].logo`: `{ src, alt, width, style? }`. `width` is the share of the plate today; it becomes the mark's own width (px or vw) once the plate goes.
- Plate JSX: the `.exp-panel-cell` > `.exp-panel` block near the bottom of the component. Replace with a mark wrapper that keeps `position: relative` and a stable size so `measureTether` has a rect to read (`aspect-ratio` on the wrapper, or explicit width and height).
- `measureTether`: reads `plateRef.current.getBoundingClientRect().left`. Point it at the mark wrapper.
- `useGravityAnchor(plateRef)` and the mobile CSS block (`.exp-panel-cell { order: -1 }`, `.exp-panel` strip sizing) reference the plate; rename or retarget both.
- Preloads: `for (const r of ROLES) preload(r.logo.src, ...)` picks up new paths automatically.
- NOTES.md sections to update afterward: Current Status, the experience-section.tsx entry under File Structure, the Rules bullet about hue-free, Git Restore Points, and `public/` inventory.

## How to work this repo (from memory and NOTES)

- One worktree per session: `git worktree add -b <topic> ../seba-portfolio-<topic> main`, then `npm install` inside it. Merge from the main folder with `git merge --no-ff`, push with `git -c credential.helper='!gh auth git-credential' push origin main`. Every push to main deploys to https://seba-portfolio-e1oz.vercel.app in about a minute; poll with curl for a class name you added.
- Dev servers: the main folder holds 3030 (started through the desktop app's preview). Start the worktree's own with `npx next dev -p 3032` in the background and drive it with Playwright; the in-app Browser pane returns black frames while hidden.
- Turbopack can serve a stale globals.css after edits. If a CSS change does not show, curl the linked CSS chunk; if stale, stop the server, `rm -rf .next/dev .next/cache`, restart.
- Guards before every commit: `grep -rn monospace app components lib` returns only lib/fonts.ts; `grep -rn "lib/accent" components/ui app/page.tsx` returns nothing; `grep -rn PLACEHOLDER app components` returns nothing; no em dashes anywhere; `npx tsc --noEmit`; `npm run build`.
- Verification recipe that worked: Playwright, 1440x900, goto, wait 7s for the intro, `scrollTo(sectionTop + i * 900)` for i in 0..2, a 30px wheel nudge so whileInView fires, screenshot each; then 375x812 for mobile. Check `[role=link]` opacity to confirm which role is active and read the `.exp-tether` rect.

## Known, unrelated, still open

- The root particle canvas throws `getImageData: The source width is 0` when the tab first opens at a very small pane size. Guard W and H in sampleText.
- who-section.tsx and work-section.tsx still carry their own gravity rAF loops; they could move to useGravityAnchor.
- `.playwright-mcp/` is untracked in the main folder; gitignore it if it annoys.
