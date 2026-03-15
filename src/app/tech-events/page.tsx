"use client";

import { motion } from "framer-motion";
import EventCard from "../components/EventCard";
import { Hammer, Wrench, MessageSquare, PenTool, Bot, Target } from "lucide-react";

const techEvents = [
  {
    title: "Bridge Building",
    description: "Design and construct a structural masterpiece capable of holding maximum load using constrained materials. Prove your civil-mech instincts.",
    icon: <Hammer size={20} />,
    imageUrl: "/assets/forge_bg.jpg",
    coordinators: ["Shakthi Cres Mech", "Mudassir"],
    coordinatorsPhones: ["64643603144754", "N/A"],
    linkUrl: "#unstop-bridge",
  },
  {
    title: "Pitshop",
    description: "A fast-paced challenge testing your hands-on mechanical skills. Disassemble and reassemble an engine block against the clock.",
    icon: <Wrench size={20} />,
    imageUrl: "/assets/forge_bg.jpg",
    coordinators: ["Muneeb Cres Mech", "Pravin Rajan Cres Mech"],
    coordinatorsPhones: ["153523740213279", "6704745959584"],
    linkUrl: "#unstop-pitshop",
  },
  {
    title: "Quiz with Debate",
    description: "Test your theoretical mechanical knowledge and defend your technical viewpoints in a heated debate setting.",
    icon: <MessageSquare size={20} />,
    imageUrl: "/assets/forge_bg.jpg",
    coordinators: ["Dhanush Cres Mech", "Ajmal Afrize Cres Mech"],
    coordinatorsPhones: ["2173454823597", "128140433190954"],
    linkUrl: "#unstop-quiz",
  },
  {
    title: "CAD Modelling",
    description: "Blueprint Battles. Render complex 3D models against strict time constraints. Showcase your design matrix skills.",
    icon: <PenTool size={20} />,
    imageUrl: "/assets/forge_bg.jpg",
    coordinators: ["Abdul Ghani Cres", "Abdulla Cres Mech"],
    coordinatorsPhones: ["231632049025047", "202280074801293"],
    linkUrl: "#unstop-cad",
  },
  {
    title: "Pathfinder Robot",
    description: "Navigate an arduous terrain arena. Can your bot survive the ultimate test of durability and logic?",
    icon: <Bot size={20} />,
    imageUrl: "/assets/forge_bg.jpg",
    coordinators: ["Mudassir", "Akif Mech"],
    coordinatorsPhones: ["92316362653854", "71210826248343"],
    linkUrl: "#unstop-pathfinder",
  },
  {
    title: "PitchDeck Showdown",
    description: "The Mech Tank. Pitch your most innovative mechanical engineering idea to our panel of judges.",
    icon: <Target size={20} />,
    imageUrl: "/assets/forge_bg.jpg",
    coordinators: ["Sai Cres Mech", "+91 72001 47599"],
    coordinatorsPhones: ["174397432303707", "42198087287024"],
    linkUrl: "#unstop-pitchdeck",
  },
];

export default function TechEventsPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 text-xs tracking-[0.35em] text-[#e62e2d]/60 uppercase font-bold mb-5">
            <div className="w-10 h-px bg-[#e62e2d]/30" />
            Mecharush '26
            <div className="w-10 h-px bg-[#e62e2d]/30" />
          </div>
          <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter mb-4 text-white">
            Tech <span style={{ color: "#e62e2d" }}>Events</span>
          </h1>
          <p className="text-white/30 text-lg max-w-xl mx-auto font-light">
            The core arenas of Mecharush'26. Register via Unstop to secure your spot.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {techEvents.map((e, i) => (
            <EventCard
              key={e.title}
              title={e.title}
              description={e.description}
              imageIcon={e.icon}
              imageUrl={e.imageUrl}
              coordinators={e.coordinators}
              coordinatorsPhones={e.coordinatorsPhones}
              linkText="Register on Unstop"
              linkUrl={e.linkUrl}
              delay={i * 0.08}
              accent="#e62e2d"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
