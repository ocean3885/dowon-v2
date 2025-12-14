import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    const db = await getDb();
    const categories = await db.all('SELECT * FROM categories WHERE isActive = 1 ORDER BY displayOrder ASC');
    return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
    const db = await getDb();
    const { name, displayOrder, postLimit } = await request.json();

    if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const result = await db.run(
        'INSERT INTO categories (name, displayOrder, postLimit) VALUES (?, ?, ?)',
        name,
        displayOrder || 0,
        postLimit || 5
    );

    return NextResponse.json({ id: result.lastID, name, displayOrder, postLimit });
}

export async function PUT(request: NextRequest) {
    const db = await getDb();
    const { id, name, displayOrder, postLimit, isActive } = await request.json();

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Build dynamic update query
    const updates = [];
    const start = [];

    if (name !== undefined) { updates.push('name = ?'); start.push(name); }
    if (displayOrder !== undefined) { updates.push('displayOrder = ?'); start.push(displayOrder); }
    if (postLimit !== undefined) { updates.push('postLimit = ?'); start.push(postLimit); }
    if (isActive !== undefined) { updates.push('isActive = ?'); start.push(isActive); }

    if (updates.length === 0) {
        return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    start.push(id); // for WHERE clause

    await db.run(
        `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
        ...start
    );

    return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
    const db = await getDb();
    const { id } = await request.json();

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Check if posts exist
    const postCount = await db.get('SELECT COUNT(*) as count FROM posts WHERE categoryId = ?', id);
    if (postCount && postCount.count > 0) {
        return NextResponse.json({ error: 'Cannot delete category with existing posts' }, { status: 400 });
    }

    await db.run('DELETE FROM categories WHERE id = ?', id);

    return NextResponse.json({ success: true });
}
