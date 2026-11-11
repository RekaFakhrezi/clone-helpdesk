import React, { ChangeEvent, useState } from "react";

interface BotMessageProps {
  isActive: boolean;
  onToggleActive: () => void;
  message: string;
  onMessageChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  isError: boolean;
}

const MICRO_LABEL =
  "text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]";

export default function BotMessageSection({ 
  isActive, 
  onToggleActive, 
  message, 
  onMessageChange, 
  isError 
}: BotMessageProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (message) {
      navigator.clipboard.writeText(message);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[4px] border border-[var(--rule)] bg-[var(--surface)]">
      <div className="flex items-start justify-between gap-4 border-b border-[var(--rule)] px-5 py-3.5">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-[13px] font-medium text-[var(--fg)]">
            Pesan Utama Bot WhatsApp
          </h2>
          <p className="text-[11.5px] leading-[1.5] text-[var(--fg-faint)]">
            Teks ini akan dikirim pertama kali saat pelapor menghubungi bot WhatsApp.
          </p>
        </div>

        {/* Tombol Slide Toggle Switch */}
        <div className="flex shrink-0 items-center gap-2.5 pt-0.5">
          <span className={`text-[12px] font-medium ${isActive ? 'text-[var(--accent)]' : 'text-[var(--fg-faint)]'}`}>
            {isActive ? "Aktif" : "Nonaktif"}
          </span>
          <button
            type="button"
            onClick={onToggleActive}
            role="switch"
            aria-checked={isActive}
            className={`flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border transition-colors focus:outline-none ${
              isActive
                ? 'border-[var(--accent)] bg-[var(--accent)]'
                : 'border-[var(--rule-strong)] bg-transparent hover:border-[var(--fg-faint)]'
            }`}
          >
            {isActive && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                <path
                  d="M1 4L3.5 6.5L9 1"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1.5">
          <span className={MICRO_LABEL}>Teks Pesan</span>
          <div className="relative w-full">
            <textarea
              value={message}
              onChange={onMessageChange}
              maxLength={4096}
              placeholder="Masukkan pesan bot..."
              className={`min-h-[150px] w-full resize-none rounded-[4px] border bg-transparent px-3 pt-3 pb-12 font-jetBrainsMono text-[12.5px] leading-[1.6] text-[var(--fg)] outline-none transition-colors placeholder:text-[var(--fg-faint)] focus:border-[var(--accent)] ${
                isError ? 'border-[var(--danger)]' : 'border-[var(--rule-strong)]'
              }`}
            />

            {/* Tombol Salin Berfungsi */}
            <div className="absolute right-2 bottom-2 flex items-center gap-2">
              {isCopied && (
                <span className="rounded-[3px] border border-[var(--rule)] bg-[var(--surface)] px-2 py-1 text-[11px] font-medium text-[var(--accent)]">
                  Tersalin!
                </span>
              )}
              <button
                type="button"
                onClick={handleCopy}
                title="Salin Pesan"
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[4px] border border-[var(--rule-strong)] bg-[var(--surface)] text-[var(--fg-dim)] transition-colors hover:bg-[var(--canvas)]"
              >
                <svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M4.5 12C4.0875 12 3.73438 11.8531 3.44062 11.5594C3.14687 11.2656 3 10.9125 3 10.5V1.5C3 1.0875 3.14687 0.734375 3.44062 0.440625C3.73438 0.146875 4.0875 0 4.5 0H11.25C11.6625 0 12.0156 0.146875 12.3094 0.440625C12.6031 0.734375 12.75 1.0875 12.75 1.5V10.5C12.75 10.9125 12.6031 11.2656 12.3094 11.5594C12.0156 11.8531 11.6625 12 11.25 12H4.5ZM4.5 10.5H11.25V1.5H4.5V10.5ZM1.5 15C1.0875 15 0.734375 14.8531 0.440625 14.5594C0.146875 14.2656 0 13.9125 0 13.5V3H1.5V13.5H9.75V15H1.5ZM4.5 10.5V1.5V10.5Z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-[11.5px] leading-[1.5] text-[var(--fg-dim)]">
            <p className="font-medium text-[var(--fg)]">Tips Format WA: Gunakan</p>
            <span className="rounded-[3px] bg-[var(--canvas)] px-1 font-liberationMono text-[11.5px] text-[var(--fg-dim)]">*teks*</span>
            <p>untuk tebal (bold),</p>
            <span className="rounded-[3px] bg-[var(--canvas)] px-1 font-liberationMono text-[11.5px] text-[var(--fg-dim)]">_teks_</span>
            <p>untuk miring (italic).</p>
          </div>
          <p className={`text-[11.5px] tabular-nums ${isError ? 'text-[var(--danger)]' : 'text-[var(--fg-faint)]'}`}>
            Karakter: {message.length} / 4096
          </p>
        </div>
      </div>
    </div>
  );
}
