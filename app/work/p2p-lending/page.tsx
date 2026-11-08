'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { MONO } from '@/lib/fonts';
import { DotGridBackground } from '@/components/ui/dot-grid-background';
import { ACCENT, ACCENT_BRIGHT, accentAlpha } from '@/lib/accent';
import { BODY, CARD, H1, H2, Head, INK, INTER, LABEL, NOTE, ProjectLinks, Rise, WRAP, usePrefersReducedMotion, useStuck } from '../_components/project-kit';
import { LoanField, readout, type SortMode } from './loan-field';
import data from './loan-book.json';

// The loan field's dots carry the whole page: every chart below the hero is
// drawn in the same dots, white for paid back, periwinkle for default.

const M = data.meta;
const pct = (v: number, d = 1) => `${(v * 100).toFixed(d)}`;
const int = (v: number) => v.toLocaleString('en-US');
const money = (m: number) => `$${m.toFixed(1)}M`;
const DOT_WHITE = 'rgba(255,255,255,0.55)';

// Section glyph: four loans, one defaulted.
const GLYPH = (
  <svg width="14" height="14" viewBox="0 0 14 14">
    <circle cx="3.5" cy="3.5" r="2.4" fill={DOT_WHITE} /><circle cx="10.5" cy="3.5" r="2.4" fill={DOT_WHITE} />
    <circle cx="3.5" cy="10.5" r="2.4" fill={DOT_WHITE} /><circle cx="10.5" cy="10.5" r="2.7" fill={ACCENT} />
  </svg>
);

const SORTS: { mode: SortMode; label: string }[] = [
  { mode: 'model', label: 'My model' },
  { mode: 'grade', label: 'LendingClub grade' },
  { mode: 'random', label: 'Unsorted' },
];

function cellsFor(mode: SortMode, share: number) {
  const r = readout(mode, share);
  return [
    { k: 'Loans funded', v: int(r.funded) },
    { k: 'Defaults avoided', v: `${r.avoided.toFixed(1)}%` },
    { k: 'Profit', v: money(r.profit) },
    { k: 'Return', v: `${r.roi.toFixed(2)}%` },
  ];
}

function Readouts({ mode, share, compact }: { mode: SortMode; share: number; compact?: boolean }) {
  return (
    <div className={compact ? 'p2p-ro-compact' : 'p2p-readouts'} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: compact ? 6 : 12 }}>
      {cellsFor(mode, share).map((c) => (
        <div key={c.k} style={compact ? { padding: '4px 2px' } : { ...CARD, padding: '14px 18px' }}>
          <span style={{ fontFamily: MONO, fontSize: compact ? 10 : 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: INK.label, whiteSpace: 'nowrap' }}>{c.k}</span>
          <div style={{ fontFamily: MONO, fontSize: compact ? 17 : 'clamp(20px, 2vw, 26px)', color: '#ffffff', marginTop: compact ? 2 : 6, letterSpacing: '-0.02em' }}>{c.v}</div>
        </div>
      ))}
    </div>
  );
}

function Legend() {
  const dot = (c: string, o: number) => <span style={{ width: 8, height: 8, borderRadius: 99, background: c, opacity: o, display: 'inline-block', marginRight: 8 }} />;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', fontFamily: MONO, fontSize: 12, color: INK.label }}>
      <span>{dot('#ffffff', 0.6)}Paid back</span>
      <span>{dot(ACCENT, 1)}Defaulted</span>
      <span>Safest on the left, dashed line is the cutoff</span>
    </div>
  );
}

function SortPills({ mode, setMode }: { mode: SortMode; setMode: (m: SortMode) => void }) {
  return (
    <div role="radiogroup" aria-label="Sort loans by" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {SORTS.map((s) => {
        const on = s.mode === mode;
        return (
          <button key={s.mode} role="radio" aria-checked={on} onClick={() => setMode(s.mode)} className="p2p-pill"
            style={{
              fontFamily: INTER, fontSize: 14, fontWeight: 500, cursor: 'pointer', borderRadius: 999,
              padding: '7px 15px', background: on ? accentAlpha(0.12) : 'transparent',
              border: `2px solid ${on ? ACCENT : 'rgba(255,255,255,0.22)'}`,
              color: on ? ACCENT_BRIGHT : 'rgba(255,255,255,0.8)', transition: 'all 0.2s',
            }}>{s.label}</button>
        );
      })}
    </div>
  );
}

