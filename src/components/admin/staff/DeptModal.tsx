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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('staff.department')}</label>
            <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-sm" />
          </div>
          
          <div className="flex justify-end gap-3 mt-4">
            <ModalCancelButton onClick={onClose}>{t('staff.cancel')}</ModalCancelButton>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm text-white bg-[#001E40] rounded hover:bg-[#00142d] disabled:opacity-50">
              {loading ? t('staff.saving') : t('staff.save')}
            </button>
          </div>
        </form>
    </Modal>
  );
}
