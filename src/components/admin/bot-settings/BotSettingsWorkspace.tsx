'use client';

import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchClient } from '@/lib/apiClient';
import WhatsAppMockup from './WhatsAppMockup';
import Toast, { useToast } from '@/components/ui/Toast';
import { useLanguage } from '@/context/LanguageContext';

export default function BotSettingsWorkspace() {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState({
    trigger_word: '',
    greeting_message: '',
    operational_hours: '',
    location_info: '',
    fallback_message: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast, showToast } = useToast();
  
  // Track which input is focused to update the mockup preview
  const [activePreview, setActivePreview] = useState<keyof typeof settings>('greeting_message');

  const translatePreviewContent = (content: string) => {
    if (language === 'id' || !content) return content;

    const translations: Array<[string, string]> = [
      ['Selamat datang di ChatBOT IT Helpdesk.', 'Welcome to the IT Helpdesk ChatBOT.'],
      ['Selamat datang di IT Helpdesk.', 'Welcome to IT Helpdesk.'],
    ];

    return translations.reduce((translated, [source, target]) => (
      translated.replace(new RegExp(source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), target)
    ), content);
  };

  const getPreviewMessage = () => {
    const raw = translatePreviewContent(settings[activePreview] || '');
    if (activePreview === 'greeting_message') {
      return language === 'id'
        ? `*Selamat Pagi Mahasiswa!* ${raw}\n\nSilakan pilih menu layanan di bawah ini:\n1. Pusat Bantuan & Layanan IT\n2. Cek Status Tiket\n3. Jelajahi Basis Pengetahuan (FAQ)\n4. Info & Jam Operasional\n5. Tautan Penting Kampus\n\n_Balas angka pilihan Anda (Contoh: 1)_`
        : `*Good Morning Student!* ${raw}\n\nPlease choose a service menu below:\n1. IT Help and Services\n2. Check Ticket Status\n3. Browse Knowledge Base (FAQ)\n4. Operating Hours Information\n5. Important Campus Links\n\n_Reply with a menu number (Example: 1)_`;
    }
    return raw;
  };

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const response = await fetchClient('/admin/bot-templates');
        if (response.success && response.data) {
          setSettings({
            trigger_word: response.data.trigger_word || 'HaloDesk',
            greeting_message: response.data.greeting_message || '',
            operational_hours: response.data.operational_hours || '',
            location_info: response.data.location_info || '',
            fallback_message: response.data.fallback_message || ''
          });
        }
      } catch (error) {
        console.error('Error loading bot settings:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetchClient('/admin/bot-templates', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      if (res.success) {
        showToast(t('bot.saved'));
      } else {
        alert(t('bot.save_failed'));
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(t('bot.save_error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-6 w-full relative">
      {/* Toast Notification */}
      <Toast toast={toast} />

      <div className="flex justify-between items-end w-full">
        <div className="flex flex-col items-start gap-1.5 w-fit">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">
            {t('topbar.dashboard')} / {t('bot.settings_breadcrumb')}
          </p>
          <h1 className="text-[22px] font-medium leading-tight tracking-[-0.01em] text-[var(--fg)] w-fit">
            {t('bot.settings_title')}
          </h1>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="flex h-9 px-3 items-center gap-2 rounded-[4px] bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors duration-150 disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.75} /> : <Save className="w-4 h-4" strokeWidth={1.75} />}
          <span className="text-[12px] font-medium">{isSaving ? t('bot.saving') : t('bot.save_changes')}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="w-full flex justify-center p-12">
            <div className="animate-spin rounded-[4px] h-5 w-5 border-2 border-[var(--rule)] border-t-[var(--accent)]"></div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-5 w-full">
          
          {/* Left Panel: Editor */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-[var(--surface)] rounded-[4px] border border-[var(--rule)] flex flex-col">
              <div className="px-4 py-3 border-b border-[var(--rule)]">
                <h3 className="text-[13px] font-medium text-[var(--fg)]">{t('bot.trigger_title')}</h3>
                <p className="text-[11.5px] text-[var(--fg-dim)] mt-1">{t('bot.trigger_desc')}</p>
              </div>
              <div className="p-4 flex-1">
                <input
                  type="text"
                  name="trigger_word"
                  value={settings.trigger_word}
                  onChange={handleChange}
                  onFocus={() => setActivePreview('trigger_word')}
                  placeholder={language === 'en' ? 'Example: HaloDesk' : 'Misal: HaloDesk'}
                  className="h-9 w-full px-3 rounded-[4px] border border-[var(--rule-strong)] bg-transparent text-[12px] text-[var(--fg)] font-mono outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
            </div>

            <div className="bg-[var(--surface)] rounded-[4px] border border-[var(--rule)] flex flex-col">
              <div className="px-4 py-3 border-b border-[var(--rule)]">
                <h3 className="text-[13px] font-medium text-[var(--fg)]">{t('bot.greeting_title')}</h3>
                <p className="text-[11.5px] text-[var(--fg-dim)] mt-1">{t('bot.greeting_desc')}</p>
              </div>
              <div className="p-4 flex-1">
                <textarea
                  name="greeting_message"
                  value={settings.greeting_message}
                  onChange={handleChange}
                  onFocus={() => setActivePreview('greeting_message')}
                  className="w-full h-full min-h-[120px] px-3 py-2 rounded-[4px] border border-[var(--rule-strong)] bg-transparent text-[12px] text-[var(--fg)] outline-none focus:border-[var(--accent)] transition-colors resize-none"
                  placeholder={language === 'en' ? 'Example: Welcome to IT Helpdesk.' : 'Contoh: Selamat datang di IT Helpdesk.'}
                />
              </div>
              <div className="px-4 py-2.5 border-t border-[var(--rule)] text-[11.5px] text-[var(--fg-dim)] flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{t('bot.markdown_help')}</span>
              </div>
            </div>

            <div className="bg-[var(--surface)] rounded-[4px] border border-[var(--rule)] flex flex-col">
              <div className="px-4 py-3 border-b border-[var(--rule)]">
                <h3 className="text-[13px] font-medium text-[var(--fg)]">{t('bot.fallback_title')}</h3>
                <p className="text-[11.5px] text-[var(--fg-dim)] mt-1">{t('bot.fallback_desc')}</p>
              </div>
              <div className="p-4 flex-1">
                <textarea
                  name="fallback_message"
                  value={settings.fallback_message}
                  onChange={handleChange}
                  onFocus={() => setActivePreview('fallback_message')}
                  className="w-full h-full min-h-[120px] px-3 py-2 rounded-[4px] border border-[var(--rule-strong)] bg-transparent text-[12px] text-[var(--fg)] outline-none focus:border-[var(--accent)] transition-colors resize-none"
                  placeholder={language === 'en' ? 'Example: Type *HaloDesk* to return to the main menu.' : 'Contoh: Ketik *HaloDesk* untuk kembali ke menu utama.'}
                />
              </div>
            </div>

            <div className="bg-[var(--surface)] rounded-[4px] border border-[var(--rule)] flex flex-col">
              <div className="px-4 py-3 border-b border-[var(--rule)]">
                <h3 className="text-[13px] font-medium text-[var(--fg)]">{t('bot.hours_title')}</h3>
                <p className="text-[11.5px] text-[var(--fg-dim)] mt-1">{t('bot.hours_desc')}</p>
              </div>
              <div className="p-4 flex-1">
                <textarea
                  name="operational_hours"
                  value={settings.operational_hours}
                  onChange={handleChange}
                  onFocus={() => setActivePreview('operational_hours')}
                  className="w-full h-full min-h-[120px] px-3 py-2 rounded-[4px] border border-[var(--rule-strong)] bg-transparent text-[12px] text-[var(--fg)] outline-none focus:border-[var(--accent)] transition-colors resize-none"
                  placeholder={language === 'en' ? 'Example: Monday - Friday: 08:00 - 16:00 WIB' : 'Contoh: Senin - Jumat: 08:00 - 16:00 WIB'}
                />
              </div>
            </div>

            <div className="bg-[var(--surface)] rounded-[4px] border border-[var(--rule)] flex flex-col">
              <div className="px-4 py-3 border-b border-[var(--rule)]">
                <h3 className="text-[13px] font-medium text-[var(--fg)]">{t('bot.location_title')}</h3>
                <p className="text-[11.5px] text-[var(--fg-dim)] mt-1">{t('bot.location_desc')}</p>
              </div>
              <div className="p-4 flex-1">
                <textarea
                  name="location_info"
                  value={settings.location_info}
                  onChange={handleChange}
                  onFocus={() => setActivePreview('location_info')}
                  className="w-full h-full min-h-[120px] px-3 py-2 rounded-[4px] border border-[var(--rule-strong)] bg-transparent text-[12px] text-[var(--fg)] outline-none focus:border-[var(--accent)] transition-colors resize-none"
                  placeholder={language === 'en' ? 'Example: IT Center Building, 1st Floor...' : 'Contoh: Gedung IT Center Lantai 1...'}
                />
              </div>
            </div>
          </div>

          {/* Right Panel: Live Preview */}
          <div className="w-full lg:w-[400px] flex-shrink-0">
            <div className="bg-[var(--surface)] rounded-[4px] border border-[var(--rule)] overflow-hidden sticky top-24">
              <div className="px-4 py-3 border-b border-[var(--rule)] flex justify-between items-center">
                <div>
                  <h3 className="text-[13px] font-medium text-[var(--fg)]">{t('bot.preview_title')}</h3>
                  <p className="text-[11.5px] text-[var(--fg-dim)] mt-0.5">{t('bot.preview_desc')}</p>
                </div>
                <div className="px-1.5 py-0.5 border border-[var(--rule)] text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] rounded-[3px]">
                  {activePreview.replace('_', ' ')}
                </div>
              </div>
              
              <div className="p-4 bg-[var(--canvas)] flex justify-center">
                <WhatsAppMockup 
                  message={getPreviewMessage()} 
                  triggerWord={settings.trigger_word || 'HaloDesk'} 
                />
              </div>
              <div className="mt-4 pb-4 text-center text-[11px] text-[var(--fg-faint)]">
                {t('bot.preview_updated')}
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
