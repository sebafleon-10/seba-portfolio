'use client';

import { useEffect, useRef } from 'react';
import { particleInteraction, FORMATION_PULSE_MS } from '@/lib/particle-state';
import { useParallax } from '@/context/parallax-context';

// ── Seeded PRNG (mulberry32), deterministic particle spawn positions ─────────
function mulberry32(seed: number) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
// Formation slots draw from their own stream so the spawn sequence above
// stays exactly what it was.
const frand = mulberry32(7);

// ── Constants ──────────────────────────────────────────────────────────────────
const TEXT          = 'SEBASTIAN LEON';
const N_TEXT        = 800;
const N_FREE        = 220;
const N_TOTAL       = N_TEXT + N_FREE;
const CONN_R        = 48;   // ambient background connection radius
const LETTER_CONN_R = 22;   // tighter radius inside letter formation
const CELL          = CONN_R;

// ── Text sampling, single line, 2px grid ─────────────────────────────────────
function sampleText(W: number, H: number): Float32Array {
  const ref = document.createElement('canvas').getContext('2d')!;
  ref.font  = `900 100px Arial, "Helvetica Neue", sans-serif`;
  const refW    = Math.max(100, ref.measureText(TEXT).width);
  const fontSize = Math.max(28, Math.min(160, Math.floor((W * 0.82 / refW) * 100)));

  const off = document.createElement('canvas');
  off.width = W; off.height = H;
  const ctx = off.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle    = '#fff';
  ctx.font         = `900 ${fontSize}px Arial, "Helvetica Neue", sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign    = 'center';
  ctx.fillText(TEXT, W / 2, H / 2);

  const data = ctx.getImageData(0, 0, W, H).data;
  const pts: { x: number; y: number }[] = [];
  for (let y = 0; y < H; y += 2)
    for (let x = 0; x < W; x += 2)
      if (data[(y * W + x) * 4 + 3] > 100) pts.push({ x, y });

  for (let i = pts.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pts[i], pts[j]] = [pts[j], pts[i]];
  }

  const sliced = pts.slice(0, N_TEXT);
  const arr    = new Float32Array(N_TEXT * 2);
  for (let i = 0; i < sliced.length; i++) {
    arr[i * 2]     = sliced[i].x;
    arr[i * 2 + 1] = sliced[i].y;
  }
  return arr;
}

// ── Particle type ──────────────────────────────────────────────────────────────
type P = {
  x: number; y: number;
  vx: number; vy: number;
  tx: number; ty: number;
  startX: number; startY: number;
  scatterDelay: number;
  r: number;
  assemblyDelay: number;
  springK: number;
  perpX: number;
  perpY: number;
  startDist: number;
  confused: boolean;
  confusedVx: number;
  confusedVy: number;
  restX: number;
  restY: number;
  buzzPhaseX: number;
  buzzPhaseY: number;
  buzzFreq:   number;
  buzzAmp:    number;
  group:      number;
  // Formation (see particleInteraction.formation). fsel picks who joins,
  // fu/fv is the slot in body space (u along the axis or around the ring,
  // v across it), fring puts the slot on the ring when the shape has one,
  // fm is how far the particle has morphed in (0 ambient, 1 formed).
  fsel: number; fu: number; fv: number; fring: boolean;
  fph: number; fw: number; fdelay: number; fm: number;
};

function makeP(x: number, y: number, tx = -1, ty = -1): P {
  return {
    x, y,
    vx: (rand() * 2 - 1) * 6,
    vy: (rand() * 2 - 1) * 6,
    tx, ty,
    startX: x, startY: y,
    scatterDelay: 0,
    r: 1 + rand() * 2,
    assemblyDelay: 0,
    springK: 0.08,
    perpX: 0, perpY: 0,
    startDist: -1,
    confused: false,
    confusedVx: 0, confusedVy: 0,
    restX: x, restY: y,
    buzzPhaseX: 0, buzzPhaseY: 0, buzzFreq: 0, buzzAmp: 0,
    group: 0,
    ...makeSlot(),
  };
}

// Slots are spread so the spindle has even density (more slots where it is
// tall) with a denser core across it.
function makeSlot() {
  let fu = frand();
  for (let k = 0; k < 8 && frand() > 0.1 + 0.9 * Math.pow(Math.sin(Math.PI * fu), 0.7); k++) fu = frand();
  const side = frand() < 0.5 ? -1 : 1;
  return {
    fsel: frand(), fu, fv: side * Math.pow(frand(), 1.1), fring: frand() < 0.68,
    fph: frand() * Math.PI * 2, fw: 0.35 + frand() * 0.5, fdelay: 0, fm: 0,
  };
}

// Module-level intro gate: the SEBASTIAN LEON neural-network reveal animation
// should only play on a genuine first load of the site, not on client-side
// back-navigation (which remounts this component but does NOT reload this
// module). Once true, subsequent mounts initialize particles directly in
// their settled scattered-cluster state with no replay. A full page reload
// re-evaluates the module and resets this back to false, restoring the
// first-load behavior.
let introHasPlayed = false;

// ── Component ──────────────────────────────────────────────────────────────────
export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const { zoomProgressRef } = useParallax();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W   = window.innerWidth;
    const H   = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width        = W * dpr;
    canvas.height       = H * dpr;
    canvas.style.width  = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    // Particle count: fixed at mount (can't change without reinit)
    // eslint-disable-next-line no-shadow
    const N_TEXT  = W < 768 ? 480 : 800;
    // eslint-disable-next-line no-shadow
    const N_FREE  = W < 768 ? 80  : 220;
    // eslint-disable-next-line no-shadow
    const N_TOTAL = N_TEXT + N_FREE;
    // Spatial hash cell sized for max desktop link distance
    // eslint-disable-next-line no-shadow
    const CELL    = 120;
    // Link distance: mutable so resize handler can update it each frame
    let linkR = W < 768 ? 50 : 120;

    const tgtXY = sampleText(W, H);

    const ps: P[] = [];
    for (let i = 0; i < N_TEXT; i++) {
      const tx = tgtXY[i * 2], ty = tgtXY[i * 2 + 1];
      ps.push(makeP(rand() * W, rand() * H, tx, ty));
    }
    for (let i = 0; i < N_FREE; i++) {
      ps.push(makeP(rand() * W, rand() * H));
    }

    const gW = Math.ceil(W / CELL) + 2;
    const gH = Math.ceil(H / CELL) + 2;
    const cells       = Array.from({ length: gW * gH }, () => [] as number[]);
    const sLines:       number[] = [];
    const sLinesNear:   number[] = [];
    const sLinesFar:    number[] = [];
    const letterLines:  number[] = [];
    const clusterLines: number[] = [];
    const mouseLines:   number[] = [];
    const linesB = [[] as number[], [] as number[], [] as number[], [] as number[]];
    const pProg     = new Float32Array(N_TOTAL);
    const connCount = new Uint8Array(N_TOTAL);

    const ambient: number[] = [];
    const formed:  number[] = [];
    // Formation buffers: body dots (x, y, r, lit), faded non-members, lines.
    const orgDots:     number[] = [];
    const otherDots:   number[] = [];
    const orgLines:    number[] = [];
    const litLines:    number[] = [];
    const otherLines:  number[] = [];
    const fM   = new Float32Array(N_TOTAL);
    const fLit = new Float32Array(N_TOTAL);
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let formWas = false, formClock = 0, formLive = false, formGlobal = 0;
    let formStep = 0, formLean = 1, formKick = false, lastFrame = performance.now();

    // ── Input tracking ─────────────────────────────────────────────────────────
    const mouse = { x: -9999, y: -9999 };
    const onMouseMove  = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    const MOUSE_R = 45;
    const MOUSE_R2 = MOUSE_R * MOUSE_R;

    const onResize = () => { linkR = window.innerWidth < 768 ? 50 : 120; };
    window.addEventListener('resize', onResize, { passive: true });

    // ── Phase state ────────────────────────────────────────────────────────────
    type Phase = 'chaos' | 'assembly' | 'hold' | 'scatter' | 'static';
    const start = performance.now();
    let phase: Phase        = 'chaos';
    let assemblyStart = 0;
    let holdStart     = 0;
    let scatterStart  = 0;
    let staticStart   = 0;
    let smoothGX = -9999, smoothGY = -9999, smoothGInit = false;
    let calmNow = 0;
    let lastScatterTrigger = 0;
    let lastScatterTime    = -99999;

    // If the intro has already played in this module's lifetime, snap the
    // particles directly to the settled state the natural scatter→static
    // transition would have produced. No phase replay, no flash of the
    // formation, no flash of the pre-reveal: the canvas opens at rest.
    if (introHasPlayed) {
      phase = 'static';
      staticStart = start;

      // Replicate the cluster-distribution math from the hold→scatter
      // transition (line block beginning "Generate 4-6 organic cluster centers").
      const numClusters = 4 + Math.floor(rand() * 3);
      const margin = 110, minSep = 230;
      const centers: { x: number; y: number }[] = [];
      for (let attempt = 0; attempt < 600 && centers.length < numClusters; attempt++) {
        const cx = margin + rand() * (W - margin * 2);
        const cy = margin + rand() * (H - margin * 2);
        if (
          centers.every(c => Math.hypot(cx - c.x, cy - c.y) > minSep) &&
          Math.hypot(cx - W / 2, cy - H / 2) > 220
        ) centers.push({ x: cx, y: cy });
      }

      for (let i = 0; i < N_TOTAL; i++) {
        const p       = ps[i];
        const cluster = centers[Math.floor(rand() * centers.length)];
        const angle   = rand() * Math.PI * 2;
        const rx      = 40 + rand() * 240;
        const ry      = 20 + rand() * 120;
        p.x = Math.max(20, Math.min(W - 20, cluster.x + Math.cos(angle) * rx));
        p.y = Math.max(20, Math.min(H - 20, cluster.y + Math.sin(angle) * ry));
        p.vx = 0; p.vy = 0;
        p.restX = p.x; p.restY = p.y;
        // Buzz personality is normally assigned at chaos→assembly. Initialize
        // it here so static-phase ambient buzz matches a first-load run.
        p.buzzPhaseX = Math.random() * Math.PI * 2;
        p.buzzPhaseY = Math.random() * Math.PI * 2;
        p.buzzFreq   = 2 + Math.random() * 4;
        p.buzzAmp    = 1.5 + Math.random() * 1.5;
      }
      for (let i = 0; i < N_TEXT; i++) pProg[i] = 1;
    } else {
      introHasPlayed = true;
    }

    function chaosTick(p: P) {
      p.vx += (Math.random() - 0.5) * 1.5;
      p.vy += (Math.random() - 0.5) * 1.5;
      p.vx *= 0.95; p.vy *= 0.95;
      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (spd > 6) { p.vx = p.vx / spd * 6; p.vy = p.vy / spd * 6; }
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) { p.x = 0; p.vx =  Math.abs(p.vx); }
      if (p.x > W) { p.x = W; p.vx = -Math.abs(p.vx); }
      if (p.y < 0) { p.y = 0; p.vy =  Math.abs(p.vy); }
      if (p.y > H) { p.y = H; p.vy = -Math.abs(p.vy); }
    }

    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      const now     = performance.now();
      const elapsed = now - start;

      // Smooth gravity target (lerp so stat-to-stat migration feels like ~0.8s ease)
      const gt = particleInteraction.gravityTarget;
      const zones = particleInteraction.clearZones;
      if (gt.active) {
        if (!smoothGInit) { smoothGX = gt.x; smoothGY = gt.y; smoothGInit = true; }
        else { smoothGX += (gt.x - smoothGX) * 0.06; smoothGY += (gt.y - smoothGY) * 0.06; }
      } else {
        smoothGInit = false;
      }

      // ── Phase transitions ──────────────────────────────────────────────────
      if (phase === 'chaos' && elapsed >= 1500) {
        phase = 'assembly';
        assemblyStart = now;
        for (let i = 0; i < N_TEXT; i++) {
          const p = ps[i];
          p.assemblyDelay = Math.random() * 600;
          p.springK       = 0.03 + Math.random() * 0.12;
          p.startDist     = -1;
          p.confused      = Math.random() < 0.20;
          // Assign buzz personality now, used later in static phase
          p.buzzPhaseX    = Math.random() * Math.PI * 2;
          p.buzzPhaseY    = Math.random() * Math.PI * 2;
          p.buzzFreq      = 2 + Math.random() * 4;    // 2–6 rad/s
          p.buzzAmp       = 1.5 + Math.random() * 1.5; // 1.5–3 px
          if (p.confused) {
            const a   = Math.random() * Math.PI * 2;
            const spd = 2 + Math.random() * 4;
            p.confusedVx = Math.cos(a) * spd;
            p.confusedVy = Math.sin(a) * spd;
          }
        }
      }

      if (phase === 'assembly' && (now - assemblyStart) >= 1800) {
        phase = 'hold';
        holdStart = now;
        for (let i = 0; i < N_TEXT; i++) {
          if (ps[i].tx >= 0) { ps[i].x = ps[i].tx; ps[i].y = ps[i].ty; ps[i].vx = 0; ps[i].vy = 0; }
        }
      }

      if (phase === 'hold' && (now - holdStart) >= 1500) {
        phase = 'scatter';
        scatterStart = now;

        // Generate 4-6 organic cluster centers distributed across the canvas
        // Keep clusters away from screen center (tagline repulsion zone)
        const numClusters = 4 + Math.floor(rand() * 3);
        const margin = 110, minSep = 230;
        const centers: { x: number; y: number }[] = [];
        for (let attempt = 0; attempt < 600 && centers.length < numClusters; attempt++) {
          const cx = margin + rand() * (W - margin * 2);
          const cy = margin + rand() * (H - margin * 2);
          if (
            centers.every(c => Math.hypot(cx - c.x, cy - c.y) > minSep) &&
            Math.hypot(cx - W / 2, cy - H / 2) > 220
          ) centers.push({ x: cx, y: cy });
        }

        const TRAVEL = 1 / (1 - 0.88); // geometric series: total travel with 0.88 damping
        for (let i = 0; i < N_TOTAL; i++) {
          const p       = ps[i];
          const isText  = i < N_TEXT;
          const cluster = centers[Math.floor(rand() * centers.length)];
          const angle   = rand() * Math.PI * 2;
          const rx      = 40 + rand() * 240;  // wider X spread: 40–280px
          const ry      = 20 + rand() * 120;  // shallower Y spread: 20–140px
          const targetX = Math.max(20, Math.min(W - 20, cluster.x + Math.cos(angle) * rx));
          const targetY = Math.max(20, Math.min(H - 20, cluster.y + Math.sin(angle) * ry));
          p.vx = (targetX - p.x) / TRAVEL;
          p.vy = (targetY - p.y) / TRAVEL;
          p.scatterDelay = isText ? rand() * 200 : 0;
        }
      }

      if (phase === 'scatter' && (now - scatterStart) >= 1200) {
        phase = 'static';
        staticStart = now;
        for (const p of ps) {
          p.vx = 0; p.vy = 0;
          p.restX = p.x; p.restY = p.y;
        }
      }

      // ── Formation edges ────────────────────────────────────────────────────
      const fo = particleInteraction.formation;
      const dtFrame = Math.min(50, now - lastFrame);
      lastFrame = now;
      if (phase === 'static') {
        if (fo.active && !formWas) {
          // Morph in: nearer particles leave first so it reads as streams.
          formClock = 0;
          const cx = (fo.ax + fo.bx) / 2, cy = (fo.ay + fo.by) / 2;
          for (const p of ps) p.fdelay = still ? -1200 : Math.hypot(p.x - cx, p.y - cy) / W * 1100 + Math.random() * 250;
        } else if (!fo.active && formWas && !still &&
                   !particleInteraction.gravityBoost && now - lastScatterTime > 900) {
          // Morph out: the body leaves as a blast back into the ambient flow.
          particleInteraction.scatterTrigger = Date.now();
        }
        formWas = fo.active;
        // The morph waits for an orb reveal to finish: it is the third beat.
        if (fo.active && !particleInteraction.gravityBoost && now - lastScatterTime > 900) formClock += dtFrame;
        formGlobal += ((fo.active ? 1 : 0) - formGlobal) * 0.06;
        if (formGlobal < 0.001) formGlobal = 0;
        formKick = fo.active && fo.step !== formStep && !still;
        formStep = fo.step;
        formLean += ([1, 0.78, 1.28][fo.step % 3] - formLean) * 0.04;
      }
      const othersFade = fo.share < 1 ? formGlobal : 0;
      // Brightness front, -0.1 to 1.1 along the axis while a pulse runs.
      const pulseK = fo.pulseAt > 0 ? (now - fo.pulseAt) / FORMATION_PULSE_MS : -1;
      const front  = pulseK >= 0 && pulseK <= 1 ? -0.1 + 1.2 * pulseK * pulseK * (3 - 2 * pulseK) : -9;
      const tForm  = now / 1000;
      const breath = 1 + 0.07 * Math.sin(tForm * 0.9);
      let formAny = false;

      if (phase === 'static' && particleInteraction.scatterTrigger !== lastScatterTrigger) {
        lastScatterTrigger = particleInteraction.scatterTrigger;
        lastScatterTime = now;

        const numClusters = 4 + Math.floor(Math.random() * 3);
        const margin  = 100;
        const minSep  = 200;
        const centers: { x: number; y: number }[] = [];
        for (let attempt = 0; attempt < 500 && centers.length < numClusters; attempt++) {
          const cx = margin + Math.random() * (W - margin * 2);
          const cy = margin + Math.random() * (H - margin * 2);
          const inClearZone = zones.some(cz => cz.active &&
            cx > cz.x - 120 && cx < cz.x + cz.w + 120 &&
            cy > cz.y - 120 && cy < cz.y + cz.h + 120);
          if (
            !inClearZone &&
            centers.every(c => Math.hypot(cx - c.x, cy - c.y) > minSep) &&
            Math.hypot(cx - W / 2, cy - H / 2) > 260
          ) centers.push({ x: cx, y: cy });
        }
        // A zone that covers most of the viewport can reject every attempt;
        // never let the loop below index an empty array.
        if (centers.length === 0) centers.push({ x: W / 2, y: margin });

        const TRAVEL = 1 / (1 - 0.97);
        for (const p of ps) {
          const cluster = centers[Math.floor(Math.random() * centers.length)];
          const angle   = Math.random() * Math.PI * 2;
          const rx      = 120 + Math.random() * 360;
          const ry      = 120 + Math.random() * 360;
          const targetX = Math.max(20, Math.min(W - 20, cluster.x + Math.cos(angle) * rx));
          const targetY = Math.max(20, Math.min(H - 20, cluster.y + Math.sin(angle) * ry));
          p.vx = (targetX - p.x) / TRAVEL;
          p.vy = (targetY - p.y) / TRAVEL;
        }
      }

      const sinceScatterFrame = now - lastScatterTime;
      const isBlastingFrame   = sinceScatterFrame < 900;

      // ── Clear draw buffers ─────────────────────────────────────────────────
      ambient.length = 0;
      formed.length  = 0;
      orgDots.length = 0;
      otherDots.length = 0;

      // ── Update particles ───────────────────────────────────────────────────
      for (let i = 0; i < N_TOTAL; i++) {
        const p = ps[i];

        if (phase === 'chaos') {
          chaosTick(p);
          ambient.push(p.x, p.y, p.r);

        } else if (phase === 'assembly') {
          if (p.tx < 0) {
            chaosTick(p);
            ambient.push(p.x, p.y, p.r);
          } else {
            const localTime     = (now - assemblyStart) - p.assemblyDelay;
            const effectiveTime = p.confused ? localTime - 200 : localTime;

            if (localTime < 0) {
              chaosTick(p);
              ambient.push(p.x, p.y, p.r);
            } else if (effectiveTime < 0) {
              p.x += p.confusedVx; p.y += p.confusedVy;
              if (p.x < 0) { p.x = 0; p.confusedVx =  Math.abs(p.confusedVx); }
              if (p.x > W) { p.x = W; p.confusedVx = -Math.abs(p.confusedVx); }
              if (p.y < 0) { p.y = 0; p.confusedVy =  Math.abs(p.confusedVy); }
              if (p.y > H) { p.y = H; p.confusedVy = -Math.abs(p.confusedVy); }
              formed.push(p.x, p.y);
            } else {
              if (p.startDist < 0) {
                const dx = p.tx - p.x, dy = p.ty - p.y;
                p.startDist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
                const nx = dx / p.startDist, ny = dy / p.startDist;
                const mag = (Math.random() * 2 - 1) * p.startDist * 0.35;
                p.perpX = -ny * mag; p.perpY = nx * mag;
                p.vx = 0; p.vy = 0;
              }
              const dxT     = p.tx - p.x, dyT = p.ty - p.y;
              const dist     = Math.sqrt(dxT * dxT + dyT * dyT);
              const progress = Math.max(0, 1 - dist / p.startDist);
              const decay    = (1 - progress) * (1 - progress);
              const effTx = p.tx + p.perpX * decay;
              const effTy = p.ty + p.perpY * decay;
              p.vx += (effTx - p.x) * p.springK;
              p.vy += (effTy - p.y) * p.springK;
              p.vx *= 0.85; p.vy *= 0.85;
              p.x  += p.vx;  p.y  += p.vy;
              formed.push(p.x, p.y);
            }
          }

        } else if (phase === 'hold') {
          // Name stays perfectly still, crisp, no buzz
          if (p.tx >= 0) {
            formed.push(p.x, p.y);
          } else {
            chaosTick(p);
            ambient.push(p.x, p.y, p.r);
          }

        } else if (phase === 'scatter') {
          const sinceS = now - scatterStart;
          if (p.tx >= 0 && sinceS < p.scatterDelay) {
            formed.push(p.x, p.y);
          } else {
            if (p.tx >= 0) p.tx = -1;
            p.vx *= 0.88; p.vy *= 0.88;
            p.x  += p.vx;  p.y  += p.vy;
            if (p.x < 0) p.x += W; else if (p.x > W) p.x -= W;
            if (p.y < 0) p.y += H; else if (p.y > H) p.y -= H;
            ambient.push(p.x, p.y, p.r);
          }

        } else {
          // ── Static phase, ambient drift, always-on across the full page ────

          const t        = (now - staticStart) / 1000;
          const buzzRamp = Math.min(1, (now - staticStart) / 700);
          const bx = Math.sin(t * p.buzzFreq       + p.buzzPhaseX) * p.buzzAmp * buzzRamp;
          const by = Math.sin(t * p.buzzFreq * 1.3 + p.buzzPhaseY) * p.buzzAmp * buzzRamp;

          // Formation: m is how far this particle has morphed into the body,
          // (slotX, slotY) where it lives there. Everything below is scaled
          // by m, so with no formation the frame is what it always was.
          let m = 0, slotX = 0, slotY = 0, lit = 0;
          const member = p.fsel < fo.share;
          if ((fo.active || formLive) && member) {
            if (fo.active) {
              const k = (formClock - p.fdelay) / 1200;
              m = k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k);
            } else {
              m = p.fm * 0.86;
              if (m < 0.002) m = 0;
            }
            p.fm = m;
            if (m > 0) {
              formAny = true;
              const span = fo.bx - fo.ax;
              if (fo.shape === 'ring' && p.fring) {
                // A band orbiting the stage content, drifting round it.
                // Walk a rounded rectangle at uniform speed so the band has
                // even density (fph doubles as a uniform perimeter seed).
                const hw = fo.box.w / 2 + 64 + p.fv * 30, hh = fo.box.h / 2 + 92 + p.fv * 30;
                const cr = Math.min(hw, hh) * 0.8;
                const sx = 2 * (hw - cr), sy = 2 * (hh - cr), arc = Math.PI * cr / 2;
                const per = 2 * sx + 2 * sy + 4 * arc;
                let d = ((p.fph / (Math.PI * 2) + tForm * 0.004 * (p.fv > 0 ? 1 : 0.6)) % 1) * per;
                let qx = 0, qy = 0;
                // top edge, then each corner and edge clockwise
                const corner = (ccx: number, ccy: number, a0: number, dd: number) => {
                  const a = a0 + dd / cr; qx = ccx + Math.cos(a) * cr; qy = ccy + Math.sin(a) * cr;
                };
                if (d < sx) { qx = -hw + cr + d; qy = -hh; }
                else if ((d -= sx) < arc) corner(hw - cr, -hh + cr, -Math.PI / 2, d);
                else if ((d -= arc) < sy) { qx = hw; qy = -hh + cr + d; }
                else if ((d -= sy) < arc) corner(hw - cr, hh - cr, 0, d);
                else if ((d -= arc) < sx) { qx = hw - cr - d; qy = hh; }
                else if ((d -= sx) < arc) corner(-hw + cr, hh - cr, Math.PI / 2, d);
                else if ((d -= arc) < sy) { qx = -hw; qy = hh - cr - d; }
                else corner(-hw + cr, -hh + cr, Math.PI, d - sy);
                slotX = fo.box.x + fo.box.w / 2 + qx;
                slotY = fo.box.y + fo.box.h / 2 + qy;
              } else {
                const u = Math.pow(p.fu, formLean);
                const bulge = Math.pow(Math.sin(Math.PI * u), 0.7);
                const d = u - front;
                lit = d > -0.09 && d < 0.09 ? (1 - Math.abs(d) / 0.09) * m : 0;
                slotX = fo.ax + span * u + Math.sin(tForm * p.fw + p.fph) * 5;
                slotY = fo.ay + (fo.by - fo.ay) * u
                      + p.fv * bulge * fo.hmax * breath * (1 + lit * 0.22)
                      + Math.cos(tForm * p.fw * 0.8 + p.fph) * 6;
              }
              if (formKick && m > 0.5) {
                // A step convulses the body: a swirl the slot spring reins in.
                const cx = (fo.ax + fo.bx) / 2, cy = (fo.ay + fo.by) / 2;
                const dx = p.x - cx, dy = p.y - cy;
                const d = Math.hypot(dx, dy) || 1;
                const a = 3 + Math.random() * 5;
                p.vx += (-dy / d) * a + (dx / d) * 2;
                p.vy += ( dx / d) * a + (dy / d) * 2;
              }
            }
          }
          fM[i] = m; fLit[i] = lit;
          const free = 1 - m;

          // Mouse: repulse (work section hover) or attract (hero)
          if (particleInteraction.repulse) {
            const dxM = mouse.x - p.x, dyM = mouse.y - p.y;
            const d2  = dxM * dxM + dyM * dyM;
            if (d2 < 80 * 80 && d2 > 1) {
              const d = Math.sqrt(d2);
              p.vx -= (dxM / d) * (1 - d / 80) * 0.3;
              p.vy -= (dyM / d) * (1 - d / 80) * 0.3;
            }
          } else {
            const dxM = mouse.x - p.x, dyM = mouse.y - p.y;
            const d2  = dxM * dxM + dyM * dyM;
            if (d2 < 150 * 150 && d2 > 1) {
              const d = Math.sqrt(d2);
              p.vx += (dxM / d) * (1 - d / 150) * 0.6;
              p.vy += (dyM / d) * (1 - d / 150) * 0.6;
            }
          }

          // Text repulsion zone, keeps particles clear of "ATHLETE. ANALYST. BUILDER."
          {
            const repX = window.innerWidth * 0.42;
            const repY = window.innerHeight * 0.50;
            const dxR  = p.x - repX;
            const dyR  = p.y - repY;
            const dist = Math.sqrt(dxR * dxR + dyR * dyR);
            if (dist < 280 && dist > 0) {
              const force = (280 - dist) / 280 * 3.0 * free;
              p.vx += (dxR / dist) * force;
              p.vy += (dyR / dist) * force;
            }
          }

          const sinceScatter = now - lastScatterTime;
          const isBlasting   = sinceScatter < 900;

          // Clearing zones (home Experience text card and logo mark). A soft outward push near
          // and inside the rect, plus rest-point migration so the rest spring
          // stops dragging particles back under the copy. A force alone only
          // wins about 60px against the 0.04 spring.
          // Gravity eases off within 140px of a zone so an anchor that is also
          // a zone (the Experience mark) gets a loose halo, not a packed seam.
          let zoneEase = 1;
          if (!isBlasting && m < 0.5) for (const cz of zones) {
            if (!cz.active) continue;
            const M = 60;
            const dl = p.x - cz.x, dr = cz.x + cz.w - p.x;
            const dt = p.y - cz.y, db = cz.y + cz.h - p.y;
            const sdf = Math.min(dl, dr, dt, db); // >0 inside, <0 outside (edge distance)
            zoneEase = Math.min(zoneEase, Math.max(0, Math.min(1, (-sdf - 20) / 120)));
            if (sdf > -M) {
              // Outward normal along the nearest edge
              let nx = 0, ny = 0;
              const m = Math.min(dl, dr, dt, db);
              if (m === dl) nx = -1; else if (m === dr) nx = 1;
              else if (m === dt) ny = -1; else ny = 1;
              const force = (1 - Math.max(0, -sdf) / M) * 2.5;
              p.vx += nx * force;
              p.vy += ny * force;
            }
            // Rest points inside the zone relocate once to a jittered spot
            // 60 to 260px past the nearest edge; the spring glides the
            // particle there. Stepping them to the edge instead piles the
            // network into a seam along the border.
            const rl = p.restX - cz.x, rr = cz.x + cz.w - p.restX;
            const rt = p.restY - cz.y, rb = cz.y + cz.h - p.restY;
            if (rl > 0 && rr > 0 && rt > 0 && rb > 0) {
              const out = 60 + Math.random() * 200;
              const cands: [number, number, number][] = [
                [rl, cz.x - out,          p.restY],
                [rr, cz.x + cz.w + out,   p.restY],
                [rt, p.restX,             cz.y - out],
                [rb, p.restX,             cz.y + cz.h + out],
              ];
              cands.sort((a, b) => a[0] - b[0]);
              for (const [, nx, ny] of cands) {
                if (nx >= 10 && nx <= W - 10 && ny >= 10 && ny <= H - 10) {
                  p.restX = nx; p.restY = ny; break;
                }
              }
            }
          }

          // Spring toward rest + buzz
          if (!particleInteraction.gravityBoost && !isBlasting) {
            p.vx += (p.restX * free + slotX * m + bx - p.x) * 0.04;
            p.vy += (p.restY * free + slotY * m + by - p.y) * 0.04;
          }

          // Direct gravity pull toward active target
          if (gt.active && !isBlasting) {
            const dx   = gt.x - p.x;
            const dy   = gt.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
              const t     = Math.max(0, 1 - dist / 1200);
              const force = t * t * (particleInteraction.gravityBoost ? 20.0 : 4.0 * zoneEase * free);
              p.vx += (dx / dist) * force;
              p.vy += (dy / dist) * force;
              p.vx *= 0.96;
              p.vy *= 0.96;
              const cap = particleInteraction.gravityBoost ? 18 : 8;
              p.vx = Math.max(-cap, Math.min(cap, p.vx));
              p.vy = Math.max(-cap, Math.min(cap, p.vy));
            }
          }

          // Zoom parallax scroll forces, center clearing (suppress past 95% so particles settle)
          const zp = zoomProgressRef.current;
          if (zp > 0.02 && zp < 0.95) {
            const dxC  = p.x - W / 2;
            const dyC  = p.y - H / 2;
            const angle = Math.atan2(dyC, dxC);
            const t     = (zp - 0.02) / 0.98;
            const force = t * t * 12.0;
            p.vx += Math.cos(angle) * force;
            p.vy += Math.sin(angle) * force;
          }

          const damp = isBlasting ? 0.97 : 0.92;
          const cap  = isBlasting ? 28   : 20;
          p.vx *= damp; p.vy *= damp;
          p.vx = Math.max(-cap, Math.min(cap, p.vx));
          p.vy = Math.max(-cap, Math.min(cap, p.vy));
          p.x  += p.vx;  p.y  += p.vy;

          if (p.x < 0)  { p.x = 0; p.vx =  Math.abs(p.vx); }
          if (p.x > W)  { p.x = W; p.vx = -Math.abs(p.vx); }
          if (p.y < 0)  p.y += H;
          if (p.y > H)  p.y -= H;

          if (m > 0.15) orgDots.push(p.x, p.y, p.r, lit);
          else if (!member && othersFade > 0) otherDots.push(p.x, p.y, p.r);
          else ambient.push(p.x, p.y, p.r);
        }
      }
      formLive = formAny;

      // ── Connection lines (spatial hash) ────────────────────────────────────
      for (const c of cells) c.length = 0;
      sLines.length       = 0;
      sLinesNear.length   = 0;
      sLinesFar.length    = 0;
      letterLines.length  = 0;
      clusterLines.length = 0;
      mouseLines.length   = 0;
      orgLines.length     = 0;
      litLines.length     = 0;
      otherLines.length   = 0;
      for (const b of linesB) b.length = 0;
      connCount.fill(0);

      if (phase === 'assembly') {
        for (let i = 0; i < N_TEXT; i++) {
          const p = ps[i];
          pProg[i] = (p.tx >= 0 && p.startDist > 0)
            ? Math.max(0, 1 - Math.hypot(p.tx - p.x, p.ty - p.y) / p.startDist)
            : 0;
        }
        for (let i = N_TEXT; i < N_TOTAL; i++) pProg[i] = 0;
      }

      for (let i = 0; i < N_TOTAL; i++) {
        const p  = ps[i];
        const gx = Math.max(0, Math.min(gW - 1, Math.floor(p.x / CELL)));
        const gy = Math.max(0, Math.min(gH - 1, Math.floor(p.y / CELL)));
        cells[gy * gW + gx].push(i);
      }

      for (let i = 0; i < N_TOTAL; i++) {
        const a  = ps[i];
        const gx = Math.max(0, Math.min(gW - 1, Math.floor(a.x / CELL)));
        const gy = Math.max(0, Math.min(gH - 1, Math.floor(a.y / CELL)));
        for (let dgy = -1; dgy <= 1; dgy++) {
          for (let dgx = -1; dgx <= 1; dgx++) {
            const nx = gx + dgx, ny = gy + dgy;
            if (nx < 0 || nx >= gW || ny < 0 || ny >= gH) continue;
            for (const j of cells[ny * gW + nx]) {
              if (j <= i) continue;
              const b  = ps[j];
              const dx = a.x - b.x, dy = a.y - b.y;
              const d2 = dx * dx + dy * dy;
              const effectiveLinkR = isBlastingFrame ? Math.min(160, linkR * 1.4) : linkR;
              if (d2 >= effectiveLinkR * effectiveLinkR) continue;

              if (phase === 'assembly') {
                const fadeAmt = (pProg[i] + pProg[j]) * 0.5;
                if (fadeAmt >= 0.95) continue;
                linesB[Math.min(3, Math.floor(fadeAmt * 4))].push(a.x, a.y, b.x, b.y);
              } else if (phase === 'hold') {
                const aText = i < N_TEXT && ps[i].tx >= 0;
                const bText = j < N_TEXT && ps[j].tx >= 0;
                if (aText && bText) {
                  if (d2 < LETTER_CONN_R * LETTER_CONN_R)
                    letterLines.push(a.x, a.y, b.x, b.y);
                } else {
                  sLines.push(a.x, a.y, b.x, b.y);
                }
              } else if (fM[i] > 0.6 && fM[j] > 0.6) {
                // Inside the body the mesh is fine: short links only.
                if (d2 >= 38 * 38 || connCount[i] >= 4 || connCount[j] >= 4) continue;
                connCount[i]++; connCount[j]++;
                if (fLit[i] + fLit[j] > 0.5) litLines.push(a.x, a.y, b.x, b.y);
                else                         orgLines.push(a.x, a.y, b.x, b.y);
              } else if (othersFade > 0 && (ps[i].fsel >= fo.share || ps[j].fsel >= fo.share)) {
                if (othersFade > 0.97 || connCount[i] >= 3 || connCount[j] >= 3) continue;
                connCount[i]++; connCount[j]++;
                otherLines.push(a.x, a.y, b.x, b.y);
              } else {
                const blastCap = isBlastingFrame ? 5 : 3;
                if (connCount[i] >= blastCap || connCount[j] >= blastCap) continue;
                // Skip lines whose midpoint passes through the text repulsion zone
                const mx  = (a.x + b.x) * 0.5, my = (a.y + b.y) * 0.5;
                const mdx = mx - window.innerWidth * 0.42;
                const mdy = my - window.innerHeight * 0.50;
                if (mdx * mdx + mdy * mdy < 280 * 280) continue;
                connCount[i]++; connCount[j]++;
                const splitR = isBlastingFrame ? effectiveLinkR * 0.5 : linkR * 0.5;
                const HALF2  = splitR * splitR;
                if (d2 < HALF2) sLinesNear.push(a.x, a.y, b.x, b.y);
                else             sLinesFar.push(a.x, a.y, b.x, b.y);
                // Brighter connections inside the gravity cluster
                if (smoothGInit) {
                  const CL2 = 155 * 155;
                  const daG = (a.x - smoothGX) * (a.x - smoothGX) + (a.y - smoothGY) * (a.y - smoothGY);
                  const dbG = (b.x - smoothGX) * (b.x - smoothGX) + (b.y - smoothGY) * (b.y - smoothGY);
                  if (daG < CL2 && dbG < CL2) clusterLines.push(a.x, a.y, b.x, b.y);
                }
                // Mouse proximity: tag for white highlight overlay
                if (mouse.x !== -9999) {
                  const daM = (a.x - mouse.x) * (a.x - mouse.x) + (a.y - mouse.y) * (a.y - mouse.y);
                  const dbM = (b.x - mouse.x) * (b.x - mouse.x) + (b.y - mouse.y) * (b.y - mouse.y);
                  if (daM < MOUSE_R2 || dbM < MOUSE_R2) {
                    mouseLines.push(a.x, a.y, b.x, b.y);
                  }
                }
              }
            }
          }
        }
      }

      // ── Draw connections ───────────────────────────────────────────────────
      // Calm: a section can ask the network to recede. Eased, and released
      // during an orb-reveal blast so the reveal still lands at full strength.
      calmNow += ((isBlastingFrame ? 0 : particleInteraction.calm) - calmNow) * 0.05;
      const fade      = 1 - calmNow * 0.6;
      const lineAlpha = 1 - calmNow * 0.7;

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth   = 0.5;

      if (phase === 'assembly') {
        const bucketAlphas = [0.07, 0.048, 0.022, 0.007];
        for (let b = 0; b < 4; b++) {
          const buf = linesB[b];
          if (buf.length === 0) continue;
          ctx.globalAlpha = bucketAlphas[b];
          ctx.beginPath();
          for (let k = 0; k < buf.length; k += 4) {
            ctx.moveTo(buf[k], buf[k + 1]);
            ctx.lineTo(buf[k + 2], buf[k + 3]);
          }
          ctx.stroke();
        }
      } else if (phase === 'hold') {
        if (letterLines.length > 0) {
          ctx.globalAlpha = 0.10;
          ctx.beginPath();
          for (let k = 0; k < letterLines.length; k += 4) {
            ctx.moveTo(letterLines[k], letterLines[k + 1]);
            ctx.lineTo(letterLines[k + 2], letterLines[k + 3]);
          }
          ctx.stroke();
        }
        if (sLines.length > 0) {
          ctx.globalAlpha = 0.07;
          ctx.beginPath();
          for (let k = 0; k < sLines.length; k += 4) {
            ctx.moveTo(sLines[k], sLines[k + 1]);
            ctx.lineTo(sLines[k + 2], sLines[k + 3]);
          }
          ctx.stroke();
        }
      } else if (lineAlpha > 0) {
        ctx.strokeStyle = '#ffffff';
        if (sLinesNear.length > 0) {
          ctx.globalAlpha = 0.30 * lineAlpha;
          ctx.beginPath();
          for (let k = 0; k < sLinesNear.length; k += 4) {
            ctx.moveTo(sLinesNear[k], sLinesNear[k + 1]);
            ctx.lineTo(sLinesNear[k + 2], sLinesNear[k + 3]);
          }
          ctx.stroke();
        }
        if (sLinesFar.length > 0) {
          ctx.globalAlpha = 0.17 * lineAlpha;
          ctx.beginPath();
          for (let k = 0; k < sLinesFar.length; k += 4) {
            ctx.moveTo(sLinesFar[k], sLinesFar[k + 1]);
            ctx.lineTo(sLinesFar[k + 2], sLinesFar[k + 3]);
          }
          ctx.stroke();
        }
        if (clusterLines.length > 0) {
          ctx.globalAlpha = 0.45 * lineAlpha;
          ctx.beginPath();
          for (let k = 0; k < clusterLines.length; k += 4) {
            ctx.moveTo(clusterLines[k], clusterLines[k + 1]);
            ctx.lineTo(clusterLines[k + 2], clusterLines[k + 3]);
          }
          ctx.stroke();
        }
        const lineSets: [number[], number][] = [
          [orgLines, 0.2], [litLines, 0.95], [otherLines, 0.2 * (1 - othersFade)],
        ];
        for (const [buf, alpha] of lineSets) {
          if (buf.length === 0) continue;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          for (let k = 0; k < buf.length; k += 4) {
            ctx.moveTo(buf[k], buf[k + 1]);
            ctx.lineTo(buf[k + 2], buf[k + 3]);
          }
          ctx.stroke();
        }
        if (mouseLines.length > 0) {
          ctx.strokeStyle = '#ffffff';
          ctx.globalAlpha = 1.0;
          ctx.beginPath();
          for (let k = 0; k < mouseLines.length; k += 4) {
            ctx.moveTo(mouseLines[k], mouseLines[k + 1]);
            ctx.lineTo(mouseLines[k + 2], mouseLines[k + 3]);
          }
          ctx.stroke();
        }
      }

      // ── Draw particles ─────────────────────────────────────────────────────
      ctx.fillStyle   = '#ffffff';
      ctx.shadowColor = '#ffffff';

      ctx.shadowBlur  = 8 * (1 - calmNow);
      ctx.globalAlpha = 0.72 * fade;
      ctx.beginPath();
      for (let k = 0; k < ambient.length; k += 3) {
        if (ambient[k + 2] < 2) {
          ctx.moveTo(ambient[k] + ambient[k + 2], ambient[k + 1]);
          ctx.arc(ambient[k], ambient[k + 1], ambient[k + 2], 0, Math.PI * 2);
        }
      }
      ctx.fill();

      ctx.shadowBlur  = 12 * (1 - calmNow);
      ctx.globalAlpha = 0.92 * fade;
      ctx.beginPath();
      for (let k = 0; k < ambient.length; k += 3) {
        if (ambient[k + 2] >= 2) {
          ctx.moveTo(ambient[k] + ambient[k + 2], ambient[k + 1]);
          ctx.arc(ambient[k], ambient[k + 1], ambient[k + 2], 0, Math.PI * 2);
        }
      }
      ctx.fill();

      if (otherDots.length > 0) {
        ctx.shadowBlur  = 0;
        ctx.globalAlpha = 0.72 * (1 - othersFade);
        ctx.beginPath();
        for (let k = 0; k < otherDots.length; k += 3) {
          ctx.moveTo(otherDots[k] + otherDots[k + 2], otherDots[k + 1]);
          ctx.arc(otherDots[k], otherDots[k + 1], otherDots[k + 2], 0, Math.PI * 2);
        }
        ctx.fill();
      }
      if (orgDots.length > 0) {
        // The body: crisp dots, then the pulse front on top.
        ctx.shadowBlur  = 3;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        for (let k = 0; k < orgDots.length; k += 4) {
          const r = orgDots[k + 2] * 0.62;
          ctx.moveTo(orgDots[k] + r, orgDots[k + 1]);
          ctx.arc(orgDots[k], orgDots[k + 1], r, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.shadowBlur  = 14;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        for (let k = 0; k < orgDots.length; k += 4) {
          const l = orgDots[k + 3];
          if (l <= 0.05) continue;
          const r = orgDots[k + 2] * (0.62 + l * 0.9);
          ctx.moveTo(orgDots[k] + r, orgDots[k + 1]);
          ctx.arc(orgDots[k], orgDots[k + 1], r, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      if (formed.length > 0) {
        ctx.shadowBlur  = 4;
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        for (let k = 0; k < formed.length; k += 2) {
          ctx.moveTo(formed[k] + 2.5, formed[k + 1]);
          ctx.arc(formed[k], formed[k + 1], 2.5, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      ctx.shadowBlur  = 0;
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'block',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
