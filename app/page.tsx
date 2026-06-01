'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { WhoSection }     from '@/components/ui/who-section';
import { WorkSection }    from '@/components/ui/work-section';
import { ContactSection } from '@/components/ui/contact-section';

const NAV_LINKS = [
  { num: '01', label: 'Who',     href: '#who',     id: 'who'     },
  { num: '02', label: 'Work',    href: '#work',    id: 'work'    },
  { num: '03', label: 'Contact', href: '#contact', id: 'contact' },
] as const;

// Module-level intro gate: tagline + nav-link reveal should only play on a
// genuine first load of the site, not on client-side back-navigation. Lives
// at module scope so it survives remounts; a full page reload reloads the
// module and resets this to false, restoring the first-load behavior.
let introHasPlayed = false;

function MagneticNavLink({
  num, label, href, active, taglineReady, index,
}: {
  num: string;
  label: string;
  href: string;
  active: boolean;
  taglineReady: boolean;
  index: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 240, damping: 22, mass: 0.45 });
  const sy = useSpring(y, { stiffness: 240, damping: 22, mass: 0.45 });
  const [hover, setHover] = useState(false);

  const onMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const MAX = 6;
    x.set(Math.max(-MAX, Math.min(MAX, dx * 0.4)));
    y.set(Math.max(-MAX, Math.min(MAX, dy * 0.4)));
  };
  const onEnter = () => setHover(true);
  const onLeave = () => { x.set(0); y.set(0); setHover(false); };

  const numChars   = num.split('');
  const labelChars = label.split('');

  const renderChar = (c: string, i: number) => (
    <motion.span
      key={i}
      style={{ display: 'inline-block' }}
      animate={hover ? { y: -3 } : { y: 0 }}
      transition={{
        duration: 0.28,
        delay: hover ? i * 0.025 : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {c}
    </motion.span>
  );

  const litColor = active || hover ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.72)';

  return (
    <motion.div
      style={{ display: 'inline-block', pointerEvents: 'auto' }}
      // If the intro already finished before this link mounted (taglineReady
      // was already true at first render), skip the entrance animation and
      // render directly at the settled state. Otherwise play the staggered
      // rise-and-fade exactly as before.
      initial={taglineReady ? false : { opacity: 0, y: 14 }}
      animate={taglineReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 + index * 0.08 }}
    >
      <motion.a
        ref={ref}
        href={href}
        onMouseMove={onMouseMove}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        style={{
          x: sx, y: sy,
          display: 'inline-flex', alignItems: 'baseline',
          fontFamily: 'monospace', fontSize: 18, letterSpacing: '0.10em',
          color: litColor,
          textDecoration: 'none',
          transition: 'color 250ms ease',
          willChange: 'transform',
        }}
      >
        <span style={{ display: 'inline-flex', letterSpacing: '0.35em', marginRight: '0.55em' }}>
          {numChars.map((c, i) => renderChar(c, i))}
        </span>
        <span style={{ display: 'inline-flex' }}>
          {labelChars.map((c, i) => renderChar(c, numChars.length + i))}
        </span>
      </motion.a>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const taglineRef = useRef<HTMLDivElement>(null);
  // Seed tagline state from the module-level gate: if the intro already played
  // in this module's lifetime (i.e. user is coming back via client-side nav),
  // start with the tagline already visible and skip the 6500ms timer.
  const [tagline, setTagline] = useState(introHasPlayed);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Tagline appears after particle scatter completes:
  // chaos(1500) + assembly(1800) + hold(2000) + scatter(1200) = 6500ms
  useEffect(() => {
    if (introHasPlayed) return;
    introHasPlayed = true;
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

  // Scroll-spy: light up the nav link for the section currently in view.
  // The hero is not an observed target, so when none of Who/Work/Contact
  // intersects the middle band, activeId clears to null and all links sit
  // at the base 0.72 opacity. We track per-section intersection state across
  // callbacks because IntersectionObserver only reports entries that changed.
  useEffect(() => {
    const elements = NAV_LINKS
      .map(l => document.getElementById(l.id))
      .filter((el): el is HTMLElement => !!el);
    if (elements.length === 0) return;

    const intersecting = new Set<string>();
    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).id;
          ratios.set(id, e.intersectionRatio);
          if (e.isIntersecting) intersecting.add(id);
          else                  intersecting.delete(id);
        }
        if (intersecting.size === 0) {
          setActiveId(null);
          return;
        }
        let bestId: string | null = null;
        let bestRatio = -1;
        for (const id of intersecting) {
          const r = ratios.get(id) ?? 0;
          if (r > bestRatio) { bestRatio = r; bestId = id; }
        }
        setActiveId(bestId);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: '-45% 0px -45% 0px' }
    );
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
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
            {NAV_LINKS.map((link, i) => (
              <MagneticNavLink
                key={link.id}
                num={link.num}
                label={link.label}
                href={link.href}
                active={activeId === link.id}
                taglineReady={tagline}
                index={i}
              />
            ))}
          </nav>
        </header>

        {/* Tagline */}
        <div
          ref={taglineRef}
          style={{
            position: 'absolute',
            top: 0, bottom: 0, left: 0, right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
              fontSize: 14,
              letterSpacing: '0.4em',
              color: 'rgba(255,255,255,0.5)',
              margin: 0,
            }}
          >
            SCROLL
          </p>
          <motion.div
            style={{
              width: 1,
              height: 48,
              background: 'rgba(255,255,255,1)',
            }}
            animate={{ y: [0, 8, 16], opacity: [0, 0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
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
