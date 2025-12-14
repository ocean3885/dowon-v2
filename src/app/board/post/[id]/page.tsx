import Link from 'next/link';
import { getDb } from '@/lib/db';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { notFound } from 'next/navigation';

async function getPostData(id: string) {
    const db = await getDb();

    // Increment view count
    // We use run to execute update. 
    // Note: in a real hi-traffic app, this might be optimized, but fine for now.
    await db.run('UPDATE posts SET viewCount = viewCount + 1 WHERE id = ?', id);

    const post = await db.get(
        `SELECT p.*, c.name as categoryName, c.id as categoryId
     FROM posts p 
     LEFT JOIN categories c ON p.categoryId = c.id 
     WHERE p.id = ?`,
        id
    );

    return post;
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = await getPostData(id);

    if (!post) {
        notFound();
    }

    return (
        <div className="pt-24 min-h-screen bg-stone-50 pb-20">
            <div className="container mx-auto px-6 max-w-3xl">
                <div className="mb-6 flex justify-end">
                    <Link href={`/board/${post.categoryId}`} className="text-base md:text-lg text-stone-500 hover:text-amber-600 mb-4 inline-flex items-center gap-2 transition-colors">
                        <span>{post.categoryName} 목록으로</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </Link>
                </div>

                <article className="bg-white rounded-lg shadow-sm border border-stone-100 overflow-hidden">
                    <header className="p-8 border-b border-stone-100">
                        <div className="flex items-center gap-2 text-sm text-amber-600 font-medium mb-3">
                            <span>{post.categoryName}</span>
                        </div>
                        <h1 className="text-3xl font-serif font-bold text-stone-900 mb-4 leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex items-center text-sm text-stone-400 space-x-4">
                            <span>{post.author || '관리자'}</span>
                            <span>{format(new Date(post.publishedAt), 'yyyy.MM.dd HH:mm', { locale: ko })}</span>
                            <span>조회 {post.viewCount}</span>
                        </div>
                    </header>

                    <div className="p-8 min-h-[300px]">
                        {post.imageUrl && (
                            <div className="mb-8 rounded-lg overflow-hidden border border-stone-100">
                                <img src={post.imageUrl} alt={post.title} className="w-full h-auto" />
                            </div>
                        )}
                        <div
                            className="prose prose-lg prose-stone max-w-none font-serif text-stone-700 leading-relaxed
                                prose-headings:font-bold prose-headings:text-stone-900 prose-headings:font-sans
                                prose-p:leading-8 prose-p:mb-6
                                prose-a:text-amber-600 prose-a:no-underline hover:prose-a:text-amber-700 hover:prose-a:underline
                                prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                                prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-stone-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-stone-600
                                prose-li:marker:text-amber-500
                                prose-strong:text-stone-900 prose-strong:font-bold
                                [&>p]:text-justify"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </div>

                    <div className="border-t border-stone-100 p-8 flex justify-center bg-stone-50/50">
                        <Link
                            href={`/board/${post.categoryId}`}
                            className="px-8 py-3 bg-white border border-stone-200 text-stone-600 hover:border-amber-500 hover:text-amber-600 rounded-full transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>목록으로 돌아가기</span>
                        </Link>
                    </div>
                </article>
            </div>
        </div>
    );
}
