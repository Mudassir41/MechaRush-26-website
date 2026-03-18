"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import CountdownTimer from "./components/CountdownTimer";
import FireSmokeOverlay from "./components/FireSmokeOverlay";
import SparkParticleField from "./components/SparkParticleField";
import GearDivider from "./components/GearDivider";
import IgnitionScreen from "./components/IgnitionScreen";
import EventCard from "./components/EventCard";
import { useHUDStore } from "./store/hudStore";
import { Calendar, MapPin, ChevronRight, Wrench, Zap, Clock, Award, Phone, ExternalLink, Flame, Cog, Rocket, Users, Gamepad2, BrainCircuit, AlertTriangle, Mail } from "lucide-react";

/* ──────────────────── DATA ──────────────────── */

const SCHEDULE = [
  { time: "09:00 AM", event: "Inauguration & Registration", icon: "🏁", desc: "Opening ceremony and team check-in" },
  { time: "10:00 AM", event: "Events Kickoff — Slot 1", icon: "⚙️", desc: "First wave of competitions begin" },
  { time: "01:00 PM", event: "Lunch Break & Networking", icon: "☕", desc: "Forge connections over food" },
  { time: "02:00 PM", event: "Events Resume — Slot 2", icon: "🔧", desc: "Afternoon competitions and challenges" },
  { time: "04:30 PM", event: "Valedictory & Prize Distribution", icon: "🏆", desc: "Award ceremony and closing" },
];

const STATS = [
  { value: "6", label: "Tech Events", icon: <Wrench size={18} />, desc: "Hands-on engineering challenges" },
  { value: "5", label: "Non-Tech Events", icon: <Gamepad2 size={18} />, desc: "Fun, creative competitions" },
  { value: "1", label: "Day Fest", icon: <Clock size={18} />, desc: "One intense day of innovation" },
  { value: "250+", label: "Participants", icon: <Users size={18} />, desc: "Engineers from across the Nation" },
];

const HIGHLIGHTS = [
  {
    title: "Venture Vault",
    desc: "An innovative idea presentation event where aspiring engineers pitch projects or business models related to technical engineering advancements, focusing on feasibility, market potential, and technical execution.",
    image: "/assets/events/venture_vault.jpeg",
    tag: "TECH",
    icon: <Cog size={24} />,
    rules: ["Presentations strictly 5 minutes.", "Ideas must be original.", "Q&A session will follow each pitch."],
    coordinators: ["Sai Srijith", "Ahamed Ibrahim"],
    phones: ["+91 730503259", "+91 9361827918"]
  },
  {
    title: "Pathfinder Robot",
    desc: "A robotics competition challenging teams to navigate a complex track. Note: Bring your prebuilt line-follower robot! It's a competition of who designed and built the best one.",
    image: "/assets/pathfinder_hero.png",
    tag: "TECH",
    icon: <BrainCircuit size={24} />,
    rules: ["Bot must be autonomous line-follower.", "Robots must be pre-built by the team.", "Fastest completion without track deviations wins."],
    coordinators: ["Mohammed mudassir basha", "Akif"],
    phones: ["mudassir@mecharush.in", "+91 82708 94966"]
  },
];

