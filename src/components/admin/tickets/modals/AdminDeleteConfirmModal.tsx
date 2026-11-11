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
      <p className="text-gray-500 text-sm mb-5">
        Anda akan menghapus <strong>{selectedCount}</strong> tiket.
        {isPermanent ? ' Tindakan ini permanen.' : ' Tiket akan dipindahkan ke folder "Dihapus".'}
      </p>
    </Modal>
  );
}
