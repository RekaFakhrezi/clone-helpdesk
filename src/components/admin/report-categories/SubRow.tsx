import React, { ReactNode, useContext, useState, useRef, useEffect } from "react";
import { TreeContext } from "./Workspace";
import { useLanguage } from "@/context/LanguageContext";

type SubRowProps =
  | {
      variant: "branch";
      nodeId?: string; // ID untuk trigger expand/collapse sub kategori
      headerClassName: string;
      title: ReactNode;
      originalTitle?: ReactNode;
      count: ReactNode;
      status: ReactNode;
      childrenWrapperClassName?: string;
      children?: ReactNode;
      onMoveUp?: () => void;
      onMoveDown?: () => void;
    }
  | { variant: "leaf-compact"; title: ReactNode; originalTitle?: ReactNode; nodeId?: string; onMoveUp?: () => void; onMoveDown?: () => void; }
  | { variant: "leaf-bordered"; hasDivider: boolean; title: ReactNode; originalTitle?: ReactNode; nodeId?: string; onMoveUp?: () => void; onMoveDown?: () => void; };

export default function SubRow(props: SubRowProps) {
  const ctx = useContext(TreeContext);
  const { t } = useLanguage();
  const [isActionOpen, setIsActionOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsActionOpen(false);
      }
    };
    if (isActionOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isActionOpen]);

  if (props.variant === "branch") {
    const isExpanded = ctx?.searchQuery 
      ? true 
      : (props.nodeId && ctx?.expandedNodes ? ctx.expandedNodes.includes(props.nodeId) : true);

    const handleToggle = () => {
      if (props.nodeId && ctx?.toggleNode) ctx.toggleNode(props.nodeId);
    };

    return (
      <div className={`flex flex-col ${props.headerClassName || 'w-full'}`}>
        <div 
          className={`flex py-3 px-4 w-full items-center border-b border-[var(--rule)] cursor-pointer hover:bg-[var(--canvas)] transition-colors duration-150 relative ${isActionOpen ? 'z-50' : 'z-10'}`}
          onClick={handleToggle}
        >
          <div className="flex-1 flex items-center gap-3 min-w-0 pr-4">
            {/* Drag Handle */}
            <div className="cursor-grab active:cursor-grabbing text-[var(--fg-faint)] hover:text-[var(--fg-dim)] px-1 select-none flex-shrink-0">
              <svg className="pointer-events-none" width="10" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"></circle><circle cx="15" cy="5" r="1.5"></circle><circle cx="9" cy="12" r="1.5"></circle><circle cx="15" cy="12" r="1.5"></circle><circle cx="9" cy="19" r="1.5"></circle><circle cx="15" cy="19" r="1.5"></circle></svg>
            </div>
            <svg 
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
              className={`shrink-0 text-[var(--fg-faint)] transition-transform duration-150 ${isExpanded ? '' : '-rotate-90'}`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            
            {/* Folder Icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--fg-faint)] shrink-0">
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
            </svg>

            <p className="text-[12.5px] font-medium text-[var(--fg-dim)] truncate">{props.title}</p>
          </div>
          
          {/* Count Badge */}
          <div className="flex justify-end shrink-0 mr-6">
            <span className="bg-transparent text-[var(--fg-dim)] border border-[var(--rule)] px-1.5 py-0.5 rounded-[3px] text-[11px] tabular-nums">
              {props.count}
            </span>
          </div>

          {/* Status Badge */}
          <div className="w-[80px] flex justify-end shrink-0 mr-4">
            {(props.status === 'AKTIF' || props.status === 'Aktif') ? (
              <span className="bg-[rgba(15,123,79,.08)] text-[var(--ok)] px-1.5 py-0.5 rounded-[3px] text-[10.5px] font-medium flex items-center gap-1.5 border border-[rgba(15,123,79,.18)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--ok)]"></span>
                {t('categories.active')}
              </span>
            ) : (
               <span className="bg-[var(--canvas)] text-[var(--fg-dim)] px-1.5 py-0.5 rounded-[3px] text-[10.5px] font-medium flex items-center gap-1.5 border border-[var(--rule)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--fg-faint)]"></span>
                {t('categories.inactive')}
              </span>
            )}
          </div>

          {/* Action Menu */}
          <div 
            className="w-[40px] flex justify-end shrink-0 relative" 
            ref={menuRef}
            onClick={(e) => { e.stopPropagation(); setIsActionOpen(!isActionOpen); }}
            onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
            draggable
          >
            <button className="p-1.5 rounded-[4px] hover:bg-[var(--canvas)] transition-colors text-[var(--fg-faint)] hover:text-[var(--fg)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>
            {isActionOpen && (
              <div className="absolute right-0 bottom-full mb-1 w-44 bg-[var(--surface)] border border-[var(--rule-strong)] rounded-[4px] shadow-[var(--shadow-pop)] z-20 flex flex-col py-1 overflow-hidden">
                {props.onMoveUp && (
                  <button onClick={(e) => { e.stopPropagation(); setIsActionOpen(false); props.onMoveUp?.(); }} className="px-3 py-2 text-[12px] text-left text-[var(--fg-dim)] hover:bg-[var(--canvas)] hover:text-[var(--fg)] transition-colors flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                    {t('categories.move_up')}
                  </button>
                )}
                {props.onMoveDown && (
                  <button onClick={(e) => { e.stopPropagation(); setIsActionOpen(false); props.onMoveDown?.(); }} className="px-3 py-2 text-[12px] text-left text-[var(--fg-dim)] hover:bg-[var(--canvas)] hover:text-[var(--fg)] transition-colors flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                    {t('categories.move_down')}
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setIsActionOpen(false); ctx?.onEditItem?.({ id: props.nodeId, title: props.originalTitle ?? props.title }, 'category'); }}
                  className="px-3 py-2 text-[12px] text-left text-[var(--fg-dim)] hover:bg-[var(--canvas)] hover:text-[var(--fg)] transition-colors"
                >
                  {t('categories.edit')}
                </button>
                <div className="h-px bg-[var(--rule)] w-full my-1"></div>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsActionOpen(false); ctx?.onDeleteItem?.(props.nodeId!, 'category'); }}
                  className="px-3 py-2 text-[12px] text-left text-[var(--danger)] hover:bg-[var(--canvas)] transition-colors"
                >
                  {t('categories.delete')}
                </button>
              </div>
            )}
          </div>
        </div>
        {isExpanded && props.childrenWrapperClassName && (
          <div className={props.childrenWrapperClassName}>{props.children}</div>
        )}
      </div>
    );
  }

  // Jika berupa Leaf (Subkategori final)
  return (
    <div className={`flex py-3 px-4 w-full items-center border-b border-[var(--rule)] hover:bg-[var(--canvas)] transition-colors duration-150 relative ${isActionOpen ? 'z-50' : 'z-10'}`}>
      <div className="flex-1 flex items-center gap-3 min-w-0 pr-4 pl-3">
        {/* Drag Handle */}
        <div className="cursor-grab active:cursor-grabbing text-[var(--fg-faint)] hover:text-[var(--fg-dim)] px-1 select-none flex-shrink-0">
          <svg className="pointer-events-none" width="10" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"></circle><circle cx="15" cy="5" r="1.5"></circle><circle cx="9" cy="12" r="1.5"></circle><circle cx="15" cy="12" r="1.5"></circle><circle cx="9" cy="19" r="1.5"></circle><circle cx="15" cy="19" r="1.5"></circle></svg>
        </div>
        {/* Document Icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--fg-faint)] shrink-0">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <p className="text-[12.5px] text-[var(--fg-dim)] truncate">{props.title}</p>
      </div>

      <div className="w-[80px] flex justify-end shrink-0 mr-6">
         {/* Leaf tidak punya child count */}
      </div>

      {/* Status Badge */}
      <div className="w-[80px] flex justify-end shrink-0 mr-4">
        {/* Subkategori biasanya mewarisi aktif/nonaktif dari API, default kita anggap AKTIF di mock jika tidak ada prop */}
        <span className="bg-[rgba(15,123,79,.08)] text-[var(--ok)] px-1.5 py-0.5 rounded-[3px] text-[10.5px] font-medium flex items-center gap-1.5 border border-[rgba(15,123,79,.18)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--ok)]"></span>
          {t('categories.active')}
        </span>
      </div>

      <div 
        className="w-[40px] flex justify-end shrink-0 relative" 
        ref={menuRef}
        onClick={(e) => { e.stopPropagation(); setIsActionOpen(!isActionOpen); }}
        onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
        draggable
      >
        <button className="p-1.5 rounded-[4px] hover:bg-[var(--canvas)] transition-colors text-[var(--fg-faint)] hover:text-[var(--fg)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>
        {isActionOpen && (
            <div className="absolute right-0 bottom-full mb-1 w-44 bg-[var(--surface)] border border-[var(--rule-strong)] rounded-[4px] shadow-[var(--shadow-pop)] z-20 flex flex-col py-1 overflow-hidden">
              {props.onMoveUp && (
                <button onClick={(e) => { e.stopPropagation(); setIsActionOpen(false); props.onMoveUp?.(); }} className="px-3 py-2 text-[12px] text-left text-[var(--fg-dim)] hover:bg-[var(--canvas)] hover:text-[var(--fg)] transition-colors flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                  {t('categories.move_up')}
                </button>
              )}
              {props.onMoveDown && (
                <button onClick={(e) => { e.stopPropagation(); setIsActionOpen(false); props.onMoveDown?.(); }} className="px-3 py-2 text-[12px] text-left text-[var(--fg-dim)] hover:bg-[var(--canvas)] hover:text-[var(--fg)] transition-colors flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                  {t('categories.move_down')}
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setIsActionOpen(false); ctx?.onEditItem?.({ id: props.nodeId, title: props.originalTitle ?? props.title }, 'subcategory'); }}
                className="px-3 py-2 text-[12px] text-left text-[var(--fg-dim)] hover:bg-[var(--canvas)] hover:text-[var(--fg)] transition-colors"
              >
                {t('categories.edit')}
              </button>
              <div className="h-px bg-[var(--rule)] w-full my-1"></div>
              <button
                onClick={(e) => { e.stopPropagation(); setIsActionOpen(false); ctx?.onDeleteItem?.(props.nodeId!, 'subcategory'); }}
                className="px-3 py-2 text-[12px] text-left text-[var(--danger)] hover:bg-[var(--canvas)] transition-colors"
              >
                {t('categories.delete')}
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
