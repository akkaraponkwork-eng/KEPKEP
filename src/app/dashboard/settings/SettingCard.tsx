"use client";

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, X, Pencil, Check, Trash2 } from 'lucide-react';
import { updateRootFolder, disconnectDrive } from '@/app/actions/drive';

export type SettingCardProps = {
  id: string;
  title: string;
  descPrimary: string;
  descUnused: string;
  isConnected: boolean;
  statusReady: string;
  statusWaiting: string;
  statusLabel: string;
  folderLabel: string;
  folderValue: string;
  scopeLabel: string;
  scopeValue: string;
  actionLabel: string;
  actionUrl?: string;
  icon: React.ReactNode;
  theme: 'blue' | 'sky' | 'emerald' | 'rose' | 'slate';
  dict: any;
  isComingSoon?: boolean;
};

export default function SettingCard({ props }: { props: SettingCardProps }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditingFolder, setIsEditingFolder] = useState(false);
  const [folderName, setFolderName] = useState(props.folderValue);
  const [isSaving, setIsSaving] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { isConnected, dict, theme, isComingSoon } = props;

  // Sync state if prop changes
  useEffect(() => {
    setFolderName(props.folderValue);
  }, [props.folderValue]);

  const handleSaveFolder = async () => {
    if (!folderName.trim() || folderName.trim() === props.folderValue) {
      setIsEditingFolder(false);
      setFolderName(props.folderValue);
      return;
    }
    
    setIsSaving(true);
    const result = await updateRootFolder(folderName);
    setIsSaving(false);
    
    if (result.success) {
      setIsEditingFolder(false);
    } else {
      alert(result.error || dict.settings.failedToUpdateFolder);
    }
  };

  const handleDisconnect = async () => {
    if (confirm(dict.settings.disconnectConfirm)) {
      setIsDisconnecting(true);
      const result = await disconnectDrive();
      setIsDisconnecting(false);
      if (result.success) {
        setIsDetailsOpen(false);
      } else {
        alert(result.error || dict.settings.failedToDisconnect);
      }
    }
  };

  const themes = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', ring: 'ring-blue-500/20' },
    sky: { bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-600', ring: 'ring-sky-500/20' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', ring: 'ring-emerald-500/20' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600', ring: 'ring-rose-500/20' },
    slate: { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-600', ring: 'ring-slate-500/20' },
  };

  const currentTheme = isComingSoon ? themes.slate : themes[theme] || themes.blue;

  return (
    <>
      <div 
        className={`relative group/card h-full ${isComingSoon ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
        onClick={() => !isComingSoon && setIsDetailsOpen(true)}
      >
        <div className={`glass-card bg-white p-4 md:p-6 flex flex-col items-center text-center h-full border hover:-translate-y-1 transition-all duration-300 relative overflow-hidden ${isConnected ? 'border-emerald-200 ring-2 ring-emerald-100 shadow-[0_4px_20px_rgba(16,185,129,0.15)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)]' : isComingSoon ? 'border-slate-100' : 'border-slate-100 hover:border-blue-200 hover:shadow-xl'}`}>
          
          {isComingSoon && (
            <div className="absolute top-3 right-3 px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-full border border-slate-200">
              {dict.settings.comingSoon}
            </div>
          )}

          {/* Main Icon */}
          <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-sm border mb-3 md:mb-4 group-hover/card:scale-110 transition-transform duration-300 relative overflow-hidden ${currentTheme.bg} ${currentTheme.border} ${currentTheme.text}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent"></div>
            <div className="w-7 h-7 md:w-10 md:h-10 relative z-10 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full drop-shadow-sm">
              {props.icon}
            </div>
          </div>
          
          {/* Title */}
          <h3 className={`text-sm md:text-base font-bold text-slate-800 mb-2 line-clamp-1 w-full px-2 ${!isComingSoon && 'group-hover/card:' + currentTheme.text} transition-colors`}>
            {props.title}
          </h3>
          
          {/* Status Badge */}
          <div className="flex items-center justify-center gap-1.5 mt-auto pt-3 border-t border-slate-50 w-full">
            {isConnected ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                <span className="text-[10px] md:text-xs font-bold text-emerald-600">
                  {dict.settings.connectedBadge}
                </span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span className="text-[10px] md:text-xs font-bold text-slate-500">
                  {dict.settings.notConnectedBadge}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {isDetailsOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsDetailsOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border shrink-0 ${currentTheme.bg} ${currentTheme.border} ${currentTheme.text}`}>
                     <div className="w-6 h-6 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">
                       {props.icon}
                     </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 line-clamp-1">{props.title}</h2>
                    <p className="text-sm text-slate-500 line-clamp-1">{isConnected ? props.descPrimary : props.descUnused}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDetailsOpen(false)}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm border-b border-slate-200/60 pb-3">
                    <span className="text-slate-500 font-medium">{props.statusLabel}</span>
                    <span className={`font-bold ${isConnected ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {isConnected ? props.statusReady : props.statusWaiting}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-200/60 pb-3">
                    <span className="text-slate-500 font-medium">{props.folderLabel}</span>
                    <div className="flex items-center gap-2">
                      {isEditingFolder && isConnected ? (
                        <div className="flex items-center gap-1">
                          <input 
                            type="text" 
                            value={folderName} 
                            onChange={(e) => setFolderName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveFolder()}
                            disabled={isSaving}
                            autoFocus
                            className="text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-md px-2 py-1 w-32 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                          />
                          <button 
                            onClick={handleSaveFolder}
                            disabled={isSaving}
                            className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className={`font-semibold ${isConnected ? 'text-slate-900' : 'text-slate-400'}`}>
                            {isConnected ? folderName : props.folderValue}
                          </span>
                          {isConnected && (
                            <button 
                              onClick={() => setIsEditingFolder(true)}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-1">
                    <span className="text-slate-500 font-medium">{props.scopeLabel}</span>
                    <span className="text-slate-900 font-mono text-xs bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                      {props.scopeValue}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  {isConnected && (
                    <button 
                      onClick={handleDisconnect}
                      disabled={isDisconnecting}
                      className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold bg-white text-red-600 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm border border-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {isDisconnecting ? dict.settings.disconnecting : dict.settings.disconnect}
                    </button>
                  )}
                  {props.actionUrl ? (
                    <a href={props.actionUrl} className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md border border-transparent">
                      {props.actionLabel}
                    </a>
                  ) : (
                    <button disabled className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-400 transition-all shadow-sm border border-slate-200 cursor-not-allowed">
                      {props.actionLabel}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
