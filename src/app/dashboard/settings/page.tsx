import { SiGoogledrive } from 'react-icons/si';
import { TbBrandOnedrive } from 'react-icons/tb';
import { getDictionary } from '@/i18n/getDictionary';
import { db } from '@/lib/db/client';
import { oauthTokens, admins } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import SettingCard from './SettingCard';
import AddDriveCard from './AddDriveCard';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const { dict } = await getDictionary();

  // Check Google Drive connection status and admin settings
  const [tokenRecord, adminRecord] = await Promise.all([
    db.select().from(oauthTokens).where(eq(oauthTokens.adminId, session.adminId)).limit(1),
    db.select({ driveRootFolder: admins.driveRootFolder, workspaceName: admins.workspaceName }).from(admins).where(eq(admins.id, session.adminId)).limit(1)
  ]);
  
  const isDriveConnected = tokenRecord.length > 0;
  const admin = adminRecord[0];
  const rootFolderName = admin?.driveRootFolder || admin?.workspaceName || 'Linedrive';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">{dict.settings.title}</h1>
        <p className="text-slate-500 font-medium">{dict.settings.desc}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 pt-4">
        
        {isDriveConnected && (
          <SettingCard 
            props={{
              id: 'google',
              title: dict.settings.googleDrive,
              descPrimary: dict.settings.driveDescPrimary,
              descUnused: dict.settings.driveDescUnused,
              isConnected: isDriveConnected,
              statusReady: dict.settings.statusReady,
              statusWaiting: dict.settings.statusWaiting,
              folderLabel: dict.settings.folderLabel,
              folderValue: rootFolderName,
              scopeLabel: dict.settings.scopeLabel,
              scopeValue: 'drive.file',
              actionLabel: dict.settings.manageConnection,
              actionUrl: '/api/auth/google/login',
              icon: <SiGoogledrive />,
              theme: 'blue',
              dict: dict,
              statusLabel: dict.settings.statusLabel,
            }} 
          />
        )}

        <AddDriveCard dict={dict} />

      </div>
    </div>
  );
}
