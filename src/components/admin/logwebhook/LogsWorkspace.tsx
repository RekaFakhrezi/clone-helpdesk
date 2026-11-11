"use client";

import React from "react";
import LogsHeader from "./LogsHeader";
import LogsToolbar from "./LogsToolbar";
import LogsTableSection from "./LogsTableSection";
import LogsSummaryCards from "./LogsSummaryCards";

export default function LogsWorkspace() {
  return (
    <div className="flex flex-col items-start gap-6 w-full">
      <div className="flex flex-col items-start justify-between gap-4 w-full md:flex-row md:items-center">
        <LogsHeader />
        <LogsToolbar />
      </div>
      <LogsTableSection />
      <LogsSummaryCards />
    </div>
  );
}
