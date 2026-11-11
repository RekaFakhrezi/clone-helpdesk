'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UsersHeader from './UsersHeader';
import UsersStatistics from './UsersStatistics';
import UsersToolbar from './UsersToolbar';
import UsersTableSection from './UsersTableSection';
import UsersFilterModal, { UsersFilterData } from './UsersFilterModal';
import AdminDeleteConfirmModal from '../tickets/modals/AdminDeleteConfirmModal';
import Modal, { ModalCancelButton } from '@/components/ui/Modal';
import Toast, { useToast } from '@/components/ui/Toast';
import { fetchClient } from '@/lib/apiClient';

export interface UserItem {
  id: string;
  phone: string;
  name: string;
  nimNip: string;
  fakultasUnit: string;
  status: 'Aktif' | 'Terblokir';
  createdDate: string;
  rawDate: string;
}

export default function UserWorkspace() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<UsersFilterData | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    nimNip: '',
    fakultasUnit: '',
    status: 'Aktif' as 'Aktif' | 'Terblokir'
  });

  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data } = await fetchClient('/admin/reporters');
      const mapped = (data || []).map((r: any) => ({
        id: r.id,
        phone: r.phone,
        name: r.name,
        nimNip: r.nim_nip,
        fakultasUnit: r.unit,
        status: r.status,
        createdDate: new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        rawDate: r.created_at
      }));
      setUsers(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const uniqueFakultas = useMemo(() => {
    const set = new Set<string>();
    users.forEach(u => {
      if (u.fakultasUnit) set.add(u.fakultasUnit);
    });
    return Array.from(set).sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.nimNip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery);
      
      let matchesFakultas = true;
      
      if (filters) {
        if (filters.fakultas !== 'ALL' && user.fakultasUnit !== filters.fakultas) matchesFakultas = false;
      }
      
      return matchesSearch && matchesFakultas;
    });
  }, [users, searchQuery, filters]);

  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handleSelectUser = useCallback((id: string) => {
    setSelectedUserIds((prev) => prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]);
  }, []);

  const handleSelectAll = useCallback(() => {
    const currentPageIds = paginatedUsers.map((u) => u.id);
    const isAllCurrentSelected = currentPageIds.every((id) => selectedUserIds.includes(id));
    if (isAllCurrentSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  }, [paginatedUsers, selectedUserIds]);

  const handleAddClick = useCallback(() => {
    setEditingUser(null);
    setFormData({ phone: '', name: '', nimNip: '', fakultasUnit: '', status: 'Aktif' });
    setIsModalOpen(true);
  }, []);

  const router = useRouter();

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { toast, showToast } = useToast();

  const handleEditClick = useCallback((user: UserItem) => {
    router.push(`/dashboard/administrasi/users/${user.id}?edit=true`);
  }, [router]);

  const handleDeleteClick = async (id: string) => {
    setSelectedUserIds([id]);
    setIsDeleteConfirmOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await fetchClient(`/admin/reporters/${editingUser.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            phone: formData.phone,
            name: formData.name,
            nim_nip: formData.nimNip,
            unit: formData.fakultasUnit,
            status: formData.status
          })
        });
        showToast('Berhasil mengedit pelapor!', 'success');
      } else {
        await fetchClient('/admin/reporters', {
          method: 'POST',
          body: JSON.stringify({
            phone: formData.phone,
            name: formData.name,
            nim_nip: formData.nimNip,
            unit: formData.fakultasUnit,
            reporter_type: 'Umum',
            status: formData.status
          })
        });
        showToast('Berhasil menambahkan pelapor baru!', 'success');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      showToast("Gagal menyimpan data: " + error.message, 'error');
    }
  };

  const stats = useMemo(() => {
    let today = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    users.forEach(u => {
      if (u.rawDate.startsWith(todayStr)) today++;
    });
    return {
      total: users.length,
      today
    };
  }, [users]);

  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) {
      showToast('Belum ada pelapor yang dipilih!', 'warning');
      return;
    }
    setIsDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    setIsLoading(true);
    try {
      for (const id of selectedUserIds) {
        await fetchClient(`/admin/reporters/${id}`, { method: 'DELETE' });
      }
      showToast(`Berhasil menghapus ${selectedUserIds.length} pelapor.`, 'success');
      setSelectedUserIds([]);
      await fetchUsers();
    } catch (e: any) {
      console.error(e);
      showToast('Gagal menghapus pelapor: ' + e.message, 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-6 w-full relative">
      <UsersHeader />
      <UsersStatistics totalUsers={stats.total} todayUsers={stats.today} />
      <UsersToolbar
        searchQuery={searchQuery}
        onSearchChange={(query) => { setSearchQuery(query); setCurrentPage(1); }}
        onFilterClick={() => setIsFilterModalOpen(true)}
        onResetFilterClick={() => {
          setFilters(null);
          setSearchQuery('');
          setCurrentPage(1);
        }}
        onExportClick={() => alert('Exporting...')}
        onAddClick={handleAddClick}
        selectedCount={selectedUserIds.length}
        onBulkDeleteClick={handleBulkDelete}
      />
      <UsersTableSection
        users={paginatedUsers}
        totalUsers={totalItems}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        selectedUserIds={selectedUserIds}
        isLoading={isLoading}
        onSelectUser={handleSelectUser}
        onSelectAll={handleSelectAll}
        onPageChange={setCurrentPage}
        onEditUser={handleEditClick}
        onDeleteUser={handleDeleteClick}
      />

      {isModalOpen && (
        <Modal
          title={editingUser ? 'Edit Data Pelapor' : 'Tambah Pelapor Baru'}
          onClose={() => setIsModalOpen(false)}
          maxWidth="max-w-md"
        >
            <form onSubmit={handleSaveForm} className="mt-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">Nomor WA / Telepon</label>
                <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="h-9 w-full rounded-[4px] border border-[var(--rule-strong)] bg-transparent px-3 text-[12px] text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-60" placeholder="6281234..." disabled={!!editingUser} />
                {editingUser && <span className="text-[11.5px] text-[var(--fg-faint)]">Nomor WA tidak bisa diubah karena terikat riwayat percakapan.</span>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">Nama Lengkap</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-9 w-full rounded-[4px] border border-[var(--rule-strong)] bg-transparent px-3 text-[12px] text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-60" placeholder="Masukkan nama..." />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">NIM / NIP</label>
                <input required type="text" value={formData.nimNip} onChange={e => setFormData({...formData, nimNip: e.target.value})} className="h-9 w-full rounded-[4px] border border-[var(--rule-strong)] bg-transparent px-3 text-[12px] text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-60" placeholder="Masukkan NIM / NIP..." />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">Fakultas / Unit Kerja</label>
                <input required type="text" value={formData.fakultasUnit} onChange={e => setFormData({...formData, fakultasUnit: e.target.value})} className="h-9 w-full rounded-[4px] border border-[var(--rule-strong)] bg-transparent px-3 text-[12px] text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-60" placeholder="Cth: Fakultas Teknik / UPT TI" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as 'Aktif'|'Terblokir'})} className="h-9 w-full rounded-[4px] border border-[var(--rule-strong)] bg-transparent px-3 text-[12px] text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-60">
                  <option value="Aktif">Aktif</option>
                  <option value="Terblokir">Terblokir</option>
                </select>
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <ModalCancelButton onClick={() => setIsModalOpen(false)}>Batal</ModalCancelButton>
                <button type="submit" className="h-9 px-3 rounded-[4px] bg-[var(--accent)] text-[12px] font-medium text-white transition-colors hover:bg-[var(--accent-hover)]">Simpan</button>
              </div>
            </form>
        </Modal>
      )}

      {isFilterModalOpen && (
        <UsersFilterModal
          uniqueFakultas={uniqueFakultas}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={(newFilters) => setFilters(newFilters)}
        />
      )}

      {isDeleteConfirmOpen && (
        <AdminDeleteConfirmModal 
          selectedCount={selectedUserIds.length}
          isPermanent={true}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={executeDelete}
        />
      )}

      {/* Toast Notification */}
      <Toast toast={toast} />
    </div>
  );
}