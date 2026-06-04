'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DotGridBackground } from '@/components/ui/dot-grid-background';

const MONO = { fontFamily: 'monospace' };
const INTER = { fontFamily: 'Inter, ui-rounded, system-ui, sans-serif' };

// accent color, used sparingly
const ACCENT = '#2DD4BF';

const SECTION_LABEL: React.CSSProperties = {
  ...MONO,
  fontSize: 10,
  letterSpacing: '0.4em',
  textTransform: 'uppercase',
  color: ACCENT,
  display: 'block',
  margin: 0,
};

const SECTION_HEADING: React.CSSProperties = {
  ...INTER,
  fontSize: 'clamp(32px, 4vw, 52px)',
  fontWeight: 700,
  color: '#ffffff',
  letterSpacing: '-0.03em',
  lineHeight: 1.1,
  margin: 0,
};

const BODY_TEXT: React.CSSProperties = {
  ...INTER,
  fontSize: 18,
  fontWeight: 300,
  color: 'rgba(255,255,255,0.72)',
  lineHeight: 1.85,
  margin: 0,
};

// Single source of truth for hero band height. Also used to offset the
// TextScrim so it does not muddy the photo.
const HERO_HEIGHT_VH = 82;

function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => { setIsLoaded(true); }, []);

  return (
    <section
      className="relative w-full"
      style={{
        zIndex: 1,
        minHeight: `${HERO_HEIGHT_VH}vh`,
        overflow: 'hidden',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 1.04 }}
        animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '63%',
          height: '100%',
          overflow: 'hidden',
          // Dark fallback behind the photo so a missing file still reads as a
          // clean dark band instead of a broken-image gap.
          background: '#0c0c0c',
          zIndex: 1,
          // Dissolve the photo (and its overlays) into the page's dot-grid on
          // both the bottom and the left edges, so the hero has no hard seam
          // against the dot-grid. Two gradient mask layers are composited
          // with mask-composite: intersect (source-in on Webkit), so the
          // photo paints only where BOTH masks are opaque.
          maskImage:
            'linear-gradient(to bottom, black 0%, black 76%, transparent 100%), ' +
            'linear-gradient(to right, transparent 0%, black 18%, black 100%)',
          maskComposite: 'intersect',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 0%, black 76%, transparent 100%), ' +
            'linear-gradient(to right, transparent 0%, black 18%, black 100%)',
          WebkitMaskComposite: 'source-in',
        }}
      >
        <img
          src="/who-hero.jpg"
          alt="Sebastian Leon, night match action"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center right',
            display: 'block',
          }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to right, #080808 0%, rgba(8,8,8,0.88) 16%, rgba(8,8,8,0.45) 36%, rgba(8,8,8,0) 55%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '38%',
            background:
              'linear-gradient(to top, transparent 0%, rgba(8,8,8,0.55) 50%, rgba(8,8,8,0) 100%)',
            pointerEvents: 'none',
          }}
        />
      </motion.div>

      <div
        style={{
          position: 'relative',
          minHeight: `${HERO_HEIGHT_VH}vh`,
          padding: '160px 96px 100px',
          maxWidth: 1400,
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          zIndex: 10,
        }}
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            ...MONO,
            fontSize: 11,
            letterSpacing: '0.4em',
            textTransform: 'uppercase' as const,
            color: ACCENT,
            margin: '0 0 32px',
          }}
        >
          001
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          style={{
            ...INTER,
            fontSize: 'clamp(36px, 3.8vw, 58px)',
            fontWeight: 800,
            lineHeight: 0.88,
            color: '#ffffff',
            margin: '0 0 28px',
            letterSpacing: '-0.04em',
          }}
        >
          The Athlete
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
          style={{
            ...INTER,
            fontSize: 'clamp(18px, 2vw, 26px)',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.6)',
            margin: '0 0 16px',
            lineHeight: 1.55,
            maxWidth: 640,
            letterSpacing: '0.01em',
          }}
        >
          Soccer is the throughline. The captaincy, the conditioning,
          the standard set every day for most of my life.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
          style={{
            ...INTER,
            fontSize: 18,
            fontWeight: 300,
            color: 'rgba(255,255,255,0.5)',
            margin: 0,
            lineHeight: 1.75,
            maxWidth: 640,
          }}
        >
          It is where I learned how to work, how to lead, and why I
          keep showing up when it gets hard.
        </motion.p>
      </div>
    </section>
  );
}

