"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import EventCard from "../components/EventCard";
import { Gamepad2, Users, Calendar, MapPin, ChevronRight, Trophy, Zap, AlertCircle, Palette, Camera } from "lucide-react";

const nonTechEvents = [
  {
    title: "IPL Auction",
    description: "A multi-stage strategy competition where participants simulate the role of franchise owners. Build your team while staying within a budget.",
    coordinators: ["Haarun", "Gokul Raj"],
    coordinatorsPhones: ["+91 7305272864", "+91 7200204875"],
    icon: <Users size={20} />,
    imageUrl: "/assets/1773476155332_2.png",
    linkUrl: "https://docs.google.com/forms/d/e/1FAIpQLSc7A04ZbeAl3vA5tdbmhmxxYJZuT4mSdz9QFjKdl8NkNfGF9g/viewform?usp=publish-editor",
    rules: [
      "Team should consist of 2 to 4 members",
      "Registration fee for the event is Rs. 300",
      "Judge's or Organiser's decision is final",
      "Before registering, read the complete rule book first"
    ],
    rulebookUrl: "/rulebooks/MockIPLAuction_Mecharush26.pdf",
  },
  {
    title: "Football Tournament",
    description: "A high-energy, competitive 5-a-side football tournament designed to test participants' teamwork, agility, tactical awareness, and physical endurance in a fast-paced format.",
    coordinators: ["Abubakar", "Afthal"],
    coordinatorsPhones: ["+91 9894815326", "+91 6369554088"],
    icon: <Trophy size={20} />,
    imageUrl: "/assets/events/football.png",
    linkUrl: "https://docs.google.com/forms/d/e/1FAIpQLSct1yHkTXW7DyKgtvmpeyUgLGo5ceoFGhw7c_cifZfcDEyXig/viewform?usp=dialog",
    rules: [
      "Team should consist of 5 to 7 members",
      "Registration fee for the event is Rs. 500",
      "Judge's or Organiser's decision is final",
      "Before registering, read the complete rule book first"
    ],
    rulebookUrl: "/rulebooks/FootballTournament_Mecharush26.pdf",
  },
  {
    title: "Crescent Chess Knockout",
    description: "An intense 1v1 chess competition featuring multiple rounds, including Blitz and Rapid formats, challenging intellectual depth, strategic planning, and tactical precision.",
    coordinators: ["Benny Samuel", "VS. Susikaran"],
    coordinatorsPhones: ["+91 9884666827", "+91 7305432674"],
    icon: <Users size={20} />,
    imageUrl: "/assets/events/chess.png",
    linkUrl: "https://docs.google.com/forms/d/e/1FAIpQLSccs4gxVlXE-Xb9BsJMLIKVV0z9MiutHwLhiW5MbKmoG6Q7iQ/viewform?usp=publish-editor",
    rules: [
      "Team should consist of 1 member",
      "Registration fee for the event is Rs. 100",
      "Judge's or Organiser's decision is final",
      "Before registering, read the complete rule book first"
    ],
    rulebookUrl: "/rulebooks/CrescentChess_Mecharush26.pdf",
  },
  {
    title: "Photography",
    description: "Capture the dynamic spirit of the symposium's events, along with the aesthetic and architectural elements of the Mechanical Department, focusing on composition, lighting, and narrative.",
    coordinators: ["Ashraf", "Ajmal Ahamed"],
    coordinatorsPhones: ["+91 9363592725", "+91 7010438504"],
    icon: <Camera size={20} />,
    imageUrl: "/events/non-tech/photography.png",
    linkUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeBTB_FPq_gCv5ZolOytsdCa8_DfYyX1R3DqUH4X62pWLkaUA/viewform?usp=publish-editor",
    rules: [
      "Team should consist of 1 member",
      "Registration fee for the event is Rs. 100",
      "Judge's or Organiser's decision is final",
      "Before registering, read the complete rule book first"
    ],
    rulebookUrl: "/rulebooks/Photography_Mecharush26.pdf",
  },
  {
    title: "Tote-Bag Painting",
    description: "A creative painting competition that challenges the artistic skill of participants through the transformation of blank tote bags into creative art. Focuses on visual composition and color harmony.",
    coordinators: ["Raiyan Abdul Hakeem", "Kowshika.T"],
    coordinatorsPhones: ["+91 7845980047", "+91 6369280827"],
    icon: <Palette size={20} />,
    imageUrl: "/events/non-tech/tote_bag.png",
    linkUrl: "https://forms.gle/AFhfQP5G5rVzZokK6",
    rules: [
      "Team should consist of 1 to 2 members",
      "Registration fee for the event is Rs. 200",
      "Judge's or Organiser's decision is final",
      "Before registering, read the complete rule book first"
    ],
    rulebookUrl: "/rulebooks/ToteBagPainting_Mecharush26.pdf",
  },
];

