'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { MONO } from '@/lib/fonts';
import { preload } from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useOrbReveal, OrbLabel } from '@/lib/use-orb-reveal';
import { useGravityAnchor, useClearZone } from '@/lib/use-particle-anchor';

// 002 · EXPERIENCE, the pinned stage (Sep 18 2026).
//
// The section is N screens tall and a full-height stage sticks to the top
// of the viewport for the whole run. Scroll progress picks the active role
// (stepped, with hysteresis). One role is visible at a time: an opaque text
// card on the left, a logo plate on the right, and a hairline tether that
// redraws between them on every step. Both surfaces are solid card black;
// the plate is the particle network's gravity anchor and the card publishes
// a clearing zone. No text shadows, no scrims. Click or Enter opens the role.

const INTER = 'Inter, ui-rounded, system-ui, sans-serif';
const SURFACE = '#0d0d0d';
const FRAME = '1px solid rgba(255,255,255,0.08)';
const SHADOW = '0 34px 70px -18px rgba(0,0,0,0.6)';
const STEP = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

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
  // Large mark on the plate. `width` is the share of the plate it fills.
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
    logo: { src: '/bts-logo-white.svg', alt: 'BTS logo', width: '54%' },
  },
  {
    // Tag: Python · Excel · Qlik. Location: Chicago, IL (Remote).
    slug: 'radiator',
    company: '1‑800 Radiator & A/C',
    compact: true,
    role: 'Data & Analytics Consultant (Contract)',
    dates: 'Jun 2026 to Aug 2026',
    oneLine: 'Built a four-warehouse delivery cost-to-serve model and the monthly pipeline that keeps it running.',
    // The only logo the brand publishes is a red badge; grayscale keeps the
    // home page hue-free. 250x72 source, so it sits wide on the plate.
    logo: {
      src: '/radiator-logo.png',
      alt: '1-800 Radiator & A/C logo',
      width: '66%',
      style: { filter: 'grayscale(1) brightness(1.35) contrast(1.1)' },
    },
  },
  {
    slug: 'ghost-fc',
    company: 'Chicago Ghost FC',
    role: 'Data Analyst',
    dates: 'Jan 2026 to Aug 2026',
    oneLine: "Built the club's front-office analytics from the ground up: sponsorship prospecting, social pipelines, match-day KPIs.",
    logo: { src: '/ghost-fc-logo.png', alt: 'Chicago Ghost FC crest', width: '50%' },
  },
];

const N = ROLES.length;
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
      transition={STEP}
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
  const plateRef   = useRef<HTMLDivElement>(null);
  const nameRefs   = useRef<(HTMLParagraphElement | null)[]>([]);
  // The stage, not the tall section, drives the label and orb reveal so the
  // 002 label stays put while the stage is pinned.
  const orbLabelRef = useOrbReveal(stageRef);
  const [active, setActive] = useState(0);
  const [tether, setTether] = useState({ left: 0, top: 0, width: 0 });

  useGravityAnchor(plateRef);
  useClearZone(cardRef, 40);

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

  // The tether runs from the card's right edge, at the height of the active
  // company name, to the plate's left edge. Measured from the real boxes so
  // it stays attached at any width.
  const measureTether = useCallback(() => {
    const wall = wallRef.current, card = cardRef.current, plate = plateRef.current;
    const name = nameRefs.current[active];
    if (!wall || !card || !plate || !name) return;
    const w = wall.getBoundingClientRect();
    const c = card.getBoundingClientRect();
    const pl = plate.getBoundingClientRect();
    const n = name.getBoundingClientRect();
    setTether({
      left: c.right - w.left,
      top: n.top + n.height / 2 - w.top,
      width: Math.max(0, pl.left - c.right),
    });
  }, [active]);

  useLayoutEffect(() => {
    measureTether();
    window.addEventListener('resize', measureTether);
    return () => window.removeEventListener('resize', measureTether);
  }, [measureTether]);

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
            width: 100%; max-width: 1100px; padding: 0 64px;
            display: grid; grid-template-columns: 52% 1fr; gap: 64px; align-items: center;
          }
          .exp-card { padding: 40px 40px 40px 56px; }
          @media (max-width: 767px) {
            .exp-wall { display: flex; flex-direction: column; align-items: stretch; padding: 72px 20px 24px; gap: 20px; }
            .exp-panel-cell { order: -1; }
            .exp-panel {
              width: 100% !important; aspect-ratio: 16 / 7 !important; max-height: 180px;
            }
            .exp-card { padding: 28px 24px !important; }
            .exp-rail, .exp-tether, .exp-row-arrow { display: none !important; }
          }
        `}</style>

        <div ref={wallRef} className="exp-wall">
          {/* Text card: opaque card black so the copy never sits on the network */}
          <div
            ref={cardRef}
            className="exp-card"
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
          </div>

          {/* Tether: redraws from the card to the plate on every step */}
          <motion.div
            key={active}
            className="exp-tether"
            aria-hidden
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              left: tether.left,
              top: tether.top,
              width: tether.width,
              height: 1,
              background: 'rgba(255,255,255,0.18)',
              transformOrigin: 'left center',
              pointerEvents: 'none',
            }}
          >
            <span style={{
              position: 'absolute', right: -1.5, top: -1.5,
              width: 4, height: 4, borderRadius: '50%',
              background: 'rgba(255,255,255,0.6)',
            }} />
          </motion.div>

          {/* Logo plate: the network's gravity anchor */}
          <div className="exp-panel-cell">
            <div
              ref={plateRef}
              className="exp-panel"
              style={{
                position: 'relative',
                width: 'min(100%, calc(70vh * 0.75))',
                aspectRatio: '3 / 4',
                marginLeft: 'auto',
                borderRadius: 14,
                overflow: 'hidden',
                background: SURFACE,
                border: FRAME,
                boxShadow: SHADOW,
              }}
            >
              {ROLES.map((r, i) => (
                <motion.div
                  key={r.slug}
                  aria-hidden={i !== active}
                  initial={false}
                  animate={{ opacity: i === active ? 1 : 0, scale: i === active ? 1 : 1.03 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <img
                    src={r.logo.src}
                    alt={r.logo.alt}
                    draggable={false}
                    style={{
                      width: r.logo.width, maxHeight: '60%', objectFit: 'contain',
                      opacity: 0.92, display: 'block', ...r.logo.style,
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
