import BoardPostForm from '@/components/admin/BoardPostForm';
import { createClient } from '@/utils/supabase/server';

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

export default async function CreatePostPage() {
    const categories = await getCategories();

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-stone-800 mb-6">게시글 작성</h2>
            <BoardPostForm categories={categories} mode="create" />
        </div>
    );
}
