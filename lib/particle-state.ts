// Shared mutable state, cross-component signals to the particle canvas.
// Both modules run client-side and share the same singleton.

export const particleInteraction = {
  repulse: false,
  gravityTarget: { x: -9999, y: -9999, active: false },
  // Viewport rect the static-phase particles keep clear of (home Experience
  // ledger). Rest points inside it migrate out, scatter clusters avoid it.
  clearZone: { x: -9999, y: -9999, w: 0, h: 0, active: false },
  orbReveal: { phase: 'idle' as 'idle' | 'converging' | 'holding' | 'scattering' },
  scatterTrigger: 0,
  gravityBoost: false,
};
