'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { MONO } from '@/lib/fonts';
import { DotGridBackground } from '@/components/ui/dot-grid-background';
import { ACCENT, ACCENT_BRIGHT, accentAlpha } from '@/lib/accent';
import { LoanField, readout, type SortMode } from './loan-field';
import data from './loan-book.json';

const INTER = 'Inter, ui-rounded, system-ui, sans-serif';
const M = data.meta;
const pct = (v: number, d = 1) => `${(v * 100).toFixed(d)}`;
const int = (v: number) => v.toLocaleString('en-US');
const money = (m: number) => `$${m.toFixed(1)}M`;

const EYEBROW: React.CSSProperties = {
  fontFamily: MONO, fontSize: 14, letterSpacing: '0.4em', textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.4)', margin: '0 0 24px', display: 'block',
};
const H2: React.CSSProperties = {
  fontFamily: INTER, fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, color: '#ffffff',
  letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 24px',
};
const BODY: React.CSSProperties = {
  fontFamily: INTER, fontSize: 'clamp(17px, 1.6vw, 20px)', fontWeight: 300,
  color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, margin: 0, maxWidth: 720,
};
const WRAP: React.CSSProperties = { maxWidth: 1200, width: '100%', margin: '0 auto', padding: '0 64px' };
const CARD: React.CSSProperties = {
  background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14,
};

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
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >{children}</motion.div>
  );
}

const SORTS: { mode: SortMode; label: string }[] = [
  { mode: 'model', label: 'My model' },
  { mode: 'grade', label: 'LendingClub grade' },
  { mode: 'random', label: 'Unsorted' },
];

