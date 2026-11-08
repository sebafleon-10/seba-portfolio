'use client';

import { useId, useState, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { MONO } from '@/lib/fonts';
import { DotGridBackground } from '@/components/ui/dot-grid-background';
import { ACCENT, ACCENT_BRIGHT, accentAlpha } from '@/lib/accent';
import data from './houses.json';

const INTER = 'Inter, ui-rounded, system-ui, sans-serif';
const E = data.estimator;
const A = data.audit;
const pct = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`;
const usd = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`;
const usdK = (v: number) => `$${Math.round(v / 1000)}K`;

// Ames neighborhood codes from the dataset documentation.
const NB_NAMES: Record<string, string> = {
  Blmngtn: 'Bloomington Heights', Blueste: 'Bluestem', BrDale: 'Briardale', BrkSide: 'Brookside', ClearCr: 'Clear Creek',
  CollgCr: 'College Creek', Crawfor: 'Crawford', Edwards: 'Edwards', Gilbert: 'Gilbert', IDOTRR: 'Iowa DOT and Rail Road',
  MeadowV: 'Meadow Village', Mitchel: 'Mitchell', NAmes: 'North Ames', NoRidge: 'Northridge', NPkVill: 'Northpark Villa',
  NridgHt: 'Northridge Heights', NWAmes: 'Northwest Ames', OldTown: 'Old Town', SWISU: 'South and West of Iowa State',
  Sawyer: 'Sawyer', SawyerW: 'Sawyer West', Somerst: 'Somerset', StoneBr: 'Stone Brook', Timber: 'Timberland', Veenker: 'Veenker',
};

const EYEBROW: React.CSSProperties = {
  fontFamily: MONO, fontSize: 14, letterSpacing: '0.4em', textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.4)', margin: '0 0 24px', display: 'block',
};
const H2: React.CSSProperties = {
  fontFamily: INTER, fontSize: 'clamp(30px, 3.8vw, 50px)', fontWeight: 700, color: '#ffffff',
  letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 20px',
};
const BODY: React.CSSProperties = {
  fontFamily: INTER, fontSize: 'clamp(17px, 1.6vw, 20px)', fontWeight: 300,
  color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, margin: 0, maxWidth: 720,
};
const NOTE: React.CSSProperties = { fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.42)', lineHeight: 1.6, margin: '14px 0 0' };
const WRAP: React.CSSProperties = { maxWidth: 1200, width: '100%', margin: '0 auto', padding: '0 64px' };
const CARD: React.CSSProperties = { background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 };

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';
function subscribeReduced(cb: () => void) {
  const mql = window.matchMedia(REDUCED_QUERY);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}
function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED_QUERY).matches, () => false);
}

function Rise({ children, reduced, delay = 0 }: { children: React.ReactNode; reduced: boolean; delay?: number }) {
  return (
    <motion.div initial={reduced ? false : { opacity: 0, y: 20 }} whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5, delay, ease: 'easeOut' }}>{children}</motion.div>
  );
}

function Section({ children, pad = '120px 0' }: { children: React.ReactNode; pad?: string }) {
  return <section style={{ position: 'relative', zIndex: 1, padding: pad }}><div style={WRAP} className="hp-wrap">{children}</div></section>;
}

// ESTIMATOR: log price = const + sum(coef * input) + neighborhood effect.
type Inputs = { GrLivArea: number; OverallQual: number; YearBuilt: number; TotalBsmtSF: number; GarageCars: number };
const SLIDERS: { key: keyof Inputs; label: string; step: number; fmt: (v: number) => string }[] = [
  { key: 'GrLivArea', label: 'Living area', step: 25, fmt: (v) => `${v.toLocaleString('en-US')} sq ft` },
  { key: 'OverallQual', label: 'Overall quality', step: 1, fmt: (v) => `${v} / 10` },
  { key: 'YearBuilt', label: 'Year built', step: 1, fmt: (v) => `${v}` },
  { key: 'TotalBsmtSF', label: 'Basement', step: 25, fmt: (v) => (v === 0 ? 'None' : `${v.toLocaleString('en-US')} sq ft`) },
  { key: 'GarageCars', label: 'Garage', step: 1, fmt: (v) => (v === 0 ? 'None' : `${v} car${v > 1 ? 's' : ''}`) },
];
const roundTo = (v: number, step: number) => Math.round(v / step) * step;
const DEFAULTS = Object.fromEntries(SLIDERS.map((s) => [s.key, roundTo(E.ranges[s.key][1], s.step)])) as Inputs;
const NB_EFFECT = Object.fromEntries(E.neighborhoods.map((n) => [n.code, n.effect]));

