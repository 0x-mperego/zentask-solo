import { mkdir, writeFile } from 'fs/promises';
import { type NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json(
      { success: false, error: 'No file provided.' },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = join(process.cwd(), 'public/uploads');
  const path = join(uploadDir, file.name);

  try {
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path, buffer);
    console.log(`File saved to ${path}`);

    const fileUrl = `/uploads/${file.name}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Error saving file:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: `Failed to save file: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to save file.' },
      { status: 500 }
    );
  }
}
