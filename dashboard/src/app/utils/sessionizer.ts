export interface Activity {
  _id: string;
  url: string;
  title: string;
  timestamp: string;
  eventType: string;
  screenshot?: string;
  video?: string;
}

export interface SessionEvent {
  _id: string;
  title: string;
  url: string;
  timestamp: Date;
  eventType: string;
  screenshot?: string;
  video?: string;
}

export interface Session {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  durationMs: number;
  durationString: string;
  websitesCount: number;
  category: string;
  summary: string;
  websites: string[];
  events: SessionEvent[];
}

// Extract domain from URL
export const getDomain = (urlStr: string): string => {
  try {
    if (!urlStr || urlStr === "unknown") return "System Page";
    if (urlStr.startsWith("chrome://") || urlStr.startsWith("chrome-extension://")) {
      return "Chrome Settings";
    }
    const parsed = new URL(urlStr);
    return parsed.hostname.replace("www.", "");
  } catch (e) {
    return urlStr || "Unknown";
  }
};

// Generate high-fidelity session title, category, and summary based on activity content
const generateSessionMetadata = (events: SessionEvent[], domains: string[]): { title: string; category: string; summary: string } => {
  if (events.length === 0) {
    return {
      title: "Inactive Session",
      category: "System",
      summary: "No activity recorded during this session."
    };
  }

  // Scoring weights for different categories
  const scores = {
    engineering: 0,
    ai: 0,
    design: 0,
    productivity: 0,
    research: 0,
    entertainment: 0,
    search: 0
  };

  // Analyze events
  events.forEach(evt => {
    const url = (evt.url || "").toLowerCase();
    const title = (evt.title || "").toLowerCase();

    // AI
    if (url.includes("chatgpt.com") || url.includes("openai.com") || url.includes("claude.ai") || url.includes("anthropic.com") || url.includes("gemini.google") || url.includes("v0.dev")) {
      scores.ai += 4;
    }
    // Software Engineering
    else if (url.includes("github.com") || url.includes("gitlab.com") || url.includes("localhost") || url.includes("vercel") || url.includes("stackoverflow.com") || url.includes("npmjs.com") || url.includes("react") || url.includes("nextjs") || url.includes("tailwind") || url.includes("typescript") || url.includes("developer.chrome") || url.includes("w3schools") || url.includes("mdn")) {
      scores.engineering += 4;
    }
    // Design
    else if (url.includes("figma.com") || url.includes("dribbble") || url.includes("behance") || url.includes("canva")) {
      scores.design += 4;
    }
    // Productivity
    else if (url.includes("notion.so") || url.includes("docs.google") || url.includes("sheets.google") || url.includes("slack.com") || url.includes("linear.app") || url.includes("trello") || url.includes("jira")) {
      scores.productivity += 4;
    }
    // Research / Wiki
    else if (url.includes("wikipedia.org") || url.includes("arxiv.org") || url.includes("scholar.google") || url.includes("medium.com") || url.includes("dev.to") || url.includes("quora.com")) {
      scores.research += 3;
    }
    // Entertainment
    else if (url.includes("youtube.com") || url.includes("netflix.com") || url.includes("reddit.com") || url.includes("spotify.com") || url.includes("twitter.com") || url.includes("x.com") || url.includes("instagram")) {
      scores.entertainment += 3;
    }
    // Search
    else if (url.includes("google.com") || url.includes("bing.com") || url.includes("duckduckgo.com")) {
      scores.search += 1;
    }
  });

  // Determine highest scoring category
  let maxScore = -1;
  let winner = "search";
  for (const [cat, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      winner = cat;
    }
  }

  // Fallback if no category scored above 0 (e.g. general surfing)
  if (maxScore === 0) {
    if (scores.search > 0) winner = "search";
    else winner = "research";
  }

  // Primary page title to extract keywords from
  const primaryEvent = events.find(e => e.title && e.title !== "Untitled" && e.title !== "New Tab") || events[0];
  const pageTitleClean = primaryEvent ? primaryEvent.title.replace(/ - [^-]+$/, "").trim() : "Browsing Session";

  switch (winner) {
    case "ai":
      return {
        category: "Artificial Intelligence",
        title: pageTitleClean.includes("ChatGPT") || pageTitleClean.includes("Claude") 
          ? `Co-authoring & Prompting: ${pageTitleClean}`
          : `AI Assisted Brainstorming: ${pageTitleClean}`,
        summary: `Leveraged generative AI tools for programming guidance, creative ideation, or conceptual prototyping. Focused heavily on ${domains.slice(0, 3).join(", ")}.`
      };
    case "engineering": {
      let topic = "Technical Solutions";
      if (domains.some(d => d.includes("github"))) topic = "GitHub Repository Code Review";
      else if (domains.some(d => d.includes("localhost"))) topic = "Debugging Local Web Server";
      else if (domains.some(d => d.includes("react") || d.includes("nextjs"))) topic = "React App Architecture";
      else if (domains.some(d => d.includes("stackoverflow"))) topic = "Resolving Dev Errors on StackOverflow";
      else topic = pageTitleClean;

      return {
        category: "Software Engineering",
        title: topic.length > 50 ? topic.substring(0, 47) + "..." : topic,
        summary: `Worked on front-end features, reviewed repositories, or researched syntax errors. Visited engineering platforms including ${domains.slice(0, 3).join(", ")}.`
      };
    }
    case "design":
      return {
        category: "Product Design",
        title: `Design iteration: ${pageTitleClean}`,
        summary: `Focused on user interface layouts, graphical assets, or styling adjustments. Researched aesthetic layouts on Figma or community boards.`
      };
    case "productivity":
      return {
        category: "Productivity & Docs",
        title: `Workspace sync: ${pageTitleClean}`,
        summary: `Documented engineering steps, updated task boards, or reviewed internal notes. Used coordination tools like ${domains.slice(0, 3).join(", ")}.`
      };
    case "research":
      return {
        category: "Learning & Research",
        title: `Deep dive: ${pageTitleClean}`,
        summary: `Researched documentation, read scientific papers, or read reference articles on topics of interest. Focused on domains like ${domains.slice(0, 3).join(", ")}.`
      };
    case "entertainment":
      return {
        category: "Leisure & Entertainment",
        title: `Social break: ${pageTitleClean}`,
        summary: `Took a short productivity break. Browsed community discussion threads, listened to streams, or read media feeds on ${domains.slice(0, 2).join(" & ")}.`
      };
    case "search":
    default:
      return {
        category: "Web Search",
        title: `Searching: ${pageTitleClean}`,
        summary: `Ran general queries to find answers, navigate online indexes, or discover web endpoints. Primary domains searched: ${domains.slice(0, 3).join(", ")}.`
      };
  }
};

