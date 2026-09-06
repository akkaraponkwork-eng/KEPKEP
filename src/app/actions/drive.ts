'use server';

import { db } from '@/lib/db/client';
import { admins, oauthTokens } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';

export async function disconnectDrive() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    await db.delete(oauthTokens).where(eq(oauthTokens.adminId, session.adminId));
    revalidatePath('/dashboard/settings');
    return { success: true };
  } catch (error) {
    console.error('Error disconnecting drive:', error);
    return { success: false, error: 'Failed to disconnect' };
  }
}

export async function updateRootFolder(folderName: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  if (!folderName.trim()) {
    return { success: false, error: 'Folder name cannot be empty' };
  }

  try {
    await db.update(admins)
      .set({ driveRootFolder: folderName.trim() })
      .where(eq(admins.id, session.adminId));
      
    revalidatePath('/dashboard/settings');
    return { success: true };
  } catch (error) {
    console.error('Error updating root folder:', error);
    return { success: false, error: 'Failed to update folder name' };
  }
}
