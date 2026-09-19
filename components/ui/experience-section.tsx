'use client';

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { MONO } from '@/lib/fonts';
import { preload } from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useOrbReveal, OrbLabel } from '@/lib/use-orb-reveal';
import { useClearZone, useCalm, useFormation, type FormationGeometry } from '@/lib/use-particle-anchor';
import { particleInteraction, FORMATION_PULSE_MS } from '@/lib/particle-state';

// 002 · EXPERIENCE, the pinned stage (Sep 18 2026).
//
// The section is N screens tall and a full-height stage sticks to the top
// of the viewport for the whole run. Scroll progress picks the active role
// (stepped, with hysteresis). One role is visible at a time: an opaque text
// card on the left and the company's logo mark floating on the right in
// brand color. While the stage is pinned the particle network itself morphs
// into one living body between the card edge and the mark (useFormation):
// it breathes, leans and convulses on every step, and a brightness front
// runs mark to card through the particles and lands on the card: the frame,
// the company name and the pill flash, so the motion ends on the copy.
// The card holds four things only: company name, one sentence, the View the
// role pill, and a strip with the position and what scrolling brings next.
// Leaving the section releases it as a blast back into the ambient flow.
// Card and mark float on slow loops like the Contact cards and steps land on
// a spring. Mobile has no gap, so it keeps the quiet room: one clear zone
// around the content plus useCalm. No text shadows, no scrims.
// Brand color inside logo marks is the one hue allowed on the home page.
// Click or Enter opens the role.

const INTER = 'Inter, ui-rounded, system-ui, sans-serif';
const SURFACE = '#0d0d0d';
const SHADOW = '0 34px 70px -18px rgba(0,0,0,0.6)';
// Steps land on a spring so the copy and the mark overshoot and settle.
const STEP = { type: 'spring' as const, stiffness: 210, damping: 15, mass: 0.9 };

// Most recent role first. The slug doubles as the /experience/<slug> route.
// Copy for BTS and Radiator comes from the Sep 15 2026 role interviews; the
// tag and location fields from that interview are kept in comments since
// the card does not render them.
type Role = {
  slug: string;
  company: string;
  role: string;
  dates: string;
  oneLine: string;
  // The floating mark. `width` is its share of the 390px mark box.
  logo: { src: string; alt: string; width: string; style?: CSSProperties };
  // role and dates are not rendered on the card (they live on the role page);
  // role still feeds the aria-label. Long company names drop to a smaller
  // mono size so the card stays two lines at most.
  compact?: boolean;
};

const ROLES: Role[] = [
  {
    // Tag: Excel · Python · Claude. Location: Chicago, IL (Hybrid).
    slug: 'bts',
    company: 'BTS',
    role: 'Business Analyst, Strategy and Business Modeling',
    dates: 'Sep 2026 to Present',
    oneLine: 'Business analyst building simulations and AI tools for leadership teams.',
    logo: { src: '/bts-logo-color.svg', alt: 'BTS logo', width: '88%' },
  },
  {
    // Tag: Python · Excel · Qlik. Location: Chicago, IL (Remote).
    slug: 'radiator',
    company: '1‑800 Radiator & A/C',
    compact: true,
    role: 'Data & Analytics Consultant (Contract)',
    dates: 'Jun 2026 to Aug 2026',
    oneLine: 'Analytics consultant who built the delivery cost-to-serve model and its monthly pipeline.',
    logo: {
      src: '/radiator-logo.png',
      alt: '1-800 Radiator & A/C logo',
      // 250x72 is the largest badge the brand publishes; kept to 80% so the
      // upscale stays modest until a bigger source lands.
      width: '80%',
    },
  },
  {
    slug: 'ghost-fc',
    company: 'Chicago Ghost FC',
    role: 'Data Analyst',
    dates: 'Jan 2026 to Aug 2026',
    oneLine: "Data analyst who built the club's front-office analytics from the ground up.",
    logo: { src: '/ghost-fc-logo.png', alt: 'Chicago Ghost FC crest', width: '68%' },
  },
];

