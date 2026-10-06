// Shared mutable state, cross-component signals to the particle canvas.
// Both modules run client-side and share the same singleton.

export type ClearZone = { x: number; y: number; w: number; h: number; active: boolean };

export type FormationShape = 'spindle' | 'ring' | 'rim';

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
  // A section can recruit the network into a living shape (viewport
  // coordinates). One section owns it at a time: `owner` is the id of the
  // useFormation call that claimed it. The canvas treats an owner change as a
  // release plus a new morph, or, when both owners allow `handoff`, as a
  // straight shape-to-shape morph with no blast.
  // `shape`:
  //   'spindle' fills the gap between anchors a and b up to `hmax` tall
  //             (home Experience: card edge to logo mark);
  //   'ring'    adds a band orbiting `box` (unused);
  //   'rim'     is a curved horizon of radius `R` about the pivot (cx, cy),
  //             clipped to the angles a0..a1 (home Projects, under the card
  //             fan, which turns about the same pivot).
  // `share` of the population joins, the rest fades out while it is active.
  // `step` is the section's discrete state (a role, a card) and `lean` its
  // shape bias (spindle: an exponent on the axis; rim: its turn in radians).
  // `pulseAt` (a performance.now stamp) sends a brightness front from a to b,
  // or b to a when `pulseDir` is -1.
  formation: {
    active: false,
    owner: '',
    handoff: false,
    shape: 'spindle' as FormationShape,
    share: 1,
    hmax: 280,
    ax: 0, ay: 0, bx: 0, by: 0,
    box: { x: 0, y: 0, w: 0, h: 0 },
    cx: 0, cy: 0, R: 0, a0: 0, a1: 0,
    step: 0,
    lean: 1,
    pulseAt: -1,
    pulseDir: 1 as 1 | -1,
  },
  // Where the orb reveal globe forms. -1 means the viewport center with the
  // default radius (Who, Experience). `handoff` names the formation owner the
  // globe hands its particles to when the converge ends, instead of a blast.
  orb: { x: -1, y: -1, r: -1, handoff: '' },
  orbReveal: { phase: 'idle' as 'idle' | 'converging' | 'holding' | 'scattering' },
  scatterTrigger: 0,
  gravityBoost: false,
};
