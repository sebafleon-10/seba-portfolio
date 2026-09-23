'use client';

import { useEffect, useRef, useState } from 'react';
import { MONO } from '@/lib/fonts';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { particleInteraction } from '@/lib/particle-state';
import { useOrbReveal, OrbLabel } from '@/lib/use-orb-reveal';
import { useFormation, ownsFormation, type FormationGeometry } from '@/lib/use-particle-anchor';

// Array order = left-to-right order in the fan (lower index sits further left).
// `id` is a stable identity used by cardRoutes and the per-card image/style
// blocks, so cards can be reordered here without touching routes or visuals.
const cards = [
  {
    id: 3,
    title: 'Front Office',
    tag: 'Next.js · Causal Model · Claude AI',
    desc: 'Interactive sim for running a lower-league soccer club for a season',
  },
  {
    id: 0,
    title: 'American Airlines',
    tag: 'NLP · Sentiment · Strategy',
    desc: "RoBERTa sentiment pipeline across 627K Reddit posts",
  },
  {
    id: 2,
    title: 'Remote Work & the Gender Wage Gap',
    tag: 'Regression · IPUMS · Labor Economics',
    desc: 'Triple-interaction OLS model on IPUMS CPS data',
  },
];

// Keyed by card id, not fan position. Ghost FC (id 1) moved to the
// Experience section on Sep 13 2026 and lives at /experience/ghost-fc.
const cardRoutes: Record<number, string> = {
  0: '/work/american-airlines',
  2: '/work/remote-work',
  3: '/work/front-office',
};

// The fan is a wheel: every card is a spoke turned FAN_TILT degrees per
// place about a pivot HUB px below its center, so the bottom edges of all
// the cards stand on one circle. On desktop the network lies along that
// circle as a curved horizon just under the cards (ARC_GAP), and turns with
// the fan. Both read these constants, so they can never drift apart.
const CARD_W = 612;
const CARD_H = 370;
const FAN_TILT = 14;
const HUB = 1000;
const ACTIVE_SCALE = 1.03;
const SIDE_SCALE = 0.92;
// Room under the cards for the horizon, inside the fan box.
const ARC_GAP = 46;
const FAN_H = CARD_H + ARC_GAP + 70;
// Horizon: distance below the card bottoms, half-thickness, and how far it
// turns per card (a fraction of the fan's own tilt, so its ends stay on screen).
const ARC_DROP = 16;
const ARC_HMAX = 14;
const RIM_LEAN = 0.4;
const DEG = Math.PI / 180;

