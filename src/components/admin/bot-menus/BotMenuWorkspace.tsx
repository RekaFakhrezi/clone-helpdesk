'use client';

import React, { useState, useEffect } from 'react';
import { fetchClient } from '@/lib/apiClient';
import Modal, { ModalCancelButton } from '@/components/ui/Modal';

interface BotMenu {
  id: number;
  title: string;
  action_type: string;
  content: string | null;
  sort_order: number;
  is_active: boolean;
}

export default function BotMenuWorkspace() {
  const [menus, setMenus] = useState<BotMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<any>({
    id: null,
    title: '',
    action_type: 'TEXT_REPLY',
    content: '',
    sort_order: 1,
    is_active: true
  });

  const loadMenus = async () => {
    setLoading(true);
    try {
      const res = await fetchClient('/admin/bot-menus');
      setMenus(res || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (formData.id) {
        await fetchClient(`/admin/bot-menus/${formData.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await fetchClient('/admin/bot-menus', {
          method: 'POST',
          body: JSON.stringify({ ...formData, sort_order: menus.length + 1 })
        });
      }
      setIsModalOpen(false);
      loadMenus();
    } catch (error) {
      console.error(error);
      alert('Gagal menyimpan menu bot');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus menu ini?')) return;
    try {
      await fetchClient(`/admin/bot-menus/${id}`, { method: 'DELETE' });
      loadMenus();
    } catch (error) {
      console.error(error);
      alert('Gagal menghapus menu');
    }
  };

  const openModal = (menu?: BotMenu) => {
    if (menu) {
      setFormData({ ...menu });
    } else {
      setFormData({
        id: null,
        title: '',
        action_type: 'TEXT_REPLY',
        content: '',
        sort_order: menus.length + 1,
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const fieldClass = "h-9 w-full px-3 rounded-[4px] border border-[var(--rule-strong)] bg-transparent text-[12px] text-[var(--fg)] outline-none focus:border-[var(--accent)] transition-colors";
  const labelClass = "block text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] mb-1.5";

  return (
    <div className="w-full h-full max-w-[1440px] mx-auto">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-medium leading-tight tracking-[-0.01em] text-[var(--fg)]">Pengaturan Menu Bot</h1>
          <p className="mt-1 text-[13px] text-[var(--fg-dim)]">Kelola menu interaktif yang muncul di WhatsApp Bot.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex h-9 px-3 items-center rounded-[4px] bg-[var(--accent)] text-[12px] font-medium text-white hover:bg-[var(--accent-hover)] transition-colors duration-150"
        >
          + Tambah Menu
        </button>
      </div>

      <div className="bg-[var(--surface)] rounded-[4px] border border-[var(--rule)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[12.5px] text-[var(--fg-dim)]">Memuat data...</div>
        ) : menus.length === 0 ? (
          <div className="p-8 text-center text-[12.5px] text-[var(--fg-dim)]">Belum ada menu bot.</div>
        ) : (
          <table className="w-full text-left table-auto">
            <thead className="border-b border-[var(--rule)]">
              <tr>
                <th className="px-4 py-2.5"><span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">Judul Menu</span></th>
                <th className="px-4 py-2.5"><span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">Tipe Aksi</span></th>
                <th className="px-4 py-2.5"><span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">Isi / Balasan</span></th>
                <th className="px-4 py-2.5"><span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">Status</span></th>
                <th className="px-4 py-2.5 text-right"><span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">Aksi</span></th>
              </tr>
            </thead>
            <tbody>
              {menus.map((menu, i) => (
                <tr key={menu.id} className="border-b border-[var(--rule)] transition-colors hover:bg-[var(--canvas)]">
                  <td className="px-4 py-3 text-[12.5px] font-medium text-[var(--fg)]">
                    <span className="text-[var(--fg-faint)] tabular-nums">{i + 1}.</span> {menu.title}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[var(--fg-dim)]">
                    {menu.action_type === 'CREATE_TICKET' ? 'Buat Tiket' : 
                     menu.action_type === 'CHECK_STATUS' ? 'Cek Status' : 'Balas Teks'}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[var(--fg-dim)] truncate max-w-[200px]">
                    {menu.content || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {menu.is_active ? 
                      <span className="px-1.5 py-0.5 border border-[rgba(15,123,79,.18)] bg-[rgba(15,123,79,.08)] text-[var(--ok)] rounded-[3px] text-[10.5px] font-medium">Aktif</span> : 
                      <span className="px-1.5 py-0.5 border border-[var(--rule)] bg-[var(--canvas)] text-[var(--fg-dim)] rounded-[3px] text-[10.5px] font-medium">Nonaktif</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openModal(menu)} className="p-1.5 rounded-[4px] text-[var(--fg-dim)] hover:bg-[var(--canvas)] hover:text-[var(--fg)] transition-colors" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(menu.id)} className="p-1.5 rounded-[4px] text-[var(--danger)] hover:bg-[var(--canvas)] transition-colors" title="Hapus">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <Modal
          title={formData.id ? 'Edit Menu' : 'Tambah Menu'}
          onClose={() => setIsModalOpen(false)}
          maxWidth="max-w-md"
          footer={
            <>
              <ModalCancelButton onClick={() => setIsModalOpen(false)}>Batal</ModalCancelButton>
              <button
                type="submit"
                form="botMenuForm"
                disabled={saving}
                className="h-9 px-3 rounded-[4px] bg-[var(--accent)] text-[12px] font-medium text-white hover:bg-[var(--accent-hover)] transition-colors duration-150 disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </>
          }
        >
          <form id="botMenuForm" onSubmit={handleSave} className="mt-4 flex flex-col gap-4">
            <div>
              <label className={labelClass}>Judul Menu (Tampil di WA)</label>
              <input 
                type="text" required value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                className={fieldClass}
                placeholder="Contoh: Info Kontak"
              />
            </div>
            <div>
              <label className={labelClass}>Tipe Aksi</label>
              <select 
                value={formData.action_type} 
                onChange={e => setFormData({...formData, action_type: e.target.value})}
                className="h-9 w-full px-3 rounded-[4px] border border-[var(--rule-strong)] bg-[var(--surface)] text-[12px] text-[var(--fg)] outline-none focus:border-[var(--accent)] transition-colors"
              >
                <option value="CREATE_TICKET">Alur Pembuatan Tiket</option>
                <option value="CHECK_STATUS">Alur Cek Status Tiket</option>
                <option value="TEXT_REPLY">Balas dengan Teks (Kustom)</option>
              </select>
            </div>
            {formData.action_type === 'TEXT_REPLY' && (
              <div>
                <label className={labelClass}>Isi Balasan Teks</label>
                <textarea 
                  required rows={4} value={formData.content || ''} 
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full px-3 py-2 rounded-[4px] border border-[var(--rule-strong)] bg-transparent text-[12px] text-[var(--fg)] outline-none focus:border-[var(--accent)] transition-colors resize-none"
                  placeholder="Tuliskan informasi atau FAQ di sini..."
                ></textarea>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" id="isActive" checked={formData.is_active}
                onChange={e => setFormData({...formData, is_active: e.target.checked})}
                className="h-[14px] w-[14px] cursor-pointer accent-[var(--accent)]"
              />
              <label htmlFor="isActive" className="text-[12px] text-[var(--fg-dim)]">Aktifkan Menu Ini</label>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
