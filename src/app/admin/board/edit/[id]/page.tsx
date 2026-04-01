import BoardPostForm from '@/components/admin/BoardPostForm';
import { getDb } from '@/lib/db';
import { notFound } from 'next/navigation';

async function getCategories() {
    const db = await getDb();
    return db.all('SELECT id, name FROM categories WHERE isActive = 1 ORDER BY displayOrder ASC, id ASC');
}

async function getPost(id: string) {
    const db = await getDb();
    return db.get('SELECT id, categoryId, title, content, author, imageUrl, thumbnailUrl FROM posts WHERE id = ?', id);
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