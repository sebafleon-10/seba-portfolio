'use client';
import { useEffect, useRef, useState } from 'react';

interface P {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  restX: number; restY: number;
  buzzPhase: number; buzzFreq: number; buzzAmp: number;
  spawnDelay: number;
  alive: boolean;
}

export function NeuralTextReveal() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const stateRef   = useRef<'ambient' | 'splitting' | 'done'>('ambient');
  const splitAt    = useRef(0);
  const [showText,   setShowText]   = useState(false);
  const [fadeCanvas, setFadeCanvas] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const CW = 580, CH = 130;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = CW * dpr;
    canvas.height = CH * dpr;
    canvas.style.width  = `${CW}px`;
    canvas.style.height = `${CH}px`;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    // Sample actual text pixel positions so particles
    // know exactly where the letters are
    const offscreen = document.createElement('canvas');
    offscreen.width  = CW;
    offscreen.height = CH;
    const octx = offscreen.getContext('2d', { willReadFrequently: true })!;
    octx.fillStyle = '#fff';
    octx.font = '600 11px monospace';
    octx.letterSpacing = '0.3em';
    octx.textAlign    = 'left';
    octx.textBaseline = 'middle';
    octx.fillText('IN PARTNERSHIP WITH',         22, 42);
    octx.fillText('AMERICAN AIRLINES MKTG TEAM', 22, 88);
    const imgData = octx.getImageData(0, 0, CW, CH).data;

    // For each particle, find its nearest text pixel
    function nearestTextDist(px: number, py: number): number {
      const xi = Math.round(px), yi = Math.round(py);
      const radius = 40;
      let minD = Infinity;
      for (let dy = -radius; dy <= radius; dy += 2) {
        for (let dx = -radius; dx <= radius; dx += 2) {
          const nx = xi + dx, ny = yi + dy;
          if (nx < 0 || nx >= CW || ny < 0 || ny >= CH) continue;
          if (imgData[(ny * CW + nx) * 4 + 3] > 100) {
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < minD) minD = d;
          }
        }
      }
      return minD;
    }

    const N      = 140;
    const LINK_R = 48;
    const LR2    = LINK_R * LINK_R;
    const start  = performance.now();

    const ps: P[] = Array.from({ length: N }, (_, i) => {
      const restX = 20 + Math.random() * (CW - 40);
      const restY = 10 + Math.random() * (CH - 20);
      return {
        x: restX + (Math.random() - 0.5) * 40,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 1.5,
        vy:  Math.random() * 2 + 0.5,
        r: 1.0 + Math.random() * 1.1,
        restX, restY,
        buzzPhase: Math.random() * Math.PI * 2,
        buzzFreq:  1.5 + Math.random() * 2.5,
        buzzAmp:   1.5 + Math.random() * 2.0,
        spawnDelay: i * 9,
        alive: false,
      };
    });

    const splitTimer = setTimeout(() => {
      stateRef.current = 'splitting';
      splitAt.current  = performance.now();
      setTimeout(() => setShowText(true),   600);
      setTimeout(() => setFadeCanvas(true), 1800);
      setTimeout(() => { stateRef.current = 'done'; }, 2200);
    }, 2600);

    let raf: number;

    const loop = () => {
      ctx.clearRect(0, 0, CW, CH);
      const now     = performance.now();
      const elapsed = now - start;
      const t       = elapsed / 1000;
      const warmup  = Math.min(1, elapsed / 1000);
      const state   = stateRef.current;
      const splitAge = state !== 'ambient'
        ? now - splitAt.current : 0;
      const splitProg = Math.min(1, splitAge / 1400);
      const eased     = splitProg < 0.5
        ? 2 * splitProg * splitProg
        : 1 - Math.pow(-2 * splitProg + 2, 2) / 2;

      for (const p of ps) {
        if (elapsed < p.spawnDelay) continue;
        p.alive = true;

        if (state === 'splitting') {
          // Repel from nearest text pixel - particles near
          // letters get pushed away along their escape vector
          const xi = Math.round(p.x), yi = Math.round(p.y);
          let repX = 0, repY = 0, found = false;
          const radius = 36;
          for (let dy = -radius; dy <= radius; dy += 2) {
            for (let dx = -radius; dx <= radius; dx += 2) {
              const nx = xi + dx, ny = yi + dy;
              if (nx < 0 || nx >= CW || ny < 0 || ny >= CH) continue;
              if (imgData[(ny * CW + nx) * 4 + 3] > 100) {
                const d = Math.sqrt(dx * dx + dy * dy) || 1;
                repX += (p.x - nx) / (d * d);
                repY += (p.y - ny) / (d * d);
                found = true;
              }
            }
          }
          if (found) {
            const mag = Math.sqrt(repX * repX + repY * repY) || 1;
            p.vx += (repX / mag) * eased * 2.8;
            p.vy += (repY / mag) * eased * 1.4;
          } else {
            // Away from center if not near text
            const dx = p.x - CW / 2, dy = p.y - CH / 2;
            const d  = Math.sqrt(dx * dx + dy * dy) || 1;
            p.vx += (dx / d) * eased * 0.8;
            p.vy += (dy / d) * eased * 0.8;
          }
          p.vx += (Math.random() - 0.5) * 0.3;
          p.vy += (Math.random() - 0.5) * 0.3;
          p.vx *= 0.90; p.vy *= 0.90;

        } else if (state === 'done') {
          p.vx *= 0.94; p.vy *= 0.94;
          p.x += p.vx; p.y += p.vy;
          continue;
        } else {
          const bx = Math.sin(t * p.buzzFreq + p.buzzPhase) * p.buzzAmp;
          const by = Math.sin(t * p.buzzFreq * 1.3 + p.buzzPhase * 0.7) * p.buzzAmp;
          p.vx += (p.restX + bx - p.x) * 0.028;
          p.vy += (p.restY + by - p.y) * 0.028;
          p.vx += (Math.random() - 0.5) * 0.22;
          p.vy += (Math.random() - 0.5) * 0.22;
          p.vx *= 0.88; p.vy *= 0.88;
        }

        p.x += p.vx; p.y += p.vy;
        if (state === 'ambient') {
          if (p.x < 0)  { p.x = 0;  p.vx =  Math.abs(p.vx) * 0.4; }
          if (p.x > CW) { p.x = CW; p.vx = -Math.abs(p.vx) * 0.4; }
          if (p.y < 0)  { p.y = 0;  p.vy =  Math.abs(p.vy) * 0.4; }
          if (p.y > CH) { p.y = CH; p.vy = -Math.abs(p.vy) * 0.4; }
        }
      }

      const alive = ps.filter(p => p.alive);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth   = 0.5;
      ctx.globalAlpha = 0.22 * warmup;
      ctx.beginPath();
      for (let i = 0; i < alive.length; i++) {
        for (let j = i + 1; j < alive.length; j++) {
          const dx = alive[i].x - alive[j].x;
          const dy = alive[i].y - alive[j].y;
          if (dx * dx + dy * dy < LR2) {
            ctx.moveTo(alive[i].x, alive[i].y);
            ctx.lineTo(alive[j].x, alive[j].y);
          }
        }
      }
      ctx.stroke();

      ctx.fillStyle   = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur  = 6;
      ctx.globalAlpha = 0.78 * warmup;
      ctx.beginPath();
      for (const p of alive) {
        ctx.moveTo(p.x + p.r, p.y);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.shadowBlur  = 0;
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(splitTimer);
    };
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: 16, left: 64,
      zIndex: 20,
      pointerEvents: 'none',
      width: 580,
      height: 130,
    }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          opacity: fadeCanvas ? 0 : 1,
          transition: 'opacity 1.6s ease',
        }}
      />
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 22px',
        opacity: showText ? 1 : 0,
        transform: showText ? 'translateY(0px)' : 'translateY(6px)',
        transition: 'opacity 1.8s ease, transform 1.8s ease',
      }}>
        <p style={{
          fontFamily:    'monospace',
          fontSize:       12,
          letterSpacing: '0.35em',
          textTransform: 'uppercase' as const,
          color:         'rgba(255,255,255,0.28)',
          margin:        '0 0 10px',
        }}>In partnership with</p>
        <p style={{
          fontFamily:    'monospace',
          fontSize:       20,
          letterSpacing: '0.2em',
          textTransform: 'uppercase' as const,
          color:         'rgba(255,255,255,0.78)',
          margin:         0,
          lineHeight:     1.45,
        }}>American Airlines<br />Marketing Team</p>
      </div>
    </div>
  );
}