export default function NonTechEventsPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-6 relative">
      {/* Background */}
      <div className="fixed inset-0 z-[0] pointer-events-none">
        <Image src="/assets/bg/martian_habitat.png" alt="Non-Tech Events Background" fill className="object-cover opacity-30 mix-blend-luminosity filter blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 text-xs tracking-[0.35em] text-white/20 uppercase font-bold mb-4 ml-4">
            <div className="w-10 h-px bg-white/15" />
            <span className="relative z-10 flex items-center justify-center gap-2 font-bold tracking-widest text-sm uppercase">
              Register
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="w-10 h-px bg-white/15" />
          </div>
          <div className="relative w-full max-w-[500px] h-[70px] sm:h-[100px] mx-auto mb-6">
            <Image src="/assets/non_tech_header.png" alt="NON-TECH EVENTS" fill className="object-contain drop-shadow-[0_0_20px_rgba(200,200,200,0.3)]" priority />
          </div>
          <p className="text-white/30 text-lg max-w-xl mx-auto font-light">
            Take a break from the machines. Register via Google Forms to participate.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {nonTechEvents.map((e, i) => (
            <EventCard
              key={i}
              title={e.title || "TBA"}
              description={e.description || "Details coming soon"}
              coordinators={e.coordinators || []}
              coordinatorsPhones={e.coordinatorsPhones || []}
              imageIcon={e.icon}
              imageUrl={e.imageUrl}
              linkText="Register Now"
              linkUrl={e.linkUrl || "#"}
              rulebookUrl={e.rulebookUrl}
              rules={e.rules}
              delay={i * 0.08}
              accent="#c0c8d8"
            />
          ))}
        </div>
        {/* Event Coordinators Section */}
        <div className="max-w-4xl mx-auto mt-20 pt-10 border-t border-[#e62e2d]/20">
          <h3 className="text-2xl font-black uppercase text-center text-white mb-8">
            Non-Tech Event <span className="text-[#e62e2d]">Coordinators</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center text-center hover:border-[#e62e2d]/50 transition-colors">
              <div className="w-16 h-16 rounded-full bg-[#e62e2d]/20 flex items-center justify-center mb-4 border border-[#e62e2d]/50">
                <Users className="text-[#e62e2d]" size={28} />
              </div>
              <h4 className="text-xl font-bold text-white mb-1">Susikaran V</h4>
              <p className="text-white/50 text-sm mb-3">Non-Technical Coordinator</p>
              <a href="tel:+917305432674" className="text-[#e62e2d] hover:text-white transition-colors font-mono">+91 73054 32674</a>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center text-center hover:border-[#e62e2d]/50 transition-colors">
              <div className="w-16 h-16 rounded-full bg-[#e62e2d]/20 flex items-center justify-center mb-4 border border-[#e62e2d]/50">
                <Users className="text-[#e62e2d]" size={28} />
              </div>
              <h4 className="text-xl font-bold text-white mb-1">Ajmal Ahamed</h4>
              <p className="text-white/50 text-sm mb-3">Non-Technical Coordinator</p>
              <a href="tel:+917010438504" className="text-[#e62e2d] hover:text-white transition-colors font-mono">+91 70104 38504</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
