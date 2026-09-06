import { HardDrive, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section skeleton */}
      <div className="flex justify-between items-end">
        <div>
          <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-slate-200 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Stats Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 animate-pulse flex items-center justify-center"></div>
              <div className="space-y-2">
                <div className="h-3 w-20 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-6 w-16 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Table skeleton */}
      <div className="glass-card overflow-hidden bg-white">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-8 w-24 bg-slate-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full bg-slate-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
