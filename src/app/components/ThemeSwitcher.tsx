"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";

type ThemeType = "theme-industrial" | "theme-modern" | "theme-neon" | "theme-blueprint";

const THEMES: { id: ThemeType; name: string }[] = [
    { id: "theme-industrial", name: "1. Dark Industrial" },
    { id: "theme-modern", name: "2. Clean Modern" },
    { id: "theme-neon", name: "3. Neon Racing" },
    { id: "theme-blueprint", name: "4. Blueprint" },
];

export default function ThemeSwitcher() {
    const [currentTheme, setCurrentTheme] = useState<ThemeType>("theme-industrial");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Apply theme to document element
        const root = document.documentElement;

        // Remove all theme classes first
        THEMES.forEach((t) => root.classList.remove(t.id));

        // Add new theme class
        if (currentTheme !== "theme-industrial") {
            root.classList.add(currentTheme);
        }
    }, [currentTheme]);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-metallic/30 hover:border-forge-red/50 transition-colors bg-charcoal/50 text-sm font-medium"
            >
                <Palette size={16} className="text-forge-red" />
                <span className="hidden sm:inline">Theme</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 glass-panel rounded-lg shadow-xl py-2 z-50 flex flex-col overflow-hidden">
                        {THEMES.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => {
                                    setCurrentTheme(theme.id);
                                    setIsOpen(false);
                                }}
                                className={`text-left px-4 py-3 text-sm transition-colors hover:bg-white/10 ${currentTheme === theme.id ? "text-forge-red font-bold" : "text-metallic"
                                    }`}
                            >
                                {theme.name}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