// HERO: the visitor makes the lending decision themselves.
function Hero({ reduced }: { reduced: boolean }) {
  const [mode, setMode] = useState<SortMode>('model');
  const [share, setShare] = useState(70);
  const r = readout(mode, share);
  const pinRef = useRef<HTMLDivElement>(null);
  const stuck = useStuck(pinRef, 70);
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '132px 0 96px' }}>
      <div style={WRAP} className="p2p-wrap">
        <Rise reduced={reduced}>
          <span className="pk-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: MONO, fontSize: 13, letterSpacing: '0.3em', textTransform: 'uppercase', color: INK.label, margin: '0 0 24px' }}>
            {GLYPH}2026 · Credit risk · Machine learning
          </span>
          <h1 style={H1}>Which loans would you fund?</h1>
          <p style={{ ...BODY, maxWidth: 760 }}>
            Every dot is a real LendingClub loan from 2015. The bright ones never got paid back.
            I trained five models on {int(M.nTrain)} loans from 2007 to 2014 to sort them by risk
            before anyone knew how they would end. Switch the sorting, drag the cutoff, and see what
            each choice is worth.
          </p>
        </Rise>

        <div className="p2p-play" style={{ marginTop: 48 }}>
          <div className="p2p-a-pills"><SortPills mode={mode} setMode={setMode} /></div>
          {/* On phones this block pins under the Back pill so the numbers stay in view while you drag. */}
          <div ref={pinRef} className={`p2p-a-slider${stuck ? ' pk-stuck' : ''}`}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: INTER, fontSize: 14, color: 'rgba(255,255,255,0.78)' }}>
              <span style={{ whiteSpace: 'nowrap' }}>Fund the safest</span>
              <input type="range" min={5} max={100} step={1} value={share} onChange={(e) => setShare(+e.target.value)}
                aria-label="Share of loans funded" aria-valuetext={`${share} percent funded, ${money(r.profit)} profit`}
                className="p2p-range" style={{ flex: 1, minWidth: 0, accentColor: ACCENT }} />
              <span style={{ fontFamily: MONO, color: '#ffffff', minWidth: 44, textAlign: 'right' }}>{share}%</span>
            </label>
            <div className="p2p-phone-only" style={{ marginTop: 6 }}><Readouts mode={mode} share={share} compact /></div>
          </div>
          <div className="p2p-a-field">
            <LoanField mode={mode} share={share} reduced={reduced}
              label={`1,000 sampled 2015 loans sorted by ${SORTS.find((s) => s.mode === mode)?.label}, safest ${share} percent funded`} />
          </div>
          <div className="p2p-a-legend"><Legend /></div>
          <div className="p2p-a-ro p2p-desk-only"><Readouts mode={mode} share={share} /></div>
        </div>
        <p style={NOTE}>Dots are a 1,000-loan sample. Every number is computed on all {int(M.nTest)} loans issued in 2015.</p>
      </div>
    </section>
  );
}

