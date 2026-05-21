import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

type PostRow = {
    id: number;
    category_id: number | null;
    title: string;
    content: string;
    author: string | null;
    view_count: number | null;
    image_url: string | null;
    thumbnail_url: string | null;
    published_at: string | null;
    updated_at: string | null;
    categories?: { name?: string | null } | null;
};

function mapPost(row: PostRow) {
    return {
        ...row,
        categoryId: row.category_id,
        categoryName: row.categories?.name,
        viewCount: row.view_count ?? 0,
        imageUrl: row.image_url,
        thumbnailUrl: row.thumbnail_url,
        publishedAt: row.published_at,
        updatedAt: row.updated_at,
    };
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = await createClient();

    let query = supabase
        .from('posts')
        .select('*, categories(name)', { count: 'exact' });
    
    if (categoryId) {
        query = query.eq('category_id', categoryId);
    }

    const { data, count, error } = await query
        .order('published_at', { ascending: false })
        .order('id', { ascending: false })
        .range(from, to);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        posts: ((data || []) as PostRow[]).map(mapPost),
        pagination: {
            total: count || 0,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit)
        }
    });
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const body = await request.json();
    const { categoryId, title, content, author, imageUrl, thumbnailUrl } = body;

    if (!title || !content || !categoryId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('posts')
        .insert({
            category_id: categoryId,
            title,
            content,
            author,
            image_url: imageUrl,
            thumbnail_url: thumbnailUrl,
            view_count: 0,
        })
        .select('id')
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/');
    revalidatePath('/board');
    revalidatePath('/admin/board');

    return NextResponse.json({ id: data.id });
}
