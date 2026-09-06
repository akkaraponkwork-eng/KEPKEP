"use client";

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings, LogOut, Menu, X } from 'lucide-react';
import LanguageToggle from '@/components/LanguageToggle';
import SidebarNav from '@/components/SidebarNav';
import { logoutAction } from '@/app/actions/auth';

export default function DashboardLayoutClient({ children, dict, locale, adminName, isSuperAdmin, workspaceName, pictureUrl }: { children: ReactNode, dict: any, locale: string, adminName: string, isSuperAdmin?: boolean, workspaceName?: string, pictureUrl?: string }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F7FE]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col shadow-sm transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-transparent">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="KepKep Logo" className="w-10 h-10 object-contain rounded-xl bg-blue-50" />
            <span className="text-xl font-bold tracking-tight text-slate-800">Kep<span className="text-blue-600">Kep</span></span>
          </div>
          <button 
            className="md:hidden text-slate-400 hover:text-slate-600"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <SidebarNav dict={dict.sidebar} isSuperAdmin={isSuperAdmin} />

        <div className="p-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white text-center shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
             <img src="/mascot.png" alt="Mascot" className="w-16 h-16 mx-auto mb-3 drop-shadow-md rounded-full bg-blue-50" />
             <h4 className="font-bold mb-1">{dict.sidebar.premium}</h4>
             <p className="text-xs text-blue-200 mb-4">{dict.sidebar.unlimited}</p>
             <a href="https://buymeacoffee.com" target="_blank" rel="noopener noreferrer" className="block bg-white text-blue-600 w-full py-2 rounded-xl text-sm font-bold shadow hover:shadow-md transition-shadow">
               {dict.sidebar.upgrade}
             </a>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3 overflow-hidden pr-2">
             <div className="w-10 h-10 shrink-0 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-slate-200">
                <img src={pictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=eff6ff&color=2563eb`} alt="Profile" className="w-full h-full object-cover" />
             </div>
             <div className="min-w-0">
                <p className="text-sm font-bold text-slate-700 truncate" title={adminName}>{adminName}</p>
                <p className="text-xs text-slate-400 truncate">{dict.sidebar.roleAdmin}</p>
             </div>
          </div>
          <form action={logoutAction}>
             <button type="submit" className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50">
               <LogOut className="w-5 h-5" />
             </button>
           </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-screen">
        {/* Top Header */}
        <header className="h-20 bg-white/50 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-10 sticky top-0 border-b md:border-none border-slate-200">
           <div className="flex items-center gap-3">
              <button 
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
           </div>
           
           <div className="flex-1 max-w-xl mx-4 md:mx-8">
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 md:h-5 md:w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder={dict.header.search} 
                  className="w-full pl-9 md:pl-11 pr-4 py-2 md:py-2.5 bg-white border border-slate-200 rounded-full text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
             </div>
           </div>

           <div className="flex items-center gap-4">
              {workspaceName && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-700 font-bold text-sm shadow-sm border border-slate-200">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
                  {workspaceName}
                </div>
              )}
              <LanguageToggle currentLocale={locale as any} />
           </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto pb-20 md:pb-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
