import Link from 'next/link';
import { getDb } from '@/lib/db';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import BoardCategorySelect from '@/components/BoardCategorySelect';
 
type Category = {
    id: number;
    name: string;
};

type BoardPost = {
    id: number;
    title: string;
    content: string;
    publishedAt: string;
    viewCount: number;
    thumbnailUrl: string | null;
    categoryId: number | null;
    categoryName: string | null;
};

function getExcerpt(content: string) {
    const plainText = content
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/\s+/g, ' ')
        .trim();

    if (plainText.length <= 140) {
        return plainText;
    }

    return `${plainText.slice(0, 140).trim()}...`;
}

async function getBoardData(categoryId: string | null, page: number) {
    const db = await getDb();
    const limit = 20;
    const offset = (page - 1) * limit;

    const categories = await db.all<Category>(
        'SELECT id, name FROM categories WHERE isActive = 1 ORDER BY displayOrder ASC, id ASC'
    );

    let postsQuery = `
        SELECT p.id, p.title, p.content, p.publishedAt, p.viewCount, p.thumbnailUrl, p.categoryId, c.name as categoryName
        FROM posts p
        LEFT JOIN categories c ON p.categoryId = c.id
        WHERE c.isActive = 1
    `;
    const postParams: Array<string | number> = [];

    if (categoryId) {
        postsQuery += ' AND p.categoryId = ?';
        postParams.push(categoryId);
    }

    postsQuery += `
        ORDER BY COALESCE(p.publishedAt, p.updatedAt) DESC, p.id DESC
        LIMIT ? OFFSET ?
    `;
    postParams.push(limit, offset);

    const posts = await db.all<BoardPost>(postsQuery, ...postParams);

    let totalQuery = `
        SELECT COUNT(*) as total
        FROM posts p
        LEFT JOIN categories c ON p.categoryId = c.id
        WHERE c.isActive = 1
    `;
    const countParams: Array<string | number> = [];

    if (categoryId) {
        totalQuery += ' AND p.categoryId = ?';
        countParams.push(categoryId);
    }

    const totalResult = await db.get<{ total: number }>(totalQuery, ...countParams);
    const total = totalResult?.total || 0;

    return {
        categories,
        posts,
        selectedCategoryId: categoryId,
        pagination: {
            currentPage: page,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
            limit,
        },
    };
}

function buildBoardHref(categoryId: string | null, page: number) {
    const params = new URLSearchParams();

    if (categoryId) {
        params.set('categoryId', categoryId);
    }

    if (page > 1) {
        params.set('page', String(page));
    }

    const query = params.toString();
    return query ? `/board?${query}` : '/board';
}

export default async function BoardPage(
    { searchParams }: {
        searchParams: Promise<{ categoryId?: string; page?: string }>
    }
) {
    const { categoryId, page } = await searchParams;
    const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
    const data = await getBoardData(categoryId || null, pageNum);
    const { categories, posts, selectedCategoryId, pagination } = data;
    const selectedCategory = categories.find((category) => String(category.id) === selectedCategoryId);

    return (
        <main className="min-h-screen bg-stone-50">
            <section className="relative pt-32 md:pt-40 md:pb-12 px-6 bg-stone-100/50">
                <div className="container mx-auto text-center">
                    <div className="animate-fade-in-up">
                        <p className="text-amber-700 font-bold tracking-widest mb-4 uppercase text-sm">Board</p>
                        <h1 className="text-4xl md:text-5xl font-bold font-serif text-stone-900 mb-6">게시판</h1>
                        <div className="h-1 w-20 bg-stone-800 mx-auto" />
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-6 max-w-4xl py-20">
                <div className="mb-8 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div>
                            <p className="text-sm font-semibold tracking-[0.2em] text-amber-700 uppercase">Category</p>
                            <h2 className="mt-2 text-2xl font-serif font-bold text-stone-900">
                                {selectedCategory ? selectedCategory.name : '전체 게시글'}
                            </h2>
                        </div>
                        <p className="text-sm text-stone-500">
                            총 {pagination.total}개의 글
                        </p>
                    </div>

                    <div className="mt-6 hidden flex-wrap gap-3 md:flex">
                        <Link
                            href="/board"
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                                !selectedCategoryId
                                    ? 'bg-stone-900 text-white'
                                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                            }`}
                        >
                            전체
                        </Link>
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={buildBoardHref(String(category.id), 1)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                                    String(category.id) === selectedCategoryId
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                                }`}
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>

                    <BoardCategorySelect
                        categories={categories}
                        selectedCategoryId={selectedCategoryId}
                    />
                </div>

                <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                    {posts.length > 0 ? (
                        <ul className="divide-y divide-stone-100">
                            {posts.map((post) => (
                                <li key={post.id} className="group">
                                    <Link href={`/board/post/${post.id}`} className="block px-5 py-6 md:px-7 md:py-7 hover:bg-stone-50 transition-colors">
                                        <div className="flex items-center gap-4 md:gap-5">
                                            {post.thumbnailUrl && (
                                                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:h-24 sm:w-32">
                                                    <img
                                                        src={post.thumbnailUrl}
                                                        alt=""
                                                        loading="lazy"
                                                        decoding="async"
                                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-stone-500 md:text-sm">
                                                    <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                                                        {post.categoryName || '미분류'}
                                                    </span>
                                                    <span>{format(new Date(post.publishedAt), 'yyyy.MM.dd', { locale: ko })}</span>
                                                    <span className="max-[400px]:hidden">조회 {post.viewCount}</span>
                                                </div>
                                                <h3 className="text-lg font-semibold text-stone-900 transition-colors group-hover:text-amber-700 md:text-xl">
                                                    {post.title}
                                                </h3>
                                                <p className="mt-3 line-clamp-3 text-sm leading-7 text-stone-600 md:text-base">
                                                    {getExcerpt(post.content)}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-6 py-16 text-center text-stone-400">
                            표시할 게시글이 없습니다.
                        </div>
                    )}
                </div>

                {pagination.totalPages > 1 && (
                    <div className="mt-10 flex flex-wrap justify-center gap-2">
                        {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((pageNumber) => (
                            <Link
                                key={pageNumber}
                                href={buildBoardHref(selectedCategoryId, pageNumber)}
                                className={`min-w-11 rounded-full px-4 py-2 text-center text-sm font-semibold transition-colors ${
                                    pageNumber === pagination.currentPage
                                        ? 'bg-stone-900 text-white'
                                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                                }`}
                            >
                                {pageNumber}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
