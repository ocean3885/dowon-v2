import Link from 'next/link';
import { getDb } from '@/lib/db';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

async function getCategoryData(categoryId: string, page: number = 1) {
    const db = await getDb();
    const limit = 10;
    const offset = (page - 1) * limit;

    const category = await db.get('SELECT * FROM categories WHERE id = ?', categoryId);

    if (!category) return null;

    const posts = await db.all(
        `SELECT id, title, publishedAt, viewCount, author, thumbnailUrl 
     FROM posts 
     WHERE categoryId = ? 
     ORDER BY date(publishedAt) DESC, CAST(title AS INTEGER) ASC, title ASC 
     LIMIT ? OFFSET ?`,
        categoryId, limit, offset
    );

    const totalResult = await db.get('SELECT COUNT(*) as total FROM posts WHERE categoryId = ?', categoryId);
    const total = totalResult?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return { category, posts, total, totalPages, currentPage: page };
}

export default async function CategoryPage(
    { params, searchParams }: {
        params: Promise<{ categoryId: string }>,
        searchParams: Promise<{ page?: string }>
    }
) {
    const { categoryId } = await params;
    const { page } = await searchParams;
    const pageNum = parseInt(page || '1');

    const data = await getCategoryData(categoryId, pageNum);

    if (!data) {
        return <div className="pt-32 text-center">존재하지 않는 카테고리입니다.</div>;
    }

    const { category, posts, totalPages, currentPage } = data;

    return (
        <div className="pt-24 min-h-screen bg-stone-50 pb-20">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="mb-12 flex flex-col items-center py-6">
                    <Link href="/board" className="inline-flex items-center text-stone-500 hover:text-amber-700 mb-8 transition-colors text-sm group">
                        <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        게시판 목록으로 돌아가기
                    </Link>
                    <div className="relative inline-block px-8 pb-4">
                        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-12 h-12 border-t-2 border-r-2 border-amber-600/30 rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-12 h-12 border-b-2 border-l-2 border-amber-600/30 rounded-bl-xl"></div>
                        <h1 className="text-4xl md:text-5xl font-bold text-stone-800 relative z-10">
                            {category.name}
                        </h1>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-stone-100 overflow-hidden">
                    {posts.length > 0 ? (
                        <div className="divide-y divide-stone-100">
                            {posts.map((post: any) => (
                                <Link key={post.id} href={`/board/post/${post.id}`} className="block p-6 hover:bg-stone-50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 pr-4">
                                            <h3 className="text-lg font-medium text-stone-800 mb-2 group-hover:text-amber-700">
                                                {post.title}
                                            </h3>
                                            <div className="flex items-center text-sm text-stone-400 space-x-3">
                                                <span>{post.author || '관리자'}</span>
                                                <span>•</span>
                                                <span>{format(new Date(post.publishedAt), 'yyyy.MM.dd', { locale: ko })}</span>
                                                <span>•</span>
                                                <span>조회 {post.viewCount}</span>
                                            </div>
                                        </div>
                                        {post.thumbnailUrl && (
                                            <div className="w-20 h-20 bg-stone-100 rounded overflow-hidden flex-shrink-0">
                                                <img src={post.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-stone-400">
                            게시글이 없습니다.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8 space-x-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <Link
                                key={p}
                                href={`/board/${categoryId}?page=${p}`}
                                className={`px-4 py-2 rounded ${p === currentPage
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-white text-stone-600 hover:bg-stone-100'
                                    }`}
                            >
                                {p}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
