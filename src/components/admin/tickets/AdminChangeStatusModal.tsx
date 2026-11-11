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
      <p className="text-[12.5px] text-[var(--fg-dim)] mb-4">
        Changing status of <span className="font-medium text-[var(--fg)]">{selectedCount}</span> ticket(s).
      </p>

      <div className="mb-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 w-full px-2.5 rounded-[4px] border border-[var(--rule-strong)] bg-transparent text-[12.5px] text-[var(--fg)] outline-none focus:border-[var(--accent)] transition-colors duration-150 cursor-pointer"
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
