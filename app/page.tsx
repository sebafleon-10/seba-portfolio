'use client';

import { useState, useEffect, useRef } from 'react';
import { WhoSection }     from '@/components/ui/who-section';
import { WorkSection }    from '@/components/ui/work-section';
import { ContactSection } from '@/components/ui/contact-section';
// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const taglineRef = useRef<HTMLDivElement>(null);
  const [tagline, setTagline] = useState(false);

  // Tagline appears after particle scatter completes:
  // chaos(1500) + assembly(1800) + hold(2000) + scatter(1200) = 6500ms
  useEffect(() => {
    const t = setTimeout(() => setTagline(true), 6500);
    return () => clearTimeout(t);
  }, []);

  // Fade tagline out as user scrolls away from hero
  useEffect(() => {
    const onScroll = () => {
      if (taglineRef.current)
        taglineRef.current.style.opacity = String(Math.max(0, 1 - window.scrollY / 300));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          background: 'transparent',
          zIndex: 1,
        }}
      >
        {/* Nav */}
        <header
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '26px 48px', pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 700, fontSize: 13, letterSpacing: '0.07em', color: '#ffffff',
            }}
          >
            SL
          </span>
          <nav style={{ display: 'flex', gap: 32, pointerEvents: 'auto' }}>
            {['Work', 'Who', 'Contact'].map(label => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                style={{
                  fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.10em',
                  color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.2s',
                }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = '#ffffff')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.35)')}
              >
                {label}
              </a>
            ))}
          </nav>
        </header>

        {/* Tagline */}
        <div
          ref={taglineRef}
          style={{
            position: 'absolute',
            top: '50%', left: 0, right: 0,
            textAlign: 'center',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <p
            style={{
              fontFamily: 'monospace', fontSize: 25, letterSpacing: '0.35em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.88)',
              margin: 0,
              opacity: tagline ? 1 : 0,
              transition: 'opacity 0.8s ease',
              textShadow: '0 0 40px rgba(255,255,255,0.15)',
            }}
          >
            Athlete. Analyst. Builder.
          </p>
        </div>

        {/* Scroll indicator */}
        <style>{`
          @keyframes scrollPulse {
            0%, 100% { opacity: 0.2; }
            50%      { opacity: 0.6; }
          }
        `}</style>
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <p
            style={{
              fontFamily: 'monospace',
              fontSize: 9,
              letterSpacing: '0.4em',
              color: 'rgba(255,255,255,0.3)',
              margin: 0,
            }}
          >
            SCROLL
          </p>
          <div
            style={{
              width: 1,
              height: 48,
              background: 'rgba(255,255,255,1)',
              animation: 'scrollPulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </section>

      {/* ── Who ────────────────────────────────────────────────────────────── */}
      <WhoSection />

      {/* ── Work ───────────────────────────────────────────────────────────── */}
      <WorkSection />

      {/* ── Contact ────────────────────────────────────────────────────────── */}
      <ContactSection />

    </div>
  );
}