function Readouts({ mode, share }: { mode: SortMode; share: number }) {
  const r = readout(mode, share);
  const cells = [
    { k: 'Loans funded', v: int(r.funded) },
    { k: 'Defaults avoided', v: `${r.avoided.toFixed(1)}%` },
    { k: 'Profit', v: money(r.profit) },
    { k: 'Return', v: `${r.roi.toFixed(2)}%` },
  ];
  return (
    <div className="p2p-readouts" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
      {cells.map((c) => (
        <div key={c.k} style={{ ...CARD, padding: '14px 18px' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>{c.k}</span>
          <div style={{ fontFamily: MONO, fontSize: 'clamp(20px, 2vw, 26px)', color: '#ffffff', marginTop: 6, letterSpacing: '-0.02em' }}>{c.v}</div>
        </div>
      ))}
    </div>
  );
}

function Legend() {
  const dot = (c: string, o: number) => <span style={{ width: 8, height: 8, borderRadius: 99, background: c, opacity: o, display: 'inline-block', marginRight: 8 }} />;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
      <span>{dot('#ffffff', 0.6)}Paid back</span>
      <span>{dot(ACCENT, 1)}Defaulted</span>
      <span>Safest on the left, dashed line is the cutoff</span>
    </div>
  );
}

// HERO: the visitor makes the lending decision themselves.
function Hero({ reduced }: { reduced: boolean }) {
  const [mode, setMode] = useState<SortMode>('model');
  const [share, setShare] = useState(70);
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '132px 0 96px' }}>
      <div style={WRAP} className="p2p-wrap">
        <Rise reduced={reduced}>
          <span style={EYEBROW}>2026 · Credit risk · Machine learning</span>
          <h1 style={{ fontFamily: INTER, fontSize: 'clamp(40px, 5.6vw, 76px)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.04em', lineHeight: 1.02, margin: '0 0 24px' }}>
            Which loans would you fund?
          </h1>
          <p style={{ ...BODY, maxWidth: 760 }}>
            Every dot is a real LendingClub loan from 2015. The bright ones never got paid back.
            I trained five models on {int(M.nTrain)} loans from 2007 to 2014 to sort them by risk
            before anyone knew how they would end. Switch the sorting, drag the cutoff, and see what
            each choice is worth.
          </p>
        </Rise>

        <div style={{ marginTop: 48 }}>
          <div className="p2p-controls" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
            <div role="radiogroup" aria-label="Sort loans by" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SORTS.map((s) => {
                const on = s.mode === mode;
                return (
                  <button key={s.mode} role="radio" aria-checked={on} onClick={() => setMode(s.mode)}
                    style={{
                      fontFamily: INTER, fontSize: 14, fontWeight: 500, cursor: 'pointer', borderRadius: 999,
                      padding: '7px 15px', background: on ? accentAlpha(0.12) : 'transparent',
                      border: `2px solid ${on ? ACCENT : 'rgba(255,255,255,0.18)'}`,
                      color: on ? ACCENT_BRIGHT : 'rgba(255,255,255,0.75)', transition: 'all 0.2s',
                    }}>{s.label}</button>
                );
              })}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 300px', fontFamily: INTER, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
              <span style={{ whiteSpace: 'nowrap' }}>Fund the safest</span>
              <input type="range" min={5} max={100} step={1} value={share} onChange={(e) => setShare(+e.target.value)}
                aria-label="Share of loans funded" className="p2p-range" style={{ flex: 1, accentColor: ACCENT }} />
              <span style={{ fontFamily: MONO, color: '#ffffff', minWidth: 44, textAlign: 'right' }}>{share}%</span>
            </label>
          </div>

          <LoanField mode={mode} share={share} reduced={reduced}
            label={`1,000 sampled 2015 loans sorted by ${SORTS.find((s) => s.mode === mode)?.label}, safest ${share} percent funded`} />

          <div style={{ margin: '18px 0 20px' }}><Legend /></div>
          <Readouts mode={mode} share={share} />
          <p style={{ fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '14px 0 0', lineHeight: 1.6 }}>
            Dots are a 1,000-loan sample. Every number is computed on all {int(M.nTest)} loans issued in 2015.
          </p>
        </div>
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
  const s = STEPS[step];

  return (
    <>
      {/* Desktop: pinned stage */}
      <section ref={ref} className="p2p-book" style={{ position: 'relative', zIndex: 1, height: `${STEPS.length * 85}vh` }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', alignItems: 'center' }}>
          <div style={{ ...WRAP, display: 'grid', gridTemplateColumns: '34% 1fr', gap: 56, alignItems: 'center' }}>
            <div style={{ display: 'grid' }}>
              {STEPS.map((st, i) => (
                <motion.div key={i} aria-hidden={i !== step}
                  animate={{ opacity: i === step ? 1 : 0, y: i === step ? 0 : i < step ? -24 : 24 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.45, ease: 'easeOut' }}
                  style={{ gridArea: '1 / 1', pointerEvents: i === step ? 'auto' : 'none' }}>
                  <span style={{ ...EYEBROW, fontSize: 12, letterSpacing: '0.3em', borderLeft: `2px solid ${ACCENT}`, paddingLeft: 16, margin: '0 0 20px', whiteSpace: 'nowrap' }}>{st.eyebrow}</span>
                  <h2 style={{ ...H2, fontSize: 'clamp(28px, 3vw, 42px)' }}>{st.title}</h2>
                  <p style={{ ...BODY, fontSize: 'clamp(16px, 1.3vw, 18px)' }}>{st.body}</p>
                </motion.div>
              ))}
              <div style={{ display: 'flex', gap: 6, marginTop: 32 }}>
                {STEPS.map((_, i) => (
                  <span key={i} style={{ height: 3, width: i === step ? 36 : 12, borderRadius: 2, background: i === step ? '#ffffff' : 'rgba(255,255,255,0.25)', transition: 'all 0.3s' }} />
                ))}
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
              <span style={{ ...EYEBROW, fontSize: 12, borderLeft: `2px solid ${ACCENT}`, paddingLeft: 12, margin: '0 0 14px' }}>{st.eyebrow}</span>
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

function Trust({ reduced }: { reduced: boolean }) {
  const cal = data.calibration;
  const max = Math.ceil(Math.max(...cal.map((c) => c.actual)) * 10) / 10;
  const first = cal[0].actual, last = cal[cal.length - 1].actual;
  return (
    <Section>
      <Rise reduced={reduced}>
        <span style={EYEBROW}>Can you trust it</span>
        <h2 style={H2}>The ranking holds. The levels drift.</h2>
        <p style={BODY}>
          Split the 2015 loans into ten equal groups by predicted risk. Riskier groups really do default
          more, from {pct(first)} percent to {pct(last)} percent. But every group defaulted more than the
          model expected, because 2015 was a worse year than the ones it learned from: {pct(M.testDefaultRate)} percent
          of loans defaulted, against {pct(M.trainDefaultRate)} percent before. So the model is safe for ranking
          loans, and its probabilities need recalibrating every year.
        </p>
      </Rise>
      <div style={{ ...CARD, padding: '32px 32px 20px', marginTop: 48 }}>
        <div style={{ display: 'flex', gap: 24, fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 20 }}>
          <span><i style={{ display: 'inline-block', width: 10, height: 10, background: 'rgba(255,255,255,0.35)', borderRadius: 2, marginRight: 8 }} />Predicted default rate</span>
          <span><i style={{ display: 'inline-block', width: 10, height: 10, background: ACCENT, borderRadius: 2, marginRight: 8 }} />Actual default rate</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gap: 10, alignItems: 'end', height: 240 }}>
          {cal.map((c, i) => (
            <div key={c.decile} style={{ display: 'flex', gap: 3, alignItems: 'end', height: '100%' }} title={`Group ${c.decile}: predicted ${pct(c.predicted)}%, actual ${pct(c.actual)}%`}>
              {[{ v: c.predicted, bg: 'rgba(255,255,255,0.35)' }, { v: c.actual, bg: ACCENT }].map((b, j) => (
                <motion.div key={j}
                  initial={reduced ? false : { height: 0 }}
                  whileInView={{ height: `${(b.v / max) * 100}%` }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.8, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  style={{ flex: 1, background: b.bg, borderRadius: '3px 3px 0 0' }} />
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gap: 10, marginTop: 10, fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>
          {cal.map((c) => <span key={c.decile}>{pct(c.actual, 0)}%</span>)}
        </div>
        <p style={{ fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '14px 0 0' }}>
          Groups 1 to 10, safest to riskiest. Labels show the actual default rate.
        </p>
      </div>
    </Section>
  );
}

function Drivers({ reduced }: { reduced: boolean }) {
  const max = data.shap[0].value;
  return (
    <Section pad="40px 0 120px">
      <Rise reduced={reduced}>
        <span style={EYEBROW}>What drives default</span>
        <h2 style={H2}>The grade first, then the borrower.</h2>
        <p style={BODY}>
          SHAP values measure how far each input moves a single prediction. LendingClub&apos;s sub-grade
          carries the most signal. The model earns its edge from what the grade compresses: income,
          the interest rate, FICO, debt-to-income, and where the borrower lives.
        </p>
      </Rise>
      <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        {data.shap.map((f, i) => (
          <div key={f.feature} className="p2p-bar-row" style={{ display: 'grid', gridTemplateColumns: '260px 1fr 70px', gap: 32, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontFamily: INTER, fontSize: 17, fontWeight: i === 0 ? 500 : 300, color: 'rgba(255,255,255,0.88)' }}>{f.feature}</span>
            <div style={{ height: 10, borderRadius: 99, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <motion.div initial={reduced ? false : { width: 0 }} whileInView={{ width: `${(f.value / max) * 100}%` }}
                viewport={{ once: true, amount: 0.5 }} transition={reduced ? { duration: 0 } : { duration: 0.8, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                style={{ height: '100%', borderRadius: 99, background: i === 0 ? ACCENT : 'rgba(255,255,255,0.4)' }} />
            </div>
            <span style={{ fontFamily: MONO, fontSize: 15, color: 'rgba(255,255,255,0.7)', textAlign: 'right' }}>{f.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '14px 0 0' }}>
        Mean absolute SHAP value in log-odds, LightGBM, 20,000 loans from 2015.
      </p>
    </Section>
  );
}

function Ladder({ reduced }: { reduced: boolean }) {
  const best = Math.max(...data.ladder.map((l) => l.auc));
  return (
    <Section pad="40px 0 120px">
      <Rise reduced={reduced}>
        <span style={EYEBROW}>The model ladder</span>
        <h2 style={H2}>Every ranking, one honest test.</h2>
        <p style={BODY}>
          Every model was tuned on 2014 using only earlier loans, then scored once on 2015. Ridge and lasso
          added nothing: with {int(M.nTrain)} loans, plain logistic regression had nothing to overfit.
          Gradient boosting came out on top by finding interactions a straight line cannot.
        </p>
      </Rise>
      <div style={{ ...CARD, marginTop: 48, overflow: 'hidden' }}>
        <div className="p2p-table-row" style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px', padding: '16px 28px', fontFamily: MONO, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span>Ranking</span><span style={{ textAlign: 'right' }}>AUC</span><span style={{ textAlign: 'right' }}>PR-AUC</span>
        </div>
        {data.ladder.map((l, i) => {
          const top = l.auc === best, base = i === 0;
          return (
            <div key={l.model} className="p2p-table-row" style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px', padding: '16px 28px', alignItems: 'baseline', borderBottom: i < data.ladder.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', background: top ? accentAlpha(0.06) : 'transparent' }}>
              <span style={{ fontFamily: INTER, fontSize: 17, fontWeight: top ? 500 : 300, color: '#ffffff' }}>
                {l.model}{base && <span style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.45)', marginLeft: 12, letterSpacing: '0.15em' }}>BASELINE</span>}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 17, textAlign: 'right', color: top ? ACCENT_BRIGHT : 'rgba(255,255,255,0.75)' }}>{l.auc.toFixed(3)}</span>
              <span style={{ fontFamily: MONO, fontSize: 17, textAlign: 'right', color: top ? ACCENT_BRIGHT : 'rgba(255,255,255,0.75)' }}>{l.prAuc.toFixed(3)}</span>
            </div>
          );
        })}
      </div>
      <p style={{ fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '14px 0 0', lineHeight: 1.6 }}>
        AUC: the chance a random defaulter is ranked riskier than a random good loan. PR-AUC: how cleanly the riskiest picks are actual defaults.
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

// PLACEHOLDER: repo URL goes live once Sebastian approves creating the GitHub repo.
const REPO_URL = 'https://github.com/sebafleon-10/p2p-default-risk';
const DELIVERABLES = [
  { kind: 'Code', title: 'GitHub repo', body: 'Data build, the model ladder, the profit and calibration analysis, and every number on this page.', href: REPO_URL, cta: 'View the code' },
  { kind: 'Data', title: 'LendingClub loans', body: 'The public LendingClub accepted-loans file, 2007 to 2018. This project uses the 36-month loans from 2007 to 2015.', href: 'https://www.kaggle.com/datasets/wordsforthewise/lending-club', cta: 'Open the dataset' },
];

function Method({ reduced }: { reduced: boolean }) {
  return (
    <Section pad="40px 0 120px">
      <Rise reduced={reduced}>
        <span style={EYEBROW}>How it was built</span>
        <h2 style={H2}>Built to survive contact with a lender.</h2>
      </Rise>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginTop: 24 }}>
        {METHOD.map((m, i) => (
          <div key={m.t} style={{ ...CARD, padding: 28 }}>
            <span style={{ fontFamily: MONO, fontSize: 13, color: ACCENT }}>{String(i + 1).padStart(2, '0')}</span>
            <h3 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 600, color: '#ffffff', margin: '12px 0 10px', letterSpacing: '-0.01em' }}>{m.t}</h3>
            <p style={{ fontFamily: INTER, fontSize: 15, fontWeight: 300, lineHeight: 1.65, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{m.b}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 120 }}>
        <span style={EYEBROW}>Deliverables</span>
        <h2 style={{ ...H2, margin: '0 0 40px' }}>What I built</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {DELIVERABLES.map((d) => (
            <a key={d.title} href={d.href} target="_blank" rel="noopener noreferrer" className="p2p-deliv"
              style={{ ...CARD, padding: 32, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 240 }}>
              <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>{d.kind}</span>
              <span style={{ fontFamily: MONO, fontSize: 24, color: '#ffffff' }}>{d.title}</span>
              <span style={{ fontFamily: INTER, fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65 }}>{d.body}</span>
              <span style={{ marginTop: 'auto', fontFamily: INTER, fontSize: 14, fontWeight: 500, color: ACCENT_BRIGHT }}>{d.cta} →</span>
            </a>
          ))}
        </div>
      </div>
    </Section>
  );
}

export default function P2PLendingPage() {
  const reduced = usePrefersReducedMotion();
  return (
    <div style={{ minHeight: '100vh' }}>
      <DotGridBackground />
      <style>{`
        .p2p-book-mobile { display: none; }
        .p2p-deliv { transition: border-color 0.2s, transform 0.2s; }
        .p2p-deliv:hover { border-color: ${accentAlpha(0.45)} !important; transform: translateY(-2px); }
        @media (max-width: 767px) {
          .p2p-wrap { padding: 0 20px !important; }
          .p2p-book { display: none; }
          .p2p-book-mobile { display: block; }
          .p2p-readouts { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .p2p-bar-row { grid-template-columns: 1fr 52px !important; gap: 8px 12px !important; }
          .p2p-bar-row > div { grid-column: 1 / -1; grid-row: 2; }
          .p2p-table-row { grid-template-columns: 1fr 64px 72px !important; padding: 14px 16px !important; }
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
