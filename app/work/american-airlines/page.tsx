'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { NeuralTextReveal } from '@/components/ui/neural-text-reveal';
import CoreValueStats from '@/components/ui/core-value-stats';

function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => { setIsLoaded(true); }, []);

  return (
    <section className="relative w-full bg-black" style={{ height: 'auto', zIndex: 1 }}>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: -120 }}
          animate={isLoaded ? { opacity: 1, scale: 1, x: 0 } : {}}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="absolute rounded-full blur-3xl"
          style={{ top: 60, left: -60, width: 480, height: 480, background: 'radial-gradient(circle, rgba(204,0,0,0.07) 0%, transparent 70%)' }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 120 }}
          animate={isLoaded ? { opacity: 1, scale: 1, x: 0 } : {}}
          transition={{ duration: 2, delay: 0.4, ease: 'easeOut' }}
          className="absolute rounded-full blur-3xl"
          style={{ bottom: 80, right: -80, width: 560, height: 560, background: 'radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 70%)' }}
        />
      </div>

      <div style={{ position: 'absolute', top: '68px', left: '96px', zIndex: 10 }}>
        <NeuralTextReveal />
      </div>

      <div className="relative flex" style={{ minHeight: '100vh', paddingTop: '60px', paddingBottom: '60px', zIndex: 10 }}>

        <div className="flex flex-col justify-end relative" style={{ flex: '0 0 52%', padding: '0 56px 72px 96px', zIndex: 2 }}>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            style={{
              fontFamily: '"Inter", ui-rounded, system-ui, sans-serif',
              fontSize: 'clamp(48px, 5vw, 76px)',
              fontWeight: 800,
              lineHeight: 0.88,
              color: '#ffffff',
              margin: '0 0 24px',
              letterSpacing: '-0.04em',
            }}
          >
            Perception<br />Over<br />Product
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
            style={{
              fontFamily: '"Inter", ui-rounded, system-ui, sans-serif',
              fontSize: 'clamp(18px, 2vw, 26px)',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.55)',
              margin: '0 0 32px',
              lineHeight: 1.65,
              maxWidth: 480,
              letterSpacing: '0.01em',
            }}
          >
            We scraped 627,000 Reddit posts to find out why Gen Z is not
            loyal to American Airlines. The answer surprised everyone in the room.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
          style={{ position: 'absolute', top: 0, right: 0, width: '58%', height: '100%', overflow: 'hidden', zIndex: 1 }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '22%', background: 'linear-gradient(to right, #000000 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(to top, #000000 0%, rgba(0,0,0,0.7) 35%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />
          <img
            src="/aa-capstone.jpg"
            alt="Sebastian Leon presenting to American Airlines"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: '12% top',
              display: 'block',
              filter: 'brightness(0.82) contrast(1.05) saturate(0.88)',
            }}
          />
        </motion.div>

      </div>
    </section>
  );
}

