import { NextResponse } from 'next/server';
import { initDb, Claim, DirectoryEntry } from '@/lib/initDb';

interface CreateClaimBody {
  directoryEntryId?: number;
  name?: string;
  email?: string;
  phone?: string;
  documentUrl?: string;
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    await initDb();

    const body = (await request.json()) as CreateClaimBody;
    const directoryEntryId = Number(body.directoryEntryId);
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim();
    const documentUrl = body.documentUrl?.trim() || null;

    if (!directoryEntryId || !name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    const entry = await DirectoryEntry.findByPk(directoryEntryId);
    if (!entry) {
      return NextResponse.json(
        { success: false, error: 'Directory entry not found.' },
        { status: 404 }
      );
    }

    if (entry.isVerified) {
      return NextResponse.json(
        { success: false, error: 'This listing has already been claimed.' },
        { status: 409 }
      );
    }

    const claim = await Claim.create({
      directoryEntryId,
      name,
      email,
      phone,
      documentUrl,
      verificationCode: generateVerificationCode(),
      status: 'pending',
    });

    return NextResponse.json({ success: true, claimId: claim.id });
  } catch (error) {
    console.error('Failed to create claim:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to create claim.' },
      { status: 500 }
    );
  }
}
