import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BuilderLoading() {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header Skeleton */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>

      {/* Main 3 Column Skeleton */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-60 border-r border-border p-4 hidden lg:flex flex-col gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </div>

        <div className="flex-1 p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>

        <div className="w-[48%] border-l border-border p-8 hidden lg:block">
          <Skeleton className="h-[90%] rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
