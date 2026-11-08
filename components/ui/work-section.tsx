'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { MONO } from '@/lib/fonts';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
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
  {
    id: 4,
    title: 'P2P Default Risk',
    tag: 'XGBoost · Credit Risk · Python',
    desc: "Picking better loans than LendingClub's own grade",
  },
  {
    id: 5,
    title: 'Marketing Targeting',
    tag: 'Logistic · Off-policy eval · Python',
    desc: 'Three campaigns, three bets, and a model that graded its own homework',
  },
  {
    id: 6,
    title: 'House Prices',
    tag: 'Lasso · Data audit · Python',
    desc: 'Half the prices were fake; on the real ones, priced within 5.5%',
  },
];

// Keyed by card id, not fan position. Ghost FC (id 1) moved to the
// Experience section on Sep 13 2026 and lives at /experience/ghost-fc.
const cardRoutes: Record<number, string> = {
  0: '/work/american-airlines',
  2: '/work/remote-work',
  3: '/work/front-office',
  4: '/work/p2p-lending',
  5: '/work/marketing-targeting',
  6: '/work/house-prices',
};

// The fan is a wheel: every card is a spoke turned FAN_TILT degrees per
// place about a pivot HUB px below its center, so the bottom edges of all
// the cards stand on one circle. On desktop the network lies along that
// circle as a curved horizon just under the cards (ARC_GAP), and turns with
// the fan. Both read these constants, so they can never drift apart.
const DEG = Math.PI / 180;
const ACTIVE_SCALE = 1.03;
const SIDE_SCALE = 0.92;

type FanDims = {
  phone: boolean;
  cardW: number; cardH: number;
  tilt: number;   // degrees per place
  hub: number;    // pivot distance below the card center
  arcGap: number; // room under the cards for the horizon, inside the fan box
  arcDrop: number; // horizon distance below the card bottoms
  arcHmax: number; // horizon half-thickness
  edge: number;   // how close the horizon runs to the screen sides
};
const DESKTOP: FanDims = {
  phone: false, cardW: 672, cardH: 406, tilt: 14, hub: 1000,
  arcGap: 46, arcDrop: 70, arcHmax: 20, edge: 50,
};
// Phones: the same wheel with one card across the screen. The pivot is set so
// each neighbour shows PEEK px of itself at the screen edge, enough to read as
// "more this way" and to take a tap.
const PEEK = 44;
const PHONE_TILT = 17;
function fanDims(vw: number): FanDims {
  if (vw >= 768) return DESKTOP;
  const cardW = Math.min(340, vw - 44);
  const cardH = Math.round(cardW * 0.72);
  const t = PHONE_TILT * DEG;
  const reach = vw / 2 - PEEK + (cardW * SIDE_SCALE / 2) * Math.cos(t);
  return {
    phone: true, cardW, cardH, tilt: PHONE_TILT,
    hub: Math.round(reach / Math.sin(t) + cardH / 2),
    arcGap: 34, arcDrop: 54, arcHmax: 11, edge: 6,
  };
}
const subscribeResize = (cb: () => void) => {
  window.addEventListener('resize', cb);
  return () => window.removeEventListener('resize', cb);
};

// The fan is a loop: `pos` counts steps without bound, and the fan shows
// three slots, pos - 1, pos and pos + 1, each holding card (slot mod n). So
// there is always a card on both sides and never an end. A slot leaving the
// fan keeps turning past the edge and fades (two places round), and the one coming
// in swings in from the other side, so a card never crosses the middle.
const SLOTS = [-1, 0, 1];
const wrap = (i: number) => ((i % cards.length) + cards.length) % cards.length;
const spokeVariants = {
  enter: (turn: number) => ({ rotateZ: turn, opacity: 0 }),
  exit:  (turn: number) => ({ rotateZ: -turn, opacity: 0 }),
};

