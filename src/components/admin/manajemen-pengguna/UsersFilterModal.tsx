import React, { useState } from 'react';
import Modal, { ModalCancelButton, ModalPrimaryButton } from '@/components/ui/Modal';

export interface UsersFilterData {
  fakultas: string;
}

interface UsersFilterModalProps {
  onClose: () => void;
  onApply: (filters: UsersFilterData) => void;
  uniqueFakultas: string[];
}

export default function UsersFilterModal({ onClose, onApply, uniqueFakultas }: UsersFilterModalProps) {
  const [filters, setFilters] = useState<UsersFilterData>({
    fakultas: 'ALL',
  });

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  return (
    <Modal
      title="Filter Lanjutan"
      onClose={onClose}
      footer={
        <>
          <ModalCancelButton onClick={onClose}>Batal</ModalCancelButton>
          <ModalPrimaryButton onClick={handleApply}>Terapkan Filter</ModalPrimaryButton>
        </>
      }
    >
      <div className="mt-5">
        <label className="block text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] mb-1.5">Fakultas / Unit Kerja</label>
        <div className="relative">
          <select
            value={filters.fakultas}
            onChange={(e) => setFilters({...filters, fakultas: e.target.value})}
            className="w-full h-9 border border-[var(--rule-strong)] rounded-[4px] pl-3 pr-8 text-[12px] bg-transparent text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] appearance-none cursor-pointer"
          >
            <option value="ALL">Semua Fakultas / Unit</option>
            {uniqueFakultas.map((fak) => (
              <option key={fak} value={fak}>{fak}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--fg-faint)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>
    </Modal>
  );
}
