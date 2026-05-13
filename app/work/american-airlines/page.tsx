'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BentoGridShowcase } from '@/components/ui/bento-product-features';
import CoreValueStats, { type CoreStat } from '@/components/ui/core-value-stats';
import { Spotlight } from '@/components/ui/spotlight';
import { NeuralTextReveal } from '@/components/ui/neural-text-reveal';

const MONO: React.CSSProperties = { fontFamily: 'monospace' };
const INTER: React.CSSProperties = { fontFamily: 'Inter, ui-rounded, system-ui, sans-serif' };

const secLabel: React.CSSProperties = {
  ...MONO, fontSize: 10, letterSpacing: '0.4em',
  textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)',
  display: 'block', marginBottom: 32,
};

const pill: React.CSSProperties = {
  ...MONO, fontSize: 10, letterSpacing: '0.2em',
  textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.14)',
  padding: '6px 16px', borderRadius: 999, color: 'rgba(255,255,255,0.38)',
};

const bentoBase: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 16, padding: 28, height: '100%',
  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
};

const bentoLbl: React.CSSProperties = {
  ...MONO, fontSize: 10, letterSpacing: '0.35em',
  textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
  display: 'block', marginBottom: 10,
};

const CENTER: React.CSSProperties = {
  maxWidth: 960, width: '100%', margin: '0 auto', padding: '0 64px',
};

function AnimatedCounter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const elRef = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return;
      started.current = true;
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min((now - t0) / 2000, 1);
        const e = 1 - Math.pow(1 - p, 3);
        setCount(Math.round(e * to));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [to]);
  return <span ref={elRef}>{count}{suffix}</span>;
}

const timelineNodes = [
  { date: 'Sep 2025', title: 'DATA COLLECTION',  sub: 'Built three Reddit datasets via Arctic Shift' },
  { date: 'Nov 2025', title: 'PIPELINE BUILD',   sub: 'RoBERTa sentiment scoring and LDA topic modeling' },
  { date: 'Feb 2026', title: 'MIDTERM REVIEW',   sub: 'Interim findings presented to AA marketing team' },
  { date: 'Apr 2026', title: 'FINAL DELIVERY',   sub: "Executive presentation to Ron DeFeo's global team", accent: true },
];

const sentimentBars = [
  { name: 'Delta',            pct: '78%', label: '78%', color: 'rgba(255,255,255,0.7)' },
  { name: 'United',           pct: '61%', label: '61%', color: 'rgba(255,255,255,0.45)' },
  { name: 'American Airlines',pct: '34%', label: '34%', color: '#CC0000' },
];

const datasetStats: CoreStat[] = [
  { value: '627K', label: 'Loyalty Subreddits',
    description: 'Posts from r/AmericanAirlines, r/delta, r/SouthwestAirlines scraped via Arctic Shift.',
    image: '/aa-capstone.jpg' },
  { value: '3+',   label: 'Gen Z Communities',
    description: 'Travel subreddits filtered for Gen Z patterns: r/travel, r/solotravel, r/digitalnomad.' },
  { value: '4yr',  label: 'Competitor Analysis',
    description: 'Direct airline comparison benchmarking AA against Delta, United, and Southwest over four years.' },
];

