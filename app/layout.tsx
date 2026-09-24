import type { Metadata } from "next";
import { Cantarell, Lato } from "next/font/google";
import ClickSpark from "./components/ClickSpark";
import DotField from "./components/DotField";
import LoadingScreen from "./components/LoadingScreen";
import "./globals.css";

// Two fonts, both self-hosted by Next.js (downloaded at build time, no request to Google at
// runtime): Lato for titles/headings, Cantarell (--font-sans) for everything else.
const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
  variable: "--font-lato",
});

// Cantarell only comes in 400 and 700.
const cantarell = Cantarell({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "My Portfolio",
  description: "A simple scrollable portfolio built with Next.js and TypeScript.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${lato.variable} ${cantarell.variable}`}>
      <body>
        <div className="page-bg" aria-hidden="true">
          <DotField
            dotRadius={1.7}
            dotSpacing={10}
            bulgeStrength={0}
            glowRadius={0}
            cursorRadius={300}
            cursorForce={0.01}
            /* Previous dot colours:
            gradientFrom="#69646d"
            gradientTo="#ba7d9b" */
            gradientFrom="#87838a" /* ~20% lighter */
            gradientTo="#c897af"
            holographic
            holoRadius={180}
            holoStars
            starSize={4.5}
            scrollWithPage
            burstRadius={140}
            burstStrength={18}
            burstDuration={700}
          />
        </div>
        {children}
        <LoadingScreen />
        <ClickSpark sparkSize={18} sparkRadius={42} sparkCount={12} duration={600} lineWidth={1.5} />
      </body>
    </html>
  );
}
