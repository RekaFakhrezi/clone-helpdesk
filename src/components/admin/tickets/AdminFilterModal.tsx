'use client';

import React, { useState } from 'react';
import Modal, { ModalCancelButton, ModalPrimaryButton } from '@/components/ui/Modal';

interface AdminFilterModalProps {
  onClose: () => void;
  onApply: (filters: { category: string; startDate: string; endDate: string; priority: string }) => void;
  categories: any[];
}

const LABEL_CLASS = 'block text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] mb-1.5';
const FIELD_CLASS =
  'h-9 w-full px-2.5 rounded-[4px] border border-[var(--rule-strong)] bg-transparent text-[12.5px] text-[var(--fg)] outline-none focus:border-[var(--accent)] transition-colors duration-150';

export default function AdminFilterModal({ onClose, onApply, categories }: AdminFilterModalProps) {
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState('');

  const handleApply = () => {
    onApply({ category, startDate, endDate, priority });
    onClose();
  };

  const handleReset = () => {
    setCategory('');
    setStartDate('');
    setEndDate('');
    setPriority('');
    onApply({ category: '', startDate: '', endDate: '', priority: '' });
    onClose();
  };

  return (
    <Modal
      title="Advanced Filters"
      onClose={onClose}
      maxWidth="max-w-md"
      footer={
        <>
          <button
            type="button"
            onClick={handleReset}
            className="mr-auto h-9 px-3 rounded-[4px] border border-transparent text-[12px] font-medium text-[var(--fg-faint)] hover:bg-[var(--canvas)] hover:text-[var(--fg-dim)] transition-colors duration-150"
          >
            Reset Filters
          </button>
          <ModalCancelButton onClick={onClose}>Cancel</ModalCancelButton>
          <ModalPrimaryButton onClick={handleApply}>Apply Filters</ModalPrimaryButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`${FIELD_CLASS} tabular-nums`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`${FIELD_CLASS} tabular-nums`}
            />
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS}>Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className={`${FIELD_CLASS} cursor-pointer`}
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}
