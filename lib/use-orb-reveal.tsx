'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { particleInteraction } from '@/lib/particle-state';

// Shared orb-reveal choreography for the home page sections.
//
// Every section (Who, Experience, Projects, Contact) fires the same sequence:
// when the section scrolls to 75% of the viewport, particles converge on the
// viewport center for 900ms with gravityBoost, then scatter, and the fixed
// section label fades in while the section is on screen. The label position
// tracks the section top on scroll. The sequence re-arms once the section is
// fully out of view.
//
// This is the exact effect that shipped in work-section.tsx, extracted so a
// new section does not add a fourth copy. Tuning lives here only.

export function useOrbReveal(sectionRef: RefObject<HTMLElement | null>) {
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
  }, [sectionRef]);

  return orbLabelRef;
}

const ORB_LABEL_STYLE: CSSProperties = {
  position:      'fixed',
  top:           0,
  left:          '50%',
  transform:     'translateX(-50%) translateY(-9999px)',
  zIndex:        5,
  pointerEvents: 'none',
  fontFamily:    'monospace',
  fontSize:      22,
  letterSpacing: '0.35em',
  textTransform: 'uppercase',
  color:         'rgba(255,255,255,0.88)',
  margin:        0,
  opacity:       0,
  transition:    'opacity 0.8s ease, transform 0.08s linear',
  textShadow:    '0 0 40px rgba(255,255,255,0.15)',
  whiteSpace:    'nowrap',
};

// The fixed section label the hook drives. Hue-free by rule.
export function OrbLabel({
  labelRef,
  children,
}: {
  labelRef: RefObject<HTMLParagraphElement | null>;
  children: ReactNode;
}) {
  return <p ref={labelRef} style={ORB_LABEL_STYLE}>{children}</p>;
}
