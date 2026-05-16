import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { revalidatePath } from 'next/cache';
import { buildThumbnailUrl, createThumbnailFromFile, getPublicFilePath } from '@/lib/thumbnails';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createAdminClient();

        // 1. Ensure Category "일주론" exists
        let { data: category, error: catError } = await supabase
            .from('categories')
            .select('*')
            .eq('name', '일주론')
            .single();

        if (catError && catError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error('Error fetching category:', catError);
            throw new Error('Failed to fetch category');
        }

        if (!category) {
            const { data: newCat, error: insertCatError } = await supabase
                .from('categories')
                .insert({
                    name: '일주론',
                    display_order: 10,
                    post_limit: 60,
                    is_active: true
                })
                .select()
                .single();

            if (insertCatError) {
                console.error('Error creating category:', insertCatError);
                throw new Error('Failed to create category');
            }
            category = newCat;
        }

        const sourceDir = path.join(process.cwd(), 'posting/iljuron');
        const imgSourceDir = path.join(sourceDir, 'img');

        // 2. Read HTML files and sort them numerically
        const files = await fs.readdir(sourceDir);
        const htmlFiles = files
            .filter(f => f.endsWith('.html'))
            .sort((a, b) => {
                const numA = parseInt(a.split('.')[0]);
                const numB = parseInt(b.split('.')[0]);
                return numA - numB;
            });

        let count = 0;

        for (const file of htmlFiles) {
            const title = file.replace('.html', '');

            // Check if post already exists
            const { data: existing } = await supabase
                .from('posts')
                .select('id, image_url')
                .eq('title', title)
                .eq('category_id', category.id)
                .single();

            // If it exists and already has an image, skip
            if (existing && existing.image_url) continue;

            const content = await fs.readFile(path.join(sourceDir, file), 'utf-8');

            const nameMatch = title.match(/^\d+\.\s*([가-힣]+)/);
            const koreanName = nameMatch ? nameMatch[1] : null;

            let imageUrl = existing?.image_url || null;
            let thumbnailUrl = null;

            if (koreanName) {
                const imgFilename = `${koreanName}.png`;
                const imgPath = path.join(imgSourceDir, imgFilename);

                if (existsSync(imgPath)) {
                    const fileBuffer = await fs.readFile(imgPath);
                    const safeName = Math.random().toString(36).substring(2, 15);
                    const destFilename = `${Date.now()}_${safeName}.png`;
                    const storagePath = `iljuron/${destFilename}`;

                    // Upload to Supabase Storage (Bucket: 'langbridge')
                    const { data: uploadData, error: uploadError } = await supabase
                        .storage
                        .from('langbridge')
                        .upload(storagePath, fileBuffer, {
                            contentType: 'image/png',
                            upsert: true
                        });

                    if (uploadError) {
                        console.error(`Upload failed for ${imgFilename}:`, uploadError);
                    } else {
                        // Get Public URL
                        const { data: publicUrlData } = supabase
                            .storage
                            .from('langbridge')
                            .getPublicUrl(storagePath);
                        
                        imageUrl = publicUrlData.publicUrl;

                        // Thumbnail handling
                        try {
                            const tempLocalDir = path.join(process.cwd(), 'public/temp_thumbs');
                            await fs.mkdir(tempLocalDir, { recursive: true });
                            const tempThumbPath = path.join(tempLocalDir, `thumb_${destFilename}`);
                            
                            await createThumbnailFromFile(imgPath, tempThumbPath);
                            const thumbBuffer = await fs.readFile(tempThumbPath);
                            const thumbStoragePath = `iljuron/thumbs/thumb_${destFilename}`;

                            const { error: thumbUploadError } = await supabase
                                .storage
                                .from('langbridge')
                                .upload(thumbStoragePath, thumbBuffer, {
                                    contentType: 'image/png',
                                    upsert: true
                                });

                            if (!thumbUploadError) {
                                const { data: thumbPublicUrlData } = supabase
                                    .storage
                                    .from('langbridge')
                                    .getPublicUrl(thumbStoragePath);
                                thumbnailUrl = thumbPublicUrlData.publicUrl;
                            }
                            
                            // Cleanup temp file
                            await fs.unlink(tempThumbPath);
                        } catch (thumbErr) {
                            console.error('Thumbnail generation/upload failed:', thumbErr);
                            thumbnailUrl = imageUrl;
                        }
                    }
                }
            }

            if (existing) {
                // Update Post
                const { error: postError } = await supabase
                    .from('posts')
                    .update({
                        content: content,
                        image_url: imageUrl,
                        thumbnail_url: thumbnailUrl
                    })
                    .eq('id', existing.id);

                if (postError) {
                    console.error(`Error updating post ${title}:`, postError);
                } else {
                    count++;
                }
            } else {
                // Insert Post into Supabase
                const { error: postError } = await supabase
                    .from('posts')
                    .insert({
                        category_id: category.id,
                        title: title,
                        content: content,
                        author: '관리자',
                        view_count: 0,
                        image_url: imageUrl,
                        thumbnail_url: thumbnailUrl
                    });

                if (postError) {
                    console.error(`Error inserting post ${title}:`, postError);
                } else {
                    count++;
                }
            }
        }

        revalidatePath('/');
        revalidatePath('/board');
        revalidatePath('/admin/board');

        return NextResponse.json({ success: true, count });

    } catch (error) {
        console.error('Import error:', error);
        return NextResponse.json({ error: 'Import failed' }, { status: 500 });
    }
}

