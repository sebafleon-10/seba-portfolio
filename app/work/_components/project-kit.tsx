'use client';

// Shared identity for the machine learning project pages (P2P, Marketing,
// House Prices). What lives here is site identity only: type scale, ink
// levels that pass WCAG AA on the dark ground, the card surface, reduced
// motion, and the closing code and data block. Section headers, charts,
// method layouts and motion signatures are per page on purpose.

import { useEffect, useState, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { MONO } from '@/lib/fonts';
import { ACCENT, ACCENT_BRIGHT, accentAlpha } from '@/lib/accent';

export const INTER = 'Inter, ui-rounded, system-ui, sans-serif';

// White on the near-black page. 0.5 is the floor for text (about 5:1);
// 0.62 for small mono labels, 0.82 for body copy.
export const INK = { body: 'rgba(255,255,255,0.82)', soft: 'rgba(255,255,255,0.72)', label: 'rgba(255,255,255,0.62)', note: 'rgba(255,255,255,0.58)', faint: 'rgba(255,255,255,0.5)' };

export const H1: React.CSSProperties = {
  fontFamily: INTER, fontSize: 'clamp(40px, 5.6vw, 76px)', fontWeight: 800, color: '#ffffff',
  letterSpacing: '-0.04em', lineHeight: 1.02, margin: '0 0 24px',
};
export const H2: React.CSSProperties = {
  fontFamily: INTER, fontSize: 'clamp(30px, 3.8vw, 50px)', fontWeight: 700, color: '#ffffff',
  letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 20px',
};
export const BODY: React.CSSProperties = {
  fontFamily: INTER, fontSize: 'clamp(17px, 1.6vw, 20px)', fontWeight: 300,
  color: INK.body, lineHeight: 1.7, margin: 0, maxWidth: 720,
};
export const NOTE: React.CSSProperties = { fontFamily: MONO, fontSize: 13, color: INK.note, lineHeight: 1.6, margin: '14px 0 0' };
export const LABEL: React.CSSProperties = { fontFamily: MONO, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: INK.label };
export const WRAP: React.CSSProperties = { maxWidth: 1200, width: '100%', margin: '0 auto', padding: '0 64px' };
export const CARD: React.CSSProperties = { background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 };

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';
function subscribeReduced(cb: () => void) {
  const mql = window.matchMedia(REDUCED_QUERY);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED_QUERY).matches, () => false);
}

// True while a sticky element sits pinned at `top`. Pages add the pk-stuck
// class then, which paints a backing strip above the pinned readout on phones
// so content never shows through the Back pill's gradient.
export function useStuck(target: React.RefObject<HTMLElement | null>, top: number) {
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const el = target.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStuck(e.intersectionRatio < 1 && e.boundingClientRect.top <= top + 1),
      { rootMargin: `-${top + 1}px 0px 0px 0px`, threshold: [0, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, [target, top]);
  return stuck;
}

export function Rise({ children, reduced, delay = 0 }: { children: React.ReactNode; reduced: boolean; delay?: number }) {
  return (
    <motion.div initial={reduced ? false : { opacity: 0, y: 20 }} whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5, delay, ease: 'easeOut' }}>{children}</motion.div>
  );
}

// Section header: a page-specific glyph, the eyebrow, then the heading.
export function Head({ glyph, eyebrow, title, className }: { glyph: React.ReactNode; eyebrow: string; title?: React.ReactNode; className?: string }) {
  return (
    <>
      <span className={`pk-eyebrow ${className ?? ''}`} style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: MONO, fontSize: 13, letterSpacing: '0.3em', textTransform: 'uppercase', color: INK.label, margin: '0 0 22px' }}>
        <span aria-hidden style={{ display: 'inline-flex', flex: 'none' }}>{glyph}</span>{eyebrow}
      </span>
      {title && <h2 style={H2}>{title}</h2>}
    </>
  );
}

export type ProjectLink = { kind: string; title: string; body: string; href: string; cta: string };

// The closing block every project page shares: one ruled row per link.
export function ProjectLinks({ links }: { links: ProjectLink[] }) {
  return (
    <div style={{ marginTop: 120 }}>
      <span style={{ ...LABEL, letterSpacing: '0.3em', display: 'block', margin: '0 0 22px' }}>Code and data</span>
      <h2 style={{ ...H2, margin: '0 0 32px' }}>What I built</h2>
      <style>{`
        .pk-link { transition: background 0.2s; }
        .pk-link:hover { background: rgba(255,255,255,0.03); }
        .pk-link .pk-cta { transition: transform 0.2s, color 0.2s; }
        .pk-link:hover .pk-cta { transform: translateX(4px); color: #ffffff; }
        .pk-link:focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 2px; }
        @media (max-width: 767px) {
          .pk-stuck::before { content: ''; position: absolute; left: -20px; right: -20px; bottom: 100%; height: 72px; background: #000000; }
        }
        @media (max-width: 767px) {
          .pk-link { grid-template-columns: 1fr !important; gap: 8px !important; padding: 22px 0 !important; }
          .pk-link .pk-cta { justify-self: start; }
          .pk-eyebrow { font-size: 11px !important; letter-spacing: 0.22em !important; gap: 10px !important; }
        }
      `}</style>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        {links.map((d) => (
          <a key={d.title} href={d.href} target="_blank" rel="noopener noreferrer" className="pk-link"
            style={{ display: 'grid', gridTemplateColumns: '120px minmax(0, 1fr) auto', gap: 32, alignItems: 'baseline', padding: '28px 8px', borderBottom: '1px solid rgba(255,255,255,0.12)', textDecoration: 'none' }}>
            <span style={LABEL}>{d.kind}</span>
            <span>
              <span style={{ display: 'block', fontFamily: MONO, fontSize: 22, color: '#ffffff', marginBottom: 8 }}>{d.title}</span>
              <span style={{ display: 'block', fontFamily: INTER, fontSize: 15, fontWeight: 300, color: INK.soft, lineHeight: 1.65, maxWidth: 640 }}>{d.body}</span>
            </span>
            <span className="pk-cta" style={{ fontFamily: INTER, fontSize: 14, fontWeight: 500, color: ACCENT_BRIGHT, whiteSpace: 'nowrap', borderBottom: `1px solid ${accentAlpha(0.5)}`, paddingBottom: 2 }}>{d.cta} →</span>
          </a>
        ))}
      </div>
    </div>
  );
}
