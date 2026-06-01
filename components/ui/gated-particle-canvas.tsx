'use client';

import { usePathname } from 'next/navigation';
import { ParticleCanvas } from '@/components/ui/particle-canvas';

// Thin client wrapper so the root Server Component layout can keep its
// server-rendered shell while still gating the home-page ParticleCanvas
// off on every route that renders its own DotGridBackground (otherwise the
// home-page neural network would paint a second layer on top of it).
const NO_PARTICLE_ROUTES = [
  '/work/remote-work',
  '/work/american-airlines',
  '/work/ghost-fc',
  '/who',
];

export function GatedParticleCanvas() {
  const pathname = usePathname();
  if (NO_PARTICLE_ROUTES.some(r => pathname?.startsWith(r))) return null;
  return <ParticleCanvas />;
}
