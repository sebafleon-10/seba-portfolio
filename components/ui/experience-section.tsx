'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { MONO } from '@/lib/fonts';
import { preload } from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useOrbReveal, OrbLabel } from '@/lib/use-orb-reveal';
import { useGravityAnchor, useClearZone } from '@/lib/use-particle-anchor';

// 002 · EXPERIENCE, the gallery wall (Sep 15 2026).
//
// A ledger of roles on the left and one opaque photo panel on the right that
// shows the selected role. Legibility comes from physics, not pixels: the
// panel is the network's gravity anchor and the ledger publishes a clearing
// zone that keeps particles out from under the copy. No text shadows, no
// scrims. Hover selects, click opens. On phones the panel becomes a sticky
// strip above the list and the row nearest the viewport center is selected.

const INTER = 'Inter, ui-rounded, system-ui, sans-serif';
// Same treatment the role-page heroes use, so the home page foreshadows them.
const PHOTO_FILTER = 'brightness(0.82) contrast(1.05) saturate(0)';
const SWAP = { duration: 0.4, ease: 'easeOut' as const };

type Panel =
  | { kind: 'photo'; src: string; alt: string; objectPosition?: string }
  | { kind: 'crest'; src: string; alt: string };

// Most recent role first. The slug doubles as the /experience/<slug> route.
// Copy for BTS and Radiator comes from the Sep 15 2026 role interviews; the
// tag and location fields from that interview are kept in comments since
// the row does not render them.
type Role = {
  slug: string;
  company: string;
  role: string;
  dates: string;
  oneLine: string;
  // Small mark in the panel caption (the rows are pure typography).
  logo: { src: string; alt: string; style?: CSSProperties };
  // Long company names drop to a smaller mono size so the row stays two
  // lines at most instead of towering over the copy.
  compact?: boolean;
  // What the panel shows for this role. Photos are the role-page heroes.
  panel: Panel;
};

const ROLES: Role[] = [
  {
    // Tag: Excel · Python · Claude. Location: Chicago, IL (Hybrid).
    slug: 'bts',
    company: 'BTS',
    role: 'Business Analyst, Strategy and Business Modeling',
    dates: 'Sep 2026 to Present',
    oneLine: 'Building business simulations and the AI tools inside them for leadership teams at large companies.',
    logo: { src: '/bts-logo-white.svg', alt: 'BTS logo' },
    panel: { kind: 'photo', src: '/bts-hero.jpg', alt: 'Leaders in a dim workshop room facing a simulation dashboard', objectPosition: '42% center' },
  },
  {
    // Tag: Python · Excel · Qlik. Location: Chicago, IL (Remote).
    slug: 'radiator',
    company: '1‑800 Radiator & A/C',
    compact: true,
    role: 'Data & Analytics Consultant (Contract)',
    dates: 'Jun 2026 to Aug 2026',
    oneLine: 'Built a four-warehouse delivery cost-to-serve model and the monthly pipeline that keeps it running.',
    // The only logo the brand publishes is a red badge; grayscale keeps the
    // home page hue-free. 250x72 source, never upscaled.
    logo: {
      src: '/radiator-logo.png',
      alt: '1-800 Radiator & A/C logo',
      style: { filter: 'grayscale(1) brightness(1.35) contrast(1.1)' },
    },
    panel: { kind: 'photo', src: '/radiator-hero.jpg', alt: 'Delivery van at a warehouse loading dock at night', objectPosition: '58% center' },
  },
  {
    slug: 'ghost-fc',
    company: 'Chicago Ghost FC',
    role: 'Data Analyst',
    dates: 'Jan 2026 to Aug 2026',
    oneLine: "Built the club's front-office analytics from the ground up: sponsorship prospecting, social pipelines, match-day KPIs.",
    logo: { src: '/ghost-fc-logo.png', alt: 'Chicago Ghost FC crest' },
    // No club photo; the panel is a flat title card with the crest.
    panel: { kind: 'crest', src: '/ghost-fc-logo.png', alt: 'Chicago Ghost FC crest' },
  },
];

