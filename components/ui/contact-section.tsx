'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { particleInteraction } from '@/lib/particle-state';

const LINKEDIN_URL = 'https://linkedin.com/in/sebastian-leon-b4015b3a9';
const EMAIL        = 'sebafleon@gmail.com';

function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function ContactSection() {
  const sectionRef   = useRef<HTMLElement>(null);
  const triggerRef   = useRef<HTMLDivElement>(null);
  const linkedinRef  = useRef<HTMLDivElement>(null);
  const emailRef     = useRef<HTMLDivElement>(null);
  const orbLabelRef  = useRef<HTMLParagraphElement>(null);
  const hasTriggered = useRef(false);
  const hasScattered = useRef(false);
  const isRunning    = useRef(false);
  const [hovered, setHovered] = useState<'linkedin' | 'email' | null>(null);

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
      const liEl = linkedinRef.current;
      const emEl = emailRef.current;
      if (liEl && emEl) {
        const liR    = liEl.getBoundingClientRect();
        const emR    = emEl.getBoundingClientRect();
        const inView = liR.bottom > 0 && liR.top < window.innerHeight;
        if (inView) {
          if (!particleInteraction.gravityBoost) {
            let gx: number, gy: number;
            if (hovered === 'linkedin') {
              gx = liR.left + liR.width  / 2;
              gy = liR.top  + liR.height / 2;
            } else if (hovered === 'email') {
              gx = emR.left + emR.width  / 2;
              gy = emR.top  + emR.height / 2;
            } else {
              gx = (liR.left + liR.width / 2 + emR.left + emR.width / 2) / 2;
              gy = (liR.top  + liR.height / 2 + emR.top + emR.height / 2) / 2;
            }
            particleInteraction.gravityTarget.active = true;
            particleInteraction.gravityTarget.x = gx;
            particleInteraction.gravityTarget.y = gy;
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
  }, [hovered]);

  const cardBase = {
    width: 460,
    borderRadius: 12,
    overflow: 'hidden' as const,
    cursor: 'pointer' as const,
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
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
        003 · CONTACT
      </p>

      <div ref={triggerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48 }}>

        <div style={{ display: 'flex', gap: 60, alignItems: 'flex-start' }}>

          {/* LinkedIn card */}
          <motion.div
            ref={linkedinRef}
            animate={{ y: [0, -8, -3, -10, 0], x: [0, 2, -1, 3, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.03 }}
            onHoverStart={() => setHovered('linkedin')}
            onHoverEnd={() => setHovered(null)}
            onClick={() => window.open(LINKEDIN_URL, '_blank', 'noopener,noreferrer')}
            style={{
              ...cardBase,
              border: `1px solid ${hovered === 'linkedin' ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.08)'}`,
              transition: 'border-color 0.3s ease',
            }}
          >
            <div style={{ width: '100%', height: 340, overflow: 'hidden', position: 'relative' }}>
              <img
                src="/linkedin-profile.jpg"
                alt="Sebastian Leon"
                draggable={false}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'top',
                  display: 'block',
                }}
              />

              <div style={{
                position: 'absolute', top: 12, right: 12,
                background: '#0A66C2',
                borderRadius: 6,
                padding: 6,
                color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <LinkedInIcon size={28} />
              </div>

              <motion.div
                animate={hovered === 'linkedin'
                  ? { y: 0, opacity: 1 }
                  : { y: 20, opacity: 0 }
                }
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '28px 16px 14px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                  pointerEvents: 'none',
                }}
              >
                <p style={{
                  fontFamily: 'monospace', fontSize: 10,
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: '#0A66C2', margin: 0,
                }}>
                  View LinkedIn Profile →
                </p>
              </motion.div>
            </div>

            <div style={{
              background: '#ffffff',
              padding: 20,
              minHeight: 80,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{ minWidth: 0 }}>
                <p style={{
                  fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
                  fontWeight: 700, fontSize: 22,
                  color: '#000000', margin: '0 0 6px',
                }}>
                  Sebastian Leon
                </p>
                <p style={{
                  fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
                  fontWeight: 400, fontSize: 14,
                  color: '#666666', margin: 0,
                  lineHeight: 1.4,
                  whiteSpace: 'normal',
                }}>
                  Student-Athlete | Business Analytics @ DePauw
                </p>
              </div>
              <img src="/depauw.png" style={{ height: '40px', objectFit: 'contain', opacity: 0.85, flexShrink: 0 }} />
            </div>
          </motion.div>

          {/* Email card */}
          <motion.div
            ref={emailRef}
            animate={{ y: [0, -6, -11, -4, 0], x: [0, -3, 1, -2, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.03 }}
            onHoverStart={() => setHovered('email')}
            onHoverEnd={() => setHovered(null)}
            onClick={() => window.open(`mailto:${EMAIL}`)}
            style={{
              ...cardBase,
              border: `1px solid ${hovered === 'email' ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.08)'}`,
              transition: 'border-color 0.3s ease',
            }}
          >
            <div style={{ width: '100%', height: 340, overflow: 'hidden' }}>
              <img
                src="/builder.jpg"
                alt="Builder"
                draggable={false}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'center 55%',
                  display: 'block',
                }}
              />
            </div>

            <div style={{
              background: '#1a1a1a',
              padding: 24,
              minHeight: 80,
            }}>
              <p style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
                fontWeight: 300, fontSize: 20,
                color: '#ffffff', margin: '0 0 6px',
                wordBreak: 'break-all',
              }}>
                {EMAIL}
              </p>
              <p style={{
                fontFamily: 'monospace', fontSize: 11,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)', margin: 0,
              }}>
                Get in touch
              </p>
            </div>
          </motion.div>

        </div>

        <p style={{
          fontFamily: 'monospace', fontSize: 11,
          letterSpacing: '0.14em',
          color: 'rgba(255,255,255,0.20)',
          margin: 0,
        }}>
          © 2026 Sebastian Leon
        </p>

      </div>
    </section>
  );
}
