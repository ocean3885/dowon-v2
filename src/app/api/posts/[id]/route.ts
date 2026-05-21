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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const param = await params;
    const id = param.id;

    const supabase = await createClient();

    await supabase.rpc('increment_post_view', { post_id: Number(id) });

    const { data, error } = await supabase
        .from('posts')
        .select('*, categories(name)')
        .eq('id', id)
        .single();

    if (error || !data) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(mapPost(data as PostRow));
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const param = await params;
    const id = param.id;
    const body = await request.json();
    const { categoryId, title, content, author, imageUrl, thumbnailUrl } = body;
    const supabase = await createClient();

    const updates: Record<string, string | number | null> = {};

    if (categoryId) updates.category_id = Number(categoryId);
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (author) updates.author = author;
    if (imageUrl !== undefined) updates.image_url = imageUrl;
    if (thumbnailUrl !== undefined) updates.thumbnail_url = thumbnailUrl;

    updates.updated_at = new Date().toISOString();

    const { error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

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
    const supabase = await createClient();

    const { data: post, error: getError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();
    
    if (getError || !post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

    if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Delete image files using fs
    try {
        const { unlink } = await import('fs/promises');
        const path = await import('path');
        const urlsToDelete = new Set<string>();

        if (post.image_url) urlsToDelete.add(post.image_url);
        if (post.thumbnail_url) urlsToDelete.add(post.thumbnail_url);

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
            } catch {}

            const url = decodeURIComponent(parsedUrl);

            // Ensure we are only deleting local upload files
            if (url.startsWith('/uploads/')) {
                const filePath = path.join(publicDir, url);
                try {
                    await unlink(filePath);
                } catch (e: unknown) {
                    const message = e instanceof Error ? e.message : String(e);
                    console.error('Failed to delete image file:', filePath, message);
                }
                
                // Cleanup automatically generated thumbnails for this image as well
                try {
                    const parsed = path.posix.parse(url);
                    const directory = parsed.dir === '/' ? '' : parsed.dir;
                    const thumbUrl = `${directory}/${parsed.name}_thumb.jpg`;
                    const thumbPath = path.join(publicDir, thumbUrl);
                    await unlink(thumbPath);
                } catch {
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
