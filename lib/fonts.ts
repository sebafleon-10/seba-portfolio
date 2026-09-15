// Site-wide font tokens. The mono face comes only from here: no 'monospace'
// or 'ui-monospace' literals anywhere in app, components, or lib. Safe to
// import from app/**, components/ui/**, and lib/** alike (unlike lib/accent.ts).

import { Geist_Mono } from 'next/font/google';

export const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
});

// Resolved family name plus next/font's size-adjusted fallback. Works both as
// an inline fontFamily value and inside a canvas ctx.font string.
export const MONO = geistMono.style.fontFamily;
