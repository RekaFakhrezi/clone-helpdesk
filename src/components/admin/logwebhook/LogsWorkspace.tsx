"use client";

import React from "react";
import LogsHeader from "./LogsHeader";
import LogsToolbar from "./LogsToolbar";
import LogsTableSection from "./LogsTableSection";
import LogsSummaryCards from "./LogsSummaryCards";

export default function LogsWorkspace() {
  return (
    // PERUBAHAN: Mengubah w-[1071px] menjadi w-full agar layout mengisi ruang kosong secara penuh di sebelah kanan
    <div className="flex p-8 flex-col items-start gap-8 w-full">
      <div className="flex justify-between items-center w-full">
        <LogsHeader />
        <LogsToolbar />
      </div>
      <LogsTableSection />
      <LogsSummaryCards />
    </div>
  );
}
