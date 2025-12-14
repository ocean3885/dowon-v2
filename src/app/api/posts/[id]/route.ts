import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

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

    return NextResponse.json({ success: true });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const param = await params;
    const id = param.id;
    const db = await getDb();

    await db.run('DELETE FROM posts WHERE id = ?', id);

    return NextResponse.json({ success: true });
}
