import { getSelectedBlogPosts } from '@/lib/actions';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

export default async function BlogSection() {
    const posts = await getSelectedBlogPosts();

    if (posts.length === 0) return null;

    return (
        <section className="py-12 md:py-24 bg-stone-50">
            <div className="container mx-auto px-4">
                <div className="max-w-xl mx-auto text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4 font-serif">도원 이야기</h2>
                    <p className="text-stone-500 font-light">
                        사주와 명리에 대한 깊이 있는 이야기를 네이버 블로그에서 만나보세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {posts.map((post: any) => (
                        <a
                            key={post.id}
                            href={post.contentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="aspect-[2/1] bg-stone-200 relative overflow-hidden">
                                {post.thumbnailUrl ? (
                                    <img
                                        src={post.thumbnailUrl}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100">
                                        <span className="text-sm">No Image</span>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                    <ArrowUpRight size={16} className="text-stone-800" />
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                                        {post.category || 'Column'}
                                    </span>
                                    <span className="text-xs text-stone-400">
                                        {post.publishedDate}
                                    </span>
                                </div>
                                <h3 className="font-bold text-stone-800 text-lg mb-2 line-clamp-2 group-hover:text-amber-800 transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-stone-500 text-sm line-clamp-4 leading-relaxed">
                                    {post.summary}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <a
                        href="https://blog.naver.com/ocean3885"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-stone-800 text-stone-100 rounded-full font-medium hover:bg-stone-900 transition-all hover:gap-3"
                    >
                        <span>도원 블로그 바로가기</span>
                        <ArrowUpRight size={18} />
                    </a>
                </div>
            </div>
        </section >
    );
}
