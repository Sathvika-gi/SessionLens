"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, BookOpen, Search, Settings, Eye } from "lucide-react";

export type TabType = "dashboard" | "sessions" | "search" | "settings";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  theme?: "carbon" | "cobalt" | "cyberpunk";
}

export default function Sidebar({ activeTab, setActiveTab, theme = "carbon" }: SidebarProps) {
  const getSidebarAccents = () => {
    switch (theme) {
      case "cobalt":
        return {
          activeBg: "from-cyan-950/15 to-blue-950/10 border-cyan-500/20",
          activeBorder: "from-cyan-400 to-blue-500",
          activeIcon: "text-cyan-450 filter drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]",
          glowBg: "bg-cyan-500/5 group-hover:bg-cyan-500/10",
          statusText: "text-cyan-400/90"
        };
      case "cyberpunk":
        return {
          activeBg: "from-pink-950/15 to-fuchsia-950/10 border-pink-500/20",
          activeBorder: "from-pink-400 to-fuchsia-500",
          activeIcon: "text-pink-450 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]",
          glowBg: "bg-pink-500/5 group-hover:bg-pink-500/10",
          statusText: "text-pink-400/90"
        };
      case "carbon":
      default:
        return {
          activeBg: "from-indigo-650/15 to-purple-650/10 border-indigo-500/20",
          activeBorder: "from-indigo-400 to-purple-500",
          activeIcon: "text-indigo-450 filter drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]",
          glowBg: "bg-indigo-500/5 group-hover:bg-indigo-500/10",
          statusText: "text-indigo-400/90"
        };
    }
  };

  const accents = getSidebarAccents();
  const menuItems = [
    { id: "dashboard" as TabType, label: "Dashboard", icon: LayoutDashboard },
    { id: "sessions" as TabType, label: "Sessions", icon: BookOpen },
    { id: "search" as TabType, label: "Search", icon: Search },
    { id: "settings" as TabType, label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar (Left side, fixed) */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-[#08090d]/80 backdrop-blur-xl border-r border-zinc-850/60 p-6 z-20">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 mb-10 pl-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              SessionLens
            </h1>
            <p className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase">AI Activity Memory</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all group duration-200 outline-none`}
              >
                {/* Active Indicator Slider */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabSlider"
                    className={`absolute inset-0 bg-gradient-to-r ${accents.activeBg} rounded-xl`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Left Active Glow Border */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className={`absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b ${accents.activeBorder} rounded-r-full`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Icon with glow/colors */}
                <Icon
                  className={`w-5 h-5 relative z-10 transition-colors duration-200 ${
                    isActive
                      ? accents.activeIcon
                      : "text-zinc-500 group-hover:text-zinc-300"
                  }`}
                />

                {/* Text */}
                <span
                  className={`relative z-10 font-medium tracking-wide transition-colors duration-200 ${
                    isActive ? "text-zinc-100 font-semibold" : "text-zinc-400 group-hover:text-zinc-200"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto p-4 rounded-2xl bg-zinc-900/35 border border-zinc-800/40 relative overflow-hidden group">
          <div className={`absolute top-0 right-0 w-24 h-24 ${accents.glowBg} rounded-full blur-xl pointer-events-none transition-all duration-300`} />
          <p className={`text-[11px] ${accents.statusText} font-medium mb-1 tracking-wider uppercase font-mono`}>Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-350 font-medium">Memory Engine Active</span>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-[#08090d]/85 backdrop-blur-xl border border-zinc-800/60 rounded-2xl flex items-center justify-around px-4 py-2 z-30 shadow-2xl shadow-black/80">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="relative flex flex-col items-center justify-center flex-1 h-full rounded-xl py-1 outline-none group"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabSliderMobile"
                  className="absolute inset-x-2 inset-y-1 bg-zinc-800/40 border border-zinc-850 rounded-xl"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 relative z-10 transition-all duration-200 ${
                  isActive ? `${accents.statusText} scale-110` : "text-zinc-500"
                }`}
              />
              <span
                className={`text-[9px] font-medium tracking-wide mt-1 relative z-10 transition-colors duration-200 ${
                  isActive ? "text-zinc-150 font-bold" : "text-zinc-500"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
