"use client";

import { Eye, CloudLightning, CheckCircle2, AlertCircle } from "lucide-react";

interface HeaderProps {
  title: string;
  isConnected: boolean;
  error: string | null;
}

export default function Header({ title, isConnected, error }: HeaderProps) {
  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date().toLocaleDateString("en-US", options);
  };

  return (
    <header className="w-full border-b border-zinc-850/60 bg-[#06070a]/30 backdrop-blur-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Left Side: Brand Logo (Mobile only) & Section Title */}
        <div className="flex items-center gap-3">
          {/* Logo only visible on mobile (since sidebar contains it on desktop) */}
          <div className="md:hidden w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
            <img src="/logo.png" alt="SessionLens Logo" className="w-full h-full object-cover scale-[2.2]" />
          </div>
          
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
              {title}
            </h1>
            <p className="hidden sm:block text-xs text-zinc-500 font-medium tracking-wide mt-0.5">
              {getFormattedDate()}
            </p>
          </div>
        </div>

        {/* Right Side: API Status Indicator */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all duration-300 ${
              error
                ? "bg-rose-950/15 border-rose-900/30 text-rose-450 shadow-[0_0_15px_rgba(244,63,94,0.05)]"
                : "bg-indigo-950/15 border-indigo-900/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.05)]"
            }`}
          >
            {error ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-[11px] font-semibold tracking-wide font-mono uppercase">
                  API Offline
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-450 animate-pulse" />
                <span className="text-[11px] font-semibold tracking-wide font-mono uppercase text-zinc-300">
                  Synced
                </span>
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
