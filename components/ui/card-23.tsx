'use client';

import { motion, type Variants } from 'framer-motion';
import { MapPin } from 'lucide-react';

// ── Shared motion variants ────────────────────────────────────────────────────

export const cardVariants: Variants = {
  initial: { y: 0, scale: 1 },
  hover: {
    y: -5,
    scale: 1.02,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

export const imageVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface Pill {
  label: string;
  primary?: boolean;
}

interface Card23Props {
  tag?: string;
  pills?: Pill[];
  title: string;
  description: string;
  imageSrc: string;
  location?: string;
  onClick?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Card23({ tag, pills, title, description, imageSrc, location, onClick }: Card23Props) {
  const hasTopRow = !!tag || (pills && pills.length > 0);
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      onClick={onClick}
      style={{
        width: 560,
        background: '#1a1a1a',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* ── Top section — p-6 ──────────────────────────────────────────────── */}
      <div style={{ padding: 24 }}>

        {/* Pills row */}
        {hasTopRow && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
          }}>
            {tag ? (
              <span style={{
                fontFamily: 'monospace',
                fontSize: 12,
                padding: '4px 12px',
                borderRadius: 9999,
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.70)',
                whiteSpace: 'nowrap',
              }}>
                {tag}
              </span>
            ) : <span />}

            {pills && pills.length > 0 && (
              <div style={{ display: 'flex', gap: 6 }}>
                {pills.map((pill, i) => (
                  <span key={i} style={{
                    fontSize: 12,
                    padding: '4px 12px',
                    borderRadius: 9999,
                    background: pill.primary
                      ? 'rgba(255,255,255,0.18)'
                      : 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                  }}>
                    {pill.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Title — text-2xl font-bold tracking-tight */}
        <h2 style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: '-0.025em',
          color: '#ffffff',
          margin: '0 0 8px',
          lineHeight: 1.2,
        }}>
          {title}
        </h2>

        {/* Description — text-sm text-muted-foreground */}
        <p style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
          fontSize: 14,
          color: 'rgba(255,255,255,0.55)',
          margin: 0,
          lineHeight: 1.5,
        }}>
          {description}
        </p>
      </div>

      {/* ── Image section — aspect-[16/10] overflow-hidden rounded-b-2xl ───── */}
      <div style={{ aspectRatio: '16/11', overflow: 'hidden', position: 'relative' }}>
        <motion.img
          variants={imageVariants}
          src={imageSrc}
          alt={title}
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top center',
            display: 'block',
          }}
        />

        {/* Gradient overlay — from-black/60 via-black/20 to-transparent */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.20) 50%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Location — bottom-left with MapPin */}
        {location && (
          <div style={{
            position: 'absolute',
            bottom: 12,
            left: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: 'rgba(255,255,255,0.80)',
            pointerEvents: 'none',
          }}>
            <MapPin size={12} />
            <span style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.05em' }}>
              {location}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
