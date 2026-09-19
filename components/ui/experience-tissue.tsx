'use client';

import { useEffect, useRef, type RefObject } from 'react';

// Connective tissue between the Experience text card and the logo mark.
//
// A small private canvas laid over the wall. It reads the card, the active
// company name and the visible mark every frame, so it stays attached while
// both of them float. A spindle of drifting nodes converges on the two
// anchors; a pulse runs card to mark on every step and on an idle timer, and
// onArrive fires when it lands so the mark can take the hit. The section
// keeps the main particle network out of the gap with a clear zone, so this
// is the only network drawn there.

type Pt = { x: number; y: number };

const NODES = 26;
const PULSE_MS = 900;
const IDLE_MS = 5200;

function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Node homes in gap space: u runs card to mark, v is the offset from the
// midline as a share of the spindle's half height at that u.
function buildGraph() {
  const rand = mulberry32(7);
  const nodes = Array.from({ length: NODES }, (_, i) => ({
    u: 0.1 + (0.8 * (i + rand() * 0.8)) / NODES,
    v: (rand() * 2 - 1) * 0.95,
    ph: rand() * Math.PI * 2,
    w: 0.35 + rand() * 0.5,
    r: 1.4 + rand() * 1.8,
  }));
  // Index NODES is the card anchor, NODES + 1 the mark anchor.
  const A = NODES, B = NODES + 1;
  const pos = (i: number) => i === A ? { x: 0, y: 0 } : i === B ? { x: 1, y: 0 }
    : { x: nodes[i].u, y: nodes[i].v * Math.sin(Math.PI * nodes[i].u) * 0.55 };
  const edges = new Set<string>();
  const link = (a: number, b: number) => { if (a !== b) edges.add(a < b ? `${a}-${b}` : `${b}-${a}`); };
  for (let i = 0; i < NODES + 2; i++) {
    const near = [...Array(NODES + 2).keys()]
      .filter(j => j !== i && !(i >= NODES && j >= NODES))
      .sort((p, q) => Math.hypot(pos(p).x - pos(i).x, pos(p).y - pos(i).y) - Math.hypot(pos(q).x - pos(i).x, pos(q).y - pos(i).y));
    for (const j of near.slice(0, 4)) link(i, j);
  }
  const list = [...edges].map(e => e.split('-').map(Number) as [number, number]);
  // Shortest hop path A to B for the pulse (BFS, always moving forward in u).
  const adj = new Map<number, number[]>();
  for (const [a, b] of list) { adj.set(a, [...(adj.get(a) ?? []), b]); adj.set(b, [...(adj.get(b) ?? []), a]); }
  const prev = new Map<number, number>([[A, -1]]);
  const queue = [A];
  while (queue.length) {
    const c = queue.shift()!;
    if (c === B) break;
    for (const n of adj.get(c) ?? []) if (!prev.has(n)) { prev.set(n, c); queue.push(n); }
  }
  const path: number[] = [];
  for (let c: number | undefined = B; c !== undefined && c !== -1; c = prev.get(c)) path.unshift(c);
  return { nodes, edges: list, path, A, B };
}

