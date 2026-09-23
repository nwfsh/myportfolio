import type { Metadata } from "next";
import ClickSpark from "./components/ClickSpark";
import DotField from "./components/DotField";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Portfolio",
  description: "A simple scrollable portfolio built with Next.js and TypeScript.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="page-bg" aria-hidden="true">
          <DotField
            dotRadius={1.7}
            dotSpacing={10}
            bulgeStrength={0}
            glowRadius={0}
            cursorRadius={300}
            cursorForce={0.01}
            gradientFrom="#69646d"
            gradientTo="#ba7d9b"
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
        <ClickSpark sparkSize={18} sparkRadius={42} sparkCount={12} duration={600} lineWidth={2.5} />
      </body>
    </html>
  );
}
