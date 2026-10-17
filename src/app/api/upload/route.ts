import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { createThumbnailBuffer } from '@/lib/thumbnails';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const safeName = (file.name || 'image.jpg').replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${safeName}`;
        const originalStoragePath = `board/${filename}`;

        const supabase = await createAdminClient();

        // 1. Upload original file to Supabase Storage ('public-assets' bucket)
        const contentType = file.type || 'image/jpeg';
        const { error: uploadError } = await supabase.storage
            .from('public-assets')
            .upload(originalStoragePath, buffer, {
                contentType,
                upsert: true,
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 });
        }

        const { data: publicUrlData } = supabase.storage
            .from('public-assets')
            .getPublicUrl(originalStoragePath);

        const url = publicUrlData.publicUrl;
        let thumbnailUrl = url;

        // 2. Generate and upload thumbnail
        try {
            const thumbBuffer = await createThumbnailBuffer(buffer);
            const thumbStoragePath = `board/thumbs/thumb_${filename.replace(/\.[^/.]+$/, '')}.jpg`;

            const { error: thumbUploadError } = await supabase.storage
                .from('public-assets')
                .upload(thumbStoragePath, thumbBuffer, {
                    contentType: 'image/jpeg',
                    upsert: true,
                });

            if (!thumbUploadError) {
                const { data: thumbPublicUrlData } = supabase.storage
                    .from('public-assets')
                    .getPublicUrl(thumbStoragePath);
                thumbnailUrl = thumbPublicUrlData.publicUrl;
            } else {
                console.warn('Thumbnail upload warning:', thumbUploadError);
            }
        } catch (thumbError) {
            console.error('Thumbnail generation failed:', thumbError);
            thumbnailUrl = url;
        }

        return NextResponse.json({
            url,
            thumbnailUrl,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

