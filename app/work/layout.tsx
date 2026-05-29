'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AmbientCanvas } from '@/components/ui/ambient-canvas';

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Skip the particle network only on /work/remote-work — that page swaps in its own
  // dot-grid background. AA and Ghost FC keep AmbientCanvas unchanged.
  const showParticles = !pathname?.startsWith('/work/remote-work');

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#ffffff' }}>
      {showParticles && <AmbientCanvas />}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '20px 40px',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(to bottom, rgba(10,10,10,0.95) 0%, transparent 100%)',
      }}>
        <Link
          href="/#work"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
            fontSize: 15,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.85)',
            textDecoration: 'none',
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 999,
            padding: '10px 20px',
            transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.14)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </Link>
      </nav>
      {children}
    </div>
  );
}
