import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GatedParticleCanvas } from "@/components/ui/gated-particle-canvas";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { ParallaxProvider } from "@/context/parallax-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sebastian Leon",
  description: "Athlete. Analyst. Builder.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        <ParallaxProvider>
          <GatedParticleCanvas />
          <ScrollProgress />
          {children}
        </ParallaxProvider>
      </body>
    </html>
  );
}
