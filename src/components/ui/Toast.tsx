'use client';

import { useCallback, useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastState {
  message: string;
  type: ToastType;
}

/**
 * State toast + auto-dismiss. Pasangkan dengan komponen <Toast toast={toast} />.
 */
export function useToast(timeout = 3000) {
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), timeout);
    return () => clearTimeout(timer);
  }, [toast, timeout]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  }, []);

  return { toast, showToast, dismiss: useCallback(() => setToast(null), []) };
}

/** Markup toast melayang di atas layar (sama untuk semua dashboard). */
export default function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;
  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
      <div
        className={`px-4 py-2.5 rounded-[4px] shadow-[var(--shadow-pop)] flex items-center gap-2.5 text-[12.5px] font-medium text-white ${
          toast.type === 'error' ? 'bg-[var(--danger)]' : toast.type === 'warning' ? 'bg-[var(--warn)]' : 'bg-[var(--ok)]'
        }`}
      >
        {toast.type === 'success' && (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
          </svg>
        )}
        {toast.message}
      </div>
    </div>
  );
}
