'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Modal, { ModalCancelButton, ModalPrimaryButton } from '@/components/ui/Modal';

interface AdminEditTicketModalProps {
  onClose: () => void;
  onSaved: () => void;
  ticketId: string;
}

const LABEL_CLASS = 'block text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] mb-1.5';
const FIELD_CLASS =
  'h-9 w-full px-2.5 rounded-[4px] border border-[var(--rule-strong)] bg-transparent text-[12.5px] text-[var(--fg)] outline-none focus:border-[var(--accent)] transition-colors duration-150';

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
        <div className="flex flex-col gap-3 animate-pulse">
          <div className="h-9 rounded-[4px] bg-[var(--canvas)]" />
          <div className="h-20 rounded-[4px] bg-[var(--canvas)]" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-9 rounded-[4px] bg-[var(--canvas)]" />
            <div className="h-9 rounded-[4px] bg-[var(--canvas)]" />
          </div>
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
                <><div className="h-3.5 w-3.5 rounded-[2px] border border-white/50 border-t-white animate-spin"></div> Saving...</>
              ) : "Save Changes"}
            </span>
          </ModalPrimaryButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className={LABEL_CLASS}>Subject</label>
          <input 
            type="text" 
            value={ticketData.subject} 
            onChange={(e) => setTicketData({...ticketData, subject: e.target.value})}
            className={FIELD_CLASS}
          />
        </div>
        
        <div>
          <label className={LABEL_CLASS}>Description</label>
          <textarea 
            rows={4}
            value={ticketData.description} 
            onChange={(e) => setTicketData({...ticketData, description: e.target.value})}
            className="w-full min-h-[76px] px-2.5 py-2 rounded-[4px] border border-[var(--rule-strong)] bg-transparent text-[12.5px] leading-relaxed text-[var(--fg)] outline-none focus:border-[var(--accent)] transition-colors duration-150 resize-y"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS}>Priority</label>
            <select 
              value={ticketData.priority} 
              onChange={(e) => setTicketData({...ticketData, priority: e.target.value})}
              className={`${FIELD_CLASS} cursor-pointer`}
            >
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Status</label>
            <select 
              value={ticketData.status} 
              onChange={(e) => setTicketData({...ticketData, status: e.target.value})}
              className={`${FIELD_CLASS} cursor-pointer`}
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
