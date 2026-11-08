'use client';

import { useId, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { MONO } from '@/lib/fonts';
import { DotGridBackground } from '@/components/ui/dot-grid-background';
import { ACCENT, ACCENT_BRIGHT, accentAlpha } from '@/lib/accent';
import { BODY, CARD, H1, H2, Head, INK, INTER, LABEL, NOTE, ProjectLinks, Rise, WRAP, usePrefersReducedMotion, useStuck } from '../_components/project-kit';
import data from './houses.json';

// The estimator's range strip carries the whole page: a hairline axis, a
// translucent band for a spread, and a bright tick for the point estimate.

const E = data.estimator;
const A = data.audit;
const pct = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`;
const usd = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`;
const usdK = (v: number) => `$${Math.round(v / 1000)}K`;
const BAND = accentAlpha(0.32);
const BAND_DIM = 'rgba(255,255,255,0.16)';

// Ames neighborhood codes from the dataset documentation.
const NB_NAMES: Record<string, string> = {
  Blmngtn: 'Bloomington Heights', Blueste: 'Bluestem', BrDale: 'Briardale', BrkSide: 'Brookside', ClearCr: 'Clear Creek',
  CollgCr: 'College Creek', Crawfor: 'Crawford', Edwards: 'Edwards', Gilbert: 'Gilbert', IDOTRR: 'Iowa DOT and Rail Road',
  MeadowV: 'Meadow Village', Mitchel: 'Mitchell', NAmes: 'North Ames', NoRidge: 'Northridge', NPkVill: 'Northpark Villa',
  NridgHt: 'Northridge Heights', NWAmes: 'Northwest Ames', OldTown: 'Old Town', SWISU: 'South and West of Iowa State',
  Sawyer: 'Sawyer', SawyerW: 'Sawyer West', Somerst: 'Somerset', StoneBr: 'Stone Brook', Timber: 'Timberland', Veenker: 'Veenker',
};

// Section glyph: a tiny range strip.
const GLYPH = (
  <svg width="20" height="12" viewBox="0 0 20 12">
    <line x1="0" y1="6" x2="20" y2="6" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
    <rect x="4" y="3" width="11" height="6" rx="3" fill={BAND} />
    <rect x="9" y="0" width="2" height="12" fill={ACCENT_BRIGHT} />
  </svg>
);

function Section({ children, pad = '120px 0' }: { children: React.ReactNode; pad?: string }) {
  return <section style={{ position: 'relative', zIndex: 1, padding: pad }}><div style={WRAP} className="hp-wrap">{children}</div></section>;
}

function useReveal<T extends Element>() {
  const ref = useRef<T>(null);
  const seen = useInView(ref, { once: true, amount: 0.35 });
  return [ref, seen] as const;
}

// One strip. Positions are 0 to 100 along the axis. The band opens outward
// from the tick, the page's motion signature.
function Strip({ from, to, tick, strong, show, reduced, delay = 0, height = 22, ghost }: {
  from: number; to: number; tick?: number; strong?: boolean; show: boolean; reduced: boolean; delay?: number; height?: number; ghost?: number;
}) {
  const t = tick ?? (from + to) / 2;
  const origin = to > from ? `${((t - from) / (to - from)) * 100}%` : '50%';
  const mid = height / 2;
  return (
    <div style={{ position: 'relative', height }}>
      <span style={{ position: 'absolute', left: 0, right: 0, top: mid - 0.5, height: 1, background: 'rgba(255,255,255,0.14)' }} />
      <motion.span key={reduced ? "band-still" : "band"} initial={reduced ? false : { scaleX: 0 }} animate={show ? { scaleX: 1 } : undefined}
        transition={reduced ? { duration: 0 } : { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'absolute', left: `${from}%`, width: `${Math.max(0.6, to - from)}%`, top: mid - 5, height: 10, borderRadius: 99, background: strong ? BAND : BAND_DIM, transformOrigin: origin }} />
      {ghost !== undefined && <span style={{ position: 'absolute', left: `${ghost}%`, top: mid - 7, width: 2, height: 14, marginLeft: -1, background: 'rgba(255,255,255,0.6)' }} />}
      {tick !== undefined && (
        <motion.span key={reduced ? "tick-still" : "tick"} initial={reduced ? false : { opacity: 0 }} animate={show ? { opacity: 1 } : undefined} transition={reduced ? { duration: 0 } : { duration: 0.25, delay: delay + 0.15 }}
          style={{ position: 'absolute', left: `${tick}%`, top: mid - 9, width: 2, height: 18, marginLeft: -1, background: strong ? ACCENT_BRIGHT : '#ffffff' }} />
      )}
    </div>
  );
}

function Axis({ ticks, cols, className }: { ticks: { at: number; label: string }[]; cols: string; className?: string }) {
  return (
    <div className={className} style={{ display: 'grid', gridTemplateColumns: cols, gap: 28, marginTop: 6 }}>
      <span />
      <div style={{ position: 'relative', height: 16, fontFamily: MONO, fontSize: 11, color: INK.faint }}>
        {ticks.map((t) => (
          <span key={t.label} style={{ position: 'absolute', left: `${t.at}%`, transform: t.at === 0 ? 'none' : t.at === 100 ? 'translateX(-100%)' : 'translateX(-50%)', whiteSpace: 'nowrap' }}>{t.label}</span>
        ))}
      </div>
      <span />
    </div>
  );
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
const NB_SORTED = [...E.neighborhoods].sort((p, q) => (NB_NAMES[p.code] ?? p.code).localeCompare(NB_NAMES[q.code] ?? q.code));

function estimate(x: Inputs, nb: string) {
  let lp = E.const + (NB_EFFECT[nb] ?? 0);
  for (const s of SLIDERS) lp += E.coef[s.key] * x[s.key];
  return Math.exp(lp);
}

const SPAN = 500_000;
// Rounded so the server and the browser print the same style string (Math.exp differs in the last digits).
const onAxis = (v: number) => Math.round(Math.min(100, Math.max(0, (v / SPAN) * 100)) * 100) / 100;

function Estimator({ reduced }: { reduced: boolean }) {
  const [x, setX] = useState<Inputs>(DEFAULTS);
  const [nb, setNb] = useState<string>(E.base);
  const [delta, setDelta] = useState<number | null>(null);
  const id = useId();
  const pinRef = useRef<HTMLDivElement>(null);
  const stuck = useStuck(pinRef, 70);
  const price = estimate(x, nb);
  const lo = price * (1 - E.p80PctError), hi = price * (1 + E.p80PctError);
  const qualityGain = price * (Math.exp(E.coef.OverallQual) - 1);
  const sqftEquiv = E.coef.OverallQual / E.coef.GrLivArea;
  const change = (nx: Inputs, nnb: string) => { setDelta(estimate(nx, nnb) - price); setX(nx); setNb(nnb); };
  const moveTo = reduced ? { duration: 0 } : { duration: 0.25 };

  return (
    <div className="hp-est" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)', gap: 48, marginTop: 48, alignItems: 'start' }}>
      <div style={{ ...CARD, padding: 28 }} className="hp-card hp-inputs">
        {/* Phones: the answer pins above the sliders, so dragging never hides it. */}
        <div ref={pinRef} className={`hp-pin${stuck ? ' pk-stuck' : ''}`} aria-hidden>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontFamily: MONO, fontSize: 26, color: ACCENT_BRIGHT, letterSpacing: '-0.02em' }}>{usd(price)}</span>
            <span style={{ fontFamily: MONO, fontSize: 12, color: INK.soft, whiteSpace: 'nowrap' }}>{usdK(lo)} to {usdK(hi)}</span>
          </div>
          <div style={{ position: 'relative', height: 12, marginTop: 6 }}>
            <span style={{ position: 'absolute', left: 0, right: 0, top: 5.5, height: 1, background: 'rgba(255,255,255,0.14)' }} />
            <span style={{ position: 'absolute', left: `${onAxis(lo)}%`, width: `${onAxis(hi) - onAxis(lo)}%`, top: 2, height: 8, borderRadius: 99, background: BAND, transition: 'all 0.25s' }} />
            <span style={{ position: 'absolute', left: `${onAxis(price)}%`, top: 0, width: 2, height: 12, marginLeft: -1, background: ACCENT_BRIGHT, transition: 'left 0.25s' }} />
          </div>
        </div>

        <label htmlFor={`${id}-nb`} style={{ ...LABEL, display: 'block', fontSize: 11, marginBottom: 8 }}>Neighborhood</label>
        <select id={`${id}-nb`} value={nb} onChange={(e) => change(x, e.target.value)} className="hp-select"
          style={{ width: '100%', fontFamily: INTER, fontSize: 15, color: '#ffffff', background: '#0a0a0a', border: '2px solid rgba(255,255,255,0.22)', borderRadius: 10, padding: '9px 38px 9px 12px', marginBottom: 24 }}>
          {NB_SORTED.map((n) => <option key={n.code} value={n.code}>{NB_NAMES[n.code] ?? n.code}</option>)}
        </select>
        {SLIDERS.map((s) => {
          const [min, , max] = E.ranges[s.key];
          const a = roundTo(min, s.step), b = roundTo(max, s.step);
          return (
            <div key={s.key} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <label htmlFor={`${id}-${s.key}`} style={{ fontFamily: INTER, fontSize: 15, color: 'rgba(255,255,255,0.85)' }}>{s.label}</label>
                <span style={{ fontFamily: MONO, fontSize: 14, color: '#ffffff' }}>{s.fmt(x[s.key])}</span>
              </div>
              <input id={`${id}-${s.key}`} type="range" min={a} max={b} step={s.step} value={x[s.key]} aria-valuetext={s.fmt(x[s.key])}
                onChange={(e) => change({ ...x, [s.key]: +e.target.value }, nb)} className="hp-range" style={{ width: '100%', accentColor: ACCENT, margin: '4px 0 0' }} />
              <div aria-hidden style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 11, color: INK.faint }}>
                <span>{s.fmt(a)}</span><span>{s.fmt(b)}</span>
              </div>
            </div>
          );
        })}
        <button onClick={() => { setX(DEFAULTS); setNb(E.base); setDelta(null); }} className="hp-reset"
          style={{ marginTop: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: MONO, fontSize: 12, color: INK.label, textDecoration: 'underline', textUnderlineOffset: 4 }}>
          Reset to a typical Ames house
        </button>
      </div>

      <div className="hp-answer">
        <span style={LABEL}>Estimated sale price, 2006 to 2010</span>
        <div aria-live="polite" style={{ fontFamily: MONO, fontSize: 'clamp(44px, 6vw, 72px)', color: ACCENT_BRIGHT, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '8px 0 4px' }}>{usd(price)}</div>
        <div style={{ fontFamily: MONO, fontSize: 13, minHeight: 20, color: delta && delta > 0 ? ACCENT_BRIGHT : INK.soft }}>
          {delta !== null && Math.round(delta) !== 0 ? `${delta > 0 ? '+' : '−'}${usd(Math.abs(delta))} from your last change` : ' '}
        </div>
        <p style={{ fontFamily: INTER, fontSize: 15, fontWeight: 300, color: INK.soft, margin: '10px 0 0', lineHeight: 1.6 }}>
          8 in 10 similar homes sold between <span style={{ color: '#ffffff' }}>{usdK(lo)}</span> and <span style={{ color: '#ffffff' }}>{usdK(hi)}</span>.
        </p>
        <div style={{ position: 'relative', height: 36, marginTop: 16 }} aria-hidden>
          {[0, 100_000, 200_000, 300_000, 400_000, 500_000].map((t) => (
            <span key={t} style={{ position: 'absolute', left: `${onAxis(t)}%`, top: 10, width: 1, height: 16, background: 'rgba(255,255,255,0.14)' }} />
          ))}
          <span style={{ position: 'absolute', left: 0, right: 0, top: 17.5, height: 1, background: 'rgba(255,255,255,0.22)' }} />
          <motion.span animate={{ left: `${onAxis(lo)}%`, width: `${onAxis(hi) - onAxis(lo)}%` }} transition={moveTo}
            style={{ position: 'absolute', top: 11, height: 14, borderRadius: 99, background: BAND }} />
          <motion.span animate={{ left: `${onAxis(price)}%` }} transition={moveTo}
            style={{ position: 'absolute', top: 4, width: 3, height: 28, marginLeft: -1.5, borderRadius: 2, background: ACCENT_BRIGHT }} />
        </div>
        <div style={{ position: 'relative', height: 14, fontFamily: MONO, fontSize: 11, color: INK.faint }}>
          {['$0', '$100K', '$200K', '$300K', '$400K', '$500K'].map((l, i) => (
            <span key={l} style={{ position: 'absolute', left: `${i * 20}%`, transform: i === 0 ? 'none' : i === 5 ? 'translateX(-100%)' : 'translateX(-50%)' }}>{l}</span>
          ))}
        </div>

        <div style={{ ...CARD, padding: 20, marginTop: 28 }}>
          <span style={{ ...LABEL, fontSize: 11, color: ACCENT }}>Size or quality?</span>
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
  const gridMax = Math.floor(max / 200) * 200;
  const spike = placeholder.indexOf(Math.max(...placeholder));
  const [ref, seen] = useReveal<HTMLDivElement>();
  const show = seen || reduced;
  const n = real.length;
  const top = edges[edges.length - 1];
  const realLo = A.real.mean - A.real.sd, realHi = A.real.mean + A.real.sd;
  const phLo = A.placeholder.mean - A.placeholder.sd, phHi = A.placeholder.mean + A.placeholder.sd;
  const ax = (v: number) => Math.min(100, Math.max(0, (v / top) * 100));
  return (
    <div ref={ref} style={{ ...CARD, padding: '28px 28px 22px', marginTop: 40 }} className="hp-card">
      <div style={{ display: 'flex', gap: '8px 24px', flexWrap: 'wrap', fontFamily: MONO, fontSize: 12, color: INK.label, marginBottom: 22 }}>
        <span><i style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'rgba(255,255,255,0.45)', marginRight: 8 }} />{A.rows_real.toLocaleString('en-US')} real sales</span>
        <span><i style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: ACCENT, marginRight: 8 }} />{A.rows_placeholder.toLocaleString('en-US')} placeholder prices</span>
        <span>Homes per $20K price bin</span>
      </div>
      <div style={{ position: 'relative', height: 220, marginLeft: 34 }}>
        {[200, 400, 600].filter((g) => g <= gridMax).map((g) => (
          <div key={g} style={{ position: 'absolute', left: 0, right: 0, bottom: `${(g / max) * 100}%`, borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
            <span style={{ position: 'absolute', left: -34, top: -8, fontFamily: MONO, fontSize: 11, color: INK.faint }}>{g}</span>
          </div>
        ))}
        <div role="img" aria-label="Histogram: real sale prices spread from under $100K to over $400K; placeholder prices bunch in a narrow spike around $180K"
          style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, gap: 3, alignItems: 'end' }}>
          {real.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 1, alignItems: 'end', height: '100%' }}>
              {[{ v: r, c: 'rgba(255,255,255,0.45)' }, { v: placeholder[i], c: ACCENT }].map((b, j) => (
                <motion.div key={`${j}-${reduced}`} initial={reduced ? false : { height: 0 }} animate={show ? { height: `${(b.v / max) * 100}%` } : undefined}
                  transition={reduced ? { duration: 0 } : { duration: 0.8, delay: i * 0.02 + j * 0.3 }}
                  style={{ flex: 1, background: b.c, borderRadius: '2px 2px 0 0' }} />
              ))}
            </div>
          ))}
        </div>
        {/* The headline, written on the chart. */}
        <div className="hp-callout" style={{ position: 'absolute', left: `${((spike + 2.3) / n) * 100}%`, top: 2, paddingLeft: 12, borderLeft: `1px solid ${ACCENT}`, fontFamily: MONO, fontSize: 12, lineHeight: 1.5, color: ACCENT_BRIGHT, whiteSpace: 'nowrap' }}>
          Placeholders bunch here<br /><span style={{ color: INK.soft }}>mean {usdK(A.placeholder.mean)}, spread {usdK(A.placeholder.sd)}</span>
        </div>
      </div>
      <div style={{ position: 'relative', height: 16, marginLeft: 34, marginTop: 8, fontFamily: MONO, fontSize: 11, color: INK.faint }}>
        {[0, 100_000, 200_000, 300_000, 400_000, top].map((t) => (
          <span key={t} className={t % 200_000 && t !== top ? 'hp-tick-odd' : undefined} style={{ position: 'absolute', left: `${ax(t)}%`, transform: t === 0 ? 'none' : t === top ? 'translateX(-100%)' : 'translateX(-50%)' }}>{t === top ? `$${t / 1000}K+` : `$${t / 1000}K`}</span>
        ))}
      </div>

      {/* The same spread, as the estimator's strip: mean and one standard deviation either side. */}
      <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {[
          { k: 'Real sales', lo: realLo, hi: realHi, mean: A.real.mean, strong: false },
          { k: 'Placeholders', lo: phLo, hi: phHi, mean: A.placeholder.mean, strong: true },
        ].map((r, i) => (
          <div key={r.k} className="hp-row" style={{ display: 'grid', gridTemplateColumns: '120px minmax(0, 1fr) 150px', gap: 28, alignItems: 'center', padding: '4px 0', marginLeft: 0 }}>
            <span style={{ fontFamily: INTER, fontSize: 14, color: r.strong ? ACCENT_BRIGHT : 'rgba(255,255,255,0.85)' }}>{r.k}</span>
            <Strip from={ax(r.lo)} to={ax(r.hi)} tick={ax(r.mean)} strong={r.strong} show={show} reduced={reduced} delay={0.9 + i * 0.15} />
            <span style={{ fontFamily: MONO, fontSize: 12, textAlign: 'right', color: INK.soft }}>{usdK(r.lo)} to {usdK(r.hi)}</span>
          </div>
        ))}
        <p style={{ ...NOTE, marginTop: 8 }}>Tick: mean price. Band: one standard deviation either side.</p>
      </div>
    </div>
  );
}

