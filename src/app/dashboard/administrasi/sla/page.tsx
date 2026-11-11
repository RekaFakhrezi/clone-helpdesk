import SLAWorkspace from "@/components/admin/SLA/SLAWorkspace";

export default function SLAPage() {
  return (
    <div className="w-full max-w-[1440px] mx-auto">
      <div className="animate-in fade-in duration-300 w-full h-full">
        <SLAWorkspace />
      </div>
    </div>
  );
}