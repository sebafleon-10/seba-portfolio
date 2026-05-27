# seba-portfolio, Project Notes
Last updated: May 27, 2026

## Stack
- Next.js 16.2.6 + Tailwind CSS v4 + shadcn
- Framer Motion (animations)
- Deployed to: Vercel, https://seba-portfolio-e1oz.vercel.app

## Git
- GitHub repo: https://github.com/sebafleon-10/seba-portfolio.git
- Branch: main
- Every push to main auto-deploys to Vercel (~30 to 60s build time)
- Local git identity: Sebastian Leon <sebafleon@gmail.com> (set May 27, 2026)

## Git Restore Points
- 98c48e8, orb reveal working on 002 and 003
- 6fa26bd, orb reveal explosion tuned across all 3 sections
- c7bab02, hero locked in with neural text reveal animation
- f1b8304, AA page complete, deliverables, hero, back button
- 8bb28ce, add scroll indicator to hero
- ed23ec5, CLAUDE.md imports NOTES.md, refresh project notes
- 1307879, Bug 2 fix via data-scroll-behavior attribute on <html>
- 7b99ab9, WHO section redesign with photo card and vertical marquee, /who detail page stub, remove duplicate left section labels, Card23 tag prop optional, add CLAUDE_PROMPTING.md
- cccdfff, purple connection lines and mouse-reactive white hover overlay added to particle network, MOUSE_R set to 45 and static-phase mouse-attract force boosted from 0.3 to 0.6

## Current Status
Site is shipped and live. Main page complete with all three sections done and polished. AA detail page complete and deployed. WHO section redesigned with new floating photo card and vertical marquee composition (May 27). Ghost FC and Remote Work detail pages still stubs. /who detail page exists as a stub, needs full build now that homepage routes to it.

## File Structure
- app/page.tsx, main layout, hero, tagline, section order
- app/layout.tsx, root layout (data-scroll-behavior="smooth" on <html> for Bug 2 fix)
- app/work/layout.tsx, shared layout for all work detail pages (frosted glass pill back button, AmbientCanvas)
- app/work/american-airlines/page.tsx, AA detail page, COMPLETE AND DEPLOYED
- app/work/ghost-fc/page.tsx, Ghost FC detail page (stub)
- app/work/remote-work/page.tsx, Remote Work detail page (stub)
- app/who/layout.tsx, shared layout for /who detail page (mirrors app/work/layout.tsx pattern)
- app/who/page.tsx, /who detail page (stub, needs full build)
- components/ui/who-section.tsx, WHO athlete section with photo card + vertical marquee composition
- components/ui/work-section.tsx, Work fan card stack + orb reveal + navigation to detail pages
- components/ui/contact-section.tsx, Contact floating cards + orb reveal
- components/ui/vertical-marquee.tsx, vertical marquee primitive (from 21st.dev) with mask-based edge fade
- components/ui/particle-canvas.tsx, main particle system (~680 lines)
- components/ui/ambient-canvas.tsx, lightweight ambient-only canvas for work detail pages
- components/ui/neural-text-reveal.tsx, neural network particle animation. Internal positioning: position absolute, top: 8, left: 48
- components/ui/bento-product-features.tsx, BentoGridShowcase component
- components/ui/core-value-stats.tsx, deliverables card grid
- components/ui/card-23.tsx, Card23 component (tag prop now OPTIONAL as of 7b99ab9)
- components/ui/spotlight.tsx, cursor-following spotlight effect
- lib/particle-state.ts, shared singleton for cross-component signals
- context/parallax-context.tsx, zoomProgressRef
- CLAUDE.md, imports NOTES.md and CLAUDE_PROMPTING.md
- CLAUDE_PROMPTING.md, prompting tactics for destructive changes (added May 27)
- public/, seba-celebrate.jpg, 1-6.jpg, linkedin-profile.jpg, builder.jpg, aa-capstone.jpg, regression.jpg, depauw.png, aa-report.pdf, aa-presentation.pdf, aa-logo.png, aa-logo.svg

## Main Page Sections (app/page.tsx)

