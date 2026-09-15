'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { DotGridBackground } from '@/components/ui/dot-grid-background';
import { ACCENT } from '@/lib/accent';

// Shared skeleton for every /experience/<slug> page: hero (eyebrow, title,
// intro, logo on the right) plus a grid of four equal work cards. Extracted
// from the Ghost FC page so the three role pages share one layout and only
// carry their own copy. Do not turn one card into a feature card; the four
// are deliberately equal.

const INTER = 'Inter, ui-rounded, system-ui, sans-serif';
const MONO = 'monospace';

const EYEBROW: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 14,
  letterSpacing: '0.4em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.4)',
  margin: 0,
  display: 'block',
};

const CARD_INDEX: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.3em',
  color: ACCENT,
  margin: 0,
};

const TAG: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.08em',
  color: 'rgba(255,255,255,0.55)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 999,
  padding: '4px 10px',
  whiteSpace: 'nowrap',
};

export type ExperienceItem = {
  title: string;
  body: string;
  tags: string[];
};

export type ExperiencePageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  logo: { src: string; alt: string; maxWidth?: number; style?: React.CSSProperties };
  // Optional monochrome hero photo. When set, it fills the right side of the
  // hero and dissolves into the dot grid (same mask recipe as the AA hero),
  // and the logo becomes a small mark above the eyebrow instead of the
  // right-column crest.
  heroImage?: { src: string; alt: string; objectPosition?: string };
  sectionHeading: string;
  items: ExperienceItem[];
};

function HeroSection({ eyebrow, title, intro, logo, heroImage }: Omit<ExperiencePageProps, 'sectionHeading' | 'items'>) {
  const [isLoaded, setIsLoaded] = useState(false);
  const logoRef = useRef<HTMLImageElement>(null);
  useEffect(() => { setIsLoaded(true); }, []);

  // A missing logo 404s before hydration, so onError never fires for it.
  // Check the already-settled state once on mount and hide the box.
  useEffect(() => {
    const img = logoRef.current;
    if (img && img.complete && img.naturalWidth === 0) img.style.visibility = 'hidden';
  }, []);

  return (
    <section className="relative w-full" style={{ zIndex: 1 }}>
      <style>{`
        @media (max-width: 767px) {
          .exp-hero-photo { width: 100% !important; height: 46% !important; }
        }
      `}</style>
      <div
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          paddingTop: 120,
          paddingBottom: 80,
          zIndex: 10,
        }}
      >
        <div
          style={{
            flex: heroImage ? '0 0 52%' : '1 1 520px',
            maxWidth: heroImage ? 720 : undefined,
            minWidth: 0,
            padding: '0 56px 0 96px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          {heroImage && (
            <motion.img
              ref={logoRef}
              src={logo.src}
              alt={logo.alt}
              draggable={false}
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 0.85, y: 0 } : {}}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              onError={e => { e.currentTarget.style.visibility = 'hidden'; }}
              style={{
                display: 'block',
                height: 28,
                width: 'auto',
                maxWidth: 200,
                objectFit: 'contain',
                margin: '0 0 28px',
                ...logo.style,
              }}
            />
          )}

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{ ...EYEBROW, margin: '0 0 24px' }}
          >
            {eyebrow}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            style={{
              fontFamily: INTER,
              fontSize: 'clamp(36px, 3.8vw, 58px)',
              fontWeight: 800,
              lineHeight: 0.95,
              color: '#ffffff',
              margin: '0 0 28px',
              letterSpacing: '-0.04em',
              maxWidth: 620,
            }}
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
            style={{
              fontFamily: INTER,
              fontSize: 'clamp(17px, 1.7vw, 21px)',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.7)',
              margin: 0,
              lineHeight: 1.7,
              maxWidth: 620,
              letterSpacing: '0.01em',
            }}
          >
            {intro}
          </motion.p>
        </div>

        {heroImage ? (
          // Photo bleed, no entrance fade and no load gate: it is preloaded
          // from the home Experience row so it paints on the first frame.
          // Two gradient masks composited with intersect dissolve the photo
          // into the dot grid on the bottom and left edges (AA hero recipe).
          <div
            className="exp-hero-photo"
            aria-hidden={false}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '58%',
              height: '100%',
              overflow: 'hidden',
              zIndex: 1,
              maskImage:
                'linear-gradient(to bottom, black 0%, black 76%, transparent 100%), ' +
                'linear-gradient(to right, transparent 0%, black 18%, black 100%)',
              maskComposite: 'intersect',
              WebkitMaskImage:
                'linear-gradient(to bottom, black 0%, black 76%, transparent 100%), ' +
                'linear-gradient(to right, transparent 0%, black 18%, black 100%)',
              WebkitMaskComposite: 'source-in',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '22%', background: 'linear-gradient(to right, #000000 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.55) 50%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />
            <img
              src={heroImage.src}
              alt={heroImage.alt}
              fetchPriority="high"
              decoding="sync"
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: heroImage.objectPosition ?? 'center',
                display: 'block',
                filter: 'brightness(0.82) contrast(1.05) saturate(0)',
              }}
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
            style={{
              flex: '1 1 360px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 96px 40px 56px',
              minHeight: 360,
            }}
          >
            <img
              ref={logoRef}
              src={logo.src}
              alt={logo.alt}
              onError={e => { e.currentTarget.style.visibility = 'hidden'; }}
              style={{
                width: '100%',
                maxWidth: logo.maxWidth ?? 380,
                height: 'auto',
                display: 'block',
                objectFit: 'contain',
                ...logo.style,
              }}
              draggable={false}
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}

function WorkSection({ sectionHeading, items }: Pick<ExperiencePageProps, 'sectionHeading' | 'items'>) {
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '40px 0 160px' }}>
      <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto', padding: '0 64px' }}>
        <p style={{ ...EYEBROW, marginBottom: 24 }}>The Work</p>
        <h2
          style={{
            fontFamily: INTER,
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            margin: '0 0 56px',
            maxWidth: 760,
          }}
        >
          {sectionHeading}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
          }}
        >
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: 'easeOut' }}
              style={{
                padding: 32,
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.1)',
                background: '#0d0d0d',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                minHeight: 200,
              }}
            >
              <p style={CARD_INDEX}>{String(i + 1).padStart(2, '0')}</p>
              <h3
                style={{
                  fontFamily: INTER,
                  fontSize: 22,
                  fontWeight: 600,
                  color: '#ffffff',
                  letterSpacing: '-0.015em',
                  margin: 0,
                  lineHeight: 1.25,
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontFamily: INTER,
                  fontSize: 16,
                  fontWeight: 300,
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {item.body}
              </p>
              <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {item.tags.map((tag) => (
                  <span key={tag} style={TAG}>{tag}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ExperiencePage(props: ExperiencePageProps) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <DotGridBackground />
      <HeroSection eyebrow={props.eyebrow} title={props.title} intro={props.intro} logo={props.logo} heroImage={props.heroImage} />
      <WorkSection sectionHeading={props.sectionHeading} items={props.items} />
    </div>
  );
}