export default function AmericanAirlinesPage() {
  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>

      <HeroSection />

      <section style={{ position: 'relative', zIndex: 1, padding: '0 0 80px' }}>
        <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto', padding: '0 64px' }}>

          <p style={{
            fontFamily: 'monospace', fontSize: 10,
            letterSpacing: '0.4em', textTransform: 'uppercase' as const,
            color: 'rgba(255,255,255,0.22)',
            marginBottom: 80, display: 'block',
          }}>The Project</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
            {[
              {
                number: '01',
                label: 'The Problem',
                body: 'American Airlines wanted to understand why Gen Z was not engaging with AAdvantage. Survey data was not giving them the full picture. They needed to know what was actually being said online, by real people, in real conversations.',
              },
              {
                number: '02',
                label: 'The Approach',
                body: 'We scraped 627,000 Reddit posts across four airline communities, scored every post with Twitter RoBERTa, and ran LDA topic modeling to surface recurring themes across four years of organic conversation data.',
              },
              {
                number: '03',
                label: 'The Finding',
                body: 'AA does not have a product problem. It has a perception problem. Delta and United dominate positive loyalty conversation among Gen Z despite comparable operational performance to American Airlines.',
              },
            ].map((col, i) => (
              <motion.div
                key={i}
                initial={i === 0 ? { opacity: 0, x: -40 } : i === 1 ? { opacity: 0, y: 40 } : { opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: 'easeOut' }}
                whileHover={{
                  rotateX: 6,
                  rotateY: 8,
                  scale: 1.04,
                  transition: { type: 'spring', stiffness: 300, damping: 20 },
                }}
                style={{
                  padding: '48px',
                  background: 'rgba(255,255,255,0.82)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.6)',
                  borderRadius: 24,
                  minHeight: 320,
                  boxShadow: '0 8px 48px rgba(0,0,0,0.5)',
                  transformStyle: 'preserve-3d',
                  cursor: 'default',
                }}
              >
                <p style={{
                  fontFamily: 'monospace', fontSize: 11,
                  letterSpacing: '0.3em', textTransform: 'uppercase' as const,
                  color: 'rgba(0,0,0,0.3)', margin: '0 0 20px',
                }}>{col.number}</p>
                <h3 style={{
                  fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
                  fontSize: 32, fontWeight: 700,
                  color: '#000000', letterSpacing: '-0.02em',
                  lineHeight: 1.1, margin: '0 0 20px',
                }}>{col.label}</h3>
                <p style={{
                  fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
                  fontSize: 17, fontWeight: 300,
                  color: 'rgba(0,0,0,0.62)',
                  lineHeight: 1.85, margin: 0,
                }}>{col.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 1, padding: '140px 0 120px' }}>
        <div style={{ maxWidth: 1400, width: '100%', margin: '0 auto', padding: '0 64px' }}>
          <p style={{
            fontFamily: 'monospace', fontSize: 10,
            letterSpacing: '0.4em', textTransform: 'uppercase' as const,
            color: 'rgba(255,255,255,0.22)', display: 'block', marginBottom: 12,
          }}>Deliverables</p>
          <h2 style={{
            fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
            fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700,
            color: '#ffffff', margin: '0 0 48px', letterSpacing: '-0.03em',
            lineHeight: 1.1, textAlign: 'left' as const,
          }}>Everything we built.</h2>
          <CoreValueStats title="" subtitle="" description="" stats={[
            {
              value: 'FINAL REPORT',
              label: 'pdf',
              description: 'Full written analysis covering methodology, findings, and strategic recommendations delivered to AA.',
              href: '/aa-report.pdf',
              type: 'Open PDF',
            },
            {
              value: 'PRESENTATION',
              label: 'pdf',
              description: 'Executive slide deck presented to Ron DeFeo and the American Airlines global marketing team.',
              href: '/aa-presentation.pdf',
              type: 'Open PDF',
            },
            {
              value: 'LOYALTY DATA',
              label: 'code',
              description: 'Dataset 1: AAdvantage, Delta SkyMiles, United MileagePlus subreddit scrape and sentiment analysis.',
              href: 'https://colab.research.google.com/drive/15AetEqJ_NRDR2sRR9u1HzBbLj45m37Nb?authuser=1',
              type: 'Open Notebook',
            },
            {
              value: 'GEN Z DATA',
              label: 'code',
              description: 'Dataset 2: Gen Z travel subreddit scrape filtered by account age and posting patterns.',
              href: 'https://colab.research.google.com/drive/1M5ma_7f-GddO743pxZ-c515put95iek_?authuser=1',
              type: 'Open Notebook',
            },
            {
              value: 'COMPETITOR DATA',
              label: 'code',
              description: 'Dataset 3: Direct three-airline comparison across r/americanairlines, r/delta, r/SouthwestAirlines.',
              href: 'https://colab.research.google.com/drive/1hdYg84Oyi5RshCoa4nLSdaW4xeZyY0rA?authuser=1',
              type: 'Open Notebook',
            },
            {
              value: 'MACHINE LEARNING MODEL',
              label: 'code',
              description: 'Twitter RoBERTa scoring system and scraping pipeline built on Arctic Shift and HuggingFace.',
              href: 'https://colab.research.google.com/drive/13JB5oxn4z8e_q8CCXwUyM05fI8vDyjvW?authuser=1',
              type: 'Open Notebook',
            },
          ]} />
        </div>
      </section>

    </div>
  );
}
