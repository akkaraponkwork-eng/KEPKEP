"use client";

import { useState } from 'react';
import { FileText, LayoutGrid, List, Image as ImageIcon, ExternalLink, X, File as FileIcon, Share2, Printer, AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type FileItem = {
  id: number;
  originalFilename: string | null;
  status: string;
  createdAt: Date | null;
  fileSize: number | null;
  driveFileId: string | null;
  mimeType: string | null;
};

type FileViewerProps = {
  files: FileItem[];
  locale?: string;
  dict?: any;
  q?: string;
};

export default function FileViewer({ files, locale = 'th', dict = { dashboard: { colFileName: 'ชื่อไฟล์', colStatus: 'สถานะ', colTime: 'เวลา', completed: 'เสร็จสิ้น', inQueue: 'กำลังโหลด' } }, q = '' }: FileViewerProps) {
  const [viewMode, setViewMode] = useState<'list' | 'gallery'>('list');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Helper to determine if a file is an image or PDF
  const isImage = (mime: string | null) => mime?.startsWith('image/');
  const isPdf = (mime: string | null) => mime === 'application/pdf';
  
  // Use our proxy API
  const getFileUrl = (file: FileItem) => `/api/files/${file.id}`;

  const handleShare = async (file: FileItem) => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const res = await fetch(getFileUrl(file));
      const blob = await res.blob();
      const filename = file.originalFilename || `file-${file.id}`;
      
      const fileObj = new File([blob], filename, { type: file.mimeType || 'application/octet-stream' });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [fileObj] })) {
        await navigator.share({
          files: [fileObj],
          title: filename,
        });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Share failed', err);
      alert(dict.files.shareError);
    } finally {
      setIsSharing(false);
    }
  };

  const handlePrint = (file: FileItem) => {
    // Standard way to print a document via URL
    const printWindow = window.open(getFileUrl(file), '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <div className="space-y-4">
      {/* View Toggles */}
      <div className="flex justify-end gap-2">
        <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 shadow-inner border border-slate-200">
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('gallery')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'gallery' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            title="Gallery View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {files.length === 0 ? (
        <EmptyState 
          icon={FileText}
          title={q ? `${dict.files.noFilesFound} "${q}"` : dict.files.noFilesInGroup}
          description={q ? dict.files.tryOtherSearch : dict.files.filesFromLine}
        />
      ) : (
        <>
          {viewMode === 'list' ? (
            /* LIST VIEW */
            <div className="glass-card overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-3 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{dict?.dashboard?.colFileName || 'File'}</th>
                      <th className="hidden sm:table-cell px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">{dict.files.fileSize}</th>
                      <th className="px-3 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{dict?.dashboard?.colStatus || 'Status'}</th>
                      <th className="hidden md:table-cell px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{dict?.dashboard?.colTime || 'Time'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {files.map((file) => {
                      let statusBadge = null;
                      if (file.status === 'stored') {
                        statusBadge = (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#10B981] text-white shadow-sm">
                            {dict?.dashboard?.completed || 'Completed'}
                          </span>
                        );
                      } else if (file.status === 'failed' || file.status === 'dead_letter' || file.status === 'blocked') {
                        statusBadge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-red-500 text-white shadow-sm" title={file.status}>
                            <AlertTriangle className="w-3 h-3" />
                            Failed
                          </span>
                        );
                      } else {
                        statusBadge = (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-[#F59E0B] text-white shadow-sm">
                            <LoadingSpinner size="sm" className="text-white border-white border-t-transparent" />
                            {dict?.dashboard?.inQueue || 'Loading'}
                          </span>
                        );
                      }

                      const sizeStr = file.fileSize ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB` : '-';
                      const isImg = isImage(file.mimeType);
                      const isPdfFile = isPdf(file.mimeType);

                      return (
                        <tr key={file.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-3 md:px-6 py-4 text-sm font-medium flex items-center gap-3">
                            <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${isImg ? 'bg-purple-50 text-purple-600' : isPdfFile ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                              {isImg ? <ImageIcon className="w-4 h-4" /> : isPdfFile ? <FileIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                            </div>
                            {file.driveFileId ? (
                                <button 
                                  onClick={() => setSelectedFile(file)}
                                  className="truncate max-w-[200px] sm:max-w-[300px] text-slate-800 hover:text-slate-600 cursor-pointer text-left"
                                  title="ดูรายละเอียดไฟล์"
                                >
                                  {file.originalFilename || `File #${file.id}`}
                                </button>
                            ) : (
                              <span className="truncate max-w-[200px] sm:max-w-[300px] text-slate-800">{file.originalFilename || `File #${file.id}`}</span>
                            )}
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 text-sm text-slate-500 text-right">{sizeStr}</td>
                          <td className="px-3 md:px-6 py-4">{statusBadge}</td>
                          <td className="hidden md:table-cell px-6 py-4 text-sm text-slate-400">
                            {file.createdAt 
                              ? new Date(file.createdAt).toLocaleString(locale === 'th' ? 'th-TH' : 'en-US', { 
                                  dateStyle: 'medium', 
                                  timeStyle: 'short' 
                                })
                              : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* GALLERY VIEW */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {files.map((file) => {
                const isImg = isImage(file.mimeType);
                const isPdfFile = isPdf(file.mimeType);
                const hasLink = !!file.driveFileId;
                const sizeStr = file.fileSize ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB` : '-';
                
                return (
                  <div key={file.id} className="glass-card flex flex-col overflow-hidden group/item border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all bg-white relative">
                    <div className="aspect-square bg-slate-50 border-b border-slate-100 flex items-center justify-center relative overflow-hidden">
                      {hasLink ? (
                        <button 
                          className="w-full h-full p-0 m-0 relative flex items-center justify-center group/link"
                          onClick={() => setSelectedFile(file)}
                        >
                          {isImg ? (
                            <img 
                              src={getFileUrl(file)} 
                              alt={file.originalFilename || ''}
                              className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : isPdfFile ? (
                            <FileIcon className="w-16 h-16 text-rose-300 group-hover/item:text-rose-500 transition-colors group-hover/item:scale-110 duration-500" />
                          ) : (
                            <FileText className="w-12 h-12 text-slate-300 group-hover/link:text-blue-500 transition-colors" />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/5 transition-colors"></div>
                          
                          <div className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-md shadow-sm border border-slate-100 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <ExternalLink className="w-3 h-3 text-slate-600" />
                          </div>
                        </button>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center relative">
                          <FileText className="w-12 h-12 text-slate-300" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-2 left-2 flex gap-1">
                        {file.status === 'stored' ? (
                          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm border border-white"></div>
                        ) : file.status === 'failed' || file.status === 'dead_letter' || file.status === 'blocked' ? (
                          <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm border border-white"></div>
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm border border-white animate-pulse"></div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <p className="text-sm font-bold text-slate-800 truncate" title={file.originalFilename || ''}>
                        {file.originalFilename || `File #${file.id}`}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs font-mono text-slate-400">{sizeStr}</span>
                        <span className="text-[10px] text-slate-400 uppercase">{file.mimeType?.split('/')[1] || 'FILE'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Lightbox Modal (Mobile-First UX) */}
      {selectedFile && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-200"
          onClick={() => setSelectedFile(null)}
        >
          {/* Mobile-friendly Toolbar */}
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
          
          {/* Content Area */}
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
                <p className="text-sm text-slate-500 mb-6">{dict.files.filePreviewUnsupported}</p>
                <div className="flex gap-3">
                  <a href={getFileUrl(selectedFile)} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm transition-colors">
                    {dict.files.download}
                  </a>
                  <button onClick={() => handleShare(selectedFile)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-bold text-sm transition-colors">
                    {dict.files.share}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
