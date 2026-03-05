import { NextResponse } from 'next/server';
import { initDb, Claim, DirectoryEntry } from '@/lib/initDb';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    await initDb();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const whereClause = status && status !== 'all' ? { status } : undefined;

    const claims = await Claim.findAll({
      where: whereClause,
      include: [
        {
          model: DirectoryEntry,
          as: 'directoryEntry',
          attributes: ['id', 'name', 'category', 'city'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json({ success: true, claims });
  } catch (error) {
    console.error('Failed to list claims:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to list claims.' },
      { status: 500 }
    );
  }
}
