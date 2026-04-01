import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { buildThumbnailUrl, createThumbnailFromBuffer, getPublicFilePath } from '@/lib/thumbnails';

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

        const url = `/uploads/${filename}`;
        let thumbnailUrl = url;

        try {
            thumbnailUrl = buildThumbnailUrl(url);
            await createThumbnailFromBuffer(buffer, getPublicFilePath(thumbnailUrl));
        } catch (thumbnailError) {
            console.error('Thumbnail generation failed:', thumbnailError);
            thumbnailUrl = url;
        }

        return NextResponse.json({
            url,
            thumbnailUrl
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
