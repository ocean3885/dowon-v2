import BoardPostForm from '@/components/admin/BoardPostForm';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

async function getCategories() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('id', { ascending: true });

    if (error) throw error;
    return data || [];
}

async function getPost(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('posts')
        .select('id, category_id, title, content, author, image_url, thumbnail_url')
        .eq('id', id)
        .single();

    if (error || !data) return null;

    return {
        id: data.id,
        categoryId: data.category_id,
        title: data.title,
        content: data.content,
        author: data.author,
        imageUrl: data.image_url,
        thumbnailUrl: data.thumbnail_url,
    };
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [categories, post] = await Promise.all([getCategories(), getPost(id)]);

    if (!post) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-stone-800 mb-6">게시글 수정</h2>
            <BoardPostForm categories={categories} mode="edit" post={post} />
        </div>
    );
}