// Editorial hairline row, adapted from the receipts list on /who with the
// accent stripped out: the home page stays hue-free by rule.
function RoleRow({ item, index, isLast, selected, onSelect, onOpen, rowRef }: {
  item: Role;
  index: number;
  isLast: boolean;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  rowRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <motion.div
      ref={rowRef}
      role="link"
      tabIndex={0}
      aria-label={`${item.company}, ${item.role}`}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.09, duration: 0.55, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.2 }}
      onMouseEnter={onSelect}
      onFocus={onSelect}
      onClick={onOpen}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
      style={{
        position: 'relative',
        padding: '26px 0 26px 28px',
        borderTop: '1px solid rgba(255,255,255,0.10)',
        borderBottom: isLast ? '1px solid rgba(255,255,255,0.10)' : 'none',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        display: 'flex', alignItems: 'center', pointerEvents: 'none',
      }}>
        <motion.span
          aria-hidden
          initial={{ scaleY: 0, opacity: 0 }}
          whileInView={{ scaleY: 1, opacity: 1 }}
          transition={{ delay: index * 0.09 + 0.18, duration: 0.4, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.2 }}
          style={{
            display: 'block',
            width: 3,
            height: selected ? 64 : 32,
            background: '#ffffff',
            transformOrigin: 'center',
            transition: 'height 0.3s ease',
          }}
        />
      </div>

      <div
        className="exp-row-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'center',
          gap: 32,
          transform: selected ? 'translateX(10px)' : 'translateX(0)',
          transition: 'transform 0.3s ease',
        }}
      >
        <div>
          <p style={{
            fontFamily: MONO,
            fontSize: item.compact ? 'clamp(20px, 2vw, 30px)' : 'clamp(26px, 2.6vw, 38px)',
            fontWeight: 700,
            letterSpacing: '0.04em',
            lineHeight: 1,
            color: selected ? '#ffffff' : 'rgba(255,255,255,0.7)',
            margin: 0,
            transition: 'color 0.25s ease',
          }}>{item.company}</p>
          <p style={{
            fontFamily: MONO, fontSize: 11, letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.45)',
            margin: '12px 0 8px',
          }}>{item.role} · {item.dates}</p>
          <p style={{
            fontFamily: INTER, fontSize: 17, fontWeight: 300,
            color: selected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.72)',
            lineHeight: 1.65, margin: 0, maxWidth: 460,
            transition: 'color 0.25s ease',
          }}>{item.oneLine}</p>
        </div>

        <span
          className="exp-row-arrow"
          aria-hidden
          style={{
            fontFamily: INTER,
            fontSize: 22,
            lineHeight: 1,
            color: selected ? '#ffffff' : 'rgba(255,255,255,0.5)',
            display: 'inline-block',
            transform: selected ? 'translateX(6px)' : 'translateX(0)',
            transition: 'transform 0.3s ease, color 0.25s ease',
          }}
        >
          →
        </span>
      </div>
    </motion.div>
  );
}