const CONTACTS = [
  { name: "Sathick. A.S", role: "Technical Events Coordinator", link: "tel:+916381032845", display: "+91 63810 32845" },
  { name: "Susikaran V", role: "Non-Technical Events Coordinator", link: "tel:+917305432674", display: "+91 73054 32674" },
  { name: "Admin Setup", role: "Global Admin", link: "mailto:mudassir@mecharush.in", display: "mudassir@mecharush.in" },
  { name: "Sponsorships", role: "Brand & Partnerships", link: "mailto:sponsors@mecharush.in", display: "sponsors@mecharush.in" }
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
  const { telemetry, ignitionDone, setIgnitionDone } = useHUDStore();
  const [emblemState, setEmblemState] = useState<"video" | "image" | "hidden">("hidden");

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
        <Image src="/assets/bg/engineering_facility.png" alt="Orbital Forge Background" fill className={`object-cover mix-blend-luminosity filter transition-all duration-300 ${telemetry === "CHAOTIC" ? "opacity-60 saturate-150 blur-0 scale-105" : "blur-[1px] opacity-30"}`} priority />
        <div className="absolute inset-0 bg-gradient-to-b from-[#06080c]/50 via-black/80 to-[#06080c] pointer-events-none" />
        {telemetry === "CHAOTIC" && <div className="absolute inset-0 bg-[#ff3b30]/10 mix-blend-overlay pointer-events-none transition-opacity duration-300" />}
      </div>
      <SparkParticleField density={telemetry === "CHAOTIC" ? 3.0 : 0.7} />
      <FireSmokeOverlay isChaotic={telemetry === "CHAOTIC"} />

      <div className={`relative flex flex-col items-center overflow-hidden anomaly-transition ${telemetry === "CHAOTIC" ? "anomaly-active" : ""}`}>

        {/* ═══════ HERO SECTION ═══════ */}
        <motion.section
          className="relative w-full max-w-7xl mx-auto px-6 pt-32 pb-8 flex flex-col items-center min-h-screen">

          {/* HUD bracket corners */}
          {(["tl", "tr", "bl", "br"] as const).map(pos => (
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

          <motion.div initial={{ opacity: 0, y: 32 }} animate={ignitionDone ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9 }} className="text-center w-full">



            {/* Clean Department Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded text-[10px] font-bold tracking-[0.15em] uppercase border bg-black/40 backdrop-blur-sm"
              style={{ borderColor: `${ACCENT}30`, color: `${ACCENT}cc` }}>
              Dept. of Mechanical Engineering
            </div>

            {/* Emblems & Logo Toggle */}
            {emblemState !== "hidden" && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={ignitionDone ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 0.2 }} className="mb-2 relative w-40 h-40 sm:w-56 sm:h-56 mx-auto group">
                {emblemState === "video" && (
                  <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full overflow-hidden border border-[#e62e2d]/20 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <video src="/assets/1773491596236.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover scale-105" />
                  </div>
                )}
                {emblemState === "image" && (
                  <Image src="/assets/logo.jpeg" alt="Emblem" fill className="object-contain" priority />
                )}
                {/* Hidden visual toggle on Emblem */}
                <button
                  onClick={() => setEmblemState(s => s === "video" ? "image" : s === "image" ? "hidden" : "video")}
                  className="absolute inset-0 z-50 opacity-0 cursor-crosshair text-transparent"
                  title="Toggle Video/Image/Hidden Mode"
                >
                  toggle
                </button>
              </motion.div>
            )}

            {/* Title Image (MechaRush Stacked) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={ignitionDone ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }} className="mb-4 relative w-[90vw] max-w-[800px] h-[90px] sm:h-[130px] mx-auto group">
              <Image src="/assets/mecharush_stacked.png" alt="MechaRush '26" fill className="object-contain" priority />
              {/* Fallback toggle if emblem is hidden */}
              {emblemState === "hidden" && (
                <button
                  onClick={() => setEmblemState("video")}
                  className="absolute inset-0 z-50 opacity-0 cursor-crosshair text-transparent"
                  title="Restore Emblem"
                >
                  restore emblem
                </button>
              )}
            </motion.div>

            <p className="text-white/35 text-base mb-2 font-light tracking-widest uppercase">
              The National Level Mechanical Symposium
            </p>

            <motion.p initial={{ opacity: 0 }} animate={ignitionDone ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
              className="max-w-lg mx-auto text-base text-white/40 mb-8 font-light">
              Where engineering meets innovation. Compete. Build. Ignite.
            </motion.p>

            {/* Event Info Tags */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={ignitionDone ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }} className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-12">
              <a
                href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=MechaRush+%2726&dates=20260407T033000Z/20260408T123000Z&details=The+National+Level+Mechanical+Symposium&location=B.S.+Abdur+Rahman+Crescent+Institute+of+Science+and+Technology,+Chennai"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(e.currentTarget.href, 'Add to Calendar', 'width=600,height=600,scrollbars=yes');
                }}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white bg-[#0f1219] px-5 py-3 rounded-lg border border-[#e62e2d]/60 hover:bg-[#e62e2d]/10 hover:border-[#e62e2d] transition-all cursor-pointer shadow-lg"
              >
                <Calendar className="text-[#e62e2d]" size={20} />
                <span className="font-bold tracking-widest text-sm uppercase">April 7, 2026</span>
              </a>
              <a
                href="https://maps.app.goo.gl/HVotqtjMj5NFQTVN7"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white bg-[#0f1219] px-5 py-3 rounded-lg border border-[#e62e2d]/60 hover:bg-[#e62e2d]/10 hover:border-[#e62e2d] transition-all cursor-pointer shadow-lg"
              >
                <MapPin className="text-[#e62e2d]" size={20} />
                <span className="font-bold tracking-widest text-sm uppercase">Crescent, Chennai</span>
              </a>
              <div className="flex items-center gap-2 text-white bg-[#0f1219] px-5 py-3 rounded-lg border border-[#e62e2d]/60 cursor-default shadow-lg">
                <Rocket className="text-[#e62e2d]" size={20} />
                <span className="font-bold tracking-widest text-sm uppercase">11 Events</span>
              </div>
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
                <span className="flex items-center gap-2"><Gamepad2 size={16} /> Non-Tech Events</span>
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
              <Image src="/assets/bg/martian_habitat.png" alt="Martian Rover - Engineering"
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
                A one-day crucible of engineering excellence where students from across the Nation
                compete, innovate, and push boundaries.
              </p>

              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="text-[10px] tracking-widest uppercase font-bold text-white/30 mb-4">In Association With</div>
                <div className="flex flex-wrap items-center gap-6 opacity-90 hover:opacity-100 transition-all">
                  <div className="relative h-12 w-32"><img src="/assets/sme_crescent.png" alt="SME" className="w-full h-full object-contain invert brightness-0" /></div>
                  <div className="relative h-12 w-24"><img src="/assets/asme_logo.png" alt="ASME" className="w-full h-full object-contain invert brightness-0" /></div>
                  <div className="relative h-12 w-32"><img src="/assets/sae_india_logo.png" alt="SAE" className="w-full h-full object-contain invert brightness-0 saturate-0" /></div>
                  <div className="relative h-12 w-28"><img src="/assets/ishrae_logo.png" alt="ISHRAE" className="w-full h-full object-contain invert brightness-0" /></div>
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

        {/* ═══════ SCHEDULE ═══════ */}
        <section id="schedule" className="relative w-full max-w-4xl mx-auto px-6 py-24 scroll-mt-20">
          <SectionHeader tag="TIMELINE" title="MISSION SCHEDULE" />
          <div className="relative border-l border-[#e62e2d]/30 ml-4 md:ml-8 space-y-8 pb-12">
            {SCHEDULE.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative pl-8 md:pl-12">
                <div className="absolute -left-[21px] top-1 w-10 h-10 rounded-full bg-black border border-[#e62e2d]/50 flex items-center justify-center text-xl z-10 shadow-[0_0_15px_rgba(230,46,45,0.2)]">
                  {item.icon}
                </div>
                <div className="bg-[#111] border border-white/5 p-5 rounded-lg hover:border-[#e62e2d]/30 transition-colors">
                  <div className="text-[#e62e2d] font-mono text-sm tracking-widest mb-1">{item.time}</div>
                  <h3 className="text-white text-lg font-bold mb-2 uppercase">{item.event}</h3>
                  <p className="text-white/40 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {HIGHLIGHTS.map((h, i) => (
              <EventCard
                key={h.title}
                title={h.title}
                description={h.desc}
                imageIcon={h.icon}
                imageUrl={h.image}
                linkUrl="https://surveyheart.com/form/67b9fe792d76a51d9d95f68a"
                linkText="Register Now"
                rulebookUrl="#"
                delay={i * 0.12}
                accent="#e62e2d"
                rules={h.rules}
                coordinators={h.coordinators}
                coordinatorsPhones={h.phones}
              />
            ))}
          </div>
        </section>

        <GearDivider />

        {/* ═══════ ARCADE TEASER ═══════ */}
        <section className="relative w-full py-10 my-10 overflow-hidden rounded-2xl border border-[#e62e2d]/20 bg-[#0a0a0a]">
          <div className="absolute inset-0 bg-[url('/assets/bg/fluid_dynamics.png')] bg-cover bg-center opacity-30 mix-blend-screen pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-transparent to-[#0a0a0a] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-8 md:px-16 text-center md:text-left">
            <div className="mb-6 md:mb-0">
              <div className="inline-flex items-center gap-2 text-xs tracking-widest uppercase font-bold text-[#e62e2d] mb-2">
                <Gamepad2 size={16} /> MechaRush Arcade
              </div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                Test your <span className="text-[#e62e2d]">Reflexes & Logic</span>
              </h2>
              <p className="text-white/50 text-sm mt-2 max-w-md">
                Take a break from the symposium and calibrate the reactor core or play through our text-based terminal simulation.
              </p>
            </div>
            <Link href="/arcade" className="group relative inline-flex items-center justify-center px-8 py-4 font-black tracking-widest uppercase text-white bg-[#e62e2d]/20 border border-[#e62e2d]/50 hover:bg-[#e62e2d] transition-all duration-300 rounded hover:shadow-[0_0_40px_rgba(230,46,45,0.6)]">
              Enter Arcade
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
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
                {/* Embedded Crescent map, pin exactly at Crescent using satellite view */}
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15555.454215414545!2d80.0766442659043!3d12.877864448577747!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525eaa4f4bfba9%3A0xe9f7ee2d7b57ad23!2sB.S.%20Abdur%20Rahman%20Crescent%20Institute%20Of%20Science%20And%20Technology!5e1!3m2!1sen!2sin!4v1715611111111!5m2!1sen!2sin"
                  width="100%" height="100%" style={{ border: 0, filter: "brightness(0.85) contrast(1.1)" }}
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
              {CONTACTS.map(({ name, role, link, display }, i) => (
                <motion.div key={name} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between px-6 py-5 group hover:bg-white/[0.02] transition-colors">
                  <div>
                    <div className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{name}</div>
                    <div className="text-[10px] tracking-widest uppercase font-bold mt-0.5" style={{ color: `${ACCENT}60` }}>{role}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-white/30 hidden sm:block">{display}</span>
                    <a href={link}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105"
                      style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}30`, color: ACCENT }}>
                      {link.startsWith("mailto") ? <Mail size={14} /> : <Phone size={14} />}
                      <span className="text-xs font-bold tracking-wider uppercase hidden sm:block">
                        {link.startsWith("mailto") ? "Mail" : "Call"}
                      </span>
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