export function WorkSection() {
  const [active, setActive] = useState(1);
  const [activeHovered, setActiveHovered] = useState(false);
  const router = useRouter();
  const activeCardRef = useRef<HTMLDivElement>(null);
  const sectionRef    = useRef<HTMLElement>(null);
  const fanRef        = useRef<HTMLDivElement>(null);

  // The active card's bottom center, from the static fan container (the
  // cards themselves are mid-spring and their boxes inflate as they turn).
  const activeBase = () => {
    const f = fanRef.current?.getBoundingClientRect();
    return f ? { x: f.left + f.width / 2, y: f.bottom - ARC_GAP } : null;
  };

  // The small globe forms right under the active card, where the horizon
  // will run, then spreads out into it (no blast).
  const orbLabelRef = useOrbReveal(sectionRef, {
    handoff: 'projects',
    center: () => {
      const c = activeBase();
      if (!c || window.innerWidth < 768) return null;
      const vh = window.innerHeight;
      const r = Math.min(window.innerWidth, vh) * 0.07;
      return { x: c.x, y: Math.max(r + 90, Math.min(vh - r - 20, c.y + ARC_DROP)), r };
    },
  });

  // Desktop: the network is a curved horizon under the fan. Flat cards on a
  // circle only touch it at their midpoints, so the horizon follows the fan's
  // real outline instead: the circle through the bottom of the active card
  // and the outer bottom corners of the cards beside it, ARC_DROP lower,
  // carried a little past those corners and clipped to stay on screen.
  const measureRim = (): FormationGeometry | null => {
    const c = activeBase();
    if (!c) return null;
    const W = window.innerWidth, H = window.innerHeight;
    // Outer bottom corner of a neighbour: its bottom center sits on the
    // wheel (HUB - CARD_H / 2 from the pivot) one tilt round, the corner
    // half a (side-scaled) card further along its bottom edge.
    const t = FAN_TILT * DEG, wheel = HUB - CARD_H / 2, halfW = (CARD_W * SIDE_SCALE) / 2;
    const dx = wheel * Math.sin(t) + halfW * Math.cos(t);
    const sag = wheel * (1 - Math.cos(t)) + halfW * Math.sin(t);
    const R = (dx * dx + sag * sag) / (2 * sag);
    // While the fan is still low on screen the horizon waits at the bottom
    // edge, and the cards scroll up onto it.
    const top = Math.min(c.y + ARC_DROP, H - 70);
    const cx = c.x, cy = top + R;
    const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));
    const reach = Math.asin(clamp1(dx / R)) * 1.18;
    const yLim = Math.acos(clamp1((cy - (H - 30)) / R));
    const a1 = Math.min(reach, Math.asin(clamp1((W - 50 - cx) / R)), yLim);
    const a0 = -Math.min(reach, Math.asin(clamp1((cx - 50) / R)), yLim);
    return {
      cx, cy, R, a0, a1,
      ax: cx + R * Math.sin(a0), ay: cy - R * Math.cos(a0),
      bx: cx + R * Math.sin(a1), by: cy - R * Math.cos(a1),
    };
  };
  useFormation(sectionRef, measureRim, {
    id: 'projects', shape: 'rim', share: 1, hmax: ARC_HMAX, gate: 'line', handoff: true,
    lean: (1 - active) * RIM_LEAN * FAN_TILT * DEG,
  }, active);

  // A switch sends a front along the horizon the way the cards moved (next card:
  // right to left).
  const prevActive = useRef(active);
  useEffect(() => {
    const was = prevActive.current;
    prevActive.current = active;
    if (was === active || !ownsFormation('projects')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const fo = particleInteraction.formation;
    fo.pulseDir = active > was ? -1 : 1;
    fo.pulseAt = performance.now();
  }, [active]);

  const canGoPrev = active > 0;
  const canGoNext = active < cards.length - 1;
  const prev = () => setActive(a => a - 1);
  const next = () => setActive(a => a + 1);

  // Clear the active-card hover flag whenever the active card changes,
  // so the new front card starts in its base state until the user re-enters.
  useEffect(() => { setActiveHovered(false); }, [active]);

  useEffect(() => {
    let raf: number;
    let wasInView = false;
    const loop = () => {
      const el = activeCardRef.current;
      if (el) {
        const r      = el.getBoundingClientRect();
        const inView = r.bottom > 0 && r.top < window.innerHeight;
        if (inView) {
          if (!particleInteraction.gravityBoost) {
            particleInteraction.gravityTarget.active = true;
            particleInteraction.gravityTarget.x = r.left + r.width  / 2;
            particleInteraction.gravityTarget.y = r.top  + r.height / 2;
          }
          wasInView = true;
        } else if (wasInView) {
          particleInteraction.gravityTarget.active = false;
          wasInView = false;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      particleInteraction.gravityTarget.active = false;
    };
  }, [active]);

  return (
    <section
      ref={sectionRef}
      id="work"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
      }}
    >
      <OrbLabel labelRef={orbLabelRef}>003 · PROJECTS</OrbLabel>

      {/* Left Arrow */}
      <button
        onClick={prev}
        disabled={!canGoPrev}
        style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', zIndex: 200 }}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Previous"
      >
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Right Arrow */}
      <button
        onClick={next}
        disabled={!canGoNext}
        style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', zIndex: 200 }}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Next"
      >
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
          <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Outer wrapper */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>

        {/* Stack row with arrow buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>

          {/* Card fan */}
          <div ref={fanRef} style={{
            perspective: '960px',
            position: 'relative',
            height: FAN_H,
            width: CARD_W,
          }}>
            {cards.map((card, i) => {
              const off      = i - active;
              const isActive = off === 0;
              const rotateZ  = off * FAN_TILT;
              const scale    = isActive ? ACTIVE_SCALE : SIDE_SCALE;
              const rotateX  = isActive ? 0 : 12;

              return (
                // The spoke: turns about the wheel's pivot, HUB below the
                // card center, so every card's bottom edge stands on the
                // same circle (the network's horizon runs just under it).
                <motion.div
                  key={card.id}
                  animate={{ rotateZ }}
                  transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                  style={{
                    position: 'absolute',
                    bottom: ARC_GAP,
                    left: 0,
                    width: CARD_W,
                    height: CARD_H,
                    transformOrigin: `50% ${CARD_H / 2 + HUB}px`,
                    transformStyle: 'preserve-3d',
                    zIndex: 100 - Math.abs(off),
                  }}
                >
                <motion.div
                  ref={isActive ? activeCardRef : undefined}
                  onClick={() => isActive ? router.push(cardRoutes[card.id]) : setActive(i)}
                  onMouseEnter={isActive ? () => setActiveHovered(true)  : undefined}
                  onMouseLeave={isActive ? () => setActiveHovered(false) : undefined}
                  animate={{ rotateX, scale, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    // Scale and lean about the bottom edge, so a card never
                    // lifts off the horizon.
                    transformOrigin: '50% 100%',
                    background: card.id === 2 ? '#f8f8f8' : '#1a1a1a',
                    boxShadow: '0 22px 52px rgba(0,0,0,0.65)',
                    borderRadius: 14,
                    transformStyle: 'preserve-3d',
                    cursor: 'pointer',
                    overflow: 'hidden',
                  }}
                >
                  {/* AA card image */}
                  {card.id === 0 && (
                    <img
                      src="/aa-capstone.jpg"
                      alt="American Airlines"
                      draggable={false}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover', objectPosition: 'center top',
                        display: 'block',
                      }}
                    />
                  )}

                  {/* Front Office card image, dashboard cover on dark bg */}
                  {card.id === 3 && (
                    <img
                      src="/front-office.png"
                      alt="Front Office command center"
                      draggable={false}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover', objectPosition: 'center top',
                        display: 'block',
                      }}
                    />
                  )}

                  {/* Regression card image, light bg, no dark overlay */}
                  {card.id === 2 && (
                    <img
                      src="/regression.jpg"
                      alt="Regression analysis"
                      draggable={false}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover', objectPosition: 'center top',
                        display: 'block',
                      }}
                    />
                  )}

                  {/* Gradient overlay */}
                  {card.id === 2 ? (
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
                  ) : (
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  )}

                  {/* Text overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '104px 32px 32px',
                    zIndex: 1,
                  }}>
                    <h2 style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: card.id === 2 ? '#111' : '#ffffff',
                      lineHeight: 1.1,
                      fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
                      margin: '0 0 10px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>{card.title}</h2>

                    <p style={{
                      fontSize: 14,
                      color: card.id === 2 ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)',
                      lineHeight: 1.6,
                      fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
                      fontWeight: 400,
                      maxWidth: '80%',
                      margin: 0,
                      WebkitLineClamp: 1,
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>{card.desc}</p>
                  </div>

                  {/* VIEW PROJECT label, active card only.
                      Frosted pill (matches the work detail back-button chrome)
                      keeps the label legible over any image. Light variant for
                      the light regression card, dark variant for the rest.
                      Base opacity is already high; card hover bumps to full. */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        position: 'absolute',
                        top: 14,
                        right: 14,
                        fontFamily: MONO,
                        fontSize: 10,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: activeHovered
                          ? (card.id === 2 ? '#000000' : '#ffffff')
                          : (card.id === 2 ? 'rgba(0,0,0,0.88)' : 'rgba(255,255,255,0.92)'),
                        background: card.id === 2
                          ? `rgba(255,255,255,${activeHovered ? 0.78 : 0.6})`
                          : `rgba(0,0,0,${activeHovered ? 0.55 : 0.4})`,
                        border: card.id === 2
                          ? `2px solid rgba(0,0,0,${activeHovered ? 0.28 : 0.14})`
                          : `2px solid rgba(255,255,255,${activeHovered ? 0.5 : 0.28})`,
                        borderRadius: 999,
                        padding: '5px 11px',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        textShadow: card.id === 2
                          ? '0 1px 0 rgba(255,255,255,0.45)'
                          : '0 1px 2px rgba(0,0,0,0.45)',
                        transition: 'color 220ms ease, background 220ms ease, border-color 220ms ease',
                        pointerEvents: 'none',
                        zIndex: 11,
                      }}
                    >
                      View Work →
                    </motion.div>
                  )}

                  {/* Border overlay */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 14,
                    border: '5px solid rgba(255,255,255,0.12)',
                    pointerEvents: 'none',
                    zIndex: 10,
                  }} />
                </motion.div>
                </motion.div>
              );
            })}
          </div>

        </div>

        {/* Dot navigation */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                width:        i === active ? 24 : 8,
                height:       8,
                borderRadius: i === active ? 4 : '50%',
                border:       'none',
                padding:      0,
                background:   i === active ? '#ffffff' : 'rgba(255,255,255,0.3)',
                cursor:       'pointer',
                transition:   'all 0.3s ease',
              }}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
