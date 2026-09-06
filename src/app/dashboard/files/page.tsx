import { getDictionary } from '@/i18n/getDictionary';
import { db } from '@/lib/db/client';
import { files, groups } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { Folder } from 'lucide-react';
import Link from 'next/link';

import FolderCard from './FolderCard';
import { EmptyState } from '@/components/ui/EmptyState';

export const dynamic = 'force-dynamic';

export default async function FilesPage() {
  const { dict } = await getDictionary();

  // Fetch groups with file count and total size
  const groupStats = await db
    .select({
      id: groups.id,
      name: groups.name,
      fileCount: sql<number>`count(${files.id})`,
      totalSize: sql<number>`sum(${files.sizeBytes})`,
      color: groups.color,
    })
    .from(groups)
    .leftJoin(files, eq(groups.id, files.groupId))
    .groupBy(groups.id, groups.name, groups.color);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">{dict.sidebar.files}</h1>
          <p className="text-slate-500 font-medium">{dict.files.desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
        {groupStats.length === 0 ? (
          <div className="col-span-full">
            <EmptyState 
              icon={Folder}
              title={dict.files.emptyTitle}
              description={dict.files.emptyDesc}
              action={
                <Link href="/dashboard/groups" className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                  {dict.files.viewGroups}
                </Link>
              }
            />
          </div>
        ) : (
          groupStats.map((group) => {
            return (
              <FolderCard 
                key={group.id} 
                group={{
                  id: group.id,
                  name: group.name,
                  fileCount: Number(group.fileCount) || 0,
                  totalSize: Number(group.totalSize) || 0,
                  color: group.color || 'blue',
                }}
                dict={dict}
              />
            )
          })
        )}
      </div>
    </div>
  );
}
