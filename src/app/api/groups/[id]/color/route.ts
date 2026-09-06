export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/client';
import { groups, groupAdmins } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !session.adminId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await params;
    const groupId = parseInt(id, 10);
    if (isNaN(groupId)) {
      return new NextResponse('Invalid Group ID', { status: 400 });
    }

    const body = await req.json();
    const { color } = body;

    if (!color || typeof color !== 'string') {
      return new NextResponse('Invalid color', { status: 400 });
    }

    // Verify admin has access to this group
    const links = await db.select().from(groupAdmins).where(
      and(eq(groupAdmins.adminId, session.adminId), eq(groupAdmins.groupId, groupId))
    ).limit(1);

    if (links.length === 0) {
      return new NextResponse('Unauthorized for this group', { status: 403 });
    }

    // Update group color
    await db.update(groups).set({ color, updatedAt: new Date() }).where(eq(groups.id, groupId));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Update group color error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
