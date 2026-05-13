# seba-portfolio — Project Notes
Last updated: May 13, 2026

## Stack
- Next.js 16.2.6 + Tailwind CSS v4 + shadcn
- Framer Motion (animations)
- Deployed to: Vercel (not yet deployed)

## Git Restore Points
- 98c48e8 — orb reveal working on 002 and 003
- 6fa26bd — orb reveal explosion tuned across all 3 sections
- c7bab02 — hero locked in with neural text reveal animation
- Latest — AA page hero, overview, and deliverables sections complete and polished

## File Structure
- app/page.tsx — Main layout, hero, tagline, section order
- app/work/layout.tsx — Shared layout for all work detail pages (frosted glass pill back button, AmbientCanvas)
- app/work/american-airlines/page.tsx — AA detail page (hero, overview, deliverables) — COMPLETE
- app/work/ghost-fc/page.tsx — Ghost FC detail page (stub)
- app/work/remote-work/page.tsx — Remote Work detail page (stub)
- components/ui/who-section.tsx — WHO athlete card + orb reveal
- components/ui/work-section.tsx — Work fan card stack + orb reveal + navigation to detail pages
- components/ui/contact-section.tsx — Contact floating cards + orb reveal
- components/ui/particle-canvas.tsx — Main particle system (~680 lines)
- components/ui/ambient-canvas.tsx — Lightweight ambient-only canvas for work detail pages (skips intro animation, starts in static phase, opacity 0.4)
- components/ui/neural-text-reveal.tsx — Neural network particle animation that spawns from top, settles, then splits apart to reveal "IN PARTNERSHIP WITH / AMERICAN AIRLINES MARKETING TEAM" text. Internal positioning: position absolute, top: 16, left: 64 (relative to wrapper div)
- components/ui/bento-product-features.tsx — BentoGridShowcase component (3-col asymmetric grid, 6 slots, stagger animation)
- components/ui/core-value-stats.tsx — Deliverables card grid (3-col, dark cards with AA navy blue radial gradient, clickable with href, 3D hover effect)
- components/ui/spotlight.tsx — Cursor-following spotlight effect (ibelick version, Framer Motion)
- lib/particle-state.ts — Shared singleton for cross-component signals
- context/parallax-context.tsx — zoomProgressRef
- public/ — seba-celebrate.jpg, 1-6.jpg, linkedin-profile.jpg, builder.jpg,
  aa-capstone.jpg, regression.jpg, depauw.png,
  aa-report.pdf, aa-presentation.pdf, aa-logo.png, aa-logo.svg

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
- Generates 4-6 cluster centers spread across screen (min 200px sep, 260px from center)
- Each particle fires toward nearest cluster with spread rx/ry: 120-480px
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
- No intro animation (no chaos/assembly/hold phases)
- Spring to rest + buzz per particle
- Mouse attraction radius 140px
- Connection lines: linkR 130px, max 3 per particle
- Canvas element opacity: 0.4
- Wraps the canvas in a fixed div zIndex 0

### AA Page (app/work/american-airlines/page.tsx) — COMPLETE

**HERO (HeroSection component)**
- Section height: auto, minHeight 100vh via inner flex div
- Left column: flex 0 0 52%, padding 0 56px 72px 96px, justify-end, zIndex 2
- Right photo: position absolute, top 0, right 0, width 58%, height 100%, overflow hidden, zIndex 1
  - Left fade: linear-gradient to right, #000 to transparent, width 22%
  - Bottom fade: linear-gradient to top, #000 to rgba(0,0,0,0.6) to transparent, height 55%
  - Image: aa-capstone.jpg, objectPosition 12% top, brightness 0.82, contrast 1.05, saturate 0.88
- NeuralTextReveal wrapper: position absolute, top 44px, left 160px, zIndex 10
- Title: "Perception Over Product", clamp 64px-110px, weight 800, tracking -0.04em
- Descriptor: clamp 18px-26px, weight 300, color rgba(255,255,255,0.55)
- Red ambient glow: radial-gradient rgba(204,0,0,0.07) top-left

**NEURAL TEXT REVEAL (components/ui/neural-text-reveal.tsx)**
- Canvas 580x130px, 140 particles
- Internal positioning: position absolute, top: 16, left: 64 (relative to wrapper)
- Phases: spawning → settling → splitting → done
- Split trigger at 2.6s
- Text: "IN PARTNERSHIP WITH" (12px) + "AMERICAN AIRLINES / MARKETING TEAM" (20px)

