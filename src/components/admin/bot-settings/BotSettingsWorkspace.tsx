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

      <div className="flex justify-between items-end w-full mb-8">
        <div className="flex flex-col items-start gap-1 w-fit">
          <div className="flex items-start gap-2 w-full">
            <div className="flex flex-col items-start w-fit h-full">
              <p className="text-[#43474F] font-iBMPlexSans text-xs font-semibold leading-4 w-fit tracking-[0.05em]">
                {t('topbar.dashboard')}
              </p>
            </div>
            <div className="flex flex-col items-start w-fit h-full">
              <p className="text-[#43474F] font-iBMPlexSans text-xs font-semibold leading-4 w-fit tracking-[0.05em]">
                /
              </p>
            </div>
            <div className="flex flex-col items-start w-fit h-full">
              <p className="text-[#1A1C1E] font-iBMPlexSans text-xs font-semibold leading-4 w-fit tracking-[0.05em]">
                {t('bot.settings_breadcrumb')}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start w-full">
            <p className="text-[#001E40] font-iBMPlexSans text-[32px] font-semibold leading-10 w-fit tracking-[-0.02em]">
              {t('bot.settings_title')}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="flex h-9 px-4 items-center gap-2 rounded bg-[#001E40] text-white shadow-sm hover:bg-[#00142d] transition-colors disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 text-white animate-spin" /> : <Save className="w-4 h-4 text-white" />}
          <span className="text-white font-iBMPlexSans text-sm font-medium">{isSaving ? t('bot.saving') : t('bot.save_changes')}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="w-full flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0059BB]"></div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 w-full">
          
          {/* Left Panel: Editor */}
          <div className="flex-1 flex flex-col gap-6">
            <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all duration-300`}>
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-gray-900 text-lg">{t('bot.trigger_title')}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('bot.trigger_desc')}</p>
              </div>
              <div className="p-5 flex-1">
                <input
                  type="text"
                  name="trigger_word"
                  value={settings.trigger_word}
                  onChange={handleChange}
                  onFocus={() => setActivePreview('trigger_word')}
                  placeholder={language === 'en' ? 'Example: HaloDesk' : 'Misal: HaloDesk'}
                  className="w-full text-gray-800 text-[15px] p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all duration-300`}>
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-gray-900 text-lg">{t('bot.greeting_title')}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('bot.greeting_desc')}</p>
              </div>
              <div className="p-5 flex-1">
                <textarea
                  name="greeting_message"
                  value={settings.greeting_message}
                  onChange={handleChange}
                  onFocus={() => setActivePreview('greeting_message')}
                  className="w-full h-full min-h-[120px] p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                  placeholder={language === 'en' ? 'Example: Welcome to IT Helpdesk.' : 'Contoh: Selamat datang di IT Helpdesk.'}
                />
              </div>
              <div className="px-5 py-3 bg-blue-50/50 border-t border-blue-100 text-xs text-blue-800 flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{t('bot.markdown_help')}</span>
              </div>
            </div>

            <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all duration-300`}>
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-gray-900 text-lg">{t('bot.fallback_title')}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('bot.fallback_desc')}</p>
              </div>
              <div className="p-5 flex-1">
                <textarea
                  name="fallback_message"
                  value={settings.fallback_message}
                  onChange={handleChange}
                  onFocus={() => setActivePreview('fallback_message')}
                  className="w-full h-full min-h-[120px] p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                  placeholder={language === 'en' ? 'Example: Type *HaloDesk* to return to the main menu.' : 'Contoh: Ketik *HaloDesk* untuk kembali ke menu utama.'}
                />
              </div>
            </div>

            <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all duration-300`}>
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-gray-900 text-lg">{t('bot.hours_title')}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('bot.hours_desc')}</p>
              </div>
              <div className="p-5 flex-1">
                <textarea
                  name="operational_hours"
                  value={settings.operational_hours}
                  onChange={handleChange}
                  onFocus={() => setActivePreview('operational_hours')}
                  className="w-full h-full min-h-[120px] p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                  placeholder={language === 'en' ? 'Example: Monday - Friday: 08:00 - 16:00 WIB' : 'Contoh: Senin - Jumat: 08:00 - 16:00 WIB'}
                />
              </div>
            </div>

            <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all duration-300`}>
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-gray-900 text-lg">{t('bot.location_title')}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('bot.location_desc')}</p>
              </div>
              <div className="p-5 flex-1">
                <textarea
                  name="location_info"
                  value={settings.location_info}
                  onChange={handleChange}
                  onFocus={() => setActivePreview('location_info')}
                  className="w-full h-full min-h-[120px] p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                  placeholder={language === 'en' ? 'Example: IT Center Building, 1st Floor...' : 'Contoh: Gedung IT Center Lantai 1...'}
                />
              </div>
            </div>
          </div>

          {/* Right Panel: Live Preview */}
          <div className="w-full lg:w-[400px] flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{t('bot.preview_title')}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{t('bot.preview_desc')}</p>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                  {activePreview.replace('_', ' ')}
                </div>
              </div>
              
              <div className="p-6 bg-slate-50 flex justify-center">
                <WhatsAppMockup 
                  message={getPreviewMessage()} 
                  triggerWord={settings.trigger_word || 'HaloDesk'} 
                />
              </div>
              <div className="mt-6 text-center text-xs text-gray-400">
                {t('bot.preview_updated')}
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
