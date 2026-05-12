// Shared mutable state — cross-component signals to the particle canvas.
// Both modules run client-side and share the same singleton.

export const particleInteraction = {
  repulse: false,
  gravityTarget: { x: -9999, y: -9999, active: false },
  orbReveal: { phase: 'idle' as 'idle' | 'converging' | 'holding' | 'scattering' },
  scatterTrigger: 0,
  gravityBoost: false,
};