function estimate(x: Inputs, nb: string) {
  let lp = E.const + (NB_EFFECT[nb] ?? 0);
  for (const s of SLIDERS) lp += E.coef[s.key] * x[s.key];
  return Math.exp(lp);
}

function Estimator({ reduced }: { reduced: boolean }) {
  const [x, setX] = useState<Inputs>(DEFAULTS);
  const [nb, setNb] = useState<string>(E.base);
  const id = useId();
  const price = estimate(x, nb);
  const lo = price * (1 - E.p80PctError), hi = price * (1 + E.p80PctError);
  const qualityGain = price * (Math.exp(E.coef.OverallQual) - 1);
  const sqftEquiv = E.coef.OverallQual / E.coef.GrLivArea;
  const span = 500_000;

  return (
    <div className="hp-est" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)', gap: 48, marginTop: 48, alignItems: 'start' }}>
      <div style={{ ...CARD, padding: 28 }} className="hp-card">
        <label htmlFor={`${id}-nb`} style={{ display: 'block', fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Neighborhood</label>
        <select id={`${id}-nb`} value={nb} onChange={(e) => setNb(e.target.value)}
          style={{ width: '100%', fontFamily: INTER, fontSize: 15, color: '#ffffff', background: '#0a0a0a', border: '2px solid rgba(255,255,255,0.18)', borderRadius: 10, padding: '9px 12px', marginBottom: 22 }}>
          {[...E.neighborhoods].sort((p, q) => (NB_NAMES[p.code] ?? p.code).localeCompare(NB_NAMES[q.code] ?? q.code))
            .map((n) => <option key={n.code} value={n.code}>{NB_NAMES[n.code] ?? n.code}</option>)}
        </select>
        {SLIDERS.map((s) => {
          const [min, , max] = E.ranges[s.key];
          return (
            <div key={s.key} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <label htmlFor={`${id}-${s.key}`} style={{ fontFamily: INTER, fontSize: 15, color: 'rgba(255,255,255,0.8)' }}>{s.label}</label>
                <span style={{ fontFamily: MONO, fontSize: 14, color: '#ffffff' }}>{s.fmt(x[s.key])}</span>
              </div>
              <input id={`${id}-${s.key}`} type="range" min={roundTo(min, s.step)} max={roundTo(max, s.step)} step={s.step} value={x[s.key]}
                onChange={(e) => setX((p) => ({ ...p, [s.key]: +e.target.value }))} style={{ width: '100%', accentColor: ACCENT }} />
            </div>
          );
        })}
        <button onClick={() => { setX(DEFAULTS); setNb(E.base); }}
          style={{ marginTop: 4, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'underline', textUnderlineOffset: 4 }}>
          Reset to a typical Ames house
        </button>
      </div>

      <div aria-live="polite">
        <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Estimated sale price, 2006 to 2010</span>
        <div style={{ fontFamily: MONO, fontSize: 'clamp(44px, 6vw, 72px)', color: ACCENT_BRIGHT, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '8px 0 6px' }}>{usd(price)}</div>
        <p style={{ fontFamily: INTER, fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
          8 in 10 similar homes sold between <span style={{ color: '#ffffff' }}>{usdK(lo)}</span> and <span style={{ color: '#ffffff' }}>{usdK(hi)}</span>.
        </p>
        <div style={{ position: 'relative', height: 28, marginTop: 18 }} aria-hidden>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 13, height: 2, background: 'rgba(255,255,255,0.1)' }} />
          <motion.div animate={{ left: `${Math.min(100, (lo / span) * 100)}%`, width: `${Math.min(100, ((hi - lo) / span) * 100)}%` }}
            transition={reduced ? { duration: 0 } : { duration: 0.25 }} style={{ position: 'absolute', top: 9, height: 10, borderRadius: 99, background: accentAlpha(0.35) }} />
          <motion.div animate={{ left: `${Math.min(100, (price / span) * 100)}%` }} transition={reduced ? { duration: 0 } : { duration: 0.25 }}
            style={{ position: 'absolute', top: 4, width: 2, height: 20, marginLeft: -1, background: ACCENT_BRIGHT }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}><span>$0</span><span>$250K</span><span>$500K</span></div>

        <div style={{ ...CARD, padding: 20, marginTop: 28 }}>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: ACCENT }}>Size or quality?</span>
          <p style={{ fontFamily: INTER, fontSize: 16, fontWeight: 300, color: 'rgba(255,255,255,0.85)', margin: '8px 0 0', lineHeight: 1.6 }}>
            One more step of quality adds about <span style={{ color: '#ffffff', fontWeight: 500 }}>{usdK(qualityGain)}</span> here, the same as
            roughly <span style={{ color: '#ffffff', fontWeight: 500 }}>{Math.round(sqftEquiv / 5) * 5} sq ft</span> of extra living area.
          </p>
        </div>
        <p style={NOTE}>
          A simplified six-input model so it can run in your browser. It misses by a median {pct(E.medianPctError)} on homes it never saw.
          The full model below misses by {pct(data.ladder.find((l) => l.model === 'Lasso')!.medianPctError)}.
        </p>
      </div>
    </div>
  );
}

