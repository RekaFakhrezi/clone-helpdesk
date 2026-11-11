import React, { useState } from "react";
import Modal, { ModalPrimaryButton } from "@/components/ui/Modal";

interface BotStatsProps {
  onViewAnalytics?: () => void;
}

const MICRO_LABEL =
  "text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]";

export default function BotStats({ onViewAnalytics }: BotStatsProps) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    if (onViewAnalytics) {
      onViewAnalytics();
    } else {
      setShowModal(true);
    }
  };

  const metrics = [
    {
      label: "Pesan Terkirim",
      value: "1,284",
      note: "dari 1,540 pesan masuk",
      tone: "text-[var(--fg)]",
    },
    {
      label: "Penyelesaian Otomatis",
      value: "64%",
      note: "tanpa eskalasi ke agen",
      tone: "text-[var(--ok)]",
    },
  ];

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[4px] border border-[var(--rule)] bg-[var(--surface)]">
      <div className="flex items-center gap-2 border-b border-[var(--rule)] px-5 py-3.5">
        <h2 className="text-[13px] font-medium text-[var(--fg)]">
          Statistik Bot (24 Jam)
        </h2>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <div className="grid grid-cols-2 border-y border-[var(--rule)]">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className={[
                "py-4",
                index > 0 ? "border-l border-[var(--rule)] pl-4" : "pr-4",
              ].join(" ")}
            >
              <div className={MICRO_LABEL}>{metric.label}</div>
              <div
                className={`mt-2 text-[30px] leading-none font-medium tabular-nums ${metric.tone}`}
              >
                {metric.value}
              </div>
              <div className="mt-2 text-[11.5px] leading-[1.5] text-[var(--fg-dim)]">
                {metric.note}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleClick}
          className="h-9 w-full cursor-pointer rounded-[4px] border border-[var(--rule-strong)] text-[12px] font-medium text-[var(--fg-dim)] transition-colors hover:bg-[var(--canvas)]"
        >
          Lihat Detail Analytics
        </button>
      </div>

      {/* Modal Detail Analytics Sederhana */}
      {showModal && (
        <Modal
          title="Detail Analytics Bot"
          onClose={() => setShowModal(false)}
          maxWidth="max-w-md"
          footer={
            <ModalPrimaryButton onClick={() => setShowModal(false)}>Tutup</ModalPrimaryButton>
          }
        >
          <div className="mb-6 flex flex-col gap-1.5 text-[12.5px] leading-[1.6] text-[var(--fg-dim)]">
            <p>• Total Pesan Masuk: 1,540</p>
            <p>• Total Pesan Terbalas: 1,284</p>
            <p>• Rata-rata Waktu Respon: 1.2 detik</p>
            <p>• Pengguna Unik: 412 Pelapor</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
