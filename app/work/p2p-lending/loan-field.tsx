'use client';

import { useEffect, useRef } from 'react';
import { ACCENT } from '@/lib/accent';
import data from './loan-book.json';

export type SortMode = 'model' | 'grade' | 'random';

const N = data.dots.default.length;
const DEFAULTS = data.dots.default;
const MOVE = 900;    // ms for one dot to travel
const STAGGER = 260; // ms of wave from the left edge to the right edge
const ease = (p: number) => 1 - Math.pow(1 - p, 3);

type Target = { mode: SortMode; share: number; reduced: boolean };

// Owns one canvas: layout, animation and drawing. A dot's rank under the
// active sort decides its cell (column-major, safest loans on the left), and
// every dot left of the cutoff is funded.
function createField(wrap: HTMLDivElement, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  const cur = new Float32Array(N * 3); // x, y in cells, alpha 0 to 1
  const from = new Float32Array(N * 3);
  const to = new Float32Array(N * 3);
  let cutFrom = 0, cutTo = 0, cutCur = 0;
  let start = 0, raf = 0, ready = false;
  let cols = 50, rows = 20, cell = 10, w = 0, h = 0;
  let target: Target = { mode: 'model', share: 70, reduced: false };

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    const r = Math.max(1.6, cell * 0.3);
    // Repaid first, defaults on top so they never hide.
    for (const pass of [0, 1]) {
      for (let i = 0; i < N; i++) {
        if (DEFAULTS[i] !== pass) continue;
        const a = cur[i * 3 + 2];
        ctx.globalAlpha = pass ? 0.22 + 0.78 * a : 0.1 + 0.42 * a;
        ctx.fillStyle = pass ? ACCENT : '#ffffff';
        ctx.beginPath();
        ctx.arc((cur[i * 3] + 0.5) * cell, (cur[i * 3 + 1] + 0.5) * cell, pass ? r * 1.15 : r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Cutoff line between the last funded column and the first rejected one.
    if (cutCur > 0.02 && cutCur < cols - 0.02) {
      const x = Math.round(cutCur * cell) + 0.5;
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(x, -2); ctx.lineTo(x, h + 2); ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.globalAlpha = 1;
  }

  function tick(now: number) {
    const t = now - start;
    let busy = false;
    for (let i = 0; i < N; i++) {
      const delay = (to[i * 3] / cols) * STAGGER;
      const p = Math.min(1, Math.max(0, (t - delay) / MOVE));
      if (p < 1) busy = true;
      const e = ease(p);
      for (let k = 0; k < 3; k++) cur[i * 3 + k] = from[i * 3 + k] + (to[i * 3 + k] - from[i * 3 + k]) * e;
    }
    const pc = Math.min(1, t / MOVE);
    cutCur = cutFrom + (cutTo - cutFrom) * ease(pc);
    draw();
    if (busy || pc < 1) raf = requestAnimationFrame(tick);
  }

  function apply(snap: boolean) {
    if (!w) return;
    const ranks = data.dots[target.mode], cut = Math.round((target.share / 100) * N);
    for (let i = 0; i < N; i++) {
      const rk = ranks[i];
      to[i * 3] = Math.floor(rk / rows);
      to[i * 3 + 1] = rk % rows;
      to[i * 3 + 2] = rk < cut ? 1 : 0;
    }
    cutTo = cut / rows;
    cancelAnimationFrame(raf);
    if (snap || target.reduced || !ready) {
      cur.set(to); cutCur = cutTo; ready = true;
      draw();
      return;
    }
    from.set(cur); cutFrom = cutCur; start = performance.now();
    raf = requestAnimationFrame(tick);
  }

  // 50 x 20 on wide screens, 25 x 40 on phones.
  function resize() {
    const width = wrap.clientWidth;
    cols = width < 560 ? 25 : 50;
    rows = N / cols;
    cell = width / cols;
    w = width; h = cell * rows;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.height = `${h}px`;
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    apply(true);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(wrap);

  return {
    set(next: Target) { target = next; apply(false); },
    destroy() { ro.disconnect(); cancelAnimationFrame(raf); },
  };
}

export function LoanField({ mode, share, reduced, label }: {
  mode: SortMode;
  share: number; // percent of loans funded, 1 to 100
  reduced: boolean;
  label: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<ReturnType<typeof createField> | null>(null);

  useEffect(() => {
    if (!wrapRef.current || !canvasRef.current) return;
    const f = createField(wrapRef.current, canvasRef.current);
    fieldRef.current = f;
    return () => { f.destroy(); fieldRef.current = null; };
  }, []);

  useEffect(() => { fieldRef.current?.set({ mode, share, reduced }); }, [mode, share, reduced]);

  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <canvas ref={canvasRef} role="img" aria-label={label} style={{ width: '100%', display: 'block' }} />
    </div>
  );
}

// Full-data numbers for a sort and a funded share, looked up from all 2015 loans.
export function readout(mode: SortMode, share: number) {
  const [, funded, avoided, profit, roi] = data.curves[mode][Math.min(100, Math.max(1, Math.round(share))) - 1];
  return { funded, avoided, profit, roi };
}
