// Shared mutable state, cross-component signals to the particle canvas.
// Both modules run client-side and share the same singleton.

export type ClearZone = { x: number; y: number; w: number; h: number; active: boolean };

// How long the brightness front takes to run card to mark through a formation.
export const FORMATION_PULSE_MS = 1000;

export const particleInteraction = {
  repulse: false,
  gravityTarget: { x: -9999, y: -9999, active: false },
  // Viewport rects the static-phase particles keep clear of (home Experience
  // text card and logo mark). Rest points inside one migrate out, scatter
  // clusters avoid them. Each useClearZone call registers its own entry.
  clearZones: [] as ClearZone[],
  // 0 to 1, set by a section that wants the network to recede (dimmer dots
  // and lines, no glow) so its own content leads. The canvas eases toward it.
  calm: 0,
  // A section can recruit the network into a living body between two anchors
  // (home Experience: card edge a, logo mark edge b, viewport coordinates).
  // `share` of the population joins, the rest fades out while it is active.
  // `shape`: 'spindle' fills the gap between the anchors up to `hmax` tall,
  // 'ring' adds a band orbiting `box`. `step` reshapes it, `pulseAt` (a
  // performance.now stamp) sends a brightness front from a to b, or from b
  // to a when `pulseDir` is -1.
  formation: {
    active: false,
    shape: 'spindle' as 'spindle' | 'ring',
    share: 1,
    hmax: 280,
    ax: 0, ay: 0, bx: 0, by: 0,
    box: { x: 0, y: 0, w: 0, h: 0 },
    step: 0,
    pulseAt: -1,
    pulseDir: 1 as 1 | -1,
  },
  orbReveal: { phase: 'idle' as 'idle' | 'converging' | 'holding' | 'scattering' },
  scatterTrigger: 0,
  gravityBoost: false,
};
