import { db } from '@/lib/db/client';
import { files, groups } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import FileViewer from '@/app/dashboard/files/[groupId]/FileViewer';
import { getSession } from '@/lib/auth/session';
import { cookies } from 'next/headers';
import { EncryptionService } from '@/lib/auth/encryption';
import { redirect } from 'next/navigation';
import { HardDrive } from 'lucide-react';

export default async function SharedPage({ params }: { params: { groupId: string } }) {
  const groupId = parseInt(params.groupId, 10);
  if (isNaN(groupId)) {
    return <div className="p-8 text-center text-red-500">Invalid Group ID</div>;
  }

  // 1. Verify Authentication
  let isAuthorized = false;

  // Check Admin first
  const adminSession = await getSession();
  if (adminSession && adminSession.adminId) {
    // Ideally check if admin has access to this group, but for simplicity we assume admin can view if they have the link
    // or we strictly check groupAdmins.
    isAuthorized = true; 
  }

  // Check End User
  if (!isAuthorized) {
    const cookieStore = await cookies();
    const userSessionStr = cookieStore.get('line_user_session')?.value;
    if (userSessionStr) {
      try {
        const decrypted = EncryptionService.decrypt(userSessionStr);
        const userSession = JSON.parse(decrypted);
        if (userSession.groupId === groupId && userSession.exp > Date.now()) {
          isAuthorized = true;
        }
      } catch (e) {
        // Invalid session
      }
    }
  }

  if (!isAuthorized) {
    // Redirect to LINE Login
    redirect(`/api/auth/line-user/login?groupId=${groupId}`);
  }

  // 2. Fetch Group Info
  const groupRows = await db.select().from(groups).where(eq(groups.id, groupId));
  const group = groupRows[0];
  if (!group) {
    return <div className="p-8 text-center">Group not found</div>;
  }

  // 3. Fetch Files
  const groupFiles = await db.select({
    id: files.id,
    originalFilename: files.originalFilename,
    status: files.status,
    createdAt: files.createdAt,
    fileSize: files.sizeBytes,
    driveFileId: files.driveFileId,
    mimeType: files.mimeType,
  })
  .from(files)
  .where(eq(files.groupId, groupId))
  .orderBy(desc(files.createdAt));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      <div className="w-full max-w-5xl bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="px-4 py-4 md:px-8 md:py-6 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <HardDrive className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-800 line-clamp-1">{group.name || 'Shared Files'}</h1>
              <p className="text-xs md:text-sm text-slate-500">LINE Group Vault</p>
            </div>
          </div>
          <div className="text-xs md:text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            {groupFiles.length} files
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-5xl p-4 md:p-8">
        <FileViewer 
          files={groupFiles} 
          locale="th" 
          dict={{ dashboard: { colFileName: 'ชื่อไฟล์', colStatus: 'สถานะ', colTime: 'เวลา', completed: 'เสร็จสิ้น', inQueue: 'กำลังโหลด' } }} 
        />
      </div>
    </div>
  );
}
