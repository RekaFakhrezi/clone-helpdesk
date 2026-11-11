'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Modal, { ModalCancelButton, ModalPrimaryButton } from '@/components/ui/Modal';

interface AdminEditTicketModalProps {
  onClose: () => void;
  onSaved: () => void;
  ticketId: string;
}

export default function AdminEditTicketModal({ onClose, onSaved, ticketId }: AdminEditTicketModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single();
      
      if (data) {
        setTicketData({
          subject: data.subject || '',
          description: data.description || '',
          priority: data.priority || 'MEDIUM',
          status: data.status || 'NEW',
        });
      }
      setLoading(false);
    };
    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  const handleSave = async () => {
    if (!ticketData.subject) {
      alert("Subject cannot be empty");
      return;
    }
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          subject: ticketData.subject,
          description: ticketData.description,
          priority: ticketData.priority,
          status: ticketData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);
        
      if (error) throw error;
      
      onSaved();
    } catch (err) {
      console.error("Failed to update ticket", err);
      alert("Failed to update ticket.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Modal title="Edit Ticket" onClose={onClose} maxWidth="max-w-lg">
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0059BB]"></div>
        </div>
      </Modal>
    );
  }

  if (!ticketData) {
    return null;
  }

  return (
    <Modal
      title="Edit Ticket"
      onClose={onClose}
      maxWidth="max-w-lg"
      footer={
        <>
          <ModalCancelButton onClick={onClose}>Cancel</ModalCancelButton>
          <ModalPrimaryButton onClick={handleSave} disabled={saving}>
            <span className="inline-flex items-center gap-2">
              {saving ? (
                <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div> Saving...</>
              ) : "Save Changes"}
            </span>
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
          <input 
            type="text" 
            value={ticketData.subject} 
            onChange={(e) => setTicketData({...ticketData, subject: e.target.value})}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <textarea 
            rows={4}
            value={ticketData.description} 
            onChange={(e) => setTicketData({...ticketData, description: e.target.value})}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
            <select 
              value={ticketData.priority} 
              onChange={(e) => setTicketData({...ticketData, priority: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
            <select 
              value={ticketData.status} 
              onChange={(e) => setTicketData({...ticketData, status: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="NEW">OPEN</option>
              <option value="IN PROGRESS">IN PROGRESS</option>
              <option value="WAITING VERIFICATION">WAITING VERIFICATION</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
              <option value="DITOLAK">REJECTED</option>
              <option value="DELETED">DELETED</option>
            </select>
          </div>
        </div>
      </div>
    </Modal>
  );
}
