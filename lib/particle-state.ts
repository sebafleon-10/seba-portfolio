// Shared mutable state, cross-component signals to the particle canvas.
// Both modules run client-side and share the same singleton.

export type ClearZone = { x: number; y: number; w: number; h: number; active: boolean };

export const particleInteraction = {
  repulse: false,
  gravityTarget: { x: -9999, y: -9999, active: false },
  // Viewport rects the static-phase particles keep clear of (home Experience
  // text card and logo mark). Rest points inside one migrate out, scatter
  // clusters avoid them. Each useClearZone call registers its own entry.
  clearZones: [] as ClearZone[],
  orbReveal: { phase: 'idle' as 'idle' | 'converging' | 'holding' | 'scattering' },
  scatterTrigger: 0,
  gravityBoost: false,
};
