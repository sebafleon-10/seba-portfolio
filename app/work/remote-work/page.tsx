'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DotGridBackground } from '@/components/ui/dot-grid-background';

// Violet accent for this research page. Ties to the purple particle lines on the main page.
const ACCENT = '#7C5CFF';
const ACCENT_BRIGHT = '#A99BFF';
const MAX_COEF = 34.6;

// One eyebrow treatment used by every beat on the page. Dim white so purple can stay reserved for the result.
const EYEBROW: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 12,
  letterSpacing: '0.4em',
  textTransform: 'uppercase' as const,
  color: 'rgba(255,255,255,0.4)',
  margin: '0 0 24px',
  display: 'block',
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

// Drives a number from 0 up to `target` once `run` flips true. duration <= 0 snaps to target (reduced motion).
function useCountUp(target: number, run: boolean, delay = 0, duration = 1.1, decimals = 1) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) { setV(0); return; }
    if (duration <= 0) { setV(target); return; }
    setV(0);
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const elapsed = (now - start) / 1000 - delay;
      if (elapsed < 0) { raf = requestAnimationFrame(tick); return; }
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target, delay, duration]);
  return v.toFixed(decimals);
}

// Marginal effects of remote work by subgroup, Model 3 (paper p.15).
const MARGINAL = [
  { group: 'Non-college men', value: 6.5, emphasis: false },
  { group: 'Non-college women', value: 6.1, emphasis: false },
  { group: 'College men', value: 16.9, emphasis: true },
  { group: 'College women', value: 9.5, emphasis: true },
];

// Non-college bars fire first; a beat later the college bars land, so the outliers read as the answer.
function barDelay(i: number) {
  return i < 2 ? i * 0.08 : 0.25 + (i - 2) * 0.08;
}

function BarRow({ d, i, run, prefersReduced }: {
  d: typeof MARGINAL[number];
  i: number;
  run: boolean;
  prefersReduced: boolean;
}) {
  const max = 18;
  const pct = (d.value / max) * 100;
  const isCollegeStart = d.group === 'College men';
  const delay = barDelay(i);
  const display = useCountUp(
    d.value,
    run,
    prefersReduced ? 0 : delay,
    prefersReduced ? 0 : 0.95,
    1
  );

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr 110px',
        alignItems: 'center',
        gap: 36,
        padding: '18px 0',
        marginTop: isCollegeStart ? 12 : 0,
        borderTop: i === 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
      className="rw-bar-row"
    >
      <span style={{
        fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
        fontSize: 'clamp(16px, 1.5vw, 21px)',
        fontWeight: d.emphasis ? 500 : 300,
        color: d.emphasis ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.78)',
        letterSpacing: '-0.01em',
      }}>{d.group}</span>

      <div style={{
        height: 13,
        borderRadius: 999,
        background: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
      }}>
        <motion.div
          initial={prefersReduced ? false : { width: '0%' }}
          animate={(run || prefersReduced) ? { width: `${pct}%` } : { width: '0%' }}
          transition={prefersReduced
            ? { duration: 0 }
            : { duration: 0.95, ease: [0.22, 1, 0.36, 1], delay }}
          style={{
            height: '100%',
            borderRadius: 999,
            background: d.emphasis
              ? `linear-gradient(90deg, ${ACCENT} 0%, ${ACCENT_BRIGHT} 100%)`
              : 'rgba(255,255,255,0.4)',
            filter: d.emphasis ? 'saturate(1.15) brightness(1.05)' : undefined,
          }}
        />
      </div>

      <span style={{
        fontFamily: 'monospace',
        fontSize: d.emphasis ? 'clamp(24px, 2.6vw, 34px)' : 'clamp(20px, 2.1vw, 28px)',
        fontWeight: d.emphasis ? 600 : 400,
        textAlign: 'right',
        color: d.emphasis ? ACCENT_BRIGHT : 'rgba(255,255,255,0.72)',
        letterSpacing: '-0.02em',
      }}>{display}%</span>
    </div>
  );
}