// THE LOAN BOOK: a pinned field that the scroll walks through five states.
const curve = data.curves.model;
const STEPS: { mode: SortMode; share: number; eyebrow: string; title: string; body: string }[] = [
  {
    mode: 'random', share: 100, eyebrow: '01 · The accuracy trap',
    title: `${pct(M.approveAllAccuracy)}% accurate. Zero defaults caught.`,
    body: `Only ${pct(M.testDefaultRate)} percent of these loans defaulted, so a model that approves everyone is right ${pct(M.approveAllAccuracy)} percent of the time. Accuracy rewards it for missing every single default. That is why I judged every model on how well it ranks risk, not on accuracy.`,
  },
  {
    mode: 'grade', share: 70, eyebrow: '02 · Beat the platform',
    title: 'LendingClub already grades every loan.',
    body: `Sort by LendingClub's own sub-grade and fund the safest 70 percent: ${money(readout('grade', 70).profit)} in profit. The platform's grade is the bar to clear.`,
  },
  {
    mode: 'model', share: 70, eyebrow: '02 · Beat the platform',
    title: `Same 70 percent, ${money(readout('model', 70).profit - readout('grade', 70).profit)} more.`,
    body: `Sorted by my XGBoost model, the same number of loans earns ${money(readout('model', 70).profit)}. The defaults pile up further to the right, so fewer of them get funded. Same budget, better picks.`,
  },
  {
    mode: 'model', share: data.bestProfit[0], eyebrow: '03 · Growth or efficiency',
    title: 'The most profit means funding almost everyone.',
    body: `LendingClub's interest rates already price in most of the risk, so nearly every loan pays on average. Total profit peaks at ${money(data.bestProfit[3])} when you fund the safest ${data.bestProfit[0]} percent and turn away only the riskiest few.`,
  },
  {
    mode: 'model', share: data.bestRoi[0], eyebrow: '03 · Growth or efficiency',
    title: 'The best return means funding half.',
    body: `An investor with limited money cares about return per dollar. Funding only the safest ${data.bestRoi[0]} percent lifts the return from ${curve[99][4].toFixed(2)} to ${data.bestRoi[4].toFixed(2)} percent. The right cutoff depends on the lender, not the model.`,
  },
];
const STEP_VH = 75;

function LoanBook({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = el.offsetHeight - window.innerHeight;
      const p = Math.min(0.999, Math.max(0, -r.top / Math.max(1, span)));
      setStep(Math.floor(p * STEPS.length));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);
  const go = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const span = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY + ((i + 0.5) / STEPS.length) * span;
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  };
  const s = STEPS[step];

  return (
    <>
      {/* Desktop: pinned stage */}
      <section ref={ref} className="p2p-book" style={{ position: 'relative', zIndex: 1, height: `${STEPS.length * STEP_VH + 25}vh` }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', alignItems: 'center' }}>
          <div style={{ ...WRAP, display: 'grid', gridTemplateColumns: '34% 1fr', gap: 56, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'grid' }}>
                {STEPS.map((st, i) => {
                  const on = i === step;
                  return (
                    <motion.div key={i} aria-hidden={!on}
                      animate={{ opacity: on ? 1 : 0, y: on ? 0 : i < step ? -16 : 16 }}
                      // The outgoing step clears before the incoming one lands, so the two never overlap.
                      transition={reduced ? { duration: 0 } : on ? { duration: 0.4, delay: 0.16, ease: 'easeOut' } : { duration: 0.16, ease: 'easeIn' }}
                      style={{ gridArea: '1 / 1', pointerEvents: on ? 'auto' : 'none' }}>
                      <span style={{ ...LABEL, display: 'block', letterSpacing: '0.24em', margin: '0 0 20px', whiteSpace: 'nowrap' }}>{st.eyebrow}</span>
                      <h2 style={{ ...H2, fontSize: 'clamp(28px, 3vw, 42px)' }}>{st.title}</h2>
                      <p style={{ ...BODY, fontSize: 'clamp(16px, 1.3vw, 18px)' }}>{st.body}</p>
                    </motion.div>
                  );
                })}
              </div>
              {/* Step jumps: five dots in the field's own colors. */}
              <div role="group" aria-label="Loan book steps" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 32 }}>
                {STEPS.map((st, i) => (
                  <button key={i} onClick={() => go(i)} aria-label={`Step ${i + 1} of ${STEPS.length}: ${st.title}`} aria-current={i === step ? 'step' : undefined}
                    className="p2p-step" style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                    <span style={{ width: i === step ? 12 : 8, height: i === step ? 12 : 8, borderRadius: 99, background: i === step ? ACCENT : 'rgba(255,255,255,0.4)', transition: 'all 0.25s' }} />
                  </button>
                ))}
                <span style={{ fontFamily: MONO, fontSize: 12, color: INK.label, marginLeft: 10 }}>{step + 1} / {STEPS.length}</span>
              </div>
            </div>
            <div>
              <LoanField mode={s.mode} share={s.share} reduced={reduced} label={`${s.eyebrow}: ${s.title}`} />
              <div style={{ margin: '16px 0' }}><Legend /></div>
              <Readouts mode={s.mode} share={s.share} />
            </div>
          </div>
        </div>
      </section>

      {/* Phones: each step stacked with its own field */}
      <section className="p2p-book-mobile" style={{ position: 'relative', zIndex: 1, padding: '24px 0' }}>
        <div style={WRAP} className="p2p-wrap">
          {STEPS.map((st, i) => (
            <div key={i} style={{ margin: '0 0 72px' }}>
              <span style={{ ...LABEL, display: 'block', fontSize: 11, margin: '0 0 14px' }}>{st.eyebrow}</span>
              <h2 style={{ ...H2, fontSize: 28 }}>{st.title}</h2>
              <p style={{ ...BODY, fontSize: 16, marginBottom: 20 }}>{st.body}</p>
              <LoanField mode={st.mode} share={st.share} reduced label={`${st.eyebrow}: ${st.title}`} />
              <div style={{ marginTop: 14 }}><Readouts mode={st.mode} share={st.share} /></div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Section({ children, pad = '120px 0' }: { children: React.ReactNode; pad?: string }) {
  return <section style={{ position: 'relative', zIndex: 1, padding: pad }}><div style={WRAP} className="p2p-wrap">{children}</div></section>;
}

// A line of dots that appears left to right when it scrolls into view, the
// way the field's wave runs. color(i) picks each dot's fill.
function DotLine({ n, color, row = 0, label }: { n: number; color: (i: number) => string; row?: number; label: string }) {
  return (
    <svg className="p2p-dots" role="img" aria-label={label} viewBox={`0 0 ${Math.max(1, n) * 10} 10`}
      style={{ width: `calc(${Math.max(1, n)} * var(--p2p-pitch))`, height: 'var(--p2p-pitch)', display: 'block', overflow: 'visible' }}>
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={i * 10 + 5} cy={5} r={3.3} fill={color(i)} style={{ animationDelay: `${row * 70 + i * 18}ms` }} />
      ))}
    </svg>
  );
}

