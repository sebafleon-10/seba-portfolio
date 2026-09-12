// Detail-page accent (periwinkle). Used by /who and /work/*.
// The home page (app/page.tsx and components/ui/*) is deliberately hue-free
// and must never import this module.

export const ACCENT = '#9D9FFF';
export const ACCENT_BRIGHT = '#C4C6FF';

// Darker periwinkle for the single light surface on the site (the white
// finding card on /work/remote-work). ACCENT is about 1.6:1 against that
// card; this one is about 3.5:1.
export const ACCENT_ON_LIGHT = '#5B5FD6';

const ACCENT_RGB = '157,159,255';
const ACCENT_BRIGHT_RGB = '196,198,255';

// rgba() form of the accent. Use instead of hex-alpha suffixes such as
// `${ACCENT}55` so every translucent accent shares one source of truth.
export function accentAlpha(alpha: number, tone: 'base' | 'bright' = 'base'): string {
  return `rgba(${tone === 'bright' ? ACCENT_BRIGHT_RGB : ACCENT_RGB},${alpha})`;
}
