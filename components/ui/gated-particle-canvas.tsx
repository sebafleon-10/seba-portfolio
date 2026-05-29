'use client';

import { usePathname } from 'next/navigation';
import { ParticleCanvas } from '@/components/ui/particle-canvas';

// Thin client wrapper so the root Server Component layout can keep its
// server-rendered shell while still gating the home-page ParticleCanvas
// off on /work/remote-work (which uses its own dot-grid background).
export function GatedParticleCanvas() {
  const pathname = usePathname();
  if (pathname?.startsWith('/work/remote-work')) return null;
  return <ParticleCanvas />;
}
