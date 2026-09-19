'use client';

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { MONO } from '@/lib/fonts';
import { preload } from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion, useAnimationControls } from 'framer-motion';
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
// runs card to mark through the particles, landing as a bump on the logo.
// Leaving the section releases it as a blast back into the ambient flow.
// Card and mark float on slow loops like the Contact cards and steps land on
// a spring. Mobile has no gap, so it keeps the quiet room: one clear zone
// around the content plus useCalm. No text shadows, no scrims.
// Brand color inside logo marks is the one hue allowed on the home page.
// Click or Enter opens the role.

const INTER = 'Inter, ui-rounded, system-ui, sans-serif';
const SURFACE = '#0d0d0d';
const FRAME = '1px solid rgba(255,255,255,0.08)';
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
  // Long company names drop to a smaller mono size so the card stays two
  // lines at most instead of towering over the copy.
  compact?: boolean;
};

const ROLES: Role[] = [
  {
    // Tag: Excel · Python · Claude. Location: Chicago, IL (Hybrid).
    slug: 'bts',
    company: 'BTS',
    role: 'Business Analyst, Strategy and Business Modeling',
    dates: 'Sep 2026 to Present',
    oneLine: 'Building business simulations and the AI tools inside them for leadership teams at large companies.',
    logo: { src: '/bts-logo-color.svg', alt: 'BTS logo', width: '88%' },
  },
  {
    // Tag: Python · Excel · Qlik. Location: Chicago, IL (Remote).
    slug: 'radiator',
    company: '1‑800 Radiator & A/C',
    compact: true,
    role: 'Data & Analytics Consultant (Contract)',
    dates: 'Jun 2026 to Aug 2026',
    oneLine: 'Built a four-warehouse delivery cost-to-serve model and the monthly pipeline that keeps it running.',
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
    oneLine: "Built the club's front-office analytics from the ground up: sponsorship prospecting, social pipelines, match-day KPIs.",
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
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        gap: 32,
        cursor: active ? 'pointer' : 'default',
        pointerEvents: active ? 'auto' : 'none',
        outline: 'none',
      }}
    >
      <div>
        <p ref={nameRef} style={{
          fontFamily: MONO,
          fontSize: item.compact ? 'clamp(20px, 2vw, 30px)' : 'clamp(26px, 2.6vw, 38px)',
          fontWeight: 700,
          letterSpacing: '0.04em',
          lineHeight: 1,
          color: '#ffffff',
          margin: 0,
        }}>{item.company}</p>
        <p style={{
          fontFamily: MONO, fontSize: 11, letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)',
          margin: '12px 0 8px',
        }}>{item.role} · {item.dates}</p>
        <p style={{
          fontFamily: INTER, fontSize: 17, fontWeight: 300,
          color: 'rgba(255,255,255,0.88)',
          lineHeight: 1.65, margin: 0, maxWidth: 460,
        }}>{item.oneLine}</p>
      </div>

      <span
        className="exp-row-arrow"
        aria-hidden
        style={{
          fontFamily: INTER,
          fontSize: 22,
          lineHeight: 1,
          color: '#ffffff',
          display: 'inline-block',
        }}
      >
        →
      </span>
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
  const kick = useAnimationControls();
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

  // A pulse runs card to mark after every step and on an idle timer; the
  // mark takes the hit when the front lands.
  useEffect(() => {
    if (mobile || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const fire = () => {
      if (!particleInteraction.formation.active) return;
      particleInteraction.formation.pulseAt = performance.now();
      timers.push(setTimeout(() => {
        kick.start({ scale: [1, 1.07, 0.98, 1], transition: { duration: 0.55, ease: 'easeOut' } });
      }, FORMATION_PULSE_MS * 0.92));
    };
    timers.push(setTimeout(fire, 180));
    const idle = setInterval(fire, 5200);
    return () => { timers.forEach(clearTimeout); clearInterval(idle); };
  }, [active, mobile, kick]);

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
          .exp-card { padding: 40px 40px 40px 56px; }
          /* 90px past the content box on every side (the wall pads 64). */
          .exp-zone { display: none; position: absolute; pointer-events: none; }

          @media (max-width: 767px) {
            .exp-wall { display: flex; flex-direction: column; align-items: stretch; padding: 72px 20px 24px; gap: 20px; }
            .exp-mark-cell { order: -1; }
            .exp-mark { width: 100% !important; height: 120px !important; }
            .exp-mark img { width: auto !important; max-width: 70%; }
            .exp-card { padding: 28px 24px !important; }
            .exp-zone { display: block; inset: 48px -4px 0 -4px; }
            .exp-rail, .exp-row-arrow { display: none !important; }
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
              border: FRAME,
              boxShadow: SHADOW,
            }}
          >
            {/* Rail: one tick per role, the active one is the tall bar */}
            <div className="exp-rail" aria-label="Roles" style={{
              position: 'absolute', left: 24, top: 0, bottom: 0,
              display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10,
            }}>
              {ROLES.map((r, i) => (
                <button
                  key={r.slug}
                  type="button"
                  aria-label={`Go to ${r.company}`}
                  aria-current={i === active ? 'true' : undefined}
                  onClick={() => scrollToRole(i)}
                  style={{
                    width: 3,
                    height: i === active ? 64 : 10,
                    padding: 0,
                    border: 'none',
                    borderRadius: 2,
                    background: i === active ? '#ffffff' : 'rgba(255,255,255,0.35)',
                    cursor: 'pointer',
                    transition: 'height 0.4s ease, background 0.3s ease',
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'grid' }}>
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
                  <motion.div animate={i === active ? kick : undefined} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
