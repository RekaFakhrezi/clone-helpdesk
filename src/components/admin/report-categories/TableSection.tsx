import Tree from "./Tree";
import { useLanguage } from "@/context/LanguageContext";

export default function TableSection() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-start rounded-[4px] border border-[var(--rule)] bg-[var(--surface)] w-full overflow-hidden relative">
      <div className="flex flex-col items-start w-full overflow-x-auto">
        <div className="min-w-[900px] w-full flex flex-col">
          <div className="flex px-4 py-2.5 items-center border-b border-[var(--rule)] w-full text-left">
            <div className="flex-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">{t('categories.name')}</p>
            </div>
            <div className="w-[120px] text-right">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">{t('common.status')}</p>
            </div>
            <div className="w-[100px] text-right pr-2">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">{t('categories.action')}</p>
            </div>
          </div>
          <div className="flex flex-col w-full relative min-h-[300px]">
            <Tree />
          </div>
        </div>
      </div>
    </div>
  );
}
