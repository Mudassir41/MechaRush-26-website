"use client";

import { motion } from "framer-motion";
import EventCard from "../components/EventCard";
import { Users, Palette, Trophy, Activity, Camera } from "lucide-react";

const nonTechEvents = [
  {
    title: "IPL Auction",
    description: "Strategy, bidding, and forming the ultimate dream team. Test your management and cricket knowledge.",
    coordinators: ["Gokulraj Cres Mech", "Haarun Shaiek Cres Mech"],
    icon: <Users size={20} />,
    imageUrl: "/assets/forge_bg.jpg",
    linkUrl: "#unstop-ipl",
  },
  {
    title: "Tote Bag Painting",
    description: "Unleash your creative side. Transform a blank canvas into a masterpiece of art and expression.",
    coordinators: ["~Kowsee", "Raiyan Abdul Hakeem Cres Mech"],
    icon: <Palette size={20} />,
    imageUrl: "/assets/forge_bg.jpg",
    linkUrl: "#unstop-painting",
  },
  {
    title: "Football Tournament",
    description: "The beautiful game. Form your squad of 5 and battle it out on the turf for ultimate glory.",
    coordinators: ["Afthal Ahmed Cres Mech", "~Renim Younus"],
    icon: <Trophy size={20} />,
    imageUrl: "/assets/forge_bg.jpg",
    linkUrl: "#gforms-football",
  },
  {
    title: "Cricket Tournament",
    description: "A fast-paced box cricket showdown. Show your skills with the bat and ball.",
    coordinators: ["Abbas Cres Mech", "Benny Samual Cres Mech"],
    icon: <Activity size={20} />,
    imageUrl: "/assets/forge_bg.jpg",
    linkUrl: "#gforms-cricket",
  },
  {
    title: "Photography Contest",
    description: "Capture the rush. Document the symposium through your lens and win the best click award.",
    coordinators: ["Ashraf Cres"],
    icon: <Camera size={20} />,
    imageUrl: "/assets/forge_bg.jpg",
    linkUrl: "#unstop-photo",
  },
];

export default function NonTechEventsPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/40 text-xs font-bold tracking-widest uppercase mb-5">
            Overall Coordinator: Susz Cres
          </div>
          <div className="inline-flex items-center gap-2 text-xs tracking-[0.35em] text-white/20 uppercase font-bold mb-4 ml-4">
            <div className="w-10 h-px bg-white/15" />
            Mecharush '26
            <div className="w-10 h-px bg-white/15" />
          </div>
          <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter mb-4">
            <span className="text-gradient-silver">Non-Tech</span>{" "}
            <span className="text-white">Events</span>
          </h1>
          <p className="text-white/30 text-lg max-w-xl mx-auto font-light">
            Take a break from the machines. Register via Unstop or Google Forms to participate.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {nonTechEvents.map((e, i) => (
            <EventCard
              key={e.title}
              title={e.title}
              description={e.description}
              coordinators={e.coordinators}
              imageIcon={e.icon}
              imageUrl={e.imageUrl}
              linkText={e.linkUrl.includes("unstop") ? "Register on Unstop" : "Register via G-Forms"}
              linkUrl={e.linkUrl}
              delay={i * 0.08}
              accent="#c0c8d8"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