const N = ROLES.length;
// Everyone joins one body; hmax is its half height at the middle of the gap
// (the card is about 290 tall, so the body stands about 40 percent over it).
const FORMATION = { shape: 'spindle' as const, share: 1, hmax: 205 };
// How far the main network recedes while the stage is pinned (0 to 1).
const CALM = 1;
// How far past a boundary (in role units, 0.5 is the midpoint) the scroll has
// to travel before the step commits. Stops slow scrolling from flickering.
const HYSTERESIS = 0.08;

// One role's copy. All N are mounted in the same grid cell so the card keeps
// the height of the tallest one and the step is a pure slide and fade.
function RoleCopy({ item, state, onOpen, nameRef }: {
  item: Role;
  state: 'past' | 'active' | 'next';
  onOpen: () => void;
  nameRef?: (el: HTMLParagraphElement | null) => void;
}) {
  const active = state === 'active';
  return (
    <motion.div
      role="link"
      tabIndex={active ? 0 : -1}
      aria-hidden={!active}
      inert={!active}
      aria-label={`${item.company}, ${item.role}`}
      initial={false}
      animate={{ opacity: active ? 1 : 0, y: active ? 0 : state === 'past' ? -40 : 40 }}
      transition={{ y: STEP, opacity: { duration: 0.35 } }}
      onClick={onOpen}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
      style={{
        gridArea: '1 / 1',
        alignSelf: 'center',
        cursor: active ? 'pointer' : 'default',
        pointerEvents: active ? 'auto' : 'none',
        outline: 'none',
      }}
    >
      <p ref={nameRef} className="exp-name" style={{
        fontFamily: MONO,
        fontSize: item.compact ? 'clamp(22px, 2.2vw, 32px)' : 'clamp(32px, 3.1vw, 46px)',
        fontWeight: 700,
        letterSpacing: '0.03em',
        lineHeight: 1.05,
        textWrap: 'balance',
        margin: '0 0 18px',
      }}>{item.company}</p>
      <p style={{
        fontFamily: INTER, fontSize: 20, fontWeight: 400,
        color: '#ffffff',
        lineHeight: 1.55, margin: '0 0 28px', maxWidth: 440,
      }}>{item.oneLine}</p>
      <span className="exp-pill" aria-hidden style={{
        display: 'inline-block',
        fontFamily: MONO, fontSize: 12, letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: '#ffffff',
        borderRadius: 999,
        padding: '8px 17px',
      }}>View the role →</span>
    </motion.div>
  );
}

