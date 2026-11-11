'use client';

import { useCallback, useEffect, useState } from 'react';

export type ToastType = 'success' | 'error';

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
        className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 font-medium text-white ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-[#10B981]'
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
