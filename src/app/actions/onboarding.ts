'use server';

import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/client';
import { admins } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function saveWorkspaceName(formData: FormData) {
  const session = await getSession();
  if (!session?.adminId) {
    throw new Error('Unauthorized');
  }

  const workspaceName = formData.get('workspaceName')?.toString().trim();
  
  if (!workspaceName) {
    throw new Error('Workspace name is required');
  }

  await db.update(admins)
    .set({ workspaceName })
    .where(eq(admins.id, session.adminId));

  return { success: true };
}
