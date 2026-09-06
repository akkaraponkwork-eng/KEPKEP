export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { feedbacks } from '@/lib/db/schema';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, contact } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const result = await db.insert(feedbacks).values({
      message,
      contact,
    }).returning();

    return NextResponse.json({ success: true, feedback: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
