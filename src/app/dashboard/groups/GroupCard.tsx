"use client";

import { useState } from 'react';
import { Users, MoreVertical, ShieldAlert, FolderOpen, X } from 'lucide-react';
import { ErrorState } from '@/components/ui/ErrorState';

export type GroupStat = {
  id: number;
  name: string | null;
  status: string;
  driveFolderId: string | null;
  updatedAt: Date;
  fileCount: number;
  totalSize: number;
};

export default function GroupCard({ group, dict }: { group: GroupStat, dict: any }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isActive = group.status === 'active' || group.status === 'initializing';
  const isDegraded = !isActive;

  return (
    <>
      <div 
        className="relative group/card h-full cursor-pointer"
        onClick={() => setIsDetailsOpen(true)}
      >
        <div className={`glass-card bg-white p-4 md:p-6 flex flex-col items-center text-center h-full border hover:-translate-y-1 transition-all duration-300 ${isDegraded ? 'border-amber-200 ring-1 ring-amber-100 hover:shadow-lg' : 'border-slate-100 hover:border-blue-200 hover:shadow-lg'}`}>
          
          {/* Main Icon */}
          <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-sm border mb-3 md:mb-4 group-hover/card:scale-110 transition-transform duration-300 relative overflow-hidden ${isActive ? 'bg-blue-50/80 border-blue-100 text-blue-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent"></div>
            <Users className="w-7 h-7 md:w-10 md:h-10 relative z-10" />
          </div>
          
          {/* Title */}
          <h3 className="text-sm md:text-base font-bold text-slate-800 mb-2 line-clamp-1 w-full px-2 group-hover/card:text-blue-600 transition-colors">
            {group.name || `Group #${group.id}`}
          </h3>
          
          {/* Status Badge */}
          <div className="flex items-center justify-center gap-1.5 mt-auto pt-3 border-t border-slate-50 w-full">
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-amber-500'}`} />
            <span className={`text-[10px] md:text-xs font-bold ${isActive ? 'text-emerald-600' : 'text-amber-600'}`}>
              {isActive ? dict.groups.active : (group.status === 'token_expired' ? "Token Expired" : (group.status === 'folder_missing' ? dict.groups.folderMissing : group.status))}
            </span>
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
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border shrink-0 ${isActive ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 line-clamp-1">{group.name || `Group #${group.id}`}</h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-amber-500'}`} />
                      <span className={`text-xs font-bold ${isActive ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {isActive ? dict.groups.active : (group.status === 'folder_missing' ? dict.groups.folderMissing : group.status)}
                      </span>
                    </div>
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
                {isDegraded && (
                  <ErrorState 
                    title={group.status === 'token_expired' ? dict.groups.tokenExpiredTitle : dict.groups.groupErrorTitle}
                    description={group.status === 'token_expired' ? dict.groups.tokenExpiredDesc : dict.groups.missingDesc}
                    action={
                      group.status === 'token_expired' ? (
                        <a 
                          href="/dashboard/settings"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          {dict.groups.goToSettingsPage}
                        </a>
                      ) : (
                        <button className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors">
                          {dict.groups.relinkFolder}
                        </button>
                      )
                    }
                  />
                )}

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm border-b border-slate-200/60 pb-3">
                    <span className="text-slate-500 flex items-center gap-2"><FolderOpen className="w-4 h-4" /> {dict.groups.driveFolder}</span>
                    {group.driveFolderId ? (
                      <a href={`https://drive.google.com/drive/folders/${group.driveFolderId}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 font-bold truncate max-w-[150px] bg-blue-50 px-2 py-1 rounded-md">
                        {dict.groups.openDrive}
                      </a>
                    ) : (
                      <span className="text-slate-400 font-medium">Not created</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-200/60 pb-3">
                    <span className="text-slate-500">{dict.groups.filesSaved}</span>
                    <span className="text-slate-800 font-bold text-base">{group.fileCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-200/60 pb-3">
                    <span className="text-slate-500">{dict.groups.storageUsed}</span>
                    <span className="text-slate-800 font-bold text-base">{formatBytes(group.totalSize)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-1">
                    <span className="text-slate-500">{dict.groups.lastActivity}</span>
                    <span className="text-slate-600 font-medium">{new Date(group.updatedAt).toLocaleDateString()}</span>
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
