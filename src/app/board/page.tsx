import Link from 'next/link';
import { getDb } from '@/lib/db';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

async function getBoardData() {
    const db = await getDb();

    // Get active categories
    const categories = await db.all('SELECT * FROM categories WHERE isActive = 1 ORDER BY displayOrder ASC');

    // Fetch posts for each category
    const categoriesWithPosts = await Promise.all(categories.map(async (cat) => {
        const posts = await db.all(
            `SELECT id, title, publishedAt, viewCount, thumbnailUrl 
       FROM posts 
       WHERE categoryId = ? 
       ORDER BY date(publishedAt) DESC, CAST(title AS INTEGER) ASC, title ASC 
       LIMIT ?`,
            cat.id,
            cat.postLimit || 5
        );
        return { ...cat, posts };
    }));

    return categoriesWithPosts;
}

export default async function BoardPage() {
    const categories = await getBoardData();

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
                <div className="grid grid-cols-1 gap-12">
                    {categories.map((category) => (
                        <div key={category.id} className="bg-white p-6 rounded-lg shadow-sm border border-stone-100">
                            <div className="flex items-center justify-between mb-6 border-b border-stone-200 pb-3">
                                <h2 className="text-2xl font-serif font-bold text-stone-800">
                                    {category.name}
                                </h2>
                                <Link
                                    href={`/board/${category.id}`}
                                    className="text-stone-500 hover:text-amber-600 text-sm font-medium transition-colors"
                                >
                                    더보기 &rarr;
                                </Link>
                            </div>

                            {category.posts.length > 0 ? (
                                <ul className="space-y-4">
                                    {category.posts.map((post: any) => (
                                        <li key={post.id} className="group border-b border-stone-50 last:border-0 pb-3 last:pb-0">
                                            <Link href={`/board/post/${post.id}`} className="flex items-center gap-4">
                                                {post.thumbnailUrl && (
                                                    <div className="flex-shrink-0 w-20 h-14 rounded overflow-hidden">
                                                        <img
                                                            src={post.thumbnailUrl}
                                                            alt=""
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-stone-700 font-medium group-hover:text-amber-700 transition-colors truncate text-base">
                                                            {post.title}
                                                        </span>
                                                        <span className="text-stone-400 text-xs whitespace-nowrap ml-2">
                                                            {format(new Date(post.publishedAt), 'yyyy-MM-dd', { locale: ko })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-8 text-stone-400 text-sm">
                                    게시글이 없습니다.
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
