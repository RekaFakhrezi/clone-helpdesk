import React from "react";

interface BotPreviewProps {
  message?: string;
}

export default function BotPreview({ message }: BotPreviewProps) {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[4px] border border-[var(--rule)] bg-[var(--surface)]">
      <div className="flex w-full items-center gap-3 border-b border-[rgba(255,255,255,0.12)] bg-[var(--fg)] px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-[rgba(255,255,255,0.14)] text-white">
          <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.25 9.75C1.625 9.75 1.09375 9.53125 0.65625 9.09375C0.21875 8.65625 0 8.125 0 7.5C0 6.875 0.21875 6.34375 0.65625 5.90625C1.09375 5.46875 1.625 5.25 2.25 5.25V3.75C2.25 3.3375 2.39687 2.98438 2.69062 2.69062C2.98438 2.39687 3.3375 2.25 3.75 2.25H6C6 1.625 6.21875 1.09375 6.65625 0.65625C7.09375 0.21875 7.625 0 8.25 0C8.875 0 9.40625 0.21875 9.84375 0.65625C10.2812 1.09375 10.5 1.625 10.5 2.25H12.75C13.1625 2.25 13.5156 2.39687 13.8094 2.69062C14.1031 2.98438 14.25 3.3375 14.25 3.75V5.25C14.875 5.25 15.4062 5.46875 15.8438 5.90625C16.2812 6.34375 16.5 6.875 16.5 7.5C16.5 8.125 16.2812 8.65625 15.8438 9.09375C15.4062 9.53125 14.875 9.75 14.25 9.75V12.75C14.25 13.1625 14.1031 13.5156 13.8094 13.8094C13.5156 14.1031 13.1625 14.25 12.75 14.25H3.75C3.3375 14.25 2.98438 14.1031 2.69062 13.8094C2.39687 13.5156 2.25 13.1625 2.25 12.75V9.75Z" fill="currentColor"/>
          </svg>
        </div>
        <p className="text-[12px] font-medium tracking-[0.02em] text-white">
          Pratinjau Bot WhatsApp
        </p>
      </div>

      <div className="flex min-h-[320px] w-full flex-col items-start justify-start bg-[var(--canvas)] p-4">
        {/* Chat Bubble WhatsApp Dinamis */}
        <div className="relative flex w-full max-w-[90%] flex-col rounded-[10px] border border-[var(--rule)] bg-[var(--surface)] p-3">
          <p className="w-full break-words whitespace-pre-wrap text-[12.5px] leading-[1.55] text-[var(--fg)]">
            {message || "Belum ada pesan yang diketik..."}
          </p>
          <span className="mt-2 self-end text-[10px] tabular-nums text-[var(--fg-faint)]">
            12:45
          </span>
        </div>
      </div>
    </div>
  );
}