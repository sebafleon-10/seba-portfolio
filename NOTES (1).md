# seba-portfolio — Project Notes
Last updated: May 12, 2026

## Stack
- Next.js + Tailwind CSS + shadcn
- Framer Motion (animations)
- Deployed to: Vercel (not yet deployed)

## File Structure
- app/page.tsx — Main layout, hero, tagline, section order
- components/ui/who-section.tsx — WHO athlete card
- components/ui/work-section.tsx — Work fan card stack + orb reveal
- components/ui/contact-section.tsx — Contact floating cards
- components/ui/particle-canvas.tsx — Main particle system (~680 lines)
- lib/particle-state.ts — Shared singleton for cross-component signals
- context/parallax-context.tsx — zoomProgressRef
- public/ — seba-celebrate.jpg, 1.jpg, 2.jpg, 3.jpg, 4.jpg, 5.jpg, 6.jpg,
  linkedin-profile.jpg, builder.jpg, aa-capstone.jpg, regression.jpg,
  ikea.jpg, depauw.png

## Particle System
- Seeded PRNG: mulberry32(seed=42)
- Fixed canvas, always running
- Phases: chaos → assembly → hold → scatter → static
- Static phase: ambient drift, mouse interact, gravity target, zoom parallax
- Connection max distance: 120px (linkR), spatial hash O(n) culling
- Text repulsion zone: center x 42%, y 50%, radius 280px, force 3.0
- gravityTarget: shared via lib/particle-state.ts
  - Normal force: 4.0, radius 1200, damping 0.96, velocity cap 8
  - Boosted force (gravityBoost=true): 20.0, cap 18, no spring-to-rest
  - Cluster lines brighten within 155px of gravity target

## particle-state.ts singleton
```ts
export const particleInteraction = {
  repulse: false,
  gravityTarget: { x: -9999, y: -9999, active: false },
  orbReveal: { phase: 'idle' | 'converging' | 'holding' | 'scattering' },
  scatterTrigger: 0,      // bump to Date.now() to fire scatter burst
  gravityBoost: false,    // skips spring-to-rest, 5x gravity force
};
```

## Orb Reveal System (section transition animation)
Replicates hero "ATHLETE. ANALYST. BUILDER." reveal for each section.

**Sequence:**
1. Scroll trigger fires (section rect.top < H * 1.15)
2. gravityTarget → W/2, H/2, gravityBoost = true (particles converge)
3. After 2000ms: gravityBoost off, scatterTrigger = Date.now() (burst)
4. Section label fades in (scroll-driven opacity, same as hero tagline)
5. Label fades out as user scrolls deeper past section

**Canvas changes for orb:**
- gravityBoost skips spring-to-rest so convergence isn't fought
- Velocity cap raised to 18 during boost
- scatterTrigger: one-shot burst assigns velocity toward restX/restY ÷ TRAVEL
- No special rendering — natural cluster line brightness handles orb glow

**Scroll-driven opacity (matches hero):**
- entryFade: fades in as section enters from below
- exitFade: fades out as user scrolls past
- Both computed from section.getBoundingClientRect() at render time
- hasScattered ref guards against showing before burst fires

**Currently implemented:** 002 · WORK ✓
**TODO:** 001 · THE ATHLETE, 003 · CONTACT

## Sections

### Hero — DONE
- Particles: chaos → form "SEBASTIAN LEON" → scatter to clouds
- "ATHLETE. ANALYST. BUILDER." appears as HTML, fades with scroll
  (opacity = 1 - scrollY/300, via scroll listener on taglineRef)
- Repulsion zone keeps center gap clear

### WHO (001 · THE ATHLETE) — DONE
- ArticleCard style, 560px wide, bg zinc-900
- Photo: /public/seba-celebrate.jpg, full bleed top portion
- Tag: "001 · THE ATHLETE" + pills "USL" "L2"
- Title: "Sebastian Leon"
- Subtitle: "2× Conference Champion · #11 Captain · DePauw"
- Hover: card lifts y:-5 scale:1.02, image zooms scale:1.1
- On hover: "View LinkedIn Profile →" slides up
- Particle gravity: rAF loop on cardRef, active when inView
- Orb reveal: TODO — needs same system as Work

### Work (002 · WORK) — DONE
- Fan card stack, 3 cards currently (more coming)
- Cards: American Airlines, Chicago Ghost FC, Remote Work & Gender Wage Gap
- cardWidth: 860px, cardHeight: 520px
- Fan: x offset 340px, rotateZ 18deg
- Spring: stiffness 280, damping 28
- Dot navigation + left/right arrow buttons
- Particle gravity: rAF on active card
- Orb reveal: DONE ✓
  - Trigger: rect.top < H * 1.15
  - Label: "002 · WORK", monospace, 30px, letterSpacing 0.35em
  - Scroll-driven opacity with entryFade + exitFade
  - hasScattered + hasTriggered refs prevent double-fire

