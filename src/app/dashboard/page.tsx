import { HardDrive, CheckCircle, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { db } from '@/lib/db/client';
import { files, jobs, groups, oauthTokens, groupAdmins, admins } from '@/lib/db/schema';
import { sql, eq, inArray, desc, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getDictionary } from '@/i18n/getDictionary';
import RecentActivityClient from './RecentActivityClient';

export const dynamic = 'force-dynamic'; // Ensure we don't aggressively cache the dashboard

export default async function DashboardOverview() {
  const session = await getSession();
  const adminId = session?.adminId;

  if (!adminId) {
    redirect('/login');
  }

  const { dict } = await getDictionary();

  // Tenant Isolation: Get groups for this admin
  const adminGroups = await db.select({ groupId: groupAdmins.groupId }).from(groupAdmins).where(eq(groupAdmins.adminId, adminId));
  const adminGroupIds = adminGroups.map(g => g.groupId);

  const adminData = await db.select().from(admins).where(eq(admins.id, adminId)).limit(1);
  const adminName = adminData[0]?.name || session.email;

  let filesProcessed = 0;
  let inQueue = 0;
  let failedJobs = 0;
  let storageGB = "0.00";
  let recentFiles: any[] = [];

  if (adminGroupIds.length > 0) {
    // 1. Stats Queries
    const stats = await db.select().from(files).where(inArray(files.groupId, adminGroupIds));
    filesProcessed = stats.filter(f => f.status === 'stored').length;
    inQueue = stats.filter(f => f.status === 'downloading' || f.status === 'uploading').length;
    failedJobs = stats.filter(f => f.status === 'failed').length;
    const storageBytes = stats.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
    storageGB = (storageBytes / (1024 * 1024 * 1024)).toFixed(2);

    // 2. Recent Activity
    recentFiles = await db.select({
      id: files.id,
      originalFilename: files.originalFilename,
      status: files.status,
      createdAt: files.createdAt,
      groupName: groups.name,
      driveFileId: files.driveFileId,
    })
    .from(files)
    .leftJoin(groups, eq(files.groupId, groups.id))
    .where(inArray(files.groupId, adminGroupIds))
    .orderBy(desc(files.createdAt))
    .limit(5);
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Header section / Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden flex flex-col justify-center shadow-lg min-h-[160px] md:min-h-[140px]">
        <div className="relative z-10 md:w-3/4">
          <h2 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2 tracking-wide uppercase">
            {dict.dashboard.greeting} {adminName}
          </h2>
          <p className="text-blue-100 font-medium text-sm md:text-base">
            {dict.dashboard.bannerDesc}
          </p>
        </div>
        
        {/* Mascot Image (Circle) */}
        <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-xl bg-blue-500">
            <img 
              src="/mascot.jpg" 
              alt="Linedrive Mascot" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group cursor-default">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100 shrink-0">
              <HardDrive className="w-6 h-6" />
            </div>
            <div className="w-full">
              <p className="text-sm text-slate-500 font-medium mb-0.5">{dict.dashboard.storageUsed}</p>
              <div className="flex items-baseline gap-1 mb-2">
                <h3 className="text-xl font-bold text-slate-900">{storageGB}</h3>
                <span className="text-xs font-semibold text-slate-400">/ 15 GB</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (parseFloat(storageGB) / 15) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group cursor-default">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{dict.dashboard.filesProcessed}</p>
              <h3 className="text-2xl font-bold text-slate-900">{filesProcessed}</h3>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group cursor-default">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm border border-amber-100">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{dict.dashboard.inQueue}</p>
              <h3 className="text-2xl font-bold text-slate-900">{inQueue}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <RecentActivityClient recentFiles={recentFiles} dict={dict} />
      
    </div>
  );
}
