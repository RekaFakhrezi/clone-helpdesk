"use client";

import React from "react";
import { ListFilter, RotateCw } from "lucide-react";

interface LogsToolbarProps {
  onFilterClick?: () => void;
  onRefreshClick?: () => void;
  isRefreshing?: boolean;
}

export default function LogsToolbar({
  onFilterClick,
  onRefreshClick,
  isRefreshing = false,
}: LogsToolbarProps) {
  return (
    <div className="flex items-center gap-2 w-fit">
      <button
        type="button"
        onClick={onFilterClick}
        className="h-9 inline-flex items-center gap-1.5 rounded-[4px] border border-[var(--rule-strong)] px-3 text-[12px] font-medium text-[var(--fg-dim)] transition-colors hover:bg-[var(--canvas)] hover:text-[var(--fg)]"
      >
        <ListFilter className="w-4 h-4" strokeWidth={1.75} />
        Filter
      </button>
      <button
        type="button"
        onClick={isRefreshing ? undefined : onRefreshClick}
        className="h-9 inline-flex items-center gap-1.5 rounded-[4px] border border-[var(--rule-strong)] px-3 text-[12px] font-medium text-[var(--fg-dim)] transition-colors hover:bg-[var(--canvas)] hover:text-[var(--fg)]"
        style={{
          cursor: isRefreshing ? "wait" : "pointer",
          opacity: isRefreshing ? 0.6 : 1,
        }}
      >
        <RotateCw
          className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          strokeWidth={1.75}
        />
        {isRefreshing ? "Refreshing..." : "Refresh Data"}
      </button>
    </div>
  );
}
