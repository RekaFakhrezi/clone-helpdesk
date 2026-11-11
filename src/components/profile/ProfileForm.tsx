'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchClient } from '@/lib/apiClient';
import { useLanguage } from '@/context/LanguageContext';

type Variant = 'standard' | 'executive';

type ProfileUser = {
  id?: string | number;
  name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  ext?: string;
  mobile?: string;
  username?: string;
  role?: string;
  user_metadata?: { full_name?: string; name?: string; role?: string };
};

type FormValues = {
  name: string;
  phone: string;
  ext: string;
  mobile: string;
  username: string;
  password: string;
};

type Message = { type: 'success' | 'error'; text: string };

interface ProfileFormProps {
  title: string;
  description: string;
  variant?: Variant;
  /** Badge di header kartu (varian eksekutif). */
  badge?: string;
  /** Placeholder kolom username (varian standar). */
  usernamePlaceholder?: string;
  /** Judul bagian autentikasi (varian standar). */
  authHeading?: string;
}

const FIELD_INPUT =
  'bg-[var(--paper)] border border-[var(--line-dark)] rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--gold-soft)] transition-colors';
const FIELD_INPUT_EXEC =
  'bg-[var(--paper)] border border-[var(--line-dark)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--gold)] focus:bg-white transition-colors';

const STANDARD: VariantConfig = {
  outer: 'flex flex-col gap-6 p-6 md:p-10',
  loadingHeight: 'min-h-screen',
  title: 'text-2xl font-bold text-[var(--ink)] mb-1',
  description: 'text-[var(--text-dim)] text-sm',
  card: 'bg-white rounded-2xl border border-[var(--line)] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300',
  cardHeader: 'p-5 md:p-6 border-b border-[var(--line-dark)]',
  cardTitle: 'font-bold text-[18px] text-[var(--ink)]',
  message: 'mx-5 mt-5 p-4 rounded-xl text-sm font-medium',
  messageSuccess: 'bg-green-50 text-green-700 border border-green-200',
  messageError: 'bg-red-50 text-red-700 border border-red-200',
  body: 'p-5 md:p-8 flex flex-col bg-white',
  bodyInner: 'flex flex-col gap-8 animate-in fade-in duration-300',
  avatarBox: 'w-24 h-24 rounded-full bg-[var(--gold)] flex items-center justify-center text-white text-3xl font-bold shadow-sm uppercase',
  avatarNote: 'text-[13px] font-bold text-[var(--gold-soft)] hover:text-[var(--gold-dim)] transition-colors',
  field: 'flex flex-col gap-2',
  authField: 'flex flex-col gap-2 md:col-span-2 sm:col-span-1',
  label: 'text-[13px] font-bold text-[var(--ink)]',
  input: FIELD_INPUT,
  inputWide: `${FIELD_INPUT} w-full`,
  inputExt: `${FIELD_INPUT} w-24`,
  inputRole: 'bg-[var(--paper-2)] opacity-70 cursor-not-allowed border border-[var(--line-dark)] rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--gold-soft)] transition-colors',
  inputEmail: 'bg-[var(--paper-2)] opacity-70 cursor-not-allowed border border-[var(--line-dark)] rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--gold-soft)] transition-colors',
  inputPassword: `${FIELD_INPUT} w-full pr-10`,
  divider: 'border-[var(--line-dark)]',
  authHeading: 'font-bold text-[15.5px] text-[var(--ink)] flex items-center gap-2',
  authGrid: 'grid grid-cols-1 sm:grid-cols-2 gap-5 md:grid-cols-4',
  footer: 'bg-[var(--paper-2)]/50 border-t border-[var(--line)] p-5 md:p-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 w-full',
  resetButton: 'w-full sm:w-auto bg-white border border-[var(--line)] text-[var(--text-dim)] px-7 py-2.5 rounded-xl text-sm font-bold hover:bg-[var(--paper-2)] transition-colors active:scale-95',
  initialsFallback: 'OP',
  hasAuthIcon: false,
  placeholders: {},
};

