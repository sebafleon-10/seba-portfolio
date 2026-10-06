# Handoff: 003 · PROJECTS, the fan on a curved network horizon

Written September 24, 2026, at the end of the section shapes / projects cradle session. Read this, then the top of NOTES.md (Current Status, the two "projects cradle" entries), before touching code.

## Where things stand

| What | Where | State |
|---|---|---|
| Live site | main at e4466d7 (the Sep 19 globe merge) | Pushed, deployed. None of this session's work is on it |
| Current work | branch `projects-cradle`, worktree `~/Developer/seba-portfolio-projects-cradle`, head 348360b | Committed, NOT merged, NOT pushed |
| Superseded attempt | branch `section-shapes`, worktree `~/Developer/seba-portfolio-section-shapes`, head 18cc77a | Kept for reference only (rim above the fan, horizon under the Contact cards). Sebastian asked to revert it; `projects-cradle` is built on top of it with its Contact half removed |
| Dev server | `npm run dev -- -p 3000` started from the `projects-cradle` worktree (background shell) | Sebastian views it in Chrome at http://localhost:3000 |

Nothing has been reviewed by Sebastian after the last commit (348360b). Start the next session by asking how the Projects section feels in his Chrome tab.

## What the branch does (in Sebastian's words, then the build)

The arc of requests this session:

1. "Copy the idea of the first section, how the network went into a little orb connecting the two pieces, and apply that customized mindset to the other sections." A sketch widget offered three directions each for Projects and Contact; he picked "hold a shape", rim for Projects, horizon for Contact. That became `section-shapes`.
2. After seeing it: "revert back to original, I want to rework this a different way."
3. The rework: "the first two sections are good. Projects could have the same horizon idea but on the bottom, glowing, lifting the cards up, the cards shaped to it, and resize the cards. Remove the top-right nav text when we scroll, re-intro it when we scroll up, and make it smaller." That is `projects-cradle` e00b0a5.
4. Then: "not really sitting correctly. Put the cards up further, have the network actually show it and span across, and make it intuitive that you can click and see the next project, right now I can't click without the side arrows." That is 348360b.

What is on the branch now:

- **Projects fan is a wheel.** Each card is a spoke: an outer `motion.div` turns `FAN_TILT` (14) degrees per place about a pivot `HUB` (1000) px below the card center, so all bottom edges stand on one circle. The card inside scales and leans (rotateX) about its own bottom edge so it never lifts off. Cards are 612x370 (were 748x452). The section has `paddingBottom: 22vh` so the fan sits high; the side arrows moved to `calc(50% - 11vh)`.
- **Network horizon under the fan (desktop).** The canvas shape `'rim'` is an arc about a pivot. `measureRim` in work-section.tsx fits the circle through the active card's bottom and the neighbours' outer bottom corners (flat cards on a circle only touch it at their midpoints), 16px lower, running out to 50px from the screen sides. Tapered ends, a slow travelling swell, a soft standing glow straight under the active card. A card switch turns it slightly (`RIM_LEAN` 0.25 of the tilt) and sweeps a lit front the way the cards moved. While the fan is still low on screen the horizon waits at the bottom edge and the cards scroll up onto it.
- **Entrance.** The Projects globe forms just under the active card and unfolds straight into the horizon, no blast (`useOrbReveal` options `{ center, handoff }`). Who, Experience and Contact reveals are unchanged.
- **Side cards are clickable.** They lean back in 3D, so clicks were landing on the flat spoke wrapper, which had no handler. The spoke now takes click, Enter/Space, hover, `role="button"` and an aria-label. Side cards rest at brightness 0.72, and on hover lift and brighten. Each neighbour carries a frosted "← Previous" or "Next →" pill on its visible corner.
- **Nav (app/page.tsx).** Links hide (lift and fade, right to left) when scrolling down, replay their staggered rise when scrolling up or near the top, 14px instead of 18. The SL mark stays.
- **Reveal timing.** `useOrbReveal` fires when a section takes over the line at 75 percent of the viewport in either direction. Scrolling down is unchanged; scrolling up, Experience no longer starts a globe the moment its bottom edge peeks back in (it used to steal the Projects horizon).
- **Plumbing kept from section-shapes.** `particleInteraction.formation` has an `owner`, so several sections can share it; `useFormation` takes `{ id, shape, share, hmax, gate: 'pinned' | 'line', handoff, lean }`, and `ownsFormation(id)` gates Experience's idle pulse. The canvas waits 3 frames before treating a formation as released, only counts pulses stamped after the current owner claimed it, turns gravity off inside a formation, and bounces formed particles at the top and bottom instead of wrapping them.
- **Contact** is byte-identical to main.

