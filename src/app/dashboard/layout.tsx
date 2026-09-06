import { ReactNode } from 'react';
import { getDictionary } from '@/i18n/getDictionary';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/client';
import { admins } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import DashboardLayoutClient from './DashboardLayoutClient';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { dict, locale } = await getDictionary();
  
  const session = await getSession();
  let adminName = 'Admin';
  let isSuperAdmin = false;
  let workspaceName = '';
  let pictureUrl = '';
  
  if (session?.adminId) {
    const adminData = await db.select().from(admins).where(eq(admins.id, session.adminId)).limit(1);
    
    if (adminData[0]) {
      if (!adminData[0].workspaceName) {
        redirect('/onboarding/workspace');
      }
      adminName = adminData[0].displayName || adminData[0].name || session.email;
      isSuperAdmin = adminData[0].isSuperAdmin || false;
      workspaceName = adminData[0].workspaceName;
      pictureUrl = adminData[0].pictureUrl || '';
    }
  }

  return (
    <DashboardLayoutClient 
      dict={dict} 
      locale={locale} 
      adminName={adminName} 
      isSuperAdmin={isSuperAdmin}
      workspaceName={workspaceName}
      pictureUrl={pictureUrl}
    >
      {children}
    </DashboardLayoutClient>
  );
}
