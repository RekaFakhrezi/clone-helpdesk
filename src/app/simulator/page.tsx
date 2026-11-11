'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { API_BASE_URL } from '@/lib/http';

interface SimMessage {
  phone: string;
  message: string;
  timestamp: string;
  sender: 'bot' | 'user';
  mediaUrl?: string;
  mediaType?: string;
}

export default function SimulatorPage() {
  const [sessions, setSessions] = useState<string[]>([]);
  const [activeNumber, setActiveNumber] = useState<string>('');
  const [newNumber, setNewNumber] = useState('');
  
  const [messages, setMessages] = useState<SimMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ url: string; type: string; name: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load sessions from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('simulator_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) {
          setActiveNumber(parsed[0]);
        }
      } catch (e) {
        console.error('Failed to parse simulator_sessions', e);
      }
    }
  }, []);

  // Save sessions to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('simulator_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Polling messages every 2 seconds for activeNumber
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeNumber) {
      const fetchMsgs = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/simulator/messages/${activeNumber}`);
          const json = await res.json();
          if (json.success) {
            setMessages(json.data);
          }
        } catch (error) {
          console.error('Error fetching simulation messages', error);
        }
      };
      fetchMsgs(); // initial fetch
      interval = setInterval(fetchMsgs, 2000);
    } else {
      setMessages([]);
    }
    return () => clearInterval(interval);
  }, [activeNumber]);

  // Auto-scroll to bottom only when a new message arrives (length changes)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumber.trim()) return;
    const cleanNum = newNumber.trim();
    if (!sessions.includes(cleanNum)) {
      setSessions([...sessions, cleanNum]);
    }
    setActiveNumber(cleanNum);
    setNewNumber('');
  };

  const handleDeleteSession = (numToDelete: string) => {
    const newSessions = sessions.filter(n => n !== numToDelete);
    setSessions(newSessions);
    if (activeNumber === numToDelete) {
      setActiveNumber(newSessions.length > 0 ? newSessions[0] : '');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachedFile) || !activeNumber) return;

    const text = inputText;
    setInputText('');

    try {
      await fetch(`${API_BASE_URL}/simulator/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: activeNumber, 
          message: text,
          mediaUrl: attachedFile?.url,
          mediaType: attachedFile?.type
        })
      });
      setAttachedFile(null); // Clear attachment after sending
    } catch (error) {
      console.error('Error sending message', error);
      alert('Gagal mengirim pesan');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeNumber) return;

    setUploading(true);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${activeNumber}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('ticket-attachments')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading file:', error);
      alert('Gagal mengunggah file. Pastikan bucket "ticket-attachments" sudah public.');
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('ticket-attachments')
      .getPublicUrl(fileName);

    setAttachedFile({
      url: publicUrlData.publicUrl,
      type: file.type,
      name: file.name
    });
    setUploading(false);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="h-screen w-full bg-gray-100 p-4 lg:p-8 flex items-center justify-center font-sans overflow-hidden">
      <div className="w-full max-w-6xl h-full max-h-[850px] bg-white rounded-xl shadow-2xl overflow-hidden flex border border-gray-200">
        
        {/* Panel Kiri: Daftar Sesi */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Sesi Pelapor
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {sessions.map(num => (
              <div 
                key={num}
                onClick={() => setActiveNumber(num)}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${activeNumber === num ? 'bg-green-100 border border-green-300' : 'bg-white border border-gray-200 hover:bg-gray-100'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                    {num.slice(-2)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">{num}</div>
                    <div className="text-xs text-gray-500">Pelapor</div>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteSession(num); }}
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50"
                  title="Hapus sesi"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            ))}
            
            {sessions.length === 0 && (
              <div className="text-center p-4 text-sm text-gray-500 mt-10">
                Belum ada sesi pelapor.<br/>Tambahkan nomor di bawah.
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-white">
            <form onSubmit={handleAddSession} className="flex gap-2">
              <input
                type="text"
                value={newNumber}
                onChange={e => setNewNumber(e.target.value)}
                placeholder="62812..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                required
              />
              <button type="submit" className="bg-gray-800 text-white p-2 rounded-lg hover:bg-gray-900 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
            </form>
          </div>
        </div>

        {/* Panel Kanan: Chat Area */}
        <div className="flex-1 flex flex-col bg-[#e5ddd5] relative">
          {activeNumber ? (
            <>
              {/* Header Chat */}
              <div className="bg-[#00a884] px-4 py-3 flex items-center justify-between text-white shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </div>
                  <div>
                    <h1 className="font-bold text-lg leading-tight">IT Helpdesk Bot</h1>
                    <p className="text-xs text-white/80">Berinteraksi sebagai: {activeNumber}</p>
                  </div>
                </div>
                <Link href="/dashboard" className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
                  Dashboard
                </Link>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat' }}>
                {messages.length === 0 && (
                  <div className="bg-yellow-100/90 text-yellow-800 text-xs text-center p-2 rounded-lg mx-auto max-w-sm mt-4 shadow-sm border border-yellow-200">
                    Ini adalah ruang simulasi. Ketik <strong>HaloDesk</strong> untuk memulai percakapan dengan bot.
                  </div>
                )}

                {messages.map((msg, idx) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div key={idx} className={`flex flex-col max-w-[80%] ${isUser ? 'self-end items-end' : 'self-start items-start'}`}>
                      <div className={`p-3 rounded-lg shadow-sm text-[14.5px] leading-relaxed text-[#111b21] whitespace-pre-wrap relative ${isUser ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                        {msg.mediaUrl && (
                          <div className="mb-2 rounded overflow-hidden max-w-[250px]">
                            {msg.mediaType?.includes('image') ? (
                              <img src={msg.mediaUrl} alt="Attachment" className="w-full h-auto object-cover rounded" />
                            ) : (
                              <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black/5 p-3 rounded">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                <span className="text-sm underline text-blue-600 truncate">Lampiran Dokumen</span>
                              </a>
                            )}
                          </div>
                        )}
                        {msg.message}
                      </div>
                      <span className="text-[11px] text-gray-500 mt-1 px-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="bg-[#f0f2f5] p-3 pt-2">
                {attachedFile && (
                  <div className="max-w-4xl mx-auto mb-2 bg-white p-3 rounded-lg flex items-center gap-3 shadow-sm border border-gray-200">
                    {attachedFile.type.includes('image') ? (
                      <img src={attachedFile.url} alt="preview" className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded">📄</div>
                    )}
                    <div className="flex-1 truncate text-sm text-gray-700">{attachedFile.name}</div>
                    <button onClick={() => setAttachedFile(null)} className="text-gray-400 hover:text-red-500">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex gap-2 items-end max-w-4xl mx-auto">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*,application/pdf" 
                  />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={uploading}
                    className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0 mb-1"
                  >
                    {uploading ? (
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-[#00a884] rounded-full animate-spin"></div>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                    )}
                  </button>

                  <textarea
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 rounded-2xl px-4 py-3 focus:outline-none shadow-sm min-h-[44px] max-h-[120px] resize-none overflow-y-auto bg-white text-[15px]"
                    placeholder="Ketik pesan... (Shift+Enter untuk baris baru)"
                    rows={1}
                  />
                  
                  <button 
                    type="submit" 
                    disabled={(!inputText.trim() && !attachedFile) || uploading} 
                    className="bg-[#00a884] text-white p-3 rounded-full hover:bg-[#008f6f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center flex-shrink-0 mb-1"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50">
              <div className="w-24 h-24 mb-6 text-gray-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <h2 className="text-2xl font-light text-gray-600 mb-2">WhatsApp Simulator</h2>
              <p className="text-gray-400 max-w-sm">Pilih sesi pelapor dari panel di sebelah kiri, atau tambahkan nomor baru untuk memulai percakapan.</p>
              
              <Link href="/dashboard" className="mt-8 text-green-600 hover:underline">
                Kembali ke Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
