import BoardPostForm from '@/components/admin/BoardPostForm';
import { getDb } from '@/lib/db';

async function getCategories() {
    const db = await getDb();
    return db.all('SELECT id, name FROM categories WHERE isActive = 1 ORDER BY displayOrder ASC, id ASC');
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
