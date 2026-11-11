'use client';

import React, { useState } from 'react';
import { TicketStatus } from './TicketTableSection';
import Modal, { ModalCancelButton, ModalPrimaryButton } from '@/components/ui/Modal';

interface AdminChangeStatusModalProps {
  onClose: () => void;
  onSubmit: (newStatus: TicketStatus | 'DITOLAK' | 'DELETED') => void;
  selectedCount: number;
}

export default function AdminChangeStatusModal({ onClose, onSubmit, selectedCount }: AdminChangeStatusModalProps) {
  const [status, setStatus] = useState<string>('');

  const handleSubmit = () => {
    if (!status) {
      alert('Please select a status first.');
      return;
    }
    onSubmit(status as any);
  };

  return (
    <Modal
      title="Change Status"
      onClose={onClose}
      footer={
        <>
          <ModalCancelButton onClick={onClose}>Cancel</ModalCancelButton>
          <ModalPrimaryButton onClick={handleSubmit}>Apply</ModalPrimaryButton>
        </>
      }
    >
      <p className="text-sm text-gray-500 mb-5">
        Changing status of <strong>{selectedCount}</strong> ticket(s).
      </p>

      <div className="mb-6">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-gray-500"
        >
          <option value="" disabled>Select a new status...</option>
          <option value="OPEN">OPEN</option>
          <option value="IN PROGRESS">IN PROGRESS</option>
          <option value="WAITING VERIFICATION">WAITING VERIFICATION</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CLOSED">CLOSED</option>
          <option value="DITOLAK">REJECTED</option>
          <option value="DELETED">DELETED</option>
        </select>
      </div>
    </Modal>
  );
}
