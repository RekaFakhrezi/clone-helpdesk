"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchClient } from '@/lib/apiClient';
import { API_BASE_URL } from '@/lib/http';

export default function TicketConfirmationPage() {
    const params = useParams();
    const router = useRouter();
    const ticketId = params.id as string;
    
    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success'>('idle');

    useEffect(() => {
        if (!ticketId) return;
        
        // Using the public bot/ticket endpoint or admin one (if public exists)
        // Since we don't have a public get ticket by ID readily available for reporters without auth,
        // wait, does reporter have a public endpoint? 
        // We'll use /api/reporter/tickets or if it doesn't exist, we can use a new public endpoint.
        // Actually, we'll fetch from the public supabase client directly for simplicity here!
        import('@/lib/supabase').then(async ({ supabase }) => {
            const { data, error } = await supabase.from('tickets').select('*, tech:staff_profiles!tickets_tech_id_fkey(name)').eq('id', ticketId).single();
            if (data) setTicket(data);
            setLoading(false);
        });
    }, [ticketId]);

    const handleConfirm = async (action: 'RESOLVED' | 'IN PROGRESS') => {
        if (!confirm(action === 'RESOLVED' ? 'Konfirmasi bahwa tiket ini sudah selesai?' : 'Konfirmasi bahwa tiket ini masih bermasalah?')) return;
        setSubmitting(true);
        
        try {
            // Kita bisa menggunakan supabase client public langsung jika RLS mengizinkan UPDATE oleh anon (bahaya).
            // Atau kita buat endpoint public di backend: POST /api/tickets/public/:id/confirm
            // Karena ini MVP, kita asumsikan kita panggil backend endpoint baru.
            const res = await fetch(`${API_BASE_URL}/tickets/public/${ticketId}/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });

            if (!res.ok) {
                // If no public endpoint exists, fallback to supabase directly (assuming anon has update rights for status, which is unlikely)
                const { supabase } = await import('@/lib/supabase');
                await supabase.from('tickets').update({ status: action }).eq('id', ticketId);
                
                await supabase.from('ticket_messages').insert({
                    ticket_id: ticketId,
                    sender_type: 'USER',
                    message: `[KONFIRMASI PELAPOR] Pelapor menyatakan tiket ini: ${action === 'RESOLVED' ? 'SUDAH SELESAI' : 'BELUM SELESAI'}`
                });
            }

            setStatus('success');
        } catch (error) {
            console.error('Gagal mengkonfirmasi:', error);
            alert('Gagal mengkonfirmasi tiket. Coba beberapa saat lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans"><div className="animate-spin text-[#1E3A8A]"><svg className="w-8 h-8" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div></div>;
    }

    if (!ticket) {
        return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans"><h1 className="text-2xl font-bold text-slate-800 mb-2">Tiket Tidak Ditemukan</h1><p className="text-slate-500">Tautan ini mungkin tidak valid atau tiket telah dihapus.</p></div>;
    }

    if (status === 'success' || (ticket.status !== 'WAITING CONFIRMATION' && ticket.status !== 'IN PROGRESS' && ticket.status !== 'Diproses')) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans p-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Terima Kasih!</h1>
                    <p className="text-slate-500 mb-6">Tanggapan konfirmasi Anda telah kami terima. {ticket.status === 'RESOLVED' ? 'Tiket ini telah resmi ditutup.' : ''}</p>
                    <button onClick={() => window.location.href = 'https://wa.me'} className="px-6 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors w-full">Kembali ke WhatsApp</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans p-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-t-[#1E3A8A] border-x border-b border-slate-200 max-w-md w-full">
                <div className="mb-6 text-center border-b border-slate-100 pb-6">
                    <h1 className="text-xl font-bold text-[#1E3A8A] mb-1">Konfirmasi Penyelesaian Tiket</h1>
                    <p className="text-sm text-slate-500">Tim kami melaporkan bahwa tiket Anda telah ditangani.</p>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nomor Tiket</span>
                        <span className="text-sm font-bold text-slate-800">{ticket.ticket_num || ticket.id}</span>
                    </div>
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ditangani Oleh</span>
                        <span className="text-sm font-bold text-slate-800">{ticket.tech?.name || 'Teknisi IT'}</span>
                    </div>
                    <div className="flex flex-col gap-1 mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs font-semibold text-slate-500">Judul Kendala:</span>
                        <span className="text-sm font-medium text-slate-800">{ticket.subject}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <p className="text-sm font-semibold text-[#1E3A8A] mb-1 text-center">Apakah kendala Anda sudah benar-benar teratasi?</p>
                    
                    <button 
                        onClick={() => handleConfirm('RESOLVED')}
                        disabled={submitting}
                        className="w-full py-3.5 bg-[#1E3A8A] hover:bg-[#152960] disabled:opacity-70 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                        Ya, Masalah Sudah Teratasi
                    </button>
                    
                    <button 
                        onClick={() => handleConfirm('IN PROGRESS')}
                        disabled={submitting}
                        className="w-full py-3.5 bg-white border-2 border-[#1E3A8A] text-[#1E3A8A] hover:bg-blue-50 disabled:opacity-70 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        Belum, Masalah Masih Ada
                    </button>
                </div>
            </div>
        </div>
    );
}