export function WorkSection() {
  const vw = useSyncExternalStore(subscribeResize, () => window.innerWidth, () => 1440);
  const d = fanDims(vw);
  const { phone, cardW: CARD_W, cardH: CARD_H, tilt: FAN_TILT, hub: HUB, arcGap: ARC_GAP, arcDrop: ARC_DROP } = d;
  const FAN_H = CARD_H + ARC_GAP + (phone ? 56 : 70);
  const [pos, setPos] = useState(1);
  const active = wrap(pos);
  // Which way the last step went: 1 next (cards move left), -1 previous.
  const [dir, setDir] = useState(1);
  const [activeHovered, setActiveHovered] = useState(false);
  const [hoveredSide, setHoveredSide] = useState<number | null>(null);
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
      if (!c) return null;
      const vh = window.innerHeight;
      const r = Math.min(window.innerWidth, vh) * 0.07;
      return { x: c.x, y: Math.max(r + 90, Math.min(vh - r - 20, c.y + ARC_DROP)), r };
    },
  });

  // Desktop: the network is a curved horizon under the fan. Flat cards on a
  // circle only touch it at their midpoints, so the horizon follows the fan's
  // real outline instead: the circle through the bottom of the active card
  // and the outer bottom corners of the cards beside it, ARC_DROP lower,
  // carried out toward the screen edges and clipped to stay on screen.
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
    const yLim = Math.acos(clamp1((cy - (H - 30)) / R));
    const a1 = Math.min(Math.asin(clamp1((W - d.edge - cx) / R)), yLim);
    const a0 = -Math.min(Math.asin(clamp1((cx - d.edge) / R)), yLim);
    return {
      cx, cy, R, a0, a1,
      ax: cx + R * Math.sin(a0), ay: cy - R * Math.cos(a0),
      bx: cx + R * Math.sin(a1), by: cy - R * Math.cos(a1),
    };
  };
  useFormation(sectionRef, measureRim, {
    id: 'projects', shape: 'rim', share: 1, hmax: d.arcHmax, gate: 'line', handoff: true, phones: true,
    // The loop keeps the fan symmetric, so the horizon never leans.
    lean: 0,
  }, pos);

  // A switch sends a front along the horizon the way the cards moved (next card:
  // right to left).
  const prevPos = useRef(pos);
  useEffect(() => {
    const was = prevPos.current;
    prevPos.current = pos;
    if (was === pos || !ownsFormation('projects')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const fo = particleInteraction.formation;
    fo.pulseDir = pos > was ? -1 : 1;
    fo.pulseAt = performance.now();
  }, [pos]);

  const step = (by: number) => { setDir(Math.sign(by)); setPos(p => p + by); };
  // A sideways swipe turns the wheel one place. The fan tracks the pointer
  // itself: a press that travelled is a drag, and the click that follows it is
  // swallowed in the capture phase so a swipe never opens a project.
  const press = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  const onPressStart = (e: React.PointerEvent) => {
    press.current = { x: e.clientX, y: e.clientY };
    dragged.current = false;
  };
  const onPressEnd = (e: React.PointerEvent) => {
    const from = press.current;
    press.current = null;
    if (!from) return;
    const x = e.clientX - from.x, y = e.clientY - from.y;
    if (Math.hypot(x, y) > 10) dragged.current = true;
    if (Math.abs(x) >= 36 && Math.abs(x) > Math.abs(y) * 1.2) step(x < 0 ? 1 : -1);
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (!dragged.current) return;
    dragged.current = false;
    e.stopPropagation();
    e.preventDefault();
  };
  const prev = () => step(-1);
  const next = () => step(1);
  // Dots jump the short way round the loop.
  const goTo = (i: number) => {
    const n = cards.length;
    let d = ((i - active) % n + n) % n;
    if (d > n / 2) d -= n;
    if (d) step(d);
  };

  // Clear the active-card hover flag whenever the active card changes,
  // so the new front card starts in its base state until the user re-enters.
  useEffect(() => { setActiveHovered(false); }, [pos]);

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
        // The fan sits high so the horizon has the lower part of the screen
        // to spread across.
        paddingBottom: phone ? '4vh' : '22vh',
        overflowX: 'clip',
        boxSizing: 'border-box',
        zIndex: 1,
      }}
    >
      <OrbLabel labelRef={orbLabelRef}>003 · PROJECTS</OrbLabel>

      {/* Left Arrow */}
      <button
        onClick={prev}
        style={{ display: phone ? 'none' : undefined, position: 'absolute', left: 24, top: 'calc(50% - 11vh)', transform: 'translateY(-50%)', zIndex: 200 }}
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
        style={{ display: phone ? 'none' : undefined, position: 'absolute', right: 24, top: 'calc(50% - 11vh)', transform: 'translateY(-50%)', zIndex: 200 }}
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
          <div ref={fanRef} onPointerDown={onPressStart} onPointerUp={onPressEnd} onPointerCancel={() => { press.current = null; }} onClickCapture={onClickCapture} style={{
            touchAction: 'pan-y',
            perspective: '960px',
            position: 'relative',
            height: FAN_H,
            width: CARD_W,
          }}>
            <AnimatePresence initial={false} custom={dir * FAN_TILT * 2}>
            {SLOTS.map((off) => {
              const slot     = pos + off;
              const card     = cards[wrap(slot)];
              const isActive = off === 0;
              const rotateZ  = off * FAN_TILT;
              const sideHover = !isActive && hoveredSide === slot;
              const scale    = isActive ? ACTIVE_SCALE : sideHover ? SIDE_SCALE + 0.03 : SIDE_SCALE;
              const rotateX  = isActive ? 0 : sideHover ? 4 : 12;
              const filter   = isActive || sideHover ? 'brightness(1)' : 'brightness(0.72)';

              return (
                // The spoke: turns about the wheel's pivot, HUB below the
                // card center, so every card's bottom edge stands on the
                // same circle (the network's horizon runs just under it).
                // It also takes the pointer: the card inside leans back in
                // 3D, so hit tests land on this flat plane in front of it.
                <motion.div
                  key={slot}
                  role="button"
                  tabIndex={0}
                  aria-label={isActive ? `Open ${card.title}` : `Show ${card.title}`}
                  onClick={() => isActive ? router.push(cardRoutes[card.id]) : step(off)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (isActive) router.push(cardRoutes[card.id]); else step(off); } }}
                  onMouseEnter={() => isActive ? setActiveHovered(true) : setHoveredSide(slot)}
                  onMouseLeave={() => isActive ? setActiveHovered(false) : setHoveredSide(null)}
                  custom={dir * FAN_TILT * 2}
                  variants={spokeVariants}
                  initial="enter"
                  animate={{ rotateZ, opacity: 1 }}
                  exit="exit"
                  transition={{
                    rotateZ: { type: 'spring', stiffness: 280, damping: 28 },
                    opacity: { duration: 0.3, ease: 'easeOut' },
                  }}
                  style={{
                    position: 'absolute',
                    bottom: ARC_GAP,
                    left: 0,
                    width: CARD_W,
                    height: CARD_H,
                    transformOrigin: `50% ${CARD_H / 2 + HUB}px`,
                    transformStyle: 'preserve-3d',
                    zIndex: 100 - Math.abs(off),
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                <motion.div
                  ref={isActive ? activeCardRef : undefined}
                  animate={{ rotateX, scale, filter, opacity: 1 }}
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

                  {/* P2P card image, the 2015 loan field sorted by the model */}
                  {card.id === 4 && (
                    <img
                      src="/p2p-lending-card.jpg"
                      alt="1,000 LendingClub loans sorted by predicted default risk"
                      draggable={false}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover', objectPosition: 'center',
                        display: 'block',
                      }}
                    />
                  )}

                  {/* Marketing card image, promised vs earned bars */}
                  {card.id === 5 && (
                    <img
                      src="/marketing-targeting-card.jpg"
                      alt="Bars comparing what a personalization model promised with what it earned"
                      draggable={false}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover', objectPosition: 'center',
                        display: 'block',
                      }}
                    />
                  )}

                  {/* House prices card image, real prices vs the placeholder spike */}
                  {card.id === 6 && (
                    <img
                      src="/house-prices-card.jpg"
                      alt="Histogram of real house prices next to a narrow spike of placeholder prices"
                      draggable={false}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover', objectPosition: 'center',
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
                    padding: phone ? '56px 16px 14px' : '104px 32px 32px',
                    zIndex: 1,
                  }}>
                    <h2 style={{
                      fontSize: phone ? 18 : 20,
                      fontWeight: 700,
                      color: card.id === 2 ? '#111' : '#ffffff',
                      lineHeight: 1.1,
                      fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
                      margin: phone ? '0 0 4px' : '0 0 10px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>{card.title}</h2>

                    <p style={{
                      fontSize: phone ? 12 : 14,
                      color: card.id === 2 ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)',
                      lineHeight: 1.6,
                      fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
                      fontWeight: 400,
                      maxWidth: phone ? '100%' : '80%',
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

                  {/* Side cards say what a click does: the same frosted pill,
                      on the corner that is not tucked behind the front card. */}
                  {!phone && Math.abs(off) === 1 && (
                    <motion.div
                      animate={{ opacity: sideHover ? 1 : 0.8 }}
                      transition={{ duration: 0.22 }}
                      style={{
                        position: 'absolute',
                        top: 14,
                        ...(off < 0 ? { left: 14 } : { right: 14 }),
                        fontFamily: MONO,
                        fontSize: 11,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: card.id === 2 ? '#000000' : '#ffffff',
                        background: card.id === 2
                          ? `rgba(255,255,255,${sideHover ? 0.85 : 0.7})`
                          : `rgba(0,0,0,${sideHover ? 0.6 : 0.45})`,
                        border: card.id === 2
                          ? `2px solid rgba(0,0,0,${sideHover ? 0.3 : 0.16})`
                          : `2px solid rgba(255,255,255,${sideHover ? 0.55 : 0.3})`,
                        borderRadius: 999,
                        padding: '6px 13px',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        transition: 'background 220ms ease, border-color 220ms ease',
                        pointerEvents: 'none',
                        zIndex: 11,
                      }}
                    >
                      {off < 0 ? '← Previous' : 'Next →'}
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
            </AnimatePresence>
          </div>

        </div>

        {/* Phones: say that the wheel turns by swiping. */}
        {phone && (
          <p style={{
            fontFamily: MONO, fontSize: 11, letterSpacing: '0.25em',
            // Below the horizon, which runs ARC_DROP under the card.
            color: 'rgba(255,255,255,0.55)', margin: '44px 0 0',
          }}>
            {String(active + 1).padStart(2, '0')} / {String(cards.length).padStart(2, '0')} · SWIPE
          </p>
        )}

        {/* Dot navigation */}
        <div style={{ display: phone ? 'none' : 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
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
