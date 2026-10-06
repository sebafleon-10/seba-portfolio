'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { particleInteraction, type ClearZone, type FormationShape } from '@/lib/particle-state';

// Section-level hooks that drive the particle canvas from a DOM element.
//
// useGravityAnchor: while the element's center is on screen, the network is
// pulled toward it (same semantics as the rAF loops in who-section.tsx and
// work-section.tsx, which predate this hook). The orb reveal's gravityBoost
// always wins during its 900ms converge.
//
// useClearZone: while the element is on screen, its bounding rect (plus pad)
// is published as a zone the static-phase particles keep clear of. The
// canvas pushes particles out, migrates their rest points, and keeps scatter
// clusters away from it. Used for body copy that has no opaque surface.

function centerOnScreen(r: DOMRect) {
  const cy = r.top + r.height / 2;
  return cy > 0 && cy < window.innerHeight;
}

export function useGravityAnchor(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    let raf = 0;
    let wasInView = false;
    const loop = () => {
      const el = ref.current;
      if (el) {
        const r = el.getBoundingClientRect();
        if (centerOnScreen(r)) {
          if (!particleInteraction.gravityBoost) {
            particleInteraction.gravityTarget.active = true;
            particleInteraction.gravityTarget.x = r.left + r.width  / 2;
            particleInteraction.gravityTarget.y = r.top  + r.height / 2;
          }
          wasInView = true;
        } else if (wasInView) {
          particleInteraction.gravityTarget.active = false;
          wasInView = false;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      particleInteraction.gravityTarget.active = false;
    };
  }, [ref]);
}

// useCalm: while the element covers the viewport center, the network dims by
// `amount` (0 to 1). For sections whose anchor has no opaque surface, where
// the whole network would otherwise sit bright beside the content.
export function useCalm(ref: RefObject<HTMLElement | null>, amount = 1) {
  useEffect(() => {
    let raf = 0;
    let mine = false;
    const loop = () => {
      const el = ref.current;
      if (el) {
        const r = el.getBoundingClientRect();
        const mid = window.innerHeight / 2;
        const covers = r.top < mid && r.bottom > mid;
        if (covers) { particleInteraction.calm = amount; mine = true; }
        else if (mine) { particleInteraction.calm = 0; mine = false; }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      if (mine) particleInteraction.calm = 0;
    };
  }, [ref, amount]);
}

export function useClearZone(ref: RefObject<HTMLElement | null>, pad = 40) {
  useEffect(() => {
    let raf = 0;
    const cz: ClearZone = { x: -9999, y: -9999, w: 0, h: 0, active: false };
    particleInteraction.clearZones.push(cz);
    const loop = () => {
      const el = ref.current;
      if (el) {
        const r = el.getBoundingClientRect();
        const inView = r.bottom > 0 && r.top < window.innerHeight;
        if (inView) {
          cz.x = r.left - pad;
          cz.y = r.top  - pad;
          cz.w = r.width  + pad * 2;
          cz.h = r.height + pad * 2;
          cz.active = true;
        } else {
          cz.active = false;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      cz.active = false;
      const zones = particleInteraction.clearZones;
      const i = zones.indexOf(cz);
      if (i !== -1) zones.splice(i, 1);
    };
  }, [ref, pad]);
}

// useFormation: while the section is in its window, the network morphs into
// the shape whose geometry `measure` returns. Desktop only unless `phones` is
// set: under 768 most sections have no room for a shape.
//
// Windows (`gate`):
//   'pinned' is a pinned stage (home Experience): from just before its top
//            meets the viewport top until `exitAt` of its scroll range (the
//            last role sits at exactly 1, so the default lets the stage lift a
//            little first).
//   'line'   holds while the section contains the line at 75% of the viewport
//            height, the orb reveal's own fire line, so neighbouring sections
//            never overlap and the next one's reveal starts as this one lets go.
//
// Several sections use this hook and share one formation, so each call claims
// it under its `id` and only ever releases it if it still owns it. The canvas
// turns a release into a scatter blast, and an owner change between two
// `handoff` shapes into a straight shape-to-shape morph.
//
// `step` is the section's discrete state (the canvas kicks the shape when it
// changes) and `lean` its continuous bias; both are written only while owned.
export type FormationGeometry = {
  ax: number; ay: number; bx: number; by: number;
  box?: { x: number; y: number; w: number; h: number };
  // rim: pivot, radius, clip angles (radians clockwise from straight up)
  cx?: number; cy?: number; R?: number; a0?: number; a1?: number;
};

export type FormationOptions = {
  id: string;
  shape: FormationShape;
  share: number;
  hmax: number;
  gate: 'pinned' | 'line';
  exitAt?: number;
  handoff?: boolean;
  lean?: number;
  // Hold the shape under 768 too (home Projects). Off by default.
  phones?: boolean;
};

export function ownsFormation(id: string) {
  const fo = particleInteraction.formation;
  return fo.active && fo.owner === id;
}

export function useFormation(
  sectionRef: RefObject<HTMLElement | null>,
  measure: () => FormationGeometry | null,
  opts: FormationOptions,
  step: number,
) {
  const { id, shape, share, hmax, gate, exitAt = 1.04, handoff = false, lean = 1, phones = false } = opts;
  // Read inside the loop without restarting it on every step.
  const live = useRef({ step, lean, measure });
  useEffect(() => { live.current = { step, lean, measure }; });
  useEffect(() => {
    let raf = 0;
    const fo = particleInteraction.formation;
    let inside = false;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const s = sectionRef.current;
      if (!s) return;
      const vh = window.innerHeight;
      const r = s.getBoundingClientRect();
      let inWindow: boolean;
      if (gate === 'pinned') {
        const range = r.height - vh;
        const progress = range > 0 ? -r.top / range : 0;
        inWindow = r.top <= vh * 0.08 && progress < exitAt;
      } else {
        inWindow = r.top <= vh * 0.75 && r.bottom > vh * 0.75;
      }
      const g = (phones || window.innerWidth >= 768) && inWindow ? live.current.measure() : null;
      const ok = !!g && g.bx - g.ax > 40;
      const entered = ok && !inside;
      inside = ok;
      if (ok && (entered || !fo.active || fo.owner === id)) {
        fo.owner = id; fo.handoff = handoff;
        fo.shape = shape; fo.share = share; fo.hmax = hmax;
        fo.ax = g.ax; fo.ay = g.ay; fo.bx = g.bx; fo.by = g.by;
        if (g.box) { fo.box.x = g.box.x; fo.box.y = g.box.y; fo.box.w = g.box.w; fo.box.h = g.box.h; }
        if (g.cx !== undefined) { fo.cx = g.cx; fo.cy = g.cy!; fo.R = g.R!; fo.a0 = g.a0!; fo.a1 = g.a1!; }
        fo.step = live.current.step;
        fo.lean = live.current.lean;
        fo.active = true;
      } else if (!ok && fo.owner === id) {
        fo.active = false;
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      if (fo.owner === id) fo.active = false;
    };
  }, [sectionRef, id, shape, share, hmax, gate, exitAt, handoff, phones]);
}
