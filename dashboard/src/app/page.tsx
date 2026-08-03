"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar, { TabType } from "./components/Sidebar";
import Header from "./components/Header";
import SessionLensCircle from "./components/SessionLensCircle";
import SessionCard from "./components/SessionCard";
import EmptyState from "./components/EmptyState";
import LoadingSkeleton from "./components/LoadingSkeleton";
import { groupActivitiesIntoSessions, Activity, Session, getDomain } from "./utils/sessionizer";

// Icons
import {
  Search,
  Download,
  AlertTriangle,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Calendar,
  Filter,
  Check,
  FileJson
} from "lucide-react";

// Fixed start time evaluated once on page load to prevent React key changes and card collapses during polling
const DEMO_START_TIME = Date.now();

// Pre-seeded high-fidelity demonstration activities
const DEMO_ACTIVITIES = (): Activity[] => {
  const now = DEMO_START_TIME;
  return [
    // Session 1: Software Engineering (React Lifecycle)
    {
      _id: "demo_1",
      url: "http://localhost:3000/dashboard",
      title: "SessionLens Dashboard Dev Server Localhost",
      timestamp: new Date(now - 3 * 60 * 1000).toISOString(), // 3 mins ago
      eventType: "tab_activated"
    },
    {
      _id: "demo_2",
      url: "https://github.com/facebook/react/issues/123",
      title: "React Hooks Lifecycle Bug Discussion - facebook/react",
      timestamp: new Date(now - 6 * 60 * 1000).toISOString(), // 6 mins ago
      eventType: "url_updated"
    },
    {
      _id: "demo_3",
      url: "https://react.dev/reference/react/useEffect",
      title: "useEffect Reference Documentation - React Docs",
      timestamp: new Date(now - 9 * 60 * 1000).toISOString(), // 9 mins ago
      eventType: "tab_activated"
    },
    // Session 2: AI Assistant
    {
      _id: "demo_4",
      url: "https://chatgpt.com/c/chat-session-uuid-99",
      title: "Optimizing SVG Donut Chart Paths - ChatGPT",
      timestamp: new Date(now - 25 * 60 * 1000).toISOString(), // 25 mins ago
      eventType: "url_updated"
    },
    {
      _id: "demo_5",
      url: "https://claude.ai/chat/321",
      title: "Framer Motion Height Auto Expand Animation - Claude",
      timestamp: new Date(now - 28 * 60 * 1000).toISOString(), // 28 mins ago
      eventType: "tab_activated"
    },
    // Session 3: Product Design
    {
      _id: "demo_6",
      url: "https://figma.com/file/sessionlens-v2-wireframe",
      title: "SessionLens Premium Redesign Mockups - Figma UI",
      timestamp: new Date(now - 2.1 * 60 * 60 * 1000).toISOString(), // 2.1 hrs ago
      eventType: "url_updated"
    },
    {
      _id: "demo_7",
      url: "https://dribbble.com/tags/dark-ui",
      title: "Trending Sleek Dark Mode UI Layouts - Dribbble",
      timestamp: new Date(now - 2.3 * 60 * 60 * 1000).toISOString(), // 2.3 hrs ago
      eventType: "tab_activated"
    },
    // Session 4: Learning & Research
    {
      _id: "demo_8",
      url: "https://en.wikipedia.org/wiki/Human_interface_guidelines",
      title: "Human Interface Guidelines History - Wikipedia",
      timestamp: new Date(now - 5.1 * 60 * 60 * 1000).toISOString(), // 5.1 hrs ago
      eventType: "url_updated"
    },
    {
      _id: "demo_9",
      url: "https://arxiv.org/abs/2312.0001",
      title: "Attention is All You Need LLM Transformer Paper - arXiv",
      timestamp: new Date(now - 5.3 * 60 * 60 * 1000).toISOString(), // 5.3 hrs ago
      eventType: "tab_activated"
    },
    // Session 5: Social / Leisure
    {
      _id: "demo_10",
      url: "https://reddit.com/r/reactjs/comments/abc",
      title: "Is Next.js too complex for simple portfolios? - Reddit",
      timestamp: new Date(now - 8.2 * 60 * 60 * 1000).toISOString(), // 8.2 hrs ago
      eventType: "url_updated"
    },
    {
      _id: "demo_11",
      url: "https://youtube.com/watch?v=hooks-guide",
      title: "React Hooks Deep Dive Crash Course - YouTube Video",
      timestamp: new Date(now - 8.5 * 60 * 60 * 1000).toISOString(), // 8.5 hrs ago
      eventType: "tab_activated"
    }
  ];
};

