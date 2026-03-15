"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export default function CountdownTimer() {
    const calculateTimeLeft = (): TimeLeft => {
        // April 7, 2026, 09:00 AM (assuming 2026 based on metadata context)
        const eventDate = new Date("2026-04-07T09:00:00+05:30");
        const difference = +eventDate - +new Date();

        let timeLeft: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!mounted) {
        return (
            <div className="flex gap-4 sm:gap-8 justify-center mt-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <div className="text-4xl sm:text-6xl font-bold bg-charcoal/50 border border-foreground/5 backdrop-blur-sm rounded-lg w-16 sm:w-24 h-20 sm:h-24 flex items-center justify-center text-metallic animate-pulse">
                            -
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex gap-4 sm:gap-8 justify-center mt-8 font-mono">
            {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="flex flex-col items-center">
                    <div className="text-4xl sm:text-6xl font-bold bg-charcoal border border-foreground/10 backdrop-blur-sm shadow-xl rounded-lg w-16 sm:w-24 h-20 sm:h-24 flex items-center justify-center text-foreground relative overflow-hidden group">
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-forge-red transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        {String(value).padStart(2, "0")}
                    </div>
                    <span className="uppercase text-xs sm:text-sm mt-3 tracking-widest text-metallic opacity-80">
                        {unit}
                    </span>
                </div>
            ))}
        </div>
    );
}
