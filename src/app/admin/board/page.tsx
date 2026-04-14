import Link from 'next/link';
import { getDb } from '@/lib/db';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import BulkImportButton from '@/components/admin/BulkImportButton';
import DeleteBoardPostButton from '@/components/admin/DeleteBoardPostButton';

export const dynamic = 'force-dynamic';

async function getAdminPosts(page: number, limit: number) {
    const db = await getDb();
    const offset = (page - 1) * limit;

    const [countResult, posts] = await Promise.all([
        db.get('SELECT COUNT(*) as count FROM posts'),
        db.all(`
            SELECT p.id, p.title, p.author, p.viewCount, p.publishedAt, c.name as categoryName 
            FROM posts p 
            LEFT JOIN categories c ON p.categoryId = c.id 
            ORDER BY p.publishedAt DESC
            LIMIT ? OFFSET ?
        `, [limit, offset])
    ]);

    return { posts, totalPosts: countResult?.count || 0 };
}

const getPageNumbers = (current: number, total: number) => {
    if (total === 0) return [1];
    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);
    
    if (end - start < 4) {
        if (start === 1) end = Math.min(total, 5);
        else if (end === total) start = Math.max(1, total - 4);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

export default async function AdminBoardPage(props: {
    searchParams?: Promise<{ page?: string }>;
}) {
    const searchParams = await props.searchParams;
    const currentPage = Number(searchParams?.page) || 1;
    const postsPerPage = 10;

    const { posts, totalPosts } = await getAdminPosts(currentPage, postsPerPage);
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    const pageNumbers = getPageNumbers(currentPage, totalPages);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-stone-800">게시글 관리</h2>
                <div className="flex gap-3">
                    <Link
                        href="/admin/board/categories"
                        className="px-4 py-2 bg-white border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors text-sm font-bold hidden sm:block"
                    >
                        카테고리 관리
                    </Link>
                    <div className="hidden sm:block">
                        <BulkImportButton />
                    </div>
                    <Link
                        href="/admin/board/create"
                        className="px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors text-sm font-bold"
                    >
                        게시글 작성
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-stone-50 border-b border-stone-200">
                            <tr>
                                <th className="px-6 py-3 font-medium text-stone-500 text-sm">ID</th>
                                <th className="px-6 py-3 font-medium text-stone-500 text-sm">카테고리</th>
                                <th className="px-6 py-3 font-medium text-stone-500 text-sm">제목</th>
                                <th className="px-6 py-3 font-medium text-stone-500 text-sm">작성자</th>
                                <th className="px-6 py-3 font-medium text-stone-500 text-sm">조회수</th>
                                <th className="px-6 py-3 font-medium text-stone-500 text-sm">작성일</th>
                                <th className="px-6 py-3 font-medium text-stone-500 text-sm text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {posts.map((post: any) => (
                                <tr key={post.id} className="hover:bg-stone-50">
                                    <td className="px-6 py-4 text-stone-500 text-sm">{post.id}</td>
                                    <td className="px-6 py-4 text-stone-600 text-sm">
                                        <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded text-xs">
                                            {post.categoryName}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-stone-800 font-medium">
                                        <Link href={`/board/post/${post.id}`} target="_blank" className="hover:underline">
                                            {post.title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-stone-600 text-sm">{post.author || '-'}</td>
                                    <td className="px-6 py-4 text-stone-600 text-sm">{post.viewCount}</td>
                                    <td className="px-6 py-4 text-stone-500 text-sm whitespace-nowrap">
                                        {format(new Date(post.publishedAt), 'yyyy-MM-dd', { locale: ko })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link
                                                href={`/admin/board/edit/${post.id}`}
                                                className="text-stone-600 hover:text-stone-900 text-sm font-medium"
                                            >
                                                수정
                                            </Link>
                                            <DeleteBoardPostButton id={post.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {posts.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-stone-400">
                                        등록된 게시글이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="block md:hidden">
                    {posts.map((post: any) => (
                        <div key={post.id} className="p-4 border-b border-stone-100 space-y-3">
                            <div className="flex justify-between items-start">
                                <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded text-xs">
                                    {post.categoryName}
                                </span>
                                <span className="text-stone-400 text-xs text-right">
                                    {format(new Date(post.publishedAt), 'yy-MM-dd', { locale: ko })}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-stone-800 font-medium text-sm leading-snug">
                                    <Link href={`/board/post/${post.id}`} target="_blank" className="hover:underline">
                                        {post.title}
                                    </Link>
                                </h3>
                                <div className="text-stone-500 text-xs mt-2 flex gap-3">
                                    <span>작성자: {post.author || '-'}</span>
                                    <span>조회수: {post.viewCount}</span>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 pt-2">
                                <Link
                                    href={`/admin/board/edit/${post.id}`}
                                    className="text-stone-600 hover:text-stone-900 text-sm font-medium"
                                >
                                    수정
                                </Link>
                                <DeleteBoardPostButton id={post.id} />
                            </div>
                        </div>
                    ))}
                    {posts.length === 0 && (
                        <div className="p-8 text-center text-stone-400 text-sm">
                            등록된 게시글이 없습니다.
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <div className="inline-flex gap-1">
                        {currentPage > 1 ? (
                            <Link
                                href={`/admin/board?page=${currentPage - 1}`}
                                className="px-3 py-1 border border-stone-200 text-stone-600 rounded bg-white hover:bg-stone-50 text-sm"
                            >
                                이전
                            </Link>
                        ) : (
                            <span className="px-3 py-1 border border-stone-100 text-stone-300 rounded bg-stone-50 cursor-not-allowed text-sm">
                                이전
                            </span>
                        )}
                        
                        {pageNumbers.map((pageNum) => (
                            <Link
                                key={pageNum}
                                href={`/admin/board?page=${pageNum}`}
                                className={`px-3 py-1 border rounded text-sm ${
                                    pageNum === currentPage
                                        ? 'bg-stone-800 text-white border-stone-800'
                                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                                }`}
                            >
                                {pageNum}
                            </Link>
                        ))}

                        {currentPage < totalPages ? (
                            <Link
                                href={`/admin/board?page=${currentPage + 1}`}
                                className="px-3 py-1 border border-stone-200 text-stone-600 rounded bg-white hover:bg-stone-50 text-sm"
                            >
                                다음
                            </Link>
                        ) : (
                            <span className="px-3 py-1 border border-stone-100 text-stone-300 rounded bg-stone-50 cursor-not-allowed text-sm">
                                다음
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
