export default function SLAHeader() {
  return (
    <div className="flex justify-between items-end w-full">
      <div className="flex flex-col items-start gap-1.5 w-fit">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">
          Dashboard / Manajemen SLA
        </p>
        <h1 className="text-[22px] font-medium leading-tight tracking-[-0.01em] text-[var(--fg)] w-fit">
          Manajemen SLA
        </h1>
      </div>
    </div>
  );
}
