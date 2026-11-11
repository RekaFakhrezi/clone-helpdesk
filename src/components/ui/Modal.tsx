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
    <div className={`fixed inset-0 ${zIndex} flex items-center justify-center bg-black/50 backdrop-blur-sm`}>
      <div className={`bg-white rounded p-6 w-full ${maxWidth} shadow-md animate-in fade-in zoom-in-95`}>
        <h2 className="text-lg font-bold text-gray-900 mb-1">{title}</h2>
        {subtitle ? <p className="text-sm text-gray-500 mb-5">{subtitle}</p> : null}
        {children}
        {footer ? <div className="flex justify-end gap-2">{footer}</div> : null}
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
      className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
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
      className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 hover:bg-black rounded transition-colors disabled:opacity-50"
    >
      {children}
    </button>
  );
}
