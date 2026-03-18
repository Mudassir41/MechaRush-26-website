"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { X, Menu, Phone } from "lucide-react";

const CONTACTS = [
  { name: "Sathick. A.S",    role: "Tech Coordinator",   phone: "+91 6381032845" },
  { name: "Susikaran V",     role: "Non-Tech Coord",     phone: "+91 7305432674" },
  { name: "Support Email",   role: "General Inquiry",    phone: "contact@mecharush.in" },
];

const NAV_LINKS = [
  { href: "/",               label: "Home"       },
  { href: "/about",          label: "About"      },
  { href: "/tech-events",    label: "Tech Events" },
  { href: "/non-tech-events",label: "Non-Tech"   },
  { href: "/#schedule",       label: "Schedule"   },
  { href: "/#location",       label: "Location"   },
];

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 250); // Show inline logo after scrolling past hero
  });

  return (
    <>
      <motion.nav 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-black/90 backdrop-blur-xl border-b border-[#e62e2d]/20 shadow-[0_0_30px_rgba(230,46,45,0.15)]' : 'bg-transparent'}`}
      >
        <div className="max-w-7xl mx-auto px-5 h-20 flex items-center justify-between gap-4">

          {/* Left — college logo & MechaRush logo */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <a
              href="https://crescent.education"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-32 relative flex-shrink-0 transition-transform hover:scale-105"
              title="B.S. Abdur Rahman Crescent Institute"
            >
              <img src="/assets/crescent-logo-white.png" alt="Crescent Logo" className="w-full h-full object-contain" />
            </a>
          </div>

          {/* Center — Inline Logo (appears on scroll) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto">
             <AnimatePresence>
                {isScrolled && (
                   <motion.div 
                     initial={{ opacity: 0, y: -20, scale: 0.8 }} 
                     animate={{ opacity: 1, y: 0, scale: 1 }} 
                     exit={{ opacity: 0, y: -20, scale: 0.8 }}
                     transition={{ type: "spring", stiffness: 300, damping: 25 }}
                     className="relative hidden sm:block w-64 h-16"
                   >
                     <Link href="/" title="MechaRush Home" className="block w-full h-full hover:scale-105 transition-transform">
                        <Image src="/assets/mecharush_inline.png" alt="MechaRush" fill className="object-contain drop-shadow-[0_0_15px_rgba(230,46,45,0.5)] cursor-pointer" />
                     </Link>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>

          {/* Right — hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="relative w-12 h-12 flex items-center justify-center rounded-xl border border-white/10 hover:border-[#e62e2d]/50 hover:bg-[#e62e2d]/10 transition-colors group bg-black/50 backdrop-blur-md"
            aria-label="Open menu"
          >
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e62e2d] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#e62e2d]"></span>
            </span>
            <Menu size={22} className="text-white/70 group-hover:text-white transition-colors" />
          </button>
        </div>
      </motion.nav>

      {/* Slide-out menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md" />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-[91] w-[320px] flex flex-col shadow-[-20px_0_50px_rgba(230,46,45,0.1)]"
              style={{ background: "rgba(6,8,12,0.98)", borderLeft: "1px solid rgba(230,46,45,0.2)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/[0.05]">
                <div className="relative w-32 h-8">
                   <Image src="/assets/mecharush_inline.png" alt="MechaRush" fill className="object-contain" />
                </div>
                <button onClick={() => setMenuOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#e62e2d]/20 hover:border-[#e62e2d]/50 transition-colors">
                  <X size={18} className="text-white" />
                </button>
              </div>

              {/* Links */}
              <nav className="flex-1 overflow-y-auto p-6 space-y-2">
                <div className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#e62e2d]/60 mb-4 px-2">Navigation</div>
                {NAV_LINKS.map(({ href, label }, i) => (
                  <motion.div key={href}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 + 0.1 }}>
                    <Link href={href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-black tracking-widest uppercase text-white/50 hover:text-white hover:bg-[#e62e2d]/10 hover:transition-all">
                      {label}
                    </Link>
                  </motion.div>
                ))}

                {/* Contacts in menu */}
                <div className="pt-6 mt-8 border-t border-white/[0.05]">
                  <div className="text-[10px] tracking-[0.4em] uppercase text-[#e62e2d]/60 font-bold px-2 mb-4">Contacts</div>
                  {CONTACTS.map(({ name, role, phone }) => (
                    <a key={name} href={`tel:${phone}`}
                      className="flex items-center justify-between px-5 py-3.5 rounded-xl hover:bg-white/[0.04] transition-colors group">
                      <div>
                        <div className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{name}</div>
                        <div className="text-[10px] text-[#e62e2d]/80 uppercase font-bold tracking-widest mt-0.5">{role}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono text-white/30">{phone}</span>
                        <div className="w-8 h-8 rounded-full bg-[#e62e2d]/10 flex items-center justify-center group-hover:bg-[#e62e2d] transition-colors">
                          <Phone size={13} className="text-[#e62e2d] group-hover:text-white" />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </nav>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
