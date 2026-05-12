'use client';

import { useEffect, useRef } from 'react';

export function ScrollProgress() {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? window.scrollY / scrollable : 0;
      if (fillRef.current) fillRef.current.style.height = `${pct * 100}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        width: 1,
        background: 'rgba(255,255,255,0.08)',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      <div
        ref={fillRef}
        style={{
          width: '100%',
          height: '0%',
          background: 'rgba(255,255,255,0.20)',
          transition: 'height 0.05s linear',
        }}
      />
    </div>
  );
}