export default function Home() {
  // Navigation & Page Layout State
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isClient, setIsClient] = useState(false);
  const [theme, setTheme] = useState<"carbon" | "cobalt" | "cyberpunk">("carbon");

  // Backend Integration & Core State
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Search Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("All");
  const [searchDate, setSearchDate] = useState("");

  // Settings State
  const [aiModel, setAiModel] = useState("local-matcher");
  const [permissions, setPermissions] = useState({
    history: true,
    tabs: true,
    scripting: false
  });

  // Set hydration flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch activities from backend API
  const fetchActivities = async () => {
    try {
      const response = await fetch("http://localhost:5000/activity");
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }
      const json = await response.json();
      
      if (json.success && json.data) {
        setActivities(json.data);
        setError(null);
        setIsDemoMode(false);
      }
    } catch (err: any) {
      console.warn("Backend API not reachable, loading visual demo mode:", err.message);
      // Backend is offline, fall back to high-fidelity mockups for demo
      setActivities(DEMO_ACTIVITIES());
      setIsDemoMode(true);
      setError("Database connection offline. Showing simulated workspace activity.");
    } finally {
      setLoading(false);
    }
  };

  // Poll for live activity streams
  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 4000);
    return () => clearInterval(interval);
  }, []);

  // Group activities into sessions
  const sessions = useMemo(() => {
    return groupActivitiesIntoSessions(activities);
  }, [activities]);

  // Today's sessions for Dashboard view
  const todaySessions = useMemo(() => {
    const todayStr = new Date().toDateString();
    return sessions.filter(s => new Date(s.startTime).toDateString() === todayStr);
  }, [sessions]);

  // Search results query logic
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const query = searchQuery.toLowerCase().trim();
      
      // Filter by category
      if (searchCategory !== "All" && session.category !== searchCategory) {
        return false;
      }
      
      // Filter by date
      if (searchDate) {
        const sessDate = new Date(session.startTime).toISOString().split("T")[0];
        if (sessDate !== searchDate) return false;
      }

      // Filter by search text query (Title, Category, Summary, URL/Domain)
      if (query) {
        const titleMatch = session.title.toLowerCase().includes(query);
        const categoryMatch = session.category.toLowerCase().includes(query);
        const summaryMatch = session.summary.toLowerCase().includes(query);
        const domainMatch = session.websites.some(dom => dom.toLowerCase().includes(query));
        const titleEventMatch = session.events.some(e => e.title.toLowerCase().includes(query));
        
        return titleMatch || categoryMatch || summaryMatch || domainMatch || titleEventMatch;
      }

      return true;
    });
  }, [sessions, searchQuery, searchCategory, searchDate]);

  // Export current browsing memory logs
  const handleExportData = async () => {
    setExporting(true);
    try {
      // Helper to format timestamps
      const formatDateTime = (dateObj: Date | string | number) => {
        try {
          const date = new Date(dateObj);
          return date.toLocaleString();
        } catch (e) {
          return String(dateObj);
        }
      };

      const formatTimeOnly = (dateObj: Date | string | number) => {
        try {
          const date = new Date(dateObj);
          return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        } catch (e) {
          return "";
        }
      };

      let report = `# SessionLens Consolidated Workspace Activity Report\n\n`;
      report += `Generated on: ${new Date().toLocaleString()}\n`;
      report += `Total Sessions Captured: ${sessions.length}\n\n`;
      
      report += `## 📋 Table of Contents\n`;
      const sortedSessions = [...sessions].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      
      sortedSessions.forEach((session, index) => {
        report += `${index + 1}. [Session: ${session.title} (#session-${session.id})]\n`;
      });
      report += `\n---\n\n`;

      if (sortedSessions.length === 0) {
        report += `*No active sessions found in the database.*`;
      } else {
        // Run all session analyses in parallel from backend storage!
        const analyzedSessions = await Promise.all(
          sortedSessions.map(async (session, index) => {
            let aiTitle = session.title;
            let aiCategory = session.category;
            let aiSummary = session.summary;
            let aiTags = [session.category, ...session.websites.slice(0, 2)];
            
            if (!error && isDemoMode === false) {
              try {
                const aiResponse = await fetch("http://localhost:5000/api/ai/analyze-session", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    events: session.events.map(e => ({
                      url: e.url,
                      title: e.title,
                      timestamp: e.timestamp,
                      eventType: e.eventType,
                      screenshot: e.screenshot,
                      video: e.video
                    }))
                  })
                });
                
                if (aiResponse.ok) {
                  const aiJson = await aiResponse.json();
                  if (aiJson.success && aiJson.data) {
                    aiTitle = aiJson.data.sessionTitle || aiJson.data.title;
                    aiCategory = aiJson.data.category;
                    aiSummary = aiJson.data.summary;
                    aiTags = aiJson.data.tags || aiTags;
                  }
                }
              } catch (err) {
                console.warn("Gemini AI API call failed during export, falling back to rule-based sessionizer metadata:", err);
              }
            }
            
            return {
              ...session,
              aiTitle,
              aiCategory,
              aiSummary,
              aiTags,
              index
            };
          })
        );

        // Compile report sequentially from resolved results
        analyzedSessions.forEach((session) => {
          report += `<a name="session-${session.id}"></a>\n`;
          report += `### 📂 Session ${session.index + 1}: ${session.aiTitle}\n\n`;
          report += `* **Category**: ${session.aiCategory}\n`;
          report += `* **Time Frame**: ${formatDateTime(session.startTime)} - ${formatDateTime(session.endTime)}\n`;
          report += `* **Duration**: ${session.durationString} (${session.durationMs}ms)\n`;
          report += `* **Recorded Events**: ${session.events.length} actions\n\n`;
          
          report += `#### 💡 Focus Summary & Analysis\n`;
          report += `> ${session.aiSummary}\n\n`;
          
          report += `#### 🌐 Websites Visited\n`;
          session.websites.forEach(site => {
            report += `* \`${site}\`\n`;
          });
          report += `\n`;

          report += `#### 🏷️ Semantic Tags\n`;
          session.aiTags.forEach(t => {
            report += `* \`${t}\`\n`;
          });
          report += `\n`;

          report += `#### ⏳ Captured Event Timeline\n`;
          if (session.events && session.events.length > 0) {
            const sortedEvents = [...session.events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            sortedEvents.forEach(evt => {
              report += `* **${formatTimeOnly(evt.timestamp)}** - *${evt.title}* | [${evt.eventType}] (${evt.url})\n`;
            });
          }
          report += `\n---\n\n`;
        });
      }

      report += `*Report generated by SessionLens AI. All rights reserved. Database records persisted in MongoDB.*`;

      // Trigger Blob-based markdown download
      const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = url;
      downloadAnchor.download = `sessionlens_consolidated_report_${new Date().toISOString().split("T")[0]}.md`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
    setExporting(false);
  };

  // Get Page Header Titles
  const getPageHeaderDetails = () => {
    switch (activeTab) {
      case "dashboard":
        return "Today's Lens";
      case "sessions":
        return "Digital Journal";
      case "search":
        return "Memory Search";
      case "settings":
        return "Preferences";
      default:
        return "SessionLens";
    }
  };

  if (!isClient) return null; // Prevent hydration flash

  // Define accent styles based on active theme
  const getThemeAccents = () => {
    switch (theme) {
      case "cobalt":
        return {
          bgGrad: "from-cyan-950/15 via-blue-950/5",
          accentColor: "cyan",
          flare: "bg-cyan-500/5",
          accentText: "text-cyan-400",
          accentHoverText: "hover:text-cyan-300",
          accentBg: "bg-cyan-500/10",
          accentBorder: "border-cyan-500/20",
          accentSolid: "bg-cyan-500",
          pulseBorder: "border-cyan-900/30",
          focusBorder: "focus:border-cyan-500"
        };
      case "cyberpunk":
        return {
          bgGrad: "from-pink-950/15 via-purple-950/5",
          accentColor: "pink",
          flare: "bg-pink-500/5",
          accentText: "text-pink-400",
          accentHoverText: "hover:text-pink-300",
          accentBg: "bg-pink-500/10",
          accentBorder: "border-pink-500/20",
          accentSolid: "bg-pink-500",
          pulseBorder: "border-pink-900/30",
          focusBorder: "focus:border-pink-500"
        };
      case "carbon":
      default:
        return {
          bgGrad: "from-indigo-950/15 via-purple-950/5",
          accentColor: "indigo",
          flare: "bg-indigo-500/5",
          accentText: "text-indigo-400",
          accentHoverText: "hover:text-indigo-300",
          accentBg: "bg-indigo-500/10",
          accentBorder: "border-indigo-500/20",
          accentSolid: "bg-indigo-500",
          pulseBorder: "border-indigo-900/30",
          focusBorder: "focus:border-indigo-500"
        };
    }
  };

  const themeAccents = getThemeAccents();

  return (
    <div className={`min-h-screen bg-[#050609] text-zinc-200 font-sans pb-24 md:pb-6 md:pl-64 transition-all duration-300`}>
      
      {/* Premium Gradient Top Flare */}
      <div className={`absolute top-0 left-0 right-0 h-[380px] bg-gradient-to-b ${themeAccents.bgGrad} to-transparent pointer-events-none z-0`} />

      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />

      {/* Main Page Layout */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Sync Header */}
        <Header
          title={getPageHeaderDetails()}
          isConnected={!error}
          error={error}
        />

        {/* Demo Mode Notice Banner */}
        {isDemoMode && (
          <div className={`mx-6 mt-4 p-3 ${themeAccents.accentBg} border ${themeAccents.pulseBorder} rounded-2xl flex items-center justify-between text-xs ${themeAccents.accentText}`}>
            <span className="flex items-center gap-2">
              <Sparkles className={`w-4.5 h-4.5 ${themeAccents.accentText} animate-pulse`} />
              <span>
                {error 
                  ? "Demonstration Mode Active: Connected to simulated visual storage feed." 
                  : "Welcome to SessionLens. Explore your simulated browser memory sessions below!"}
              </span>
            </span>
            <span className={`text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded ${themeAccents.accentBg} border ${themeAccents.accentBorder}`}>
              Demo Active
            </span>
          </div>
        )}

        {/* Dynamic Route Container */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full"
              >
                
                {/* 1. DASHBOARD PAGE */}
                {activeTab === "dashboard" && (
                  <div className="flex flex-col gap-8">
                    
                    {/* Hero circular visualizer */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                      
                      {/* Session Lens Circle (1 Column) */}
                      <div className="lg:col-span-1">
                        <SessionLensCircle sessions={activities.length > 0 ? sessions : []} />
                      </div>

                      {/* Productivity summary details (2 Columns) */}
                      <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#090b10]/40 border border-zinc-850/60 backdrop-blur-md h-full flex flex-col justify-between relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-36 h-36 ${themeAccents.flare} rounded-full blur-3xl pointer-events-none group-hover:opacity-100 transition-opacity`} />
                        
                        <div>
                          <h2 className="text-lg font-bold text-zinc-100 mb-2 flex items-center gap-2">
                            <Sparkles className={`w-4.5 h-4.5 ${themeAccents.accentText}`} />
                            AI Memory Assistant
                          </h2>
                          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                            SessionLens groups individual browser actions into coherent sessions. By tracking your navigation timeline, it automatically identifies development sprints, research sessions, and creative design blocks.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-zinc-900/35 border border-zinc-850">
                              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                                Today's Focus
                              </span>
                              <span className="text-sm font-semibold text-zinc-200">
                                {todaySessions.length > 0 
                                  ? "Software Development & AI" 
                                  : "Awaiting logs"}
                              </span>
                            </div>
                            <div className="p-4 rounded-2xl bg-zinc-900/35 border border-zinc-850">
                              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                                Unique Domains Today
                              </span>
                              <span className="text-sm font-semibold text-zinc-200">
                                {todaySessions.reduce((acc, s) => acc + s.websites.length, 0)} websites
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-zinc-850/40 flex items-center justify-between">
                          <span className="text-xs text-zinc-500">
                            Updates stream in real-time from extension
                          </span>
                          <button
                            onClick={() => setActiveTab("sessions")}
                            className={`text-xs font-semibold ${themeAccents.accentText} ${themeAccents.accentHoverText} transition-colors flex items-center gap-1`}
                          >
                            Explore full journal →
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Today's Sessions Card list */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-zinc-200 tracking-tight">
                          Today's Sessions
                        </h2>
                        <span className="text-xs text-zinc-500">
                          {todaySessions.length} {todaySessions.length === 1 ? "session" : "sessions"} today
                        </span>
                      </div>

                      {todaySessions.length === 0 ? (
                        <EmptyState type="empty" />
                      ) : (
                        <div className="space-y-4">
                          {todaySessions.map((session) => (
                            <SessionCard key={session.id} session={session} />
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* 2. SESSIONS PAGE (CHRONOLOGICAL JOURNAL) */}
                {activeTab === "sessions" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-zinc-150 tracking-tight">
                          All Sessions
                        </h2>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Chronological view of all browsing activities grouped into journal blocks
                        </p>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {sessions.length} sessions stored
                      </span>
                    </div>

                    {sessions.length === 0 ? (
                      <EmptyState type="empty" />
                    ) : (
                      <div className="space-y-4">
                        {sessions.map((session) => (
                          <SessionCard key={session.id} session={session} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. SEARCH PAGE */}
                {activeTab === "search" && (
                  <div className="space-y-6">
                    {/* Search Filters Bar */}
                    <div className="p-6 rounded-3xl bg-[#090b10]/40 border border-zinc-850/60 backdrop-blur-md flex flex-col gap-4">
                      
                      {/* Text Search Input */}
                      <div className="relative w-full">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Search className="h-4.5 w-4.5 text-zinc-500" />
                        </span>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search memory (website, title, category, summary keyword)..."
                          className={`w-full bg-[#06070a]/90 border border-zinc-850 hover:border-zinc-750 ${themeAccents.focusBorder} focus:ring-1 focus:ring-${themeAccents.accentColor}-500/30 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-zinc-200 placeholder-zinc-550 outline-none transition-all`}
                        />
                      </div>

                      {/* Dropdown Filters (Category, Date) */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-850/30 pt-4 mt-1">
                        
                        {/* Category tag filters */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-zinc-500 font-medium flex items-center gap-1.5 mr-2">
                            <Filter className="w-3.5 h-3.5" /> Filter Category:
                          </span>
                          {["All", "Software Engineering", "Artificial Intelligence", "Product Design", "Learning & Research", "Leisure & Entertainment"].map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setSearchCategory(cat)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                searchCategory === cat
                                  ? `${themeAccents.accentBg} ${themeAccents.accentBorder} ${themeAccents.accentText}`
                                  : "bg-zinc-950/20 border-zinc-850 hover:border-zinc-800 text-zinc-450 hover:text-zinc-300"
                              }`}
                            >
                              {cat.split(" ")[0]} {/* Shorten name for responsive space */}
                            </button>
                          ))}
                        </div>

                        {/* Date Filter Input */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> Date:
                          </span>
                          <input
                            type="date"
                            value={searchDate}
                            onChange={(e) => setSearchDate(e.target.value)}
                            className={`bg-[#06070a]/60 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-zinc-300 outline-none hover:border-zinc-800 ${themeAccents.focusBorder} transition-all font-mono`}
                          />
                        </div>

                      </div>

                    </div>

                    {/* Results listings */}
                    <div className="space-y-6">
                      <div className="flex justify-between items-center px-1">
                        <h3 className="text-sm font-semibold text-zinc-400">
                          Search Matches: {filteredSessions.length}
                        </h3>
                        {(searchQuery || searchCategory !== "All" || searchDate) && (
                          <button
                            onClick={() => {
                              setSearchQuery("");
                              setSearchCategory("All");
                              setSearchDate("");
                            }}
                            className={`text-xs ${themeAccents.accentText} ${themeAccents.accentHoverText} underline font-medium`}
                          >
                            Reset filters
                          </button>
                        )}
                      </div>

                      {filteredSessions.length === 0 ? (
                        <EmptyState type="search" />
                      ) : (
                        <div className="space-y-4">
                          {filteredSessions.map((session) => (
                            <SessionCard key={session.id} session={session} />
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* 4. SETTINGS PAGE */}
                {activeTab === "settings" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Left Column: Extension & Permission Status (2 Columns width) */}
                    <div className="md:col-span-2 space-y-6">
                      
                      {/* Extension Status Card */}
                      <div className="p-6 rounded-3xl bg-[#090b10]/40 border border-zinc-850/60 backdrop-blur-md">
                        <h3 className="text-base font-bold text-zinc-150 mb-1 flex items-center gap-2">
                          <Layers className={`w-4.5 h-4.5 ${themeAccents.accentText}`} />
                          Chrome Extension Status
                        </h3>
                        <p className="text-xs text-zinc-500 mb-6">
                          Sync configurations and live diagnostic checks with your SessionLens Chrome utility
                        </p>

                        <div className="space-y-4">
                          
                          {/* Sync status */}
                          <div className="p-4 rounded-2xl bg-zinc-950/30 border border-zinc-850/60 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-zinc-200 mb-0.5">Live Connection Stream</p>
                              <p className="text-[10px] text-zinc-500">Extension automatically pushes logs to server port 5000</p>
                            </div>
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-[10px] font-bold uppercase tracking-wider font-mono">
                              Active Sync
                            </span>
                          </div>

                          {/* Permissions block */}
                          <div className="p-4 rounded-2xl bg-zinc-950/30 border border-zinc-850/60">
                            <p className="text-xs font-bold text-zinc-200 mb-3">Active Permissions Check</p>
                            
                            <div className="space-y-3">
                              <label className="flex items-center justify-between text-xs text-zinc-400 cursor-pointer group">
                                <span className="group-hover:text-zinc-200 transition-colors">Chrome History Log Read API</span>
                                <input
                                  type="checkbox"
                                  checked={permissions.history}
                                  onChange={() => setPermissions(p => ({ ...p, history: !p.history }))}
                                  className={`w-4 h-4 rounded ${themeAccents.accentSolid} bg-zinc-900 border-zinc-800`}
                                />
                              </label>
                              
                              <label className="flex items-center justify-between text-xs text-zinc-400 cursor-pointer group">
                                <span className="group-hover:text-zinc-200 transition-colors">Active Tabs Focus Monitoring</span>
                                <input
                                  type="checkbox"
                                  checked={permissions.tabs}
                                  onChange={() => setPermissions(p => ({ ...p, tabs: !p.tabs }))}
                                  className={`w-4 h-4 rounded ${themeAccents.accentSolid} bg-zinc-900 border-zinc-800`}
                                />
                              </label>

                              <label className="flex items-center justify-between text-xs text-zinc-400 cursor-pointer group opacity-60">
                                <span>Advanced DOM Metadata Scraping</span>
                                <input
                                  type="checkbox"
                                  checked={permissions.scripting}
                                  onChange={() => setPermissions(p => ({ ...p, scripting: !p.scripting }))}
                                  className={`w-4 h-4 rounded ${themeAccents.accentSolid} bg-zinc-900 border-zinc-800`}
                                />
                              </label>
                            </div>

                          </div>
                        </div>
                      </div>

                      {/* AI Preference Configuration */}
                      <div className="p-6 rounded-3xl bg-[#090b10]/40 border border-zinc-850/60 backdrop-blur-md">
                        <h3 className="text-base font-bold text-zinc-150 mb-1 flex items-center gap-2">
                          <Cpu className={`w-4.5 h-4.5 ${themeAccents.accentText}`} />
                          AI Processing Preference
                        </h3>
                        <p className="text-xs text-zinc-500 mb-6">
                          Configure models used to structure raw page urls into semantic categorized sprints
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          
                          {/* Local Engine */}
                          <div
                            onClick={() => setAiModel("local-matcher")}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between min-h-[110px] ${
                              aiModel === "local-matcher"
                                ? `${themeAccents.accentBg} ${themeAccents.accentBorder} ${themeAccents.accentText} shadow-md`
                                : "bg-zinc-950/20 border-zinc-850 text-zinc-400 hover:border-zinc-800"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-bold text-zinc-200">Local Rules Engine</span>
                              {aiModel === "local-matcher" && <ShieldCheck className={`w-4 h-4 ${themeAccents.accentText}`} />}
                            </div>
                            <span className="text-[10px] text-zinc-500 leading-snug mt-2">
                              Pattern-matching text analyzer. Instant offline categorization. (Default)
                            </span>
                          </div>

                          {/* Gemini Flash */}
                          <div
                            onClick={() => setAiModel("gemini-flash")}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between min-h-[110px] ${
                              aiModel === "gemini-flash"
                                ? `${themeAccents.accentBg} ${themeAccents.accentBorder} ${themeAccents.accentText} shadow-md`
                                : "bg-zinc-950/20 border-zinc-850 text-zinc-400 hover:border-zinc-800"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-bold text-zinc-200">Gemini 2.0 Flash</span>
                              {aiModel === "gemini-flash" && <ShieldCheck className={`w-4 h-4 ${themeAccents.accentText}`} />}
                            </div>
                            <span className="text-[10px] text-zinc-500 leading-snug mt-2">
                              Fast LLM classification. Requires backend API key mapping.
                            </span>
                          </div>

                          {/* GPT-4o Mini */}
                          <div
                            onClick={() => setAiModel("gpt-mini")}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between min-h-[110px] ${
                              aiModel === "gpt-mini"
                                ? `${themeAccents.accentBg} ${themeAccents.accentBorder} ${themeAccents.accentText} shadow-md`
                                : "bg-zinc-950/20 border-zinc-850 text-zinc-400 hover:border-zinc-800"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-bold text-zinc-200">GPT-4o Mini</span>
                              {aiModel === "gpt-mini" && <ShieldCheck className={`w-4 h-4 ${themeAccents.accentText}`} />}
                            </div>
                            <span className="text-[10px] text-zinc-500 leading-snug mt-2">
                              Excellent summaries. High accuracy, slow inference speed.
                            </span>
                          </div>

                        </div>
                      </div>

                    </div>

                    {/* Right Column: Theme & Data Actions */}
                    <div className="space-y-6">
                      
                      {/* Theme selection panel */}
                      <div className="p-6 rounded-3xl bg-[#090b10]/40 border border-zinc-850/60 backdrop-blur-md">
                        <h3 className="text-base font-bold text-zinc-150 mb-1">Theme Presets</h3>
                        <p className="text-xs text-zinc-500 mb-6">Select layout dashboard skin accents</p>
                        
                        <div className="space-y-3">
                          {[
                            { id: "carbon" as const, label: "Carbon Dark", sub: "Deep rich dark with purple/indigo overlays", preview: "bg-gradient-to-r from-indigo-500 to-purple-500" },
                            { id: "cobalt" as const, label: "Arc Cobalt", sub: "Deep blue with cyan elements", preview: "bg-gradient-to-r from-cyan-400 to-blue-600" },
                            { id: "cyberpunk" as const, label: "Obsidian Neon", sub: "Dark with glowing neon pink accents", preview: "bg-gradient-to-r from-pink-500 to-fuchsia-600" },
                          ].map((t) => (
                            <button
                              key={t.id}
                              onClick={() => setTheme(t.id)}
                              className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all outline-none ${
                                theme === t.id
                                  ? "bg-zinc-900 border-zinc-800 text-zinc-100 font-semibold"
                                  : "bg-zinc-950/20 border-zinc-850/60 text-zinc-450 hover:border-zinc-800"
                              }`}
                            >
                              <div className="min-w-0 pr-4">
                                <p className="text-xs font-bold text-zinc-200">{t.label}</p>
                                <p className="text-[9px] text-zinc-500 truncate leading-snug">{t.sub}</p>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <div className={`w-3.5 h-3.5 rounded-full ${t.preview}`} />
                                {theme === t.id && (
                                  <span className={`text-[10px] ${themeAccents.accentText} font-bold uppercase tracking-wider font-mono`}>
                                    ON
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Export & Clear settings */}
                      <div className="p-6 rounded-3xl bg-[#090b10]/40 border border-zinc-850/60 backdrop-blur-md">
                        <h3 className="text-base font-bold text-zinc-150 mb-1">Data Storage</h3>
                        <p className="text-xs text-zinc-500 mb-6">Manage local memory records database</p>
                        
                        <div className="space-y-3">
                          
                          {/* Export data */}
                          <button
                            onClick={handleExportData}
                            disabled={exporting}
                            className={`w-full py-3 px-4 rounded-2xl bg-zinc-950/20 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-800 flex items-center justify-center gap-2.5 text-xs text-zinc-300 font-semibold transition-all hover:text-white ${exporting ? 'opacity-70 cursor-not-allowed' : ''}`}
                          >
                            <Download className={`w-4 h-4 ${themeAccents.accentText} ${exporting ? 'animate-bounce' : ''}`} />
                            {exporting ? "Analyzing with Gemini..." : "Export Browsing History"}
                          </button>

                          {/* Clear memory trigger */}
                          <button
                            className="w-full py-3 px-4 rounded-2xl bg-rose-950/5 hover:bg-rose-950/15 border border-rose-950/25 hover:border-rose-900/30 flex items-center justify-center gap-2.5 text-xs text-rose-450 font-semibold transition-all hover:text-rose-400"
                          >
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                            Clear History Database
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

    </div>
  );
}
