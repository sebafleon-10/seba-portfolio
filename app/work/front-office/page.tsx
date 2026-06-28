'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DotGridBackground } from '@/components/ui/dot-grid-background';

const INTER = 'Inter, ui-rounded, system-ui, sans-serif';
const MONO = 'monospace';

const ACCENT = '#2DD4BF';
const ACCENT_BRIGHT = '#5EEAD4';

const LIVE_URL = 'https://front-office-cyan.vercel.app';

const EYEBROW: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 14,
  letterSpacing: '0.4em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.4)',
  margin: 0,
  display: 'block',
};

const STATUS_PILL: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  border: `1px solid ${ACCENT}55`,
  background: 'rgba(45,212,191,0.08)',
  color: ACCENT_BRIGHT,
  padding: '6px 14px',
  borderRadius: 999,
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
      <div
        style={{
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
            flex: '1 1 480px',
            minWidth: 0,
            padding: '0 56px 0 96px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{ ...EYEBROW, margin: '0 0 24px' }}
          >
            Shipped · Front Office
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            style={{ margin: '0 0 28px' }}
          >
            <span style={STATUS_PILL}>
              <span
                aria-hidden
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: ACCENT_BRIGHT,
                  boxShadow: `0 0 12px ${ACCENT_BRIGHT}b3`,
                }}
              />
              Live · Deployed on Vercel
            </span>
          </motion.div>

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
            {HERO_TITLE}
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
              margin: '0 0 36px',
              lineHeight: 1.7,
              maxWidth: 620,
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
                gap: 10,
                fontFamily: INTER,
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: '0.01em',
                color: '#06231f',
                textDecoration: 'none',
                background: ctaHovered ? ACCENT_BRIGHT : ACCENT,
                border: `1px solid ${ACCENT_BRIGHT}`,
                borderRadius: 999,
                padding: '13px 26px',
                boxShadow: ctaHovered
                  ? `0 10px 36px ${ACCENT}55`
                  : `0 6px 24px ${ACCENT}33`,
                transform: ctaHovered ? 'translateY(-1px)' : 'translateY(0)',
                transition: 'background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
              }}
            >
              Visit the live app
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
          style={{
            flex: '1 1 420px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 96px 40px 56px',
            minHeight: 360,
          }}
        >
          <a
            href={LIVE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              width: '100%',
              maxWidth: 640,
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
            }}
          >
            <img
              src="/front-office.png"
              alt="Front Office command center — season decisions, league table, and full-season finances"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'cover',
              }}
              draggable={false}
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function WorkSection() {
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
          {SECTION_HEADING}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
          }}
        >
          {ITEMS.map((item, i) => (
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
                background: '#0d0d10',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                minHeight: 200,
              }}
            >
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
