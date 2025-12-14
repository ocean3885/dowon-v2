import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    const db = await getDb();

    let query = `
    SELECT p.*, c.name as categoryName 
    FROM posts p 
    LEFT JOIN categories c ON p.categoryId = c.id
  `;
    const params = [];

    if (categoryId) {
        query += ' WHERE p.categoryId = ?';
        params.push(categoryId);
    }

    query += ' ORDER BY p.createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const posts = await db.all(query, ...params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM posts';
    const countParams = [];
    if (categoryId) {
        countQuery += ' WHERE categoryId = ?';
        countParams.push(categoryId);
    }
    const totalResult = await db.get(countQuery, ...countParams);

    return NextResponse.json({
        posts,
        pagination: {
            total: totalResult?.total || 0,
            page,
            limit,
            totalPages: Math.ceil((totalResult?.total || 0) / limit)
        }
    });
}

export async function POST(request: NextRequest) {
    const db = await getDb();
    const body = await request.json();
    const { categoryId, title, content, author, imageUrl, thumbnailUrl } = body;

    if (!title || !content || !categoryId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await db.run(
        `INSERT INTO posts (categoryId, title, content, author, imageUrl, thumbnailUrl, viewCount, publishedAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        categoryId, title, content, author, imageUrl, thumbnailUrl
    );

    return NextResponse.json({ id: result.lastID });
}
