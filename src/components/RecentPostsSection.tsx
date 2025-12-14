import { getRecentPosts } from '@/lib/actions';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

function stripHtml(html: string) {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '');
}

export default async function RecentPostsSection() {
    const posts = await getRecentPosts();

    if (!posts || posts.length === 0) return null;

    return (
        <section className="py-12 md:py-24 bg-white border-b border-stone-50">
            <div className="container mx-auto px-4">
                <div className="max-w-xl mx-auto text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4 font-serif">최신 게시글</h2>
                    <p className="text-stone-500 font-light">
                        도원작명철학원의 새로운 소식을 홈페이지에서 확인하세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {posts.map((post: any) => {
                        const summary = post.content ? stripHtml(post.content).slice(0, 100) + (post.content.length > 100 ? '...' : '') : '';

                        return (
                            <Link
                                key={post.id}
                                href={`/board/post/${post.id}`}
                                className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-stone-100"
                            >
                                <div className="aspect-[2/1] bg-stone-100 relative overflow-hidden">
                                    {post.thumbnailUrl ? (
                                        <img
                                            src={post.thumbnailUrl}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-300 bg-stone-50">
                                            <span className="font-serif text-2xl text-stone-200">DoWon</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                        <ArrowUpRight size={16} className="text-stone-800" />
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                                            {post.categoryName || '일반'}
                                        </span>
                                        <span className="text-xs text-stone-400">
                                            {format(new Date(post.publishedAt), 'yyyy.MM.dd', { locale: ko })}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-stone-800 text-lg mb-2 line-clamp-2 group-hover:text-amber-800 transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-stone-500 text-sm line-clamp-4 leading-relaxed">
                                        {summary}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-12 text-center">
                    <Link
                        href="/board"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-stone-200 text-stone-600 rounded-full font-medium hover:border-amber-500 hover:text-amber-600 transition-all hover:shadow-md"
                    >
                        <span>게시판 전체보기</span>
                        <ArrowUpRight size={18} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
