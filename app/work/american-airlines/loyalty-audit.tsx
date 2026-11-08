'use client';

import { useState, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { MONO } from '@/lib/fonts';
import { ACCENT, ACCENT_BRIGHT, accentAlpha } from '@/lib/accent';
import data from './loyalty-audit.json';

const INTER = 'Inter, ui-rounded, system-ui, sans-serif';
const pct = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`;

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

// POSTSCRIPT: the visitor rebuilds the capstone's 99 percent one kind of input at a time.
export function LoyaltyAudit() {
  const reduced = usePrefersReducedMotion();
  const [on, setOn] = useState<Set<Key>>(new Set(['age', 'travel', 'cls']));
  const [genz, setGenz] = useState(true);
  const key = GROUPS.filter((g) => on.has(g.key)).map((g) => g.key).join('+');
  const auc = key ? COMBOS[key][genz ? 1 : 0] : 0.5;
  const toggle = (k: Key) => setOn((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const pill = (active: boolean): React.CSSProperties => ({
    fontFamily: INTER, fontSize: 14, fontWeight: 500, cursor: 'pointer', borderRadius: 999, padding: '7px 15px',
    background: active ? accentAlpha(0.12) : 'transparent', border: `2px solid ${active ? ACCENT : 'rgba(255,255,255,0.18)'}`,
    color: active ? ACCENT_BRIGHT : 'rgba(255,255,255,0.75)', transition: 'all 0.2s',
  });

  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '120px 0 40px' }}>
      <style>{`
        .aa-audit button:focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 2px; }
        @media (max-width: 767px) {
          .aa-audit-wrap { padding: 0 20px !important; }
          .aa-audit-card { padding: 22px !important; }
          .aa-audit-facts { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div className="aa-audit aa-audit-wrap" style={{ maxWidth: 1200, width: '100%', margin: '0 auto', padding: '0 64px' }}>
        <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', margin: '0 0 12px' }}>
          Postscript · The machine learning, audited
        </p>
        <h2 style={{ fontFamily: INTER, fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, color: '#ffffff', margin: '0 0 24px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          What the 99% was really measuring
        </h2>
        <p style={{ fontFamily: INTER, fontSize: 'clamp(17px, 1.6vw, 20px)', fontWeight: 300, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, margin: 0, maxWidth: 760 }}>
          The capstone&apos;s machine learning model predicted which Gen Z travelers were loyal customers and scored an AUC of 0.997. That number was questioned at our midterm, so
          after the project I rebuilt it on the public survey it used. I got the same result, {data.reproduce.auc.toFixed(3)}, then took it apart. Switch the inputs below and watch
          the score on {data.nTest.toLocaleString('en-US')} held-out passengers.
        </p>

        <div className="aa-audit-card" style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 32, marginTop: 40 }}>
          <div role="group" aria-label="Model inputs" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {GROUPS.map((g) => (
              <button key={g.key} aria-pressed={on.has(g.key)} onClick={() => toggle(g.key)} style={pill(on.has(g.key))}>{g.label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginTop: 28 }}>
            <div>
              <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Holdout AUC</span>
              <div aria-live="polite" style={{ fontFamily: MONO, fontSize: 'clamp(40px, 5vw, 60px)', color: ACCENT_BRIGHT, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{auc.toFixed(3)}</div>
            </div>
            <div role="group" aria-label="Passengers scored" style={{ display: 'flex', gap: 8 }}>
              <button aria-pressed={genz} onClick={() => setGenz(true)} style={pill(genz)}>Gen Z only</button>
              <button aria-pressed={!genz} onClick={() => setGenz(false)} style={pill(!genz)}>All ages</button>
            </div>
          </div>
          <div style={{ position: 'relative', height: 14, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginTop: 14 }}>
            <motion.div animate={{ width: `${((auc - 0.5) / 0.5) * 100}%` }} transition={reduced ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 99, background: ACCENT }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
            <span>0.5 coin flip</span><span>1.0 perfect</span>
          </div>
          <p style={{ fontFamily: INTER, fontSize: 16, fontWeight: 300, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: '18px 0 0', minHeight: 52 }}>{note(on, auc)}</p>
        </div>

        <div className="aa-audit-facts" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 28 }}>
            <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: ACCENT }}>The shortcut</span>
            <p style={{ fontFamily: INTER, fontSize: 16, fontWeight: 300, color: 'rgba(255,255,255,0.8)', lineHeight: 1.65, margin: '10px 0 0' }}>
              <span style={{ color: '#ffffff', fontWeight: 500 }}>{pct(data.loyalPersonal)}</span> of personal travelers are labeled loyal, against {pct(data.loyalBusiness)} of business travelers.
              Loyalty also climbs with age, from {pct(data.byGeneration['Gen Z (27 and under)'])} for Gen Z to {pct(data.byGeneration.Boomer)} for Boomers. Know who travels for work and how old they are, and most of the answer is already there.
            </p>
          </div>
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 28 }}>
            <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: ACCENT }}>Too clean to be real</span>
            <p style={{ fontFamily: INTER, fontSize: 16, fontWeight: 300, color: 'rgba(255,255,255,0.8)', lineHeight: 1.65, margin: '10px 0 0' }}>
              Among business travelers the 14 ratings separate loyal from disloyal at <span style={{ color: '#ffffff', fontWeight: 500 }}>{data.withinBusinessAuc.toFixed(3)}</span>.
              Real survey answers rarely line up that cleanly. Those who marked departure convenience &quot;not applicable&quot; are {pct(data.naDisloyal.disloyal_share_when_0, 0)} disloyal, against {pct(data.naDisloyal.disloyal_share_overall, 0)} overall.
              The pattern fits simulated data; I could not verify the dataset&apos;s origin.
            </p>
          </div>
        </div>

        <p style={{ fontFamily: INTER, fontSize: 'clamp(17px, 1.6vw, 20px)', fontWeight: 300, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, margin: '40px 0 0', maxWidth: 760 }}>
          The model was accurate, but it learned how the dataset was built, not what makes a traveler loyal. The label was also a customer type, not AAdvantage enrollment.
          The Reddit research above stands on its own; answering the loyalty question with a model needs American&apos;s own member data and a design that separates service from who travels for work.
        </p>
        <a href="https://github.com/sebafleon-10/airline-loyalty" target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-block', marginTop: 24, fontFamily: INTER, fontSize: 15, fontWeight: 500, color: ACCENT_BRIGHT, textDecoration: 'none', borderBottom: `1px solid ${accentAlpha(0.5)}`, paddingBottom: 2 }}>
          {/* PLACEHOLDER: repo goes public once Sebastian approves publishing it. */}
          Read the audit code →
        </a>
      </div>
    </section>
  );
}
