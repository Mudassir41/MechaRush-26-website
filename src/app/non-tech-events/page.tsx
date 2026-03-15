"use client";

import { motion } from "framer-motion";
import EventCard from "../components/EventCard";
import { Users, Palette, Trophy, Activity, Camera } from "lucide-react";

const nonTechEvents = [
    {
        title: "IPL Auction",
        description: "Strategy, bidding, and forming the ultimate dream team. Test your management and cricket knowledge.",
        coordinators: ["Gokulraj Cres Mech", "Haarun Shaiek Cres Mech"],
        icon: <Users size={24} />,
        linkUrl: "#unstop-ipl",
    },
    {
        title: "Toti Bag Painting",
        description: "Unleash your creative side. Transform a blank canvas into a masterpiece of art and expression.",
        coordinators: ["~Kowsee", "Raiyan Abdul Hakeem Cres Mech"],
        icon: <Palette size={24} />,
        linkUrl: "#unstop-painting",
    },
    {
        title: "Football Tournament",
        description: "The beautiful game. Form your squad of 5 and battle it out on the turf for ultimate glory.",
        coordinators: ["afthal ahmed cres mech", "~Renim Younus"],
        icon: <Trophy size={24} />,
        linkUrl: "#gforms-football",
    },
    {
        title: "Cricket Tournament",
        description: "A fast-paced box cricket showdown. Show your skills with the bat and ball.",
        coordinators: ["abbas cres mech", "Benny Samual Cres Mech Lateral"],
        icon: <Activity size={24} />,
        linkUrl: "#gforms-cricket",
    },
    {
        title: "Photography Contest",
        description: "Capture the rush. Document the symposium through your lens and win the best click award.",
        coordinators: ["Ashraf Cres"],
        icon: <Camera size={24} />,
        linkUrl: "#unstop-photo",
    },
];

export default function NonTechEventsPage() {
    return (
        <div className="flex flex-col items-center min-h-screen py-24 px-6 md:px-12 w-full max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-metallic/30 bg-metallic/10 text-metallic font-medium text-sm mb-6">
                    <span>Overall Coordinator: Susz Cres</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
                    <span className="text-metallic">Non-Tech</span> Events
                </h1>
                <p className="text-metallic max-w-2xl mx-auto text-lg">
                    Take a break from the machines. Register via Unstop or Google Forms to participate.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 bg-background lg:grid-cols-3 gap-6 w-full">
                {nonTechEvents.map((event, index) => (
                    <EventCard
                        key={event.title}
                        title={event.title}
                        description={event.description}
                        coordinators={event.coordinators}
                        imageIcon={event.icon}
                        linkText={event.linkUrl.includes("unstop") ? "Register on Unstop" : "Register via G-Forms"}
                        linkUrl={event.linkUrl}
                        delay={index * 0.1}
                    />
                ))}
            </div>
        </div>
    );
}
