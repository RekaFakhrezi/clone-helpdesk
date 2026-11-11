'use client';

import React, { useState, useEffect, useMemo } from 'react';
import TicketHeader from "./TicketHeader";
import TicketToolbar, { TabFilter } from "./TicketToolbar";
import TicketTableSection from "./TicketTableSection";
import Toast, { useToast } from '@/components/ui/Toast';
import { downloadCsv } from '@/lib/download';
import { matchesTab } from '@/lib/ticketTabs';
import NewTicketModal from "./NewTicketModal";
import AdminFilterModal from './AdminFilterModal';
import AdminChangeStatusModal from './AdminChangeStatusModal';
import AdminEditTicketModal from './AdminEditTicketModal';
import AdminDeleteConfirmModal from './modals/AdminDeleteConfirmModal';
import { fetchClient } from '@/lib/apiClient';
import { supabase } from '@/lib/supabase';

export default function TicketWorkspace() {
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  // Real data state
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // State untuk bulk action
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

  // State untuk modal tambahan dan filter
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isEditTicketModalOpen, setIsEditTicketModalOpen] = useState(false);
  const [selectedTicketToEdit, setSelectedTicketToEdit] = useState<string | null>(null);
  
  // Toast Notification
  const { toast, showToast } = useToast();
  
  const [filters, setFilters] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const fetchTicketsData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const { data } = await fetchClient('/admin/tickets');
      if (data) setTickets(data);
      
      const { data: cats } = await supabase.from('categories').select('*');
      const { data: depts } = await supabase.from('departments').select('*');
      const { data: techs } = await supabase.from('users').select('*');
      
      if (techs) setTechnicians(techs);
      if (depts) setDepartments(depts);
      
      if (cats && depts) {
        const formattedCategories = cats.map((cat: any) => {
            const dept = depts.find((d: any) => d.id === cat.dept_id);
            const deptName = dept ? dept.name : '';
            
            const breadcrumb = [];
            let current = cat;
            while (current) {
                breadcrumb.unshift(current.name);
                current = cats.find((c: any) => c.id === current.parent_id);
            }
            
            if (deptName) {
                breadcrumb.unshift(deptName);
            }
            
            return {
                id: cat.id,
                name: breadcrumb.join(' > ')
            };
        });
        setCategories(formattedCategories);
      } else if (cats) {
        setCategories(cats);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketsData();
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
  }, []);

  const handleNewTicket = () => setIsNewTicketModalOpen(true);
  
  const handleExportCsv = () => {
    const filteredTickets = activeTab === 'all'
      ? [...tickets]
      : tickets.filter(t => matchesTab(t, activeTab, currentUser?.id));

    if (filteredTickets.length === 0) return;

    const header = ["Ticket Num", "Subject", "Status", "Priority", "Created At"];
    const rows = [
      header,
      ...filteredTickets.map(t => [
        `"${t.ticket_num || t.ticketNumber || ''}"`,
        `"${(t.subject || '').replace(/"/g, '""')}"`,
        `"${t.status || ''}"`,
        `"${t.priority || ''}"`,
        `"${t.created_at || ''}"`,
      ]),
    ];

    downloadCsv(rows, `tickets_admin_${activeTab}_${new Date().getTime()}.csv`);
  };
  
  const handleOpenFilters = () => setIsFilterModalOpen(true);

  const handleSubmitNewTicket = async (data: any) => {
    try {
      setIsNewTicketModalOpen(false);
      // Generate sequential ticket number
      const { data: latestTicket } = await supabase
        .from('tickets')
        .select('ticket_num')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let nextNum = 1;
      if (latestTicket && latestTicket.ticket_num) {
        const currentNum = parseInt(latestTicket.ticket_num.replace(/\D/g, ''), 10);
        if (!isNaN(currentNum)) {
          nextNum = currentNum + 1;
        }
      }
      const ticketNum = `#${nextNum.toString().padStart(6, '0')}`;

      const ticketData = {
        ticket_num: ticketNum,
        phone: data.requesterPhone || '000000',
        reporter_name: data.requesterName || 'Unknown User',
        reporter_type: 'Umum',
        nim_nip: data.requesterNim || '',
        unit: data.requesterUnit || '',
        subject: data.subject || '',
        description: data.description || '',
        category_id: data.category || null,
        dept_id: data.assignTo || null,
        status: 'WAITING VERIFICATION',
        priority: 'MEDIUM'
      };
      
      const { data: newTicket, error } = await supabase.from('tickets').insert([ticketData]).select().single();
      
      if (error) throw error;
      
      showToast('Tiket berhasil dibuat!', 'success');
      await fetchTicketsData(true);
    } catch (err) {
      console.error(err);
      showToast('Gagal membuat tiket.', 'error');
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase.from('tickets').update({ status: newStatus }).in('id', selectedTickets);
      if (error) throw error;
      
      showToast(`Berhasil mengubah status ${selectedTickets.length} tiket menjadi ${newStatus}.`, 'success');
      await fetchTicketsData(true);
      setSelectedTickets([]);
      setIsChangeStatusModalOpen(false);
    } catch (err) {
      console.error("Bulk status change failed", err);
      showToast("Gagal mengubah status tiket.", 'error');
    }
  };

  const handleBulkDelete = async () => {
    try {
      if (activeTab === 'deleted') {
        for (const id of selectedTickets) {
          await fetchClient(`/admin/tickets/${id}`, { method: 'DELETE' });
        }
        showToast(`Berhasil menghapus permanen ${selectedTickets.length} tiket.`, 'success');
      } else {
        const { error } = await supabase.from('tickets').update({ status: 'DELETED' }).in('id', selectedTickets);
        if (error) throw error;
        showToast(`Berhasil memindahkan ${selectedTickets.length} tiket ke tempat sampah.`, 'success');
      }
      await fetchTicketsData(true);
      setSelectedTickets([]);
      setIsDeleteConfirmOpen(false);
    } catch (err) {
      console.error("Bulk delete failed", err);
      showToast("Gagal menghapus tiket.", 'error');
    }
  };

  const handleAcceptTicket = async (ticketId: string) => {
    try {
      const updateData: any = { status: 'IN PROGRESS' };
      if (currentUser?.id) {
        updateData.tech_id = currentUser.id;
      }
      
      const { error } = await supabase.from('tickets').update(updateData).eq('id', ticketId);
      if (error) throw error;
      showToast('Tiket berhasil diterima dan ditetapkan ke Anda.', 'success');
      await fetchTicketsData(true);
    } catch (err) {
      console.error(err);
      showToast('Gagal menerima tiket.', 'error');
    }
  };

  const handleRejectTicket = async (ticketId: string) => {
    try {
      const { error } = await supabase.from('tickets').update({ status: 'DITOLAK' }).eq('id', ticketId);
      if (error) throw error;
      showToast('Tiket telah ditolak (Spam / Tidak Valid).', 'success');
      await fetchTicketsData(true);
    } catch (err) {
      console.error(err);
      showToast('Gagal menolak tiket.', 'error');
    }
  };

  // Kalkulasi counts (satu lintasan per render, memoized)
  const counts = useMemo(() => {
    const next = {
      all: tickets.length,
      myTickets: 0,
      open: 0,
      inProgress: 0,
      waitingVerification: 0,
      resolved: 0,
      rejected: 0,
      deleted: 0,
    };

    for (const ticket of tickets) {
      if (matchesTab(ticket, 'my_tickets', currentUser?.id)) next.myTickets++;
      if (matchesTab(ticket, 'open')) next.open++;
      if (matchesTab(ticket, 'in_progress')) next.inProgress++;
      if (matchesTab(ticket, 'waiting_verification')) next.waitingVerification++;
      if (matchesTab(ticket, 'resolved')) next.resolved++;
      if (matchesTab(ticket, 'rejected')) next.rejected++;
      if (matchesTab(ticket, 'deleted')) next.deleted++;
    }

    return next;
  }, [tickets, currentUser]);

  return (
    <div className="flex flex-col items-start gap-6 w-full relative">
      <TicketHeader />
      
      <TicketToolbar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewTicket={handleNewTicket} 
        onExportCsv={handleExportCsv}
        onOpenFilters={handleOpenFilters}
        selectedCount={selectedTickets.length}
        categories={categories}
        selectedCategory={filters?.category || ''}
        onCategoryChange={(catId) => setFilters((prev: any) => ({ ...prev, category: catId }))}
        onBulkAction={(action) => {
          if (selectedTickets.length === 0) {
            showToast('Belum ada tiket yang dipilih!', 'warning');
            return;
          }
          if (action === 'Change Status') setIsChangeStatusModalOpen(true);
          else if (action === 'Delete') setIsDeleteConfirmOpen(true);
        }}
      />
      
      {loading ? (
        <div className="w-full flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0059BB]"></div>
        </div>
      ) : (
        <TicketTableSection 
          activeTab={activeTab} 
          tickets={tickets}
          selectedTickets={selectedTickets}
          onSelectionChange={setSelectedTickets}
          filters={filters}
          searchQuery={searchQuery}
          categories={categories}
          technicians={technicians}
          departments={departments}
          onEditTicket={(id) => { setSelectedTicketToEdit(id); setIsEditTicketModalOpen(true); }}
          onAcceptTicket={handleAcceptTicket}
          onRejectTicket={handleRejectTicket}
          currentUserId={currentUser?.id}
        />
      )}

      {isFilterModalOpen && (
        <AdminFilterModal 
          categories={categories}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={(newFilters) => setFilters(newFilters)}
        />
      )}

      {isChangeStatusModalOpen && (
        <AdminChangeStatusModal 
          selectedCount={selectedTickets.length}
          onClose={() => setIsChangeStatusModalOpen(false)}
          onSubmit={handleBulkStatusChange}
        />
      )}

      {isEditTicketModalOpen && selectedTicketToEdit && (
        <AdminEditTicketModal 
          ticketId={selectedTicketToEdit}
          onClose={() => { setIsEditTicketModalOpen(false); setSelectedTicketToEdit(null); }}
          onSaved={() => {
            setIsEditTicketModalOpen(false);
            setSelectedTicketToEdit(null);
            fetchTicketsData();
          }}
        />
      )}

      {isNewTicketModalOpen && (
        <NewTicketModal 
          onClose={() => setIsNewTicketModalOpen(false)} 
          onSubmit={handleSubmitNewTicket}
        />
      )}

      {isDeleteConfirmOpen && (
        <AdminDeleteConfirmModal 
          selectedCount={selectedTickets.length}
          isPermanent={activeTab === 'deleted'}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleBulkDelete}
        />
      )}

      <Toast toast={toast} />

    </div>
  );
}