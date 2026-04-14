import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const param = await params;
    const id = param.id;

    const db = await getDb();

    // Increment view count
    await db.run('UPDATE posts SET viewCount = viewCount + 1 WHERE id = ?', id);

    const post = await db.get(
        `SELECT p.*, c.name as categoryName 
     FROM posts p 
     LEFT JOIN categories c ON p.categoryId = c.id 
     WHERE p.id = ?`,
        id
    );

    if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const param = await params;
    const id = param.id;
    const body = await request.json();
    const { categoryId, title, content, author, imageUrl, thumbnailUrl } = body;
    const db = await getDb();

    const updates = [];
    const values = [];

    if (categoryId) { updates.push('categoryId = ?'); values.push(categoryId); }
    if (title) { updates.push('title = ?'); values.push(title); }
    if (content) { updates.push('content = ?'); values.push(content); }
    if (author) { updates.push('author = ?'); values.push(author); }
    if (imageUrl !== undefined) { updates.push('imageUrl = ?'); values.push(imageUrl); }
    if (thumbnailUrl !== undefined) { updates.push('thumbnailUrl = ?'); values.push(thumbnailUrl); }

    updates.push('updatedAt = CURRENT_TIMESTAMP');

    values.push(id);

    await db.run(
        `UPDATE posts SET ${updates.join(', ')} WHERE id = ?`,
        ...values
    );

    revalidatePath('/');
    revalidatePath('/board');
    revalidatePath('/admin/board');
    revalidatePath(`/board/post/${id}`);

    return NextResponse.json({ success: true });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const param = await params;
    const id = param.id;
    const db = await getDb();

    // Fetch the post before deleting to get its images
    const post = await db.get('SELECT * FROM posts WHERE id = ?', id);
    
    if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Delete from DB
    await db.run('DELETE FROM posts WHERE id = ?', id);

    // Delete image files using fs
    try {
        const { unlink } = await import('fs/promises');
        const path = await import('path');
        const urlsToDelete = new Set<string>();

        if (post.imageUrl) urlsToDelete.add(post.imageUrl);
        if (post.thumbnailUrl) urlsToDelete.add(post.thumbnailUrl);

        if (post.content) {
            const imgRegex = /<img[^>]+src="([^">]+)"/g;
            let match;
            while ((match = imgRegex.exec(post.content)) !== null) {
                if (match[1]) urlsToDelete.add(match[1]);
            }
        }

        const publicDir = path.join(process.cwd(), 'public');

        for (const rawUrl of Array.from(urlsToDelete)) {
            let parsedUrl = rawUrl;
            try {
                if (rawUrl.startsWith('http')) {
                    const u = new URL(rawUrl);
                    parsedUrl = u.pathname;
                }
            } catch (e) {}

            const url = decodeURIComponent(parsedUrl);

            // Ensure we are only deleting local upload files
            if (url.startsWith('/uploads/')) {
                const filePath = path.join(publicDir, url);
                try {
                    await unlink(filePath);
                } catch (e: any) {
                    console.error('Failed to delete image file:', filePath, e.message);
                }
                
                // Cleanup automatically generated thumbnails for this image as well
                try {
                    const parsed = path.posix.parse(url);
                    const directory = parsed.dir === '/' ? '' : parsed.dir;
                    const thumbUrl = `${directory}/${parsed.name}_thumb.jpg`;
                    const thumbPath = path.join(publicDir, thumbUrl);
                    await unlink(thumbPath);
                } catch (e) {
                    // Ignore errors for thumbnails not found
                }
            }
        }
    } catch (err) {
        console.error('Error running image deletion logic:', err);
    }

    revalidatePath('/');
    revalidatePath('/board');
    revalidatePath('/admin/board');
    revalidatePath(`/board/post/${id}`);

    return NextResponse.json({ success: true });
}