**OVERVIEW SECTION**
- Three frosted glass cards: rgba(255,255,255,0.82), backdropFilter blur(12px)
- border: 1px solid rgba(255,255,255,0.6), borderRadius 24, padding 48px, minHeight 320
- boxShadow: 0 8px 48px rgba(0,0,0,0.5)
- Dark text: h3 #000000 (32px weight 700), body rgba(0,0,0,0.62) (17px)
- 3D hover: rotateX 6, rotateY 8, scale 1.04, spring stiffness 300
- Stagger animation: card 1 from left, card 2 from bottom, card 3 from right
- Content: The Problem / The Approach / The Finding
- Section label "THE PROJECT" in monospace above cards

**DELIVERABLES SECTION**
- Uses CoreValueStats component
- Title: "Everything we built." clamp 32-52px weight 700
- 6 cards, 3-col grid, gap 24px, maxWidth 1400px, card height 320px
- Card background: radial-gradient ellipse top-left rgba(0,71,127,0.22) + #111111
- Big title: monospace, 28px, weight 700
- Tag pill: inline-block, monospace, 12px, border rgba(255,255,255,0.18), borderRadius 999, padding 3px 12px
- Description: 20px, rgba(255,255,255,0.8), lineHeight 1.75
- CTA: monospace 13px, rgba(255,255,255,0.9)
- Cards:
  1. FINAL REPORT / pdf / Full written analysis... / /aa-report.pdf / Open PDF
  2. PRESENTATION / pdf / Executive slide deck... / /aa-presentation.pdf / Open PDF
  3. LOYALTY DATA / code / Dataset 1: AAdvantage... / Colab dataset 1 / Open Notebook
  4. GEN Z DATA / code / Dataset 2: Gen Z travel... / Colab dataset 2 / Open Notebook
  5. COMPETITOR DATA / code / Dataset 3: Direct three-airline... / Colab dataset 3 / Open Notebook
  6. MACHINE LEARNING MODEL / code / Twitter RoBERTa scoring system... / Colab ML / Open Notebook

### Colab URLs
- Dataset 1 (Loyalty Subreddits): https://colab.research.google.com/drive/15AetEqJ_NRDR2sRR9u1HzBbLj45m37Nb?authuser=1
- Dataset 2 (Gen Z Communities): https://colab.research.google.com/drive/1M5ma_7f-GddO743pxZ-c515put95iek_?authuser=1
- Dataset 3 (Competitor Analysis): https://colab.research.google.com/drive/1hdYg84Oyi5RshCoa4nLSdaW4xeZyY0rA?authuser=1
- ML Model: https://colab.research.google.com/drive/13JB5oxn4z8e_q8CCXwUyM05fI8vDyjvW?authuser=1
- Scraping code: PENDING (GitHub repo, not yet created)

### Ghost FC + Remote Work Pages
- Currently stubs, need same treatment as AA page
- Same section structure planned: hero, overview, deliverables

## CoreValueStats Component (components/ui/core-value-stats.tsx)
- Accepts stats array with: value, label, description, image?, href?, type?
- Cards are anchor tags linking to href (target _blank)
- Non-image cards: dark background with AA navy blue radial gradient
- Image cards: photo with dark overlay
- Both: pill tag, description, CTA in same hierarchy
- Grid layout: repeat(3, 1fr), gap 24px
- Built-in header conditionally renders only when subtitle && subtitle.length > 0

## Main Page Sections (app/page.tsx)

### WHO (001 · THE ATHLETE) — DONE
### Work (002 · WORK) — DONE
- card 0 → /work/american-airlines
- card 1 → /work/ghost-fc
- card 2 → /work/remote-work
### Contact (003 · CONTACT) — DONE

## Style Tokens (AA detail page)
```
MONO = { fontFamily: 'monospace' }
INTER = { fontFamily: 'Inter, ui-rounded, system-ui, sans-serif' }
Section label: monospace 10px letterSpacing 0.4em uppercase rgba(255,255,255,0.22)
Pill: monospace 10px letterSpacing 0.2em border rgba(255,255,255,0.14)
       padding 6px 16px borderRadius 999px color rgba(255,255,255,0.38)
AA red accent: #CC0000
AA navy accent: rgba(0,71,127,0.22)
```

## Rules
- Never use em dashes in any text or code comments
- No card borders or container backgrounds on main page sections
- No light sections on main page
- Work detail pages use AmbientCanvas (not ParticleCanvas)
- Tailwind v4: no tailwind.config file needed

## Next Steps
1. Build Ghost FC detail page (same structure as AA)
2. Build Remote Work detail page (same structure as AA)
3. Create GitHub repo for scraping code and add link to AA page
4. Content accuracy pass on all three detail pages
5. Deploy to Vercel via GitHub
