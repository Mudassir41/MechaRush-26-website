"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import EventCard from "../components/EventCard";
import { Hammer, Wrench, MessageSquare, PenTool, Bot, Target, Users, ChevronRight } from "lucide-react";

const techEvents = [
  {
    title: "Truss Master (Bridge Building)",
    description: "A technical competition designed to test engineering skills and truss knowledge through the construction of structural bridges. Apply principles of structural mechanics, load distribution and material efficiency.",
    icon: <Bot size={20} />,
    imageUrl: "/assets/trussmaster.jpg",
    coordinators: ["Sakthinarayanan", "Sathick"],
    coordinatorsPhones: ["+91 7358291682", "+91 6381032845"],
    linkUrl: "#gforms-bridge",
    rules: ["Team Size: 3-4 per team", "Entry Fee: Rs. 200"],
    rulebookUrl: "/rulebooks/TrussMaster_EventBook-MechaRush26.pdf",
  },
  {
    title: "Mech Clash (Quiz cum Debate)",
    description: "A dynamic quiz and debate hybrid event testing participants' foundational knowledge and critical thinking on mechanical engineering concepts, history, and current trends.",
    icon: <MessageSquare size={20} />,
    imageUrl: "/assets/events/mech_clash.jpeg",
    coordinators: ["Md Muneeb", "Dhanush"],
    coordinatorsPhones: ["+91 6385599422", "+91 9444415408"],
    linkUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfuC_3s3ukELR5BLsc1Pt-ixqTMBsz4UZyxlmK0LzFelviLag/viewform?usp=header",
    rules: ["Team Size: 1-2 per team", "Entry Fee: Rs. 150"],
    rulebookUrl: "/rulebooks/MechClash_Mecharush26.pdf",
  },
  {
    title: "CAD Mania (CAD Modelling)",
    description: "A computer-aided design (CAD) modeling contest where participants demonstrate their proficiency in 3D modeling software by creating detailed and innovative mechanical components or assemblies.",
    icon: <PenTool size={20} />,
    imageUrl: "/events/cad_modelling.png",
    coordinators: ["Abdul Ghani.A", "Md Abdulla"],
    coordinatorsPhones: ["+91 7845346160", "+91 6383996346"],
    linkUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeXE3ivah3i2ma59oNfpw3RExFZ7NDil7Bx4IaVu_QDLQ65Vw/viewform?usp=header",
    rules: ["Team Size: Individual", "Entry Fee: Rs. 100"],
    rulebookUrl: "/rulebooks/CADMania_EventBook-Mecharush26.pdf",
  },
  {
    title: "Pathfinder",
    description: "Bring your pre-built autonomous line-following robot! Navigate a complex track quickly and accurately. This is a competition of who has designed and built the best one.",
    icon: <Bot size={20} />,
    imageUrl: "/events/pathfinder_robot.png",
    coordinators: ["Mohammed mudassir basha", "Akif"],
    coordinatorsPhones: ["mudassir@mecharush.in", "+91 82708 94966"],
    linkUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfOrbbwUpBvk7dl5KZgkTDGDQfWI3YAkNm0z9qHo8ntnIOfoA/viewform?usp=publish-editor",
    rules: ["Team Size: 2-4 per team", "Entry Fee: Rs. 400"],
    rulebookUrl: "/rulebooks/PathFinder_Mecharush26.pdf",
  },
  {
    title: "Venture Vault (Idea Presentation)",
    description: "An innovative idea presentation event where aspiring engineers pitch projects or business models related to technical engineering advancements, focusing on feasibility and market potential.",
    icon: <Target size={20} />,
    imageUrl: "/assets/events/venture_vault.jpeg",
    coordinators: ["Sai Sreejith", "Ahamed Ibrahim"],
    coordinatorsPhones: ["+91 730503259", "+91 9361827918"],
    linkUrl: "https://forms.gle/cpHWMjz8Yr13Bg1w5",
    rules: ["Team Size: 1-2 per team", "Available Slots: 20", "Entry Fee: Rs. 150"],
    rulebookUrl: "/rulebooks/VentureVault_Research_Mecharush26.pdf",
  },
  {
    title: "Pit Stop Challenge",
    description: "An exhilarating challenge that tests teams' speed, precision, and coordination in disassembling and reassembling the tyres of a GO KART that is provided, simulating high-pressure maintenance.",
    icon: <Wrench size={20} />,
    imageUrl: "/assets/events/wmremove-transformed.jpeg",
    coordinators: ["Dhanush", "Ajmal"],
    coordinatorsPhones: ["+91 9444415408", "+91 7010438504"],
    linkUrl: "https://docs.google.com/forms/d/e/1FAIpQLSf8EJ1K0JCr-6stUVEmArdDlb85qYdCTDngriu71UeJWrvzjw/viewform?usp=dialog",
    rules: ["Team Size: 4 per team", "Entry Fee: Rs. 200"],
    rulebookUrl: "/rulebooks/PitStop_EventBook-MechaRush26.pdf",
  }
];