const EXECUTIVE: VariantConfig = {
  outer: 'flex flex-col gap-6 max-w-4xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-2 duration-300',
  loadingHeight: 'min-h-[400px]',
  title: 'text-2xl font-bold text-[var(--ink)] tracking-tight',
  description: 'text-[var(--text-dim)] text-sm font-medium',
  card: 'bg-white rounded-2xl border border-[var(--line)] shadow-sm overflow-hidden',
  cardHeader: 'p-6 border-b border-[var(--line)] flex items-center justify-between',
  cardTitle: 'font-bold text-base text-[var(--ink)]',
  message: 'mx-6 mt-6 p-4 rounded-xl text-sm font-semibold flex items-center gap-3',
  messageSuccess: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  messageError: 'bg-red-50 text-red-800 border border-red-200',
  body: 'p-6 md:p-8 flex flex-col gap-8',
  bodyInner: 'flex flex-col gap-8',
  avatarBox: 'w-24 h-24 rounded-full bg-[var(--gold)] flex items-center justify-center text-white text-3xl font-bold shadow-md uppercase ring-4 ring-slate-50',
  avatarNote: 'text-xs font-bold text-[var(--text-dim)]',
  field: 'flex flex-col gap-1.5',
  authField: 'flex flex-col gap-1.5',
  label: 'text-xs font-bold text-[var(--ink)]',
  input: FIELD_INPUT_EXEC,
  inputWide: FIELD_INPUT_EXEC,
  inputExt: `${FIELD_INPUT_EXEC} w-20 text-center`,
  inputRole: 'bg-slate-100 opacity-80 cursor-not-allowed border border-[var(--line-dark)] rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700',
  inputEmail: 'bg-slate-100 opacity-80 cursor-not-allowed border border-[var(--line-dark)] rounded-xl px-4 py-2.5 text-sm text-slate-700',
  inputPassword: `${FIELD_INPUT_EXEC} w-full pr-10`,
  divider: 'border-[var(--line)]',
  authHeading: 'font-bold text-sm text-[var(--ink)] flex items-center gap-2',
  authGrid: 'grid grid-cols-1 sm:grid-cols-2 gap-5',
  footer: 'bg-slate-50 border-t border-[var(--line)] p-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 w-full',
  resetButton: 'w-full sm:w-auto bg-white border border-[var(--line)] text-[var(--text-dim)] px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[var(--paper-2)] transition-colors active:scale-95 shadow-sm',
  initialsFallback: 'PM',
  hasAuthIcon: true,
  placeholders: {
    username: 'Username',
    password: '••••••••',
    phone: '0812345...',
    mobile: '0812345...',
    authHeading: 'Authentication',
  },
};

