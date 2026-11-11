'use client';

import React from 'react';

interface ModalProps {
  /** Judul modal, dirender sebagai <h2>. */
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Baris tombol aksi di bawah body. */
  footer?: React.ReactNode;
  /** Deskripsi singkat di bawah judul. */
  subtitle?: string;
  /** Kelas lebar panel, default `max-w-sm`. */
  maxWidth?: string;
  /** Kelas z-index overlay, default `z-50`. */
  zIndex?: string;
}

/**
 * Satu-satunya kerangka modal untuk dashboard: overlay gelap + blur, panel putih,
 * judul, body, footer.
 */
export default function Modal({
  title,
  onClose,
  children,
  footer,
  subtitle,
  maxWidth = 'max-w-sm',
  zIndex = 'z-50',
}: ModalProps) {
  return (
    <div className={`fixed inset-0 ${zIndex} flex items-center justify-center bg-[rgba(11,21,36,0.55)] p-4`}>
      <div className={`bg-[var(--surface)] rounded-[4px] border border-[var(--rule-strong)] p-6 w-full ${maxWidth} shadow-[var(--shadow-pop)] animate-in fade-in duration-150`}>
        <h2 className="text-[15px] font-medium tracking-[-0.01em] text-[var(--fg)] mb-1">{title}</h2>
        {subtitle ? <p className="text-[12.5px] text-[var(--fg-dim)] mb-5">{subtitle}</p> : null}
        {children}
        {footer ? <div className="flex justify-end gap-2 mt-6">{footer}</div> : null}
      </div>
    </div>
  );
}

/** Tombol batal standar untuk footer Modal. */
export function ModalCancelButton({ onClick, children = 'Cancel' }: { onClick: () => void; children?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-9 px-3 rounded-[4px] border border-[var(--rule-strong)] text-[12px] font-medium text-[var(--fg-dim)] hover:bg-[var(--canvas)] hover:text-[var(--fg)] transition-colors duration-150"
    >
      {children}
    </button>
  );
}

/** Tombol aksi utama standar untuk footer Modal. */
export function ModalPrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-9 px-3 rounded-[4px] bg-[var(--accent)] text-[12px] font-medium text-white hover:bg-[var(--accent-hover)] transition-colors duration-150 disabled:opacity-50"
    >
      {children}
    </button>
  );
}
