import { db } from '@/lib/db/client';
import { feedbacks, admins } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { MessageSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function FeedbacksPage() {
  const session = await getSession();
  const adminId = session?.adminId;

  if (!adminId) {
    redirect('/login');
  }

  const adminData = await db.select().from(admins).where(eq(admins.id, adminId)).limit(1);
  if (!adminData[0]?.isSuperAdmin) {
    redirect('/dashboard');
  }

  const allFeedbacks = await db.select().from(feedbacks).orderBy(desc(feedbacks.createdAt));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Feedbacks</h1>
          <p className="text-sm text-slate-500">Monitor and review feedback from users.</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/50 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Message</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <MessageSquare className="w-8 h-8 text-slate-300" />
                      <p>No feedback received yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                allFeedbacks.map((fb) => (
                  <tr key={fb.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">#{fb.id}</td>
                    <td className="px-6 py-4 max-w-md whitespace-normal">{fb.message}</td>
                    <td className="px-6 py-4">{fb.contact || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${fb.status === 'new' ? 'bg-blue-100 text-blue-700' : ''}
                        ${fb.status === 'read' ? 'bg-slate-100 text-slate-600' : ''}
                        ${fb.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : ''}
                      `}>
                        {fb.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(fb.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
