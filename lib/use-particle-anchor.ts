'use client';

import { useEffect, type RefObject } from 'react';
import { particleInteraction, type ClearZone } from '@/lib/particle-state';

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
