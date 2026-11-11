'use client';

import React, { useState, useEffect, useRef } from 'react';
import Modal, { ModalCancelButton, ModalPrimaryButton } from '@/components/ui/Modal';

interface NewTicketModalProps {
  onClose: () => void;
  onSubmit: (ticketData: any) => void;
}

const LABEL_CLASS = 'text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]';
const INPUT_CLASS =
  'h-9 w-full px-2.5 rounded-[4px] border border-[var(--rule-strong)] bg-transparent text-[12.5px] text-[var(--fg)] outline-none focus:border-[var(--accent)] transition-colors duration-150';
const READONLY_CLASS =
  'h-9 w-full px-2.5 rounded-[4px] border border-[var(--rule)] bg-[var(--canvas)] text-[12.5px] text-[var(--fg-dim)] cursor-not-allowed outline-none';
const SELECT_CLASS =
  'h-9 w-full px-2.5 rounded-[4px] border border-[var(--rule-strong)] bg-transparent text-[12.5px] text-[var(--fg)] outline-none focus:border-[var(--accent)] transition-colors duration-150 cursor-pointer';
const TEXTAREA_CLASS =
  'w-full min-h-[76px] px-2.5 py-2 rounded-[4px] border border-[var(--rule-strong)] bg-transparent text-[12.5px] leading-relaxed text-[var(--fg)] outline-none focus:border-[var(--accent)] transition-colors duration-150 resize-y';

export default function NewTicketModal({ onClose, onSubmit }: NewTicketModalProps) {
  // Setup default date to today
  const today = new Date().toISOString().split('T')[0];

  const formRef = useRef<HTMLFormElement>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { supabase } = await import('@/lib/supabase');
      const { data: deptData } = await supabase.from('departments').select('*').order('name');
      if (deptData) setDepartments(deptData);

      const { data: catData } = await supabase.from('categories').select('*').order('name');
      if (catData) {
        // Build hierarchy: Parent / Child
        const mainCats = catData.filter(c => !c.parent_id);
        const subCats = catData.filter(c => c.parent_id);
        const hierarchical: any[] = [];

        mainCats.forEach(main => {
          hierarchical.push(main);
          subCats.filter(sub => sub.parent_id === main.id).forEach(sub => {
            hierarchical.push({ ...sub, display_name: `${main.name} / ${sub.name}` });
          });
        });
        setCategories(hierarchical);
      }
    }
    loadData();
  }, []);

  const [formData, setFormData] = useState({
    dateCreated: today,
    status: 'NEW',
    requesterName: '',
    requesterNim: '',
    requesterUnit: '',
    requesterPhone: '',
    subject: '',
    description: '',
    category: '',
    assignTo: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Panggil fungsi submit dari parent
    onSubmit(formData);
  };

  return (
    <Modal
      title="Create New Ticket"
      onClose={onClose}
      maxWidth="max-w-3xl"
      footer={
        <>
          <ModalCancelButton onClick={onClose}>Cancel</ModalCancelButton>
          <ModalPrimaryButton onClick={() => formRef.current?.requestSubmit()}>Submit Ticket</ModalPrimaryButton>
        </>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5 max-h-[65vh] overflow-y-auto pr-1">

        {/* Row 1: Date & Status (Auto/Readonly) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={LABEL_CLASS}>Date Created</label>
            <input type="date" name="dateCreated" value={formData.dateCreated} readOnly className={READONLY_CLASS} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={LABEL_CLASS}>Status Tiket</label>
            <input type="text" name="status" value={formData.status} readOnly className={READONLY_CLASS} />
          </div>
        </div>

        {/* Data Diri Pelapor (From) */}
        <div className="flex flex-col gap-3 border-t border-[var(--rule)] pt-4">
          <h3 className={LABEL_CLASS}>Informasi Pelapor (From)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS}>Nama Lengkap *</label>
              <input required type="text" name="requesterName" value={formData.requesterName} onChange={handleChange} placeholder="Contoh: Andi Saputra" className={INPUT_CLASS} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS}>NIM / NIP *</label>
              <input required type="text" name="requesterNim" value={formData.requesterNim} onChange={handleChange} placeholder="Nomor Induk" className={INPUT_CLASS} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS}>Fakultas / Unit Kerja *</label>
              <input required type="text" name="requesterUnit" value={formData.requesterUnit} onChange={handleChange} placeholder="Contoh: Fakultas Teknik" className={INPUT_CLASS} />
            </div>
          </div>
        </div>

        {/* Ticket Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={LABEL_CLASS}>No. WhatsApp *</label>
            <input type="text" name="requesterPhone" required value={formData.requesterPhone} onChange={handleChange} className={INPUT_CLASS} placeholder="628..." />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={LABEL_CLASS}>Kategori Kendala *</label>
            <select required name="category" value={formData.category} onChange={handleChange} className={SELECT_CLASS}>
              <option value="" disabled>Pilih Kategori...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.display_name || c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={LABEL_CLASS}>Departemen (Assign To)</label>
            <select name="assignTo" value={formData.assignTo} onChange={handleChange} className={SELECT_CLASS}>
              <option value="">Unassigned (Biarkan kosong)</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS}>Subject *</label>
          <input required type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="Ringkasan singkat kendala" className={INPUT_CLASS} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS}>Deskripsi Kendala *</label>
          <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Jelaskan secara detail kendala yang dialami..." className={TEXTAREA_CLASS}></textarea>
        </div>

      </form>
    </Modal>
  );
}
