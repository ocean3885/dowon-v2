'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Category = {
    id: number;
    name: string;
};

type BoardPost = {
    id: number;
    categoryId: number | null;
    title: string;
    content: string;
    author: string | null;
    imageUrl: string | null;
    thumbnailUrl: string | null;
};

type BoardPostFormProps = {
    categories: Category[];
    mode: 'create' | 'edit';
    post?: BoardPost;
};

export default function BoardPostForm({ categories, mode, post }: BoardPostFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        categoryId: post?.categoryId ? String(post.categoryId) : categories[0] ? String(categories[0].id) : '',
        title: post?.title || '',
        content: post?.content || '',
        author: post?.author || '관리자',
        imageUrl: post?.imageUrl || '',
        thumbnailUrl: post?.thumbnailUrl || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = formData.imageUrl;
            let thumbnailUrl = formData.thumbnailUrl;

            if (file) {
                const uploadData = new FormData();
                uploadData.append('file', file);

                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadData,
                });

                if (!uploadResponse.ok) {
                    throw new Error('Image upload failed');
                }

                const uploadResult = await uploadResponse.json();
                imageUrl = uploadResult.url;
                thumbnailUrl = uploadResult.thumbnailUrl;
            }

            const endpoint = mode === 'edit' && post ? `/api/posts/${post.id}` : '/api/posts';
            const method = mode === 'edit' ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    categoryId: formData.categoryId,
                    title: formData.title,
                    content: formData.content,
                    author: formData.author,
                    imageUrl,
                    thumbnailUrl,
                }),
            });

            if (!response.ok) {
                throw new Error(mode === 'edit' ? 'Post update failed' : 'Post creation failed');
            }

            alert(mode === 'edit' ? '게시글이 수정되었습니다.' : '게시글이 등록되었습니다.');
            router.push('/admin/board');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">카테고리</label>
                    <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                    >
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">작성자</label>
                    <input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-bold text-stone-700 mb-2">제목</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-bold text-stone-700 mb-2">대표 이미지</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200"
                />
                {formData.imageUrl && !file && (
                    <p className="mt-2 text-xs text-stone-500">현재 이미지가 유지됩니다.</p>
                )}
            </div>

            <div className="mb-8">
                <label className="block text-sm font-bold text-stone-700 mb-2">내용</label>
                <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={15}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-serif"
                    required
                ></textarea>
            </div>

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 border border-stone-300 text-stone-600 font-bold rounded-lg hover:bg-stone-50 transition-colors"
                >
                    취소
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                    {loading ? (mode === 'edit' ? '수정 중...' : '등록 중...') : (mode === 'edit' ? '게시글 수정' : '게시글 등록')}
                </button>
            </div>
        </form>
    );
}