### WHO (001 · THE ATHLETE), DONE (redesigned May 27)
- Floating photo card (DePauw #11 jersey celebration photo) anchored left, tilted -2deg
- Vertical marquee on right with achievements: 03× NCAC CHAMPION, TOURNAMENT MVP, DEPAUW CAPTAIN, GHOST FC CAPTAIN, SEMI-PRO
- Marquee uses Inter weight 300, opacity fades from center via JS, mask-image gradient on container fades edges to transparent
- "Explore the story →" CTA below photo card, left-aligned, ~72px gap
- Whole composition is one click target routing to /who

### Work (002 · WORK), DONE
- card 0 → /work/american-airlines
- card 1 → /work/ghost-fc
- card 2 → /work/remote-work
- Duplicate left section label removed (May 27), only top-center label remains

### Contact (003 · CONTACT), DONE
- Duplicate left section label removed (May 27), only top-center label remains

## Particle System
- Seeded PRNG: mulberry32(seed=42)
- Fixed canvas, always running
- Phases: chaos → assembly → hold → scatter → static
- Static phase: ambient drift, mouse interact, gravity target, zoom parallax
- Connection max distance: 120px desktop, 50px mobile (linkR), spatial hash culling
- Text repulsion zone: center x 42%, y 50%, radius 280px, force 3.0
- gravityTarget: shared via lib/particle-state.ts

## Orb Reveal Scatter Tuning (particle-canvas.tsx)
When scatterTrigger fires in static phase:
- Generates 4 to 6 cluster centers spread across screen (min 200px sep, 260px from center)
- Each particle fires toward nearest cluster with spread rx/ry: 120 to 480px
- TRAVEL = 1/(1-0.97) for velocity calculation
- isBlasting window: 900ms after scatter
  - Cap raised to 28 during blast
  - Damping raised to 0.97 during blast
  - Spring-to-rest suppressed during blast
  - Gravity pull suppressed during blast
- Connection radius during blast: min(160, linkR * 1.4)
- connCount cap during blast: 5 (vs 3 normally)
- isBlastingFrame: 900ms window for connection drawing
- lastScatterTime initialized to -99999 (prevents false blast on load)

## Orb Reveal Trigger Thresholds
All three sections use:
- Fire: rect.top < window.innerHeight * 0.75 && rect.bottom > 0
- Reset: rect.top > window.innerHeight * 1.5 || rect.bottom < 0
- isRunning guard prevents double-fire
- Labels: "001 · THE ATHLETE", "002 · WORK", "003 · CONTACT"

## Purple Connection Lines + Mouse Hover Overlay (particle-canvas.tsx)
Added May 27 to bring the purple line aesthetic and white-on-hover overlay from the 21st.dev "aether-flow-hero" component into the existing ParticleCanvas without replacing it.

### Goal
Bring the purple connection lines and white-on-mouse-hover aesthetic from the 21st.dev "aether-flow-hero" component into the existing ParticleCanvas, without replacing the existing component.

### Decision
Keep the sophisticated existing ParticleCanvas (chaos to assembly to hold to scatter to static phase choreography, the SEBASTIAN LEON name formation, parallax-driven zoom forces, text repulsion zone for the tagline, mobile breakpoints, seeded PRNG, gravity targets) rather than swap it for the simpler 21st.dev component. The throughline behavior across all sections is a differentiator worth preserving.

### Implementation
All surgical edits to components/ui/particle-canvas.tsx:
- Added MOUSE_R (45) and MOUSE_R2 constants near the mouse listener setup
- Added mouseLines bucket alongside existing sLinesNear, sLinesFar, letterLines, clusterLines arrays
- Reset mouseLines.length to 0 in the connection-line clearing block each frame
- In static-phase connection logic, after the gravity cluster check, tag lines whose either endpoint is within MOUSE_R pixels of the cursor by pushing to mouseLines
- Inside the static-phase draw block (else if (lineAlpha > 0)), changed strokeStyle to rgba(200, 150, 255, 1) for a light purple tint applied to all regular static-phase line buckets
- Added a separate draw pass at the end of the static-phase draw block for mouseLines using strokeStyle white at globalAlpha 1.0, overlaying purple lines under the cursor with bright white
- Boosted the static-phase mouse-attract force from 0.3 to 0.6 (both vx and vy terms) so particles within 150px of the cursor visibly pull toward it

### Tuning journey (tried and reverted)
- MOUSE_R started at 200 to match 21st.dev's value, but our network is roughly 5x denser (1020 particles vs ~200) so the same radius captured far too many connections; moved to 100, then 60, landed on 45
- Tried widening cluster scatter spreads (rx 40 + rand()*240 to 150 + rand()*400, ry 20 + rand()*120 to 100 + rand()*280) to approximate 21st.dev's uniform distribution; this made the network blanket the viewport with no negative space, which let it compete visually with content sections; REVERTED
- Tried boosting static-phase line alphas (sLinesNear 0.30 to 0.65, sLinesFar 0.17 to 0.35, clusterLines 0.45 to 0.75); combined with widened clusters this read as overpowering against content; REVERTED
- Final state preserves original cluster spread and original line alphas; the only persistent additions are the purple strokeStyle, the white mouse-hover overlay, the MOUSE_R = 45 radius, and the 0.3 to 0.6 force boost

### Files touched this session
- components/ui/particle-canvas.tsx, modified, shipped in commit cccdfff
- components/ui/particle-network.tsx, created then deleted as an orphan when the decision shifted to enhancing the existing canvas instead of adopting the simpler 21st.dev-style standalone candidate

### Prompting lessons (continuation of CLAUDE_PROMPTING.md pattern)
- Always inspect what components already exist in the project before adding new ones; an orphan got created because the existing ParticleCanvas's presence wasn't verified first
- When user says "don't break what we have going," clarify which existing component they are referring to before assuming
- Multi-edit Claude Code prompts work well when each edit is scoped with explicit before/after find-and-replace and surrounding context lines
- Single-number tuning iterations (radius, alpha, force multiplier) are faster than architectural changes; default to tuning values in place rather than refactoring

## particle-state.ts singleton
```ts
export const particleInteraction = {
  repulse: false,
  gravityTarget: { x: -9999, y: -9999, active: false },
  orbReveal: { phase: 'idle' | 'converging' | 'holding' | 'scattering' },
  scatterTrigger: 0,
  gravityBoost: false,
};
```

## WHO Section Composition (components/ui/who-section.tsx)

### Photo Card
- Image: seba-celebrate.jpg (DePauw #11, celebration moment)
- Width 560 to 620px, height 700 to 760px
- Rounded corners, frame 1px rgba(255,255,255,0.08)
- Shadow: 0 40px 80px -20px rgba(0,0,0,0.6)
- Tilt: rotate(-2deg)
- Positioned with offset to close middle gap (moved right by 100px from initial left anchor)
- Fully contained, no bleed off viewport

### Vertical Marquee (components/ui/vertical-marquee.tsx)
- Width 440px, positioned 240px from right viewport edge
- Items: 03× NCAC CHAMPION, TOURNAMENT MVP, DEPAUW CAPTAIN, GHOST FC CAPTAIN, SEMI-PRO
- Font: Inter weight 300, ~36px, uppercase
- textShadow: '0 0 8px rgba(0,0,0,0.85), 0 0 24px rgba(0,0,0,0.6)' for readability against particles
- Opacity-from-center via useEffect: opacity = 1 - normalizedDistance * 0.92
- mask-image: linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%) for smooth edge fade
- speed prop: 15

### CTA
- "Explore the story →"
- 18px, rgba(255,255,255,0.9) at rest
- Underline animates in on hover, arrow translateX(6px) on hover
- Positioned ~72px below photo card bottom, left-aligned with photo

### Click target
- Whole section composition routes to /who using scroll restoration pattern from work-section.tsx

## Work Detail Pages

### Shared Layout (app/work/layout.tsx)
- AmbientCanvas rendered behind all work pages
- Back button: frosted glass pill, fixed top-left
  - fontFamily Inter, fontSize 15, fontWeight 500
  - background rgba(255,255,255,0.08), backdropFilter blur(12px)
  - border 1px solid rgba(255,255,255,0.14), borderRadius 999
  - padding 10px 20px, color rgba(255,255,255,0.85)
  - Hover: background rgba(255,255,255,0.14), border rgba(255,255,255,0.28), color #ffffff
  - Links to /#work
- Background #0a0a0a

### AmbientCanvas (components/ui/ambient-canvas.tsx)
- ~300 particles, starts immediately in ambient/static mode
- No intro animation
- Mouse attraction radius 140px
- Connection lines: linkR 130px, max 3 per particle
- Canvas element opacity: 0.4

### AA Page (app/work/american-airlines/page.tsx), COMPLETE AND DEPLOYED

**HERO (HeroSection component)**
- Section height: auto
- Left column: flex 0 0 52%, padding 0 56px 72px 96px, justify-end, zIndex 2
- Right photo: position absolute, top 0, right 0, width 58%, height 100%, overflow hidden, zIndex 1
  - Left fade: linear-gradient to right, #000 to transparent, width 22%
  - Bottom fade: linear-gradient to top, #000 to rgba(0,0,0,0.6) to transparent, height 55%
  - Image: aa-capstone.jpg, objectPosition 12% top, brightness 0.82
- NeuralTextReveal wrapper: position absolute, top 68px, left 96px, zIndex 10
- Title: "Perception Over Product", clamp 36px to 58px, weight 800, tracking -0.04em
- Descriptor: clamp 18px to 26px, weight 300, color rgba(255,255,255,0.55)
- Red ambient glow: radial-gradient rgba(204,0,0,0.07) top-left

**NEURAL TEXT REVEAL (components/ui/neural-text-reveal.tsx)**
- Canvas 580x130px, 140 particles
- Internal positioning: position absolute, top: 8, left: 48 (relative to wrapper)
- Text: "IN PARTNERSHIP WITH" (12px) + "AMERICAN AIRLINES / MARKETING TEAM" (20px)

**OVERVIEW SECTION**
- Three frosted glass cards: rgba(255,255,255,0.82), backdropFilter blur(12px)
- border: 1px solid rgba(255,255,255,0.6), borderRadius 24, padding 48px, minHeight 320
- Dark text: h3 #000000 (32px weight 700), body rgba(0,0,0,0.62) (17px)
- 3D hover: rotateX 6, rotateY 8, scale 1.04
- Stagger animation: card 1 from left, card 2 from bottom, card 3 from right
- Content: The Problem / The Approach / The Finding

**DELIVERABLES SECTION**
- Uses CoreValueStats component
- Title: "Everything we built."
- 6 cards, 3-col grid, gap 24px, maxWidth 1400px, card height 360px
- Card background: radial-gradient ellipse top-left rgba(0,71,127,0.22) + #111111
- justifyContent: flex-start (titles all align to top)
- Cards:
  1. FINAL REPORT / pdf / Full written analysis covering methodology, findings, and strategic recommendations delivered to AA. / /aa-report.pdf / Open PDF
  2. PRESENTATION / pdf / Executive slide deck presented to the American Airlines global marketing team. / /aa-presentation.pdf / Open PDF
  3. LOYALTY DATA / code / Dataset 1: AAdvantage, Delta SkyMiles, United MileagePlus subreddit scrape and sentiment analysis. / Colab dataset 1 / Open Notebook
  4. GEN Z DATA / code / Dataset 2: Gen Z travel subreddit scrape filtered using a Gen Z language pattern classifier to isolate authentic Gen Z posts. / Colab dataset 2 / Open Notebook
  5. COMPETITOR DATA / code / Dataset 3: Gen Z keyword filter applied to airline subreddits to surface what Gen Z is discussing about American Airlines, Delta, and United. / Colab dataset 3 / Open Notebook
  6. MACHINE LEARNING MODEL / code / XGBoost + LightGBM predict Gen Z loyalty enrollment. SHAP ranks the service drivers. K-Means segments generational behavior. / Colab ML / Open Notebook

### Colab URLs
- Dataset 1 (Loyalty Subreddits): https://colab.research.google.com/drive/15AetEqJ_NRDR2sRR9u1HzBbLj45m37Nb?authuser=1
- Dataset 2 (Gen Z Communities): https://colab.research.google.com/drive/1M5ma_7f-GddO743pxZ-c515put95iek_?authuser=1
- Dataset 3 (Competitor Analysis): https://colab.research.google.com/drive/1hdYg84Oyi5RshCoa4nLSdaW4xeZyY0rA?authuser=1
- ML Model: https://colab.research.google.com/drive/13JB5oxn4z8e_q8CCXwUyM05fI8vDyjvW?authuser=1
- Scraping code: PENDING (GitHub repo, not yet created)

### Ghost FC + Remote Work Pages
- Currently stubs, need same treatment as AA page
- Same section structure: hero, overview, deliverables

## CoreValueStats Component (components/ui/core-value-stats.tsx)
- Accepts stats array with: value, label, description, image?, href?, type?
- Cards are anchor tags linking to href (target _blank)
- Non-image cards: dark background with AA navy blue radial gradient, height 360px, justifyContent flex-start
- Image cards: photo with dark overlay
- Grid layout: repeat(3, 1fr), gap 24px

## Card23 Component (components/ui/card-23.tsx)
- Props: tag (optional), pills, title, description, imageSrc, location, onClick
- tag prop made optional in 7b99ab9 to allow cards without a tag
- hasTopRow flag conditionally renders the top row only if tag OR pills exist

## Style Tokens
```
MONO = { fontFamily: 'monospace' }
INTER = { fontFamily: 'Inter, ui-rounded, system-ui, sans-serif' }
Section label: monospace 10px letterSpacing 0.4em uppercase rgba(255,255,255,0.22)
AA red accent: #CC0000
AA navy accent: rgba(0,71,127,0.22)
Background: #080808
```

## Rules
- Never use em dashes in any text or code comments
- No card borders or container backgrounds on main page sections
- No light sections on main page
- Work detail pages use AmbientCanvas (not ParticleCanvas)
- Tailwind v4: no tailwind.config file needed
- Section labels are top-center only (left labels removed May 27)

## Bugs

### Bug 1 (FIXED)
Work card forward-nav scroll bug: clicking a card lands on section 2 then scrolls up to hero. Likely scrollIntoView in useEffect on detail pages or hash navigation conflict.

### Bug 2 (FIXED)
Back button flicker on /#work navigation. Fixed via one-line change: added data-scroll-behavior="smooth" to the <html> tag in app/layout.tsx. Tells Next.js to swap smooth scroll to instant during route transitions, eliminating the visible flicker.

## Prompting Lessons (CLAUDE_PROMPTING.md)
Documented May 27 after the WHO section redesign exposed a recurring failure mode.

### Pattern
When asking Claude Code to DELETE components (files, JSX blocks, imports, variants), the orphaned references at OTHER places in the codebase are likely to be left behind unless the spec explicitly names them. This causes compile failures that cascade ("Module not found", "X is not defined") and waste session time on cleanup.

### Specific failure modes seen
- Claude Code interprets "keep all other behavior unchanged" as license to preserve deletions it should have made
- Confirms completion while saying "X preserved" when X was supposed to go
- Treats visual elements as "behavior" worth protecting
- Completes the additive change while skipping the destructive change

### Tactics (full text in CLAUDE_PROMPTING.md)
1. Lead with destruction. Put DELETE before ADD in the spec.
2. Violent verbs. DELETE, REMOVE, RIP OUT. Not "clean up" or "tidy".
3. Name failure modes explicitly. "DO NOT INTERPRET preserve animations AS keeping broken references."
4. Skip "keep unchanged" lists when doing destructive work. They invite over-preservation.
5. Require verification with paste-back of the affected lines after the change.

### CLAUDE.md import
CLAUDE_PROMPTING.md is auto-loaded by Claude Code via `@CLAUDE_PROMPTING.md` line in CLAUDE.md.

## Next Steps

### Priority 1: Build /who detail page proper
- The homepage WHO section routes to /who but the destination is a stub
- Needs full content: longer story, more photos, achievement breakdown, soccer business background, training, semi-pro experience
- Use AA detail page structure as the model: hero, overview cards, deliverables/gallery
- Should match the floating card visual language

### Priority 2: Build Ghost FC detail page
- Same structure as AA page (hero, overview, deliverables)
- Strong portfolio piece (current internship, real BA work)
- Content: PlayMetrics API pipeline, match tracker Excel workbook, Instagram Graph API, KPI tracking work
- Use Ghost FC branding/imagery

### Priority 3: Build Remote Work detail page
- Same structure as AA page
- Content: BUSA 305 econometrics paper on remote work and the gender wage gap, IPUMS CPS data in Stata, five OLS models with interaction terms, esttab export

### Priority 4: Create GitHub repo for AA scraping code
- Add link to AA detail page deliverables
- Currently marked PENDING in deliverables section

### Priority 5: Content accuracy pass on all detail pages
- Once all three detail pages are built, full review for accuracy, dates, credit attribution

### Lower priority
- Google AI Essentials cert placement
- PC rendering issue (deferred, low priority)
- Fix author on commit 1307879 (Bug 2 fix has wrong git author, would need rebase)