function MarginalChart() {
  // motion.div + onViewportEnter is more reliable than useInView-on-plain-div: it uses
  // Framer Motion's built-in IntersectionObserver wired into the motion component itself.
  const [started, setStarted] = useState(false);
  const prefersReduced = usePrefersReducedMotion();

  return (
    <motion.div
      style={{ width: '100%' }}
      viewport={{ once: true, amount: 0.3 }}
      onViewportEnter={() => setStarted(true)}
    >
      {MARGINAL.map((d, i) => (
        <BarRow key={d.group} d={d} i={i} run={started || prefersReduced} prefersReduced={prefersReduced} />
      ))}

      <p style={{
        marginTop: 24,
        fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
        fontSize: 'clamp(18px, 1.7vw, 20px)',
        fontWeight: 300,
        lineHeight: 1.7,
        color: 'rgba(255,255,255,0.85)',
        maxWidth: 680,
      }}>
        College men capture nearly three times the non-college premium. College
        women capture only about half of that, a 7.4 point gap driven by the
        triple interaction.
      </p>
    </motion.div>
  );
}

// Remote coefficient collapsing across the three model specifications (paper p.16).
const MODELS = [
  {
    n: '01',
    name: 'Raw premium',
    adds: 'Remote, female, and their interaction. No controls.',
    coef: 34.6,
    r2: 0.05,
  },
  {
    n: '02',
    name: 'Human capital',
    adds: 'Adds education, experience, and union status.',
    coef: 20.7,
    r2: 0.21,
  },
  {
    n: '03',
    name: 'Full model',
    adds: 'Adds occupation and industry fixed effects.',
    coef: 6.5,
    r2: 0.44,
  },
];

function ModelCard({ m, i, run, prefersReduced }: {
  m: typeof MODELS[number];
  i: number;
  run: boolean;
  prefersReduced: boolean;
}) {
  const isFinal = i === MODELS.length - 1;
  // Coefficient number scales with its value so the collapse is visible in the type.
  // Boosted so the percentages are the dominant element in each card.
  const coefSize = 64 + (m.coef / MAX_COEF) * 52;
  const cardDelay = i * 0.16;
  const numberDelay = cardDelay + 0.35;
  const display = useCountUp(
    m.coef,
    run,
    prefersReduced ? 0 : numberDelay,
    prefersReduced ? 0 : 1.05,
    1
  );

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 24 }}
      animate={(run || prefersReduced) ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={prefersReduced
        ? { duration: 0 }
        : { duration: 0.6, ease: 'easeOut', delay: cardDelay }}
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '48px 40px 56px',
        borderRadius: 20,
        background: isFinal
          ? 'linear-gradient(rgba(124,92,255,0.10), rgba(124,92,255,0.10)), #0b0b0f'
          : '#0d0d10',
        border: isFinal
          ? `1px solid ${ACCENT}`
          : '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 380,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
        <span style={{
          fontFamily: 'monospace', fontSize: 11,
          letterSpacing: '0.3em', textTransform: 'uppercase',
          color: isFinal ? ACCENT_BRIGHT : 'rgba(255,255,255,0.35)',
        }}>Model {m.n}</span>
        <span style={{
          fontFamily: 'monospace', fontSize: 11,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)',
        }}>R² {m.r2.toFixed(2)}</span>
      </div>

      <h3 style={{
        fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
        fontSize: 24, fontWeight: 600,
        color: '#ffffff', letterSpacing: '-0.015em',
        margin: '0 0 12px',
      }}>{m.name}</h3>

      <p style={{
        fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
        fontSize: 14, fontWeight: 300, lineHeight: 1.6,
        color: 'rgba(255,255,255,0.7)',
        margin: '0 0 auto',
      }}>{m.adds}</p>

      <div style={{ marginTop: 32 }}>
        <p style={{
          fontFamily: 'monospace', fontSize: 10,
          letterSpacing: '0.3em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)', margin: '0 0 6px',
        }}>Remote premium</p>
        <span style={{
          fontFamily: 'monospace',
          fontSize: coefSize,
          fontWeight: isFinal ? 600 : 400,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          color: isFinal ? ACCENT_BRIGHT : 'rgba(255,255,255,0.85)',
        }}>{display}%</span>
      </div>

      {/* Bottom progress bar visualizes the coefficient itself: full on Model 01, short on Model 03.
          These bars are the primary device that sells the collapse; the through-line behind the grid
          is a subtle supporting connector. */}
      <div style={{
        marginTop: 32,
        height: 8, borderRadius: 999,
        background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
      }}>
        <motion.div
          initial={prefersReduced ? false : { width: '0%' }}
          animate={(run || prefersReduced) ? { width: `${(m.coef / MAX_COEF) * 100}%` } : { width: '0%' }}
          transition={prefersReduced
            ? { duration: 0 }
            : { duration: 1.05, ease: [0.22, 1, 0.36, 1], delay: numberDelay }}
          style={{
            height: '100%', borderRadius: 999,
            background: isFinal ? ACCENT : 'rgba(255,255,255,0.32)',
          }}
        />
      </div>
    </motion.div>
  );
}

