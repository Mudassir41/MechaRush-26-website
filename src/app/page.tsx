"use client";

import CountdownTimer from "./components/CountdownTimer";
import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, MapPin, ChevronRight, Zap, Clock } from "lucide-react";

const scheduleItems = [
  { time: "09:00 AM", event: "Inauguration & Registration", desc: "Welcome address and kit distribution." },
  { time: "10:00 AM", event: "Events Kickoff (Slot 1)", desc: "All parallel Tech and Non-Tech events begin." },
  { time: "01:00 PM", event: "Lunch Break", desc: "Networking, food, and refreshments." },
  { time: "02:00 PM", event: "Events Resume (Slot 2)", desc: "Continuation of parallel events and finals." },
  { time: "04:30 PM", event: "Valedictory Sequence", desc: "Certificate distribution and closing ceremony." }
];

export default function Home() {
  return (
    <div className="flex flex-col items-center overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-background">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-forge-red/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-charcoal/40 via-background to-background" />
      </div>

      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center justify-center min-h-[90vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center w-full"
        >
          <div className="inline-flex flex-col items-center gap-2 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-forge-red/30 bg-forge-red/10 text-forge-red font-bold text-xs sm:text-sm text-center max-w-full">
              <span className="truncate">B.S. Abdur Rahman Crescent Institute of Science & Technology</span>
            </div>
            <div className="inline-flex items-center gap-2 text-metallic font-medium text-sm">
              <Zap size={16} className="text-forge-red fill-forge-red" />
              <span>The Ultimate Mechanical Symposium</span>
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter mb-6">
            Mecha<span className="text-gradient drop-shadow-2xl">rush</span> '26
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-metallic mb-12 font-light">
            Engineer the rush. Where heavy machinery meets high-speed innovation.
            Join the elite minds of Chennai's Mechanical engineering circuit.
          </p>

          {/* Quick Info Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <div className="flex items-center gap-3 text-foreground/90 glass-panel px-6 py-3 rounded-full">
              <Calendar className="text-forge-red" size={20} />
              <span className="font-medium text-lg tracking-wide">April 7, 2026</span>
            </div>
            <div className="flex items-center gap-3 text-foreground/90 glass-panel px-6 py-3 rounded-full">
              <MapPin className="text-forge-red" size={20} />
              <span className="font-medium text-lg tracking-wide">Vandalur, Chennai</span>
            </div>
          </div>

          <CountdownTimer />

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-16 mb-24"
          >
            <Link
              href="/tech-events"
              className="group relative px-8 py-4 bg-forge-red text-white font-bold rounded-md overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(230,46,45,0.6)]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center gap-2">
                Explore Tech Events <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              href="/non-tech-events"
              className="group px-8 py-4 bg-charcoal text-foreground font-bold rounded-md border border-foreground/10 hover:border-foreground/30 transition-all hover:bg-charcoal/80"
            >
              <span className="flex items-center gap-2">
                View Non-Tech Events
              </span>
            </Link>
          </motion.div>

          {/* Schedule Compact Grid Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-7xl mx-auto mt-20 md:mt-32 mb-20 px-4"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-foreground flex items-center justify-center gap-4">
                <Clock className="text-forge-red" size={36} />
                Event <span className="text-forge-red">Schedule</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {scheduleItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="glass-panel p-5 rounded-xl border border-foreground/10 hover:border-forge-red/30 transition-colors bg-charcoal/40 flex flex-col items-start h-full"
                >
                  <span className="inline-block px-3 py-1 rounded-md bg-foreground/5 text-forge-red font-bold text-xs mb-3 whitespace-nowrap">
                    {item.time}
                  </span>
                  <h3 className="text-base font-bold text-foreground mb-2 leading-tight">{item.event}</h3>
                  <p className="text-metallic text-xs leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Map Location Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-4xl mx-auto glass-panel p-2 rounded-2xl overflow-hidden mt-12"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.6293393051397!2d80.08272977462719!3d12.92984928738361!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52594a10e1189d%3A0x6b772c6e6e2f1e68!2sB.S.Abdur%20Rahman%20Crescent%20Institute%20of%20Science%20%26%20Technology!5e0!3m2!1sen!2sin!4v1708422606403!5m2!1sen!2sin"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-xl grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
            ></iframe>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
