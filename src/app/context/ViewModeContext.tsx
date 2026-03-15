"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type ViewMode = "icon" | "image";

interface ViewModeContextType {
    viewMode: ViewMode;
    toggleViewMode: () => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
    const [viewMode, setViewMode] = useState<ViewMode>("icon");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("mechrush-view-mode") as ViewMode | null;
        if (stored) {
            setViewMode(stored);
        }
    }, []);

    const toggleViewMode = () => {
        const newMode = viewMode === "icon" ? "image" : "icon";
        setViewMode(newMode);
        localStorage.setItem("mechrush-view-mode", newMode);
    };

    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <ViewModeContext.Provider value={{ viewMode, toggleViewMode }}>
            {children}
        </ViewModeContext.Provider>
    );
}

export function useViewMode() {
    const context = useContext(ViewModeContext);
    if (context === undefined) {
        throw new Error("useViewMode must be used within a ViewModeProvider");
    }
    return context;
}
