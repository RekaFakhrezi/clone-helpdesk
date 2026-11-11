import KnowledgeBaseWorkspace from "@/components/admin/knowledge-base/Workspace";

export default function KnowledgeBasePage() {
  return (
    <div className="w-full max-w-[1440px] mx-auto">
      <div className="animate-in fade-in duration-300 w-full h-full">
        <KnowledgeBaseWorkspace />
      </div>
    </div>
  );
}
