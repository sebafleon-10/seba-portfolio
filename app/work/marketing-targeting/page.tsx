'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MONO } from '@/lib/fonts';
import { DotGridBackground } from '@/components/ui/dot-grid-background';
import { ACCENT, ACCENT_BRIGHT, accentAlpha } from '@/lib/accent';
import { BODY, CARD, H1, Head, INK, INTER, LABEL, NOTE, ProjectLinks, Rise, WRAP, usePrefersReducedMotion } from '../_components/project-kit';
import data from './campaigns.json';

// The ballot carries the whole page: you mark a choice, the result comes back
// on the same kind of card, and the scorecard keeps your marks.

const DD = data.doordash, ST = data.stumptown, IK = data.ikea;
const pct = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`;
const millions = (v: number) => `${v < 0 ? '−' : '+'}$${Math.abs(v / 1e6).toFixed(2)}M`;
const thousands = (v: number) => `$${Math.round(v / 1000)}K`;
const cents = (v: number) => `$${v.toFixed(2)}`;

type Mark = 'empty' | 'right' | 'wrong' | 'skipped';

// A ballot box: empty, checked (right), filled (a call that missed), dashed (skipped).
function BallotBox({ mark, size = 14 }: { mark: Mark; size?: number }) {
  const s = size, r = Math.round(s * 0.22);
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden style={{ flex: 'none', display: 'block' }}>
      <rect x="1" y="1" width={s - 2} height={s - 2} rx={r} fill={mark === 'right' ? ACCENT : mark === 'wrong' ? 'rgba(255,255,255,0.55)' : 'none'}
        stroke={mark === 'right' ? ACCENT : 'rgba(255,255,255,0.55)'} strokeWidth="2" strokeDasharray={mark === 'skipped' ? '2 2' : undefined} />
      {mark === 'right' && <path d={`M${s * 0.27} ${s * 0.52}l${s * 0.16} ${s * 0.16} ${s * 0.32}-${s * 0.34}`} stroke="#0a0a0a" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}
const GLYPH = <BallotBox mark="right" />;

type Choice = { label: string; sub: string };
type Outcome = { picked: number | null; right: boolean };
const markOf = (o: Outcome | null): Mark => (!o ? 'empty' : o.picked === null ? 'skipped' : o.right ? 'right' : 'wrong');

// Result ballots: one card per policy, the bar printed along its bottom edge.
type Tile = { label: string; value: number; display: string; strong?: boolean };
function ResultTiles({ tiles, max, reduced }: { tiles: Tile[]; max: number; reduced: boolean }) {
  return (
    <div className="mt-tiles" style={{ display: 'grid', gridTemplateColumns: `repeat(${tiles.length}, minmax(0, 1fr))`, gap: 12, marginTop: 20 }}>
      {tiles.map((t, i) => {
        const neg = t.value < 0;
        const w = Math.max(2, (Math.abs(t.value) / max) * 100);
        return (
          <motion.div key={t.label} initial={reduced ? false : { opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'relative', overflow: 'hidden', borderRadius: 12, padding: '16px 18px 24px', background: t.strong ? accentAlpha(0.08) : '#0d0d0d', border: `2px solid ${t.strong ? ACCENT : 'rgba(255,255,255,0.14)'}` }}>
            <span style={{ ...LABEL, fontSize: 11, letterSpacing: '0.12em', display: 'block', color: t.strong ? ACCENT_BRIGHT : INK.label }}>{t.label}</span>
            <span style={{ display: 'block', fontFamily: MONO, fontSize: 'clamp(24px, 2.6vw, 32px)', letterSpacing: '-0.02em', marginTop: 8, color: t.strong ? ACCENT_BRIGHT : neg ? INK.soft : '#ffffff' }}>{t.display}</span>
            {neg && <span style={{ fontFamily: MONO, fontSize: 11, color: INK.faint }}>a loss</span>}
            <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 6, background: 'rgba(255,255,255,0.05)' }} />
            <motion.span initial={reduced ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7, delay: 0.35 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'absolute', bottom: 0, height: 6, width: `${w}%`, [neg ? 'right' : 'left']: 0, transformOrigin: neg ? 'right' : 'left', background: neg ? 'rgba(255,255,255,0.22)' : t.strong ? ACCENT : 'rgba(255,255,255,0.42)' } as React.CSSProperties} />
          </motion.div>
        );
      })}
    </div>
  );
}

// GUESS THEN REVEAL. The visitor commits before the held-out result appears.
// Scrolling past without choosing reveals it anyway.
function GuessCase({ index, eyebrow, title, setup, question, choices, correct, verdict, onCall, reveal, reduced }: {
  index: number; eyebrow: string; title: string; setup: string; question: string; choices: Choice[];
  correct: number[]; verdict: (picked: number | null) => string; onCall: (i: number, o: Outcome) => void;
  reveal: React.ReactNode; reduced: boolean;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [shown, setShown] = useState(false);
  const [focus, setFocus] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const shownRef = useRef(false);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);

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

  // Arrow keys move between the three ballots; Enter or Space casts. A call is final, so arrows never cast.
  const onKey = (e: React.KeyboardEvent) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const n = (focus + step + choices.length) % choices.length;
    setFocus(n); btns.current[n]?.focus();
  };

  const right = picked !== null && correct.includes(picked);
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '96px 0' }}>
      <div style={WRAP} className="mt-wrap">
        <Rise reduced={reduced}>
          <Head glyph={GLYPH} eyebrow={eyebrow} title={title} />
          <p style={BODY}>{setup}</p>
        </Rise>

        <div style={{ ...CARD, padding: 32, marginTop: 40 }} className="mt-card">
          <p id={`mt-q-${index}`} style={{ fontFamily: INTER, fontSize: 20, fontWeight: 500, color: '#ffffff', margin: '0 0 20px', lineHeight: 1.45 }}>{question}</p>
          <div role="group" aria-labelledby={`mt-q-${index}`} onKeyDown={onKey} className="mt-choices" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
            {choices.map((c, i) => {
              const isPick = picked === i, isRight = shown && correct.includes(i);
              const mark: Mark = isPick ? (isRight ? 'right' : 'wrong') : isRight ? 'right' : 'empty';
              return (
                <button key={c.label} ref={(el) => { btns.current[i] = el; }} aria-pressed={isPick} aria-disabled={shown}
                  tabIndex={i === focus ? 0 : -1} onFocus={() => setFocus(i)} onClick={() => commit(i)}
                  className="mt-choice"
                  style={{
                    textAlign: 'left', cursor: shown ? 'default' : 'pointer', borderRadius: 12, padding: '16px 18px',
                    background: isPick ? accentAlpha(0.1) : '#0a0a0a',
                    border: `2px solid ${isPick ? ACCENT : isRight ? accentAlpha(0.5) : 'rgba(255,255,255,0.24)'}`,
                    color: '#ffffff', opacity: shown && !isPick && !isRight ? 0.5 : 1, transition: 'all 0.2s',
                    display: 'grid', gridTemplateColumns: '18px 1fr', gap: 12, alignItems: 'start',
                  }}>
                  <span style={{ marginTop: 3 }}><BallotBox mark={mark} size={16} /></span>
                  <span>
                    <span style={{ display: 'block', fontFamily: INTER, fontSize: 16, fontWeight: 500 }}>{c.label}</span>
                    <span style={{ display: 'block', fontFamily: INTER, fontSize: 13, fontWeight: 300, color: INK.soft, marginTop: 4 }}>{c.sub}</span>
                    {shown && (isPick || isRight) && (
                      <span style={{ display: 'block', ...LABEL, fontSize: 10, marginTop: 10, color: isRight ? ACCENT_BRIGHT : INK.label }}>
                        {isRight && isPick ? 'Your call · best call' : isRight ? 'Best call' : 'Your call'}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          {!shown ? (
            <button onClick={() => commit(null)} className="mt-skip" style={{ marginTop: 16, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: MONO, fontSize: 12, color: INK.label, textDecoration: 'underline', textUnderlineOffset: 4 }}>
              Just show me the result
            </button>
          ) : (
            <motion.p initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} aria-live="polite"
              style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontFamily: INTER, fontSize: 17, color: right ? ACCENT_BRIGHT : 'rgba(255,255,255,0.9)', margin: '24px 0 0', lineHeight: 1.6 }}>
              <span style={{ marginTop: 5 }}><BallotBox mark={picked === null ? 'skipped' : right ? 'right' : 'wrong'} size={16} /></span>
              {verdict(picked)}
            </motion.p>
          )}
        </div>

        {shown && (
          <motion.div initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {reveal}
          </motion.div>
        )}
        <div ref={endRef} style={{ height: 1 }} />
      </div>
    </section>
  );
}

// Supporting charts (only rendered after the reveal)
function GainsChart() {
  // Drawn at the container's own pixel width so the axis text stays 11px on every screen.
  const boxRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(560);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.max(280, Math.min(640, el.clientWidth))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = W < 420 ? 240 : 300, L = 56, R = 16, T = 16, B = 52;
  const x = (v: number) => L + v * (W - L - R), y = (v: number) => H - B - v * (H - B - T);
  const path = (pts: number[][]) => pts.map(([a, b], i) => `${i ? 'L' : 'M'}${x(a).toFixed(1)} ${y(b).toFixed(1)}`).join('');
  const log = DD.gains['Logistic model'], rfm = DD.gains['RFM segments'];
  const swatch = (c: string, dash?: boolean) => <svg width="22" height="8" aria-hidden style={{ marginRight: 8, verticalAlign: 'middle' }}><line x1="0" y1="4" x2="22" y2="4" stroke={c} strokeWidth="2" strokeDasharray={dash ? '3 3' : undefined} /></svg>;
  return (
    <div style={{ ...CARD, padding: '24px 24px 16px', marginTop: 24 }} className="mt-card">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 22px', fontFamily: MONO, fontSize: 12, color: INK.label, marginBottom: 12 }}>
        <span>{swatch(ACCENT)}Logistic model</span><span>{swatch('rgba(255,255,255,0.6)')}RFM segments</span><span>{swatch('rgba(255,255,255,0.35)', true)}Random</span>
      </div>
      <div ref={boxRef} style={{ width: '100%' }} />
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ maxWidth: '100%', display: 'block' }} role="img"
        aria-label="Gains chart: share of responders reached by targeting the top share of customers, logistic model and RFM close together, both well above random">
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={x(0)} y1={y(t)} x2={x(1)} y2={y(t)} stroke="rgba(255,255,255,0.08)" />
            <text x={L - 10} y={y(t) + 4} fill={INK.faint} fontSize={11} fontFamily={MONO} textAnchor="end">{t * 100}%</text>
            <text x={x(t)} y={H - B + 18} fill={INK.faint} fontSize={11} fontFamily={MONO} textAnchor={t === 0 ? 'start' : t === 1 ? 'end' : 'middle'}>{t * 100}%</text>
          </g>
        ))}
        <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} stroke="rgba(255,255,255,0.35)" strokeDasharray="3 4" />
        <path d={path(rfm)} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} />
        <path d={path(log)} fill="none" stroke={ACCENT} strokeWidth={2} />
        <text x={x(0.5)} y={H - 8} fill={INK.label} fontSize={11} fontFamily={MONO} textAnchor="middle">Customers targeted, most likely first</text>
        <text transform={`translate(14 ${y(0.5)}) rotate(-90)`} fill={INK.label} fontSize={11} fontFamily={MONO} textAnchor="middle">Responders reached</text>
      </svg>
    </div>
  );
}

function DecileChart({ reduced }: { reduced: boolean }) {
  const max = Math.max(...ST.deciles) * 1.1;
  return (
    <div style={{ ...CARD, padding: '24px 24px 18px', marginTop: 24 }} className="mt-card">
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gap: 8, alignItems: 'end', height: 180, marginTop: 18 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: `${(ST.breakeven / max) * 100}%`, borderTop: '1px dashed rgba(255,255,255,0.55)', zIndex: 1 }}>
          <span style={{ position: 'absolute', right: 0, top: -20, fontFamily: MONO, fontSize: 11, color: INK.soft }}>Breakeven {pct(ST.breakeven)}</span>
        </div>
        {ST.deciles.map((v, i) => (
          <motion.div key={i} initial={reduced ? false : { height: 0 }} animate={{ height: `${(v / max) * 100}%` }}
            transition={reduced ? { duration: 0 } : { duration: 0.7, delay: i * 0.04 }}
            style={{ background: v > ST.breakeven ? ACCENT : 'rgba(255,255,255,0.25)', borderRadius: '3px 3px 0 0' }} title={`Decile ${i + 1}: ${pct(v)}`} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gap: 8, marginTop: 8, fontFamily: MONO, fontSize: 11, color: INK.label, textAlign: 'center' }}>
        {ST.deciles.map((v, i) => <span key={i}>{(v * 100).toFixed(0)}%</span>)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 11, color: INK.faint, marginTop: 6 }}>
        <span>Decile 1 · most likely</span><span>Decile 10</span>
      </div>
      <p style={NOTE}>Conversion by predicted-likelihood decile, out-of-fold. Periwinkle deciles clear breakeven and get a sample.</p>
    </div>
  );
}

function WhoVsWhat({ reduced }: { reduced: boolean }) {
  const income = Object.entries(IK.byIncome), dept = Object.entries(IK.byDept);
  const max = Math.max(...income.map(([, v]) => v));
  const label = (s: string) => s.replace('KitchenDining', 'Kitchen').replace('HomeDecor', 'Home Decor').replace('LivingRoom', 'Living Room');
  const col = (title: string, rows: [string, number][], strong: boolean) => (
    <div>
      <p style={{ ...LABEL, margin: '0 0 10px' }}>{title}</p>
      {rows.map(([k, v], i) => (
        <div key={k} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 56px', gap: 12, alignItems: 'center', padding: '6px 0' }}>
          <span style={{ fontFamily: INTER, fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.85)' }}>{label(k)}</span>
          <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <motion.div initial={reduced ? false : { width: 0 }} animate={{ width: `${Math.max(1, (v / max) * 100)}%` }}
              transition={reduced ? { duration: 0 } : { duration: 0.7, delay: i * 0.04 }}
              style={{ height: '100%', borderRadius: 99, background: strong ? ACCENT : 'rgba(255,255,255,0.4)' }} />
          </div>
          <span style={{ fontFamily: MONO, fontSize: 13, textAlign: 'right', color: INK.soft }}>{pct(v, 2)}</span>
        </div>
      ))}
    </div>
  );
  return (
    <div className="mt-who mt-card" style={{ ...CARD, padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 24 }}>
      {col('Purchase rate by email department', dept as [string, number][], false)}
      {col('Purchase rate by customer income', income as [string, number][], true)}
    </div>
  );
}

const CH1: Choice[] = [
  { label: 'Send to everyone', sub: 'No targeting, maximum reach' },
  { label: 'RFM segments', sub: 'Recency, frequency, spend buckets' },
  { label: 'Logistic model', sub: 'One probability per customer' },
];
const CH2: Choice[] = [
  { label: 'About 20% more', sub: 'A modest trim' },
  { label: 'About double', sub: 'Twice the profit' },
  { label: 'Nearly triple', sub: 'Three times the profit' },
];
const ikRandValue = IK.policies[0].value;
const CH3: Choice[] = [
  { label: `About ${cents(IK.promised)}`, sub: 'The model was right' },
  { label: 'About $2.00', sub: 'Half of the promise' },
  { label: `About ${cents(ikRandValue)}`, sub: 'Same as random emails' },
];
const CHOICES = [CH1, CH2, CH3];

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
  const PARA: React.CSSProperties = { ...BODY, fontSize: 17, marginTop: 24 };

  return (
    <div style={{ minHeight: '100vh' }}>
      <DotGridBackground />
      <style>{`
        .mt-choice:not([aria-disabled="true"]):hover { border-color: rgba(255,255,255,0.5) !important; background: #111111 !important; }
        .mt-choice:focus-visible, .mt-skip:focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 2px; }
        .mt-skip:hover { color: #ffffff !important; }
        @media (max-width: 767px) {
          .mt-wrap { padding: 0 20px !important; }
          .mt-card { padding: 20px !important; }
          .mt-choices { grid-template-columns: 1fr !important; }
          .mt-tiles { grid-template-columns: 1fr !important; gap: 8px !important; }
          .mt-tiles > div { padding: 12px 16px 18px !important; }
          .mt-who { grid-template-columns: 1fr !important; gap: 28px !important; }
          .mt-score { right: 16px !important; top: 22px !important; padding: 9px 12px !important; }
          .mt-score-word { display: none; }
          .mt-lessons, .mt-rules { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Running tally of the visitor's calls, in the nav row opposite Back. */}
      <div className="mt-score" role="status" aria-label={`Your calls: ${made} of 3 made, ${right} right`} style={{
        position: 'fixed', right: 40, top: 20, zIndex: 60, display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(13,13,13,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        border: '2px solid rgba(255,255,255,0.22)', borderRadius: 999, padding: '10px 16px',
        fontFamily: MONO, fontSize: 12, color: INK.soft,
      }}>
        <span className="mt-score-word">Your calls</span>
        <span style={{ display: 'flex', gap: 5 }}>{calls.map((c, i) => <BallotBox key={i} mark={markOf(c)} size={13} />)}</span>
        <span style={{ color: ACCENT_BRIGHT }}>{right} right</span>
      </div>

      {/* HERO */}
      <section style={{ position: 'relative', zIndex: 1, padding: '132px 0 24px' }}>
        <div style={WRAP} className="mt-wrap">
          <Rise reduced={reduced}>
            <span className="pk-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: MONO, fontSize: 13, letterSpacing: '0.3em', textTransform: 'uppercase', color: INK.label, margin: '0 0 24px' }}>
              {GLYPH}2026 · Marketing analytics · Machine learning
            </span>
            <h1 style={H1}>Who gets the offer?</h1>
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
        choices={CH1}
        correct={[2]}
        verdict={(p) => p === 2
          ? `Right. The model earns ${millions(ddLog.profit)}, and it beat RFM in ${Math.round(DD.robust.logistic_minus_rfm.share_positive * 20)} of 20 random splits.`
          : p === 1 ? `Close. RFM earns ${millions(ddRfm.profit)}, most of the value, but the model beat it in all 20 random splits.`
          : p === 0 ? `Sending to everyone loses money: ${pct(DD.responseRate)} respond, below the ${pct(DD.breakeven)} breakeven.`
          : `The model wins, RFM is close behind, and sending to everyone loses money.`}
        reveal={<>
          <ResultTiles reduced={reduced} max={ddMax} tiles={DD.policies.map((p, i) => ({ label: p.label, value: p.profit, display: millions(p.profit), strong: i === 2 }))} />
          <p style={PARA}>
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
        choices={CH2}
        correct={[2]}
        verdict={(p) => p === 2
          ? `Right. ${thousands(stLog.profit)} against ${thousands(stAll.profit)}, ${multiple.toFixed(1)} times as much, while mailing a third as many samples.`
          : `It's nearly triple: ${thousands(stLog.profit)} against ${thousands(stAll.profit)}, while mailing a third as many samples.`}
        reveal={<>
          <ResultTiles reduced={reduced} max={stMax} tiles={ST.policies.map((p, i) => ({ label: p.label, value: p.profit, display: thousands(p.profit), strong: i === 1 }))} />
          <p style={PARA}>
            Gradient boosting ({thousands(stGbm.profit)}) ties the logistic model: with 15,000 accounts there is no hidden pattern for it to find.
            Every score here is out-of-fold from 5-fold cross-validation. The class version scored the same rows the model was fit on and came out higher.
          </p>
          <DecileChart reduced={reduced} />
          <div style={{ ...CARD, padding: 20, marginTop: 20, borderLeft: `2px solid ${ACCENT}` }}>
            <p style={{ ...LABEL, color: ACCENT_BRIGHT, margin: '0 0 8px' }}>A trap along the way</p>
            <p style={{ fontFamily: INTER, fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.85)', lineHeight: 1.65, margin: 0 }}>
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
        choices={CH3}
        correct={[2]}
        verdict={(p) => p === 2
          ? `Right. ${cents(ikPers.value)} per customer, against ${cents(ikRand.value)} for random emails: a gain too small to tell from zero.`
          : `${cents(ikPers.value)} per customer, against ${cents(ikRand.value)} for random emails: a gain too small to tell from zero.`}
        reveal={<>
          <ResultTiles reduced={reduced} max={ikMax} tiles={[
            { label: 'What the model promised', value: IK.promised, display: cents(IK.promised) },
            { label: 'What it really earned', value: ikPers.value, display: cents(ikPers.value), strong: true },
            { label: ikRand.label, value: ikRand.value, display: cents(ikRand.value) },
          ]} />
          <p style={PARA}>
            The model graded its own homework. Because the weekly department really was random, I could score its picks against what customers actually did:
            keep the customers whose random email matched the model&apos;s pick, and weight them up. The promise was {(IK.promised / ikPers.value).toFixed(1)} times too high.
            Sending everyone the {ikTop.label.replace('Everyone gets ', '')} email ({cents(ikTop.value)}) does about as well, because those orders run larger.
          </p>
          <WhoVsWhat reduced={reduced} />
          <p style={PARA}>
            The department barely moves the chance of a purchase. The customer moves it about {Math.round(incomeRatio)} times. The money is in deciding who to email, not which email to send.
          </p>
          <p style={NOTE}>Purchase rates reweighted from the oversampled data to the true rate. Six-month value by weekly email count peaks at two emails a week ({cents(IK.ltv['2'])}).</p>
        </>}
      />

      {/* SCORECARD: your three ballots, each beside the lesson it taught. */}
      <section style={{ position: 'relative', zIndex: 1, padding: '96px 0' }}>
        <div style={WRAP} className="mt-wrap">
          <Rise reduced={reduced}>
            <Head glyph={GLYPH} eyebrow="Scorecard" title={done ? (made ? `You called ${right} of ${made}.` : 'Three campaigns, three lessons.') : 'Three campaigns, three lessons.'} />
          </Rise>
          <div className="mt-lessons" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginTop: 24 }}>
            {[
              { t: 'Blasting loses money', b: `When response sits below breakeven, sending to everyone pays to annoy people. The push campaign lost ${millions(ddAll.profit).replace('−', '')} that way.` },
              { t: 'Simple targeting does the work', b: 'Most of the gain comes from skipping customers below breakeven. A good logistic model adds a reliable edge; gradient boosting added nothing here.' },
              { t: 'Test against reality', b: `A model scored on its own predictions promised ${cents(IK.promised)} and delivered ${cents(ikPers.value)}. Held-out data and random assignment are what make a number trustworthy.` },
            ].map((c, i) => {
              const o = calls[i], m = markOf(o);
              const yours = o && o.picked !== null ? CHOICES[i][o.picked].label : o ? 'Skipped' : 'Not called yet';
              return (
                <div key={c.t} style={{ borderRadius: 12, padding: 24, background: '#0d0d0d', border: `2px solid ${m === 'right' ? ACCENT : 'rgba(255,255,255,0.14)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, ...LABEL, fontSize: 11, letterSpacing: '0.12em' }}>
                    <BallotBox mark={m} size={14} />Case {i + 1} · {yours}
                  </div>
                  <h3 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 600, color: '#ffffff', margin: '16px 0 10px' }}>{c.t}</h3>
                  <p style={{ fontFamily: INTER, fontSize: 15, fontWeight: 300, lineHeight: 1.65, color: INK.soft, margin: 0 }}>{c.b}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* METHOD + LINKS */}
      <section style={{ position: 'relative', zIndex: 1, padding: '40px 0 120px' }}>
        <div style={WRAP} className="mt-wrap">
          <Rise reduced={reduced}>
            <Head glyph={GLYPH} eyebrow="How it was scored" title="No number on this page graded itself." />
          </Rise>
          {/* The rulebook: four scoring rules, each ticked off. */}
          <div className="mt-rules" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px 64px', marginTop: 32 }}>
            {[
              { t: 'Held-out halves', b: 'Push campaign: targets chosen on one half of the customers, profit counted on the other half, then repeated over 20 random splits.' },
              { t: 'Out-of-fold scores', b: 'Free samples: with 15,000 accounts, each account is scored by a model trained on the other four folds.' },
              { t: 'Random assignment', b: 'Email: the weekly department was random, so any policy can be scored on real purchases with inverse propensity weighting.' },
              { t: 'Teaching cases', b: 'All three cases are simulated course material. The data stays private; the code and aggregate results are public.' },
            ].map((m) => (
              <div key={m.t} style={{ display: 'grid', gridTemplateColumns: '18px 1fr', gap: 14 }}>
                <span style={{ marginTop: 5 }}><BallotBox mark="right" size={16} /></span>
                <div>
                  <h3 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 600, color: '#ffffff', margin: '0 0 8px' }}>{m.t}</h3>
                  <p style={{ fontFamily: INTER, fontSize: 16, fontWeight: 300, lineHeight: 1.65, color: INK.soft, margin: 0, maxWidth: 480 }}>{m.b}</p>
                </div>
              </div>
            ))}
          </div>

          <ProjectLinks links={[
            { kind: 'Code', title: 'GitHub repo', body: 'The three analyses, the robustness checks and every number on this page. Case data is not included.', href: REPO_URL, cta: 'View the code' },
          ]} />
        </div>
      </section>
    </div>
  );
}

// Public analysis repo, created Nov 8 2026.
const REPO_URL = 'https://github.com/sebafleon-10/marketing-targeting';
