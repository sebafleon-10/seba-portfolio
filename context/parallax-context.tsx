'use client';
import { createContext, useContext, useRef } from 'react';

interface ParallaxContextType {
  setZoomProgress: (progress: number) => void;
  zoomProgressRef: React.MutableRefObject<number>;
}

const ParallaxContext = createContext<ParallaxContextType | null>(null);

export function ParallaxProvider({ children }: { children: React.ReactNode }) {
  const zoomProgressRef = useRef(0);

  const setZoomProgress = (progress: number) => {
    zoomProgressRef.current = progress;
  };

  return (
    <ParallaxContext.Provider value={{ setZoomProgress, zoomProgressRef }}>
      {children}
    </ParallaxContext.Provider>
  );
}

export function useParallax() {
  const ctx = useContext(ParallaxContext);
  if (!ctx) throw new Error('useParallax must be used within ParallaxProvider');
  return ctx;
}
