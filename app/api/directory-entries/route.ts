import { NextResponse } from 'next/server';
import { DirectoryEntry } from '@/models';

export async function GET(): Promise<NextResponse> {
  try {
    const entries = await DirectoryEntry.findAll({
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json({ success: true, entries });
  } catch (error) {
    console.error('Failed to load directory entries:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to load directory entries.' },
      { status: 500 }
    );
  }
}
