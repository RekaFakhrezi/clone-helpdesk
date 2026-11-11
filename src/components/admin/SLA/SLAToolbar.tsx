export default function SLAToolbar() {
  return (
    <div className="flex px-4 py-3.5 flex-col items-start gap-1 border-b border-[var(--rule)] w-full">
      <p className="text-[13px] font-medium text-[var(--fg)] w-full">
        Service Level Agreement (SLA) Config
      </p>
      <p className="text-[12.5px] text-[var(--fg-dim)] w-full">
        Durasi waktu maksimal (dalam hitungan menit).
      </p>
    </div>
  );
}
