"use client";

import { Info, SearchX, Inbox } from "lucide-react";

interface EmptyStateProps {
  type?: "empty" | "search";
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  type = "empty",
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  const getIcon = () => {
    const cls = "w-10 h-10 text-indigo-400/80 mb-4";
    if (type === "search") {
      return <SearchX className={cls} />;
    }
    return <Inbox className={cls} />;
  };

  const defaultTitle = type === "search" ? "No search matches" : "No sessions found";
  const defaultDesc =
    type === "search"
      ? "We couldn't find any activities or sessions matching your search query. Try typing another keyword or category."
      : "SessionLens memory engine is ready. Browse some websites with the extension active to see your sessions organize automatically here!";

  return (
    <div className="w-full flex flex-col items-center justify-center p-12 text-center rounded-[22px] bg-zinc-900/10 border border-zinc-850/60 backdrop-blur-sm relative overflow-hidden group">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 left-0 w-36 h-36 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-36 h-36 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Icon */}
      {getIcon()}

      {/* Messages */}
      <h3 className="text-base font-bold text-zinc-150 tracking-tight mb-2">
        {title || defaultTitle}
      </h3>
      <p className="text-xs sm:text-sm text-zinc-450 leading-relaxed max-w-md mb-6">
        {description || defaultDesc}
      </p>

      {/* Quick Action Button */}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-650 hover:bg-indigo-600 border border-indigo-500/25 text-zinc-100 hover:text-white transition-all shadow-md active:scale-95 duration-150 outline-none"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
