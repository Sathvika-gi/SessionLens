"use client";

import { motion } from "framer-motion";

export default function LoadingSkeleton() {
  return (
    <div className="w-full flex flex-col gap-8 animate-pulse">
      
      {/* Hero Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Circular lens skeleton (takes 1 col) */}
        <div className="lg:col-span-1 p-8 rounded-3xl bg-zinc-900/20 border border-zinc-850/60 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-full flex justify-between mb-8">
            <div className="h-4 bg-zinc-800 rounded-md w-28" />
            <div className="h-4 bg-zinc-800 rounded-md w-12" />
          </div>
          
          {/* Outer circle */}
          <div className="w-[180px] h-[180px] rounded-full border-[14px] border-zinc-800 flex items-center justify-center">
            {/* Center ring */}
            <div className="w-[116px] h-[116px] rounded-full bg-zinc-900 border border-zinc-800/80 flex flex-col items-center justify-center p-4">
              <div className="h-3 bg-zinc-800 rounded-md w-16 mb-2" />
              <div className="h-5 bg-zinc-800 rounded-md w-24 mb-1" />
              <div className="h-2 bg-zinc-800 rounded-md w-12" />
            </div>
          </div>
        </div>

        {/* Right Side: Quick info / blank block */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-zinc-900/10 border border-zinc-850/60 flex flex-col justify-between">
          <div>
            <div className="h-6 bg-zinc-800 rounded-md w-48 mb-3" />
            <div className="h-4 bg-zinc-800 rounded-md w-full mb-2" />
            <div className="h-4 bg-zinc-800 rounded-md w-2/3" />
          </div>
          <div className="flex gap-3 mt-6">
            <div className="h-9 bg-zinc-800 rounded-xl w-32" />
            <div className="h-9 bg-zinc-800 rounded-xl w-24" />
          </div>
        </div>

      </div>

      {/* Sessions feed lists */}
      <div className="space-y-6">
        <div className="h-5 bg-zinc-800 rounded-md w-36" />
        
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="p-6 rounded-[22px] bg-zinc-900/15 border border-zinc-900/60 flex flex-col gap-4">
            
            {/* Top row */}
            <div className="flex justify-between items-center">
              <div className="h-3 bg-zinc-800 rounded-md w-36" />
              <div className="h-6 bg-zinc-800 rounded-full w-24" />
            </div>

            {/* Title block */}
            <div className="h-5 bg-zinc-800 rounded-md w-3/4" />

            {/* Description block */}
            <div className="space-y-2">
              <div className="h-3 bg-zinc-800 rounded-md w-full" />
              <div className="h-3 bg-zinc-800 rounded-md w-5/6" />
            </div>

            {/* Footer domain pills */}
            <div className="flex gap-2 pt-2">
              <div className="h-5 bg-zinc-800 rounded-lg w-20" />
              <div className="h-5 bg-zinc-800 rounded-lg w-24" />
              <div className="h-5 bg-zinc-800 rounded-lg w-16" />
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
