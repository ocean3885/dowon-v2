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

async function deleteLocalImages(urls: (string | null | undefined)[]) {
    try {
        const { unlink } = await import('fs/promises');
        const path = await import('path');
        const publicDir = path.join(process.cwd(), 'public');

        const uniqueUrls = new Set<string>();
        for (const u of urls) {
            if (u && typeof u === 'string') uniqueUrls.add(u);
        }

        for (const rawUrl of Array.from(uniqueUrls)) {
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
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const param = await params;
    const id = param.id;
    const body = await request.json();
    const { categoryId, title, content, author, imageUrl, thumbnailUrl, deleteMainImage, deletedImageUrls } = body;
    const supabase = await createClient();

    // 1. 기존 게시글 조회 (대표 이미지 교체 또는 삭제 시 이전 물리 파일 정리용)
    const { data: existingPost } = await supabase
        .from('posts')
        .select('image_url, thumbnail_url, content')
        .eq('id', id)
        .single();

    const updates: Record<string, string | number | null> = {};

    if (categoryId) updates.category_id = Number(categoryId);
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (author) updates.author = author;

    const filesToDelete: (string | null | undefined)[] = [];

    // 대표 이미지 삭제 처리 또는 새 이미지로 교체된 경우
    if (deleteMainImage) {
        updates.image_url = null;
        updates.thumbnail_url = null;
        if (existingPost?.image_url) filesToDelete.push(existingPost.image_url);
        if (existingPost?.thumbnail_url) filesToDelete.push(existingPost.thumbnail_url);
    } else if (imageUrl !== undefined) {
        updates.image_url = imageUrl;
        if (thumbnailUrl !== undefined) updates.thumbnail_url = thumbnailUrl;

        // 새 이미지로 교체된 경우 기존 이전 파일 삭제
        if (existingPost?.image_url && existingPost.image_url !== imageUrl) {
            filesToDelete.push(existingPost.image_url);
        }
        if (existingPost?.thumbnail_url && existingPost.thumbnail_url !== thumbnailUrl) {
            filesToDelete.push(existingPost.thumbnail_url);
        }
    }

    // 명시적으로 삭제 요청된 본문 첨부 이미지들
    if (Array.isArray(deletedImageUrls) && deletedImageUrls.length > 0) {
        filesToDelete.push(...deletedImageUrls);
    }

    updates.updated_at = new Date().toISOString();

    const { error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 물리적 파일 삭제 수행
    if (filesToDelete.length > 0) {
        await deleteLocalImages(filesToDelete);
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

    // Delete image files using helper
    const urlsToDelete: string[] = [];
    if (post.image_url) urlsToDelete.push(post.image_url);
    if (post.thumbnail_url) urlsToDelete.push(post.thumbnail_url);

    if (post.content) {
        const imgRegex = /<img[^>]+src="([^">]+)"/g;
        let match;
        while ((match = imgRegex.exec(post.content)) !== null) {
            if (match[1]) urlsToDelete.push(match[1]);
        }
    }

    await deleteLocalImages(urlsToDelete);

    revalidatePath('/');
    revalidatePath('/board');
    revalidatePath('/admin/board');
    revalidatePath(`/board/post/${id}`);

    return NextResponse.json({ success: true });
}