function useReveal<T extends Element>() {
  const ref = useRef<T>(null);
  const seen = useInView(ref, { once: true, amount: 0.35 });
  return [ref, seen] as const;
}

function Trust({ reduced }: { reduced: boolean }) {
  const cal = data.calibration;
  const first = cal[0].actual, last = cal[cal.length - 1].actual;
  const maxDots = Math.round(Math.max(...cal.map((c) => c.actual)) * 100);
  const [ref, seen] = useReveal<HTMLDivElement>();
  return (
    <Section>
      <Rise reduced={reduced}>
        <Head glyph={GLYPH} eyebrow="Can you trust it" title="The ranking holds. The levels drift." />
        <p style={BODY}>
          Split the 2015 loans into ten equal groups by predicted risk. Riskier groups really do default
          more, from {pct(first)} percent to {pct(last)} percent. But every group defaulted more than the
          model expected, because 2015 was a worse year than the ones it learned from: {pct(M.testDefaultRate)} percent
          of loans defaulted, against {pct(M.trainDefaultRate)} percent before. So the model is safe for ranking
          loans, and its probabilities need recalibrating every year.
        </p>
      </Rise>
      <div ref={ref} className={`p2p-chart p2p-cal ${seen || reduced ? 'on' : ''}`} style={{ ...CARD, padding: '28px 32px 24px', marginTop: 48 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px', fontFamily: MONO, fontSize: 12, color: INK.label, marginBottom: 22 }}>
          <span><i style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 99, background: DOT_WHITE, marginRight: 8 }} />Defaults the model predicted</span>
          <span><i style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 99, background: ACCENT, marginRight: 8 }} />Defaults above its prediction</span>
          <span>1 dot = 1 point of default rate</span>
        </div>
        <div style={{ position: 'relative' }}>
          {cal.map((c, i) => {
            const pd = Math.round(c.predicted * 100), ad = Math.round(c.actual * 100);
            return (
              <div key={c.decile} className="p2p-cal-row" style={{ display: 'grid', gridTemplateColumns: '160px minmax(0, 1fr) 150px', gap: 20, alignItems: 'center', padding: '5px 0' }}>
                <span style={{ fontFamily: MONO, fontSize: 12, color: INK.label }}>Group {c.decile}{i === 0 ? ' · safest' : i === cal.length - 1 ? ' · riskiest' : ''}</span>
                <div style={{ position: 'relative' }}>
                  <DotLine n={Math.max(pd, ad)} row={i} color={(k) => (k < pd ? DOT_WHITE : ACCENT)}
                    label={`Group ${c.decile}: predicted ${pct(c.predicted)} percent, actual ${pct(c.actual)} percent`} />
                </div>
                <span style={{ fontFamily: MONO, fontSize: 13, textAlign: 'right', color: INK.soft, whiteSpace: 'nowrap' }}>
                  {pct(c.predicted)}% → <span style={{ color: ACCENT_BRIGHT }}>{pct(c.actual)}%</span>
                </span>
              </div>
            );
          })}
        </div>
        <div className="p2p-cal-axis" style={{ display: 'grid', gridTemplateColumns: '160px minmax(0, 1fr) 150px', gap: 20, marginTop: 8 }}>
          <span />
          <div style={{ position: 'relative', height: 16, fontFamily: MONO, fontSize: 11, color: INK.faint }}>
            {[0, 10, 20, 30].filter((t) => t <= maxDots).map((t) => (
              <span key={t} style={{ position: 'absolute', left: `calc(${t} * var(--p2p-pitch))`, transform: t ? 'translateX(-50%)' : 'none' }}>{t}%</span>
            ))}
          </div>
          <span style={{ fontFamily: MONO, fontSize: 11, color: INK.faint, textAlign: 'right' }}>predicted → actual</span>
        </div>
      </div>
    </Section>
  );
}

