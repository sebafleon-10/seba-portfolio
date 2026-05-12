'use client';

import { useEffect, useRef } from 'react';
import { Card23 } from '@/components/ui/card-23';
import { particleInteraction } from '@/lib/particle-state';

export function WhoSection() {
  const sectionRef   = useRef<HTMLElement>(null);
  const cardRef      = useRef<HTMLDivElement>(null);
  const orbLabelRef  = useRef<HTMLParagraphElement>(null);
  const hasTriggered = useRef(false);
  const hasScattered = useRef(false);
  const isRunning    = useRef(false);

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

      if (rect.top < window.innerHeight * 1.15 &&
          rect.top > -150 && !hasTriggered.current) run();

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

      <p
        style={{
          position: 'absolute',
          top: 40,
          left: 80,
          fontFamily: 'monospace',
          fontSize: 10,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
          margin: 0,
          pointerEvents: 'none',
        }}
      >
        001 · The Athlete
      </p>

      <div ref={cardRef}>
        <Card23
          tag="001 · THE ATHLETE"
          pills={[{ label: 'USL' }, { label: 'L2', primary: true }]}
          title="Sebastian Leon"
          description="2× Conference Champion · #11 Captain · DePauw"
          imageSrc="/seba-celebrate.jpg"
          location="Chicago · Illinois"
        />
      </div>
    </section>
  );
}
