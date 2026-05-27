'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { particleInteraction } from '@/lib/particle-state';
import { VerticalMarquee } from '@/components/ui/vertical-marquee';

const photoCardVariants: Variants = {
  initial: {
    rotate: -2,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  hover: {
    rotate: -2,
    scale: 1.01,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

const marqueeItems = [
  '03× NCAC CHAMPION',
  'TOURNAMENT MVP',
  'DEPAUW CAPTAIN',
  'GHOST FC CAPTAIN',
  'SEMI-PRO',
];

export function WhoSection() {
  const router = useRouter();
  const sectionRef   = useRef<HTMLElement>(null);
  const cardRef      = useRef<HTMLDivElement>(null);
  const marqueeRef   = useRef<HTMLDivElement>(null);
  const orbLabelRef  = useRef<HTMLParagraphElement>(null);
  const hasTriggered = useRef(false);
  const hasScattered = useRef(false);
  const isRunning    = useRef(false);

  useEffect(() => {
    const marqueeContainer = marqueeRef.current;
    if (!marqueeContainer) return;

    const updateOpacity = () => {
      const items = marqueeContainer.querySelectorAll('.marquee-item');
      const containerRect = marqueeContainer.getBoundingClientRect();
      const centerY = containerRect.top + containerRect.height / 2;

      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const itemCenterY = itemRect.top + itemRect.height / 2;
        const distance = Math.abs(centerY - itemCenterY);
        const maxDistance = containerRect.height / 2;
        const normalizedDistance = Math.min(distance / maxDistance, 1);
        const opacity = 1 - normalizedDistance * 0.92;
        (item as HTMLElement).style.opacity = opacity.toString();
      });
    };

    let frameId: number;
    const tick = () => {
      updateOpacity();
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const run = () => {
      if (isRunning.current) return;
      isRunning.current = true;
      hasTriggered.current = true;
      particleInteraction.gravityTarget.active = true;
      particleInteraction.gravityTarget.x      = window.innerWidth  / 2;
      particleInteraction.gravityTarget.y      = window.innerHeight / 2;
      particleInteraction.gravityBoost         = true;

      setTimeout(() => {
        particleInteraction.gravityTarget.active = false;
        particleInteraction.gravityBoost         = false;
        particleInteraction.scatterTrigger       = Date.now();
        hasScattered.current = true;
        const r = section.getBoundingClientRect();
        const entryFade = r.top > 0
          ? Math.max(0, 1 - r.top / (window.innerHeight * 0.35)) : 1;
        const exitFade = Math.max(0, 1 - Math.max(0, -r.top) / 350);
        if (orbLabelRef.current)
          orbLabelRef.current.style.opacity =
            String(Math.max(0, Math.min(entryFade, exitFade)));
        isRunning.current = false;
      }, 900);
    };

    const handleScroll = () => {
      const rect    = section.getBoundingClientRect();
      const targetY = Math.min(
        window.innerHeight * 0.78,
        rect.top * 0.90 + window.innerHeight * 0.05,
      );
      if (orbLabelRef.current)
        orbLabelRef.current.style.transform =
          `translateX(-50%) translateY(${targetY}px)`;

      if (rect.top < window.innerHeight * 0.75 &&
          rect.bottom > 0 && !hasTriggered.current) run();

      if (hasScattered.current && orbLabelRef.current) {
        const entryFade = rect.top > 0
          ? Math.max(0, 1 - rect.top / (window.innerHeight * 0.35)) : 1;
        const exitFade = Math.max(0, 1 - Math.max(0, -rect.top) / 350);
        orbLabelRef.current.style.opacity =
          String(Math.max(0, Math.min(entryFade, exitFade)));
      }

      if ((rect.top > window.innerHeight * 1.5 || rect.bottom < 0)
          && !isRunning.current) {
        hasTriggered.current = false;
        hasScattered.current = false;
        if (orbLabelRef.current) orbLabelRef.current.style.opacity = '0';
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      particleInteraction.gravityBoost         = false;
      particleInteraction.gravityTarget.active = false;
    };
  }, []);

  useEffect(() => {
    let raf: number;
    let wasInView = false;
    const loop = () => {
      const el = cardRef.current;
      if (el) {
        const r      = el.getBoundingClientRect();
        const inView = r.bottom > 0 && r.top < window.innerHeight;
        if (inView) {
          if (!particleInteraction.gravityBoost) {
            particleInteraction.gravityTarget.active = true;
            particleInteraction.gravityTarget.x = r.left + r.width  / 2;
            particleInteraction.gravityTarget.y = r.top  + r.height / 2;
          }
          wasInView = true;
        } else if (wasInView) {
          particleInteraction.gravityTarget.active = false;
          wasInView = false;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      particleInteraction.gravityTarget.active = false;
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="who"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      <p
        ref={orbLabelRef}
        style={{
          position:      'fixed',
          top:           0,
          left:          '50%',
          transform:     'translateX(-50%) translateY(-9999px)',
          zIndex:        5,
          pointerEvents: 'none',
          fontFamily:    'monospace',
          fontSize:      25,
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          color:         'rgba(255,255,255,0.88)',
          margin:        0,
          opacity:       0,
          transition:    'opacity 0.8s ease, transform 0.08s linear',
          textShadow:    '0 0 40px rgba(255,255,255,0.15)',
          whiteSpace:    'nowrap',
        }}
      >
        001 · THE ATHLETE
      </p>

      <style>{`
        .who-cta::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -6px;
          height: 1px;
          width: 0;
          background: rgba(255,255,255,0.9);
          transition: width 300ms ease;
        }
        .who-arrow {
          display: inline-block;
          transform: translateX(0);
          transition: transform 200ms ease;
        }
        .who-composition:hover .who-cta { color: rgba(255,255,255,1); }
        .who-composition:hover .who-cta::after { width: 100%; }
        .who-composition:hover .who-arrow { transform: translateX(6px); }
      `}</style>

      <motion.div
        ref={cardRef}
        className="who-composition"
        initial="initial"
        whileHover="hover"
        onClick={() => router.push('/who')}
        style={{
          position: 'relative',
          width: '100%',
          height: '72vh',
          cursor: 'pointer',
        }}
      >
        {/* Photo card — floating, contained within viewport, scaled up from contact-section pattern */}
        <motion.div
          variants={photoCardVariants}
          style={{
            position: 'absolute',
            left: 200,
            top: 'calc(50% - 360px)',
            width: 580,
            height: 720,
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)',
            overflow: 'hidden',
          }}
        >
          <img
            src="/seba-celebrate.jpg"
            alt="Sebastian Leon"
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
              display: 'block',
            }}
          />
        </motion.div>

        {/* Right zone — vertical marquee, anchored 240px from the right viewport edge */}
        <div style={{
          position: 'absolute',
          left: '32vw',
          right: 240,
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}>
            <div
              ref={marqueeRef}
              style={{
                position: 'relative',
                height: '70vh',
                width: 440,
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
              }}
            >
              <VerticalMarquee speed={15} className="h-full w-full">
                {marqueeItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="marquee-item"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '36px',
                      fontWeight: 300,
                      letterSpacing: '-0.01em',
                      color: 'rgba(255,255,255,0.95)',
                      padding: '32px 0',
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                      textShadow: '0 0 8px rgba(0,0,0,0.85), 0 0 24px rgba(0,0,0,0.6)',
                    }}
                  >
                    {item}
                  </div>
                ))}
              </VerticalMarquee>
            </div>

          </div>
        </div>

        {/* CTA — anchored below the photo card, left-aligned with it */}
        <div
          className="who-cta"
          style={{
            position: 'absolute',
            left: 200,
            top: 'calc(50% + 432px)',
            display: 'inline-block',
            fontFamily: 'ui-monospace, monospace',
            fontSize: '18px',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.9)',
            transition: 'color 200ms ease',
          }}
        >
          Explore the story <span className="who-arrow">→</span>
        </div>
      </motion.div>
    </section>
  );
}
