'use client';

import { useEffect, useRef, useState } from 'react';
import { particleInteraction } from '@/lib/particle-state';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CardStackItem {
  id: number;
  title: string;
  description: string;
  tag: string;
  imageSrc?: string | null;
  gradient?: string;
}

interface CardStackProps {
  items: CardStackItem[];
  cardWidth?: number;
  cardHeight?: number;
  overlap?: number;
  spreadDeg?: number;
  perspectivePx?: number;
  depthPx?: number;
  tiltXDeg?: number;
  activeLiftPx?: number;
  activeScale?: number;
  inactiveScale?: number;
  springStiffness?: number;
  springDamping?: number;
  maxVisible?: number;
  loop?: boolean;
  showDots?: boolean;
  pauseOnHover?: boolean;
}

// ── Card face ──────────────────────────────────────────────────────────────────

function DefaultFanCard({ item, width, height }: { item: CardStackItem; width: number; height: number }) {
  return (
    <div style={{
      width, height,
      background: '#111',
      borderRadius: 14,
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ width: '100%', height: '42%', flexShrink: 0 }}>
        {item.imageSrc ? (
          <img
            src={item.imageSrc}
            alt={item.title}
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: item.gradient ?? 'linear-gradient(135deg, #1c1c1c 0%, #0a0a0a 100%)',
          }} />
        )}
      </div>
      <div style={{ padding: '16px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p style={{
          fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.28em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
          margin: '0 0 8px',
        }}>
          {item.tag}
        </p>
        <h3 style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
          fontWeight: 300, fontSize: 18, letterSpacing: '-0.02em',
          color: '#fff', margin: '0 0 8px', lineHeight: 1.2,
        }}>
          {item.title}
        </h3>
        <p style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
          fontSize: 12, lineHeight: 1.65,
          color: 'rgba(255,255,255,0.38)', margin: 0,
        }}>
          {item.description}
        </p>
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export function CardStack({
  items,
  cardWidth     = 520,
  cardHeight    = 320,
  spreadDeg     = 48,
  perspectivePx = 1100,
  depthPx       = 140,
  tiltXDeg      = 12,
  activeLiftPx  = 22,
  activeScale   = 1.03,
  inactiveScale = 0.94,
  maxVisible    = 5,
  loop          = true,
  showDots      = true,
  pauseOnHover  = true,
}: CardStackProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragging,    setDragging]    = useState(false);
  const [dragDx,      setDragDx]      = useState(0);
  const [isHovered,   setIsHovered]   = useState(false);
  const startXRef = useRef(0);
  const cardRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const n         = items.length;
  const halfVis   = Math.floor(maxVisible / 2);
  const DRAG_THR  = 60;
  // Spring-approximating easing for CSS transitions
  const SPRING_CSS = 'transform 0.52s cubic-bezier(0.34, 1.56, 0.64, 1)';

  // ── Particle gravity ──────────────────────────────────────────────────────────
  useEffect(() => {
    let raf: number;
    let wasInView = false;
    const tick = () => {
      const el = cardRefs.current[activeIndex];
      if (el) {
        const r = el.getBoundingClientRect();
        const inView = r.bottom > 0 && r.top < window.innerHeight;
        if (inView) {
          particleInteraction.gravityTarget.active = true;
          particleInteraction.gravityTarget.x = r.left + r.width  / 2;
          particleInteraction.gravityTarget.y = r.top  + r.height / 2;
          wasInView = true;
        } else if (wasInView) {
          particleInteraction.gravityTarget.active = false;
          wasInView = false;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); particleInteraction.gravityTarget.active = false; };
  }, [activeIndex]);

  // ── Auto-advance ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loop || isHovered) return;
    const t = setInterval(() => setActiveIndex(i => (i + 1) % n), 4000);
    return () => clearInterval(t);
  }, [isHovered, loop, n]);

  // ── Navigation ────────────────────────────────────────────────────────────────
  const advance = (dir: 1 | -1) => {
    if (!loop && (activeIndex + dir < 0 || activeIndex + dir >= n)) return;
    setActiveIndex(i => (i + dir + n) % n);
  };

  // ── Drag ──────────────────────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    startXRef.current = e.clientX;
    setDragging(true);
    setDragDx(0);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragDx(e.clientX - startXRef.current);
  };
  const onPointerUp = () => {
    if (dragDx < -DRAG_THR) advance(1);
    else if (dragDx > DRAG_THR) advance(-1);
    setDragging(false);
    setDragDx(0);
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Fan container ─────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          width: cardWidth,
          // Extra vertical room for the active lift and rotated card tops
          height: cardHeight + activeLiftPx + 60,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {items.map((item, i) => {
          const slot    = (i - activeIndex + n) % n;
          const fanSlot = slot <= Math.floor(n / 2) ? slot : slot - n;
          if (Math.abs(fanSlot) > halfVis) return null;

          const isCurrent = fanSlot === 0;
          const stepDeg   = spreadDeg / maxVisible;
          const rotZ      = fanSlot * stepDeg + (isCurrent && dragging ? dragDx * 0.03 : 0);
          const posX      = isCurrent && dragging ? dragDx : 0;
          const posY      = isCurrent ? -activeLiftPx : 0;
          const posZ      = isCurrent ? 0 : -depthPx * Math.abs(fanSlot);
          const rotX      = isCurrent ? 0 : tiltXDeg;
          const sc        = isCurrent ? activeScale : inactiveScale * Math.pow(0.97, Math.abs(fanSlot) - 1);
          const zi        = maxVisible - Math.abs(fanSlot);

          // perspective() in the transform string guarantees 3D context regardless
          // of parent stacking. This is more reliable than CSS perspective on parent.
          const transform = [
            `perspective(${perspectivePx}px)`,
            `translateX(${posX}px)`,
            `translateY(${posY}px)`,
            `translateZ(${posZ}px)`,
            `rotateZ(${rotZ}deg)`,
            `rotateX(${rotX}deg)`,
            `scale(${sc})`,
          ].join(' ');

          return (
            <div
              key={item.id}
              ref={el => { cardRefs.current[i] = el; }}
              onClick={!isCurrent ? () => setActiveIndex(i) : undefined}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: cardWidth,
                height: cardHeight,
                transformOrigin: 'bottom center',
                zIndex: zi,
                cursor: isCurrent ? (dragging ? 'grabbing' : 'grab') : 'pointer',
                userSelect: 'none',
                touchAction: 'none',
                transition: dragging && isCurrent ? 'none' : SPRING_CSS,
                transform,
              }}
            >
              <DefaultFanCard item={item} width={cardWidth} height={cardHeight} />
            </div>
          );
        })}
      </div>

      {/* ── Dots ──────────────────────────────────────────────────────────────── */}
      {showDots && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              style={{
                width: i === activeIndex ? 20 : 6,
                height: 6,
                borderRadius: 3,
                padding: 0,
                border: 'none',
                background: i === activeIndex ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.20)',
                cursor: 'pointer',
                transition: 'width 0.3s ease, background 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
