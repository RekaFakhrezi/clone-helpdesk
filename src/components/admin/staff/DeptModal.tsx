import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from '@/context/LanguageContext';
import Modal, { ModalCancelButton } from '@/components/ui/Modal';

interface DeptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  dept?: any; // If null, Add Mode. Else Edit Mode
  showToast?: (message: string, type: 'success' | 'error') => void;
}

export default function DeptModal({ isOpen, onClose, onSuccess, dept, showToast }: DeptModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dept) {
      setName(dept.name || "");
    } else {
      setName("");
    }
  }, [dept, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
    };

    if (dept) {
      // Edit
      try {
        const { fetchClient } = await import('@/lib/apiClient');
        await fetchClient(`/admin/departments/${dept.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        if (showToast) showToast(t('staff.updated'), "success");
        onSuccess();
      } catch (err: any) {
        if (showToast) showToast(t('staff.update_failed') + ': ' + err.message, "error");
      }
    } else {
      // Add
      try {
        const { fetchClient } = await import('@/lib/apiClient');
        await fetchClient('/admin/departments', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (showToast) showToast(t('staff.added'), "success");
        onSuccess();
      } catch (err: any) {
        if (showToast) showToast(t('staff.add_failed') + ': ' + err.message, "error");
      }
    }
    setLoading(false);
  };

  return (
    <Modal
      title={dept ? t('staff.edit_dept_title') : t('staff.add_dept_title')}
      onClose={onClose}
      maxWidth="max-w-[400px]"
    >
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div>
            <label className="block text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] mb-1.5">{t('staff.department')}</label>
            <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="h-9 w-full rounded-[4px] border border-[var(--rule-strong)] bg-transparent px-3 text-[12px] text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]" />
          </div>
          
          <div className="flex justify-end gap-2 mt-2">
            <ModalCancelButton onClick={onClose}>{t('staff.cancel')}</ModalCancelButton>
            <button type="submit" disabled={loading} className="h-9 px-3 rounded-[4px] bg-[var(--accent)] text-[12px] font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50">
              {loading ? t('staff.saving') : t('staff.save')}
            </button>
          </div>
        </form>
    </Modal>
  );
}
