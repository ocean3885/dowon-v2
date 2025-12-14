import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { Jimp } from 'jimp';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const db = await getDb();

        // 1. Ensure Category "일주론" exists
        let category = await db.get('SELECT * FROM categories WHERE name = "일주론"');
        if (!category) {
            const result = await db.run(
                'INSERT INTO categories (name, displayOrder, postLimit, isActive) VALUES (?, ?, ?, ?)',
                '일주론', 10, 60, 1
            );
            category = { id: result.lastID };
        }

        const sourceDir = path.join(process.cwd(), 'posting/iljuron');
        const imgSourceDir = path.join(sourceDir, 'img');
        const publicUploadDir = path.join(process.cwd(), 'public/uploads/iljuron');

        // Create upload directory
        await fs.mkdir(publicUploadDir, { recursive: true });

        // 2. Read HTML files
        const files = await fs.readdir(sourceDir);
        const htmlFiles = files.filter(f => f.endsWith('.html'));

        let count = 0;

        for (const file of htmlFiles) {
            // Filename format: "1. 갑자(甲子) 일주.html"
            const title = file.replace('.html', '');

            // Check if post already exists to avoid duplicates (optional, but good)
            const existing = await db.get('SELECT id FROM posts WHERE title = ? AND categoryId = ?', title, category.id);
            if (existing) continue;

            const content = await fs.readFile(path.join(sourceDir, file), 'utf-8');

            // Extract Korean name for image matching (e.g., "갑자" from "1. 갑자...")
            // Regex: Start with number, dot, space, capture Hangul, maybe followed by parens
            const nameMatch = title.match(/^\d+\.\s*([가-힣]+)/);
            const koreanName = nameMatch ? nameMatch[1] : null;

            let imageUrl = null;
            let thumbnailUrl = null;

            if (koreanName) {
                // Look for image: koreanname.png
                const imgFilename = `${koreanName}.png`;
                const imgPath = path.join(imgSourceDir, imgFilename);

                if (existsSync(imgPath)) {
                    const destFilename = `${Date.now()}_${koreanName}.png`;
                    const destPath = path.join(publicUploadDir, destFilename);
                    const thumbFilename = `thumb_${destFilename}`;
                    const thumbPath = path.join(publicUploadDir, thumbFilename);

                    // Copy original
                    await fs.copyFile(imgPath, destPath);

                    // Create thumbnail using Jimp
                    const image = await Jimp.read(imgPath);
                    await image
                        .cover({ w: 300, h: 200 })
                        .write(thumbPath as any);

                    imageUrl = `/uploads/iljuron/${destFilename}`;
                    thumbnailUrl = `/uploads/iljuron/${thumbFilename}`;
                }
            }

            // Insert Post
            await db.run(
                `INSERT INTO posts (categoryId, title, content, author, viewCount, imageUrl, thumbnailUrl, publishedAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                category.id,
                title,
                content,
                '관리자',
                0,
                imageUrl,
                thumbnailUrl
            );

            count++;
        }

        revalidatePath('/board');
        revalidatePath('/admin/board');
        revalidatePath('/admin/board/categories');

        return NextResponse.json({ success: true, count });

    } catch (error) {
        console.error('Import error:', error);
        return NextResponse.json({ error: 'Import failed' }, { status: 500 });
    }
}
