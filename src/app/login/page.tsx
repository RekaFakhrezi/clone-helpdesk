'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AuthCard from '@/components/auth/AuthCard';
import { loginUser } from '@/lib/AuthService';
import { roleHome } from '@/lib/roleHome';

export default function LoginPage() {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const authData = await loginUser(usernameOrEmail, password);

      if (authData?.user) {
        // Gabungkan data user dan profile
        const combinedUser = { ...authData.user, ...(authData.profile || {}) };

        // Simpan token ke localStorage dan cookie
        if (authData.session?.access_token) {
          localStorage.setItem('access_token', authData.session.access_token);
          document.cookie = `auth_token=${authData.session.access_token}; path=/; max-age=86400`;
        }

        // Simpan state login untuk middleware
        localStorage.setItem('user', JSON.stringify(combinedUser));
        localStorage.setItem('isLoggedIn', 'true');
        document.cookie = `isLoggedIn=true; path=/; max-age=86400`;

        if (combinedUser.role) {
          document.cookie = `userRole=${combinedUser.role}; path=/; max-age=86400`;
        }

        // Cek role untuk routing
        const role = combinedUser.role || combinedUser.user_metadata?.role || '';
        const targetPath = roleHome(role);

        // Set exit state for animation before redirect
        setIsExiting(true);
        setTimeout(() => {
          router.push(targetPath);
        }, 800);
      } else {
        throw new Error('Respons tidak valid dari server.');
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMsg(error.message || 'Gagal login. Periksa kembali email dan password Anda.');
      } else {
        setErrorMsg('Gagal login. Periksa kembali email dan password Anda.');
      }
      setLoading(false);
    }
  };

  const cardContent = (
    <AuthCard
      title="Login Helpdesk Terpadu"
      description="Silakan masuk menggunakan akun resmi Anda."
      footer={<p className="text-[14.5px] text-slate-500">Hanya untuk pengguna terdaftar.</p>}
    >
      <form onSubmit={handleLogin}>
        {/* Error */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              key="err"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="px-3.5 py-2.5 bg-red-500/10 border border-red-500/25 rounded-[10px] text-red-700 text-[13px] flex items-center gap-2 overflow-hidden"
            >
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 20 20" className="shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Input: Email / Username ── */}
        <div className="mb-7">
          <div className="flex items-end gap-2.5 relative">
            <span className="text-slate-400 pb-2.5 shrink-0">
              <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <input
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required
              placeholder="Email atau Username"
              className="w-full bg-transparent border-0 border-b-[2.5px] border-b-slate-500 rounded-none outline-none ring-0 text-slate-800 text-[14px] pb-2.5 pt-2 transition-colors duration-200 font-sans focus:border-b-[#002D72] focus:outline-none focus:ring-0 placeholder-slate-400"
              style={{ borderRadius: 0 }}
            />
          </div>
        </div>

        {/* ── Input: Password ── */}
        <div className="mb-9">
          <div className="flex items-end gap-2.5 relative">
            <span className="text-slate-400 pb-2.5 shrink-0">
              <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </span>
            <div className="flex-1 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                className={`w-full bg-transparent border-0 border-b-[2.5px] border-b-slate-500 rounded-none outline-none ring-0 text-slate-800 text-[14px] pb-2.5 pt-2 pr-7 transition-colors duration-200 font-sans focus:border-b-[#002D72] focus:outline-none focus:ring-0 placeholder-slate-400 ${!showPassword && password ? 'tracking-[0.1em]' : 'tracking-normal'}`}
                style={{ borderRadius: 0 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 bottom-[9px] bg-transparent border-none cursor-pointer text-slate-400 p-0 flex items-center hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Submit Button ── */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-[13px] px-6 rounded-full text-white text-[17px] font-semibold flex items-center justify-center gap-2.5 transition-all duration-200 font-sans tracking-[0.02em] ${
            loading
              ? 'bg-[#002D72]/50 cursor-not-allowed opacity-70 shadow-none'
              : 'bg-[linear-gradient(135deg,#1a56db_0%,#002D72_55%,#001C46_100%)] cursor-pointer opacity-100 shadow-[0_6px_24px_rgba(0,45,114,0.45)] hover:-translate-y-[2px] hover:shadow-[0_10px_30px_rgba(0,45,114,0.55)]'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Memproses...
            </>
          ) : (
            <>Masuk ke Sistem</>
          )}
        </button>
      </form>
    </AuthCard>
  );

  return (
    <>
      <AnimatePresence>
        {!isExiting && (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            transition={{ duration: 0.4 }}
            className="w-full min-h-screen"
          >
            {cardContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Loading Overlay saat Redirect ── */}
      <AnimatePresence>
        {isExiting && (
          <motion.div
            key="exiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1726]"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 20 }}
              className="flex flex-col items-center gap-4 text-white font-bold text-lg"
            >
              <svg className="animate-spin w-12 h-12 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Menyiapkan Dashboard...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        /* Menghilangkan background warna dari autofill browser (Chrome/Edge/Safari) */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
            transition: background-color 5000s ease-in-out 0s;
            -webkit-text-fill-color: #1e293b !important;
        }
        /* Menghilangkan focus ring/outline bawaan Tailwind & browser */
        input:focus,
        input:focus-visible {
            outline: none !important;
            box-shadow: none !important;
            --tw-ring-shadow: none !important;
            --tw-ring-color: transparent !important;
        }
      `}</style>
    </>
  );
}