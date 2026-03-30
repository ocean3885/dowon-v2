import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Sanitize filename to avoid issues
        const filename = Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

        // Ensure directories exist
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        await mkdir(uploadDir, { recursive: true });

        const originalPath = path.join(uploadDir, filename);
        // Save original
        await writeFile(originalPath, buffer);

        return NextResponse.json({
            url: `/uploads/${filename}`,
            thumbnailUrl: `/uploads/${filename}`
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