export function ExperienceTissue({ wallRef, cardRef, nameRef, markRef, active, onArrive }: {
  wallRef: RefObject<HTMLElement | null>;
  cardRef: RefObject<HTMLElement | null>;
  nameRef: RefObject<HTMLElement | null>;
  markRef: RefObject<HTMLElement | null>;
  active: number;
  onArrive?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pulseStart = useRef(-1);
  const arriveRef = useRef(onArrive);
  arriveRef.current = onArrive;

  // A step fires a pulse after the copy has started moving.
  useEffect(() => {
    const t = setTimeout(() => { pulseStart.current = performance.now(); }, 180);
    return () => clearTimeout(t);
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const graph = buildGraph();
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, lastPulse = performance.now(), arrived = true;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const wall = wallRef.current, card = cardRef.current, name = nameRef.current, mark = markRef.current;
      if (!wall || !card || !name || !mark) return;
      const w = wall.getBoundingClientRect();
      if (w.bottom < 0 || w.top > window.innerHeight) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (canvas.width !== Math.round(w.width * dpr) || canvas.height !== Math.round(w.height * dpr)) {
        canvas.width = Math.round(w.width * dpr); canvas.height = Math.round(w.height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w.width, w.height);

      const c = card.getBoundingClientRect(), n = name.getBoundingClientRect(), m = mark.getBoundingClientRect();
      const a: Pt = { x: c.right - w.left, y: n.top + n.height / 2 - w.top };
      const b: Pt = { x: m.left - 12 - w.left, y: m.top + m.height / 2 - w.top };
      const span = b.x - a.x;
      if (span < 40) return;
      const t = still ? 0 : now / 1000;

      if (!still && now - lastPulse > IDLE_MS && pulseStart.current < 0) pulseStart.current = now;
      let p = -1;
      if (pulseStart.current >= 0) {
        if (arrived) { arrived = false; lastPulse = now; }
        p = (now - pulseStart.current) / PULSE_MS;
        if (p >= 1) { p = -1; pulseStart.current = -1; arrived = true; lastPulse = now; arriveRef.current?.(); }
      }
      const ease = (x: number) => x * x * (3 - 2 * x);

      // Synapse: spindle of drifting nodes, tallest mid gap.
      const half = Math.min(150, span * 0.8);
      const at = (i: number): Pt => {
        if (i === graph.A) return a;
        if (i === graph.B) return b;
        const g = graph.nodes[i];
        const bulge = Math.sin(Math.PI * g.u);
        return {
          x: a.x + span * g.u + Math.sin(t * g.w + g.ph) * 7,
          y: a.y + (b.y - a.y) * g.u + g.v * bulge * half + Math.cos(t * g.w * 0.8 + g.ph) * 9,
        };
      };
      const P = Array.from({ length: NODES + 2 }, (_, i) => at(i));
      const hops = graph.path.length - 1;
      const head = p >= 0 ? ease(p) * hops : -1;

      ctx.lineWidth = 1;
      for (const [i, j] of graph.edges) {
        const k = graph.path.findIndex((v, idx) => idx < hops && ((v === i && graph.path[idx + 1] === j) || (v === j && graph.path[idx + 1] === i)));
        const lit = k >= 0 && head >= 0 ? Math.max(0, 1 - Math.abs(head - k - 0.5) / 1.2) : 0;
        ctx.strokeStyle = `rgba(255,255,255,${0.22 + lit * 0.6})`;
        ctx.beginPath(); ctx.moveTo(P[i].x, P[i].y); ctx.lineTo(P[j].x, P[j].y); ctx.stroke();
      }
      for (let i = 0; i < NODES + 2; i++) {
        const anchor = i >= NODES;
        const breathe = 0.7 + 0.3 * Math.sin(t * 1.3 + i);
        ctx.shadowColor = 'rgba(255,255,255,0.8)'; ctx.shadowBlur = 6;
        ctx.fillStyle = `rgba(255,255,255,${anchor ? 0.8 : breathe})`;
        ctx.beginPath(); ctx.arc(P[i].x, P[i].y, anchor ? 2 : graph.nodes[i].r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.shadowBlur = 0;
      if (head >= 0) {
        const k = Math.min(hops - 1, Math.floor(head)), f = head - k;
        const s = P[graph.path[k]], e = P[graph.path[k + 1]];
        ctx.shadowColor = '#fff'; ctx.shadowBlur = 14; ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(s.x + (e.x - s.x) * f, s.y + (e.y - s.y) * f, 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [wallRef, cardRef, nameRef, markRef]);

  return (
    <canvas
      ref={canvasRef}
      className="exp-tissue"
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}
