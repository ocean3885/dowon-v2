import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

type CategoryRow = {
    id: number;
    name: string;
    display_order: number | null;
    post_limit: number | null;
    is_active: boolean | null;
    created_at?: string | null;
};

function mapCategory(row: CategoryRow) {
    return {
        id: row.id,
        name: row.name,
        displayOrder: row.display_order ?? 0,
        postLimit: row.post_limit ?? 5,
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
    };
}

export async function GET() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('categories')
        .select('id, name, display_order, post_limit, is_active, created_at')
        .order('display_order', { ascending: true })
        .order('id', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json((data || []).map(mapCategory));
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { name, displayOrder, postLimit } = await request.json();

    if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('categories')
        .insert({
            name,
            display_order: displayOrder || 0,
            post_limit: postLimit || 5,
            is_active: true,
        })
        .select('id, name, display_order, post_limit, is_active, created_at')
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/board');
    revalidatePath('/admin/board');
    revalidatePath('/admin/board/categories');
    return NextResponse.json(mapCategory(data));
}

export async function PUT(request: NextRequest) {
    const supabase = await createClient();
    const { id, name, displayOrder, postLimit, isActive } = await request.json();

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updates: Record<string, string | number | boolean> = {};

    if (name !== undefined) updates.name = name;
    if (displayOrder !== undefined) updates.display_order = displayOrder;
    if (postLimit !== undefined) updates.post_limit = postLimit;
    if (isActive !== undefined) updates.is_active = Boolean(isActive);

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/board');
    revalidatePath('/admin/board');
    revalidatePath('/admin/board/categories');
    return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
    const supabase = await createClient();
    const { id } = await request.json();

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { count, error: countError } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', id);

    if (countError) {
        return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    if ((count || 0) > 0) {
        return NextResponse.json({ error: 'Cannot delete category with existing posts' }, { status: 400 });
    }

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/board');
    revalidatePath('/admin/board');
    revalidatePath('/admin/board/categories');
    return NextResponse.json({ success: true });
}