### Contact (003 · CONTACT) — DONE
- Two floating cards side by side, gap 60px
- LinkedIn card (460px): photo, name, subtitle, DePauw logo
  - Fix applied: minWidth:0 + whiteSpace:normal on subtitle div
    so DePauw logo doesn't get clipped
- Email card (460px): builder.jpg photo, email address
- Float animation: 7s and 9s loops, out of sync
- Particle gravity: hover → hovered card, else midpoint
- Orb reveal: TODO — needs same system as Work

## Next Steps (priority order)
1. Add orb reveal to WHO section ("001 · THE ATHLETE")
2. Add orb reveal to CONTACT section ("003 · CONTACT")
3. Remove TEST ORB button from app/page.tsx (cleanup)
4. Add remaining Work cards (DoorDash card image pending)
5. Deploy to Vercel via GitHub
6. Optional: Resume PDF download button
7. Optional: Athlete detail modal on WHO card click

## Reusable Pattern for Orb Reveal (copy for 001 + 003)
Add to any section component:

```tsx
// State + refs
const [orbPhase, setOrbPhase] = useState<'idle'|'converging'|'scattering'>('idle')
const hasTriggered = useRef(false)
const hasScattered = useRef(false)
const sectionRef   = useRef<HTMLElement>(null)
const orbLabelRef  = useRef<HTMLParagraphElement>(null)

// Scroll effect
useEffect(() => {
  const section = sectionRef.current
  if (!section) return

  const run = () => {
    hasTriggered.current = true
    setOrbPhase('converging')
    particleInteraction.gravityTarget.active = true
    particleInteraction.gravityTarget.x      = window.innerWidth / 2
    particleInteraction.gravityTarget.y      = window.innerHeight / 2
    particleInteraction.gravityBoost         = true

    setTimeout(() => {
      particleInteraction.gravityTarget.active = false
      particleInteraction.gravityBoost         = false
      particleInteraction.scatterTrigger       = Date.now()
      particleInteraction.orbReveal.phase      = 'scattering'
      setOrbPhase('scattering')
      hasScattered.current = true
      const r = section.getBoundingClientRect()
      const entryFade = r.top > 0
        ? Math.max(0, 1 - r.top / (window.innerHeight * 0.35))
        : 1
      const exitFade = Math.max(0, 1 - Math.max(0, -r.top) / 350)
      if (orbLabelRef.current)
        orbLabelRef.current.style.opacity = String(Math.max(0, Math.min(entryFade, exitFade)))
    }, 2000)
  }

  const handleScroll = () => {
    const rect = section.getBoundingClientRect()
    if (rect.top < window.innerHeight * 1.15 && rect.top > -150 && !hasTriggered.current) run()
    if (hasScattered.current && orbLabelRef.current) {
      const entryFade = rect.top > 0
        ? Math.max(0, 1 - rect.top / (window.innerHeight * 0.35))
        : 1
      const exitFade = Math.max(0, 1 - Math.max(0, -rect.top) / 350)
      orbLabelRef.current.style.opacity = String(Math.max(0, Math.min(entryFade, exitFade)))
    }
    if (rect.top > window.innerHeight || rect.bottom < 0) {
      hasTriggered.current = false
      hasScattered.current = false
      if (orbLabelRef.current) orbLabelRef.current.style.opacity = '0'
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
  return () => {
    window.removeEventListener('scroll', handleScroll)
    particleInteraction.gravityTarget.active = false
    particleInteraction.gravityBoost         = false
    particleInteraction.orbReveal.phase      = 'idle'
  }
}, [])

// Label JSX
<p
  ref={orbLabelRef}
  style={{
    position: 'fixed',
    top: 0, left: '50%',
    transform: 'translateX(-50%) translateY(40vh)',
    zIndex: 5,
    pointerEvents: 'none',
    fontFamily: 'monospace',
    fontSize: 25,
    letterSpacing: '0.35em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.88)',
    whiteSpace: 'nowrap',
    margin: 0,
    opacity: 0,
    transition: 'opacity 0.8s ease',
    textShadow: '0 0 40px rgba(255,255,255,0.15)',
  }}
>
  001 · THE ATHLETE  {/* or 003 · CONTACT */}
</p>
```
