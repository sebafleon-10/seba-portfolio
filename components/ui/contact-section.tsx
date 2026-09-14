'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { particleInteraction } from '@/lib/particle-state';
import { useOrbReveal, OrbLabel } from '@/lib/use-orb-reveal';

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
  const orbLabelRef = useOrbReveal(sectionRef);
  const triggerRef   = useRef<HTMLDivElement>(null);
  const linkedinRef  = useRef<HTMLDivElement>(null);
  const emailRef     = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<'linkedin' | 'email' | null>(null);

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
      <OrbLabel labelRef={orbLabelRef}>004 · CONTACT</OrbLabel>

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
                  Business Analyst @ BTS Consulting
                </p>
              </div>
              {/* Affiliations stacked like the LinkedIn header. Both rows share
                  one structure: a fixed-width icon column, then a bold name at
                  the same size, so the two names align on the left. */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, flexShrink: 0 }}>
                {[
                  // Icon column is exactly the tile width, and the BTS mark fills
                  // ~90% of it, matching LinkedIn's proportions so both names sit
                  // the same distance from their icon.
                  { src: '/bts-logo.svg', alt: 'BTS', name: 'BTS', iconStyle: { width: 27, height: 'auto' as const } },
                  { src: '/depauw-icon.png', alt: 'DePauw University', name: 'DePauw University', iconStyle: { width: 30, height: 30, borderRadius: 6 } },
                ].map((a) => (
                  <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      <img src={a.src} alt="" draggable={false} style={{ objectFit: 'contain', display: 'block', ...a.iconStyle }} />
                    </div>
                    <span style={{
                      fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
                      fontWeight: 700, fontSize: 13, lineHeight: 1,
                      color: '#1a1a1a', letterSpacing: '-0.01em', whiteSpace: 'nowrap',
                    }}>{a.name}</span>
                  </div>
                ))}
              </div>
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