function ModelWalk() {
  // motion.div + onViewportEnter so the collapse-card reveal reliably fires when the card
  // group scrolls into view. Switched from useInView-on-plain-div which was missing in some
  // viewports — the motion-prop API is wired into the component lifecycle and is more reliable.
  const [started, setStarted] = useState(false);
  const prefersReduced = usePrefersReducedMotion();

  return (
    <motion.div
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 20,
      }}
      className="rw-model-walk"
      viewport={{ once: true, amount: 0.3 }}
      onViewportEnter={() => setStarted(true)}
    >
      {/* Through-line: 1px horizontal connector behind the cards, centered on the bottom progress bars.
          Card backgrounds are opaque, so the line shows only in the 20px gaps between cards. Subtle and
          understated, the bars themselves carry the collapse; this connector just ties them together. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 60,
          height: 1,
          background: 'rgba(255,255,255,0.08)',
          zIndex: 0,
        }}
      />

      {MODELS.map((m, i) => (
        <ModelCard key={m.n} m={m} i={i} run={started || prefersReduced} prefersReduced={prefersReduced} />
      ))}
    </motion.div>
  );
}

function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);
  const prefersReduced = usePrefersReducedMotion();
  useEffect(() => { setIsLoaded(true); }, []);
  const animate = (target: object) => (prefersReduced || isLoaded) ? target : {};

  return (
    <section className="relative w-full" style={{ minHeight: '100vh', zIndex: 1 }}>

      <div
        className="relative"
        style={{
          minHeight: '100vh',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '96px 64px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          gap: 40,
          zIndex: 10,
        }}
      >
        {/* Title block — widened so the hero breathes the full container width
            instead of being cramped into the left ~60%. Left-aligned on the page spine. */}
        <div style={{ maxWidth: 1000 }}>
          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            animate={animate({ opacity: 1, y: 0 })}
            transition={prefersReduced ? { duration: 0 } : { duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            style={{ ...EYEBROW, margin: '0 0 28px' }}
          >
            Research · Econometrics
          </motion.p>

          <motion.h1
            initial={prefersReduced ? false : { opacity: 0, y: 30 }}
            animate={animate({ opacity: 1, y: 0 })}
            transition={prefersReduced ? { duration: 0 } : { duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            style={{
              fontFamily: '"Inter", ui-rounded, system-ui, sans-serif',
              fontSize: 'clamp(40px, 5.5vw, 78px)',
              fontWeight: 800,
              lineHeight: 0.94,
              color: '#ffffff',
              margin: '0 0 28px',
              letterSpacing: '-0.04em',
            }}
          >
            Does Remote Work Narrow<br />the Gender Wage Gap?
          </motion.h1>

          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 30 }}
            animate={animate({ opacity: 1, y: 0 })}
            transition={prefersReduced ? { duration: 0 } : { duration: 0.7, delay: 0.35, ease: 'easeOut' }}
            style={{
              fontFamily: '"Inter", ui-rounded, system-ui, sans-serif',
              fontSize: 'clamp(19px, 2.1vw, 26px)',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.75)',
              margin: 0,
              lineHeight: 1.6,
              maxWidth: 880,
              letterSpacing: '0.01em',
            }}
          >
            A weighted regression on 30,000 Census records testing the leading
            theory of the wage gap. The data said the opposite of what the
            theory predicted.
          </motion.p>
        </div>

        {/* Chart band, full width */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 40 }}
          animate={animate({ opacity: 1, y: 0 })}
          transition={prefersReduced ? { duration: 0 } : { duration: 0.9, delay: 0.5, ease: 'easeOut' }}
          style={{ width: '100%' }}
        >
          <p style={{
            fontFamily: 'monospace', fontSize: 11,
            letterSpacing: '0.35em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.55)', margin: '0 0 12px',
          }}>Remote wage premium by subgroup</p>
          <MarginalChart />
        </motion.div>

        {/* Tag pills */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          animate={animate({ opacity: 1, y: 0 })}
          transition={prefersReduced ? { duration: 0 } : { duration: 0.7, delay: 0.7, ease: 'easeOut' }}
          style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
        >
          {['Stata', 'IPUMS CPS', 'OLS Regression', '30,272 obs'].map((t) => (
            <motion.span
              key={t}
              whileHover={{
                y: -2,
                borderColor: 'rgba(255,255,255,0.32)',
                backgroundColor: 'rgba(255,255,255,0.04)',
              }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                fontFamily: 'monospace', fontSize: 14,
                padding: '10px 22px', borderRadius: 999,
                borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.2)',
                backgroundColor: 'transparent',
                color: 'rgba(255,255,255,0.8)',
                cursor: 'default',
                display: 'inline-block',
              }}
            >{t}</motion.span>
          ))}
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .rw-bar-row {
            grid-template-columns: 1fr 60px !important;
            grid-template-areas: "label value" "bar bar" !important;
            gap: 8px 16px !important;
          }
          .rw-bar-row > span:first-child { grid-area: label; }
          .rw-bar-row > div { grid-area: bar; }
          .rw-bar-row > span:last-child { grid-area: value; }
        }
        @media (max-width: 820px) {
          .rw-model-walk { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

const DELIVERABLES = [
  {
    value: 'FULL PAPER',
    label: 'pdf',
    description: 'The complete regression analysis: literature review, theoretical framework, three model specifications, and interpretation of results.',
    href: '/remote-work-paper.pdf',
    type: 'Open PDF',
  },
  {
    value: 'PRESENTATION',
    label: 'pdf',
    description: 'The slide deck presenting the methodology, three model specifications, and findings.',
    href: '/remote-work-presentation.pdf',
    type: 'Open PDF',
  },
  {
    value: 'DATA SOURCE',
    label: 'data',
    description: 'IPUMS CPS basic monthly survey, October 2022 onward, the 30,272 observation sample behind every model in the paper.',
    href: 'https://cps.ipums.org/cps/',
    type: 'Open IPUMS',
  },
];

const cardVariants = {
  rest: {
    y: 0,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#0d0d10',
  },
  hover: {
    y: -2,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: '#101015',
  },
};

const arrowVariants = {
  rest: { x: 0 },
  hover: { x: 4 },
};

function DeliverableCard({ item, i, prefersReduced }: {
  item: typeof DELIVERABLES[number];
  i: number;
  prefersReduced: boolean;
}) {
  return (
    <motion.a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      initial={prefersReduced ? 'rest' : { opacity: 0, y: 20 }}
      whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      animate={prefersReduced ? 'rest' : undefined}
      whileHover="hover"
      variants={cardVariants}
      transition={prefersReduced
        ? { duration: 0 }
        : { duration: 0.5, ease: 'easeOut', delay: i * 0.08 }}
      style={{
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0d0d10',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 24,
        padding: 32,
        minHeight: 260,
        color: '#ffffff',
      }}
    >
      <span style={{
        fontFamily: 'monospace',
        fontSize: 11,
        letterSpacing: '0.3em',
        textTransform: 'uppercase' as const,
        color: 'rgba(255,255,255,0.45)',
        marginBottom: 18,
        display: 'block',
      }}>{item.label}</span>

      <h3 style={{
        fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
        fontSize: 32,
        fontWeight: 700,
        color: '#ffffff',
        letterSpacing: '-0.02em',
        margin: '0 0 16px',
        lineHeight: 1.05,
      }}>{item.value}</h3>

      <p style={{
        fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
        fontSize: 17,
        fontWeight: 300,
        color: 'rgba(255,255,255,0.78)',
        lineHeight: 1.7,
        margin: '0 0 auto',
      }}>{item.description}</p>

      <span style={{
        fontFamily: 'monospace',
        fontSize: 12,
        letterSpacing: '0.2em',
        textTransform: 'uppercase' as const,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 28,
        fontWeight: 600,
        display: 'block',
      }}>
        {item.type}{' '}
        <motion.span
          variants={arrowVariants}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{ display: 'inline-block' }}
        >→</motion.span>
      </span>
    </motion.a>
  );
}

function FadeRiseSectionHeader({
  eyebrow, heading, body, prefersReduced,
}: {
  eyebrow: string;
  heading: React.ReactNode;
  body?: React.ReactNode;
  prefersReduced: boolean;
}) {
  const base = prefersReduced
    ? { initial: false as const }
    : {
      initial: { opacity: 0, y: 20 } as const,
      whileInView: { opacity: 1, y: 0 } as const,
      viewport: { once: true, amount: 0.3 } as const,
    };
  const ease = prefersReduced ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' as const };

  return (
    <>
      <motion.p
        {...base}
        transition={{ ...ease }}
        style={EYEBROW}
      >{eyebrow}</motion.p>
      <motion.div
        {...base}
        transition={{ ...ease, delay: prefersReduced ? 0 : 0.06 }}
      >{heading}</motion.div>
      {body && (
        <motion.div
          {...base}
          transition={{ ...ease, delay: prefersReduced ? 0 : 0.12 }}
        >{body}</motion.div>
      )}
    </>
  );
}

export default function RemoteWorkPage() {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Quiet dot-grid background — replaces the particle network on this page only.
          Fixed full-viewport, behind all content (zIndex 0, pointer-events none). The
          shared AmbientCanvas is skipped for this route by app/work/layout.tsx. */}
      <DotGridBackground />

      <HeroSection />

      {/* BUILDING THE ESTIMATE — unified collapse module: header + cards bound as one block. */}
      <section style={{ position: 'relative', zIndex: 1, padding: '120px 0' }}>
        <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto', padding: '0 64px' }}>

          {/* Header + body, tight gap to the cards below so the heading reads as the title of the card group. */}
          <div style={{ maxWidth: 880, margin: '0 0 28px' }}>
            {/* Eyebrow with purple left tick — reuses the same 2px ACCENT left-border device
                as the pullquote in The Finding section. */}
            <motion.p
              initial={prefersReduced ? false : { opacity: 0, y: 20 }}
              whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={prefersReduced ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
              style={{
                ...EYEBROW,
                borderLeft: `2px solid ${ACCENT}`,
                paddingLeft: 16,
                margin: '0 0 20px',
              }}
            >Building the estimate</motion.p>

            {/* Climax heading: larger than the other section h2s on the page, with the result word
                ("collapse") in result-purple. */}
            <motion.h2
              initial={prefersReduced ? false : { opacity: 0, y: 20 }}
              whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={prefersReduced ? { duration: 0 } : { duration: 0.5, delay: 0.06, ease: 'easeOut' }}
              style={{
                fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
                fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 700,
                color: '#ffffff', letterSpacing: '-0.035em',
                lineHeight: 1.06, margin: '0 0 24px', maxWidth: 880,
              }}
            >
              Watch the remote premium <span style={{ color: ACCENT_BRIGHT }}>collapse</span>.
            </motion.h2>

            <motion.p
              initial={prefersReduced ? false : { opacity: 0, y: 20 }}
              whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={prefersReduced ? { duration: 0 } : { duration: 0.5, delay: 0.12, ease: 'easeOut' }}
              style={{
                fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
                fontSize: 'clamp(18px, 1.7vw, 21px)', fontWeight: 300,
                color: 'rgba(255,255,255,0.82)', lineHeight: 1.7,
                margin: 0, maxWidth: 720,
              }}
            >
              A raw 34.6 percent remote premium shrinks to 6.5 percent once the
              model controls for which jobs remote workers actually hold. Most of
              the apparent advantage was never about remote work. It was about
              occupation.
            </motion.p>
          </div>

          <ModelWalk />
        </div>
      </section>

      {/* THE FINDING — eyebrow + heading stay in their dim/white treatment above the card.
          The narrative body + pullquote drop into a floating light card that reuses the
          AA "Project" card vocabulary so the two pages feel like siblings. Monochrome
          inside — purple stays reserved for the result on this page. */}
      <section style={{ position: 'relative', zIndex: 1, padding: '120px 0' }}>
        {/* Left-aligned on the same page spine as every other section. AA's container
            spec (maxWidth 1200, centered with auto margins, 64px horizontal padding) is
            applied uniformly across the page so left edges form one unbroken vertical line. */}
        <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto', padding: '0 64px' }}>
            <FadeRiseSectionHeader
              prefersReduced={prefersReduced}
              eyebrow="The Finding"
              heading={
                <h2 style={{
                  fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
                  fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 700,
                  color: '#ffffff', letterSpacing: '-0.03em',
                  lineHeight: 1.15, margin: '0 0 40px',
                }}>A marker of high-paying jobs, not a flexibility benefit.</h2>
              }
            />

            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 30 }}
              whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={prefersReduced ? { duration: 0 } : { duration: 0.7, delay: 0.1, ease: 'easeOut' }}
              whileHover={prefersReduced ? undefined : {
                rotateX: 6,
                rotateY: 8,
                scale: 1.04,
                transition: { type: 'spring', stiffness: 300, damping: 20 },
              }}
              style={{
                padding: '48px',
                background: 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.6)',
                borderRadius: 24,
                boxShadow: '0 8px 48px rgba(0,0,0,0.5)',
                transformStyle: 'preserve-3d',
                cursor: 'default',
              }}
            >
              <div style={{
                fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
                fontSize: 20, fontWeight: 300, lineHeight: 1.75,
                color: 'rgba(0,0,0,0.88)',
                display: 'flex', flexDirection: 'column', gap: 28,
              }}>
                <p style={{ margin: 0 }}>
                  The theory predicts remote work should ease the time inflexibility
                  penalty that drives the modern gender gap, with the biggest gains
                  for college-educated women. The data rejects both predictions.
                  Among non-college workers, the remote-by-female interaction is
                  -0.004 and statistically insignificant once occupation, industry,
                  and demographic controls enter the model.
                </p>
                <p style={{ margin: 0 }}>
                  Among college workers the pattern runs the opposite direction. The
                  triple interaction of remote, female, and college is -0.070,
                  significant at the ten percent level. Education amplifies the
                  remote premium for men, not women, a 7.4 point gap that would stay
                  invisible in a subsample analysis.
                </p>
                <p style={{
                  margin: 0, paddingLeft: 28,
                  borderLeft: `2px solid ${ACCENT}`,
                  color: 'rgba(0,0,0,0.95)',
                }}>
                  The most likely explanation: the Census remote variable captures
                  job type, not within-job flexibility. Remote status concentrates
                  in high-paying professional roles that men disproportionately
                  hold, so the premium reflects occupational sorting rather than the
                  schedule control the theory describes.
                </p>
              </div>
            </motion.div>
        </div>
      </section>

      {/* DELIVERABLES */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 0 120px' }}>
        <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto', padding: '0 64px' }}>
          <FadeRiseSectionHeader
            prefersReduced={prefersReduced}
            eyebrow="Deliverables"
            heading={
              <h2 style={{
                fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
                fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700,
                color: '#ffffff', margin: '0 0 48px', letterSpacing: '-0.03em',
                lineHeight: 1.1, textAlign: 'left' as const,
              }}>What I built.</h2>
            }
          />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
            maxWidth: 1200,
          }}>
            {DELIVERABLES.map((item, i) => (
              <DeliverableCard
                key={item.value}
                item={item}
                i={i}
                prefersReduced={prefersReduced}
              />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
