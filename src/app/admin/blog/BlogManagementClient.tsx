'use client';

import { createBlogPost, updateBlogPost, toggleBlogPostSelection, deleteBlogPost } from '@/lib/actions';
import { ExternalLink, Star, Trash2, Pencil, Calendar, Link as LinkIcon, Image as ImageIcon, Plus } from 'lucide-react';
import { useState } from 'react';

// Client Component to handle "Edit" state
export default function BlogManagementClient({ posts }: { posts: any[] }) {
    const [editingPost, setEditingPost] = useState<any | null>(null);

    async function handleSubmit(formData: FormData) {
        if (editingPost) {
            // Update
            formData.append('id', editingPost.id);
            const res = await updateBlogPost(formData);
            if (res.success) {
                setEditingPost(null);
                // Reset form manually or rely on re-render. 
                // Since this is a simple form, we can just clear state.
                const form = document.querySelector('form') as HTMLFormElement;
                if (form) form.reset();
            } else {
                alert(res.message);
            }
        } else {
            // Create
            const res = await createBlogPost(formData);
            if (res.success) {
                const form = document.querySelector('form') as HTMLFormElement;
                if (form) form.reset();
            } else {
                alert(res.message);
            }
        }
    }

    return (
        <div className="space-y-8">
            {/* Form Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-stone-800 font-serif flex items-center gap-2">
                        {editingPost ? (
                            <>
                                <Pencil size={20} className="text-stone-500" />
                                게시물 수정
                            </>
                        ) : (
                            <>
                                <Plus size={20} className="text-stone-500" />
                                새 게시물 등록
                            </>
                        )}
                    </h2>
                    {editingPost && (
                        <button
                            onClick={() => {
                                setEditingPost(null);
                                const form = document.querySelector('form') as HTMLFormElement;
                                if (form) form.reset();
                            }}
                            className="text-sm text-stone-500 hover:text-stone-800 underline"
                        >
                            등록 모드로 전환
                        </button>
                    )}
                </div>

                <form action={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5">제목</label>
                            <input
                                name="title"
                                required
                                defaultValue={editingPost?.title || ''}
                                key={editingPost?.id ? `title-${editingPost.id}` : 'title-new'}
                                className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition-all font-medium placeholder:text-stone-300"
                                placeholder="블로그 게시물 제목을 입력하세요"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1.5">카테고리</label>
                            <input
                                name="category"
                                defaultValue={editingPost?.category || ''}
                                key={editingPost?.id ? `cat-${editingPost.id}` : 'cat-new'}
                                className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all placeholder:text-stone-300"
                                placeholder="예: 사주이야기, 작명후기"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1.5">게시일</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-3 text-stone-400" />
                                <input
                                    name="publishedDate"
                                    type="date"
                                    defaultValue={editingPost?.publishedDate || ''}
                                    key={editingPost?.id ? `date-${editingPost.id}` : 'date-new'}
                                    className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all text-stone-600"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1.5">블로그 링크 (URL)</label>
                            <div className="relative">
                                <LinkIcon size={18} className="absolute left-3 top-3 text-stone-400" />
                                <input
                                    name="contentUrl"
                                    required
                                    defaultValue={editingPost?.contentUrl || ''}
                                    key={editingPost?.id ? `url-${editingPost.id}` : 'url-new'}
                                    className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all placeholder:text-stone-300 text-sm"
                                    placeholder="https://blog.naver.com/..."
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1.5">썸네일 이미지 URL</label>
                            <div className="relative">
                                <ImageIcon size={18} className="absolute left-3 top-3 text-stone-400" />
                                <input
                                    name="thumbnailUrl"
                                    defaultValue={editingPost?.thumbnailUrl || ''}
                                    key={editingPost?.id ? `thumb-${editingPost.id}` : 'thumb-new'}
                                    className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all placeholder:text-stone-300 text-sm"
                                    placeholder="이미지 주소"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1.5">내용 요약</label>
                        <textarea
                            name="summary"
                            rows={3}
                            defaultValue={editingPost?.summary || ''}
                            key={editingPost?.id ? `sum-${editingPost.id}` : 'sum-new'}
                            className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all placeholder:text-stone-300 resize-none"
                            placeholder="메인 페이지에 보여질 짧은 요약글을 작성해주세요."
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        {editingPost && (
                            <button
                                type="button"
                                onClick={() => setEditingPost(null)}
                                className="px-5 py-2.5 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors font-medium text-sm"
                            >
                                취소
                            </button>
                        )}
                        <button
                            type="submit"
                            className={`px-8 py-2.5 text-white rounded-lg transition-all font-medium shadow-md hover:shadow-lg transform active:scale-95 text-sm
                                ${editingPost ? 'bg-amber-700 hover:bg-amber-800' : 'bg-stone-800 hover:bg-stone-900'}
                            `}
                        >
                            {editingPost ? '수정 완료' : '게시물 등록'}
                        </button>
                    </div>
                </form>
            </div>

            {/* List Section */}
            <div>
                <h2 className="text-xl font-bold text-stone-800 mb-4 font-serif flex items-center gap-2">
                    등록된 게시물
                    <span className="text-sm font-normal text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full ml-1">
                        {posts.length}
                    </span>
                </h2>
                {posts.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-stone-200 text-center">
                        <p className="text-stone-400 mb-2">등록된 게시물이 없습니다.</p>
                        <p className="text-sm text-stone-300">새로운 게시물을 등록하여 도원 이야기를 채워보세요.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {posts.map((post: any) => (
                            <div
                                key={post.id}
                                className={`bg-white p-4 rounded-xl shadow-sm border transition-all duration-200 flex gap-4 group
                                    ${editingPost?.id === post.id ? 'border-amber-400 ring-2 ring-amber-100' : 'border-stone-200 hover:border-stone-300'}
                                `}
                            >
                                <div className="w-24 h-24 flex-shrink-0 bg-stone-100 rounded-lg overflow-hidden border border-stone-100">
                                    {post.thumbnailUrl ? (
                                        <img src={post.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                                            <ImageIcon size={20} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="font-bold text-stone-800 text-lg truncate pr-2">{post.title}</h3>
                                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <form action={async () => {
                                                await toggleBlogPostSelection(post.id);
                                            }}>
                                                <button
                                                    className={`p-1.5 rounded transition-colors ${post.isSelected ? 'text-amber-500 bg-amber-50' : 'text-stone-300 hover:text-stone-500 hover:bg-stone-50'}`}
                                                    title={post.isSelected ? "메인 노출 중" : "메인 노출 하기"}
                                                >
                                                    <Star size={16} fill={post.isSelected ? "currentColor" : "none"} />
                                                </button>
                                            </form>
                                            <button
                                                onClick={() => {
                                                    setEditingPost(post);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded transition-colors"
                                                title="수정"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <form action={async () => {
                                                if (confirm('정말 삭제하시겠습니까?')) {
                                                    await deleteBlogPost(post.id);
                                                    if (editingPost?.id === post.id) setEditingPost(null);
                                                }
                                            }}>
                                                <button className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="삭제">
                                                    <Trash2 size={16} />
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                    <div className="text-xs text-stone-500 mb-2 flex items-center gap-2">
                                        <span className={`px-1.5 py-0.5 rounded ${post.category ? 'bg-stone-100 text-stone-600' : 'text-stone-400'}`}>
                                            {post.category || '카테고리 없음'}
                                        </span>
                                        <span className="text-stone-300">|</span>
                                        <span>{post.publishedDate || '날짜 없음'}</span>
                                    </div>
                                    <p className="text-sm text-stone-600 line-clamp-2 mb-auto leading-relaxed text-xs">{post.summary}</p>

                                    <div className="mt-2 pt-2 border-t border-stone-50 flex justify-end">
                                        <a
                                            href={post.contentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors"
                                        >
                                            <ExternalLink size={12} />
                                            블로그 보기
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
