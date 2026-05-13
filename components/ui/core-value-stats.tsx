'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

export interface CoreStat {
  value: string;
  label: string;
  description: string;
  image?: string;
  href?: string;
  type?: string;
}

interface CoreValueStatsProps {
  stats: CoreStat[];
  title?: string;
  subtitle?: string;
  description?: string;
}

export default function CoreValueStats({ stats, title, subtitle, description }: CoreValueStatsProps) {
  return (
    <div>
      {subtitle && subtitle.length > 0 && (
        <div className="space-y-4 mb-12">
          {subtitle && (
            <p style={{
              fontFamily: 'monospace', fontSize: 10,
              letterSpacing: '0.4em', textTransform: 'uppercase' as const,
              color: 'rgba(255,255,255,0.22)', margin: 0,
            }}>{subtitle}</p>
          )}
          <h2 style={{
            fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
            fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700,
            color: '#ffffff', margin: 0, letterSpacing: '-0.03em', lineHeight: 1.1,
          }}>{title}</h2>
          {description && (
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 20, lineHeight: 1.75, margin: 0 }}>{description}</p>
          )}
        </div>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 24,
        marginTop: 0,
      }}>
        {stats.map((item, i) => {
          if (item.image) {
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{
                  rotateX: 2,
                  rotateY: 3,
                  scale: 1.03,
                  transition: { type: 'spring', stiffness: 300, damping: 20 },
                }}
                style={{ height: '100%', perspective: 1000 }}
              >
                <a href={item.href} target="_blank" rel="noopener noreferrer"
                  style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{
                    position: 'relative', height: 320, borderRadius: 24, overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    <Image src={item.image} alt={item.label} fill
                      style={{ objectFit: 'cover' }} priority />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
                    <div style={{ position: 'absolute', inset: 0, padding: 24,
                      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <p style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: '0 0 6px', fontFamily: 'monospace', letterSpacing: '0.06em' }}>{item.value}</p>
                      <span style={{
                        display: 'inline-block',
                        fontFamily: 'monospace',
                        fontSize: 12,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase' as const,
                        color: 'rgba(255,255,255,0.6)',
                        border: '1px solid rgba(255,255,255,0.22)',
                        borderRadius: 999,
                        padding: '3px 12px',
                        marginBottom: 12,
                      }}>{item.label}</span>
                      <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.8)', lineHeight: 1.75, margin: '0 0 8px' }}>{item.description}</p>
                      <span style={{ fontFamily: 'monospace', fontSize: 13,
                        letterSpacing: '0.2em', textTransform: 'uppercase' as const,
                        color: 'rgba(255,255,255,0.9)', marginTop: 12, display: 'block', fontWeight: 600 }}>
                        {item.type || 'Open'} →
                      </span>
                    </div>
                  </div>
                </a>
              </motion.div>
            );
          }
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{
                rotateX: 2,
                rotateY: 3,
                scale: 1.03,
                transition: { type: 'spring', stiffness: 300, damping: 20 },
              }}
              style={{ height: '100%' }}
            >
              <a href={item.href} target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  background: 'radial-gradient(ellipse at top left, rgba(0,71,127,0.22) 0%, transparent 65%), #111111',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  height: 360,
                  borderRadius: 24,
                  padding: 24,
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                }}>
                  <p style={{
                    color: '#ffffff',
                    fontSize: 28,
                    fontFamily: 'monospace',
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                    marginBottom: 6,
                  }}>{item.value}</p>
                  <span style={{
                    display: 'inline-block',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase' as const,
                    color: 'rgba(255,255,255,0.6)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    borderRadius: 999,
                    padding: '3px 12px',
                    marginBottom: 12,
                  }}>{item.label}</span>
                  <p style={{
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: 20,
                    lineHeight: 1.75,
                    margin: 0,
                  }}>{item.description}</p>
                  <span style={{ fontFamily: 'monospace', fontSize: 13,
                    letterSpacing: '0.2em', textTransform: 'uppercase' as const,
                    color: 'rgba(255,255,255,0.9)', marginTop: 12, display: 'block', fontWeight: 600 }}>
                    {item.type || 'Open'} →
                  </span>
                </div>
              </a>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