export function ExperienceSection() {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef   = useRef<HTMLDivElement>(null);
  const wallRef    = useRef<HTMLDivElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);
  const markRef    = useRef<HTMLDivElement>(null);
  const nameRefs   = useRef<(HTMLParagraphElement | null)[]>([]);
  // The stage, not the tall section, drives the label and orb reveal so the
  // 002 label stays put while the stage is pinned.
  const orbLabelRef = useOrbReveal(stageRef);
  const [active, setActive] = useState(0);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  // Points at the visible mark so its clear zone hugs the logo's own box
  // (the Radiator badge is a wide bar, the crest a square).
  const activeMarkRef = useRef<HTMLImageElement | null>(null);
  const activeNameRef = useRef<HTMLParagraphElement | null>(null);
  const zoneRef = useRef<HTMLDivElement>(null);

  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const on = () => setMobile(window.innerWidth < 768);
    on();
    window.addEventListener('resize', on, { passive: true });
    return () => window.removeEventListener('resize', on);
  }, []);

  // Desktop: the network itself becomes the body between the card and the
  // mark. Mobile has no gap, so it keeps the quiet room (zone plus calm).
  const measure = (): FormationGeometry | null => {
    const card = cardRef.current, name = activeNameRef.current, mark = activeMarkRef.current, wall = wallRef.current;
    if (!card || !name || !mark || !wall) return null;
    const c = card.getBoundingClientRect(), n = name.getBoundingClientRect(), m = mark.getBoundingClientRect();
    const top = Math.min(c.top, m.top), bottom = Math.max(c.bottom, m.bottom);
    return {
      ax: c.right + 6, ay: n.top + n.height / 2,
      bx: m.left - 14, by: m.top + m.height / 2,
      box: { x: c.left, y: top, w: m.right - c.left, h: bottom - top },
    };
  };
  useFormation(sectionRef, measure, FORMATION, active);
  useClearZone(zoneRef, 0);
  useCalm(stageRef, mobile ? CALM : 0);

  // A pulse runs mark to card after every step and on an idle timer; the
  // card takes the hit when the front lands (.exp-hit, styled below), with a
  // dot on its edge at the height of the company name.
  useEffect(() => {
    if (mobile || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const fire = () => {
      const fo = particleInteraction.formation;
      if (!fo.active) return;
      fo.pulseDir = -1;
      fo.pulseAt = performance.now();
      timers.push(setTimeout(() => {
        const card = cardRef.current, name = activeNameRef.current;
        if (!card || !name) return;
        const c = card.getBoundingClientRect(), n = name.getBoundingClientRect();
        card.style.setProperty('--hit-y', `${n.top + n.height / 2 - c.top}px`);
        card.classList.add('exp-hit');
        timers.push(setTimeout(() => card.classList.remove('exp-hit'), 260));
      }, FORMATION_PULSE_MS * 0.92));
    };
    timers.push(setTimeout(fire, 180));
    const idle = setInterval(fire, 5200);
    return () => {
      timers.forEach(clearTimeout); clearInterval(idle);
      cardRef.current?.classList.remove('exp-hit');
    };
  }, [active, mobile]);

  for (const r of ROLES) preload(r.logo.src, { as: 'image' });

  // Scroll progress through the section picks the role. Stepped: the switch
  // commits only once the scroll is HYSTERESIS past the midpoint.
  useEffect(() => {
    const onScroll = () => {
      const s = sectionRef.current;
      if (!s) return;
      const r = s.getBoundingClientRect();
      const range = r.height - window.innerHeight;
      if (range <= 0) return;
      const p = Math.min(1, Math.max(0, -r.top / range));
      const raw = p * (N - 1);
      setActive(prev => {
        const nearest = Math.round(raw);
        if (nearest === prev) return prev;
        return Math.abs(raw - prev) > 0.5 + HYSTERESIS ? nearest : prev;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToRole = (i: number) => {
    const s = sectionRef.current;
    if (!s) return;
    const top = s.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + i * window.innerHeight, behavior: 'smooth' });
  };

  // The strip's Next: the following role, or on to 003 · PROJECTS after the last.
  const goNext = () => {
    if (active < N - 1) { scrollToRole(active + 1); return; }
    const s = sectionRef.current;
    if (s) window.scrollTo({ top: s.getBoundingClientRect().bottom + window.scrollY, behavior: 'smooth' });
  };

  useLayoutEffect(() => {
    activeMarkRef.current = imgRefs.current[active];
    activeNameRef.current = nameRefs.current[active];
  }, [active]);

  return (
    <section
      ref={sectionRef}
      id="experience"
      style={{ position: 'relative', height: `${N * 100}vh`, zIndex: 1 }}
    >
      <div
        ref={stageRef}
        className="exp-stage"
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <OrbLabel labelRef={orbLabelRef}>002 · EXPERIENCE</OrbLabel>

        <style>{`
          .exp-wall {
            position: relative;
            width: 100%; max-width: 1280px; padding: 0 64px;
            display: grid; grid-template-columns: 39% 1fr; gap: 64px; align-items: center;
          }
          .exp-card {
            border: 1px solid rgba(255,255,255,0.1);
            transition: border-color 0.7s ease;
          }
          .exp-card-body { display: grid; padding: 40px 40px 34px; }
          .exp-name { color: rgba(255,255,255,0.92); transition: color 0.7s ease; }
          .exp-pill { border: 2px solid rgba(255,255,255,0.28); transition: border-color 0.3s ease; }
          .exp-card-body:hover .exp-pill, .exp-card-body :focus-visible .exp-pill { border-color: rgba(255,255,255,0.6); }
          .exp-strip {
            display: flex; justify-content: space-between; align-items: center; gap: 16px;
            border-top: 1px solid rgba(255,255,255,0.08);
            padding: 0 40px;
            font-size: 11px; letter-spacing: 0.24em; text-transform: uppercase;
            color: rgba(255,255,255,0.55);
          }
          .exp-strip span { padding: 15px 0; }
          .exp-strip b { color: #ffffff; font-weight: 700; }
          .exp-next {
            font: inherit; letter-spacing: inherit; text-transform: inherit;
            color: inherit; background: none; border: none; padding: 15px 0;
            cursor: pointer; text-align: right; transition: color 0.2s ease;
          }
          .exp-next:hover, .exp-next:focus-visible { color: #ffffff; outline: none; }
          /* The pulse landing: snaps on, eases back over the transitions above. */
          .exp-hit-dot {
            position: absolute; right: -5px; top: var(--hit-y, 80px);
            width: 9px; height: 9px; margin-top: -4px; border-radius: 50%;
            background: #ffffff; box-shadow: 0 0 14px #ffffff;
            opacity: 0; transition: opacity 0.7s ease; pointer-events: none;
          }
          .exp-hit { border-color: rgba(255,255,255,0.6); transition-duration: 0.1s; }
          .exp-hit .exp-name { color: #ffffff; transition-duration: 0.1s; }
          .exp-hit .exp-pill { border-color: rgba(255,255,255,0.6); transition-duration: 0.1s; }
          .exp-hit .exp-hit-dot { opacity: 1; transition-duration: 0.1s; }
          /* 90px past the content box on every side (the wall pads 64). */
          .exp-zone { display: none; position: absolute; pointer-events: none; }

          @media (max-width: 767px) {
            .exp-wall { display: flex; flex-direction: column; align-items: stretch; padding: 72px 20px 24px; gap: 20px; }
            .exp-mark-cell { order: -1; }
            .exp-mark { width: 100% !important; height: 120px !important; }
            .exp-mark img { width: auto !important; max-width: 70%; }
            .exp-card-body { padding: 28px 24px 24px; }
            .exp-strip { padding: 0 24px; letter-spacing: 0.16em; }
            .exp-zone { display: block; inset: 48px -4px 0 -4px; }
            .exp-hit-dot { display: none; }
          }
        `}</style>

        <div ref={wallRef} className="exp-wall">
          {/* Text card: opaque card black so the copy never sits on the network */}
          <motion.div
            ref={cardRef}
            className="exp-card"
            animate={{ y: [0, -7, -2, -9, 0], x: [0, 2, -1, 2, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'relative',
              background: SURFACE,
              borderRadius: 14,
              boxShadow: SHADOW,
            }}
          >
            <div className="exp-card-body">
              {ROLES.map((r, i) => (
                <RoleCopy
                  key={r.slug}
                  item={r}
                  state={i === active ? 'active' : i < active ? 'past' : 'next'}
                  onOpen={() => router.push(`/experience/${r.slug}`)}
                  nameRef={el => { nameRefs.current[i] = el; }}
                />
              ))}
            </div>

            {/* Strip: where you are, and what scrolling brings next */}
            <div className="exp-strip" style={{ fontFamily: MONO }}>
              <span><b>{String(active + 1).padStart(2, '0')}</b> / {String(N).padStart(2, '0')}</span>
              <button type="button" className="exp-next" onClick={goNext}>
                Next: {active < N - 1 ? ROLES[active + 1].company : 'Projects'} ↓
              </button>
            </div>
            <span className="exp-hit-dot" aria-hidden />
          </motion.div>

          {/* Stage zone (mobile only, display none on desktop): one empty box
              around the content that publishes the clear zone. */}
          <div ref={zoneRef} className="exp-zone" aria-hidden />

          {/* Mark: the logo as its own object and the network's gravity anchor */}
          <div className="exp-mark-cell">
            <motion.div
              ref={markRef}
              className="exp-mark"
              animate={{ y: [0, -6, -12, -4, 0], x: [0, -3, 1, -2, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'relative',
                width: 'min(100%, 390px)',
                height: 320,
                marginLeft: 'auto',
              }}
            >
              {ROLES.map((r, i) => (
                <motion.div
                  key={r.slug}
                  aria-hidden={i !== active}
                  initial={false}
                  animate={{ opacity: i === active ? 1 : 0, scale: i === active ? 1 : 0.8 }}
                  transition={{ scale: STEP, opacity: { duration: 0.35 } }}
                  style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <img
                    ref={el => { imgRefs.current[i] = el; }}
                    src={r.logo.src}
                    alt={r.logo.alt}
                    draggable={false}
                    style={{
                      width: r.logo.width, maxHeight: '100%', objectFit: 'contain',
                      display: 'block', ...r.logo.style,
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
