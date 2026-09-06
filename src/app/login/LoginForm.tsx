'use client';

import { HardDrive, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Dictionary } from '@/i18n/en';
import { Locale } from '@/i18n/getDictionary';
import { setLanguage } from '@/app/actions/language';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function LoginForm({ 
  dict, 
  currentLocale,
  connect
}: { 
  dict: Dictionary['login'], 
  currentLocale: Locale,
  connect?: string
}) {
  const [loadingLine, setLoadingLine] = useState(false);

  const handleLineLogin = () => {
    setLoadingLine(true);
    window.location.href = '/api/auth/line/login';
  };

  const toggleLanguage = async () => {
    const nextLocale = currentLocale === 'th' ? 'en' : 'th';
    await setLanguage(nextLocale);
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#F4F7FE]">
      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={toggleLanguage}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <span className={currentLocale === 'th' ? 'text-blue-600' : 'text-slate-400'}>TH</span>
          <span className="text-slate-300">|</span>
          <span className={currentLocale === 'en' ? 'text-blue-600' : 'text-slate-400'}>EN</span>
        </button>
      </div>

      {/* Decorative glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500 z-10">
        <div className="glass-card p-10 text-center bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl">
          
          <div className="w-24 h-24 mx-auto mb-6">
            <img src="/logo.png" alt="KepKep Logo" className="w-full h-full object-contain drop-shadow-sm" />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{dict.welcome}</h1>
          <p className="text-slate-500 mb-8 font-medium">{dict.description}</p>

          <div className="space-y-4">
            <button 
              onClick={handleLineLogin}
              disabled={loadingLine}
              className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed bg-[#06C755] hover:bg-[#05b34c] text-white shadow-md shadow-[#06C755]/20 hover:shadow-lg transition-all font-bold"
            >
              {loadingLine ? (
                <>
                  <LoadingSpinner size="sm" className="text-white border-white border-t-transparent" />
                  {dict.redirecting}
                </>
              ) : (
                <>
                  {dict.continueLine}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-8 font-medium">
            {dict.terms}
          </p>
        </div>
      </div>
    </div>
  );
}
