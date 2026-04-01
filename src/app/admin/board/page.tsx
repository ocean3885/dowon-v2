import Link from 'next/link';
import { getDb } from '@/lib/db';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import BulkImportButton from '@/components/admin/BulkImportButton';
import DeleteBoardPostButton from '@/components/admin/DeleteBoardPostButton';

export const dynamic = 'force-dynamic';

async function getAdminPosts() {
    const db = await getDb();
    // Fetch all posts with category names
    const posts = await db.all(`
    SELECT p.id, p.title, p.author, p.viewCount, p.publishedAt, c.name as categoryName 
    FROM posts p 
    LEFT JOIN categories c ON p.categoryId = c.id 
    ORDER BY p.publishedAt DESC
  `);
    return posts;
}

export default async function AdminBoardPage() {
    const posts = await getAdminPosts();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-stone-800">게시글 관리</h2>
                <div className="flex gap-3">
                    <Link
                        href="/admin/board/categories"
                        className="px-4 py-2 bg-white border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors text-sm font-bold"
                    >
                        카테고리 관리
                    </Link>
                    <BulkImportButton />
                    <Link
                        href="/admin/board/create"
                        className="px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors text-sm font-bold"
                    >
                        게시글 작성
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
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
        </div>
    );
}
