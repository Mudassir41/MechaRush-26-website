"use client";

import { motion } from "framer-motion";
import EventCard from "../components/EventCard";
import { Hammer, Wrench, MessageSquare, PenTool, Bot, Target } from "lucide-react";

const techEvents = [
    {
        title: "Bridge Building",
        description: "Design and construct a structural masterpiece capable of holding maximum load using constrained materials. Prove your civil-mech instincts.",
        icon: <Hammer size={24} />,
        imageUrl: "/events/bridge_building.png",
        coordinators: ["Shakthi Cres Mech", "Mudassir"],
        coordinatorsPhones: ["64643603144754", "N/A"],
        linkUrl: "#unstop-bridge",
    },
    {
        title: "Pitshop",
        description: "A fast-paced challenge testing your hands-on mechanical skills. Disassemble and reassemble an engine block against the clock.",
        icon: <Wrench size={24} />,
        imageUrl: "/events/pitshop_engine.png",
        coordinators: ["Muneeb Cres Mech", "Pravin Rajan Cres Mech"],
        coordinatorsPhones: ["153523740213279", "6704745959584"],
        linkUrl: "#unstop-pitshop",
    },
    {
        title: "Quiz with Debate",
        description: "Test your theoretical mechanical knowledge and defend your technical viewpoints in a heated debate setting.",
        icon: <MessageSquare size={24} />,
        imageUrl: "/events/tech_quiz_debate.png",
        coordinators: ["Dhanush Cres Mech", "Ajmal Afrize Cres Mech"],
        coordinatorsPhones: ["2173454823597", "128140433190954"],
        linkUrl: "#unstop-quiz",
    },
    {
        title: "CAD Modelling",
        description: "Blueprint Battles. Render complex 3D models against strict time constraints. Show off your design matrix skills.",
        icon: <PenTool size={24} />,
        imageUrl: "/events/cad_modelling.png",
        coordinators: ["Abdul Ghani Cres", "Abdulla Cres Mech"],
        coordinatorsPhones: ["231632049025047", "202280074801293"],
        linkUrl: "#unstop-cad",
    },
    {
        title: "Pathfinder Robot",
        description: "Navigate an arduous and rough terrain arena. Can your bot survive the ultimate test of durability and logic?",
        icon: <Bot size={24} />,
        imageUrl: "/events/pathfinder_robot.png",
        coordinators: ["Mudassir", "Akif Mech"],
        coordinatorsPhones: ["92316362653854", "71210826248343"],
        linkUrl: "#unstop-pathfinder",
    },
    {
        title: "PitchDeck Showdown",
        description: "The Mech Tank. Pitch your most innovative mechanical engineering startup idea to our panel of judges.",
        icon: <Target size={24} />,
        imageUrl: "/events/pitchdeck_startup.png",
        coordinators: ["Sai Cres Mech", "+91 72001 47599"],
        coordinatorsPhones: ["174397432303707", "42198087287024"],
        linkUrl: "#unstop-pitchdeck",
    },
];

export default function TechEventsPage() {
    return (
        <div className="flex flex-col items-center min-h-screen py-24 px-6 md:px-12 w-full max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
            >
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
                    <span className="text-forge-red">Tech</span> Events
                </h1>
                <p className="text-metallic max-w-2xl mx-auto text-lg">
                    The core arenas of MechRush. Register via Unstop to secure your spot.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 bg-background lg:grid-cols-3 gap-6 w-full">
                {techEvents.map((event, index) => (
                    <EventCard
                        key={event.title}
                        title={event.title}
                        description={event.description}
                        imageIcon={event.icon}
                        imageUrl={event.imageUrl}
                        coordinators={event.coordinators}
                        coordinatorsPhones={event.coordinatorsPhones}
                        linkText="Register on Unstop"
                        linkUrl={event.linkUrl}
                        delay={index * 0.1}
                    />
                ))}
            </div>
        </div>
    );
}
