'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface WhatsAppMockupProps {
  message: string;
  triggerWord?: string;
}

// Simple function to parse basic WhatsApp Markdown
const parseWhatsAppText = (text: string) => {
  if (!text) return null;
  
  // Split by line breaks
  const lines = text.split('\n');
  
  return lines.map((line, i) => {
    if (line.trim() === '') return <br key={i} />;
    
    // Parse bold (*text*), italic (_text_), and strikethrough (~text~)
    let formattedHtml = line
      .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/~(.*?)~/g, '<del>$1</del>');
      
    return (
      <span 
        key={i} 
        dangerouslySetInnerHTML={{ __html: formattedHtml }}
        className="block min-h-[1.2em]"
      />
    );
  });
};

export default function WhatsAppMockup({ message, triggerWord = 'HaloDesk' }: WhatsAppMockupProps) {
  const { t, language } = useLanguage();
  const currentTime = new Date().toLocaleTimeString(language === 'en' ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="w-[320px] mx-auto md:w-[350px] bg-[var(--canvas)] rounded-[36px] overflow-hidden border-[8px] border-[var(--fg)] relative h-[700px] flex flex-col font-sans">
      
      {/* iPhone Top Notch / Status Bar Area */}
      <div className="bg-[var(--accent)] w-full h-12 flex justify-between items-center px-6 text-white text-[10px] font-medium pt-2">
        <span className="tabular-nums">{currentTime}</span>
        <div className="flex gap-1 items-center">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path></svg>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21z"></path></svg>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.6 3H8.4C7.07 3 6 4.07 6 5.4v13.2C6 19.93 7.07 21 8.4 21h7.2c1.33 0 2.4-1.07 2.4-2.4V5.4C18 4.07 16.93 3 15.6 3z"></path></svg>
        </div>
      </div>
      
      {/* WhatsApp Header */}
      <div className="bg-[var(--accent)] w-full px-4 py-2.5 flex items-center gap-3 border-b border-[var(--rule)] z-10">
        <div className="flex items-center gap-1 text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 19l-7-7 7-7"></path></svg>
          <div className="w-9 h-9 rounded-[4px] bg-[var(--surface)] overflow-hidden flex-shrink-0 flex items-center justify-center">
            {/* Dummy profile icon */}
            <svg className="w-5 h-5 text-[var(--fg-faint)]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
          </div>
        </div>
        <div className="flex flex-col flex-1 cursor-default">
          <span className="text-white font-medium text-[12.5px] leading-tight">IT Helpdesk UNDIP</span>
          <span className="text-white/70 text-[10px] leading-tight">Online</span>
        </div>
        <div className="flex gap-4 text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
        </div>
      </div>

      {/* Chat Background Pattern */}
      <div 
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 relative bg-[var(--canvas)]"
        style={{
          backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
          backgroundSize: '300px',
          backgroundRepeat: 'repeat',
          backgroundBlendMode: 'multiply',
          backgroundColor: 'var(--canvas)',
        }}
      >
        {/* Date bubble */}
        <div className="flex justify-center my-1">
          <div className="bg-[var(--surface)] border border-[var(--rule)] text-[var(--fg-faint)] text-[10px] font-medium px-2 py-0.5 rounded-[3px]">
            {language === 'en' ? 'TODAY' : 'HARI INI'}
          </div>
        </div>

        {/* User sent message trigger (dummy) */}
        <div className="self-end max-w-[85%] relative group mt-2">
          <div className="bg-[rgba(0,45,114,.10)] text-[var(--fg)] text-[13px] px-3 py-2 rounded-[10px] pb-5">
            {triggerWord}
            <div className="absolute right-2 bottom-1 flex items-center gap-1">
              <span className="text-[9px] text-[var(--fg-faint)] tabular-nums">{currentTime}</span>
              <svg className="w-3.5 h-3.5 text-[var(--accent)]" viewBox="0 0 16 15" fill="none"><path d="M15.01 3.316l-7.358 8.192-2.775-3.14M10.153 3.316l-7.358 8.192-2.775-3.14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </div>

        {/* Bot Response Message */}
        <div className="self-start max-w-[90%] relative mt-2">
          <div className="bg-[var(--surface)] border border-[var(--rule)] text-[var(--fg)] text-[13px] leading-[1.4] px-3 pt-2 pb-5 rounded-[10px] break-words whitespace-pre-wrap">
            {message ? parseWhatsAppText(message) : <span className="text-[var(--fg-faint)] italic">{t('bot.preview_empty')}</span>}
            <div className="absolute right-2 bottom-1 flex items-center gap-1">
              <span className="text-[9px] text-[var(--fg-faint)] tabular-nums">{currentTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Input Area */}
      <div className="bg-[var(--canvas)] w-full px-3 py-2 flex items-center gap-2 border-t border-[var(--rule)]">
        <svg className="w-6 h-6 text-[var(--fg-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <div className="flex-1 bg-[var(--surface)] border border-[var(--rule)] rounded-[4px] h-9 flex items-center px-3">
          <span className="text-[var(--fg-faint)] text-[12px]">{t('bot.type_message')}</span>
        </div>
        <div className="w-9 h-9 rounded-[4px] bg-[var(--accent)] text-white flex items-center justify-center">
          <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
        </div>
      </div>
      
    </div>
  );
}
