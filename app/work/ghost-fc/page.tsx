'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DotGridBackground } from '@/components/ui/dot-grid-background';
import { ACCENT } from '@/lib/accent';

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

const HERO_TITLE = 'The data behind the club';
const HERO_INTRO = "Data analyst for Chicago Ghost FC, the semi-pro side I also play for. I built the club's front-office analytics from the ground up: sponsorship prospecting, social media pipelines, match-day KPI dashboards, and conference benchmarking that turned raw data into decisions the club could act on.";
const SECTION_HEADING = 'What I built';

const ITEMS = [
  {
    title: 'Sponsorship-intelligence command center',
    body: 'A tool the front office runs to discover local businesses, enrich each one through an agentic web-search loop, score it against a 100-point sponsorship-fit rubric across six dimensions, and auto-draft personalized outreach emails. It surfaced 329 qualified prospects across multiple business categories.',
    tags: ['Python', 'DuckDB', 'Anthropic API', 'Google Places API'],
  },
  {
    title: 'Ranking evaluation and match-day KPIs',
    body: 'An evaluation harness with a hand-labeled gold set, rank correlation, and top-15 precision to validate and tune ranking quality, plus match-day KPI dashboards guiding marketing, sponsorship, and revenue decisions.',
    tags: ['Python', 'Excel'],
  },
  {
    title: 'Social analytics pipelines',
    body: "Python pipelines collecting post-level engagement across the club's TikTok and Instagram accounts, more than 700 posts, replacing manual tracking with repeatable reporting.",
    tags: ['TikTokApi', 'Playwright', 'Instagram Graph API'],
  },
  {
    title: 'Conference benchmarking',
    body: 'Content performance benchmarked against MWPL conference rivals to identify which content types and posting patterns drive reach and follower growth, translated into recommendations for non-technical stakeholders.',
    tags: ['Python', 'MWPL'],
  },
];

function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);
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
            flex: '1 1 520px',
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
            Jan 2026 to Aug 2026 · Chicago Ghost FC
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
              margin: 0,
              lineHeight: 1.7,
              maxWidth: 620,
              letterSpacing: '0.01em',
            }}
          >
            {HERO_INTRO}
          </motion.p>
        </div>

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
            src="/ghost-fc-logo.png"
            alt="Chicago Ghost FC crest"
            style={{
              width: '100%',
              maxWidth: 380,
              height: 'auto',
              display: 'block',
              objectFit: 'contain',
            }}
            draggable={false}
          />
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

export default function GhostFCPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <DotGridBackground />
      <HeroSection />
      <WorkSection />
    </div>
  );
}
