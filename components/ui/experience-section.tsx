'use client';

import { useEffect, useRef, useState } from 'react';
import { preload } from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useOrbReveal, OrbLabel } from '@/lib/use-orb-reveal';

const INTER = 'Inter, ui-rounded, system-ui, sans-serif';
const MONO  = 'monospace';
// Same shadow the WHO marquee uses so copy stays legible over the particles.
const TEXT_SHADOW = '0 0 8px rgba(0,0,0,0.85), 0 0 24px rgba(0,0,0,0.6)';

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
  logo: { src: string; alt: string; style?: React.CSSProperties };
  // Long company names drop to a smaller mono size so the row stays two
  // lines at most instead of towering over the copy.
  compact?: boolean;
  // Hero photo on the detail page, preloaded from here so it paints on the
  // first frame after click-through (same idea as the /who hero preload).
  heroImage?: string;
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
    heroImage: '/bts-hero.jpg',
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
      style: { filter: 'grayscale(1) brightness(1.35) contrast(1.1)', height: 36 },
    },
    heroImage: '/radiator-hero.jpg',
  },
  {
    slug: 'ghost-fc',
    company: 'Chicago Ghost FC',
    role: 'Data Analyst',
    dates: 'Jan 2026 to Aug 2026',
    oneLine: "Built the club's front-office analytics from the ground up: sponsorship prospecting, social pipelines, match-day KPIs.",
    logo: { src: '/ghost-fc-logo.png', alt: 'Chicago Ghost FC crest' },
  },
];

// Editorial hairline row, adapted from the receipts list on /who with the
// accent stripped out: the home page stays hue-free by rule.
function RoleRow({ item, index, isLast, onOpen }: {
  item: Role;
  index: number;
  isLast: boolean;
  onOpen: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const logoRef = useRef<HTMLImageElement>(null);

  // A missing logo 404s before hydration, so onError never fires for it.
  // Check the already-settled state once on mount and hide the box.
  useEffect(() => {
    const img = logoRef.current;
    if (img && img.complete && img.naturalWidth === 0) img.style.display = 'none';
  }, []);

  return (
    <motion.div
      role="link"
      tabIndex={0}
      aria-label={`${item.company}, ${item.role}`}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.09, duration: 0.55, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.2 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
      style={{
        position: 'relative',
        padding: '36px 0 36px 28px',
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
            height: hovered ? 64 : 32,
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
          gridTemplateColumns: 'minmax(260px, 38%) 1fr auto',
          alignItems: 'flex-start',
          gap: 48,
          transform: hovered ? 'translateX(10px)' : 'translateX(0)',
          transition: 'transform 0.3s ease',
        }}
      >
        <div>
          <p style={{
            fontFamily: MONO,
            fontSize: item.compact ? 'clamp(22px, 2.3vw, 34px)' : 'clamp(28px, 3vw, 44px)',
            fontWeight: 700,
            letterSpacing: '0.04em',
            lineHeight: 1,
            color: hovered ? '#ffffff' : 'rgba(255,255,255,0.7)',
            margin: 0,
            textShadow: TEXT_SHADOW,
            transition: 'color 0.25s ease',
          }}>{item.company}</p>
          <img
            ref={logoRef}
            src={item.logo.src}
            alt={item.logo.alt}
            draggable={false}
            onError={e => { e.currentTarget.style.display = 'none'; }}
            style={{
              display: 'block',
              height: 28,
              width: 'auto',
              marginTop: 14,
              opacity: hovered ? 1 : 0.85,
              transition: 'opacity 0.25s ease',
              ...item.logo.style,
            }}
          />
        </div>

        <div>
          <p style={{
            fontFamily: MONO, fontSize: 11, letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.45)',
            margin: '8px 0 14px',
            textShadow: TEXT_SHADOW,
          }}>{item.role} · {item.dates}</p>
          <p style={{
            fontFamily: INTER, fontSize: 19, fontWeight: 300,
            color: hovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.72)',
            lineHeight: 1.7, margin: 0, maxWidth: 640,
            textShadow: TEXT_SHADOW,
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
            color: hovered ? '#ffffff' : 'rgba(255,255,255,0.5)',
            alignSelf: 'center',
            display: 'inline-block',
            transform: hovered ? 'translateX(6px)' : 'translateX(0)',
            transition: 'transform 0.3s ease, color 0.25s ease',
          }}
        >
          →
        </span>
      </div>
    </motion.div>
  );
}

export function ExperienceSection() {
  const router = useRouter();
  const sectionRef  = useRef<HTMLElement>(null);
  const orbLabelRef = useOrbReveal(sectionRef);

  // Warm the role logos and hero photos so the detail heroes paint on their
  // first frame.
  for (const r of ROLES) {
    preload(r.logo.src, { as: 'image' });
    if (r.heroImage) preload(r.heroImage, { as: 'image' });
  }

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
        .exp-list { width: 100%; max-width: 1100px; padding: 0 64px; }
        @media (max-width: 767px) {
          .exp-list { padding: 0 20px; }
          .exp-row-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .exp-row-arrow { display: none !important; }
        }
      `}</style>

      <div className="exp-list">
        {ROLES.map((r, i) => (
          <RoleRow
            key={r.slug}
            item={r}
            index={i}
            isLast={i === ROLES.length - 1}
            onOpen={() => router.push(`/experience/${r.slug}`)}
          />
        ))}
      </div>
    </section>
  );
}