function StorySection() {
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '40px 0 88px' }}>
      <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto', padding: '0 64px' }}>
        <p style={{ ...SECTION_LABEL, marginBottom: 32 }}>The Story</p>
        <h2 style={{ ...SECTION_HEADING, marginBottom: 56, maxWidth: 720 }}>
          Son of an immigrant, raised on the field
        </h2>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 64,
          alignItems: 'flex-start',
        }}>
          <div style={{
            flex: '1 1 360px',
            minWidth: 0,
            maxWidth: 640,
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
          }}>
            <p style={BODY_TEXT}>
              My father left Peru alone and built a life here from nothing.
              That story is the floor under everything I do. The expectation
              was never spoken, it was modeled. Work hard, stay disciplined,
              do not waste the chance you were given.
            </p>
            <p style={BODY_TEXT}>
              Soccer carried me through all of it. From the streets of Peru
              to Chicago clubs to a season at Rochester, then a transfer to
              DePauw, I chased the next level every season. At DePauw I
              earned the captaincy. We went back-to-back in the NCAC
              Tournament and took the regular-season title last year, a run
              that came down to standards inside the locker room as much as
              anything on the pitch.
            </p>
            <p style={BODY_TEXT}>
              I never stopped playing. Semi-pro in USL League Two with the
              Chicago Dutch Lions and Chicago City SC. Different rosters,
              same lesson: the work compounds, and the people who keep
              doing it long after it stops being convenient are the ones
              who end up in the room.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.2 }}
            role="img"
            aria-label="Senior day with my parents in my soccer kit"
            style={{
              flex: '1 1 360px',
              minWidth: 0,
              aspectRatio: '4 / 3',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.1)',
              overflow: 'hidden',
              // Background-image swallows missing files silently. Solid dark
              // color underneath shows when the file is missing, so the tile
              // reads as an intentional dark frame instead of a broken-image
              // icon with visible alt text. Same pattern as the gallery tiles.
              backgroundColor: '#111111',
              backgroundImage: 'url(/who-story.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>
      </div>
    </section>
  );
}

interface Achievement {
  value: string;
  label: string;
  description: string;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    value: '03× NCAC',
    label: 'champion',
    description: 'Back-to-back North Coast Athletic Conference tournament titles, plus the regular-season title last year.',
  },
  {
    value: 'NCAC MVP',
    label: 'tournament',
    description: 'The individual honor on the title run.',
  },
  {
    value: 'DEPAUW',
    label: 'captain',
    description: 'Team captain. Standard-setter inside the locker room and on the field.',
  },
  {
    value: 'GHOST FC',
    label: 'captain',
    description: 'Captain of Chicago Ghost FC, a semi-pro side in the MWPL, and now the club\'s analyst.',
  },
  {
    value: 'SEMI-PRO',
    label: 'usl 2',
    description: 'Chicago Dutch Lions and Chicago City SC in USL League Two.',
  },
];

