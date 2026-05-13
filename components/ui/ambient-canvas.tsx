'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  restX: number;
  restY: number;
  r: number;
  buzzPhaseX: number;
  buzzPhaseY: number;
  buzzFreq: number;
  buzzAmp: number;
}

export function AmbientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let W = window.innerWidth;
    let H = window.innerHeight;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
    };
    resize();

    const COUNT = 300;
    const LINK_R  = 130;
    const LINK_R2 = LINK_R * LINK_R;
    const CELL    = 130;

    const ps: Particle[] = Array.from({ length: COUNT }, () => {
      const x = Math.random() * W;
      const y = Math.random() * H;
      return {
        x, y,
        vx: 0, vy: 0,
        restX: x, restY: y,
        r: 1 + Math.random() * 1.5,
        buzzPhaseX: Math.random() * Math.PI * 2,
        buzzPhaseY: Math.random() * Math.PI * 2,
        buzzFreq:   1.5 + Math.random() * 3,
        buzzAmp:    1   + Math.random() * 2,
      };
    });

    let mouseX = -9999;
    let mouseY = -9999;

    const onMouseMove  = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    const onMouseLeave = () => { mouseX = -9999; mouseY = -9999; };

    window.addEventListener('mousemove',  onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize',     resize);

    const startTime = performance.now();
    let raf: number;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);

      // Apply dpr transform each frame (reset resets it on resize)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const t = (now - startTime) / 1000;

      // Update
      for (const p of ps) {
        const bx = Math.sin(t * p.buzzFreq        + p.buzzPhaseX) * p.buzzAmp;
        const by = Math.sin(t * p.buzzFreq * 1.3  + p.buzzPhaseY) * p.buzzAmp;

        // Spring toward rest + buzz offset
        p.vx += (p.restX + bx - p.x) * 0.03;
        p.vy += (p.restY + by - p.y) * 0.03;

        // Mouse attraction (gentle)
        const dx   = mouseX - p.x;
        const dy   = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140 && dist > 0) {
          p.vx += (dx / dist) * 0.25;
          p.vy += (dy / dist) * 0.25;
        }

        p.vx *= 0.92;
        p.vy *= 0.92;

        // Cap speed
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > 12) { p.vx = (p.vx / spd) * 12; p.vy = (p.vy / spd) * 12; }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < 0)  p.x += W;
        if (p.x > W)  p.x -= W;
        if (p.y < 0)  p.y += H;
        if (p.y > H)  p.y -= H;
      }

      // Build spatial hash
      const cellsX = Math.ceil(W / CELL) + 1;
      const grid   = new Map<number, number[]>();
      for (let i = 0; i < COUNT; i++) {
        const cx  = Math.floor(ps[i].x / CELL);
        const cy  = Math.floor(ps[i].y / CELL);
        const key = cx + cy * cellsX;
        let bucket = grid.get(key);
        if (!bucket) { bucket = []; grid.set(key, bucket); }
        bucket.push(i);
      }

      // Draw connections
      ctx.strokeStyle = 'white';
      ctx.lineWidth   = 0.5;
      const connCount = new Int32Array(COUNT);

      for (let i = 0; i < COUNT; i++) {
        if (connCount[i] >= 3) continue;
        const pi  = ps[i];
        const cx0 = Math.floor(pi.x / CELL);
        const cy0 = Math.floor(pi.y / CELL);

        for (let dcx = -1; dcx <= 1; dcx++) {
          for (let dcy = -1; dcy <= 1; dcy++) {
            const bucket = grid.get((cx0 + dcx) + (cy0 + dcy) * cellsX);
            if (!bucket) continue;
            for (const j of bucket) {
              if (j <= i) continue;
              if (connCount[i] >= 3 || connCount[j] >= 3) continue;
              const pj = ps[j];
              const ddx = pi.x - pj.x;
              const ddy = pi.y - pj.y;
              const d2  = ddx * ddx + ddy * ddy;
              if (d2 >= LINK_R2) continue;
              const d = Math.sqrt(d2);
              ctx.globalAlpha = d < 65 ? 0.18 : 0.09;
              ctx.beginPath();
              ctx.moveTo(pi.x, pi.y);
              ctx.lineTo(pj.x, pj.y);
              ctx.stroke();
              connCount[i]++;
              connCount[j]++;
            }
          }
        }
      }

      // Draw particles
      ctx.shadowColor  = 'white';
      ctx.shadowBlur   = 6;
      ctx.fillStyle    = 'white';
      ctx.globalAlpha  = 0.65;
      for (const p of ps) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur  = 0;
      ctx.globalAlpha = 1;
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove',  onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize',     resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'fixed',
        top:           0,
        left:          0,
        width:         '100%',
        height:        '100%',
        zIndex:        0,
        pointerEvents: 'none',
        opacity:       0.12,
      }}
    />
  );
}
