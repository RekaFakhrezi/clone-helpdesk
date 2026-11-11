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
      <div className="mb-5">
        <label className="block text-sm font-semibold text-[#1A1C1E] mb-2 font-iBMPlexSans">Fakultas / Unit Kerja</label>
        <div className="relative">
          <select 
            value={filters.fakultas}
            onChange={(e) => setFilters({...filters, fakultas: e.target.value})}
            className="w-full border border-[#C3C6D1] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0059BB] appearance-none bg-white text-gray-700"
          >
            <option value="ALL">Semua Fakultas / Unit</option>
            {uniqueFakultas.map((fak) => (
              <option key={fak} value={fak}>{fak}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>
    </Modal>
  );
}