function Histogram({ reduced }: { reduced: boolean }) {
  const { real, placeholder, edges } = data.hist;
  const max = Math.max(...real, ...placeholder);
  return (
    <div style={{ ...CARD, padding: '28px 28px 18px', marginTop: 40 }} className="hp-card">
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 18 }}>
        <span><i style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'rgba(255,255,255,0.45)', marginRight: 8 }} />{A.rows_real.toLocaleString('en-US')} real sales</span>
        <span><i style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: ACCENT, marginRight: 8 }} />{A.rows_placeholder.toLocaleString('en-US')} placeholder prices</span>
      </div>
      <div role="img" aria-label="Histogram: real sale prices spread from under $100K to over $400K; placeholder prices bunch in a narrow spike around $180K"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${real.length}, minmax(0, 1fr))`, gap: 3, alignItems: 'end', height: 220 }}>
        {real.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 1, alignItems: 'end', height: '100%' }}>
            {[{ v: r, c: 'rgba(255,255,255,0.45)' }, { v: placeholder[i], c: ACCENT }].map((b, j) => (
              <motion.div key={j} initial={reduced ? false : { height: 0 }} whileInView={{ height: `${(b.v / max) * 100}%` }} viewport={{ once: true, amount: 0.4 }}
                transition={reduced ? { duration: 0 } : { duration: 0.8, delay: i * 0.02 + j * 0.3 }}
                style={{ flex: 1, background: b.c, borderRadius: '2px 2px 0 0' }} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
        <span>$0</span><span>${edges[Math.floor(edges.length / 2)] / 1000}K</span><span>$500K+</span>
      </div>
    </div>
  );
}

function Ladder({ reduced }: { reduced: boolean }) {
  const rows = data.ladder;
  const max = Math.max(...rows.map((r) => r.medianPctError));
  const lasso = 'Lasso';
  return (
    <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      {rows.map((r, i) => {
        const strong = r.model === lasso;
        return (
          <div key={r.model} className="hp-bar" style={{ display: 'grid', gridTemplateColumns: '260px 1fr 90px', gap: 28, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontFamily: INTER, fontSize: 16, fontWeight: strong ? 500 : 300, color: strong ? '#ffffff' : 'rgba(255,255,255,0.78)' }}>{r.model}</span>
            <div style={{ height: 10, borderRadius: 99, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <motion.div initial={reduced ? false : { width: 0 }} whileInView={{ width: `${(r.medianPctError / max) * 100}%` }} viewport={{ once: true, amount: 0.5 }}
                transition={reduced ? { duration: 0 } : { duration: 0.8, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                style={{ height: '100%', borderRadius: 99, background: strong ? ACCENT : 'rgba(255,255,255,0.4)' }} />
            </div>
            <span style={{ fontFamily: MONO, fontSize: 16, textAlign: 'right', color: strong ? ACCENT_BRIGHT : 'rgba(255,255,255,0.75)' }}>{pct(r.medianPctError)}</span>
          </div>
        );
      })}
    </div>
  );
}

function BiasChart({ reduced }: { reduced: boolean }) {
  const bands = ['Cheapest fifth', 'Second', 'Middle', 'Fourth', 'Priciest fifth'];
  const before = data.bias['Class Model 1 (6 inputs)'], after = data.bias['Blend'];
  const max = Math.max(...before.map(Math.abs), ...after.map(Math.abs));
  const bar = (v: number, c: string, d: number) => (
    <div style={{ position: 'relative', height: 8, margin: '3px 0' }}>
      <motion.div initial={reduced ? false : { width: 0 }} whileInView={{ width: `${(Math.abs(v) / max) * 50}%` }} viewport={{ once: true }}
        transition={reduced ? { duration: 0 } : { duration: 0.6, delay: d }}
        style={{ position: 'absolute', top: 0, height: 8, borderRadius: 99, background: c, [v >= 0 ? 'left' : 'right']: '50%' } as React.CSSProperties} />
    </div>
  );
  return (
    <div style={{ marginTop: 18 }}>
      {bands.map((b, i) => (
        <div key={b} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 120px', gap: 12, alignItems: 'center', padding: '6px 0' }}>
          <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.75)' }}>{b}</span>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '50%', top: -4, bottom: -4, width: 1, background: 'rgba(255,255,255,0.2)' }} />
            {bar(before[i], 'rgba(255,255,255,0.4)', i * 0.04)}
            {bar(after[i], ACCENT, 0.2 + i * 0.04)}
          </div>
          <span style={{ fontFamily: MONO, fontSize: 12, textAlign: 'right', color: 'rgba(255,255,255,0.65)' }}>{(before[i] * 100).toFixed(1)}% → <span style={{ color: ACCENT_BRIGHT }}>{(after[i] * 100).toFixed(1)}%</span></span>
        </div>
      ))}
      <p style={NOTE}>Median over (+) or under (−) prediction by price fifth. White: class Model 1. Periwinkle: Lasso + LightGBM blend.</p>
    </div>
  );
}

export default function HousePricesPage() {
  const reduced = usePrefersReducedMotion();
  const lasso = data.ladder.find((l) => l.model === 'Lasso')!;
  const m1 = data.ladder.find((l) => l.model.startsWith('Class Model 1'))!;
  const ols = data.ladder.find((l) => l.model.startsWith('All 79'))!;
  const ho = data.holdout.models;
  const shapMax = data.shap[0].value;

  return (
    <div style={{ minHeight: '100vh' }}>
      <DotGridBackground />
      <style>{`
        .hp-deliv { transition: border-color 0.2s, transform 0.2s; }
        .hp-deliv:hover { border-color: ${accentAlpha(0.45)} !important; transform: translateY(-2px); }
        .hp-wrap select:focus-visible, .hp-wrap input:focus-visible, .hp-wrap button:focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 2px; }
        @media (max-width: 767px) {
          .hp-wrap { padding: 0 20px !important; }
          .hp-eyebrow { font-size: 11px !important; letter-spacing: 0.25em !important; }
          .hp-est { grid-template-columns: 1fr !important; gap: 32px !important; }
          .hp-card { padding: 20px !important; }
          .hp-bar { grid-template-columns: 1fr 64px !important; gap: 8px 12px !important; }
          .hp-bar > div { grid-column: 1 / -1; grid-row: 2; }
          .hp-two { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* HERO: the estimator */}
      <section style={{ position: 'relative', zIndex: 1, padding: '132px 0 96px' }}>
        <div style={WRAP} className="hp-wrap">
          <Rise reduced={reduced}>
            <span className="hp-eyebrow" style={EYEBROW}>2026 · Real estate · Machine learning</span>
            <h1 style={{ fontFamily: INTER, fontSize: 'clamp(40px, 5.6vw, 76px)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.04em', lineHeight: 1.02, margin: '0 0 24px' }}>
              What is this house worth?
            </h1>
            <p style={{ ...BODY, maxWidth: 760 }}>
              Pick a neighborhood and describe a house in Ames, Iowa. The estimate comes from {data.n.toLocaleString('en-US')} real sales between 2006 and 2010,
              after I found that half of the prices I was given were not real.
            </p>
          </Rise>
          <Estimator reduced={reduced} />
        </div>
      </section>

      {/* AUDIT */}
      <Section pad="64px 0 120px">
        <Rise reduced={reduced}>
          <span className="hp-eyebrow" style={{ ...EYEBROW, borderLeft: `2px solid ${ACCENT}`, paddingLeft: 16, margin: '0 0 20px' }}>The audit</span>
          <h2 style={H2}>Half the prices were fake.</h2>
          <p style={BODY}>
            The class dataset had {A.rows_total.toLocaleString('en-US')} sales. The first {A.rows_real.toLocaleString('en-US')} are real. The other {A.rows_placeholder.toLocaleString('en-US')} come
            from a competition test set whose true prices are hidden, and their prices were placeholders: they bunch around {usdK(A.placeholder.mean)} with a spread of
            {' '}{usdK(A.placeholder.sd)}, against {usdK(A.real.sd)} for real homes, and they barely track quality (correlation {A.placeholder.corr_quality.toFixed(2)} against {A.real.corr_quality.toFixed(2)}).
          </p>
        </Rise>
        <Histogram reduced={reduced} />
        <div className="hp-two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
          {[{ k: 'Same six-input model, all rows', v: pct(A.model1_r2_all_rows, 0), dim: true }, { k: 'Same model, real sales only', v: pct(A.model1_r2_real_rows, 0), dim: false }].map((c) => (
            <div key={c.k} style={{ ...CARD, padding: 24 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>{c.k}</span>
              <div style={{ fontFamily: MONO, fontSize: 40, color: c.dim ? 'rgba(255,255,255,0.6)' : ACCENT_BRIGHT, marginTop: 6 }}>{c.v}</div>
              <span style={{ fontFamily: INTER, fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.6)' }}>of price variation explained</span>
            </div>
          ))}
        </div>
        <p style={NOTE}>From here on: the {A.rows_real.toLocaleString('en-US')} real sales, minus {data.droppedBig} houses over 4,000 sq ft, as the dataset&apos;s author recommends.</p>
      </Section>

      {/* LADDER */}
      <Section pad="40px 0 120px">
        <Rise reduced={reduced}>
          <span className="hp-eyebrow" style={EYEBROW}>The model ladder</span>
          <h2 style={H2}>Within {pct(lasso.medianPctError)} on homes it never saw.</h2>
          <p style={BODY}>
            Median error on held-out homes, from repeated five-fold cross-validation, with every cleaning step fit inside the folds.
            Lasso keeps the useful signal from 79 inputs and shrinks the rest. With {data.n.toLocaleString('en-US')} houses and mostly straight-line relationships,
            regularized regression beats the tree models. Trained on 2006 to 2009 and tested on {data.holdout.n_test} sales from 2010, Lasso still misses by
            only {pct(ho.Lasso.median_pct_error)}, against {pct(ho['Class Model 1 (6 inputs)'].median_pct_error)} for the six-input model.
          </p>
        </Rise>
        <Ladder reduced={reduced} />
        <p style={NOTE}>Median absolute percentage error, lower is better. Lasso&apos;s typical miss is {usd(lasso.mae)} in mean absolute terms.</p>
      </Section>

      {/* WHAT CHANGED */}
      <Section pad="40px 0 120px">
        <Rise reduced={reduced}>
          <span className="hp-eyebrow" style={EYEBROW}>What changed</span>
          <h2 style={H2}>Three conclusions flipped on real data.</h2>
        </Rise>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginTop: 24 }}>
          <div style={{ ...CARD, padding: 28 }}>
            <span style={{ fontFamily: MONO, fontSize: 13, color: ACCENT }}>01</span>
            <h3 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 600, color: '#ffffff', margin: '12px 0 10px' }}>More inputs won</h3>
            <p style={{ fontFamily: INTER, fontSize: 15, fontWeight: 300, lineHeight: 1.65, color: 'rgba(255,255,255,0.72)', margin: 0 }}>
              With placeholder prices, the 79-input model looked like it overfit. On real sales it misses by {pct(ols.medianPctError)} against {pct(m1.medianPctError)} for six inputs.
            </p>
          </div>
          <div style={{ ...CARD, padding: 28 }}>
            <span style={{ fontFamily: MONO, fontSize: 13, color: ACCENT }}>02</span>
            <h3 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 600, color: '#ffffff', margin: '12px 0 10px' }}>Quality is worth {Math.round(data.model1Real.sqft_per_quality / 5) * 5} sq ft</h3>
            <p style={{ fontFamily: INTER, fontSize: 15, fontWeight: 300, lineHeight: 1.65, color: 'rgba(255,255,255,0.72)', margin: 0 }}>
              The fake rows had flattened the quality effect, making one quality step look equal to 225 sq ft. The same six-input model on real sales says about {Math.round(data.model1Real.sqft_per_quality / 5) * 5}.
              Holding age and neighborhood fixed, as the estimator above does, it is still about {Math.round(E.coef.OverallQual / E.coef.GrLivArea / 5) * 5}. Either way, upgrades matter more than the class version said.
            </p>
          </div>
          <div style={{ ...CARD, padding: 28 }}>
            <span style={{ fontFamily: MONO, fontSize: 13, color: ACCENT }}>03</span>
            <h3 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 600, color: '#ffffff', margin: '12px 0 10px' }}>Less bias at the extremes</h3>
            <BiasChart reduced={reduced} />
          </div>
        </div>
      </Section>

      {/* DRIVERS */}
      <Section pad="40px 0 120px">
        <Rise reduced={reduced}>
          <span className="hp-eyebrow" style={EYEBROW}>What drives price</span>
          <h2 style={H2}>Space and quality, then age.</h2>
          <p style={BODY}>SHAP values measure how far each input moves a single prediction. Living area and quality lead by a wide margin, followed by when the house was built and how much basement it has.</p>
        </Rise>
        <div style={{ marginTop: 32, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {data.shap.map((f, i) => (
            <div key={f.feature} className="hp-bar" style={{ display: 'grid', gridTemplateColumns: '260px 1fr 90px', gap: 28, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontFamily: INTER, fontSize: 16, fontWeight: i < 2 ? 500 : 300, color: 'rgba(255,255,255,0.88)' }}>{f.feature}</span>
              <div style={{ height: 10, borderRadius: 99, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <motion.div initial={reduced ? false : { width: 0 }} whileInView={{ width: `${(f.value / shapMax) * 100}%` }} viewport={{ once: true, amount: 0.5 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.8, delay: i * 0.05 }}
                  style={{ height: '100%', borderRadius: 99, background: i < 2 ? ACCENT : 'rgba(255,255,255,0.4)' }} />
              </div>
              <span style={{ fontFamily: MONO, fontSize: 15, textAlign: 'right', color: 'rgba(255,255,255,0.7)' }}>{f.value.toFixed(3)}</span>
            </div>
          ))}
        </div>
        <p style={NOTE}>Mean absolute SHAP value in log price, LightGBM fit on all {data.n.toLocaleString('en-US')} sales.</p>
      </Section>

      {/* METHOD + DELIVERABLES */}
      <Section pad="40px 0 120px">
        <Rise reduced={reduced}>
          <span className="hp-eyebrow" style={EYEBROW}>How it was built</span>
          <h2 style={H2}>Check the data before the model.</h2>
        </Rise>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginTop: 24 }}>
          {[
            { t: 'Audit first', b: 'Compared the spread and the quality relationship of every block of rows before fitting anything. The placeholder block stood out on both.' },
            { t: 'Cross-validated', b: 'Repeated five-fold cross-validation, three repeats. Imputation, scaling and encoding are fit inside each fold, so no held-out home leaks into training.' },
            { t: 'Tested on the future', b: `Trained on 2006 to 2009 and tested on ${data.holdout.n_test} sales from 2010, the year after the crash.` },
            { t: 'Log prices', b: 'Models predict the log of price, so errors are relative: missing a $400K house by $20K counts the same as a $100K house by $5K.' },
          ].map((m, i) => (
            <div key={m.t} style={{ ...CARD, padding: 28 }}>
              <span style={{ fontFamily: MONO, fontSize: 13, color: ACCENT }}>{String(i + 1).padStart(2, '0')}</span>
              <h3 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 600, color: '#ffffff', margin: '12px 0 10px' }}>{m.t}</h3>
              <p style={{ fontFamily: INTER, fontSize: 15, fontWeight: 300, lineHeight: 1.65, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{m.b}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 120 }}>
          <span className="hp-eyebrow" style={EYEBROW}>Deliverables</span>
          <h2 style={{ ...H2, margin: '0 0 40px' }}>What I built</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {[
              { kind: 'Code', title: 'GitHub repo', body: 'The audit, the model ladder, the 2010 holdout, the estimator fit and every number on this page.', href: REPO_URL, cta: 'View the code' },
              { kind: 'Data', title: 'Ames house prices', body: "Dean De Cock's Ames, Iowa sales data as published in Kaggle's House Prices competition. This project uses its 1,460 priced sales.", href: 'https://www.kaggle.com/c/house-prices-advanced-regression-techniques', cta: 'Open the dataset' },
            ].map((d) => (
              <a key={d.title} href={d.href} target="_blank" rel="noopener noreferrer" className="hp-deliv"
                style={{ ...CARD, padding: 32, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 230 }}>
                <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>{d.kind}</span>
                <span style={{ fontFamily: MONO, fontSize: 24, color: '#ffffff' }}>{d.title}</span>
                <span style={{ fontFamily: INTER, fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65 }}>{d.body}</span>
                <span style={{ marginTop: 'auto', fontFamily: INTER, fontSize: 14, fontWeight: 500, color: ACCENT_BRIGHT }}>{d.cta} →</span>
              </a>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

// Public analysis repo, created Nov 8 2026.
const REPO_URL = 'https://github.com/sebafleon-10/housing-prices';
