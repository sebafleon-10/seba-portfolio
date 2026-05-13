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
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.6, margin: 0 }}>{description}</p>
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
                      <p style={{ fontSize: 36, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>{item.value}</p>
                      <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.3em',
                        textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', margin: '0 0 8px' }}>{item.label}</p>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: '0 0 8px' }}>{item.description}</p>
                      <span style={{ fontFamily: 'monospace', fontSize: 10,
                        letterSpacing: '0.2em', textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.5)', marginTop: 8, display: 'block' }}>
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
                  background: '#111111',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  height: 320,
                  borderRadius: 24,
                  padding: 24,
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                }}>
                  <p style={{
                    color: '#ffffff',
                    fontSize: 52,
                    fontFamily: 'monospace',
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                    marginBottom: 8,
                  }}>{item.value}</p>
                  <p style={{
                    color: 'rgba(255,255,255,0.45)',
                    fontSize: 10,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase' as const,
                    fontWeight: 600,
                    marginBottom: 8,
                  }}>{item.label}</p>
                  <p style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 13,
                    lineHeight: 1.65,
                  }}>{item.description}</p>
                  <span style={{ fontFamily: 'monospace', fontSize: 10,
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.5)', marginTop: 8, display: 'block' }}>
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
