'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

export interface CoreStat {
  value: string;
  label: string;
  description: string;
  image?: string;
}

interface CoreValueStatsProps {
  stats: CoreStat[];
}

export default function CoreValueStats({ stats }: CoreValueStatsProps) {
  return (
    <div className="flex flex-nowrap overflow-x-auto gap-5 py-2">
      {stats.map((item, i) => {
        if (item.image) {
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ rotateX: 4, rotateY: 4, scale: 1.03,
                transition: { type: 'spring', stiffness: 200, damping: 10 } }}
              style={{ flexShrink: 0, width: 280, perspective: 1000 }}
            >
              <div style={{
                position: 'relative', height: 280, borderRadius: 20, overflow: 'hidden',
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
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>{item.description}</p>
                </div>
              </div>
            </motion.div>
          );
        }
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            style={{ flexShrink: 0, width: 280 }}
          >
            <div style={{
              height: 280, borderRadius: 20, padding: 24,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            }}>
              <p style={{ fontSize: 36, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>{item.value}</p>
              <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.3em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '0 0 8px' }}>{item.label}</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>{item.description}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
