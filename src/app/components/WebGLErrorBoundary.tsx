"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    errorMessage: string;
}

export class WebGLErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        errorMessage: ""
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, errorMessage: error.message };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("WebGL Error caught by boundary:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] bg-charcoal/50 rounded-xl border border-forge-red/30 p-8 text-center">
                    <AlertCircle size={48} className="text-forge-red mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2">Hardware Acceleration Disabled</h2>
                    <p className="text-metallic text-sm max-w-md">
                        Your browser could not create a WebGL context. Please enable Hardware Acceleration in your browser settings to view this interactive 3D simulation.
                    </p>
                    <p className="mt-4 text-xs font-mono text-forge-red/70">{this.state.errorMessage}</p>
                </div>
            );
        }

        return this.props.children;
    }
}
