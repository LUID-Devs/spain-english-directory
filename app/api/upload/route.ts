import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

// POST /api/upload - Upload a document
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, JPEG, and PNG are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = randomBytes(8).toString('hex');
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomString}.${extension}`;

    // Save to public/uploads
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadPath = join(process.cwd(), 'public', 'uploads', filename);
    
    await writeFile(uploadPath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
      filename: file.name,
    });

  } catch (error) {
    console.error('Failed to upload file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Configure for large file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};
