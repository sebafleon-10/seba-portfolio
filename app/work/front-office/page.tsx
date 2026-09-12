'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DotGridBackground } from '@/components/ui/dot-grid-background';
import { ACCENT, ACCENT_BRIGHT, accentAlpha } from '@/lib/accent';

const INTER = 'Inter, ui-rounded, system-ui, sans-serif';
const MONO = 'monospace';

const LIVE_URL = 'https://sebafleon-front-office.vercel.app';

const EYEBROW: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 14,
  letterSpacing: '0.4em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.4)',
  margin: 0,
  display: 'block',
};

const HERO_TITLE = 'Run the club for a season';
const HERO_INTRO = "An interactive business simulation for a lower-league soccer club. Set six decisions, weight what success means between the table and the books, and watch the league finish, club health, and full-season P&L recompute live off a deterministic causal engine — then have a Claude Opus 4.8 coach write the season debrief.";
const SECTION_HEADING = 'What it does';

const ITEMS = [
  {
    title: 'Six season levers',
    body: 'Player wages, academy, marketing, facilities, commercial, and ticket price — every decision feeds the model the moment you move it.',
  },
  {
    title: 'Deterministic causal engine',
    body: 'A single pure runSeason() function turns inputs into squad quality, the league table, attendance, and a full season profit and loss.',
  },
  {
    title: 'Sport vs finance weighting',
    body: 'Dial how much league position versus the books defines success; the blended club-health gauge responds instantly.',
  },
  {
    title: 'Live league table & P&L',
    body: 'A twelve-club table and a full revenue and cost breakdown update on every change, with your club tinted in the standings.',
  },
  {
    title: 'AI season debrief',
    body: 'A Claude Opus 4.8 coach reads the season you built and writes a tailored debrief memo on demand.',
  },
  {
    title: 'Built to ship',
    body: 'Next.js and TypeScript on Turbopack, covered by Vitest gold scenarios, deployed live on Vercel.',
  },
];

function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [ctaHovered, setCtaHovered] = useState(false);
  useEffect(() => { setIsLoaded(true); }, []);

  return (
    <section className="relative w-full" style={{ zIndex: 1 }}>

      {/* Ambient accent glow behind the mockup. Soft, low-opacity, matches the
          site accent without becoming a fill. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="absolute rounded-full blur-3xl"
          style={{ top: 40, right: 40, width: 640, height: 640, background: `radial-gradient(circle, ${accentAlpha(0.08)} 0%, transparent 70%)` }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 2, delay: 0.4, ease: 'easeOut' }}
          className="absolute rounded-full blur-3xl"
          style={{ bottom: 80, left: -60, width: 460, height: 460, background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative flex" style={{ minHeight: '100vh', paddingTop: 60, paddingBottom: 60, zIndex: 10 }}>

        {/* LEFT — copy column, vertically centered */}
        <div
          className="flex flex-col justify-center relative"
          style={{ flex: '0 0 52%', padding: '0 56px 0 96px', zIndex: 2 }}
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{ ...EYEBROW, margin: '0 0 24px' }}
          >
            2026 · Front Office
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
              maxWidth: 560,
            }}
          >
            {HERO_TITLE}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
            style={{
              fontFamily: INTER,
              fontSize: 'clamp(16px, 1.55vw, 20px)',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.62)',
              margin: '0 0 36px',
              lineHeight: 1.7,
              maxWidth: 520,
              letterSpacing: '0.01em',
            }}
          >
            {HERO_INTRO}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
          >
            <a
              href={LIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setCtaHovered(true)}
              onMouseLeave={() => setCtaHovered(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                fontFamily: INTER,
                fontSize: 17,
                fontWeight: 600,
                letterSpacing: '0.02em',
                color: ACCENT_BRIGHT,
                textDecoration: 'none',
                background: ctaHovered ? accentAlpha(0.14) : accentAlpha(0.05),
                border: `1px solid ${ctaHovered ? ACCENT : accentAlpha(0.33)}`,
                borderRadius: 999,
                padding: '16px 30px',
                boxShadow: ctaHovered ? `0 8px 30px ${accentAlpha(0.15)}` : 'none',
                transform: ctaHovered ? 'translateY(-1px)' : 'translateY(0)',
                transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
              }}
            >
              Visit the live app
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </motion.div>
        </div>

        {/* RIGHT — product mockup bleeding in, dissolved into the dot-grid on its
            top / left / bottom edges (mask-composite intersect), no hard box. */}
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '58%',
            height: '100%',
            overflow: 'hidden',
            zIndex: 1,
            perspective: '1600px',
            maskImage:
              'linear-gradient(to bottom, transparent 0%, black 13%, black 86%, transparent 100%), ' +
              'linear-gradient(to right, transparent 0%, black 14%, black 100%)',
            maskComposite: 'intersect',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, black 13%, black 86%, transparent 100%), ' +
              'linear-gradient(to right, transparent 0%, black 14%, black 100%)',
            WebkitMaskComposite: 'source-in',
          }}
        >
          {/* Left + bottom scrims soften the seam against the copy column. */}
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '20%', background: 'linear-gradient(to right, #000000 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />
          {/* Flat 2x capture of the live dashboard, tilted in CSS so the text stays
              crisp and the angle is tunable. Runs off the right and bottom edges. */}
          <div
            style={{
              position: 'absolute',
              top: '9%',
              left: 0,
              width: '112%',
              transform: 'rotateY(16deg) rotateX(4deg) rotateZ(-1deg) translateX(2%) scale(1.04)',
              transformOrigin: 'right center',
              transformStyle: 'preserve-3d',
              borderRadius: 18,
              overflow: 'hidden',
              boxShadow: '0 60px 120px -30px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.06)',
              willChange: 'transform',
              zIndex: 1,
            }}
          >
            <img
              src="/front-office-dashboard.jpg"
              alt="Front Office command center. Season decisions, league table, and full-season finances."
              draggable={false}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                filter: 'brightness(0.96)',
              }}
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
}

function WorkSection() {
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '20px 0 160px' }}>
      <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto', padding: '0 64px' }}>
        <p style={{ ...EYEBROW, fontSize: 10, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.28)', marginBottom: 24 }}>The Work</p>
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
          {SECTION_HEADING}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
            perspective: '1200px',
          }}
        >
          {ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.07, ease: 'easeOut' }}
              whileHover={{
                rotateX: 6,
                rotateY: -6,
                scale: 1.03,
                transition: { type: 'spring', stiffness: 300, damping: 20 },
              }}
              style={{
                padding: 32,
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.10)',
                background:
                  `radial-gradient(ellipse at top left, ${accentAlpha(0.07)} 0%, transparent 58%), #0c0c11`,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                minHeight: 210,
                transformStyle: 'preserve-3d',
                boxShadow: '0 10px 40px rgba(0,0,0,0.35)',
                cursor: 'default',
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: '0.3em',
                  color: ACCENT,
                  margin: 0,
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3
                style={{
                  fontFamily: INTER,
                  fontSize: 21,
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
                  fontSize: 15.5,
                  fontWeight: 300,
                  color: 'rgba(255,255,255,0.66)',
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {item.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function FrontOfficePage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <DotGridBackground />
      <HeroSection />
      <WorkSection />
    </div>
  );
}
