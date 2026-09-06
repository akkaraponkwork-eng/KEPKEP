import { Users, Search, Filter, MoreVertical, ShieldAlert, FolderOpen } from 'lucide-react';
import { getDictionary } from '@/i18n/getDictionary';
import { db } from '@/lib/db/client';
import { groups, groupAdmins, files } from '@/lib/db/schema';
import { eq, inArray, desc, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import GroupCard from './GroupCard';
import { EmptyState } from '@/components/ui/EmptyState';

export const dynamic = 'force-dynamic';

export default async function GroupsPage() {
  const session = await getSession();
  const adminId = session?.adminId;

  if (!adminId) {
    redirect('/login');
  }

  const { dict } = await getDictionary();

  // Fetch groups
  const adminGroupsData = await db.select({
    id: groups.id,
    name: groups.name,
    status: groups.status,
    driveFolderId: groups.driveFolderId,
    updatedAt: groups.updatedAt
  })
  .from(groups)
  .innerJoin(groupAdmins, eq(groups.id, groupAdmins.groupId))
  .where(eq(groupAdmins.adminId, adminId))
  .orderBy(desc(groups.updatedAt));

  // Fetch stats
  const statsMap: Record<number, { count: number, bytes: number }> = {};
  if (adminGroupsData.length > 0) {
    const groupStats = await db.select({
      groupId: files.groupId,
      fileCount: sql<number>`count(${files.id})`.mapWith(Number),
      totalBytes: sql<number>`sum(${files.sizeBytes})`.mapWith(Number),
    })
    .from(files)
    .where(inArray(files.groupId, adminGroupsData.map(g => g.id)))
    .groupBy(files.groupId);

    for (const stat of groupStats) {
      statsMap[stat.groupId] = { count: stat.fileCount, bytes: stat.totalBytes || 0 };
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-1 md:mb-2">{dict.groups.title}</h1>
          <p className="text-sm md:text-base text-slate-500">{dict.groups.desc}</p>
        </div>
        <div className="flex w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={dict.groups.search} 
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-blue-500 w-full md:w-64 transition-colors shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {adminGroupsData.length === 0 ? (
          <div className="col-span-full">
            <EmptyState 
              icon={FolderOpen}
              title={dict.groups.emptyTitle}
              description={dict.groups.emptyDesc}
              action={
                <a href="/dashboard/settings" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  {dict.groups.goToSettings}
                </a>
              }
            />
          </div>
        ) : (
          adminGroupsData.map(group => {
            const stats = statsMap[group.id] || { count: 0, bytes: 0 };
            return (
              <GroupCard 
                key={group.id} 
                group={{
                  id: group.id,
                  name: group.name,
                  status: group.status,
                  driveFolderId: group.driveFolderId,
                  updatedAt: group.updatedAt,
                  fileCount: stats.count,
                  totalSize: stats.bytes
                }}
                dict={dict}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
