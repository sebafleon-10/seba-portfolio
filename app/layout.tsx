import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { geistMono } from "@/lib/fonts";
import "./globals.css";
import { GatedParticleCanvas } from "@/components/ui/gated-particle-canvas";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { ParallaxProvider } from "@/context/parallax-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
