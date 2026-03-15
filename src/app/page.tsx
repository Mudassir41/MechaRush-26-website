"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import CountdownTimer from "./components/CountdownTimer";
import FireSmokeOverlay from "./components/FireSmokeOverlay";
import SparkParticleField from "./components/SparkParticleField";
import Interactive3DShowcase from "./components/Interactive3DShowcase";
import GearDivider from "./components/GearDivider";
import IgnitionScreen from "./components/IgnitionScreen";
import { Calendar, MapPin, ChevronRight, Wrench, Zap, Clock, Award, Phone, ExternalLink, Flame, Cog, Rocket, Users } from "lucide-react";

/* ──────────────────── DATA ──────────────────── */

const SCHEDULE = [
  { time: "09:00 AM", event: "Inauguration & Registration",    icon: "🏁", desc: "Opening ceremony and team check-in" },
  { time: "10:00 AM", event: "Events Kickoff — Slot 1",        icon: "⚙️", desc: "First wave of competitions begin" },
  { time: "01:00 PM", event: "Lunch Break & Networking",       icon: "☕", desc: "Forge connections over food" },
  { time: "02:00 PM", event: "Events Resume — Slot 2",         icon: "🔧", desc: "Afternoon competitions and challenges" },
  { time: "04:30 PM", event: "Valedictory & Prize Distribution", icon: "🏆", desc: "Award ceremony and closing" },
];

const STATS = [
  { value: "6",  label: "Tech Events",     icon: <Wrench size={18} />,  desc: "Hands-on engineering challenges" },
  { value: "5",  label: "Non-Tech Events", icon: <Zap size={18} />,     desc: "Fun, creative competitions" },
  { value: "1",  label: "Day Fest",        icon: <Clock size={18} />,   desc: "One intense day of innovation" },
  { value: "500+", label: "Participants",  icon: <Users size={18} />,   desc: "Engineers from across TN" },
];

const HIGHLIGHTS = [
  {
    title: "Bridge Building",
    desc: "Design and test load-bearing structures with limited materials",
    image: "/gear-turbine.png",
    tag: "TECH",
  },
  {
    title: "CAD Showdown",
    desc: "Speed-design mechanical assemblies under time pressure",
    image: "/forge-hero.png",
    tag: "TECH",
  },
  {
    title: "Rocket Launch",
    desc: "Build and launch water/air rockets for maximum altitude",
    image: "/rocket-launch.png",
    tag: "TECH",
  },
];

const CONTACTS = [
  { name: "Mudassir",    role: "Technical Head",           phone: "9876543210" },
  { name: "Suzy",        role: "Non-Technical Head",       phone: "9080191348" },
  { name: "Shakthi",     role: "Tech Event Coordinator",   phone: "9042818580" },
  { name: "Gokulraj",    role: "Non-Tech Coordinator",     phone: "9087654321" },
];

const MAP_EMBED = "https://www.google.com/maps?q=B.S.+Abdur+Rahman+Crescent+Institute+Mechanical+Department,+Vandalur,+Chennai&output=embed";
const ACCENT = "#e62e2d";



/* ──────────────────── SECTION HEADER ──────────────────── */

function SectionHeader({ tag, title, gradient }: { tag: string; title: string; gradient?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.7 }} className="text-center mb-12">
      <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase font-bold mb-3" style={{ color: `${ACCENT}55` }}>
        <div className="w-10 h-px" style={{ background: `${ACCENT}35` }} />
        {tag}
        <div className="w-10 h-px" style={{ background: `${ACCENT}35` }} />
      </div>
      <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
        {title.split(" ").map((word, i) => (
          i === title.split(" ").length - 1 ? (
            <span key={i} style={{
              background: gradient ?? `linear-gradient(135deg, ${ACCENT}, #ff5a1f)`,
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            }}> {word}</span>
          ) : <span key={i}>{i > 0 ? " " : ""}{word}</span>
        ))}
      </h2>
    </motion.div>
  );
}

/* ──────────────────── MAIN PAGE ──────────────────── */