// Format duration into readable text
export const formatDuration = (ms: number): string => {
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);

  if (mins < 1) return "< 1 min";
  if (hrs < 1) return `${mins} min`;
  return `${hrs} hr ${mins % 60} min`;
};

// Main grouping function
export const groupActivitiesIntoSessions = (activities: Activity[]): Session[] => {
  if (activities.length === 0) return [];

  // Sort activities chronologically (ascending, oldest first)
  const sorted = [...activities].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const sessions: Session[] = [];
  let currentEvents: SessionEvent[] = [];

  // Group events. 10 minutes of inactivity (600,000ms) ends a session
  const GAP_THRESHOLD = 10 * 60 * 1000; 

  sorted.forEach((act) => {
    const actTime = new Date(act.timestamp);
    const eventObj: SessionEvent = {
      _id: act._id,
      title: act.title || "Untitled",
      url: act.url || "unknown",
      timestamp: actTime,
      eventType: act.eventType,
      screenshot: act.screenshot,
      video: act.video
    };

    if (currentEvents.length === 0) {
      currentEvents.push(eventObj);
    } else {
      const lastEvent = currentEvents[currentEvents.length - 1];
      const timeDiff = eventObj.timestamp.getTime() - lastEvent.timestamp.getTime();

      if (timeDiff > GAP_THRESHOLD) {
        sessions.push(createSessionFromEvents(currentEvents));
        currentEvents = [eventObj];
      } else {
        currentEvents.push(eventObj);
      }
    }
  });

  if (currentEvents.length > 0) {
    sessions.push(createSessionFromEvents(currentEvents));
  }

  // Return sessions sorted newest first (descending)
  return sessions.reverse();
};

// Create a Session object from aggregated events
const createSessionFromEvents = (events: SessionEvent[]): Session => {
  const startTime = events[0].timestamp;
  const endTime = events.length > 1 ? events[events.length - 1].timestamp : new Date(startTime.getTime() + 120000);
  const durationMs = Math.max(60000, endTime.getTime() - startTime.getTime());

  const domainsSet = new Set<string>();
  events.forEach(e => {
    if (e.url && e.url !== "unknown") {
      const dom = getDomain(e.url);
      if (dom && dom !== "System Page" && dom !== "Chrome Settings") {
        domainsSet.add(dom);
      }
    }
  });

  if (domainsSet.size === 0) {
    domainsSet.add("System Settings");
  }

  const websites = Array.from(domainsSet);
  const metadata = generateSessionMetadata(events, websites);
  const id = `session_${startTime.getTime()}`;

  return {
    id,
    title: metadata.title,
    startTime,
    endTime,
    durationMs,
    durationString: formatDuration(durationMs),
    websitesCount: websites.length,
    category: metadata.category,
    summary: metadata.summary,
    websites,
    events
  };
};
