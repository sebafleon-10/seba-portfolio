'use client';

import { useEffect, useRef } from 'react';
import { MONO } from '@/lib/fonts';
import { preload } from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { particleInteraction } from '@/lib/particle-state';
import { useOrbReveal, OrbLabel } from '@/lib/use-orb-reveal';
import { useClearZone } from '@/lib/use-particle-anchor';
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
  'SEMI-PRO',
];

export function WhoSection() {
  const router = useRouter();
  // Fetch the /who hero photo while the user is still on the home page so it
  // is already in cache when they click through.
  preload('/who-hero.jpg', { as: 'image', fetchPriority: 'high' });
  const sectionRef   = useRef<HTMLElement>(null);
  const orbLabelRef = useOrbReveal(sectionRef);
  const cardRef      = useRef<HTMLDivElement>(null);
  const marqueeRef   = useRef<HTMLDivElement>(null);
  // Phones: the ticker and link under the photo have no surface, so the
  // network keeps off them. Hidden on desktop, where the zone stays inactive.
  const footRef      = useRef<HTMLDivElement>(null);
  useClearZone(footRef, 14);

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
        // Quadratic falloff: stays near full opacity through the center band,
        // then drops only as items approach the edges. Widens the readable
        // window from one item to roughly 3-4 at once.
        const opacity = Math.max(0.08, 1 - Math.pow(normalizedDistance, 2.2));
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
      <OrbLabel labelRef={orbLabelRef}>001 · THE ATHLETE</OrbLabel>

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
        .who-foot { display: none; }
        @keyframes who-ticker { to { transform: translateX(-50%); } }
        /* Phones: the photo goes big and central, and the achievements run
           across the screen under it as a sideways ticker. */
        @media (max-width: 767px) {
          .who-composition {
            height: auto !important;
            display: flex; flex-direction: column; align-items: center;
            padding: 104px 0 36px;
          }
          .who-photo {
            position: relative !important; left: auto !important; top: auto !important;
            width: min(319px, calc(100vw - 56px)) !important;
            height: min(420px, 50vh) !important;
          }
          .who-marquee-zone, .who-cta-desktop { display: none !important; }
          .who-foot { display: block; width: 100vw; margin-top: 30px; }
          .who-ticker {
            overflow: hidden;
            -webkit-mask-image: linear-gradient(to right, transparent, #000 14%, #000 86%, transparent);
            mask-image: linear-gradient(to right, transparent, #000 14%, #000 86%, transparent);
          }
          .who-ticker-track {
            display: flex; width: max-content;
            animation: who-ticker 22s linear infinite;
          }
          .who-ticker-item {
            font-family: Inter, sans-serif; font-size: 24px; font-weight: 300;
            letter-spacing: -0.01em; color: rgba(255,255,255,0.95);
            white-space: nowrap; padding: 10px 0;
          }
          .who-ticker-item::after { content: '·'; margin: 0 18px; color: rgba(255,255,255,0.4); }
          .who-foot .who-cta { position: relative; display: inline-block; margin: 30px 0 0 28px; font-size: 13px; letter-spacing: 0.3em; }
        }
        @media (max-width: 767px) and (prefers-reduced-motion: reduce) {
          .who-ticker-track { animation: none; }
        }
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
        {/* Photo card, floating, contained within viewport, scaled up from contact-section pattern */}
        <motion.div
          className="who-photo"
          variants={photoCardVariants}
          style={{
            position: 'absolute',
            left: 232,
            // Viewport-relative height (capped at 484px for tall displays) so the
            // card fits shorter viewports, keeps clearance below the floating
            // "001 · THE ATHLETE" label and stops the CTA below from being
            // clipped off the section. The min(242px,24vh) offset is half the
            // height, shared with the CTA so both track the card's center.
            top: 'calc(50% - min(242px, 24vh))',
            width: 435,
            height: 'min(484px, 48vh)',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 34px 70px -18px rgba(0,0,0,0.6)',
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

        {/* Right zone, vertical marquee, anchored 240px from the right viewport edge */}
        <div className="who-marquee-zone" style={{
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
                height: '61vh',
                width: 384,
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
              }}
            >
              {/* Page-local text scrim, mirrors the /who TextScrim pattern,
                  scoped to this marquee column. Dims the global particles
                  behind the achievements without touching the global canvas
                  or its repulsion zones. The parent maskImage above already
                  fades this scrim at the top and bottom edges. */}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 0,
                  pointerEvents: 'none',
                  background:
                    'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.58) 30%, rgba(0,0,0,0.58) 70%, rgba(0,0,0,0) 100%)',
                }}
              />
              {/* Wrapper gives the marquee an explicit stacking layer above
                  the scrim. Without it, the scrim (positioned) would paint
                  over the static-positioned marquee text. */}
              <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
                <VerticalMarquee speed={13} className="h-full w-full">
                  {marqueeItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="marquee-item"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '31px',
                        fontWeight: 300,
                        letterSpacing: '-0.01em',
                        color: 'rgba(255,255,255,0.95)',
                        padding: '28px 0',
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
        </div>

        {/* CTA, anchored below the photo card, left-aligned with it */}
        <div
          className="who-cta who-cta-desktop"
          style={{
            position: 'absolute',
            left: 232,
            // Track the (now viewport-relative) card bottom with a fixed gap so
            // the CTA always renders fully inside the section.
            top: 'calc(50% + min(242px, 24vh) + 36px)',
            display: 'inline-block',
            fontFamily: MONO,
            fontSize: '16px',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.9)',
            transition: 'color 200ms ease',
          }}
        >
          Explore the story <span className="who-arrow">→</span>
        </div>

        {/* Phones only: sideways ticker of the achievements, then the link.
            The track holds the list twice and slides half its width, so the
            loop has no seam. */}
        <div ref={footRef} className="who-foot">
          <div className="who-ticker">
            <div className="who-ticker-track">
              {[0, 1].map((copy) => (
                marqueeItems.map((item) => (
                  <span key={`${copy}-${item}`} className="who-ticker-item" aria-hidden={copy === 1}>{item}</span>
                ))
              ))}
            </div>
          </div>
          <div
            className="who-cta"
            style={{
              fontFamily: MONO,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.9)',
              transition: 'color 200ms ease',
            }}
          >
            Explore the story <span className="who-arrow">→</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