// The hung photograph. Every role's layer stays mounted so the swap is a pure
// crossfade with no decode hitch; the selected layer settles from 1.03 to 1.
function WallPanel({ selected, panelRef }: {
  selected: number;
  panelRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={panelRef}
      className="exp-panel"
      style={{
        position: 'relative',
        width: 'min(100%, calc(70vh * 0.75))',
        aspectRatio: '3 / 4',
        marginLeft: 'auto',
        borderRadius: 14,
        overflow: 'hidden',
        background: '#0d0d0d',
        boxShadow: '0 34px 70px -18px rgba(0,0,0,0.6)',
      }}
    >
      {ROLES.map((r, i) => {
        const isSelected = i === selected;
        return (
          <motion.div
            key={r.slug}
            aria-hidden={!isSelected}
            initial={false}
            animate={{ opacity: isSelected ? 1 : 0, scale: isSelected ? 1 : 1.03 }}
            transition={SWAP}
            style={{
              position: 'absolute', inset: 0,
              background: '#0d0d0d',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            {r.panel.kind === 'photo' ? (
              <img
                src={r.panel.src}
                alt={r.panel.alt}
                draggable={false}
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  objectPosition: r.panel.objectPosition ?? 'center',
                  filter: PHOTO_FILTER,
                  display: 'block',
                }}
              />
            ) : (
              <img
                src={r.panel.src}
                alt={r.panel.alt}
                draggable={false}
                style={{ width: '46%', maxHeight: '62%', objectFit: 'contain', opacity: 0.92, display: 'block' }}
              />
            )}
          </motion.div>
        );
      })}

      {/* Caption: bottom gradient, logo mark, company and dates */}
      <div aria-hidden style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: '38%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.78), transparent)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden className="exp-caption" style={{ position: 'absolute', left: 24, right: 24, bottom: 20, height: 72, pointerEvents: 'none' }}>
        {ROLES.map((r, i) => (
          <motion.div
            key={r.slug}
            initial={false}
            animate={{ opacity: i === selected ? 1 : 0 }}
            transition={SWAP}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
          >
            <img
              className="exp-caption-logo"
              src={r.logo.src}
              alt=""
              draggable={false}
              style={{ display: 'block', height: 24, width: 'auto', maxWidth: 120, opacity: 0.9, ...r.logo.style }}
            />
            <p style={{
              fontFamily: MONO, fontSize: 10, letterSpacing: '0.25em',
              textTransform: 'uppercase', lineHeight: 1.6,
              color: 'rgba(255,255,255,0.7)', margin: '8px 0 0',
            }}>{r.company} · {r.dates}</p>
          </motion.div>
        ))}
      </div>

      <div style={{
        position: 'absolute', inset: 0, borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.08)', pointerEvents: 'none',
      }} />
    </div>
  );
}

export function ExperienceSection() {
  const router = useRouter();
  const sectionRef  = useRef<HTMLElement>(null);
  const ledgerRef   = useRef<HTMLDivElement>(null);
  const panelRef    = useRef<HTMLDivElement>(null);
  const rowRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const orbLabelRef = useOrbReveal(sectionRef);
  const [selected, setSelected] = useState(0);

  useGravityAnchor(panelRef);
  useClearZone(ledgerRef, 40);

  // Warm the logos and panel images so the swap and the detail heroes paint
  // on their first frame.
  for (const r of ROLES) {
    preload(r.logo.src, { as: 'image' });
    preload(r.panel.src, { as: 'image' });
  }

  // Phones have no hover: the row nearest the viewport center is selected.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onScroll = () => {
      if (!mq.matches) return;
      const mid = window.innerHeight / 2;
      let best = 0, bestDist = Infinity;
      rowRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      setSelected(s => (s === best ? s : best));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experience"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
      }}
    >
      <OrbLabel labelRef={orbLabelRef}>002 · EXPERIENCE</OrbLabel>

      <style>{`
        .exp-wall {
          width: 100%; max-width: 1100px; padding: 0 64px;
          display: grid; grid-template-columns: 52% 1fr; gap: 64px; align-items: center;
        }
        @media (max-width: 767px) {
          .exp-wall { display: flex; flex-direction: column; align-items: stretch; padding: 88px 20px 48px; gap: 20px; }
          .exp-panel-cell { order: -1; position: sticky; top: 0; z-index: 2; }
          .exp-panel {
            width: 100% !important; aspect-ratio: 16 / 7 !important; max-height: 220px;
            border-radius: 0 0 14px 14px !important;
          }
          .exp-caption { left: 16px !important; right: 16px !important; bottom: 12px !important; height: 20px !important; }
          .exp-caption-logo { display: none !important; }
          .exp-row-arrow { display: none !important; }
        }
      `}</style>

      <div className="exp-wall">
        <div ref={ledgerRef} className="exp-ledger">
          {ROLES.map((r, i) => (
            <RoleRow
              key={r.slug}
              item={r}
              index={i}
              isLast={i === ROLES.length - 1}
              selected={i === selected}
              onSelect={() => setSelected(i)}
              onOpen={() => router.push(`/experience/${r.slug}`)}
              rowRef={el => { rowRefs.current[i] = el; }}
            />
          ))}
        </div>
        <div className="exp-panel-cell">
          <WallPanel selected={selected} panelRef={panelRef} />
        </div>
      </div>
    </section>
  );
}
