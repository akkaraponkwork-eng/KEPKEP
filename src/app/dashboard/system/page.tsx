import { db } from '@/lib/db/client';
import { files, jobs, groups, feedbacks, admins } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SystemOverview() {
  const session = await getSession();
  const adminId = session?.adminId;

  if (!adminId) {
    redirect('/login');
  }

  const adminData = await db.select().from(admins).where(eq(admins.id, adminId)).limit(1);
  if (!adminData[0]?.isSuperAdmin) {
    redirect('/dashboard');
  }

  // Global Stats Queries
  const allFiles = await db.select().from(files);
  const filesProcessed = allFiles.filter(f => f.status === 'stored').length;
  const inQueue = allFiles.filter(f => f.status === 'downloading' || f.status === 'uploading' || f.status === 'received').length;
  const failedJobs = allFiles.filter(f => f.status === 'failed').length;
  const storageBytes = allFiles.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
  const storageGB = (storageBytes / (1024 * 1024 * 1024)).toFixed(2);

  // Recent feedbacks
  const recentFeedbacks = await db.select().from(feedbacks).orderBy(desc(feedbacks.createdAt)).limit(5);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden flex flex-col justify-center shadow-lg min-h-[160px] md:min-h-[140px]">
        <div className="relative z-10 md:w-3/4">
          <h2 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2 tracking-wide uppercase">
            System Monitor
          </h2>
          <p className="text-slate-300 font-medium text-sm md:text-base">
            Global status and metrics across all tenants.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <p className="text-sm text-slate-500 font-medium">Global Storage</p>
          <h3 className="text-2xl font-bold text-slate-900">{storageGB} GB</h3>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-slate-500 font-medium">Total Files Stored</p>
          <h3 className="text-2xl font-bold text-slate-900">{filesProcessed}</h3>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-slate-500 font-medium">Active Queue</p>
          <h3 className="text-2xl font-bold text-amber-600">{inQueue}</h3>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-slate-500 font-medium">Failed Jobs</p>
          <h3 className="text-2xl font-bold text-red-600">{failedJobs}</h3>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-lg font-bold">Recent Feedbacks</h3>
           <Link href="/dashboard/system/feedbacks" className="text-sm text-blue-600 hover:underline">View All</Link>
        </div>
        {recentFeedbacks.length === 0 ? (
          <p className="text-slate-500">No feedbacks yet.</p>
        ) : (
          <ul className="space-y-4">
            {recentFeedbacks.map(fb => (
              <li key={fb.id} className="border-b pb-2">
                <p className="font-medium">{fb.message}</p>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>From: {fb.contact || 'Anonymous'}</span>
                  <span className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${fb.status === 'new' ? 'bg-blue-100 text-blue-700' : fb.status === 'read' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'}`}>
                       {fb.status}
                    </span>
                    {new Date(fb.createdAt).toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