function AchievementRow({ item, isLast, index }: { item: Achievement; isLast: boolean; index: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.09, duration: 0.55, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.2 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        // Left padding gives the teal tick room without crowding the title.
        padding: '36px 0 36px 28px',
        borderTop: '1px solid rgba(255,255,255,0.10)',
        borderBottom: isLast ? '1px solid rgba(255,255,255,0.10)' : 'none',
      }}
    >
      {/* Teal tick at the left edge, vertically centered. Animates in on
          scroll and grows taller on hover. Stays anchored when the content
          shifts right, creating an editorial reveal motion. */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'none',
      }}>
        <motion.span
          aria-hidden
          initial={{ scaleY: 0, opacity: 0 }}
          whileInView={{ scaleY: 1, opacity: 1 }}
          transition={{ delay: index * 0.09 + 0.18, duration: 0.4, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.2 }}
          style={{
            display: 'block',
            width: 3,
            height: hovered ? 64 : 32,
            background: ACCENT,
            transformOrigin: 'center',
            transition: 'height 0.3s ease',
          }}
        />
      </div>

      {/* Content shifts right on hover. The tick stays anchored on the
          outer container so only the title/description slide. */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 40%) 1fr',
        alignItems: 'flex-start',
        gap: 48,
        transform: hovered ? 'translateX(10px)' : 'translateX(0)',
        transition: 'transform 0.3s ease',
      }}>
        <p style={{
          ...MONO,
          fontSize: 'clamp(34px, 4vw, 52px)',
          fontWeight: 700,
          letterSpacing: '0.04em',
          lineHeight: 1,
          color: hovered ? ACCENT : 'rgba(255,255,255,0.92)',
          margin: 0,
          transition: 'color 0.25s ease',
        }}>{item.value}</p>

        <div>
          <p style={{
            ...MONO,
            fontSize: 11,
            letterSpacing: '0.3em',
            textTransform: 'uppercase' as const,
            color: ACCENT,
            margin: '8px 0 14px',
          }}>{item.label}</p>
          <p style={{
            ...INTER,
            fontSize: 19,
            fontWeight: 300,
            color: hovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.72)',
            lineHeight: 1.7,
            margin: 0,
            maxWidth: 640,
            transition: 'color 0.25s ease',
          }}>{item.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

function AchievementSection() {
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '0 0 88px' }}>
      <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto', padding: '0 64px' }}>
        <p style={{ ...SECTION_LABEL, marginBottom: 12 }}>On the Field</p>
        <h2 style={{ ...SECTION_HEADING, marginBottom: 48 }}>The receipts</h2>
        <div>
          {ACHIEVEMENTS.map((item, i) => (
            <AchievementRow
              key={i}
              item={item}
              index={i}
              isLast={i === ACHIEVEMENTS.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface BeyondItem {
  number: string;
  label: string;
  body: string;
}

const BEYOND: BeyondItem[] = [
  {
    number: '01',
    label: 'Training Business',
    body: 'Built a personal soccer training operation in 2018. Still running. Private and small-group sessions for players who want to take it seriously.',
  },
  {
    number: '02',
    label: 'In the Weight Room',
    body: 'Lifting has been part of the routine for years. Strength work is what kept me playable through every season and still keeps me sharp.',
  },
  {
    number: '03',
    label: 'On the Board',
    body: 'Snowboarding and board sports in the off-season. Different surface, same instincts. Edge work and timing carry over more than people think.',
  },
  {
    number: '04',
    label: 'In the Room',
    body: 'EDM in the headphones for the lifts, the runs, the long sits in front of code. The sound that keeps the pace up when the work gets quiet.',
  },
];

function BeyondBlock({ item, index }: { item: BeyondItem; index: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      viewport={{ once: true, amount: 0.2 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        paddingTop: 32,
      }}
    >
      <span
        aria-hidden
        style={{
          ...MONO,
          position: 'absolute',
          top: -28,
          left: -12,
          fontSize: 'clamp(90px, 12vw, 150px)',
          fontWeight: 700,
          lineHeight: 1,
          // Teal-tinted ghost. Subtle opacity bump on hover keeps the
          // section connected to the page accent without competing with
          // the louder receipts section above.
          color: hovered ? 'rgba(45,212,191,0.14)' : 'rgba(45,212,191,0.09)',
          letterSpacing: '-0.02em',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
          transition: 'color 0.3s ease',
        }}
      >
        {item.number}
      </span>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h3 style={{
          ...INTER,
          fontSize: 26,
          fontWeight: 700,
          color: hovered ? ACCENT : '#ffffff',
          letterSpacing: '-0.02em',
          margin: '0 0 14px',
          transition: 'color 0.3s ease',
        }}>{item.label}</h3>
        <p style={{
          ...INTER,
          fontSize: 16,
          fontWeight: 300,
          color: 'rgba(255,255,255,0.72)',
          lineHeight: 1.75,
          margin: 0,
          maxWidth: 440,
        }}>{item.body}</p>
      </div>
    </motion.div>
  );
}

function BeyondSection() {
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '0 0 88px' }}>
      <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto', padding: '0 64px' }}>
        <p style={{ ...SECTION_LABEL, marginBottom: 12 }}>Beyond the Pitch</p>
        <h2 style={{ ...SECTION_HEADING, marginBottom: 56 }}>Everything else</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          columnGap: 64,
          rowGap: 88,
        }}>
          {BEYOND.map((item, i) => (
            <BeyondBlock key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Composition built around each photo's natural orientation.
// who-1 (portrait, soccer): left pillar, extended to rows 1-3 so col 1 stays
//   filled down to the closer.
// who-2 (square-ish, coaching): top middle.
// who-3 (landscape, team): top right.
// who-4 (portrait, snowboard): right pillar, rows 2-3, tucks under who-3
//   to mirror the left pillar as a tall bookend (asymmetric on purpose
//   because who-3 owns the top-right slot).
// who-5 (portrait, lifting): middle column rows 2-3 so col 2 stays filled
//   all the way down.
// who-6 (landscape, Peru): full-width prominent closer in row 4 with extra
//   row height.
const GALLERY = [
  { src: '/who-1.jpg', alt: 'Soccer action', gridColumn: '1', gridRow: '1 / span 3', backgroundPosition: 'center' },
  { src: '/who-2.jpg', alt: 'Coaching', gridColumn: '2', gridRow: '1', backgroundPosition: 'center' },
  { src: '/who-3.jpg', alt: 'Team photo', gridColumn: '3', gridRow: '1', backgroundPosition: 'center' },
  { src: '/who-4.jpg', alt: 'Snowboarding', gridColumn: '3', gridRow: '2 / span 2', backgroundPosition: 'center top' },
  { src: '/who-5.jpg', alt: 'In the weight room', gridColumn: '2', gridRow: '2 / span 2', backgroundPosition: 'center' },
  { src: '/who-6.jpg', alt: 'Peru', gridColumn: '1 / span 3', gridRow: '4', backgroundPosition: 'center' },
];

function GallerySection() {
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '0 0 160px' }}>
      <div style={{ maxWidth: 1400, width: '100%', margin: '0 auto', padding: '0 64px' }}>
        <p style={{ ...SECTION_LABEL, marginBottom: 12 }}>Moments</p>
        <h2 style={{ ...SECTION_HEADING, marginBottom: 48 }}>A few frames</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gridTemplateRows: '240px 200px 200px 360px',
          gap: 18,
        }}>
          {GALLERY.map((item, i) => (
            <motion.div
              key={i}
              role="img"
              aria-label={item.alt}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              viewport={{ once: true, amount: 0.15 }}
              style={{
                position: 'relative',
                gridColumn: item.gridColumn,
                gridRow: item.gridRow,
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                // Background-image swallows missing files silently. The solid
                // dark color underneath shows through when the file is missing,
                // so the tile reads as an intentional dark frame instead of a
                // broken-image icon with visible alt text.
                backgroundColor: '#111111',
                backgroundImage: `url(${item.src})`,
                backgroundSize: 'cover',
                backgroundPosition: item.backgroundPosition,
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)',
                pointerEvents: 'none',
              }} />
              <span style={{
                position: 'absolute',
                left: 16,
                bottom: 14,
                ...MONO,
                fontSize: 11,
                letterSpacing: '0.3em',
                textTransform: 'uppercase' as const,
                color: 'rgba(255,255,255,0.85)',
              }}>{String(i + 1).padStart(2, '0')}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// One tunable scrim. Sits above DotGridBackground (fixed, z=0) and below the
// text sections (relative, z=1, DOM-ordered after this element). Absolute
// (not fixed) so it begins at the bottom of the hero band and never paints
// over the hero photo. Requires WhoPage root to be position:relative.
const SCRIM_WIDTH = 'min(1100px, 92vw)';
const SCRIM_CENTER_ALPHA = 0.58;
const SCRIM_GRADIENT = `linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,${SCRIM_CENTER_ALPHA}) 30%, rgba(0,0,0,${SCRIM_CENTER_ALPHA}) 70%, rgba(0,0,0,0) 100%)`;

function TextScrim() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top: `${HERO_HEIGHT_VH}vh`,
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: SCRIM_WIDTH,
        pointerEvents: 'none',
        zIndex: 1,
        background: SCRIM_GRADIENT,
      }}
    />
  );
}

export default function WhoPage() {
  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Shared dot-grid background, matching /work/remote-work and the
          other detail pages for visual coherence. Fixed full-viewport,
          behind all content (zIndex 0, pointer-events none). */}
      <DotGridBackground />
      <TextScrim />
      <HeroSection />
      <StorySection />
      <AchievementSection />
      <BeyondSection />
      <GallerySection />
    </div>
  );
}
