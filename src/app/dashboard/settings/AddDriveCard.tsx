"use client";

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { SiGoogledrive } from 'react-icons/si';
import { TbBrandOnedrive } from 'react-icons/tb';

export default function AddDriveCard({ dict }: { dict: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        className="relative group/card h-full cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="glass-card bg-white/50 p-4 md:p-6 flex flex-col items-center justify-center text-center h-full border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 relative min-h-[220px]">
          <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border border-slate-200 border-dashed bg-slate-50 mb-3 md:mb-4 group-hover/card:scale-110 group-hover/card:bg-blue-100 group-hover/card:border-blue-200 group-hover/card:text-blue-600 transition-all duration-300 text-slate-400">
            <Plus className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <h3 className="text-sm md:text-base font-bold text-slate-600 group-hover/card:text-blue-700 transition-colors">
            {dict.settings.addDrive}
          </h3>
        </div>
      </div>

      {/* Select Provider Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">{dict.settings.selectCloudService}</h2>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Google Drive Option */}
                <a 
                  href="/api/auth/google/login"
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <SiGoogledrive className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">Google Drive</h4>
                    <p className="text-xs text-slate-500">{dict.settings.saveToGoogleDrive}</p>
                  </div>
                </a>

                {/* OneDrive Option */}
                <div 
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 opacity-70 cursor-not-allowed relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-200 text-slate-600 text-[9px] font-bold uppercase tracking-wider rounded-full">
                    {dict.settings.comingSoon}
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                    <TbBrandOnedrive className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-slate-700">OneDrive</h4>
                    <p className="text-xs text-slate-500">{dict.settings.saveToOneDrive}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