## Open items, most likely next asks first

1. **Sebastian's verdict on the Projects look.** Tunables all sit at the top of components/ui/work-section.tsx: `CARD_W`, `CARD_H`, `FAN_TILT`, `HUB`, `SIDE_SCALE`, `ARC_GAP`, `ARC_DROP`, `ARC_HMAX`, `RIM_LEAN`, and the section's `paddingBottom: '22vh'`. The glow strength is in particle-canvas.tsx (`0.3 * Math.exp(-(th * th) / 0.02)` in the `'rim'` branch). On wide screens (2000x1060) the horizon curves down to the bottom corners like a planet edge; if he wants it flatter, cap the arc's reach or raise `HUB`.
2. **The far card.** When the first or last card is active, the card two places away swings to 28 degrees and sits large and dim in a bottom corner, covering part of the horizon. Options: dim it further, fade it out, or clamp its tilt.
3. **Mobile Projects is broken, and was already broken on main.** At 375x812 the fan overflows (scrollWidth 771 on the branch, 860 on the live site). Needs its own layout (for example one card at a time with swipe). The horizon is desktop only.
4. **Nav ignores prefers-reduced-motion.** Framer animates the hide/show regardless. Wrap the page in `MotionConfig reducedMotion="user"` or gate the transition.
5. **The horizon is hidden while scrolling up through the lower half of Projects** (the fan is low, the horizon waits behind the front card). Acceptable so far, not raised by Sebastian.
6. **Merging.** When Sebastian approves: from the main folder, `git merge --no-ff projects-cradle`, update NOTES "Not merged" lines, push with `git -c credential.helper='!gh auth git-credential' push origin main`, verify on Vercel. Delete `section-shapes` only with his yes.

## Code map

- `components/ui/work-section.tsx`: constants block at the top; `activeBase()` (active card bottom center from the static `fanRef` box); `useOrbReveal(..., { handoff: 'projects', center })`; `measureRim()`; `useFormation(..., { id: 'projects', shape: 'rim', gate: 'line', handoff: true, lean })`; switch pulse effect; the spoke / card `motion.div` pair inside `cards.map`; the side pill after the VIEW WORK pill.
- `components/ui/particle-canvas.tsx`: formation edges (search `ownerChange`), globe and handoff (search `orb.handoff`, `handClock`), the `'rim'` shape branch (search `A curved horizon about a pivot`), gravity gate (`free > 0.01`), y bounce for formed particles.
- `lib/particle-state.ts`: `formation` (owner, handoff, shape, rim geometry cx/cy/R/a0/a1, step, lean, pulse) and `orb`.
- `lib/use-particle-anchor.ts`: `useFormation`, `ownsFormation`.
- `lib/use-orb-reveal.tsx`: options, the 75 percent line fire condition.
- `app/page.tsx`: `navHidden`, `MagneticNavLink` `shown` prop.
- `components/ui/experience-section.tsx`: only the formation id, `LEAN` table and the owner check on the pulse changed.

## How to work this repo

- One worktree per session. To keep going on this work, enter the existing worktree `~/Developer/seba-portfolio-projects-cradle` rather than making a new one.
- `preview_start` by name always starts the MAIN folder's server. For a worktree, run `npm run dev -- -p <port>` from the worktree with Bash in the background, then check the listener's cwd.
- The in-app Browser pane gives stale or black screenshots while hidden. Use Playwright headless for frames (`page.screenshot` to the scratchpad, then Read). Playwright's screenshot moves the headless mouse hover onto the LinkedIn card, so capture hover states with care.
- Debugging the canvas: temporarily append `if (typeof window !== 'undefined') (window as unknown as { __pi: unknown }).__pi = particleInteraction;` to lib/particle-state.ts and read `__pi.formation`, `__pi.gravityBoost`, `__pi.scatterTrigger` from the page. Remove it before committing.
- Useful checks: log owner, boost and scatter changes per frame while wheel-scrolling top to bottom and back; mean canvas alpha as a brightness number; per-frame dt p95 (all slow frames so far fall on the untouched blasts).
- Guards before committing: `npx tsc --noEmit`; eslint on touched files (the only error is the existing `setActiveHovered(false)` in an effect in work-section.tsx, from main); no em dashes; `grep -rn monospace app components lib` returns only lib/fonts.ts; no `__pi` left.

## Known, unrelated, still open

- The root canvas throws `getImageData: The source width is 0` if the tab opens at a tiny size (seen when the in-app pane first opened). Guard W and H in `sampleText`.
- `.playwright-mcp/` is untracked in the main folder.
