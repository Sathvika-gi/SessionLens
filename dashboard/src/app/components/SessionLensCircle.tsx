"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Session } from "../utils/sessionizer";
import { Clock, Laptop, Compass, Heart } from "lucide-react";

interface SessionLensCircleProps {
  sessions: Session[];
}

export default function SessionLensCircle({ sessions }: SessionLensCircleProps) {
  const [hoveredSession, setHoveredSession] = useState<Session | null>(null);

  // Group today's sessions (within the last 24h for visual purposes)
  const todaySessions = useMemo(() => {
    const now = new Date();
    return sessions.filter((session) => {
      const sessDate = new Date(session.startTime);
      // Within last 24 hours
      return now.getTime() - sessDate.getTime() < 24 * 60 * 60 * 1000;
    });
  }, [sessions]);

  // Aggregate statistics for the day
  const stats = useMemo(() => {
    const totalMs = todaySessions.reduce((acc, s) => acc + s.durationMs, 0);
    const totalMinutes = Math.floor(totalMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    
    // Find dominant category
    const catCounts: Record<string, number> = {};
    todaySessions.forEach(s => {
      catCounts[s.category] = (catCounts[s.category] || 0) + s.durationMs;
    });

    let dominantCat = "None";
    let maxTime = -1;
    for (const [cat, ms] of Object.entries(catCounts)) {
      if (ms > maxTime) {
        maxTime = ms;
        dominantCat = cat;
      }
    }

    return {
      count: todaySessions.length,
      durationStr: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
      dominantCat
    };
  }, [todaySessions]);

  // SVG Circle Geometry Constants
  const radius = 90;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius; // ~565.48
  const centerCoord = 120; // 240px wide box

  // Map category to color hex codes
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Software Engineering":
        return "#6366f1"; // Indigo
      case "Artificial Intelligence":
        return "#a855f7"; // Purple
      case "Product Design":
        return "#ec4899"; // Pink
      case "Productivity & Docs":
        return "#f59e0b"; // Amber
      case "Learning & Research":
        return "#14b8a6"; // Teal
      case "Leisure & Entertainment":
        return "#0ea5e9"; // Sky
      default:
        return "#64748b"; // Slate
    }
  };

  const getCategoryGlow = (category: string) => {
    switch (category) {
      case "Software Engineering":
        return "rgba(99, 102, 241, 0.4)";
      case "Artificial Intelligence":
        return "rgba(168, 85, 247, 0.4)";
      case "Product Design":
        return "rgba(236, 72, 153, 0.4)";
      case "Productivity & Docs":
        return "rgba(245, 158, 11, 0.4)";
      case "Learning & Research":
        return "rgba(20, 184, 166, 0.4)";
      case "Leisure & Entertainment":
        return "rgba(14, 165, 233, 0.4)";
      default:
        return "rgba(100, 116, 139, 0.4)";
    }
  };

  // Compile segments details (weights, offsets)
  const segments = useMemo(() => {
    if (todaySessions.length === 0) return [];
    
    // Sort chronologically to represent the journey sequentially
    const sorted = [...todaySessions].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    const totalDuration = sorted.reduce((acc, s) => acc + s.durationMs, 0);

    let accumulatedOffset = 0;

    return sorted.map((session) => {
      const fraction = session.durationMs / totalDuration;
      const segmentLen = fraction * circumference;
      
      // Calculate start and end offset
      const offset = accumulatedOffset;
      accumulatedOffset += segmentLen;

      return {
        session,
        length: segmentLen,
        offset: -offset, // Negative because dashoffset moves backward
        color: getCategoryColor(session.category),
        glow: getCategoryGlow(session.category)
      };
    });
  }, [todaySessions, circumference]);

  return (
    <div className="relative w-full flex flex-col items-center justify-center p-8 bg-zinc-900/20 border border-zinc-850/60 rounded-3xl backdrop-blur-md overflow-hidden group">
      
      {/* Top Background Glow Effect */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-500" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/10 transition-all duration-500" />

      {/* Header Info */}
      <div className="w-full flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-zinc-400 font-semibold tracking-wider uppercase font-mono">Today's Journey</span>
        </div>
        <div className="text-xs text-zinc-500 font-medium">
          {todaySessions.length} {todaySessions.length === 1 ? "Session" : "Sessions"}
        </div>
      </div>

      {/* The circular graph panel */}
      <div className="relative w-[240px] h-[240px] flex items-center justify-center select-none">
        
        {/* SVG Container */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
          
          {/* Base Background Track Circle */}
          <circle
            cx={centerCoord}
            cy={centerCoord}
            r={radius}
            fill="transparent"
            stroke="rgba(39, 39, 42, 0.3)"
            strokeWidth={strokeWidth}
          />

          {/* Dynamic Segments */}
          {todaySessions.length > 0 ? (
            segments.map((seg, idx) => {
              const isHovered = hoveredSession?.id === seg.session.id;
              
              // We create gap space between segments by decreasing stroke length slightly
              const hasMultiple = segments.length > 1;
              const gapVal = hasMultiple ? 3.5 : 0;
              const displayLength = Math.max(1, seg.length - gapVal);

              return (
                <motion.circle
                  key={seg.session.id}
                  cx={centerCoord}
                  cy={centerCoord}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${displayLength} ${circumference}`}
                  strokeDashoffset={seg.offset}
                  strokeLinecap={hasMultiple ? "butt" : "round"}
                  onMouseEnter={() => setHoveredSession(seg.session)}
                  onMouseLeave={() => setHoveredSession(null)}
                  className="cursor-pointer transition-all duration-300 origin-center"
                  style={{
                    filter: isHovered 
                      ? `drop-shadow(0 0 8px ${seg.color})` 
                      : "none",
                  }}
                  animate={{
                    scale: isHovered ? 1.03 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              );
            })
          ) : (
            // No sessions placeholder circle
            <circle
              cx={centerCoord}
              cy={centerCoord}
              r={radius}
              fill="transparent"
              stroke="#27272a"
              strokeWidth={strokeWidth}
              strokeDasharray="4 4"
            />
          )}
        </svg>

        {/* Center Panel (Information Display) */}
        <div className="absolute inset-[36px] bg-[#0c0d12] border border-zinc-800/50 rounded-full flex flex-col items-center justify-center p-4 text-center backdrop-blur-md shadow-inner shadow-black/40">
          <AnimatePresence mode="wait">
            {hoveredSession ? (
              <motion.div
                key={hoveredSession.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col items-center max-w-full"
              >
                {/* Hovered Session State */}
                <span 
                  className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full mb-1 border border-opacity-40"
                  style={{
                    color: getCategoryColor(hoveredSession.category),
                    borderColor: getCategoryColor(hoveredSession.category),
                    backgroundColor: `${getCategoryColor(hoveredSession.category)}10`
                  }}
                >
                  {hoveredSession.category}
                </span>
                
                <h3 className="text-xs font-bold text-zinc-100 line-clamp-2 px-1 max-w-[125px] leading-tight mb-1">
                  {hoveredSession.title}
                </h3>
                
                <p className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                  {hoveredSession.durationString}
                </p>

                <p className="text-[9px] text-zinc-500 mt-0.5">
                  {hoveredSession.websitesCount} {hoveredSession.websitesCount === 1 ? "website" : "websites"}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="summary-stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                {/* Default Center State */}
                {todaySessions.length > 0 ? (
                  <>
                    <Laptop className="w-5 h-5 text-indigo-400/80 mb-1" />
                    
                    <span className="text-2xl font-black text-zinc-100 tracking-tight font-mono">
                      {stats.durationStr}
                    </span>
                    
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                      Active Time
                    </span>
                    
                    <span className="text-[9px] text-indigo-300 font-medium mt-1 truncate max-w-[110px]">
                      {stats.dominantCat ? `Focus: ${stats.dominantCat}` : ""}
                    </span>
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 text-zinc-600 mb-1 animate-pulse" />
                    <span className="text-xs font-semibold text-zinc-550 leading-tight">
                      Awaiting Activity
                    </span>
                    <span className="text-[9px] text-zinc-600 mt-1 max-w-[100px] leading-snug">
                      Start browsing to compile lens
                    </span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend Indicators */}
      {todaySessions.length > 0 && (
        <div className="w-full flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-6 border-t border-zinc-850/40 pt-5">
          {Array.from(new Set(todaySessions.map((s) => s.category))).map((cat) => (
            <div key={cat} className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: getCategoryColor(cat) }}
              />
              <span>{cat}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
