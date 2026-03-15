"use client";

import { useViewMode } from "../context/ViewModeContext";
import { Image, X } from "lucide-react";
import { motion } from "framer-motion";

export default function ViewModeToggle() {
    const { viewMode, toggleViewMode } = useViewMode();

    return (
        <button
            onClick={toggleViewMode}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-foreground/10 bg-foreground/5 hover:bg-foreground/10 transition-colors text-xs font-bold uppercase tracking-wider text-foreground"
        >
            <div className="relative w-4 h-4 mr-1">
                <motion.div
                    initial={false}
                    animate={{ opacity: viewMode === "image" ? 1 : 0, scale: viewMode === "image" ? 1 : 0 }}
                    className="absolute inset-0 flex items-center justify-center text-forge-red"
                >
                    <Image size={16} />
                </motion.div>
                <motion.div
                    initial={false}
                    animate={{ opacity: viewMode === "icon" ? 1 : 0, scale: viewMode === "icon" ? 1 : 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <X size={16} /> {/* Placeholder icon for "Icon view" if we want, or just a distinct shape */}
                </motion.div>
            </div>
            {viewMode === "image" ? "Image View" : "Icon View"}
        </button>
    );
}
