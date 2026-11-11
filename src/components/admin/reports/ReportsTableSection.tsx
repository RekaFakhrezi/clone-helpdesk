"use client";

import React, { useCallback } from "react";
import { ArrowRight, Download, FileSpreadsheet } from "lucide-react";

interface ReportsTableSectionProps {
  onViewAll?: () => void;
  onDownloadItem?: (fileName: string) => void;
}

const RECENT_EXPORTS = [
  { fileName: "Ticket_Export_Oct.csv", meta: "Hari ini, 10:24" },
  { fileName: "Monthly_Report_Q3.xlsx", meta: "Kemarin, 14:15" },
  { fileName: "SLA_Metrics_v2.csv", meta: "20 Okt 2023" },
];

export default function ReportsTableSection({
  onViewAll,
  onDownloadItem,
}: ReportsTableSectionProps) {
  // Handler simulasi untuk interaksi klik
  const handleViewAll = useCallback(() => {
    if (onViewAll) onViewAll();
    else alert("Menampilkan semua riwayat unduhan (Simulasi)");
  }, [onViewAll]);

  const handleItemClick = useCallback(
    (fileName: string) => {
      if (onDownloadItem) onDownloadItem(fileName);
      else alert(`Mengunduh ulang file: ${fileName} (Simulasi)`);
    },
    [onDownloadItem]
  );

  return (
    <div className="flex w-full flex-col items-start gap-3">
      <div className="flex w-full items-center justify-between gap-4">
        <h2 className="text-[13px] font-medium text-[var(--fg)]">
          Riwayat Unduhan Terakhir
        </h2>
        <button
          type="button"
          onClick={handleViewAll}
          className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
        >
          Lihat Semua
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="w-full overflow-hidden rounded-[4px] border border-[var(--rule)] bg-[var(--surface)]">
        {RECENT_EXPORTS.map((item) => (
          <div
            key={item.fileName}
            onClick={() => handleItemClick(item.fileName)}
            className="flex cursor-pointer items-center gap-3 border-b border-[var(--rule)] px-4 py-3 transition-colors last:border-b-0 hover:bg-[var(--canvas)]"
          >
            <FileSpreadsheet
              className="h-4 w-4 shrink-0 text-[var(--fg-faint)]"
              strokeWidth={1.75}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[12.5px] font-medium text-[var(--fg)]">
                {item.fileName}
              </span>
              <span className="text-[11.5px] tabular-nums text-[var(--fg-faint)]">
                {item.meta}
              </span>
            </div>
            <Download
              className="h-4 w-4 shrink-0 text-[var(--fg-faint)]"
              strokeWidth={1.75}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
