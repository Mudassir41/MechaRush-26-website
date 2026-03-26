import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";
import AIAssistant from "./components/AIAssistant";
import GlobalHUD from "./components/GlobalHUD";
import ClickAudioProvider from "./components/ClickAudioProvider";
import EngineAudio from "./components/EngineAudio";

const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MechaRush '26",
  description: "National Level Technical Symposium | Dept of Mechanical Engineering",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${outfit.variable} antialiased min-h-screen flex flex-col bg-[#080a0c]`}>
        <ClickAudioProvider />
        <EngineAudio />
        <NavBar />
        <AIAssistant />
        <GlobalHUD />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        {/* Footer */}
        <footer className="border-t border-white/[0.04] bg-black/80 py-8 text-center">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-[#e62e2d] font-black text-sm tracking-widest uppercase mb-1">MECHARUSH '26</div>
            <p className="text-white/25 text-xs font-semibold mb-1">Department of Mechanical Engineering</p>
            <p className="text-white/12 text-xs">
              B.S. Abdur Rahman Crescent Institute of Science & Technology · Vandalur, Chennai · April 7, 2026
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
