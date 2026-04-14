import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { readFile, stat } from 'fs/promises';
import { extname } from 'path';

const getContentType = (ext: string) => {
    const mimeTypes: Record<string, string> = {
        '.jpeg': 'image/jpeg',
        '.jpg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
    };
    return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
};

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: filePathArray } = await context.params;
        const filePath = path.join(process.cwd(), 'public', 'uploads', ...filePathArray);

        try {
            // Check if file exists
            await stat(filePath);
        } catch (e) {
            return new NextResponse('File not found', { status: 404 });
        }

        const fileBuffer = await readFile(filePath);
        const extension = extname(filePath);
        
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': getContentType(extension),
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
