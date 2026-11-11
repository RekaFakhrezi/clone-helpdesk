import React, { useState } from "react";
import Modal, { ModalPrimaryButton } from "@/components/ui/Modal";

interface BotStatsProps {
  onViewAnalytics?: () => void;
}

export default function BotStats({ onViewAnalytics }: BotStatsProps) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    if (onViewAnalytics) {
      onViewAnalytics();
    } else {
      setShowModal(true);
    }
  };

  return (
    <div className="flex p-6 flex-col items-start gap-4 rounded-lg border border-[#C3C6D1] bg-[#FFF] w-full">
      <p className="text-[#43474F] font-iBMPlexSans text-xs font-bold leading-4 tracking-[0.05em]">
        STATISTIK BOT (24 JAM)
      </p>

      <div className="flex pb-2 flex-col items-start gap-4 w-full">
        <div className="flex flex-col items-start gap-1 w-full">
          <div className="flex justify-between items-start w-full">
            <p className="text-[#1A1C1E] font-iBMPlexSans text-[13px]">Pesan Terkirim</p>
            <p className="text-[#1A1C1E] font-iBMPlexSans text-[13px] font-bold">1,284</p>
          </div>
          <div className="w-full h-2 bg-[#E8E8EA] rounded-full overflow-hidden">
            <div className="h-full bg-[#0059BB] rounded-full w-[75%]" />
          </div>
        </div>

        <div className="flex flex-col items-start gap-1 w-full">
          <div className="flex justify-between items-start w-full">
            <p className="text-[#1A1C1E] font-iBMPlexSans text-[13px]">Penyelesaian Otomatis</p>
            <p className="text-[#1A1C1E] font-iBMPlexSans text-[13px] font-bold">64%</p>
          </div>
          <div className="w-full h-2 bg-[#E8E8EA] rounded-full overflow-hidden">
            <div className="h-full bg-[#10B981] rounded-full w-[64%]" />
          </div>
        </div>
      </div>

      <button 
        type="button"
        onClick={handleClick}
        className="cursor-pointer flex py-2 px-0 justify-center items-center rounded border border-[#0059BB] w-full hover:bg-[rgba(0,89,187,0.05)] transition-colors"
      >
        <span className="text-[#0059BB] font-iBMPlexSans text-xs font-bold tracking-[0.05em]">
          Lihat Detail Analytics
        </span>
      </button>

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
          <div className="space-y-2 text-sm text-[#43474F] mb-6">
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