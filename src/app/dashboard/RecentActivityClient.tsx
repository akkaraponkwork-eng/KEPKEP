"use client";

import { useState } from 'react';
import { HardDrive, ExternalLink, Printer, Share2, X, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import Link from 'next/link';

type RecentFile = {
  id: number;
  originalFilename: string | null;
  status: string;
  createdAt: Date | null;
  groupName: string | null;
  driveFileId: string | null;
  mimeType?: string | null;
};

export default function RecentActivityClient({ recentFiles, dict }: { recentFiles: RecentFile[], dict: any }) {
  const [selectedFile, setSelectedFile] = useState<RecentFile | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const isImage = (mime: string | null | undefined) => mime?.startsWith('image/');
  const isPdf = (mime: string | null | undefined) => mime === 'application/pdf';
  
  const getFileUrl = (file: RecentFile) => `/api/files/${file.id}`;

  const handleShare = async (file: RecentFile) => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const res = await fetch(getFileUrl(file));
      const blob = await res.blob();
      const filename = file.originalFilename || `file-${file.id}`;
      
      const fileObj = new File([blob], filename, { type: file.mimeType || 'application/octet-stream' });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [fileObj] })) {
        await navigator.share({ files: [fileObj], title: filename });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Share failed', err);
      alert(dict.dashboard.shareError);
    } finally {
      setIsSharing(false);
    }
  };

  const handlePrint = (file: RecentFile) => {
    const printWindow = window.open(getFileUrl(file), '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <>
      <div className="glass-card overflow-hidden bg-white">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">{dict.dashboard.recentActivity}</h2>
          <Link href="/dashboard/files" className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 font-bold bg-blue-50 px-3 py-1.5 rounded-xl">
            {dict.dashboard.viewAll} <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-3 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{dict.dashboard.colFileName}</th>
                <th className="hidden md:table-cell px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{dict.dashboard.colGroup}</th>
                <th className="px-3 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{dict.dashboard.colStatus}</th>
                <th className="hidden sm:table-cell px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{dict.dashboard.colTime}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentFiles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-2 shadow-inner border border-slate-100">
                        <HardDrive className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-base font-medium text-slate-600">{dict.dashboard.emptyActivity}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentFiles.map((file) => {
                  let statusBadge = null;
                  if (file.status === 'stored') {
                    statusBadge = (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#10B981] text-white shadow-sm">
                        {dict.dashboard.completed}
                      </span>
                    );
                  } else if (file.status === 'failed') {
                    statusBadge = (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
                        {dict.dashboard.failed}
                      </span>
                    );
                  } else {
                    statusBadge = (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
                        {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                      </span>
                    );
                  }

                  const isImg = isImage(file.mimeType);
                  const isPdfFile = isPdf(file.mimeType);

                  return (
                    <tr key={file.id} className="border-b border-slate-50 last:border-0 group">
                      <td className="px-3 md:px-6 py-4 text-sm font-medium">
                        {file.driveFileId ? (
                          <button 
                            onClick={() => setSelectedFile(file)}
                            className="text-slate-800 hover:text-blue-600 cursor-pointer text-left truncate max-w-[200px]"
                          >
                            {file.originalFilename || `File #${file.id}`}
                          </button>
                        ) : (
                          <span className="text-slate-800">{file.originalFilename || `File #${file.id}`}</span>
                        )}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 text-sm text-slate-500">{file.groupName || dict.dashboard.directMessage}</td>
                      <td className="px-3 md:px-6 py-4">{statusBadge}</td>
                      <td className="hidden sm:table-cell px-6 py-4 text-sm text-slate-500" suppressHydrationWarning>
                        {new Date(file.createdAt || '').toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedFile && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-200"
          onClick={() => setSelectedFile(null)}
        >
          <div 
            className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-slate-900/80 to-transparent flex items-center justify-between px-4 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-white text-sm font-medium truncate max-w-[200px] md:max-w-md px-2 opacity-80">
              {selectedFile.originalFilename || `File #${selectedFile.id}`}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handlePrint(selectedFile)}
                className="w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                title="Print"
              >
                <Printer className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button 
                onClick={() => handleShare(selectedFile)}
                disabled={isSharing}
                className="w-10 h-10 md:w-12 md:h-12 bg-blue-600/80 hover:bg-blue-500 active:bg-blue-400 rounded-full flex items-center justify-center text-white transition-colors"
                title="Share"
              >
                <Share2 className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <div className="w-px h-6 bg-white/20 mx-1"></div>
              <button 
                className="w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 active:bg-rose-500/50 rounded-full flex items-center justify-center text-white transition-colors"
                onClick={() => setSelectedFile(null)}
                title="Close"
              >
                <X className="w-6 h-6 md:w-7 md:h-7" />
              </button>
            </div>
          </div>
          
          <div 
            className="w-full h-full pt-16 pb-4 px-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {isImage(selectedFile.mimeType) ? (
              <img 
                src={getFileUrl(selectedFile)} 
                alt="Preview" 
                className="max-w-full max-h-full object-contain rounded shadow-2xl animate-in zoom-in-95 duration-300" 
              />
            ) : isPdf(selectedFile.mimeType) ? (
              <iframe 
                src={getFileUrl(selectedFile)} 
                className="w-full h-full max-w-5xl bg-white rounded shadow-2xl animate-in zoom-in-95 duration-300"
                title="PDF Preview"
              />
            ) : (
              <div className="bg-white p-12 rounded-xl shadow-2xl max-w-md w-full text-center flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                <FileIcon className="w-16 h-16 text-blue-500 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">{selectedFile.originalFilename}</h3>
                <p className="text-sm text-slate-500 mb-6">{dict.dashboard.filePreviewUnsupported}</p>
                <div className="flex gap-3">
                  <a href={getFileUrl(selectedFile)} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm transition-colors">
                    {dict.dashboard.download}
                  </a>
                  <button onClick={() => handleShare(selectedFile)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-bold text-sm transition-colors">
                    {dict.dashboard.share}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
