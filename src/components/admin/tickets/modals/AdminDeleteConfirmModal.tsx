'use client';

import React from 'react';
import Modal, { ModalCancelButton, ModalPrimaryButton } from '@/components/ui/Modal';

interface AdminDeleteConfirmModalProps {
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
  isPermanent?: boolean;
}

export default function AdminDeleteConfirmModal({ onClose, onConfirm, selectedCount, isPermanent = false }: AdminDeleteConfirmModalProps) {
  return (
    <Modal
      title={isPermanent ? 'Hapus Permanen?' : 'Konfirmasi Hapus'}
      onClose={onClose}
      footer={
        <>
          <ModalCancelButton onClick={onClose}>Batal</ModalCancelButton>
          <ModalPrimaryButton
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {isPermanent ? 'Hapus Permanen' : 'Hapus'}
          </ModalPrimaryButton>
        </>
      }
    >
      <p className="text-[12.5px] leading-relaxed text-[var(--fg-dim)] mb-2">
        Anda akan menghapus <span className="font-medium text-[var(--fg)] tabular-nums">{selectedCount}</span> tiket.
        {isPermanent ? ' Tindakan ini permanen.' : ' Tiket akan dipindahkan ke folder "Dihapus".'}
      </p>
    </Modal>
  );
}