function Drivers({ reduced }: { reduced: boolean }) {
  const [ref, seen] = useReveal<HTMLDivElement>();
  return (
    <Section pad="40px 0 120px">
      <Rise reduced={reduced}>
        <Head glyph={GLYPH} eyebrow="What drives default" title="The grade first, then the borrower." />
        <p style={BODY}>
          SHAP values measure how far each input moves a single prediction. LendingClub&apos;s sub-grade
          carries the most signal. The model earns its edge from what the grade compresses: income,
          the interest rate, FICO, debt-to-income, and where the borrower lives.
        </p>
      </Rise>
      <div ref={ref} className={`p2p-chart ${seen || reduced ? 'on' : ''}`} style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        {data.shap.map((f, i) => (
          <div key={f.feature} className="p2p-bar-row" style={{ display: 'grid', gridTemplateColumns: '260px 1fr 70px', gap: 32, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontFamily: INTER, fontSize: 17, fontWeight: i === 0 ? 500 : 300, color: 'rgba(255,255,255,0.9)' }}>{f.feature}</span>
            <DotLine n={Math.round(f.value * 100)} row={i} color={() => (i === 0 ? ACCENT : DOT_WHITE)} label={`${f.feature}: ${f.value.toFixed(2)}`} />
            <span style={{ fontFamily: MONO, fontSize: 15, color: INK.soft, textAlign: 'right' }}>{f.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
      <p style={NOTE}>
        Mean absolute SHAP value in log-odds, LightGBM, 20,000 loans from 2015. One dot is 0.01, rounded.
      </p>
    </Section>
  );
}

function Ladder({ reduced }: { reduced: boolean }) {
  const aucs = data.ladder.map((l) => l.auc);
  const best = Math.max(...aucs), base = data.ladder[0].auc;
  const lo = Math.floor(Math.min(...aucs) * 100) / 100 - 0.005, hi = Math.ceil(best * 100) / 100 + 0.002;
  const at = (v: number) => `${((v - lo) / (hi - lo)) * 100}%`;
  const ticks = [0.68, 0.69, 0.7].filter((t) => t > lo && t < hi);
  const [ref, seen] = useReveal<HTMLDivElement>();
  const show = seen || reduced;
  return (
    <Section pad="40px 0 120px">
      <Rise reduced={reduced}>
        <Head glyph={GLYPH} eyebrow="The model ladder" title="Every ranking, one honest test." />
        <p style={BODY}>
          Every model was tuned on 2014 using only earlier loans, then scored once on 2015. Ridge and lasso
          added nothing: with {int(M.nTrain)} loans, plain logistic regression had nothing to overfit.
          Gradient boosting came out on top by finding interactions a straight line cannot.
        </p>
      </Rise>
      <div ref={ref} style={{ ...CARD, marginTop: 48, overflow: 'hidden' }}>
        <div className="p2p-table-row" style={{ display: 'grid', gridTemplateColumns: '290px minmax(0, 1fr) 90px 90px', gap: 24, padding: '16px 28px', ...LABEL, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span>Ranking</span>
          <div className="p2p-lane" style={{ position: 'relative' }}>
            {ticks.map((t) => <span key={t} style={{ position: 'absolute', left: at(t), transform: 'translateX(-50%)', letterSpacing: 0 }}>{t.toFixed(2)}</span>)}
          </div>
          <span style={{ textAlign: 'right' }}>AUC</span><span style={{ textAlign: 'right' }}>PR-AUC</span>
        </div>
        {data.ladder.map((l, i) => {
          const top = l.auc === best, isBase = i === 0;
          return (
            <div key={l.model} className="p2p-table-row" style={{ display: 'grid', gridTemplateColumns: '290px minmax(0, 1fr) 90px 90px', gap: 24, padding: '15px 28px', alignItems: 'center', borderBottom: i < data.ladder.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', background: top ? accentAlpha(0.06) : 'transparent' }}>
              <span style={{ fontFamily: INTER, fontSize: 17, fontWeight: top ? 500 : 300, color: '#ffffff' }}>
                {l.model}{isBase && <span style={{ fontFamily: MONO, fontSize: 11, color: INK.label, marginLeft: 10, letterSpacing: '0.12em' }}>BASELINE</span>}
              </span>
              {/* The gap to the platform's grade, drawn as a line from its dot. */}
              <div className="p2p-lane" aria-hidden style={{ position: 'relative', height: 14 }}>
                {ticks.map((t) => <span key={t} style={{ position: 'absolute', left: at(t), top: -15, bottom: -15, width: 1, background: 'rgba(255,255,255,0.06)' }} />)}
                {!isBase && (
                  <motion.span key={reduced ? "band-still" : "band"} initial={reduced ? false : { scaleX: 0 }} animate={show ? { scaleX: 1 } : undefined} transition={reduced ? { duration: 0 } : { duration: 0.6, delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    style={{ position: 'absolute', top: 6, height: 2, left: at(base), width: `calc(${at(l.auc)} - ${at(base)})`, transformOrigin: 'left', background: top ? ACCENT : 'rgba(255,255,255,0.3)' }} />
                )}
                <span style={{ position: 'absolute', left: at(base), top: 2, width: 10, height: 10, marginLeft: -5, borderRadius: 99, border: '2px solid rgba(255,255,255,0.5)', opacity: isBase ? 0 : 1, boxSizing: 'border-box' }} />
                <motion.span key={reduced ? "tick-still" : "tick"} initial={reduced ? false : { opacity: 0, scale: 0.4 }} animate={show ? { opacity: 1, scale: 1 } : undefined} transition={reduced ? { duration: 0 } : { duration: 0.3, delay: 0.5 + i * 0.06 }}
                  style={{ position: 'absolute', left: at(l.auc), top: 1, width: 12, height: 12, marginLeft: -6, borderRadius: 99, background: top ? ACCENT : isBase ? '#ffffff' : DOT_WHITE }} />
              </div>
              <span style={{ fontFamily: MONO, fontSize: 17, textAlign: 'right', color: top ? ACCENT_BRIGHT : INK.soft }}>{l.auc.toFixed(3)}</span>
              <span style={{ fontFamily: MONO, fontSize: 17, textAlign: 'right', color: top ? ACCENT_BRIGHT : INK.soft }}>{l.prAuc.toFixed(3)}</span>
            </div>
          );
        })}
      </div>
      <p style={NOTE}>
        AUC: the chance a random defaulter is ranked riskier than a random good loan. PR-AUC: how cleanly the riskiest picks are actual defaults.
        Lines run from LendingClub&apos;s own grade to each model.
      </p>
    </Section>
  );
}

const METHOD = [
  { t: 'Only finished loans', b: `${int(M.nTotal)} 36-month loans issued 2007 to 2015, every one either fully paid or charged off. Newer loans are still open and would bias the default rate.` },
  { t: 'Tested on the future', b: 'Trained on 2007 to 2014 and tested once on 2015, the way a lender would actually use a model: learn from the past, score the next year.' },
  { t: 'No peeking', b: 'Only what was known the day each loan was issued. Payments and recoveries were used to score profit, never to train.' },
  { t: 'Real dollars', b: "Profit is what each loan actually paid back minus what was lent, in nominal dollars over the loan's life." },
];

// Public analysis repo, created Nov 8 2026.
const REPO_URL = 'https://github.com/sebafleon-10/p2p-default-risk';
const LINKS = [
  { kind: 'Code', title: 'GitHub repo', body: 'Data build, the model ladder, the profit and calibration analysis, and every number on this page.', href: REPO_URL, cta: 'View the code' },
  { kind: 'Data', title: 'LendingClub loans', body: 'The public LendingClub accepted-loans file, 2007 to 2018. This project uses the 36-month loans from 2007 to 2015.', href: 'https://www.kaggle.com/datasets/wordsforthewise/lending-club', cta: 'Open the dataset' },
];
const YEARS = [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015];

function Method({ reduced }: { reduced: boolean }) {
  return (
    <Section pad="40px 0 120px">
      <Rise reduced={reduced}>
        <Head glyph={GLYPH} eyebrow="How it was built" title="Built to survive contact with a lender." />
      </Rise>
      {/* The split, as a lender lives it: eight years to learn from, one to be judged on. */}
      <div className="p2p-years" style={{ display: 'grid', gridTemplateColumns: `repeat(${YEARS.length}, minmax(0, 1fr))`, gap: 6, marginTop: 32 }}>
        {YEARS.map((y) => {
          const test = y === M.testYear;
          return (
            <div key={y} style={{ borderTop: `3px solid ${test ? ACCENT : 'rgba(255,255,255,0.35)'}`, paddingTop: 10 }}>
              <span style={{ fontFamily: MONO, fontSize: 12, color: test ? ACCENT_BRIGHT : INK.label }}>{y}</span>
            </div>
          );
        })}
      </div>
      <div className="p2p-years p2p-years-cap" style={{ display: 'grid', gridTemplateColumns: `repeat(${YEARS.length}, minmax(0, 1fr))`, gap: 6, marginTop: 8, fontFamily: MONO, fontSize: 12, color: INK.soft }}>
        <span style={{ gridColumn: `1 / ${YEARS.length}` }}>Train · {int(M.nTrain)} loans</span>
        <span style={{ color: ACCENT_BRIGHT, whiteSpace: 'nowrap' }}>Test · {int(M.nTest)}</span>
      </div>

      <div className="p2p-method" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '36px 64px', marginTop: 56 }}>
        {METHOD.map((m, i) => (
          <div key={m.t} style={{ display: 'grid', gridTemplateColumns: '22px 1fr', gap: 14 }}>
            <span aria-hidden style={{ width: 10, height: 10, borderRadius: 99, marginTop: 9, background: i === 1 ? ACCENT : DOT_WHITE }} />
            <div>
              <h3 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 600, color: '#ffffff', margin: '0 0 8px', letterSpacing: '-0.01em' }}>{m.t}</h3>
              <p style={{ fontFamily: INTER, fontSize: 16, fontWeight: 300, lineHeight: 1.65, color: INK.soft, margin: 0, maxWidth: 480 }}>{m.b}</p>
            </div>
          </div>
        ))}
      </div>

      <ProjectLinks links={LINKS} />
    </Section>
  );
}

export default function P2PLendingPage() {
  const reduced = usePrefersReducedMotion();
  return (
    <div className="p2p-root" style={{ minHeight: '100vh' }}>
      <DotGridBackground />
      <style>{`
        .p2p-root { --p2p-pitch: 18px; }
        .p2p-book-mobile, .p2p-phone-only { display: none; }
        .p2p-play { display: grid; grid-template-columns: auto minmax(0, 1fr); grid-template-areas: "pills slider" "field field" "legend legend" "ro ro"; column-gap: 24px; row-gap: 18px; align-items: center; }
        .p2p-a-pills { grid-area: pills; } .p2p-a-slider { grid-area: slider; } .p2p-a-field { grid-area: field; }
        .p2p-a-legend { grid-area: legend; } .p2p-a-ro { grid-area: ro; }
        .p2p-pill:hover { border-color: rgba(255,255,255,0.45) !important; }
        .p2p-pill:focus-visible, .p2p-step:focus-visible, .p2p-range:focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 3px; }
        .p2p-step:hover span { background: #ffffff !important; }
        .p2p-dots circle { opacity: 0; transform-box: fill-box; transform-origin: center; }
        .p2p-chart.on .p2p-dots circle { animation: p2pDot 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        @keyframes p2pDot { from { opacity: 0; transform: scale(0.3); } to { opacity: 1; transform: scale(1); } }
        @media (prefers-reduced-motion: reduce) {
          .p2p-dots circle, .p2p-chart.on .p2p-dots circle { opacity: 1; animation: none; }
        }
        @media (max-width: 767px) {
          .p2p-root { --p2p-pitch: 9px; }
          .p2p-wrap { padding: 0 20px !important; }
          .p2p-book { display: none; }
          .p2p-book-mobile, .p2p-phone-only { display: block; }
          .p2p-desk-only { display: none; }
          .p2p-play { display: block; }
          .p2p-a-pills { margin-bottom: 14px; }
          .p2p-a-slider { position: sticky; top: 70px; z-index: 5; background: #0d0d0d; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 10px 12px 6px; margin-bottom: 14px; }
          .p2p-a-legend { margin-top: 14px; }
          .p2p-ro-compact { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .p2p-readouts { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .p2p-bar-row { grid-template-columns: 1fr 52px !important; gap: 8px 12px !important; }
          .p2p-bar-row > svg { grid-column: 1 / -1; grid-row: 2; }
          .p2p-cal { padding: 20px 16px !important; }
          .p2p-cal-row, .p2p-cal-axis { grid-template-columns: 1fr auto !important; gap: 4px 12px !important; }
          .p2p-cal-row > div, .p2p-cal-axis > div { grid-column: 1 / -1; grid-row: 2; }
          .p2p-cal-axis > span:first-child { display: none; }
          .p2p-table-row { grid-template-columns: 1fr 58px 62px !important; padding: 14px 16px !important; gap: 8px 10px !important; }
          .p2p-table-row > .p2p-lane { grid-column: 1 / -1; grid-row: 2; }
          .p2p-table-row:first-child > .p2p-lane { display: none; }
          .p2p-years-cap { display: flex !important; justify-content: space-between; }
          .p2p-years span { font-size: 10px !important; }
          .p2p-method { grid-template-columns: 1fr !important; gap: 28px !important; }
        }
      `}</style>
      <Hero reduced={reduced} />
      <LoanBook reduced={reduced} />
      <Trust reduced={reduced} />
      <Drivers reduced={reduced} />
      <Ladder reduced={reduced} />
      <Method reduced={reduced} />
    </div>
  );
}
