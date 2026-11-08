'use client';

import { useState, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { MONO } from '@/lib/fonts';
import { ACCENT, ACCENT_BRIGHT, accentAlpha } from '@/lib/accent';
import data from './loyalty-audit.json';

// The input chips carry this section: every chart below is drawn as a chip,
// a pill-shaped track with a periwinkle fill.

const INTER = 'Inter, ui-rounded, system-ui, sans-serif';
const pct = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`;
const LABEL_INK = 'rgba(255,255,255,0.62)';
const SOFT = 'rgba(255,255,255,0.72)';
const CAPSTONE = 0.997; // the capstone notebook's reported AUC, quoted in the copy

// Five kinds of input. Combination keys in loyalty-audit.json follow this order.
const GROUPS = [
  { key: 'age', label: 'Age' },
  { key: 'travel', label: 'Travel type' },
  { key: 'cls', label: 'Cabin class' },
  { key: 'service', label: '14 service ratings' },
  { key: 'other', label: 'Distance, delays, gender' },
] as const;
type Key = (typeof GROUPS)[number]['key'];
const COMBOS: Record<string, number[]> = data.combos;
const ALL_KEYS: Key[] = GROUPS.map((g) => g.key);

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';
function subscribeReduced(cb: () => void) {
  const mql = window.matchMedia(REDUCED_QUERY);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}
function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED_QUERY).matches, () => false);
}

function note(on: Set<Key>, auc: number) {
  if (on.size === 0) return 'No inputs: a coin flip. Guessing "loyal" for everyone is still right most of the time, which is why accuracy alone said so little.';
  if (!on.has('service')) return `No service ratings at all, and the model already scores ${auc.toFixed(2)}. It is reading who travels for work and how old they are.`;
  if (on.has('travel')) return `Travel type plus the ratings: near perfect. Among business travelers alone, the ratings separate loyal from disloyal at ${data.withinBusinessAuc.toFixed(3)}.`;
  return 'The ratings alone score high, which real survey answers rarely do. Add travel type and it jumps to almost perfect.';
}

// Section glyph: one chip, switched on.
const GLYPH = (
  <svg width="22" height="12" viewBox="0 0 22 12" aria-hidden style={{ flex: 'none' }}>
    <rect x="1" y="1" width="20" height="10" rx="5" fill={accentAlpha(0.18)} stroke={ACCENT} strokeWidth="2" />
  </svg>
);

// A chip-shaped bar: label, pill track, value.
function ChipBar({ label, value, strong, reduced, delay = 0 }: { label: string; value: number; strong?: boolean; reduced: boolean; delay?: number }) {
  return (
    <div className="aa-chipbar" style={{ display: 'grid', gridTemplateColumns: '160px minmax(0, 1fr) 56px', gap: 14, alignItems: 'center', padding: '5px 0' }}>
      <span style={{ fontFamily: INTER, fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.85)' }}>{label}</span>
      <span style={{ position: 'relative', height: 14, borderRadius: 99, border: '2px solid rgba(255,255,255,0.14)', overflow: 'hidden' }}>
        <motion.span key={reduced ? "still" : "moving"} initial={reduced ? false : { width: 0 }} animate={reduced ? { width: `${value * 100}%` } : undefined} whileInView={{ width: `${value * 100}%` }} viewport={{ once: true, amount: 0.6 }}
          transition={reduced ? { duration: 0 } : { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 99, background: strong ? ACCENT : 'rgba(255,255,255,0.4)' }} />
      </span>
      <span style={{ fontFamily: MONO, fontSize: 13, textAlign: 'right', color: strong ? ACCENT_BRIGHT : SOFT }}>{pct(value)}</span>
    </div>
  );
}

// POSTSCRIPT: the visitor rebuilds the capstone's 99 percent one kind of input at a time.
export function LoyaltyAudit() {
  const reduced = usePrefersReducedMotion();
  const [on, setOn] = useState<Set<Key>>(new Set(['age', 'travel', 'cls']));
  const [genz, setGenz] = useState(true);
  const key = GROUPS.filter((g) => on.has(g.key)).map((g) => g.key).join('+');
  const auc = key ? COMBOS[key][genz ? 1 : 0] : 0.5;
  const toggle = (k: Key) => setOn((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const at = (v: number) => `${((v - 0.5) / 0.5) * 100}%`;
  const pill = (active: boolean): React.CSSProperties => ({
    fontFamily: INTER, fontSize: 14, fontWeight: 500, cursor: 'pointer', borderRadius: 999, padding: '7px 15px',
    background: active ? accentAlpha(0.12) : 'transparent', border: `2px solid ${active ? ACCENT : 'rgba(255,255,255,0.22)'}`,
    color: active ? ACCENT_BRIGHT : 'rgba(255,255,255,0.8)', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'baseline', gap: 8,
  });
  const textBtn: React.CSSProperties = { background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: MONO, fontSize: 12, color: LABEL_INK, textDecoration: 'underline', textUnderlineOffset: 4 };
  const factHead: React.CSSProperties = { fontFamily: MONO, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: ACCENT_BRIGHT };
  const small: React.CSSProperties = { fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: LABEL_INK };
  const card: React.CSSProperties = { background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 28 };
  const reached = auc >= CAPSTONE;

  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '120px 0 40px' }}>
      <style>{`
        .aa-audit button:focus-visible, .aa-audit a:focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 2px; }
        .aa-chip:hover { border-color: rgba(255,255,255,0.45) !important; }
        .aa-chip[aria-pressed="true"]:hover { border-color: ${ACCENT_BRIGHT} !important; }
        .aa-textbtn:hover { color: #ffffff !important; }
        .aa-code { transition: border-color 0.2s, transform 0.2s; }
        .aa-code:hover { border-color: ${ACCENT} !important; transform: translateY(-1px); }
        @media (max-width: 767px) {
          .aa-audit-wrap { padding: 0 20px !important; }
          .aa-audit-card { padding: 22px !important; }
          .aa-audit-facts { grid-template-columns: 1fr !important; }
          .aa-audit-eyebrow { font-size: 11px !important; letter-spacing: 0.22em !important; gap: 10px !important; }
          .aa-chipbar { grid-template-columns: 1fr 56px !important; gap: 6px 12px !important; }
          .aa-chipbar > span:nth-child(2) { grid-column: 1 / -1; grid-row: 2; }
          .aa-axis-mid { display: none; }
        }
      `}</style>
      <div className="aa-audit aa-audit-wrap" style={{ maxWidth: 1200, width: '100%', margin: '0 auto', padding: '0 64px' }}>
        <p className="aa-audit-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: MONO, fontSize: 13, letterSpacing: '0.3em', textTransform: 'uppercase', color: LABEL_INK, margin: '0 0 18px' }}>
          {GLYPH}Postscript · The machine learning, audited
        </p>
        <h2 style={{ fontFamily: INTER, fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, color: '#ffffff', margin: '0 0 24px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          What the 99% was really measuring
        </h2>
        <p style={{ fontFamily: INTER, fontSize: 'clamp(17px, 1.6vw, 20px)', fontWeight: 300, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, margin: 0, maxWidth: 760 }}>
          The capstone&apos;s machine learning model predicted which Gen Z travelers were loyal customers and scored an AUC of 0.997. That number was questioned at our midterm, so
          after the project I rebuilt it on the public survey it used. I got the same result, {data.reproduce.auc.toFixed(3)}, then took it apart. Switch the inputs below and watch
          the score on {data.nTest.toLocaleString('en-US')} held-out passengers.
        </p>

        <div className="aa-audit-card" style={{ ...card, padding: 32, marginTop: 40 }}>
          <div role="group" aria-label="Model inputs" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {GROUPS.map((g) => {
              const solo = COMBOS[g.key][genz ? 1 : 0];
              return (
                <button key={g.key} aria-pressed={on.has(g.key)} onClick={() => toggle(g.key)} className="aa-chip" style={pill(on.has(g.key))}
                  aria-label={`${g.label}, scores ${solo.toFixed(2)} alone`}>
                  {g.label}<span style={{ fontFamily: MONO, fontSize: 12, opacity: 0.8 }}>{solo.toFixed(2)}</span>
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '8px 18px', flexWrap: 'wrap', marginTop: 12, alignItems: 'baseline' }}>
            <span style={{ fontFamily: MONO, fontSize: 12, color: LABEL_INK }}>Each chip shows its score alone.</span>
            <button className="aa-textbtn" style={textBtn} onClick={() => setOn(new Set(ALL_KEYS))}>Turn every input on</button>
            <button className="aa-textbtn" style={textBtn} onClick={() => setOn(new Set())}>Clear</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginTop: 28 }}>
            <div>
              <span style={small}>Holdout AUC</span>
              <div aria-live="polite" style={{ fontFamily: MONO, fontSize: 'clamp(40px, 5vw, 60px)', color: ACCENT_BRIGHT, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{auc.toFixed(3)}</div>
            </div>
            <div role="group" aria-label="Passengers scored" style={{ display: 'flex', gap: 8 }}>
              <button aria-pressed={genz} onClick={() => setGenz(true)} className="aa-chip" style={pill(genz)}>Gen Z only</button>
              <button aria-pressed={!genz} onClick={() => setGenz(false)} className="aa-chip" style={pill(!genz)}>All ages</button>
            </div>
          </div>

          {/* The meter is one long chip, with the capstone's 0.997 marked as the target to rebuild. */}
          <div style={{ position: 'relative', marginTop: 36 }}>
            <span style={{ position: 'absolute', right: 0, top: -22, fontFamily: MONO, fontSize: 11, color: reached ? ACCENT_BRIGHT : SOFT, whiteSpace: 'nowrap' }}>
              Capstone {CAPSTONE.toFixed(3)}{reached ? ', rebuilt' : ''}
            </span>
            <div style={{ position: 'relative', height: 18, borderRadius: 99, border: '2px solid rgba(255,255,255,0.18)', overflow: 'hidden' }}>
              <motion.div animate={{ width: at(auc) }} transition={reduced ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 99, background: ACCENT }} />
              {[0.6, 0.7, 0.8, 0.9].map((t) => <span key={t} style={{ position: 'absolute', left: at(t), top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.45)' }} />)}
              <span style={{ position: 'absolute', left: at(CAPSTONE), top: 0, bottom: 0, width: 2, marginLeft: -1, background: '#ffffff' }} />
            </div>
          </div>
          <div style={{ position: 'relative', height: 16, fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
            {[0.5, 0.6, 0.7, 0.8, 0.9, 1].map((t) => (
              <span key={t} className={t === 0.6 || t === 0.8 ? 'aa-axis-mid' : undefined} style={{ position: 'absolute', left: at(t), transform: t === 0.5 ? 'none' : t === 1 ? 'translateX(-100%)' : 'translateX(-50%)', whiteSpace: 'nowrap' }}>
                {t === 0.5 ? '0.5 coin flip' : t === 1 ? '1.0' : t.toFixed(1)}
              </span>
            ))}
          </div>
          <p style={{ fontFamily: INTER, fontSize: 16, fontWeight: 300, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, margin: '18px 0 0', minHeight: 52 }}>{note(on, auc)}</p>
        </div>

        <div className="aa-audit-facts" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
          <div style={card} className="aa-audit-card">
            <span style={factHead}>The shortcut</span>
            <p style={{ fontFamily: INTER, fontSize: 16, fontWeight: 300, color: 'rgba(255,255,255,0.82)', lineHeight: 1.65, margin: '10px 0 18px' }}>
              <span style={{ color: '#ffffff', fontWeight: 500 }}>{pct(data.loyalPersonal)}</span> of personal travelers are labeled loyal, against {pct(data.loyalBusiness)} of business travelers.
              Loyalty also climbs with age, from {pct(data.byGeneration['Gen Z (27 and under)'])} for Gen Z to {pct(data.byGeneration.Boomer)} for Boomers. Know who travels for work and how old they are, and most of the answer is already there.
            </p>
            <span style={small}>Labeled loyal</span>
            <div style={{ marginTop: 6 }}>
              <ChipBar label="Personal travel" value={data.loyalPersonal} strong reduced={reduced} />
              <ChipBar label="Business travel" value={data.loyalBusiness} reduced={reduced} delay={0.06} />
              <div style={{ height: 10 }} />
              {Object.entries(data.byGeneration).map(([g, v], i) => (
                <ChipBar key={g} label={g.replace(' (27 and under)', '')} value={v} strong={i === 0} reduced={reduced} delay={0.12 + i * 0.06} />
              ))}
            </div>
          </div>
          <div style={card} className="aa-audit-card">
            <span style={factHead}>Too clean to be real</span>
            <p style={{ fontFamily: INTER, fontSize: 16, fontWeight: 300, color: 'rgba(255,255,255,0.82)', lineHeight: 1.65, margin: '10px 0 18px' }}>
              Among business travelers the 14 ratings separate loyal from disloyal at <span style={{ color: '#ffffff', fontWeight: 500 }}>{data.withinBusinessAuc.toFixed(3)}</span>.
              Real survey answers rarely line up that cleanly. Those who marked departure convenience &quot;not applicable&quot; are {pct(data.naDisloyal.disloyal_share_when_0, 0)} disloyal, against {`${pct(data.naDisloyal.disloyal_share_overall, 0)} overall.`}
              The pattern fits simulated data; I could not verify the dataset&apos;s origin.
            </p>
            <span style={small}>Disloyal</span>
            <div style={{ marginTop: 6 }}>
              <ChipBar label="Marked not applicable" value={data.naDisloyal.disloyal_share_when_0} strong reduced={reduced} />
              <ChipBar label="Everyone" value={data.naDisloyal.disloyal_share_overall} reduced={reduced} delay={0.06} />
            </div>
          </div>
        </div>

        <p style={{ fontFamily: INTER, fontSize: 'clamp(17px, 1.6vw, 20px)', fontWeight: 300, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, margin: '40px 0 0', maxWidth: 760 }}>
          The model was accurate, but it learned how the dataset was built, not what makes a traveler loyal. The label was also a customer type, not AAdvantage enrollment.
          The Reddit research above stands on its own; answering the loyalty question with a model needs American&apos;s own member data and a design that separates service from who travels for work.
        </p>
        <a href="https://github.com/sebafleon-10/airline-loyalty" target="_blank" rel="noopener noreferrer" className="aa-code"
          style={{ display: 'inline-block', marginTop: 24, fontFamily: INTER, fontSize: 15, fontWeight: 500, color: ACCENT_BRIGHT, textDecoration: 'none', border: `2px solid ${accentAlpha(0.45)}`, borderRadius: 999, padding: '9px 19px' }}>
          Read the audit code →
        </a>
      </div>
    </section>
  );
}
