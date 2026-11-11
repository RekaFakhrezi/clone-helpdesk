export default function LogsHeader() {
  return (
    <div className="flex flex-col items-start gap-1 w-full">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">
          Menu
        </span>
        <span className="text-[10px] text-[var(--fg-faint)]">/</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">
          Webhook
        </span>
      </div>
      <h1 className="text-[22px] font-medium leading-tight tracking-[-0.01em] text-[var(--fg)]">
        Webhook Communication Logs
      </h1>
      <p className="mt-1 text-[13px] text-[var(--fg-dim)]">
        Pantau aktivitas API secara real-time antara sistem helpdesk dan layanan
        eksternal.
      </p>
    </div>
  );
}
