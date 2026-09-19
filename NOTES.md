# seba-portfolio, Project Notes
Last updated: September 18, 2026 (Experience color marks, synapse tissue, quiet room)

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
- fb1834f, Sep 18 organism session: the network morphs into one body between the Experience card and the logo (formation in particle-state, useFormation, static-phase slots in particle-canvas), drawn tissue deleted; also brings in the color logo marks, clearZones list and mobile quiet room from experience-color-logos
- Sep 18 quiet room session: particleInteraction.calm plus useCalm dim the main network to about a third while the Experience stage is pinned; the three Experience clear zones became one stage zone (.exp-zone, 90px past the content). Branch experience-color-logos
- Sep 18 synapse session: the hairline tether is deleted; components/ui/experience-tissue.tsx draws a private synapse network in the gap with a pulse that bumps the logo; card and mark float on Contact-style loops, steps land on a spring, wall widened to 1280. Branch experience-color-logos
- Sep 18 color marks session: the Experience logo plate is gone; the logo floats as its own object in brand color (BTS magenta dots plus white wordmark via public/bts-logo-color.svg, Radiator red badge with the grayscale filter deleted, Ghost FC crest stays white by Sebastian's decision). The mark is the gravity anchor and publishes its own clear zone; particleInteraction.clearZone became the clearZones list; gravity eases off within 140px of any zone. Branch experience-color-logos
- Sep 18 pinned stage session: 002 · EXPERIENCE became a 300vh pinned stage stepping through the roles on scroll, opaque text card, logo plate replacing the photo, hairline tether, rail. Branch experience-pinned-stage merged to main
- Sep 15 gallery wall session: 002 · EXPERIENCE rebuilt as the gallery wall (ledger + 3:4 photo panel, hover select, logos in the caption, no text shadows), clearZone physics in particle-canvas plus lib/use-particle-anchor.ts, mobile sticky strip with scroll selection, html-only overflow-x guard. Branch experience-gallery-wall merged to main
- ed30e61, Sep 15 Experience content: real Radiator and BTS copy on the role pages and home rows (8264181), white BTS SVG plus grayscale Radiator badge, Higgsfield monochrome hero photos through the new ExperiencePage heroImage prop (3dfe10b), compact row size for long company names (ed30e61). Ghost FC page untouched. Not pushed
- Sep 15 Geist Mono session: every monospace literal (about 45 across 14 files) replaced by the MONO token from the new lib/fonts.ts, which is Geist Mono via next/font (already loaded by the root layout, never consumed before). Root layout imports geistMono from lib/fonts.ts. The AA neural text canvas waits for the face via document.fonts.load before sampling its mask. Same session: experience-card tech-tag pills deleted (4a6a66a)
- e0758a6, Sep 13 Experience / Projects split: home page has four sections (002 · EXPERIENCE hairline list, 003 · PROJECTS three-card fan, 004 · CONTACT), /experience/* role pages on a shared ExperiencePage skeleton, Ghost FC moved to /experience/ghost-fc with a 308 from /work/ghost-fc, Radiator and BTS pages hold PLACEHOLDER copy
- 08d8132, Sep 13 orb-reveal dedupe: the triplicated scroll effect and fixed label moved into lib/use-orb-reveal.tsx (useOrbReveal + OrbLabel), behavior unchanged, all home sections call it
- bb09d36, Sep 13 em dash sweep: zero em dashes left in source (two Front Office copy strings split into sentences, the rest comments and AGENTS.md). NOTES.md and CLAUDE_PROMPTING.md were already clean
- 3d8b734, Sep 12 pill border session part 2: home work-card VIEW WORK pill (components/ui/work-section.tsx) moved to a 2px border on both variants (white 0.28 rest / 0.5 on card hover for photo cards, black 0.14 / 0.28 on the light regression card), padding 5x11 so the size is unchanged, border-color added to the transition. Still hue-free
- 10db1ce, Sep 12 pill border session: Visit the live app CTA and both Back buttons (work + who layouts) moved from 1px to 2px borders with padding pulled in 1px so pill sizes are unchanged; who Back button gained the hover lift; Front Office dashboard capture repositioned (wrapper left 15%, width 100%, no translateX, mask fade 16%, scrim 13%) so the Season decisions column is fully readable
- 4dbdaa1, Sep 12 Front Office hero: eyebrow 2026 · Front Office, Live pill removed, CTA enlarged to 17px, blurry pre-rendered mockup replaced by a flat 2720x2405 capture of the live command center (public/front-office-dashboard.jpg) tilted in CSS (perspective 1600, rotateY 16, rotateX 4, origin right center); capture recipe recorded in Rules
- e761d4f, Sep 12 Ghost FC rewrite: status pill removed, eyebrow dated Jan 2026 to Aug 2026, intro past tense as Data analyst, work section retitled What I built with four equal cards (sponsorship-intelligence engine, ranking evaluation + match-day KPIs, social pipelines, MWPL benchmarking) each with periwinkle index and mono tech tags; home Ghost FC card tag data updated (field is not rendered)
- c7cd69a, Sep 12 accent session: detail-page accent moved from teal #2DD4BF to periwinkle (#9D9FFF / #C4C6FF, #5B5FD6 on the white finding card), consolidated in lib/accent.ts with accentAlpha(); remote-work violet card wash retuned to the accent; home page untouched; NOTES documents lib/accent.ts and the front-office page and fixes the stale purple-lines note
- 9c9491b, Sep 12 session (NOT YET PUSHED at time of writing): /who hero paints instantly (real JPEG, preloaded from home WHO section via react-dom preload, mount fade removed), all 11 photos in public re-encoded from PNG-with-.jpg-extension to real JPEG (home payload ~18 MB to ~2.5 MB), AA hero fade removed, aa-logo.png deleted (was a saved Wikimedia error HTML page), /who hero 100vh with text anchored at left 96px and copy ending ~79% down, home WHO and Work sections toned down ~13% (photo card 435x484, marquee 31px, fan cards 748x452, section labels 22px, hero tagline kept at 25px), LinkedIn card subtitle now Business Analyst @ BTS Consulting
- 6e01fd7, June 1 session 2: /who copy pass (hero eyebrow to 001, tightened taglines, story reworked around the Peru to Chicago to Rochester to DePauw path with corrected NCAC titles, receipts copy fixed including Ghost FC analyst line, Beyond the Pitch tweaks, snowboard gallery crop fixed), remote-work copy (exact 30,272 and Current Population Survey in hero, collapse module bridged to the subgroup chart, eyebrows and model-card supporting text enlarged, presentation PDF linked), built Ghost FC detail page (hero plus What I'm building section with white-knockout crest), work-section (Ghost FC logo on card, teal removed from VIEW WORK hover and pagination dots), added public/ghost-fc-logo.png and public/remote-work-presentation.pdf
- aacfbd8, June 1 session: unified dot-grid background across who/AA/ghost-fc detail pages (match remote-work), removed double-stacked AmbientCanvas from those three, blended AA and athlete hero photos into background with bottom+left gradient fade, gated main-page neural intro to first load only via module-level flag (no replay on Back), renamed VIEW PROJECT to VIEW WORK site-wide, set AA work-card count and report headline to 627K, deployed corrected aa-report.pdf
- d6fb335, who page full build: hero with night-match photo, story section with family senior-day photo, receipts editorial list with enlarged mono titles + teal ticks + hover, beyond-the-pitch 2x2 with teal ghost numbers, six-photo asymmetric gallery with Peru closer, TextScrim for particle legibility, teal #2DD4BF accent introduced
- e0b4886, fix type error in remote-work hero: replace animate() helper with plain motion target objects
- c41b1c0, add regression paper PDF as remote-work Full Paper deliverable, record commit hash in notes
- 77c5d1e, remote-work detail page: dot-grid background swap, gated particle canvas, full-width left-aligned layout with single spine
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
Sep 18 (guide card session): the 002 · EXPERIENCE text card was the quietest object on the stage and said nothing about what to do, so it was rebuilt to hold four things only (Sebastian: the first design was way too busy): company name (mono clamp 32 to 46, compact 22 to 32, text-wrap balance), one sentence (Inter 20/400 white, max 440; the role title is folded into it, the role and dates line is no longer rendered and lives on the role page), a "View the role →" pill (mono 12, 2px border 0.28, 0.6 on hover), and a bottom strip inside the card: "01 / 03" left and a "Next: <company> ↓" button right that scrolls to the next role, or "Next: Projects ↓" on the last role, which scrolls to the section bottom. Goal decided by Sebastian: opening the role and scrolling on are equal. The rail ticks and the arrow are DELETED. The pulse now runs mark to card (formation.pulseDir = -1, the canvas mirrors the front) and lands on the card, not the logo: .exp-hit is added for 260ms at 92 percent of FORMATION_PULSE_MS, snapping the frame to 0.6 white, the name from 0.92 to 1, the pill border to 0.6, and showing a 9px dot on the card's right edge at the name's height (--hit-y), all easing back over 0.7s. No text shadow. The logo kick is gone; the logo keeps its step spring. Card border lives in the .exp-card CSS class (not inline) so the hit class can override it. Mobile gets the same card with no pulse. Verified at 1440x900 and 375x812: Next steps 01 to 02 to 03 to Projects, the pill opens /experience/bts, no page errors. Branch experience-card.

Sep 18 (organism session): while 002 · EXPERIENCE is pinned on desktop there is ONE network and it lives between the card and the logo. The real particles morph into a body there (direction A of the design pass: everyone joins, body about 40 percent taller than the card, quiet core). Sebastian picked A over B (35 percent join, rest fade) and C (ring around the stage plus core). Mechanics: `particleInteraction.formation` in lib/particle-state.ts ({ active, shape, share, hmax, ax, ay, bx, by, box, step, pulseAt }), published by `useFormation(sectionRef, measure, opts, step, exitAt = 1.04)` in lib/use-particle-anchor.ts from just before the stage pins (section top within 8 percent of the viewport) until the stage has lifted 4 percent past the last role (progress 1.04; the last role sits at exactly 1, an earlier 0.92 threshold released the body on Ghost FC). In particle-canvas.tsx, static phase only: every particle carries a seeded slot (fu along the card to mark axis with density following the spindle, fv across it; own PRNG mulberry32(7) so the spawn sequence is unchanged) and a morph amount m. The rest spring aims at rest * (1 - m) + slot * m, so restX/restY are never touched and the ambient layout survives every visit. m waits for the orb reveal (no gravityBoost, 900ms since the last scatter), then rises over 1.2s with a per-particle delay by distance so it reads as streams. Hero text repulsion, clear zones and gravity scale by 1 - m. Inside the body: links under 38px, cap 4, dots at 0.62 radius with 3px glow. Alive: 7 percent breath, per-step lean (u to the power 1, 0.78, 1.28) plus a swirl kick on the step, and a brightness front (FORMATION_PULSE_MS 1000) fired by the section 180ms after each step and every 5.2s, which swells the body as it passes and bumps the logo on arrival. Exit: on the falling edge the canvas bumps scatterTrigger itself (skipped under gravityBoost or within 900ms of another scatter), so the body leaves as the usual blast and the next section's reveal gathers it. prefers-reduced-motion: forms instantly, no pulse, no kick, no exit blast. The shape 'ring' and share < 1 paths (directions C and B) are still in the canvas, unused. components/ui/experience-tissue.tsx is DELETED. Layout: wall columns 39% / 1fr, mark box 390 wide, gap about 310 at 1440. Mobile (< 768) is unchanged: quiet room (one .exp-zone clear zone plus useCalm), no formation. Verified at 1440x900, 2000x1060, 375x812; brightness sampler Who 5.5, Projects 5.4, Contact 5.6, and Who again 5.5 after two Experience visits. Branches experience-color-logos and experience-organism merged to main (fb1834f), pushed and verified live on Vercel Sep 18.

Sep 18 (quiet room session): Sebastian said the section felt crowded by the outer network. Diagnosis: in Who and Projects the gravity anchor is opaque so most of the network hides under it; the Experience mark has no surface and the clear zones keep particles out, so all 1000 particles were visible, packed into a glowing ribbon about 100px above the content and brighter than it. Fix (direction 1 of three: quiet room, frame, blackout): lib/particle-state.ts gained calm (0 to 1), lib/use-particle-anchor.ts gained useCalm(ref, amount) (active while the element covers the viewport center), and the canvas eases calmNow toward it at 0.05 per frame and feeds the existing fade and lineAlpha multipliers (dots 1 - calm * 0.6, lines 1 - calm * 0.7, both dot shadowBlur values times 1 - calm). Calm releases during an orb-reveal blast so the 002 reveal lands at full strength; mouse-hover lines stay full white. Measured mean canvas brightness at 1440: Who 5.6, Experience 1.94, Projects 5.81. The card, mark and gap zones were replaced by one .exp-zone box (inset -90px -26px around .exp-wall, mobile 24px past the column), so the network settles as a dim band, mostly above the stage. Depth is the CALM const in experience-section.tsx (1 now; 0.65 was rendered as the lighter option). Physics untouched.

Sep 18 (synapse session): Sebastian asked for connective tissue between the card and the logo and for Contact-style life. Diagnosis: Contact feels alive because each card runs a perpetual out-of-phase x/y float (7s and 9s) plus a hover scale; Experience only had a 0.5s slide. Now the text card floats on an 8s loop and the mark on a 10s loop, RoleCopy y and the mark scale (0.8 to 1) land on the STEP spring (stiffness 210, damping 15, mass 0.9), and the tether is replaced by ExperienceTissue (direction A of three: synapse, recruiting the real network, swaying strands). The tissue is a private canvas over .exp-wall: 26 seeded nodes in a spindle that converges on the card edge (at the active company name) and the mark's left edge, each linked to its 4 nearest, drifting on sines, rects read every frame so it follows the floats. A pulse walks the BFS path card to mark 180ms after every step and every 5.2s idle (900ms, lit segments), and onArrive kicks the mark scale 1, 1.07, 0.98, 1. prefers-reduced-motion freezes drift and idle pulses. The sketch showed the main network pouring into the widened gap and muddling the tissue, so an empty .exp-gap box (card right edge to mark left edge, 340 tall) publishes a third clear zone. Layout: .exp-wall max 1280, columns 44% / 1fr, so the gap is about 230px at 1440. Mobile: tissue and gap hidden, floats stay.

Sep 18 (later session): the Experience logos are in color and free of their box. The 3:4 plate was deleted; the active role's mark floats on the right inside a 440x320 box (.exp-mark, no surface, no frame), BTS at 88%, Radiator at 80%, Ghost FC crest at 68%, crossfade plus scale 0.94 to 1 per step. Direction A of three rendered directions (floating mark, mark in a well, mark breaking the card). The first render showed the network running straight through the transparent BTS mark, because a gravity anchor with no opaque object under it collects particles on top of itself. The fix: the visible mark publishes its own clear zone (useClearZone(activeMarkRef, 28), the ref follows the active img so the zone hugs the badge bar or the square crest), and gravity fades to zero within 140px of any zone so the network forms a loose halo instead of a packed seam on the zone edge. The tether ends 14px before the mark's settled left edge (computed from offsetWidth so the entrance scale does not shorten it). Hue-free rule amended with Sebastian's yes: brand color may appear inside logo marks only. Open: the Radiator badge source is 250x72 (the largest the brand publishes, the homepage was checked); it renders about 350px wide and is soft on retina. Ask Sebastian for a larger file; do not redraw it with a lookalike font (the badge uses oldstyle numerals no system font matches).

Sep 18: 002 · EXPERIENCE is now a pinned stage. The section is 300vh tall, a 100vh stage sticks to the viewport top, and scroll progress steps through the three roles (stepped with 0.08 hysteresis, spring slide and fade). One role at a time: an opaque #0d0d0d text card on the left (Sebastian asked for a rounded box behind the copy; it is solid card black, not translucent, because translucent scrims have failed on this project three times), a solid logo plate on the right at the old 3:4 photo size (logo only, no caption), and a 1px hairline tether that redraws from the card to the plate on every step. A three-tick rail inside the card scrolls to a role on click. The photo layers are gone from the home page (the hero JPEGs stay for the role pages). Hover selection is gone; scroll drives selection on desktop and mobile. Branch experience-pinned-stage merged to main.

Sep 15 (gallery wall session): 002 · EXPERIENCE was rebuilt as the gallery wall because the hairline list floated straight on the particle network and was unreadable (particle clusters sat under the 11px role line; text shadows did nothing). Diagnosis: every home section that reads cleanly has an opaque anchor object plus a gravity target; Experience had neither. Now: ledger of pure typography on the left (52%), one 3:4 photo panel on the right (about 70vh) showing the selected role's hero photo with the role-page treatment, BTS selected on entry, hover selects, click opens. Ghost FC's panel is a flat #0d0d0d title card with the white crest. Logos moved from the rows into the panel caption. Physics: the panel is the gravity anchor (lib/use-particle-anchor.ts useGravityAnchor) and the ledger publishes a clearZone (useClearZone, 40px pad) that the canvas keeps particles out of. Mobile: sticky landscape strip above the list, the row nearest the viewport center is selected on scroll. Side fix: html/body overflow-x guard moved to html only so position: sticky works. Branch experience-gallery-wall, merged to main.

Sep 15: the Radiator and BTS role pages and home rows now carry the real interview copy (no PLACEHOLDER strings remain). Logos: public/bts-logo-white.svg (fills of the existing bts-logo.svg swapped to white) and public/radiator-logo.png (the brand's 250x72 header badge, rendered grayscale). Both new pages use the new ExperiencePage heroImage prop: a Higgsfield-generated monochrome photo (public/radiator-hero.jpg, public/bts-hero.jpg, 2752x1536 JPEG q82) bleeds on the hero's right and dissolves into the dot grid with the AA mask recipe, and the logo becomes a small mark above the eyebrow. Ghost FC keeps the crest-right hero. NOT YET PUSHED.

Sep 13 (later session): the home page now has four sections. 002 · EXPERIENCE is a new hue-free editorial hairline list (components/ui/experience-section.tsx) with three rows, BTS Consulting, 1-800 Radiator, Chicago Ghost FC, each routing to /experience/<slug>. 003 · PROJECTS is the old work fan trimmed to three cards (Front Office, American Airlines, Remote Work). 004 · CONTACT. Ghost FC moved from /work/ghost-fc to /experience/ghost-fc with a permanent redirect in next.config.ts; its copy is unchanged. The three role pages share one skeleton (app/experience/_components/experience-page.tsx). Radiator and BTS ship with PLACEHOLDER copy and their logo files (public/bts-logo.png, public/radiator-logo.png) do not exist yet; the img hides itself until they land. The orb-reveal effect was also deduplicated into lib/use-orb-reveal.tsx before the fourth section was added. NOT YET PUSHED at time of writing.

Everything through the Sep 13 em dash sweep (bb09d36 plus notes) is pushed to main and deployed on Vercel (verified live Sep 13: 2px pills, repositioned Front Office dashboard, zero em dashes on all six routes). The /who page copy is finalized: hero trimmed and tightened, the story reworked around the real Peru to Chicago to Rochester to DePauw path with corrected NCAC title language (back-to-back tournament titles plus last year's regular-season title), receipts copy fixed including a Ghost FC analyst line, Beyond the Pitch tweaked, and the snowboard gallery crop fixed. The remote-work page now uses the exact 30,272 and names the Current Population Survey in the hero, bridges the collapse module to the subgroup chart, has larger eyebrows and model-card supporting text, and links the real presentation PDF. The Ghost FC detail page is now built and no longer a stub: a hero with the white-knockout club crest plus a "What I'm building right now" section. Teal was removed from the Work-section chrome on June 1, and on Sep 12 the detail-page accent itself moved from teal to periwinkle (lib/accent.ts). Decision: the accent lives on detail pages only; the home page and components/ui stay hue-free.

## File Structure
- app/page.tsx, main layout, hero, tagline, section order Who, Experience, Projects (id stays `work`), Contact. NAV_LINKS is 01 to 04 (June 1: hero neural intro gated to first load via module-level flag, does not replay on Back)
- app/layout.tsx, root layout (data-scroll-behavior="smooth" on <html> for Bug 2 fix; renders GatedParticleCanvas instead of ParticleCanvas directly)
- app/work/layout.tsx, shared layout for all work (project) detail pages (frosted glass pill back button, 2px border since Sep 12; no layout-level canvas). Back links to /#work
- app/work/american-airlines/page.tsx, AA detail page, COMPLETE AND DEPLOYED (June 1: unified dot-grid background, AmbientCanvas removed, hero photo blends into bg via bottom+left gradient fade)
- app/experience/layout.tsx, shared layout for the three role pages. Byte copy of app/work/layout.tsx with Back linking to /#experience. The three Back buttons (work, who, experience) must be edited together
- app/experience/_components/experience-page.tsx, the shared role-page skeleton (ExperiencePage): hero (eyebrow, title, intro, logo) and a "The Work" grid of four equal cards with periwinkle CARD_INDEX and mono TAG pills. Props { eyebrow, title, intro, logo: { src, alt, maxWidth?, style? }, heroImage?: { src, alt, objectPosition? }, sectionHeading, items }. Without heroImage the logo sits crest-right (Ghost FC). With heroImage the right 58% is an absolute photo block with the AA two-layer mask (bottom 76% fade, left 18% fade, maskComposite intersect), left 22% and bottom 55% scrims, img filter brightness 0.82 contrast 1.05 saturate 0, no entrance fade, and the logo becomes a 28px mark above the eyebrow; the text column is 52% max 720. Mobile: .exp-hero-photo goes full width at 46% height. Lives under app/ so it may import lib/accent.ts
- app/experience/ghost-fc/page.tsx, Ghost FC role page (moved from app/work/ghost-fc on Sep 13, copy unchanged): eyebrow "Jan 2026 to Aug 2026 · Chicago Ghost FC", title "The data behind the club", past-tense Data analyst intro, crest right, "What I built" with the four equal cards (sponsorship-intelligence command center, ranking evaluation and match-day KPIs, social analytics pipelines, conference benchmarking)
- app/experience/radiator/page.tsx, 1-800 Radiator & A/C role page (Jun 2026 to Aug 2026, Data & Analytics Consultant, contract): title "What a delivery really costs", four cards (cost-to-serve model, carrier billing reconciliation, cost-per-stop density analysis, repeatable monthly pipeline). Hero photo /radiator-hero.jpg at objectPosition 58% center, badge logo as a 40px grayscale mark. "1-800" uses a non-breaking hyphen (U+2011) so the eyebrow never splits after the dash
- app/experience/bts/page.tsx, BTS role page (Sep 2026 to Present, Business Analyst, Strategy and Business Modeling): title "Strategy leaders can practice", section "What I do", four cards (discovery and experience design, simulation model builds, facilitation and delivery, AI inside the experience). Hero photo /bts-hero.jpg at 42% center, white BTS mark above the eyebrow
- app/work/front-office/page.tsx, Front Office detail page (reachable from work card id 3, the leftmost card in the fan). Hero: eyebrow "2026 · Front Office", title, intro, enlarged periwinkle outline CTA (17px, 2px border at accentAlpha 0.45 rest / ACCENT hover, 15x29 padding) to the live app, and a sharp flat dashboard capture (public/front-office-dashboard.jpg, 2720x2405) tilted in CSS inside the masked bleed container (perspective 1600px; container left mask fade to 16%, left scrim 13%; wrapper rotateY 16deg, rotateX 4deg, rotateZ -1deg, origin right center, top 9%, left 15%, width 100%, no translateX, soft drop shadow). Note: translateX inside the transform chain runs along the rotated axis and barely moves the projected edge, so position the wrapper with left instead. Status pill removed Sep 12. Below: six decision cards with periwinkle 01 to 06 indices. Sep 13: card surface is hue-free, a white 0.04 radial sheen at top left over #0d0d0d (was a periwinkle accentAlpha 0.07 wash over blue-leaning #0c0c11, which tinted the whole card); the index number is the only accent on a card. Same day, the card black on Ghost FC and remote-work (model cards, deliverable cards) was normalized from blue-leaning #0d0d10 / #101015 hover to neutral #0d0d0d / #111111 so all work pages share one card surface; the remote-work Model 03 result card keeps its periwinkle 0.10 wash and border on purpose
- app/work/remote-work/page.tsx, Remote Work detail page (substantially built, May 28; dot-grid bg, full-width left-aligned layout)
- app/who/layout.tsx, shared layout for /who detail page (mirrors app/work/layout.tsx pattern, including the Sep 12 2px Back button and hover lift; edit both files together)
- app/who/page.tsx, /who detail page (BUILT, d6fb335): hero (night-match action photo, text over dark-left), story section with featured family photo (who-story.jpg) on the right, receipts editorial hairline list (enlarged mono titles, accent ticks, hover motion), beyond-the-pitch 2x2 with oversized faint accent ghost numbers, six-photo asymmetric gallery (who-1 to who-6) with Peru childhood-surf photo as full-width closer. Note it now contains a local TextScrim element (fixed column-wide gradient that dims particles behind body copy for legibility, page-local, does not touch global AmbientCanvas) (June 1: unified dot-grid background, AmbientCanvas removed, hero photo blends into bg via bottom+left gradient fade)
- components/ui/experience-section.tsx, 002 · EXPERIENCE home section, the pinned stage (Sep 18). Later the same day the plate was replaced by the floating color mark: .exp-mark-cell > .exp-mark (440x320 box, no surface), imgs at per-role width, useGravityAnchor(markRef), useClearZone(cardRef, 40) plus useClearZone(activeMarkRef, MARK_PAD 28), the hairline tether was deleted the same day in favor of ExperienceTissue, and the separate card, mark and gap zones were merged into the single .exp-zone with useCalm (see Current Status); mobile .exp-mark is a 120px tall strip with the img at auto width, max 70%. The plate details below are history: section height N*100vh, .exp-stage position sticky top 0 height 100vh; useOrbReveal takes the stage ref (not the section) so the 002 label stays while pinned. Scroll listener maps progress through the section to the active role, stepped: Math.round(progress*(N-1)) commits only past 0.5 + HYSTERESIS (0.08). RoleCopy blocks are all mounted in one grid cell (card keeps the tallest height), active {opacity 1, y 0}, past y -40, next y 40, 0.5s; inactive ones are inert, aria-hidden, tabIndex -1. Text card: SURFACE #0d0d0d, radius 14, FRAME 1px white 0.08, SHADOW, padding 40/40/40/56, rail of three 3px ticks at left 24 (active 64px white, others 10px at 0.35, click scrolls to sectionTop + i*100vh). Tether: motion.div keyed by active, absolute inside .exp-wall, left/top/width measured from the card's right edge, the active company name's center, and the plate's left edge (useLayoutEffect on active and resize), scaleX 0 to 1 with a 4px dot at the plate end. Plate: same 3:4 size as the old photo panel, SURFACE, FRAME, SHADOW, logo centered at per-role width (BTS 54%, Radiator 66% with the grayscale filter, Ghost FC crest 50%), maxHeight 60%, crossfade 0.4s. useGravityAnchor(plateRef), useClearZone(cardRef, 40). Mobile (< 768): stage still pinned, .exp-wall flex column with 72px top padding, plate first as a 16/7 strip max 180 tall, card padding 28/24, rail, tether and arrow hidden. Previous version (Sep 15 gallery wall, for reference): .exp-wall grid 52% ledger / photo panel, max 1100, gap 64. ROLES (slug, company, role, dates, oneLine, logo, compact?, panel) most recent first; panel is { kind: 'photo', src, alt, objectPosition } (BTS 42% center, Radiator 58% center, same brightness 0.82 contrast 1.05 saturate 0 as the role pages) or { kind: 'crest', src } (Ghost FC, flat #0d0d0d, crest 46% wide). RoleRow is pure typography (company mono clamp 26 to 38, compact 20 to 30; role line 11px mono; body 17px Inter 300 max 460), white tick 32 to 64 and translateX 10 when selected, hover and focus select, click and Enter open /experience/<slug>. WallPanel: width min(100%, 70vh*0.75), aspect 3/4, radius 14, WHO card shadow and 1px frame, every role layer stays mounted and crossfades 0.4s (scale 1.03 to 1), bottom 38% gradient, caption with the 24px logo mark and COMPANY · DATES 10px mono. useGravityAnchor(panelRef) and useClearZone(ledgerRef, 40). No text shadows anywhere in the section. Mobile (< 768): .exp-wall becomes a flex column with 88px top padding, .exp-panel-cell order -1 and position sticky top 0, strip 16/7 max 220 tall, caption logo hidden, scroll listener selects the row nearest the viewport center, arrow hidden
- components/ui/who-section.tsx, WHO athlete section with photo card + vertical marquee composition
- components/ui/work-section.tsx, 003 · PROJECTS fan card stack (three cards since Sep 13: Front Office, American Airlines, Remote Work) + navigation to /work/* detail pages. cardRoutes is a Record keyed by card id, not by fan position
- components/ui/experience-tissue.tsx, ExperienceTissue (Sep 18): the private synapse canvas between the Experience card and mark. Props wallRef, cardRef, nameRef, markRef, active, onArrive. Tune NODES, PULSE_MS, IDLE_MS at the top of the file; hue-free (white only)
- components/ui/contact-section.tsx, Contact floating cards + orb reveal
- components/ui/vertical-marquee.tsx, vertical marquee primitive (from 21st.dev) with mask-based edge fade
- components/ui/particle-canvas.tsx, main particle system (~680 lines)
- components/ui/gated-particle-canvas.tsx, client wrapper: renders ParticleCanvas everywhere EXCEPT the detail routes listed in NO_PARTICLE_ROUTES (/who, all /work/* pages, and the /experience prefix) (usePathname prefix match). Lets root layout stay a Server Component
- components/ui/ambient-canvas.tsx, lightweight ambient-only canvas for work detail pages
- components/ui/dot-grid-background.tsx, dot-grid shader bg (react-three-fiber) for /work/remote-work only. One-time center-out reveal then faint shimmer, prefers-reduced-motion aware
- components/ui/neural-text-reveal.tsx, neural network particle animation. Internal positioning: position absolute, top: 8, left: 48
- components/ui/bento-product-features.tsx, BentoGridShowcase component
- components/ui/core-value-stats.tsx, deliverables card grid
- components/ui/card-23.tsx, Card23 component (tag prop now OPTIONAL as of 7b99ab9)
- components/ui/spotlight.tsx, cursor-following spotlight effect
- lib/particle-state.ts, shared singleton for cross-component signals (Sep 18: clearZones, a list of { x, y, w, h, active } rects in viewport coordinates; each useClearZone call registers its own entry and removes it on unmount. Was a single clearZone on Sep 15)
- lib/use-particle-anchor.ts, section hooks that drive the canvas (Sep 15): useGravityAnchor(ref) sets gravityTarget to the element center while its center is on screen (guarded by gravityBoost like the who/work loops, which still carry their own copies), useClearZone(ref, pad) publishes the element rect plus pad as clearZone while on screen. Both run one rAF loop each and clear their state on unmount
- lib/use-orb-reveal.tsx, useOrbReveal(sectionRef) returns the label ref and owns the shipped scroll choreography (fire at 75% viewport, 900ms converge, scatter, fade math, re-arm out of view), plus the OrbLabel element. All four home sections use it since Sep 13; tune thresholds here only
- next.config.ts, redirects(): /work/ghost-fc to /experience/ghost-fc (permanent, 308)
- lib/fonts.ts, site-wide font tokens (Sep 15): geistMono (next/font Geist_Mono, variable --font-geist-mono) and MONO = geistMono.style.fontFamily, the only source of the mono face. Unlike lib/accent.ts it may be imported anywhere, including app/page.tsx and components/ui
- lib/accent.ts, detail-page accent tokens (ACCENT, ACCENT_BRIGHT, ACCENT_ON_LIGHT) and the accentAlpha(alpha, tone) helper. Added Sep 12
- context/parallax-context.tsx, zoomProgressRef
- CLAUDE.md, imports NOTES.md and CLAUDE_PROMPTING.md
- CLAUDE_PROMPTING.md, prompting tactics for destructive changes (added May 27)
- public/, bts-logo-color.svg (Sep 18, magenta dots kept, wordmark fill swapped to white; used by the home Experience mark), bts-logo-white.svg (Sep 15, white-fill copy of bts-logo.svg), radiator-logo.png (Sep 15, 250x72 badge from www.1800radiator.com/Content/lang/en/images/ecomboxlogo.png), radiator-hero.jpg and bts-hero.jpg (Sep 15, Higgsfield monochrome heroes, 2752x1536 JPEG q82), seba-celebrate.jpg, 1-6.jpg (UNUSED, 22 MB, candidates for deletion), linkedin-profile.jpg, builder.jpg, aa-capstone.jpg, regression.jpg, depauw.png, who-hero.jpg, who-story.jpg, who-1.jpg to who-6.jpg, aa-report.pdf, aa-presentation.pdf, aa-logo.svg, ghost-fc-logo.png, front-office.png (home fan card only since Sep 12), front-office-card.png (unreferenced, pre-rendered perspective of the live landing page), front-office-dashboard.jpg (Sep 12, flat 2x capture of the live app's command-center section used by the /work/front-office hero), remote-work-presentation.pdf. Sep 12: every photo .jpg is now a real JPEG q82 (they were RGBA PNGs with .jpg extensions, 1.5 to 5 MB each); aa-logo.png deleted

## Main Page Sections (app/page.tsx)

### WHO (001 · THE ATHLETE), DONE (redesigned May 27)
- Floating photo card (DePauw #11 jersey celebration photo) anchored left, tilted -2deg
- Vertical marquee on right with achievements: 03× NCAC CHAMPION, TOURNAMENT MVP, DEPAUW CAPTAIN, GHOST FC CAPTAIN, SEMI-PRO
- Marquee uses Inter weight 300, opacity fades from center via JS, mask-image gradient on container fades edges to transparent
- "Explore the story →" CTA below photo card, left-aligned, ~72px gap
- Whole composition is one click target routing to /who

### Experience (002 · EXPERIENCE), DONE (Sep 13)
- Editorial hairline list, three rows most recent first: BTS Consulting (/experience/bts), 1-800 Radiator (/experience/radiator), Chicago Ghost FC (/experience/ghost-fc)
- Hue-free, no container, orb reveal via the shared hook
- BTS and Radiator rows carry PLACEHOLDER copy until the interview output lands

### Projects (003 · PROJECTS, section id stays `work`), DONE
- card 0 → /work/american-airlines (middle card, active on load)
- card 2 → /work/remote-work
- card 3 → /work/front-office (leftmost card in the fan)
- card 1 (Ghost FC) removed from the fan Sep 13; lives in Experience now. cardRoutes is keyed by id so removing a card never shifts routes
- Duplicate left section label removed (May 27), only top-center label remains

### Contact (004 · CONTACT), DONE
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

## Clear Zone (particle-canvas.tsx, Sep 15, list since Sep 18)
Three static-phase edits, nothing else in the canvas changed. Since Sep 18 they loop over `zones` (particleInteraction.clearZones), and a per-particle zoneEase (0 at 20px from a zone edge, 1 at 140px) multiplies the non-boost gravity force:
- `zones` is read once per frame next to `gt`
- In the per-particle force block after the hero text repulsion zone: while `cz.active` and not blasting, particles inside the rect or within a 60px margin band get an outward push along the nearest edge, force (1 - outsideDist / 60) * 2.5. Particles whose rest point lies inside the rect relocate their rest once to a jittered spot 60 to 260px past the nearest edge whose target stays on screen (candidates sorted by edge distance). A force alone only wins about 60px against the 0.04 rest spring; stepping rest points to the edge piled the network into a bright seam along the border, which is why the relocation is jittered
- Scatter cluster centers reject positions inside the active zone padded by 120px; if every attempt is rejected (a zone covering most of a phone viewport) a single fallback center is pushed so the loop never indexes an empty array (this crashed the rAF loop once during development)

## Orb Reveal Trigger Thresholds
All three sections use:
- Fire: rect.top < window.innerHeight * 0.75 && rect.bottom > 0
- Reset: rect.top > window.innerHeight * 1.5 || rect.bottom < 0
- isRunning guard prevents double-fire
- Labels: "001 · THE ATHLETE", "002 · EXPERIENCE", "003 · PROJECTS", "004 · CONTACT"
- Implemented once in lib/use-orb-reveal.tsx (useOrbReveal + OrbLabel) since Sep 13; the sections no longer carry their own copies

## Purple Connection Lines + Mouse Hover Overlay (particle-canvas.tsx) (purple tint later reverted to white)
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
- Inside the static-phase draw block (else if (lineAlpha > 0)), strokeStyle was set to rgba(200, 150, 255, 1) for a light purple tint at the time; the code has since reverted to '#ffffff' (lines 648, 684, 713 as of Sep 12), so static lines are white today
- Added a separate draw pass at the end of the static-phase draw block for mouseLines using strokeStyle white at globalAlpha 1.0, overlaying the regular static lines under the cursor with full-alpha white
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
  clearZones: [], // ClearZone[], one entry per useClearZone call
  calm: 0, // 0 to 1, network recedes; set through useCalm
};
```

## WHO Section Composition (components/ui/who-section.tsx)

### Photo Card
- Image: seba-celebrate.jpg (DePauw #11, celebration moment)
- Sep 12: width 435, height min(484px, 48vh), left 232, top calc(50% - min(242px, 24vh)); the half-height is shared with the CTA top and must move with the height
- Rounded corners 14, frame 1px rgba(255,255,255,0.08)
- Shadow: 0 34px 70px -18px rgba(0,0,0,0.6)
- Tilt: rotate(-2deg)
- Positioned with offset to close middle gap; shrunk about its own center in the Sep 12 size pass
- Fully contained, no bleed off viewport

### Vertical Marquee (components/ui/vertical-marquee.tsx)
- Width 384px, height 61vh, positioned 240px from right viewport edge (Sep 12)
- Items: 03× NCAC CHAMPION, TOURNAMENT MVP, DEPAUW CAPTAIN, GHOST FC CAPTAIN, SEMI-PRO
- Font: Inter weight 300, 31px, uppercase, item padding 28px 0 (Sep 12, was 36px / 32px)
- textShadow: '0 0 8px rgba(0,0,0,0.85), 0 0 24px rgba(0,0,0,0.6)' for readability against particles
- Opacity-from-center via useEffect: opacity = 1 - normalizedDistance * 0.92
- mask-image: linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%) for smooth edge fade
- speed prop: 13 (Sep 12; scaled with the item pitch so px/s is unchanged)

### CTA
- "Explore the story →"
- 16px, rgba(255,255,255,0.9) at rest (Sep 12, was 18px)
- Underline animates in on hover, arrow translateX(6px) on hover
- Positioned 36px below photo card bottom, left-aligned with photo at left 232

### Click target
- Whole section composition routes to /who using scroll restoration pattern from work-section.tsx

## Work Detail Pages

### Shared Layout (app/work/layout.tsx)
- No layout-level canvas (pages render DotGridBackground themselves)
- Back button: frosted glass pill, fixed top-left (identical in app/who/layout.tsx, which links to /#who)
  - fontFamily Inter, fontSize 15, fontWeight 500
  - background rgba(255,255,255,0.08), backdropFilter blur(12px)
  - border 2px solid rgba(255,255,255,0.22), borderRadius 999 (Sep 12, was 1px at 0.14)
  - padding 9px 19px, color rgba(255,255,255,0.85) (padding pulled in 1px so the outer size matches the old 1px pill)
  - chevron strokeWidth 2
  - Hover: background rgba(255,255,255,0.14), border rgba(255,255,255,0.45), color #ffffff, translateY(-1px)
  - Stays hue-free by decision: the CTA is the only periwinkle pill on a hero
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

### Ghost FC Page (app/experience/ghost-fc/page.tsx, moved from app/work/ghost-fc on Sep 13), REWRITTEN Sep 12
- Hero: eyebrow "Jan 2026 to Aug 2026 · Chicago Ghost FC", h1 "The data behind the club", past-tense intro (Data analyst, four themes named equally), crest right. No status pill.
- Work section: eyebrow "The Work", h2 "What I built", 2x2 grid of equal cards. ITEMS entries are { title, body, tags }. Card = periwinkle mono index (CARD_INDEX) + h3 + body + tag row (TAG pills, mono 11px, white 0.55 on a 0.12 border) pinned to the bottom with marginTop auto. The four bullets are deliberately equal; do not turn the sponsorship engine into a feature card.

### Remote Work Page (app/work/remote-work/page.tsx), SUBSTANTIALLY BUILT (May 28)

Design direction: editorial, Lusion-style. Full-width, left-aligned, single vertical spine down the left (matches the AA page's structural feel without copying its split-photo hero). Background is the dot-grid shader, NOT the particle network.

**BACKGROUND ARCHITECTURE (important, the gotcha)**
- There were TWO particle systems painting on this route: ParticleCanvas (root layout, app/layout.tsx) AND AmbientCanvas (work layout, app/work/layout.tsx). Both had to be gated off to reveal the dot-grid.
- AmbientCanvas: gated in app/work/layout.tsx via usePathname (skips /work/remote-work)
- ParticleCanvas: root layout is a Server Component so it cannot use usePathname directly. Solution: components/ui/gated-particle-canvas.tsx ('use client', usePathname, returns null on /work/remote-work, else renders ParticleCanvas). Root layout renders GatedParticleCanvas. Root layout stays a Server Component, ParticleCanvas itself untouched.
- Result on /work/remote-work: single WebGL context (only the dot-grid). Every other route still gets the particle network exactly as before.

**DOT-GRID BACKGROUND (components/ui/dot-grid-background.tsx)**
- Shader-based dot grid via react-three-fiber (three ^0.184.0, @react-three/fiber ^9.6.1). Adapted from a 21st.dev CanvasRevealEffect/DotMatrix component
- Behavior: one-time center-out reveal on mount (~2s), then settles to a barely-perceptible slow shimmer (does not loop or replay on scroll)
- useFrame timing: effective = t while t < 2.0s (plays reveal once), then effective = 2.0 + sin((t-2.0)*0.3)*0.15 (low-amplitude shimmer around the past-reveal threshold)
- prefers-reduced-motion: snaps to REVEAL_DURATION, static dots, no reveal, no shimmer
- Default tuning: colors dim gray-violet, dotSize 2, low opacities. Dots read as faint texture, never compete with content

**LAYOUT (full-width, left-aligned spine)**
- All sections share ONE left edge (the hero's left edge is the canonical spine). Eyebrows, headings, body, and card rows all start at the same x
- Text is left-aligned everywhere (no centered text). Right edge can vary (cards go full width, paragraphs narrower)
- No frosted panels. An earlier version wrapped each content block in frosted/opaque panels (legibility armor against the busy particle network). Once the calm dot-grid replaced the network, the panels were removed; text sits directly on the grid

**PAGE BEATS (top to bottom)**
1. Hero: eyebrow "RESEARCH · ECONOMETRICS", title "Does Remote Work Narrow the Gender Wage Gap?", intro paragraph. Fills full width
2. Subgroup bar chart: "REMOTE WAGE PREMIUM BY SUBGROUP" + 4 bars. Non-college men 6.5%, Non-college women 6.1%, College men 16.9% (purple), College women 9.5% (purple). College rows brighter/highlighted, non-college dimmer. Caption below + 4 metadata pills: Stata, IPUMS CPS, OLS Regression, 30,272 obs
3. Collapse module: eyebrow "BUILDING THE ESTIMATE" (purple tick), heading "Watch the remote premium collapse." (collapse in purple), body. Then 3 model cards: Model 01 Raw premium 34.6% R2 0.05, Model 02 Human capital 20.7% R2 0.21, Model 03 Full model 6.5% R2 0.44 (purple, the result accent). Shrinking purple progress bars sell the collapse. Scroll-triggered: cards reveal L-to-R with stagger, percentages count up from 0, bars fill on scroll (whileInView once)
4. The finding: eyebrow "THE FINDING", heading "A marker of high-paying jobs, not a flexibility benefit." Light card (rgba(255,255,255,0.82), dark text, purple left-border) holds the interpretation. Mentions -0.004 (non-college remote-by-female, insignificant) and -0.070 (triple interaction, significant at 10%). This is the one intentional bright surface on the page
5. Deliverables: eyebrow "DELIVERABLES", heading "What I built.", 3-card grid: FULL PAPER (pdf, /remote-work paper), PRESENTATION (pdf, placeholder /remote-work-presentation.pdf), DATA SOURCE (IPUMS CPS, Oct 2022 onward, 30,272 obs)

**OPEN FOLLOW-UPS (next session)**
- Light finding card reads as a big bright slab; left as-is for now by choice. Revisit whether to cap its max-width or tone the surface down once judged on the finished page
- Presentation PDF href is a placeholder (/remote-work-presentation.pdf), needs the real file
- The data/copy on this page must NEVER be altered by a styling prompt; every numbers/label string was verified intact through the redesign. Keep ending styling prompts with "do not change data or copy"
- Hero has no right-side anchor (AA fills it with a photo); currently the bar chart below carries the width. Fine for now, revisit only if it reads empty

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
MONO = Geist Mono, imported from lib/fonts.ts (Sep 15; was the bare monospace fallback, Courier on Safari and Menlo on Chrome)
INTER = { fontFamily: 'Inter, ui-rounded, system-ui, sans-serif' }
Section label: monospace 10px letterSpacing 0.4em uppercase rgba(255,255,255,0.22)
AA red accent: #CC0000
AA navy accent: rgba(0,71,127,0.22)
Detail-page accent (periwinkle), lib/accent.ts: ACCENT #9D9FFF (structural: ticks, borders, labels, bar fills), ACCENT_BRIGHT #C4C6FF (result text, live dots), ACCENT_ON_LIGHT #5B5FD6 (only for the pullquote rule inside the white finding card on /work/remote-work). Translucent uses go through accentAlpha(alpha, tone). Used on /who, /work/remote-work, /work/ghost-fc, /work/front-office. Replaced teal #2DD4BF on Sep 12. Home page and components/ui stay hue-free
Background: #080808
```

## Rules
- Section orb labels (001/002/003) are 22px mono 0.35em as of Sep 12; the hero tagline stays 25px by choice. Home WHO/Work sizing was toned down ~13% on Sep 12; do not scale it back up.
- Every photo in public must be a real JPEG. Check with `file` before shipping; a PNG renamed .jpg is 10x the bytes.
- Detail-page hero photos must not be gated behind a mount fade; they are preloaded (react-dom preload on the home page for /who, cached from the work card for AA) and should paint on the first frame.
- Hue-free has one exception (Sep 18, agreed with Sebastian): brand colors may appear inside company logo marks on the home page, never in chrome, text, or surfaces
- A gravity anchor with no opaque surface (the Experience mark) must also publish a clear zone, or the network collects on top of it. Such a section dims the network with useCalm so its content leads; never a scrim over the content
- Any box behind home-page copy is opaque card black (#0d0d0d with the 1px white 0.08 frame), never translucent. Sep 18: the Experience text card
- Copy on the home page never sits directly on the network. A section needs an opaque anchor with a gravity target (useGravityAnchor), and if it carries body copy with no surface under it, a clearZone over the copy (useClearZone). Text shadows and translucent scrims are not a legibility tool here; they have failed on this project three times
- The horizontal overflow guard lives on html only (app/globals.css). Never add overflow-x to body as well: with both set, body becomes its own scroll container and position: sticky silently stops working (the mobile Experience strip)
- Never use em dashes in any text or code comments
- No card borders or container backgrounds on main page sections
- No light sections on main page (exception: the finding card on /work/remote-work is a deliberate single light surface)
- All detail pages (who, AA, ghost-fc, remote-work) use the unified dot-grid background. AmbientCanvas is no longer used on any detail page (removed June 1). The main page uses the ParticleCanvas neural system, which now plays its intro reveal only on first load.
- Tailwind v4: no tailwind.config file needed
- Section labels are top-center only (left labels removed May 27)
- Pill buttons site-wide use a 2px border since Sep 12 (Back buttons, the Front Office CTA, the work-card VIEW WORK pill). When adding a new pill, match 2px and keep padding 1px tighter than a 1px pill would use
- /work/remote-work styling prompts must always end with an instruction not to change data or copy (every number/label is verified correct)
- Generated hero photos (role pages) come from Higgsfield Nano Banana (the Sep 15 run resolved to nano_banana_flash), 16:9 at 2k, count 2 per role, 2 credits each, then sips to JPEG q82. Prompts must ask for cinematic monochrome, no readable text, no logos, faces out of focus; the page applies saturate(0) anyway. Prompts used: Radiator "Night at an auto parts warehouse loading dock in Texas, a single delivery van backed in under sodium lights, stacked radiator boxes on pallets, long shadows, cinematic monochrome black and white, film grain, wide composition, no people in focus, no text, no signage, no logos." BTS "A dim executive workshop room, six leaders seated around a long table lit only by a large wall screen showing an abstract business simulation dashboard of line charts and bar charts, their faces turned toward the screen and softly out of focus, cinematic monochrome black and white, shallow depth of field, wide composition, no readable text, no logos." Other candidates from the run are in the Higgsfield history if a swap is wanted
- Product mockups are flat captures tilted in CSS (perspective on the container, rotate on a wrapper), never pre-rendered perspective PNGs. Capture at an effective DPR of 2 and at least 2400px wide. Recipe used Sep 12: Playwright MCP at a 3200x2800 viewport with document.documentElement.style.zoom = 2, wrap the target blocks in a div, hide the rest, element screenshot with scale device, then sips to JPEG q85.
- Placeholder convention: unfinished copy is prefixed PLACEHOLDER: so `grep -rn PLACEHOLDER app components` lists every open slot. Nothing with PLACEHOLDER in it should be pushed to main without a conscious decision
- Role pages live under /experience/<slug> on the shared ExperiencePage skeleton; project pages live under /work/<slug>. New roles: add a ROLES entry in components/ui/experience-section.tsx plus an app/experience/<slug>/page.tsx. New projects: add a card in components/ui/work-section.tsx (with a cardRoutes entry keyed by id) plus an app/work/<slug>/page.tsx
- The mono font comes only from lib/fonts.ts (MONO). No 'monospace' or 'ui-monospace' literals in app, components, or lib; `grep -rn monospace app components lib` must return only lib/fonts.ts. Canvas font strings use a template with MONO
- Detail-page accent colors come only from lib/accent.ts. No local ACCENT consts, no hex-alpha suffixes like `${ACCENT}55`, no raw accent rgba literals in page files. app/page.tsx and components/ui/* must never import lib/accent.ts

## Bugs

### Bug 1 (FIXED)
Work card forward-nav scroll bug: clicking a card lands on section 2 then scrolls up to hero. Likely scrollIntoView in useEffect on detail pages or hash navigation conflict.

### Bug 2 (FIXED)
Back button flicker on /#work navigation. Fixed via one-line change: added data-scroll-behavior="smooth" to the <html> tag in app/layout.tsx. Tells Next.js to swap smooth scroll to instant during route transitions, eliminating the visible flicker.

### Bug 3 (FIXED)
Main-page neural intro replayed every time the user navigated Back to the home page, because the page component remounts on client-side navigation. Fixed by gating the intro with a module-level flag that survives client-side navigation but resets on a full page reload, so the intro plays on first load only. Option on file: swap the module flag for sessionStorage if it should also not replay on a same-tab refresh.

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

### Background-swap lesson (May 28)
- When swapping a background on one route, search for ALL background layers first. There were two independent particle canvases (root layout + work layout) painting on the same route. The first gating attempt only caught one, so the new background appeared not to apply (it was buried under the still-painting root canvas).
- Tell-tale: if a new bg "doesn't apply," it may be rendering correctly but masked by another layer at the same z-index. Gate every layer, then verify with a single-WebGL-context check.
- A Server Component root layout cannot use usePathname. Wrap the conditional client logic in a small 'use client' component and render that, rather than converting the whole root layout to a client component.

## Next Steps

### Priority 0 (done Sep 18): Experience logos in color, freed from the plate
- DONE. Remaining: a larger Radiator badge file from Sebastian (current source 250x72). Ghost FC stays white by decision. Handoff for reference: docs/handoffs/2026-09-18-experience-color-logos.md

### Priority 0 (done): ship the Experience section (Sep 15)
- DONE (Sep 15, later session): the gallery wall replaced the floating hairline list. Optional cleanup: migrate the who-section and work-section gravity rAF loops to useGravityAnchor in lib/use-particle-anchor.ts (same semantics, they still carry their own copies)
- Known pre-existing bug, unrelated: the root particle canvas throws `getImageData ... The source width is 0` and the page fails to load when the tab first opens at a very small pane size (seen at 800x600 in the desktop-app preview). sampleText samples a zero-width canvas; guard W/H before sampling
- Copy, logos, and hero photos are in (Sep 15). Remaining: push and verify on Vercel that /work/ghost-fc 308s to /experience/ghost-fc and that the two hero JPEGs (1.1 and 1.5 MB) are acceptable on the home preload
- Optional: give Ghost FC a hero photo too so all three role pages match (needs a real match-day or club photo, not a generated one, since the club is real and photographed)
- Optional: swap either generated hero for the other candidate from the Sep 15 run if Sebastian prefers it


### Priority: finish detail-page cohesion (periwinkle detail-page accent)
- DONE (Sep 12): detail-page accent moved from teal to periwinkle and consolidated in lib/accent.ts. Decision: the accent lives on detail pages only; the home page and components/ui stay hue-free (VIEW WORK hover, pagination dots, and card-nav arrows are white, not accent; the earlier note that arrow hover was still teal was stale, grep shows no accent hex in components/). Background unification and hero blend were DONE June 1.
- Recolor the remote-work page's purple/violet live charts to a periwinkle-anchored two-tone palette (multi-series need the accent plus a distinguishable second tone).
- The remote-work scatter chart (Does Remote Work Close the Gender Wage Gap?) is likely a STATIC image, it cannot be recolored in code and must be regenerated from the Python plotting source with a periwinkle palette, then re-exported. Audit and flag all static chart images before recoloring.
- Verify the intro-replay fix holds (Back does not replay, fresh load does), and decide module flag vs sessionStorage for refresh behavior.

### Priority 1: Build Ghost FC detail page, DONE (June 1 session 2), REWRITTEN Sep 12
- Sep 12: role ended August 2026, so the page is now past tense (Data analyst, Jan 2026 to Aug 2026), the Live pill is gone, and the four cards carry the real deliverables (sponsorship-intelligence engine with 329 prospects, evaluation harness + match-day KPIs, TikTok/Instagram pipelines over 700+ posts, MWPL benchmarking) with tech tags. Home work-card tag is now Python · DuckDB · APIs
- Originally built as a hero plus a compact "What I'm building right now" section, deliberately NOT a full AA-style case study, since the role was ongoing at the time
- Hero is text-left + white-knockout crest right (no container, sits directly on the dark dot-grid), with a "Live · In progress" pill
- Four work items: match & standings analytics, automated data pipelines, social growth KPIs, league strategy
- Optional later: expand to a full case study (problem/approach/finding + deliverables), add a hero photo (currently crest only)

### Priority 2: Remote Work detail page polish
- Presentation PDF is now linked (June 1 session 2): /remote-work-presentation.pdf is shipped to public/ and the Deliverables card href is no longer a placeholder
- Page is substantially built. Remaining: decide on finding-card width/brightness, optional hero right-side anchor
- Content accuracy already verified through the redesign

### Priority 3: Create GitHub repo for AA scraping code
- Add link to AA detail page deliverables
- Currently marked PENDING in deliverables section

### Priority 4: Content accuracy pass on all detail pages
- Once all three detail pages are built, full review for accuracy, dates, credit attribution

### /who followups (parked)
- /who builder section: hands-on building and customizing is part of identity and implied in the hero copy but not yet represented on /who; design a section for it later
- Option to add imagery to /who beyond-the-pitch if it still reads flat

### Lower priority
- LinkedIn card: subtitle updated Sep 12 to Business Analyst @ BTS Consulting, but the card still shows only the DePauw wordmark. Add a BTS logo (need the asset from Sebastian) next to or in place of it. Also confirm LINKEDIN_URL still resolves.
- Delete public/1.jpg to 6.jpg (unused, 22 MB) once confirmed
- Inter is named in about 30 fontFamily strings but is never loaded (no next/font, no link tag), so it silently falls back to ui-rounded / system-ui. Same fix pattern as lib/fonts.ts MONO if it should be real Inter
- Google AI Essentials cert placement
- PC rendering issue (deferred, low priority)
- Fix author on commit 1307879 (Bug 2 fix has wrong git author, would need rebase)
