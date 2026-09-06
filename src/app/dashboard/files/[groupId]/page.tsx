import { getDictionary } from '@/i18n/getDictionary';
import { db } from '@/lib/db/client';
import { files, groups } from '@/lib/db/schema';
import { eq, desc, and, ilike } from 'drizzle-orm';
import { FileText } from 'lucide-react';
import SearchInput from './SearchInput';
import FileViewer from './FileViewer';
import BackButton from './BackButton';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function GroupFilesPage({ params, searchParams }: PageProps) {
  const { dict, locale } = await getDictionary();
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const groupId = parseInt(resolvedParams.groupId);
  const q = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : '';

  // Check if group exists
  const groupData = await db
    .select({ name: groups.name })
    .from(groups)
    .where(eq(groups.id, groupId))
    .limit(1);
    
  const groupName = groupData[0]?.name || `${dict.files.group} #${groupId}`;

  // Build conditions
  const conditions = [eq(files.groupId, groupId)];
  if (q) {
    conditions.push(ilike(files.originalFilename, `%${q}%`));
  }

  // Fetch files for this group
  const groupFiles = await db
    .select({
      id: files.id,
      originalFilename: files.originalFilename,
      status: files.status,
      createdAt: files.createdAt,
      fileSize: files.sizeBytes,
      driveFileId: files.driveFileId,
      mimeType: files.mimeType,
    })
    .from(files)
    .where(and(...conditions))
    .orderBy(desc(files.createdAt));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Breadcrumb and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col">
          <BackButton dict={dict} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span className="text-slate-400 font-normal">{dict.files.folderLabel}:</span> {groupName}
          </h1>
        </div>
        
        <SearchInput dict={dict} />
      </div>

      <FileViewer files={groupFiles} locale={locale} dict={dict} q={q} />
    </div>
  );
}
