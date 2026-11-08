'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { MONO } from '@/lib/fonts';
import { DotGridBackground } from '@/components/ui/dot-grid-background';
import { ACCENT, ACCENT_BRIGHT, accentAlpha } from '@/lib/accent';
import data from './campaigns.json';

const INTER = 'Inter, ui-rounded, system-ui, sans-serif';
const DD = data.doordash, ST = data.stumptown, IK = data.ikea;
const pct = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`;
const millions = (v: number) => `${v < 0 ? '−' : '+'}$${Math.abs(v / 1e6).toFixed(2)}M`;
const thousands = (v: number) => `$${Math.round(v / 1000)}K`;
const cents = (v: number) => `$${v.toFixed(2)}`;

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

// One horizontal bar. Magnitude sets the width; negative values draw dim.
function Bar({ label, value, display, max, strong, reduced, delay = 0 }: {
  label: string; value: number; display: string; max: number; strong?: boolean; reduced: boolean; delay?: number;
}) {
  const w = Math.max(1.5, (Math.abs(value) / max) * 100);
  return (
    <div className="mt-bar" style={{ display: 'grid', gridTemplateColumns: '220px 1fr 110px', gap: 24, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <span style={{ fontFamily: INTER, fontSize: 16, fontWeight: strong ? 500 : 300, color: strong ? '#ffffff' : 'rgba(255,255,255,0.75)' }}>{label}</span>
      <div style={{ height: 10, borderRadius: 99, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <motion.div initial={reduced ? false : { width: 0 }} animate={{ width: `${w}%` }}
          transition={reduced ? { duration: 0 } : { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: '100%', borderRadius: 99, background: value < 0 ? 'rgba(255,255,255,0.18)' : strong ? ACCENT : 'rgba(255,255,255,0.4)' }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 16, textAlign: 'right', color: strong ? ACCENT_BRIGHT : value < 0 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.8)' }}>{display}</span>
    </div>
  );
}

type Choice = { label: string; sub: string };
type Outcome = { picked: number | null; right: boolean };

// GUESS THEN REVEAL. The visitor commits before the held-out result appears.
// Scrolling past without choosing reveals it anyway.
function GuessCase({ index, eyebrow, title, setup, question, choices, correct, verdict, onCall, reveal, reduced }: {
  index: number; eyebrow: string; title: string; setup: string; question: string; choices: Choice[];
  correct: number[]; verdict: (picked: number | null) => string; onCall: (i: number, o: Outcome) => void;
  reveal: React.ReactNode; reduced: boolean;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [shown, setShown] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const shownRef = useRef(false);

  const commit = (p: number | null) => {
    if (shownRef.current) return;
    shownRef.current = true;
    setPicked(p); setShown(true);
    onCall(index, { picked: p, right: p !== null && correct.includes(p) });
  };

  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting && e.boundingClientRect.top < 0) commit(null);
    });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '96px 0' }}>
      <div style={WRAP} className="mt-wrap">
        <Rise reduced={reduced}>
          <span className="mt-eyebrow" style={{ ...EYEBROW, borderLeft: `2px solid ${ACCENT}`, paddingLeft: 16, margin: '0 0 20px' }}>{eyebrow}</span>
          <h2 style={H2}>{title}</h2>
          <p style={BODY}>{setup}</p>
        </Rise>

        <div style={{ ...CARD, padding: 32, marginTop: 40 }} className="mt-card">
          <p style={{ fontFamily: INTER, fontSize: 20, fontWeight: 500, color: '#ffffff', margin: '0 0 20px' }}>{question}</p>
          <div role="radiogroup" aria-label={question} className="mt-choices" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
            {choices.map((c, i) => {
              const isPick = picked === i, isRight = shown && correct.includes(i);
              return (
                <button key={c.label} role="radio" aria-checked={isPick} disabled={shown} onClick={() => commit(i)}
                  className="mt-choice"
                  style={{
                    textAlign: 'left', cursor: shown ? 'default' : 'pointer', borderRadius: 12, padding: '16px 18px',
                    background: isPick ? accentAlpha(0.1) : '#0a0a0a',
                    border: `2px solid ${isPick ? ACCENT : isRight ? accentAlpha(0.45) : 'rgba(255,255,255,0.14)'}`,
                    color: '#ffffff', opacity: shown && !isPick && !isRight ? 0.55 : 1, transition: 'all 0.2s',
                  }}>
                  <span style={{ display: 'block', fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: isRight ? ACCENT_BRIGHT : 'rgba(255,255,255,0.45)', marginBottom: 6 }}>
                    {isRight ? 'Best call' : isPick ? 'Your call' : `Option ${i + 1}`}
                  </span>
                  <span style={{ display: 'block', fontFamily: INTER, fontSize: 16, fontWeight: 500 }}>{c.label}</span>
                  <span style={{ display: 'block', fontFamily: INTER, fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{c.sub}</span>
                </button>
              );
            })}
          </div>
          {!shown && (
            <button onClick={() => commit(null)} style={{ marginTop: 16, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'underline', textUnderlineOffset: 4 }}>
              Just show me the result
            </button>
          )}
          {shown && (
            <motion.div initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginTop: 28 }} aria-live="polite">
              <p style={{ fontFamily: INTER, fontSize: 17, fontWeight: 400, color: picked !== null && correct.includes(picked) ? ACCENT_BRIGHT : 'rgba(255,255,255,0.88)', margin: '0 0 8px', lineHeight: 1.6 }}>
                {verdict(picked)}
              </p>
              {reveal}
            </motion.div>
          )}
        </div>
        <div ref={endRef} style={{ height: 1 }} />
      </div>
    </section>
  );
}

// Supporting charts (only rendered after the reveal)
function GainsChart() {
  const W = 520, H = 240, P = 36;
  const x = (v: number) => P + v * (W - P * 1.5), y = (v: number) => H - P - v * (H - P * 1.6);
  const path = (pts: number[][]) => pts.map(([a, b], i) => `${i ? 'L' : 'M'}${x(a).toFixed(1)} ${y(b).toFixed(1)}`).join('');
  const log = DD.gains['Logistic model'], rfm = DD.gains['RFM segments'];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 560, display: 'block', marginTop: 20 }} role="img"
      aria-label="Gains chart: share of responders reached by targeting the top share of customers, logistic model above RFM above random">
      <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} stroke="rgba(255,255,255,0.25)" strokeDasharray="3 4" />
      <path d={path(rfm)} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={1.5} />
      <path d={path(log)} fill="none" stroke={ACCENT} strokeWidth={2} />
      <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(0)} stroke="rgba(255,255,255,0.15)" />
      {[0, 0.5, 1].map((t) => (
        <text key={t} x={x(t)} y={H - 12} fill="rgba(255,255,255,0.45)" fontSize={11} fontFamily={MONO} textAnchor="middle">{t * 100}%</text>
      ))}
      <text x={x(0.52)} y={y(0.9)} fill={ACCENT_BRIGHT} fontSize={12} fontFamily={MONO}>Logistic model</text>
      <text x={x(0.6)} y={y(0.62)} fill="rgba(255,255,255,0.6)" fontSize={12} fontFamily={MONO}>RFM segments</text>
      <text x={x(0.66)} y={y(0.5)} fill="rgba(255,255,255,0.4)" fontSize={12} fontFamily={MONO}>Random</text>
    </svg>
  );
}

function DecileChart({ reduced }: { reduced: boolean }) {
  const max = Math.max(...ST.deciles) * 1.1;
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gap: 8, alignItems: 'end', height: 180 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: `${(ST.breakeven / max) * 100}%`, borderTop: '1px dashed rgba(255,255,255,0.5)' }}>
          <span style={{ position: 'absolute', right: 0, top: -20, fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Breakeven {pct(ST.breakeven)}</span>
        </div>
        {ST.deciles.map((v, i) => (
          <motion.div key={i} initial={reduced ? false : { height: 0 }} animate={{ height: `${(v / max) * 100}%` }}
            transition={reduced ? { duration: 0 } : { duration: 0.7, delay: i * 0.04 }}
            style={{ background: v > ST.breakeven ? ACCENT : 'rgba(255,255,255,0.25)', borderRadius: '3px 3px 0 0' }} title={`Decile ${i + 1}: ${pct(v)}`} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gap: 8, marginTop: 8, fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>
        {ST.deciles.map((v, i) => <span key={i}>{(v * 100).toFixed(0)}%</span>)}
      </div>
      <p style={NOTE}>Conversion by predicted-likelihood decile, best to worst, out-of-fold. Periwinkle deciles clear breakeven and get a sample.</p>
    </div>
  );
}

function WhoVsWhat({ reduced }: { reduced: boolean }) {
  const income = Object.entries(IK.byIncome), dept = Object.entries(IK.byDept);
  const max = Math.max(...income.map(([, v]) => v));
  const label = (s: string) => s.replace('KitchenDining', 'Kitchen').replace('HomeDecor', 'Home Decor').replace('LivingRoom', 'Living Room');
  const col = (title: string, rows: [string, number][], strong: boolean) => (
    <div>
      <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', margin: '0 0 10px' }}>{title}</p>
      {rows.map(([k, v], i) => (
        <div key={k} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 56px', gap: 12, alignItems: 'center', padding: '6px 0' }}>
          <span style={{ fontFamily: INTER, fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.8)' }}>{label(k)}</span>
          <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <motion.div initial={reduced ? false : { width: 0 }} animate={{ width: `${Math.max(1, (v / max) * 100)}%` }}
              transition={reduced ? { duration: 0 } : { duration: 0.7, delay: i * 0.04 }}
              style={{ height: '100%', borderRadius: 99, background: strong ? ACCENT : 'rgba(255,255,255,0.4)' }} />
          </div>
          <span style={{ fontFamily: MONO, fontSize: 13, textAlign: 'right', color: 'rgba(255,255,255,0.75)' }}>{pct(v, 2)}</span>
        </div>
      ))}
    </div>
  );
  return (
    <div className="mt-who" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 28 }}>
      {col('Purchase rate by email department', dept as [string, number][], false)}
      {col('Purchase rate by customer income', income as [string, number][], true)}
    </div>
  );
}

export default function MarketingTargetingPage() {
  const reduced = usePrefersReducedMotion();
  const [calls, setCalls] = useState<(Outcome | null)[]>([null, null, null]);
  const record = (i: number, o: Outcome) => setCalls((c) => { const n = [...c]; n[i] = o; return n; });
  const made = calls.filter((c) => c && c.picked !== null).length;
  const right = calls.filter((c) => c?.right).length;
  const done = calls.every(Boolean);

  const ddMax = Math.max(...DD.policies.map((p) => Math.abs(p.profit)));
  const stMax = Math.max(...ST.policies.map((p) => p.profit));
  const ikMax = IK.promised;
  const [ddAll, ddRfm, ddLog] = DD.policies;
  const [stAll, stLog, stGbm] = ST.policies;
  const [ikRand, ikPers, ikTop] = IK.policies;
  const multiple = stLog.profit / stAll.profit;
  const incomeVals = Object.values(IK.byIncome);
  const incomeRatio = Math.max(...incomeVals) / Math.min(...incomeVals);

  return (
    <div style={{ minHeight: '100vh' }}>
      <DotGridBackground />
      <style>{`
        .mt-choice:not(:disabled):hover { border-color: rgba(255,255,255,0.4) !important; }
        .mt-choice:focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 2px; }
        .mt-deliv { transition: border-color 0.2s, transform 0.2s; }
        .mt-deliv:hover { border-color: ${accentAlpha(0.45)} !important; transform: translateY(-2px); }
        @media (max-width: 767px) {
          .mt-wrap { padding: 0 20px !important; }
          .mt-eyebrow { font-size: 11px !important; letter-spacing: 0.25em !important; }
          .mt-card { padding: 20px !important; }
          .mt-choices { grid-template-columns: 1fr !important; }
          .mt-bar { grid-template-columns: 1fr 84px !important; gap: 8px 12px !important; }
          .mt-bar > div { grid-column: 1 / -1; grid-row: 2; }
          .mt-who { grid-template-columns: 1fr !important; gap: 28px !important; }
          .mt-score { right: 12px !important; bottom: 12px !important; }
        }
      `}</style>

      {/* Running tally of the visitor's calls */}
      <div className="mt-score" aria-live="polite" style={{
        position: 'fixed', right: 24, bottom: 24, zIndex: 20, ...CARD, background: 'rgba(13,13,13,0.92)',
        backdropFilter: 'blur(10px)', padding: '10px 16px', fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.75)',
      }}>
        Your calls <span style={{ color: '#ffffff' }}>{made}/3</span> · <span style={{ color: ACCENT_BRIGHT }}>{right} right</span>
      </div>

      {/* HERO */}
      <section style={{ position: 'relative', zIndex: 1, padding: '132px 0 24px' }}>
        <div style={WRAP} className="mt-wrap">
          <Rise reduced={reduced}>
            <span className="mt-eyebrow" style={EYEBROW}>2026 · Marketing analytics · Machine learning</span>
            <h1 style={{ fontFamily: INTER, fontSize: 'clamp(40px, 5.6vw, 76px)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.04em', lineHeight: 1.02, margin: '0 0 24px' }}>
              Who gets the offer?
            </h1>
            <p style={{ ...BODY, maxWidth: 760 }}>
              Three campaigns, three budget calls: a push notification, a free sample, a promotional email.
              For each one, make your call first, then see what actually happened on customers the models never saw.
            </p>
            <p style={{ ...NOTE, marginTop: 20, maxWidth: 720 }}>
              Simulated teaching cases from my Marketing Analytics course. The company names are the case settings, not real company data.
            </p>
          </Rise>
        </div>
      </section>

      <GuessCase index={0} reduced={reduced} onCall={record}
        eyebrow="Case 1 · Push notifications"
        title="Send the push, or hold it back?"
        setup={`A food-delivery app sent a free-delivery push to 70,000 customers. ${pct(DD.responseRate)} ordered. But every push costs about ${cents(DD.cost)} in lost future value, because some customers mute promotions for good, so the offer only pays when at least ${pct(DD.breakeven)} respond.`}
        question="Rolled out to the other 36.9 million customers, which policy earns the most?"
        choices={[
          { label: 'Send to everyone', sub: 'No targeting, maximum reach' },
          { label: 'RFM segments', sub: 'Recency, frequency, spend buckets' },
          { label: 'Logistic model', sub: 'One probability per customer' },
        ]}
        correct={[2]}
        verdict={(p) => p === 2
          ? `Right. The model earns ${millions(ddLog.profit)}, and it beat RFM in ${Math.round(DD.robust.logistic_minus_rfm.share_positive * 20)} of 20 random splits.`
          : p === 1 ? `Close. RFM earns ${millions(ddRfm.profit)}, most of the value, but the model beat it in all 20 random splits.`
          : p === 0 ? `Sending to everyone loses money: ${pct(DD.responseRate)} respond, below the ${pct(DD.breakeven)} breakeven.`
          : `The model wins, RFM is close behind, and sending to everyone loses money.`}
        reveal={<>
          {DD.policies.map((p, i) => <Bar key={p.label} label={p.label} value={p.profit} display={millions(p.profit)} max={ddMax} strong={i === 2} reduced={reduced} delay={i * 0.08} />)}
          <p style={{ ...BODY, fontSize: 16, marginTop: 20 }}>
            Targeting does the heavy lifting: skipping customers below breakeven turns a {millions(ddAll.profit)} loss into a gain.
            The model adds about {millions(DD.robust.logistic_minus_rfm.mean).replace('+', '')} on top of RFM by ranking every customer instead of 125 buckets.
            Gradient boosting ({millions(DD.gbm)}) added nothing over logistic regression.
          </p>
          <GainsChart />
          <p style={NOTE}>Share of responders reached when targeting the top share of customers, held-out half. Every customer in the test got the push, so this finds likely responders, not people the push persuades.</p>
        </>}
      />

      <GuessCase index={1} reduced={reduced} onCall={record}
        eyebrow="Case 2 · Free samples"
        title="Who gets a free bag of coffee?"
        setup={`A coffee roaster mailed a free 1-lb bag to 15,000 wholesale accounts. A sample costs ${'$'}${ST.cost}; an account that reorders 20 lbs is worth ${'$'}${ST.win}. That makes ${pct(ST.breakeven)} the breakeven, and ${pct(ST.conversion)} of accounts converted.`}
        question="Targeting only accounts the model rates above breakeven, how much more does it earn than sampling all 45,000 remaining accounts?"
        choices={[
          { label: 'About 20% more', sub: 'A modest trim' },
          { label: 'About double', sub: 'Twice the profit' },
          { label: 'Nearly triple', sub: 'Three times the profit' },
        ]}
        correct={[2]}
        verdict={(p) => p === 2
          ? `Right. ${thousands(stLog.profit)} against ${thousands(stAll.profit)}, ${multiple.toFixed(1)} times as much, while mailing a third as many samples.`
          : `It's nearly triple: ${thousands(stLog.profit)} against ${thousands(stAll.profit)}, while mailing a third as many samples.`}
        reveal={<>
          {ST.policies.map((p, i) => <Bar key={p.label} label={p.label} value={p.profit} display={thousands(p.profit)} max={stMax} strong={i === 1} reduced={reduced} delay={i * 0.08} />)}
          <p style={{ ...BODY, fontSize: 16, marginTop: 20 }}>
            Gradient boosting ({thousands(stGbm.profit)}) ties the logistic model: with 15,000 accounts there is no hidden pattern for it to find.
            Every score here is out-of-fold from 5-fold cross-validation. The class version scored the same rows the model was fit on and came out higher.
          </p>
          <DecileChart reduced={reduced} />
          <div style={{ ...CARD, background: '#0a0a0a', padding: 20, marginTop: 24 }}>
            <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: ACCENT, margin: '0 0 8px' }}>A trap along the way</p>
            <p style={{ fontFamily: INTER, fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.8)', lineHeight: 1.65, margin: 0 }}>
              On its own, past seasonal single-origin buying looks like a strong signal (coefficient {ST.coef.alone.toFixed(2)}). Next to total spend and the other purchase histories it nearly vanishes ({ST.coef.full.toFixed(3)}).
              It was standing in for &quot;this account buys a lot of coffee.&quot;
            </p>
          </div>
        </>}
      />

      <GuessCase index={2} reduced={reduced} onCall={record}
        eyebrow="Case 3 · Personalized email"
        title="Which email should each customer get?"
        setup={`A furniture retailer emails customers from one of seven departments, chosen at random each week. Only ${pct(IK.trueRate, 2)} of emails lead to a purchase. A model can pick the department each customer is most likely to buy from, and on its own predictions it promises ${cents(IK.promised)} of profit per customer.`}
        question={`The model promised ${cents(IK.promised)} per customer. What did its picks really earn?`}
        choices={[
          { label: `About ${cents(IK.promised)}`, sub: 'The model was right' },
          { label: 'About $2.00', sub: 'Half of the promise' },
          { label: `About ${cents(ikRand.value)}`, sub: 'Same as random emails' },
        ]}
        correct={[2]}
        verdict={(p) => p === 2
          ? `Right. ${cents(ikPers.value)} per customer, against ${cents(ikRand.value)} for random emails: a gain too small to tell from zero.`
          : `${cents(ikPers.value)} per customer, against ${cents(ikRand.value)} for random emails: a gain too small to tell from zero.`}
        reveal={<>
          <Bar label="What the model promised" value={IK.promised} display={cents(IK.promised)} max={ikMax} reduced={reduced} />
          <Bar label="What it really earned" value={ikPers.value} display={cents(ikPers.value)} max={ikMax} strong reduced={reduced} delay={0.1} />
          <Bar label={ikRand.label} value={ikRand.value} display={cents(ikRand.value)} max={ikMax} reduced={reduced} delay={0.2} />
          <p style={{ ...BODY, fontSize: 16, marginTop: 20 }}>
            The model graded its own homework. Because the weekly department really was random, I could score its picks against what customers actually did:
            keep the customers whose random email matched the model&apos;s pick, and weight them up. The promise was {(IK.promised / ikPers.value).toFixed(1)} times too high.
            Sending everyone the {ikTop.label.replace('Everyone gets ', '')} email ({cents(ikTop.value)}) does about as well, because those orders run larger.
          </p>
          <WhoVsWhat reduced={reduced} />
          <p style={{ ...BODY, fontSize: 16, marginTop: 24 }}>
            The department barely moves the chance of a purchase. The customer moves it about {Math.round(incomeRatio)} times. The money is in deciding who to email, not which email to send.
          </p>
          <p style={NOTE}>Purchase rates reweighted from the oversampled data to the true rate. Six-month value by weekly email count peaks at two emails a week ({cents(IK.ltv['2'])}).</p>
        </>}
      />

      {/* SCORECARD */}
      <section style={{ position: 'relative', zIndex: 1, padding: '96px 0' }}>
        <div style={WRAP} className="mt-wrap">
          <Rise reduced={reduced}>
            <span className="mt-eyebrow" style={EYEBROW}>Scorecard</span>
            <h2 style={H2}>{done ? (made ? `You called ${right} of ${made}.` : 'Three campaigns, three lessons.') : 'Three campaigns, three lessons.'}</h2>
          </Rise>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginTop: 24 }}>
            {[
              { t: 'Blasting loses money', b: `When response sits below breakeven, sending to everyone pays to annoy people. The push campaign lost ${millions(ddAll.profit).replace('−', '')} that way.` },
              { t: 'Simple targeting does the work', b: 'Most of the gain comes from skipping customers below breakeven. A good logistic model adds a reliable edge; gradient boosting added nothing here.' },
              { t: 'Test against reality', b: `A model scored on its own predictions promised ${cents(IK.promised)} and delivered ${cents(ikPers.value)}. Held-out data and random assignment are what make a number trustworthy.` },
            ].map((c, i) => (
              <div key={c.t} style={{ ...CARD, padding: 28 }}>
                <span style={{ fontFamily: MONO, fontSize: 13, color: ACCENT }}>{String(i + 1).padStart(2, '0')}</span>
                <h3 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 600, color: '#ffffff', margin: '12px 0 10px' }}>{c.t}</h3>
                <p style={{ fontFamily: INTER, fontSize: 15, fontWeight: 300, lineHeight: 1.65, color: 'rgba(255,255,255,0.72)', margin: 0 }}>{c.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* METHOD + DELIVERABLES */}
      <section style={{ position: 'relative', zIndex: 1, padding: '40px 0 120px' }}>
        <div style={WRAP} className="mt-wrap">
          <Rise reduced={reduced}>
            <span className="mt-eyebrow" style={EYEBROW}>How it was scored</span>
            <h2 style={H2}>No number on this page graded itself.</h2>
          </Rise>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginTop: 24 }}>
            {[
              { t: 'Held-out halves', b: 'Push campaign: targets chosen on one half of the customers, profit counted on the other half, then repeated over 20 random splits.' },
              { t: 'Out-of-fold scores', b: 'Free samples: with 15,000 accounts, each account is scored by a model trained on the other four folds.' },
              { t: 'Random assignment', b: 'Email: the weekly department was random, so any policy can be scored on real purchases with inverse propensity weighting.' },
              { t: 'Teaching cases', b: 'All three cases are simulated course material. The data stays private; the code and aggregate results are public.' },
            ].map((m, i) => (
              <div key={m.t} style={{ ...CARD, padding: 28 }}>
                <span style={{ fontFamily: MONO, fontSize: 13, color: ACCENT }}>{String(i + 1).padStart(2, '0')}</span>
                <h3 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 600, color: '#ffffff', margin: '12px 0 10px' }}>{m.t}</h3>
                <p style={{ fontFamily: INTER, fontSize: 15, fontWeight: 300, lineHeight: 1.65, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{m.b}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 120 }}>
            <span className="mt-eyebrow" style={EYEBROW}>Deliverables</span>
            <h2 style={{ ...H2, margin: '0 0 40px' }}>What I built</h2>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="mt-deliv"
              style={{ ...CARD, padding: 32, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
              <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Code</span>
              <span style={{ fontFamily: MONO, fontSize: 24, color: '#ffffff' }}>GitHub repo</span>
              <span style={{ fontFamily: INTER, fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65 }}>
                The three analyses, the robustness checks and every number on this page. Case data is not included.
              </span>
              <span style={{ marginTop: 8, fontFamily: INTER, fontSize: 14, fontWeight: 500, color: ACCENT_BRIGHT }}>View the code →</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

// Public analysis repo, created Nov 8 2026.
const REPO_URL = 'https://github.com/sebafleon-10/marketing-targeting';