export default function ProfileForm({
  title,
  description,
  variant = 'standard',
  badge,
  usernamePlaceholder,
  authHeading,
}: ProfileFormProps) {
  const { t } = useLanguage();
  const isExecutive = variant === 'executive';
  const c = isExecutive ? EXECUTIVE : STANDARD;
  const placeholders = isExecutive
    ? c.placeholders
    : { ...c.placeholders, username: usernamePlaceholder, authHeading };

  const [currentUser, setCurrentUser] = useState<ProfileUser>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<FormValues>({
    name: '',
    phone: '',
    ext: '',
    mobile: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user: ProfileUser = JSON.parse(userStr);
        setCurrentUser(user);

        let displayUserName = user.name || user.full_name || user.user_metadata?.full_name || user.user_metadata?.name;
        if (!displayUserName && user.email) {
          displayUserName = user.email.split('@')[0];
        }

        setFormData({
          name: displayUserName || '',
          phone: user.phone || '',
          ext: user.ext || '',
          mobile: user.mobile || '',
          username: user.username || '',
          password: '',
        });
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
    setIsLoaded(true);
  }, []);

  let displayUserRole = currentUser.role || currentUser.user_metadata?.role || 'Super Administrator';
  if (displayUserRole === 'authenticated') {
    if (currentUser.email?.includes('operator')) displayUserRole = 'Operator Helpdesk';
    else if (currentUser.email?.includes('teknisi')) displayUserRole = 'Teknisi Helpdesk';
    else displayUserRole = 'Administrator';
  }

  const roleValue = isExecutive ? `${t('topbar.pimpinan')} (Executive)` : displayUserRole;
  const initials = formData.name ? formData.name.substring(0, 2).toUpperCase() : c.initialsFallback;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await fetchClient('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          userId: currentUser.id,
          name: formData.name,
          phone: formData.phone,
          ext: formData.ext,
          mobile: formData.mobile,
          username: formData.username,
          password: formData.password || undefined,
        }),
      });

      setMessage({ type: 'success', text: t('profile.save_success') });

      const updatedUser: ProfileUser = {
        ...currentUser,
        name: formData.name,
        phone: formData.phone,
        ext: formData.ext,
        mobile: formData.mobile,
        username: formData.username,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      setFormData(prev => ({ ...prev, password: '' }));
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : t('profile.save_error') });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center ${c.loadingHeight}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--gold)]"></div>
      </div>
    );
  }

  return (
    <div className={c.outer}>
      {/* Page Header */}
      <div>
        {isExecutive ? (
          <h1 className={c.title}>{title}</h1>
        ) : (
          <h2 className={c.title}>{title}</h2>
        )}
        <p className={c.description}>{description}</p>
      </div>

      {/* Account Profile Card */}
      <div className={c.card}>
        <div className={c.cardHeader}>
          <h3 className={c.cardTitle}>{t('profile.card_title')}</h3>
          {isExecutive && (
            <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">
              {badge}
            </span>
          )}
        </div>

        {message && (
          <div
            className={`${c.message} ${message.type === 'success' ? c.messageSuccess : c.messageError}`}
          >
            {isExecutive &&
              (message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ))}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className={c.body}>
            <div className={c.bodyInner}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Avatar Section */}
                <div className="md:col-span-1 flex flex-col items-center gap-3 pt-2">
                  <div className={c.avatarBox}>{initials}</div>
                  {isExecutive ? (
                    <span className={c.avatarNote}>{t('profile.avatar_title')}</span>
                  ) : (
                    <button type="button" className={c.avatarNote}>
                      {t('profile.avatar_btn')}
                    </button>
                  )}
                </div>

                {/* Fields */}
                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className={c.field}>
                    <label className={c.label}>{t('profile.full_name')}</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={c.input}
                    />
                  </div>
                  <div className={c.field}>
                    <label className={c.label}>{t('profile.role')}</label>
                    <input type="text" value={roleValue} disabled className={c.inputRole} />
                  </div>
                  <div className={`${c.field} sm:col-span-2`}>
                    <label className={c.label}>{t('profile.email')}</label>
                    <input type="email" value={currentUser.email || ''} disabled className={c.inputEmail} />
                  </div>
                  <div className={c.field}>
                    <label className={c.label}>{t('profile.phone')}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder={placeholders.phone}
                        className={c.inputWide}
                      />
                      <input
                        type="text"
                        name="ext"
                        placeholder={t('profile.ext')}
                        value={formData.ext}
                        onChange={handleChange}
                        className={c.inputExt}
                      />
                    </div>
                  </div>
                  <div className={c.field}>
                    <label className={c.label}>{t('profile.mobile')}</label>
                    <input
                      type="text"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder={placeholders.mobile}
                      className={c.input}
                    />
                  </div>
                </div>
              </div>

              <hr className={c.divider} />

              {/* Authentication Section */}
              <div className="flex flex-col gap-4">
                <h4 className={c.authHeading}>
                  {c.hasAuthIcon && <Lock className="w-4 h-4 text-[var(--text-dim)]" />}
                  {placeholders.authHeading}
                </h4>
                <div className={c.authGrid}>
                  <div className={c.authField}>
                    <label className={c.label}>{t('profile.username')}</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder={placeholders.username}
                      className={c.inputWide}
                    />
                  </div>
                  <div className={c.authField}>
                    <label className={c.label}>{t('profile.password')}</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={placeholders.password}
                        className={c.inputPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={c.footer}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className={c.resetButton}
            >
              {t('common.reset')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto bg-[var(--ink)] text-white px-7 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-[var(--text)] hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface VariantConfig {
  outer: string;
  loadingHeight: string;
  title: string;
  description: string;
  card: string;
  cardHeader: string;
  cardTitle: string;
  message: string;
  messageSuccess: string;
  messageError: string;
  body: string;
  bodyInner: string;
  avatarBox: string;
  avatarNote: string;
  field: string;
  authField: string;
  label: string;
  input: string;
  inputWide: string;
  inputExt: string;
  inputRole: string;
  inputEmail: string;
  inputPassword: string;
  divider: string;
  authHeading: string;
  authGrid: string;
  footer: string;
  resetButton: string;
  initialsFallback: string;
  hasAuthIcon: boolean;
  placeholders: Partial<Record<'username' | 'password' | 'phone' | 'mobile' | 'authHeading', string>>;
}
