'use client';

import { Locale } from '@/i18n/getDictionary';
import { setLanguage } from '@/app/actions/language';
import { useState } from 'react';

export default function LanguageToggle({ currentLocale }: { currentLocale: Locale }) {
  const [isPending, setIsPending] = useState(false);

  const toggleLanguage = async () => {
    setIsPending(true);
    const nextLocale = currentLocale === 'th' ? 'en' : 'th';
    await setLanguage(nextLocale);
    window.location.reload();
  };

  return (
    <button 
      onClick={toggleLanguage}
      disabled={isPending}
      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2 disabled:opacity-50"
    >
      <span className={currentLocale === 'th' ? 'text-blue-600' : 'text-slate-400'}>TH</span>
      <span className="text-slate-300">|</span>
      <span className={currentLocale === 'en' ? 'text-blue-600' : 'text-slate-400'}>EN</span>
    </button>
  );
}
