import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from '@/context/LanguageContext';
import Modal, { ModalCancelButton } from '@/components/ui/Modal';

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
  agent?: any; // If null, it's Add Mode. If object, it's Edit Mode.
  departments: any[];
}

export default function AgentModal({ isOpen, onClose, onSuccess, showToast, agent, departments }: AgentModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("operator");
  const [deptId, setDeptId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (agent) {
      setName(agent.name || "");
      setEmail(agent.email || "");
      setPhone(agent.phone || "");
      setRole(agent.role || "operator");
      setDeptId(agent.dept_id ? String(agent.dept_id) : "");
      setPassword("");
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setRole("operator");
      setDeptId("");
      setPassword("");
    }
  }, [agent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      email,
      phone,
      role,
      dept_id: deptId ? parseInt(deptId) : null,
    };

    if (agent) {
      // Edit
      try {
        const { fetchClient } = await import('@/lib/apiClient');
        await fetchClient(`/admin/staff/${agent.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showToast(t('staff.updated'), "success");
        onSuccess();
      } catch (err: any) {
        showToast(t('staff.update_failed') + ': ' + err.message, "error");
      }
    } else {
      // Add via backend to create auth user
      try {
        const { fetchClient } = await import('@/lib/apiClient');
        await fetchClient('/admin/staff', {
          method: 'POST',
          body: JSON.stringify({ ...payload, password: password || 'password123' }) // Use entered password or default
        });
        showToast(t('staff.added'), "success");
        onSuccess();
      } catch (err: any) {
        showToast(t('staff.add_failed') + ': ' + err.message, "error");
      }
    }
    setLoading(false);
  };

  return (
    <Modal
      title={agent ? t('staff.edit_agent_title') : t('staff.add_agent_title')}
      onClose={onClose}
      maxWidth="max-w-[500px]"
    >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('profile.full_name')}</label>
            <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-sm" />
          </div>
          {!agent && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Password</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  minLength={6}
                  className="w-full border border-gray-300 rounded p-2 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('profile.phone')}</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('profile.role')}</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-sm">
              <option value="admin">Administrator</option>
              <option value="operator">Operator</option>
              <option value="agent">Agent</option>
              <option value="pimpinan">Pimpinan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('staff.department')}</label>
            <select value={deptId} onChange={(e) => setDeptId(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-sm">
              <option value="">{t('staff.select_department')}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
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
