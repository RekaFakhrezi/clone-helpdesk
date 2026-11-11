"use client";

import React from "react";

interface LogsSummaryCardsProps {
  incomingToday?: number | string;
  outgoingToday?: number | string;
  successRate?: number | string;
  errors24h?: number | string;
}

/**
 * Strip metrik webhook: satu pita dengan pembatas vertikal, bukan empat kartu.
 * Warna status hanya pada angka yang membawa makna (success rate & error).
 */
export default function LogsSummaryCards({
  incomingToday = 412,
  outgoingToday = 836,
  successRate = "99.8%",
  errors24h = 2,
}: LogsSummaryCardsProps) {
  const metrics = [
    { label: "INCOMING TODAY", value: incomingToday, note: "Pesan masuk hari ini", tone: "text-[var(--fg)]" },
    { label: "OUTGOING TODAY", value: outgoingToday, note: "Pesan keluar hari ini", tone: "text-[var(--fg)]" },
    { label: "SUCCESS RATE", value: successRate, note: "Pengiriman berhasil", tone: "text-[var(--ok)]" },
    { label: "ERRORS (24H)", value: errors24h, note: "Gagal kirim / webhook error", tone: "text-[var(--danger)]" },
  ];

  return (
    <div className="grid w-full grid-cols-2 border-y border-[var(--rule)] lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className={[
            "py-5 pr-4 lg:py-6",
            index % 2 === 1 ? "pl-4 lg:pl-6" : "pl-0",
            index >= 2 ? "max-lg:border-t max-lg:border-[var(--rule)]" : "",
            index > 0 ? "lg:border-l lg:border-[var(--rule)] lg:pl-6" : "",
          ].join(" ")}
        >
          <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">
            {metric.label}
          </div>
          <div className={`mt-2 text-[30px] leading-none font-medium tabular-nums ${metric.tone}`}>
            {metric.value}
          </div>
          <div className="mt-2 text-[11.5px] text-[var(--fg-dim)]">{metric.note}</div>
        </div>
      ))}
    </div>
  );
}
