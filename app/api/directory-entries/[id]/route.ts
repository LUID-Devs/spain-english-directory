import { NextResponse } from 'next/server';
import { DirectoryEntry } from '@/models';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const entryId = Number.parseInt(id, 10);

    if (Number.isNaN(entryId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid listing id.' },
        { status: 400 }
      );
    }

    const entry = await DirectoryEntry.findByPk(entryId, { raw: true });

    if (!entry) {
      return NextResponse.json(
        { success: false, error: 'Listing not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error('Failed to load directory entry:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to load listing.' },
      { status: 500 }
    );
  }
}