export default function Home() {
  const [ignitionDone, setIgnitionDone] = useState(false);
  
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const heroY       = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  useEffect(() => {
    if (sessionStorage.getItem("mechrush_ignited")) setIgnitionDone(true);
  }, []);

  const handleComplete = () => {
    sessionStorage.setItem("mechrush_ignited", "1");
    setIgnitionDone(true);
  };

  return (
    <>
      {!ignitionDone && <IgnitionScreen onComplete={handleComplete} />}

      {/* Layers */}
      <div className="fixed inset-0 z-[-2]">
        <Image src="/assets/forge_bg.jpg" alt="Forge Background" fill className="object-cover opacity-20 mix-blend-luminosity filter blur-[2px]" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-[#06080c]/50 via-black/80 to-[#06080c] pointer-events-none" />
      </div>
      <SparkParticleField density={0.7} />
      <FireSmokeOverlay />

      <div className="relative flex flex-col items-center overflow-hidden">

        {/* ═══════ HERO SECTION ═══════ */}
        <motion.section ref={heroRef} style={{ opacity: heroOpacity, y: heroY }}
          className="relative w-full max-w-7xl mx-auto px-6 pt-32 pb-8 flex flex-col items-center min-h-screen">

          {/* HUD bracket corners */}
          {(["tl","tr","bl","br"] as const).map(pos => (
            <div key={pos} className="absolute w-10 h-10 pointer-events-none hidden sm:block"
              style={{
                top: pos.startsWith("t") ? 24 : undefined, bottom: pos.startsWith("b") ? 24 : undefined,
                left: pos.endsWith("l") ? 24 : undefined, right: pos.endsWith("r") ? 24 : undefined,
                borderTop: pos.startsWith("t") ? `1.5px solid ${ACCENT}50` : undefined,
                borderBottom: pos.startsWith("b") ? `1.5px solid ${ACCENT}50` : undefined,
                borderLeft: pos.endsWith("l") ? `1.5px solid ${ACCENT}50` : undefined,
                borderRight: pos.endsWith("r") ? `1.5px solid ${ACCENT}50` : undefined,
              }} />
          ))}

          {/* Telemetry strip */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={ignitionDone ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="hidden sm:flex items-center gap-6 mb-8 font-mono text-[10px] tracking-[0.25em] uppercase">
            {[
              { k: "DEPT", v: "MECHANICAL" },
              { k: "STATUS", v: "LIVE" },
              { k: "FORGE_TEMP", v: "4200°C" },
              { k: "SYSTEMS", v: "ALL_GREEN", blink: true },
            ].map(({ k, v, blink }) => (
              <div key={k} className="flex items-center gap-1.5">
                <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }}
                  animate={blink ? { opacity: [1, 0.2, 1] } : { opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 1.2 }} />
                <span style={{ color: `${ACCENT}60` }}>{k}:</span>
                <span style={{ color: `${ACCENT}cc` }}>{v}</span>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 32 }} animate={ignitionDone ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9 }} className="text-center w-full">

            {/* College tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border text-xs font-bold tracking-widest uppercase"
              style={{ borderColor: `${ACCENT}40`, background: `${ACCENT}12`, color: ACCENT }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: ACCENT }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: ACCENT }} />
              </span>
              Dept. of Mechanical Engineering
            </div>

            {/* Emblems & Logo */}
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={ignitionDone ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 0.2 }} className="mb-2 relative w-40 h-40 sm:w-56 sm:h-56 mx-auto">
               <Image src="/assets/mecharush_emblem.png" alt="Emblem" fill className="object-contain drop-shadow-[0_0_30px_rgba(230,46,45,0.4)]" priority />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={ignitionDone ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }} className="mb-4 relative w-[90vw] max-w-[800px] h-[90px] sm:h-[130px] mx-auto">
               <Image src="/assets/mecharush_stacked.png" alt="MechaRush '26" fill className="object-contain" priority />
            </motion.div>

            <p className="text-white/35 text-base mb-2 font-light tracking-widest uppercase">
              The Ultimate Mechanical Symposium
            </p>

            <motion.p initial={{ opacity: 0 }} animate={ignitionDone ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
              className="max-w-lg mx-auto text-base text-white/40 mb-8 font-light">
              Where engineering meets innovation. Compete. Build. Ignite.
            </motion.p>

            {/* Date / Location pills */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={ignitionDone ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-4 mb-8">
              {[
                { Icon: Calendar, text: "April 7, 2026" },
                { Icon: MapPin, text: "Crescent, Chennai" },
                { Icon: Flame, text: "11 Events" },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold text-white/60"
                  style={{ background: "rgba(12,16,22,0.8)", border: `1px solid ${ACCENT}20`, backdropFilter: "blur(12px)" }}>
                  <Icon size={15} style={{ color: ACCENT }} /> {text}
                </div>
              ))}
            </motion.div>

            {/* Countdown */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={ignitionDone ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.5 }}>
              <CountdownTimer accent={ACCENT} />
            </motion.div>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0 }} animate={ignitionDone ? { opacity: 1 } : {}}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-10">
              <Link href="/tech-events"
                className="group relative px-9 py-4 text-sm rounded-lg font-bold tracking-widest uppercase text-white overflow-hidden transition-all hover:scale-105 active:scale-95"
                style={{ background: ACCENT, boxShadow: `0 0 40px ${ACCENT}50` }}>
                <div className="absolute inset-0 bg-white/15 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-2">
                  <Wrench size={16} /> Tech Events <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link href="/non-tech-events"
                className="px-9 py-4 rounded-lg border text-white/55 hover:text-white transition-all text-sm font-bold tracking-widest uppercase backdrop-blur-sm hover:border-white/20 hover:bg-white/5"
                style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                <span className="flex items-center gap-2"><Zap size={16} /> Non-Tech Events</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div initial={{ opacity: 0 }} animate={ignitionDone ? { opacity: 1 } : {}} transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
            <div className="text-[9px] tracking-[0.4em] uppercase font-bold" style={{ color: `${ACCENT}35` }}>Scroll</div>
            <motion.div className="w-px h-7" style={{ background: `linear-gradient(to bottom, ${ACCENT}55, transparent)` }}
              animate={{ scaleY: [0, 1, 0], originY: 0 }} transition={{ repeat: Infinity, duration: 1.8 }} />
          </motion.div>
        </motion.section>

        {/* ═══════ SCENE CONTROLS ═══════ */}

        <GearDivider />

        {/* ═══════ STATS ═══════ */}
        <section className="relative w-full border-y py-14"
          style={{ borderColor: `${ACCENT}12`, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(20px)" }}>
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 transition-transform group-hover:scale-110 group-hover:rotate-6"
                  style={{ background: `${ACCENT}12`, color: ACCENT, boxShadow: `0 0 20px ${ACCENT}15` }}>
                  {s.icon}
                </div>
                <div className="text-3xl font-black text-white tabular-nums" style={{ textShadow: `0 0 20px ${ACCENT}35` }}>
                  {s.value}
                </div>
                <div className="text-[10px] text-white/25 font-bold uppercase tracking-widest mt-1">{s.label}</div>
                <div className="text-[10px] text-white/15 mt-0.5">{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </section>

        <GearDivider flip />

        {/* ═══════ ABOUT SECTION ═══════ */}
        <section className="relative w-full max-w-6xl mx-auto px-6 py-24">
          <SectionHeader tag="About" title="Engineer the Rush" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Image side */}
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="relative rounded-2xl overflow-hidden group" style={{ height: 380 }}>
              <Image src="/assets/forge_bg.jpg" alt="Forge scene — the spirit of MechaRush"
                fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6">
                <div className="text-[9px] tracking-[0.4em] uppercase font-bold mb-1" style={{ color: `${ACCENT}80` }}>
                  DEPT. OF MECHANICAL ENGINEERING
                </div>
                <div className="text-xl font-black text-white">Where Metal Meets Mind</div>
              </div>
              {/* HUD border */}
              <div className="absolute inset-0 border rounded-2xl pointer-events-none" style={{ borderColor: `${ACCENT}20` }} />
            </motion.div>

            {/* Text side */}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}
              className="space-y-5">
              <p className="text-white/55 leading-relaxed">
                <span className="font-bold text-white">MECHARUSH '26</span> is the flagship technical symposium
                of the Department of Mechanical Engineering at B.S. Abdur Rahman Crescent Institute.
                A one-day crucible of engineering excellence where students from across Tamil Nadu
                compete, innovate, and push boundaries.
              </p>

              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="text-[10px] tracking-widest uppercase font-bold text-white/30 mb-4">In Association With</div>
                <div className="flex flex-wrap items-center gap-6 saturate-0 opacity-70 hover:saturate-100 hover:opacity-100 transition-all">
                   <div className="relative h-10 w-28"><Image src="/assets/sme_crescent.png" alt="SME" fill className="object-contain" /></div>
                   <div className="relative h-10 w-20"><Image src="/assets/asme_logo.png" alt="ASME" fill className="object-contain bg-white/80 rounded-md p-1" /></div>
                   <div className="relative h-10 w-28"><Image src="/assets/sae_india_logo.png" alt="SAE" fill className="object-contain" /></div>
                   <div className="relative h-10 w-24"><Image src="/assets/ishrae_logo.png" alt="ISHRAE" fill className="object-contain" /></div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Link href="/tech-events"
                  className="flex items-center gap-2 px-5 py-3 rounded-lg text-xs font-bold tracking-widest uppercase transition-all hover:scale-105"
                  style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}30`, color: ACCENT }}>
                  <Wrench size={13} /> View Events
                </Link>
                <a href="#contacts"
                  className="flex items-center gap-2 px-5 py-3 rounded-lg text-xs font-bold tracking-widest uppercase text-white/40 hover:text-white/70 transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  Contact Us
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════ EVENT HIGHLIGHTS ═══════ */}
        <section className="relative w-full max-w-6xl mx-auto px-6 pb-24">
          <div className="flex flex-col items-center mb-12">
            <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase font-bold mb-3" style={{ color: `${ACCENT}55` }}>
              <div className="w-10 h-px" style={{ background: `${ACCENT}35` }} />
              FEATURED
              <div className="w-10 h-px" style={{ background: `${ACCENT}35` }} />
            </div>
            <div className="relative w-full max-w-[600px] h-[80px] sm:h-[120px]">
              <Image src="/assets/tech_header.png" alt="TECH EVENTS" fill className="object-contain" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HIGHLIGHTS.map((h, i) => (
              <motion.div key={h.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative group rounded-2xl overflow-hidden" style={{ height: 320 }}>
                <Image src="/assets/forge_bg.jpg" alt={h.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {/* Tag */}
                <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md text-[9px] font-bold tracking-widest uppercase"
                  style={{ background: `${ACCENT}25`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
                  {h.tag}
                </div>

                {/* Content */}
                <div className="absolute bottom-0 inset-x-0 p-6">
                  <h3 className="text-xl font-black text-white mb-1 group-hover:text-opacity-100 transition-colors">{h.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{h.desc}</p>
                  <div className="flex items-center gap-3 mt-4">
                    <a href="https://forms.gle/placeholder" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-bold tracking-widest uppercase transition-all bg-[#e62e2d] text-white hover:scale-105 shadow-[0_0_15px_rgba(230,46,45,0.4)]">
                      Register Now
                    </a>
                    <a href="#" className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase transition-colors text-white/40 hover:text-white">
                      Rulebook PDF
                    </a>
                  </div>
                </div>

                {/* HUD border on hover */}
                <div className="absolute inset-0 border-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ borderColor: `${ACCENT}30` }} />
              </motion.div>
            ))}
          </div>
        </section>

        <GearDivider />

        {/* ═══════ 3D GEAR SHOWCASE ═══════ */}
        <Interactive3DShowcase />

        <GearDivider flip />

        {/* ═══════ SCHEDULE ═══════ */}
        <section className="relative w-full max-w-5xl mx-auto px-6 py-24">
          <SectionHeader tag="Event Day" title="Day Schedule" />

          <div className="relative">
            <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px sm:-translate-x-1/2"
              style={{ background: `${ACCENT}18` }} />
            {SCHEDULE.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative flex items-start sm:items-center mb-8 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}>
                <div className="absolute left-6 sm:left-1/2 w-3 h-3 rounded-full border-2 border-black sm:-translate-x-1/2 translate-y-1.5 z-10"
                  style={{ background: ACCENT, boxShadow: `0 0 10px ${ACCENT}` }} />
                <div className={`ml-14 sm:ml-0 sm:w-[44%] rounded-xl p-5 group hover:scale-[1.02] transition-transform ${i % 2 === 0 ? "sm:mr-[6%]" : "sm:ml-[6%]"}`}
                  style={{ background: "rgba(12,16,22,0.88)", border: `1px solid ${ACCENT}16`, backdropFilter: "blur(12px)" }}>
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-[10px] font-bold tracking-[0.3em] uppercase mb-1 font-mono" style={{ color: `${ACCENT}75` }}>{item.time}</div>
                  <div className="text-sm font-bold text-white/70 mb-1">{item.event}</div>
                  <div className="text-[11px] text-white/25">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════ LOCATION ═══════ */}
        <section id="location" className="relative w-full max-w-5xl mx-auto px-6 pb-24">
          <SectionHeader tag="Geolocation" title="Facility Map" />

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="rounded-2xl overflow-hidden" style={{ background: "rgba(6,8,12,0.9)", border: `1px solid ${ACCENT}20` }}>

            <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: `${ACCENT}15` }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase font-mono" style={{ color: `${ACCENT}80` }}>
                  FACILITY MAP // RADAR
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/20">12.8785°N, 80.0499°E</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_280px]">
              <div className="relative overflow-hidden" style={{ height: 340 }}>
                <iframe src={MAP_EMBED} width="100%" height="100%"
                  style={{ border: 0, filter: "grayscale(0.7) invert(0.9) hue-rotate(180deg) brightness(0.75) contrast(1.2)" }}
                  allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: `linear-gradient(to right, transparent 80%, rgba(6,8,12,0.9) 100%)` }} />
              </div>

              <div className="flex flex-col gap-4 p-6 border-t md:border-t-0 md:border-l" style={{ borderColor: `${ACCENT}15` }}>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={14} style={{ color: ACCENT }} />
                    <span className="text-[11px] font-bold tracking-[0.3em] uppercase" style={{ color: `${ACCENT}80` }}>MECH BLOCK</span>
                  </div>
                  <div className="text-sm font-bold text-white/80 mb-1">Department of Mechanical Engineering</div>
                  <div className="text-xs text-white/35 leading-relaxed">
                    B.S. Abdur Rahman Crescent<br />Institute of Science & Technology<br />
                    GST Road, Vandalur<br />Chennai, Tamil Nadu 600048
                  </div>
                </div>
                <div><div className="text-[9px] tracking-[0.3em] uppercase text-white/20 font-bold">Coordinates</div>
                  <div className="font-mono text-xs" style={{ color: ACCENT }}>12.8785°N, 80.0499°E</div></div>
                <a href="https://maps.google.com/?q=B.S.+Abdur+Rahman+Crescent+Institute+Mechanical+Department+Vandalur+Chennai"
                  target="_blank" rel="noopener noreferrer"
                  className="mt-auto flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold tracking-widest uppercase transition-all hover:scale-105"
                  style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}30`, color: ACCENT }}>
                  <ExternalLink size={13} /> INITIALIZE ROUTE
                </a>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ═══════ CONTACTS ═══════ */}
        <section id="contacts" className="relative w-full max-w-4xl mx-auto px-6 pb-24">
          <SectionHeader tag="Team" title="Contact Us" />

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="rounded-2xl overflow-hidden" style={{ background: "rgba(6,8,12,0.9)", border: `1px solid ${ACCENT}20` }}>

            <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: `${ACCENT}15` }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase font-mono" style={{ color: `${ACCENT}80` }}>CONTACTS</span>
            </div>

            <div className="divide-y" style={{ borderColor: `${ACCENT}08` }}>
              {CONTACTS.map(({ name, role, phone }, i) => (
                <motion.div key={name} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between px-6 py-5 group hover:bg-white/[0.02] transition-colors">
                  <div>
                    <div className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{name}</div>
                    <div className="text-[10px] tracking-widest uppercase font-bold mt-0.5" style={{ color: `${ACCENT}60` }}>{role}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-white/30 hidden sm:block">{phone}</span>
                    <a href={`tel:${phone}`}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105"
                      style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}30`, color: ACCENT }}>
                      <Phone size={14} />
                      <span className="text-xs font-bold tracking-wider uppercase hidden sm:block">Call</span>
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

      </div>
    </>
  );
}
