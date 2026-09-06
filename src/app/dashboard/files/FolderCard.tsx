"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Folder, MoreVertical, Check, X } from 'lucide-react';
import { Dictionary } from '@/i18n/en';

type GroupStat = {
  id: number;
  name: string | null;
  fileCount: number;
  totalSize: number;
  color: string;
};

const colors = [
  { id: 'blue', bg: 'bg-blue-50/80', text: 'text-blue-600', fill: 'fill-blue-200/50', border: 'border-blue-100' },
  { id: 'slate', bg: 'bg-slate-100', text: 'text-slate-600', fill: 'fill-slate-300/50', border: 'border-slate-200' },
  { id: 'rose', bg: 'bg-rose-50/80', text: 'text-rose-600', fill: 'fill-rose-200/50', border: 'border-rose-100' },
  { id: 'amber', bg: 'bg-amber-50/80', text: 'text-amber-600', fill: 'fill-amber-200/50', border: 'border-amber-100' },
  { id: 'emerald', bg: 'bg-emerald-50/80', text: 'text-emerald-600', fill: 'fill-emerald-200/50', border: 'border-emerald-100' },
  { id: 'purple', bg: 'bg-purple-50/80', text: 'text-purple-600', fill: 'fill-purple-200/50', border: 'border-purple-100' },
];


export default function FolderCard({ group, dict }: { group: GroupStat; dict: Dictionary }) {
  const router = useRouter();
  const [currentColor, setCurrentColor] = useState(group.color || 'blue');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const theme = colors.find(c => c.id === currentColor) || colors[0];
  const sizeMB = group.totalSize ? (Number(group.totalSize) / (1024 * 1024)).toFixed(2) : "0.00";

  const handleFolderClick = () => {
    if (!isMenuOpen) {
      router.push(`/dashboard/files/${group.id}`);
    }
  };

  const changeColor = async (colorId: string) => {
    setCurrentColor(colorId);
    setIsMenuOpen(false);
    try {
      await fetch(`/api/groups/${group.id}/color`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color: colorId }),
      });
      router.refresh();
    } catch (e) {
      console.error('Failed to change color', e);
    }
  };

  return (
    <>
      <div className="relative group/card">
        <div 
          onClick={handleFolderClick}
          className="flex flex-col items-center cursor-pointer transition-transform duration-300 hover:-translate-y-1"
        >
          {/* Minimal Folder Icon */}
          <div className={`w-28 h-28 md:w-36 md:h-36 rounded-3xl ${theme.bg} ${theme.text} flex items-center justify-center shadow-sm border ${theme.border} mb-3 group-hover/card:shadow-md transition-all relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
            <Folder className={`w-14 h-14 md:w-16 md:h-16 ${theme.fill} relative z-10 transition-transform duration-300 group-hover/card:scale-110`} />
          </div>
          
          <h3 className="text-sm md:text-base font-bold text-slate-800 line-clamp-1 max-w-full px-2">
            {group.name || `${dict.files.group} #${group.id}`}
          </h3>
        </div>

        {/* 3-dots Menu Button */}
        <div className="absolute top-2 right-2 md:top-3 md:right-3">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/50 backdrop-blur-sm hover:bg-white text-slate-500 hover:text-slate-700 shadow-sm border border-slate-100 transition-colors z-20 ${isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover/card:opacity-100'}`}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-30 animate-in fade-in zoom-in-95">
              <button 
                onClick={() => { setIsMenuOpen(false); setIsDetailsOpen(true); }}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
              >
                {dict.files.viewDetails}
              </button>
              
              <div className="my-2 border-t border-slate-100"></div>
              
              <div className="px-3 py-1 mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">{dict.files.changeColor}</div>
              <div className="grid grid-cols-3 gap-2 px-2 py-1">
                {colors.map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => changeColor(c.id)}
                    className={`w-10 h-10 rounded-full ${c.bg} ${c.border} border flex items-center justify-center hover:scale-110 transition-transform`}
                  >
                    {currentColor === c.id && <Check className={`w-5 h-5 ${c.text}`} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {isDetailsOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsDetailsOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${theme.bg} ${theme.text} flex items-center justify-center border ${theme.border}`}>
                    <Folder className={`w-6 h-6 ${theme.fill}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 line-clamp-1">{group.name || `${dict.files.group} #${group.id}`}</h2>
                    <p className="text-sm text-slate-500">{dict.files.folderDetails}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDetailsOpen(false)}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                   <span className="font-bold text-slate-800 text-2xl">{group.fileCount}</span>
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{dict.files.fileCount}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                   <span className="font-bold text-slate-800 text-2xl">{sizeMB}</span>
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{dict.files.sizeMB}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