function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => { setIsLoaded(true); }, []);

  return (
    <section className="relative w-full bg-black" style={{ minHeight: '100vh', zIndex: 1 }}>

      {/* Animated background blobs */}
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

      <NeuralTextReveal />

      <div className="relative flex" style={{ minHeight: '100vh', zIndex: 10 }}>

        {/* ── LEFT ── */}
        <div className="flex flex-col justify-end relative" style={{ flex: '0 0 52%', padding: '0 56px 72px 64px' }}>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            style={{
              fontFamily: '"Inter", ui-rounded, system-ui, sans-serif',
              fontSize: 'clamp(64px, 7.5vw, 110px)',
              fontWeight: 800,
              lineHeight: 0.88,
              color: '#ffffff',
              margin: '0 0 24px',
              letterSpacing: '-0.04em',
            }}
          >
            Perception<br />Over<br />Product
          </motion.h1>

          {/* Descriptor */}
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

        {/* ── RIGHT: PHOTO ── */}
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
          className="relative overflow-hidden"
          style={{ flex: '0 0 48%' }}
        >
          {/* Left fade */}
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '18%', background: 'linear-gradient(to right, #000000 0%, rgba(0,0,0,0.4) 50%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />
          {/* Top fade */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '28%', background: 'linear-gradient(to bottom, #000000 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />
          {/* Bottom fade */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '18%', background: 'linear-gradient(to top, #000000 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />
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

  const integrationCard = (
    <div style={{ position: 'relative', height: '100%', minHeight: 320, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
      <img src="/aa-capstone.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 40%, rgba(0,0,0,0.2) 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 28 }}>
        <span style={bentoLbl}>THE PIPELINE</span>
        <p style={{ ...INTER, fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, margin: 0 }}>
          Twitter RoBERTa scored all 627K posts. LDA topic modeling clustered recurring themes across delays, baggage, loyalty, and pricing.
        </p>
      </div>
    </div>
  );

  const trackersCard = (
    <div style={{ ...bentoBase, background: 'rgba(204,0,0,0.05)', border: '1px solid rgba(204,0,0,0.14)' }}>
      <span style={bentoLbl}>SENTIMENT MODEL</span>
      <p style={{ ...INTER, fontSize: 30, fontWeight: 700, color: '#ffffff', margin: '0 0 4px', lineHeight: 1 }}>RoBERTa</p>
      <p style={{ ...INTER, fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>Twitter-trained transformer</p>
    </div>
  );

  const statisticCard = (
    <div style={{
      height: '100%', borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.07)',
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 6,
    }}>
      <p style={{ ...INTER, fontSize: 58, fontWeight: 700, color: '#ffffff', margin: 0, lineHeight: 1 }}>627K</p>
      <p style={{ ...MONO, fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', margin: 0 }}>posts analyzed</p>
    </div>
  );

  const focusCard = (
    <div style={bentoBase}>
      <span style={{ ...bentoLbl, color: 'rgba(204,0,0,0.65)' }}>KEY FINDING</span>
      <p style={{ ...INTER, fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, margin: 0 }}>
        AA has a perception problem, not a product problem.
      </p>
    </div>
  );

  const productivityCard = (
    <div style={bentoBase}>
      <span style={bentoLbl}>PRESENTED TO</span>
      <p style={{ ...INTER, fontSize: 22, fontWeight: 600, color: '#ffffff', margin: '0 0 4px', lineHeight: 1.1 }}>Ron DeFeo</p>
      <p style={{ ...INTER, fontSize: 12, color: 'rgba(255,255,255,0.32)', margin: 0 }}>Global Marketing · April 2026</p>
    </div>
  );

  const shortcutsCard = (
    <div style={bentoBase}>
      <span style={bentoLbl}>BUILT WITH</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {['Python', 'Arctic Shift', 'HuggingFace', 'RoBERTa', 'pandas', 'LDA', 'Google Colab', 'Jupyter'].map(t => (
          <span key={t} style={pill}>{t}</span>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <HeroSection />

      {/* IMAGE */}
      <div style={{ position: 'relative', width: '100%', height: '70vh', overflow: 'hidden', zIndex: 1 }}>
        <img
          src="/aa-capstone.jpg"
          alt="American Airlines capstone presentation"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', display: 'block', filter: 'brightness(0.75)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #000000 0%, transparent 22%, transparent 72%, #000000 100%)', pointerEvents: 'none' }} />
      </div>

      {/* STAT COUNTERS */}
      <section style={{ position: 'relative', zIndex: 1, padding: '120px 0' }}>
        <div style={{ ...CENTER }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {[
              { to: 627, suffix: 'K+', label: 'REDDIT POSTS ANALYZED' },
              { to: 3,   suffix: '',   label: 'COMPETITOR BRANDS' },
              { to: 4,   suffix: '',   label: 'TEAM MEMBERS' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right' }}>
                <p style={{ ...INTER, fontSize: 'clamp(52px, 6vw, 84px)', fontWeight: 700, color: '#fff', lineHeight: 1, margin: '0 0 12px' }}>
                  <AnimatedCounter to={stat.to} suffix={stat.suffix} />
                </p>
                <p style={{ ...MONO, fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', margin: 0 }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 80, height: 1, background: 'rgba(255,255,255,0.05)' }} />
        </div>
      </section>

      {/* DATASET CARDS */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 0 120px' }}>
        <div style={{ ...CENTER }}>
          <span style={secLabel}>THE DATA</span>
          <CoreValueStats stats={datasetStats} />
        </div>
      </section>

      {/* BENTO GRID */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 0 120px' }}>
        <div style={{ ...CENTER }}>
          <span style={secLabel}>THE BREAKDOWN</span>
          <BentoGridShowcase
            integration={integrationCard}
            trackers={trackersCard}
            statistic={statisticCard}
            focus={focusCard}
            productivity={productivityCard}
            shortcuts={shortcutsCard}
          />
        </div>
      </section>

      {/* SENTIMENT BARS */}
      <section style={{ position: 'relative', zIndex: 1, padding: '120px 0' }}>
        <div style={{ ...CENTER }}>
          <span style={secLabel}>SENTIMENT COMPARISON</span>
          <p style={{ ...INTER, fontSize: 14, color: 'rgba(255,255,255,0.28)', margin: '0 0 64px', letterSpacing: '0.01em' }}>
            Positive sentiment ratio among Gen Z travelers · 627K Reddit posts · Twitter RoBERTa
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 52 }}>
            {sentimentBars.map(bar => (
              <div key={bar.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ ...MONO, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)' }}>{bar.name}</span>
                  <span style={{ ...MONO, fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>{bar.label}</span>
                </div>
                <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 999, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: '0%' }}
                    whileInView={{ width: bar.pct }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                    style={{ height: '100%', borderRadius: 999, background: bar.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section style={{ position: 'relative', zIndex: 1, padding: '120px 0' }}>
        <div style={{ ...CENTER }}>
          <span style={secLabel}>THE PROCESS</span>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.18 } } }}
            style={{ position: 'relative' }}
          >
            <div style={{ position: 'absolute', left: '50%', width: 1, top: 0, bottom: 0, background: 'rgba(255,255,255,0.06)', transform: 'translateX(-50%)' }} />
            {timelineNodes.map((node) => (
              <motion.div
                key={node.date}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 48px 1fr', alignItems: 'center', marginBottom: 56 }}
              >
                <p style={{ ...MONO, fontSize: 11, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.22)', textAlign: 'right', paddingRight: 28, margin: 0 }}>
                  {node.date}
                </p>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', margin: '0 auto',
                  background: node.accent ? '#CC0000' : 'rgba(255,255,255,0.3)',
                  boxShadow: node.accent ? '0 0 14px rgba(204,0,0,0.55)' : 'none',
                }} />
                <div style={{ paddingLeft: 28 }}>
                  <p style={{ ...INTER, fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', color: node.accent ? '#fff' : 'rgba(255,255,255,0.7)', margin: 0 }}>{node.title}</p>
                  <p style={{ ...INTER, fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: '5px 0 0', lineHeight: 1.5 }}>{node.sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* KEY FINDING */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 'clamp(180px, 28vw, 340px)',
          fontWeight: 700, color: 'rgba(255,255,255,0.022)',
          fontFamily: 'Inter, system-ui, sans-serif',
          lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
          letterSpacing: '-0.05em', whiteSpace: 'nowrap',
        }}>34%</div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 660, margin: '0 auto', padding: '0 64px', textAlign: 'center', position: 'relative', zIndex: 2 }}
        >
          <p style={{ ...MONO, fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(204,0,0,0.55)', margin: '0 0 32px' }}>
            KEY FINDING
          </p>
          <p style={{ ...INTER, fontSize: 'clamp(28px, 4vw, 50px)', fontWeight: 700, color: '#ffffff', lineHeight: 1.15, margin: '0 0 24px', letterSpacing: '-0.02em' }}>
            AA does not have a product problem. It has a perception problem.
          </p>
          <div style={{ width: 36, height: 2, background: '#CC0000', margin: '0 auto 28px' }} />
          <p style={{ ...INTER, fontSize: 15, color: 'rgba(255,255,255,0.35)', lineHeight: 1.9, fontWeight: 300, margin: 0 }}>
            Across every measured dimension, American Airlines ranked last in positive sentiment among Gen Z travelers despite comparable operational performance to Delta and United.
          </p>
        </motion.div>
      </section>

    </div>
  );
}