export default function TechEventsPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-6 relative">
      {/* Background */}
      <div className="fixed inset-0 z-[0] pointer-events-none">
        <Image src="/assets/bg/engineering_facility.png" alt="Tech Events Background" fill className="object-cover opacity-30 mix-blend-luminosity filter blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 text-xs tracking-[0.35em] text-[#e62e2d]/60 uppercase font-bold mb-5">
            <div className="w-10 h-px bg-[#e62e2d]/30" />
            <span className="relative z-10 flex items-center justify-center gap-2 font-bold tracking-widest text-sm uppercase">
              Register
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
            Mecharush '26
            <div className="w-10 h-px bg-[#e62e2d]/30" />
          </div>
          <div className="relative w-full max-w-[500px] h-[70px] sm:h-[100px] mx-auto mb-6">
            <Image src="/assets/tech_header.png" alt="TECH EVENTS" fill className="object-contain drop-shadow-[0_0_20px_rgba(230,46,45,0.4)]" priority />
          </div>
          <p className="text-white/30 text-lg max-w-xl mx-auto font-light">
            The core arenas of Mecharush&apos;26. Register via Google Forms to secure your spot.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {techEvents.map((e, i) => (
            <EventCard
              key={i}
              title={e.title || "TBA"}
              description={e.description || "Details TBA"}
              imageIcon={e.icon}
              imageUrl={e.imageUrl}
              coordinators={e.coordinators || []}
              coordinatorsPhones={e.coordinatorsPhones ? [e.coordinatorsPhones[0] || "", e.coordinatorsPhones[1] || ""] : ["", ""]}
              linkText="Register Now"
              linkUrl={e.linkUrl || "#"}
              rulebookUrl={e.rulebookUrl}
              rules={e.rules}
              delay={i * 0.08}
              accent="#e62e2d"
            />
          ))}
        </div>
        {/* Event Coordinators Section */}
        <div className="max-w-4xl mx-auto mt-20 pt-10 border-t border-[#e62e2d]/20">
           <h3 className="text-2xl font-black uppercase text-center text-white mb-8">
              Tech Event <span className="text-[#e62e2d]">Coordinators</span>
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center text-center hover:border-[#e62e2d]/50 transition-colors">
                 <div className="w-16 h-16 rounded-full bg-[#e62e2d]/20 flex items-center justify-center mb-4 border border-[#e62e2d]/50">
                    <Users className="text-[#e62e2d]" size={28} />
                 </div>
                 <h4 className="text-xl font-bold text-white mb-1">Sathick. A.S</h4>
                 <p className="text-white/50 text-sm mb-3">Technical Events Coordinator</p>
                 <a href="tel:+916381032845" className="text-[#e62e2d] hover:text-white transition-colors font-mono">+91 63810 32845</a>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center text-center hover:border-[#e62e2d]/50 transition-colors">
                 <div className="w-16 h-16 rounded-full bg-[#e62e2d]/20 flex items-center justify-center mb-4 border border-[#e62e2d]/50">
                    <Users className="text-[#e62e2d]" size={28} />
                 </div>
                 <h4 className="text-xl font-bold text-white mb-1">Mohammed Mudassir Basha</h4>
                 <p className="text-white/50 text-sm mb-3">Technical Events Coordinator</p>
                 <a href="mailto:mudassir@mecharush.in" className="text-[#e62e2d] hover:text-white transition-colors font-mono">mudassir@mecharush.in</a>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
