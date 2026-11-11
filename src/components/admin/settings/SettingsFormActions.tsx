"use client";

import { Info, Save } from "lucide-react";

interface SettingsFormActionsProps {
  onCancel: () => void;
  onSave: () => void;
}

export default function SettingsFormActions({ onCancel, onSave }: SettingsFormActionsProps) {
  return (
    <div className="sticky bottom-0 flex w-full flex-wrap items-center justify-between gap-4 border-t border-[var(--rule)] bg-[var(--surface)] py-3">
      <div className="flex min-w-0 items-center gap-2">
        <Info className="h-4 w-4 shrink-0 text-[var(--fg-faint)]" strokeWidth={1.75} />
        <p className="text-[12px] leading-[1.5] text-[var(--fg-dim)]">
          Perubahan akan segera diterapkan pada layanan bot aktif.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 cursor-pointer rounded-[4px] border border-[var(--rule-strong)] px-3.5 text-[12px] font-medium text-[var(--fg-dim)] transition-colors hover:bg-[var(--canvas)]"
        >
          Batalkan
        </button>
        <button
          type="button"
          onClick={onSave}
          className="flex h-9 cursor-pointer items-center gap-2 rounded-[4px] bg-[var(--accent)] px-3.5 text-[12px] font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
        >
          <Save className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
}