const LADDER_COLS = '260px minmax(0, 1fr) 120px';
function Ladder({ reduced }: { reduced: boolean }) {
  const rows = [...data.ladder].sort((p, q) => p.medianPctError - q.medianPctError);
  const lowest = rows[0].model;
  const [ref, seen] = useReveal<HTMLDivElement>();
  const show = seen || reduced;
  // Axis: -10% to +10% around the true price.
  const at = (v: number) => 50 + (v / 0.1) * 50;
  return (
    <div ref={ref} style={{ marginTop: 40 }}>
      <Axis cols={LADDER_COLS} className="hp-axis" ticks={[{ at: 0, label: '−10%' }, { at: 25, label: '−5%' }, { at: 50, label: 'true price' }, { at: 75, label: '+5%' }, { at: 100, label: '+10%' }]} />
      <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.12)', position: 'relative' }}>
        {rows.map((r, i) => {
          const isLow = r.model === lowest, isHead = r.model === 'Lasso';
          return (
            <div key={r.model} className="hp-row" style={{ display: 'grid', gridTemplateColumns: LADDER_COLS, gap: 28, alignItems: 'center', padding: '13px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontFamily: INTER, fontSize: 16, fontWeight: isLow || isHead ? 500 : 300, color: isLow || isHead ? '#ffffff' : 'rgba(255,255,255,0.8)' }}>
                {r.model}
                {isLow && <span style={{ ...LABEL, fontSize: 10, color: ACCENT_BRIGHT, marginLeft: 10 }}>Lowest</span>}
                {isHead && <span style={{ ...LABEL, fontSize: 10, marginLeft: 10 }}>Headline</span>}
              </span>
              <Strip from={at(-r.medianPctError)} to={at(r.medianPctError)} tick={50} strong={isLow || isHead} show={show} reduced={reduced} delay={i * 0.06} />
              <span style={{ fontFamily: MONO, fontSize: 16, textAlign: 'right', color: isLow ? ACCENT_BRIGHT : INK.soft }}>±{pct(r.medianPctError)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const BIAS_COLS = '130px minmax(0, 1fr) 130px';
function BiasChart({ reduced }: { reduced: boolean }) {
  const bands = ['Cheapest fifth', 'Second', 'Middle', 'Fourth', 'Priciest fifth'];
  const before = data.bias['Class Model 1 (6 inputs)'], after = data.bias['Blend'];
  const [ref, seen] = useReveal<HTMLDivElement>();
  const show = seen || reduced;
  const at = (v: number) => 50 + (v / 0.08) * 50; // -8% to +8%
  return (
    <div ref={ref} style={{ marginTop: 20 }}>
      <Axis cols={BIAS_COLS} className="hp-axis" ticks={[{ at: 0, label: '−8%' }, { at: 25, label: '−4%' }, { at: 50, label: '0' }, { at: 75, label: '+4%' }, { at: 100, label: '+8%' }]} />
      <div style={{ marginTop: 6 }}>
        {bands.map((b, i) => {
          const a = at(before[i]), z = at(after[i]);
          return (
            <div key={b} className="hp-row" style={{ display: 'grid', gridTemplateColumns: BIAS_COLS, gap: 28, alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontFamily: INTER, fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.85)' }}>{b}</span>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '50%', top: -7, bottom: -7, width: 1, background: 'rgba(255,255,255,0.22)' }} />
                <Strip from={Math.min(a, z)} to={Math.max(a, z)} tick={z} ghost={a} strong show={show} reduced={reduced} delay={i * 0.06} />
              </div>
              <span style={{ fontFamily: MONO, fontSize: 13, textAlign: 'right', color: INK.soft, whiteSpace: 'nowrap' }}>{(before[i] * 100).toFixed(1)}% → <span style={{ color: ACCENT_BRIGHT }}>{(after[i] * 100).toFixed(1)}%</span></span>
            </div>
          );
        })}
      </div>
      <p style={NOTE}>Median over (+) or under (−) prediction by price fifth. White tick: class Model 1. Periwinkle tick: Lasso + LightGBM blend. The band is how far each fifth moved toward zero.</p>
    </div>
  );
}

function R2Card({ k, v, strong, show, reduced }: { k: string; v: number; strong: boolean; show: boolean; reduced: boolean }) {
  return (
    <div style={{ ...CARD, padding: 24 }}>
      <span style={{ ...LABEL, fontSize: 11 }}>{k}</span>
      <div style={{ fontFamily: MONO, fontSize: 40, color: strong ? ACCENT_BRIGHT : 'rgba(255,255,255,0.7)', marginTop: 6 }}>{pct(v, 0)}</div>
      <div style={{ margin: '6px 0 6px' }}><Strip from={0} to={v * 100} tick={v * 100} strong={strong} show={show} reduced={reduced} delay={0.1} /></div>
      <span style={{ fontFamily: INTER, fontSize: 14, fontWeight: 300, color: INK.soft }}>of price variation explained</span>
    </div>
  );
}

function Drivers({ reduced }: { reduced: boolean }) {
  const shapMax = data.shap[0].value;
  const axisMax = Math.ceil(shapMax * 100) / 100;
  const at = (v: number) => (v / axisMax) * 100;
  const [ref, seen] = useReveal<HTMLDivElement>();
  const show = seen || reduced;
  const cols = '260px minmax(0, 1fr) 90px';
  return (
    <div ref={ref} style={{ marginTop: 32 }}>
      <Axis cols={cols} className="hp-axis" ticks={[0, 0.02, 0.04, 0.06, 0.08].filter((t) => t <= axisMax + 1e-9).map((t) => ({ at: at(t), label: t.toFixed(2) }))} />
      <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        {data.shap.map((f, i) => (
          <div key={f.feature} className="hp-row" style={{ display: 'grid', gridTemplateColumns: cols, gap: 28, alignItems: 'center', padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontFamily: INTER, fontSize: 16, fontWeight: i < 2 ? 500 : 300, color: 'rgba(255,255,255,0.9)' }}>{f.feature}</span>
            <Strip from={0} to={at(f.value)} tick={at(f.value)} strong={i < 2} show={show} reduced={reduced} delay={i * 0.05} />
            <span style={{ fontFamily: MONO, fontSize: 15, textAlign: 'right', color: INK.soft }}>{f.value.toFixed(3)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HousePricesPage() {
  const reduced = usePrefersReducedMotion();
  const lasso = data.ladder.find((l) => l.model === 'Lasso')!;
  const m1 = data.ladder.find((l) => l.model.startsWith('Class Model 1'))!;
  const ols = data.ladder.find((l) => l.model.startsWith('All 79'))!;
  const ho = data.holdout.models;
  const [r2Ref, r2Seen] = useReveal<HTMLDivElement>();

  return (
    <div style={{ minHeight: '100vh' }}>
      <DotGridBackground />
      <style>{`
        .hp-pin { display: none; }
        .hp-select { appearance: none; -webkit-appearance: none; cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5l5 5 5-5' stroke='%23ffffff' stroke-opacity='0.7' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") !important;
          background-repeat: no-repeat !important; background-position: right 14px center !important; transition: border-color 0.2s; }
        .hp-select:hover { border-color: rgba(255,255,255,0.45) !important; }
        .hp-wrap select:focus-visible, .hp-wrap input:focus-visible, .hp-wrap button:focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 2px; }
        .hp-reset:hover { color: #ffffff !important; }
        @media (max-width: 767px) {
          .hp-wrap { padding: 0 20px !important; }
          .hp-est { grid-template-columns: 1fr !important; gap: 32px !important; }
          .hp-card { padding: 20px !important; }
          .hp-pin { display: block; position: sticky; top: 70px; z-index: 5; background: #0d0d0d; margin: -20px -20px 18px; padding: 14px 20px 12px; border-bottom: 1px solid rgba(255,255,255,0.1); border-radius: 14px 14px 0 0; }
          .hp-row { grid-template-columns: 1fr auto !important; gap: 6px 12px !important; }
          .hp-row > div { grid-column: 1 / -1; grid-row: 2; }
          .hp-axis { grid-template-columns: 1fr !important; }
          .hp-axis > span { display: none; }
          .hp-two { grid-template-columns: 1fr !important; }
          .hp-tick-odd { display: none; }
          .hp-callout { left: auto !important; right: 0; top: auto !important; bottom: 34%; font-size: 11px !important; text-align: right; border-left: none !important; padding-left: 0 !important; padding-right: 10px; border-right: 1px solid ${ACCENT}; }
          .hp-spec { grid-template-columns: 1fr !important; gap: 6px !important; }
        }
      `}</style>

      {/* HERO: the estimator */}
      <section style={{ position: 'relative', zIndex: 1, padding: '132px 0 96px' }}>
        <div style={WRAP} className="hp-wrap">
          <Rise reduced={reduced}>
            <span className="pk-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: MONO, fontSize: 13, letterSpacing: '0.3em', textTransform: 'uppercase', color: INK.label, margin: '0 0 24px' }}>
              {GLYPH}2026 · Real estate · Machine learning
            </span>
            <h1 style={H1}>What is this house worth?</h1>
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
          <Head glyph={GLYPH} eyebrow="The audit" title="Half the prices were fake." />
          <p style={BODY}>
            The class dataset had {A.rows_total.toLocaleString('en-US')} sales. The first {A.rows_real.toLocaleString('en-US')} are real. The other {A.rows_placeholder.toLocaleString('en-US')} come
            from a competition test set whose true prices are hidden, and their prices were placeholders: they bunch around {usdK(A.placeholder.mean)} with a spread of
            {' '}{usdK(A.placeholder.sd)}, against {usdK(A.real.sd)} for real homes, and they barely track quality (correlation {A.placeholder.corr_quality.toFixed(2)} against {A.real.corr_quality.toFixed(2)}).
          </p>
        </Rise>
        <Histogram reduced={reduced} />
        <div ref={r2Ref} className="hp-two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
          <R2Card k="Same six-input model, all rows" v={A.model1_r2_all_rows} strong={false} show={r2Seen || reduced} reduced={reduced} />
          <R2Card k="Same model, real sales only" v={A.model1_r2_real_rows} strong show={r2Seen || reduced} reduced={reduced} />
        </div>
        <p style={NOTE}>From here on: the {A.rows_real.toLocaleString('en-US')} real sales, minus {data.droppedBig} houses over 4,000 sq ft, as the dataset&apos;s author recommends.</p>
      </Section>

      {/* LADDER */}
      <Section pad="40px 0 120px">
        <Rise reduced={reduced}>
          <Head glyph={GLYPH} eyebrow="The model ladder" title={<>Within {pct(lasso.medianPctError)} on homes it never saw.</>} />
          <p style={BODY}>
            Median error on held-out homes, from repeated five-fold cross-validation, with every cleaning step fit inside the folds.
            Lasso keeps the useful signal from 79 inputs and shrinks the rest. With {data.n.toLocaleString('en-US')} houses and mostly straight-line relationships,
            regularized regression beats the tree models. Trained on 2006 to 2009 and tested on {data.holdout.n_test} sales from 2010, Lasso still misses by
            only {pct(ho.Lasso.median_pct_error)}, against {pct(ho['Class Model 1 (6 inputs)'].median_pct_error)} for the six-input model.
          </p>
        </Rise>
        <Ladder reduced={reduced} />
        <p style={NOTE}>
          Each band is the median miss either side of the true price, so half of held-out homes land inside it. Narrower is better.
          Lowest: the blend. Headline: Lasso, the best single model and the one tested on 2010. Lasso&apos;s typical miss is {usd(lasso.mae)} in mean absolute terms.
        </p>
      </Section>

      {/* WHAT CHANGED */}
      <Section pad="40px 0 120px">
        <Rise reduced={reduced}>
          <Head glyph={GLYPH} eyebrow="What changed" title="Three conclusions flipped on real data." />
        </Rise>
        <div className="hp-two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
          <div style={{ ...CARD, padding: 28 }} className="hp-card">
            <span style={{ fontFamily: MONO, fontSize: 13, color: ACCENT }}>01</span>
            <h3 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 600, color: '#ffffff', margin: '12px 0 10px' }}>More inputs won</h3>
            <p style={{ fontFamily: INTER, fontSize: 15, fontWeight: 300, lineHeight: 1.65, color: INK.soft, margin: 0 }}>
              With placeholder prices, the 79-input model looked like it overfit. On real sales it misses by {pct(ols.medianPctError)} against {pct(m1.medianPctError)} for six inputs.
            </p>
          </div>
          <div style={{ ...CARD, padding: 28 }} className="hp-card">
            <span style={{ fontFamily: MONO, fontSize: 13, color: ACCENT }}>02</span>
            <h3 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 600, color: '#ffffff', margin: '12px 0 10px' }}>Quality is worth {Math.round(data.model1Real.sqft_per_quality / 5) * 5} sq ft</h3>
            <p style={{ fontFamily: INTER, fontSize: 15, fontWeight: 300, lineHeight: 1.65, color: INK.soft, margin: 0 }}>
              The fake rows had flattened the quality effect, making one quality step look equal to 225 sq ft. The same six-input model on real sales says about {Math.round(data.model1Real.sqft_per_quality / 5) * 5}.
              Holding age and neighborhood fixed, as the estimator above does, it is still about {Math.round(E.coef.OverallQual / E.coef.GrLivArea / 5) * 5}. Either way, upgrades matter more than the class version said.
            </p>
          </div>
        </div>
        <div style={{ ...CARD, padding: 28, marginTop: 20 }} className="hp-card">
          <span style={{ fontFamily: MONO, fontSize: 13, color: ACCENT }}>03</span>
          <h3 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 600, color: '#ffffff', margin: '12px 0 4px' }}>Less bias at the extremes</h3>
          <BiasChart reduced={reduced} />
        </div>
      </Section>

      {/* DRIVERS */}
      <Section pad="40px 0 120px">
        <Rise reduced={reduced}>
          <Head glyph={GLYPH} eyebrow="What drives price" title="Space and quality, then age." />
          <p style={BODY}>SHAP values measure how far each input moves a single prediction. Living area and quality lead by a wide margin, followed by when the house was built and how much basement it has.</p>
        </Rise>
        <Drivers reduced={reduced} />
        <p style={NOTE}>Mean absolute SHAP value in log price, LightGBM fit on all {data.n.toLocaleString('en-US')} sales.</p>
      </Section>

      {/* METHOD + LINKS */}
      <Section pad="40px 0 120px">
        <Rise reduced={reduced}>
          <Head glyph={GLYPH} eyebrow="How it was built" title="Check the data before the model." />
        </Rise>
        {/* Method as a spec sheet: one ruled line per rule. */}
        <dl style={{ margin: '24px 0 0', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          {[
            { t: 'Audit first', b: 'Compared the spread and the quality relationship of every block of rows before fitting anything. The placeholder block stood out on both.' },
            { t: 'Cross-validated', b: 'Repeated five-fold cross-validation, three repeats. Imputation, scaling and encoding are fit inside each fold, so no held-out home leaks into training.' },
            { t: 'Tested on the future', b: `Trained on 2006 to 2009 and tested on ${data.holdout.n_test} sales from 2010, the year after the crash.` },
            { t: 'Log prices', b: 'Models predict the log of price, so errors are relative: missing a $400K house by $20K counts the same as a $100K house by $5K.' },
          ].map((m, i) => (
            <div key={m.t} className="hp-spec" style={{ display: 'grid', gridTemplateColumns: '64px 240px minmax(0, 1fr)', gap: 24, padding: '22px 0', borderBottom: '1px solid rgba(255,255,255,0.12)', alignItems: 'baseline' }}>
              <span style={{ fontFamily: MONO, fontSize: 13, color: ACCENT }}>{String(i + 1).padStart(2, '0')}</span>
              <dt style={{ fontFamily: INTER, fontSize: 19, fontWeight: 600, color: '#ffffff' }}>{m.t}</dt>
              <dd style={{ margin: 0, fontFamily: INTER, fontSize: 16, fontWeight: 300, lineHeight: 1.65, color: INK.soft, maxWidth: 640 }}>{m.b}</dd>
            </div>
          ))}
        </dl>

        <ProjectLinks links={[
          { kind: 'Code', title: 'GitHub repo', body: 'The audit, the model ladder, the 2010 holdout, the estimator fit and every number on this page.', href: REPO_URL, cta: 'View the code' },
          { kind: 'Data', title: 'Ames house prices', body: "Dean De Cock's Ames, Iowa sales data as published in Kaggle's House Prices competition. This project uses its 1,460 priced sales.", href: 'https://www.kaggle.com/c/house-prices-advanced-regression-techniques', cta: 'Open the dataset' },
        ]} />
      </Section>
    </div>
  );
}

// Public analysis repo, created Nov 8 2026.
const REPO_URL = 'https://github.com/sebafleon-10/housing-prices';
