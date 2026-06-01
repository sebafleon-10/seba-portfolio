'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { particleInteraction } from '@/lib/particle-state';

const cards = [
  {
    id: 0,
    title: 'American Airlines',
    tag: 'NLP · Sentiment · Strategy',
    desc: "RoBERTa sentiment pipeline across 627K Reddit posts",
  },
  {
    id: 1,
    title: 'Chicago Ghost FC',
    tag: 'Python · Excel · API',
    desc: 'Full analytics stack for a semi-pro soccer club',
  },
  {
    id: 2,
    title: 'Remote Work & the Gender Wage Gap',
    tag: 'Regression · IPUMS · Labor Economics',
    desc: 'Triple-interaction OLS model on IPUMS CPS data',
  },
];

const cardRoutes = ['/work/american-airlines', '/work/ghost-fc', '/work/remote-work'];

export function WorkSection() {
  const [active, setActive] = useState(0);
  const [activeHovered, setActiveHovered] = useState(false);
  const router = useRouter();
  const orbLabelRef   = useRef<HTMLParagraphElement>(null);
  const activeCardRef = useRef<HTMLDivElement>(null);
  const sectionRef    = useRef<HTMLElement>(null);
  const hasTriggered  = useRef(false);
  const hasScattered  = useRef(false);
  const isRunning     = useRef(false);

  const canGoPrev = active > 0;
  const canGoNext = active < cards.length - 1;
  const prev = () => setActive(a => a - 1);
  const next = () => setActive(a => a + 1);

  // Clear the active-card hover flag whenever the active card changes,
  // so the new front card starts in its base state until the user re-enters.
  useEffect(() => { setActiveHovered(false); }, [active]);

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
      const el = activeCardRef.current;
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
  }, [active]);

  return (
    <section
      ref={sectionRef}
      id="work"
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
        002 · WORK
      </p>

      {/* Left Arrow */}
      <button
        onClick={prev}
        disabled={!canGoPrev}
        style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', zIndex: 200 }}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white hover:text-[#2DD4BF] transition disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Previous"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Right Arrow */}
      <button
        onClick={next}
        disabled={!canGoNext}
        style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', zIndex: 200 }}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white hover:text-[#2DD4BF] transition disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Next"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Outer wrapper */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>

        {/* Stack row with arrow buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>

          {/* Card fan */}
          <div style={{
            perspective: '1100px',
            position: 'relative',
            height: '640px',
            width: '860px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}>
            {cards.map((card, i) => {
              const off      = i - active;
              const isActive = off === 0;
              const rotateZ  = off * 18;
              const x        = off * 340;
              const scale    = isActive ? 1.03 : 0.92;
              const rotateX  = isActive ? 0 : 12;

              return (
                <motion.div
                  key={card.id}
                  ref={isActive ? activeCardRef : undefined}
                  onClick={() => isActive ? router.push(cardRoutes[card.id]) : setActive(i)}
                  onMouseEnter={isActive ? () => setActiveHovered(true)  : undefined}
                  onMouseLeave={isActive ? () => setActiveHovered(false) : undefined}
                  animate={{ x, rotateZ, rotateX, scale, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    width: 860,
                    height: 520,
                    background: card.id === 2 ? '#f8f8f8' : '#1a1a1a',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
                    borderRadius: 16,
                    zIndex: 100 - Math.abs(off),
                    transformStyle: 'preserve-3d',
                    cursor: 'pointer',
                    overflow: 'hidden',
                  }}
                >
                  {/* AA card image */}
                  {card.id === 0 && (
                    <img
                      src="/aa-capstone.jpg"
                      alt="American Airlines"
                      draggable={false}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover', objectPosition: 'center top',
                        display: 'block',
                      }}
                    />
                  )}

                  {/* Regression card image — light bg, no dark overlay */}
                  {card.id === 2 && (
                    <img
                      src="/regression.jpg"
                      alt="Regression analysis"
                      draggable={false}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover', objectPosition: 'center top',
                        display: 'block',
                      }}
                    />
                  )}

                  {card.id === 1 && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 50%, #111 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <span style={{
                        fontSize: 11,
                        letterSpacing: '0.4em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.12)',
                        fontFamily: 'system-ui, sans-serif',
                      }}>Ghost FC</span>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  {card.id === 2 ? (
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
                  ) : (
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  )}

                  {/* Text overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '120px 36px 36px',
                    zIndex: 1,
                  }}>
                    <h2 style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: card.id === 2 ? '#111' : '#ffffff',
                      lineHeight: 1.1,
                      fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
                      margin: '0 0 10px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>{card.title}</h2>

                    <p style={{
                      fontSize: 15,
                      color: card.id === 2 ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)',
                      lineHeight: 1.6,
                      fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
                      fontWeight: 400,
                      maxWidth: '80%',
                      margin: 0,
                      WebkitLineClamp: 1,
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>{card.desc}</p>
                  </div>

                  {/* VIEW PROJECT label — active card only.
                      Frosted pill (matches the work detail back-button chrome)
                      keeps the label legible over any image. Light variant for
                      the light regression card, dark variant for the rest.
                      Base opacity is already high; card hover bumps to full. */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        fontFamily: 'monospace',
                        fontSize: 10,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: activeHovered
                          ? '#2DD4BF'
                          : (card.id === 2 ? 'rgba(0,0,0,0.88)' : 'rgba(255,255,255,0.92)'),
                        background: card.id === 2
                          ? `rgba(255,255,255,${activeHovered ? 0.78 : 0.6})`
                          : `rgba(0,0,0,${activeHovered ? 0.55 : 0.4})`,
                        border: card.id === 2
                          ? '1px solid rgba(0,0,0,0.10)'
                          : '1px solid rgba(255,255,255,0.18)',
                        borderRadius: 999,
                        padding: '6px 12px',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        textShadow: card.id === 2
                          ? '0 1px 0 rgba(255,255,255,0.45)'
                          : '0 1px 2px rgba(0,0,0,0.45)',
                        transition: 'color 220ms ease, background 220ms ease',
                        pointerEvents: 'none',
                        zIndex: 11,
                      }}
                    >
                      View Work →
                    </motion.div>
                  )}

                  {/* Border overlay */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 16,
                    border: '6px solid rgba(255,255,255,0.12)',
                    pointerEvents: 'none',
                    zIndex: 10,
                  }} />
                </motion.div>
              );
            })}
          </div>

        </div>

        {/* Dot navigation */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                width:        i === active ? 24 : 8,
                height:       8,
                borderRadius: i === active ? 4 : '50%',
                border:       'none',
                padding:      0,
                background:   i === active ? '#2DD4BF' : 'rgba(255,255,255,0.3)',
                cursor:       'pointer',
                transition:   'all 0.3s ease',
              }}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
