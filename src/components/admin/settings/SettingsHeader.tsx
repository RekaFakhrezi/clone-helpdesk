export default function SettingsHeader() {
  return (
    <div className="flex w-full flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">
          Dashboard
        </span>
        <span className="text-[10px] text-[var(--fg-faint)]">/</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">
          Pengaturan
        </span>
      </div>
      <h1 className="text-[22px] font-medium leading-tight tracking-[-0.01em] text-[var(--fg)]">
        Konfigurasi Sistem
      </h1>
      <p className="max-w-[64ch] text-[12.5px] leading-[1.55] text-[var(--fg-dim)]">
        Atur teks otomatis dan parameter sistem lainnya untuk optimasi layanan.
      </p>
    </div>
  );
}
