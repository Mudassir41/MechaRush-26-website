import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import ThemeSwitcher from "./components/ThemeSwitcher";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MechRush | Mechanical Symposium",
  description: "The ultimate mechanical engineering symposium in Chennai. Engineer the Rush.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${outfit.variable} antialiased min-h-screen flex flex-col`}>
        {/* Navigation Bar */}
        <nav className="sticky top-0 z-50 glass-panel border-b-0 border-foreground/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 text-2xl font-bold tracking-tighter">
              <img src="/logo.png" alt="MechRush Logo" className="w-8 h-8 rounded-md" />
              <span>MECH<span className="text-forge-red transition-colors">RUSH</span></span>
            </Link>
            <div className="flex items-center space-x-4 md:space-x-8 text-sm font-medium">
              <div className="hidden md:flex space-x-8">
                <Link href="/tech-events" className="hover:text-forge-red transition-colors">Tech Events</Link>
                <Link href="/non-tech-events" className="hover:text-forge-red transition-colors">Non-Tech Events</Link>
              </div>
              <ThemeSwitcher />
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-foreground/10 bg-charcoal/50 py-8 text-center text-metallic text-sm">
          <div className="max-w-7xl mx-auto px-6">
            <p className="font-bold text-foreground mb-2 text-base">B.S. Abdur Rahman Crescent Institute of Science & Technology</p>
            <p>© {new Date().getFullYear()} Mechanical Department Symposium, Chennai.</p>
            <p className="mt-2 text-xs opacity-60">Created for MechRush</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
