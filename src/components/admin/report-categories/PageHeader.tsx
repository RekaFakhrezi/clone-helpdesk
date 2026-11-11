import { useContext } from "react";
import { TreeContext } from "./Workspace";
import { useLanguage } from "@/context/LanguageContext";

export default function PageHeader() {
  const ctx = useContext(TreeContext);
  const { t } = useLanguage();
  return (
    <div className="flex pr-[0] justify-between items-end w-full">
      <div className="flex flex-col items-start gap-1.5 w-fit">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">
          {t('topbar.dashboard')} / {t('categories.title')}
        </p>
        <h1 className="text-[22px] font-medium leading-tight tracking-[-0.01em] text-[var(--fg)] w-fit">
          {t('categories.title')}
        </h1>
      </div>
      <div className="flex items-center w-fit">
        <button 
          className="flex h-9 px-3 items-center gap-2 rounded-[4px] bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors duration-150"
          onClick={ctx?.onAddCategory}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z" fill="currentColor"/>
          </svg>
          <span className="text-[12px] font-medium">{t('categories.root')}</span>
        </button>
      </div>
    </div>
  );
}
