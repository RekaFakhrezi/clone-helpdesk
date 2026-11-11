import { useContext } from "react";
import { TreeContext } from "./Workspace";
import { useLanguage } from "@/context/LanguageContext";

export default function Toolbar() {
  const ctx = useContext(TreeContext);
  const { t } = useLanguage();

  return (
    <div className="flex flex-col md:flex-row gap-3 justify-between items-center w-full">
      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="relative w-full md:w-[320px]">
          <input
            type="text"
            value={ctx?.searchQuery || ""}
            onChange={(e) => ctx?.setSearchQuery(e.target.value)}
            placeholder={t('categories.search')}
            className="h-9 w-full pl-9 pr-3 rounded-[4px] border border-[var(--rule-strong)] bg-transparent text-[12px] text-[var(--fg)] placeholder:text-[var(--fg-faint)] outline-none focus:border-[var(--accent)] transition-colors"
          />
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>
      <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
        <button 
          onClick={ctx?.expandAll} 
          className="flex h-9 px-3 items-center gap-2 rounded-[4px] border border-[var(--rule-strong)] text-[12px] font-medium text-[var(--fg-dim)] hover:bg-[var(--canvas)] hover:text-[var(--fg)] transition-colors"
        >
          {t('categories.expand_all')}
        </button>
        <button 
          onClick={ctx?.collapseAll} 
          className="flex h-9 px-3 items-center gap-2 rounded-[4px] border border-[var(--rule-strong)] text-[12px] font-medium text-[var(--fg-dim)] hover:bg-[var(--canvas)] hover:text-[var(--fg)] transition-colors"
        >
          {t('categories.collapse_all')}
        </button>
      </div>
    </div>
  );
}
