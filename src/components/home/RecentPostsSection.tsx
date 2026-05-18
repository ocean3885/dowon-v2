import { getRecentPosts } from '@/lib/actions';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

type RecentPost = {
    id: number;
    title: string;
    content: string | null;
    publishedAt: string | null;
    thumbnailUrl: string | null;
    categoryName: string | null;
};

function stripHtml(html: string) {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '');
}

function formatPostDate(date: string | null) {
    if (!date) return '';

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return '';

    return format(parsedDate, 'yyyy.MM.dd', { locale: ko });
}

export default async function RecentPostsSection() {
    const posts = await getRecentPosts() as RecentPost[];

    if (!posts || posts.length === 0) return null;

    return (
        <section className="relative overflow-hidden bg-[#f6f2eb] py-12 font-serif antialiased md:py-16 lg:py-20">
            <div
                className="absolute inset-0 bg-cover bg-no-repeat bg-left opacity-30 pointer-events-none md:bg-center md:opacity-70"
                style={{ backgroundImage: 'url("/home/right_blur_bg_bright.webp")' }}
            />
            <div className="absolute right-0 top-0 h-full w-[45%] bg-[radial-gradient(circle_at_right,rgba(207,170,109,0.18),transparent_62%)] pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-[1600px] px-6 lg:px-12">
                <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
                    <div className="flex items-center justify-center lg:justify-start">
                        <div className="w-full max-w-[480px] text-center lg:text-left">
                            <div className="mb-3 flex items-center justify-center gap-3 lg:justify-start">
                                <span className="font-sans text-xs font-medium tracking-[0.2em] text-[#b28a52] antialiased md:text-sm">
                                    도원의 새로운 이야기
                                </span>
                                <div className="h-px w-8 bg-[#b28a52]/40" />
                            </div>

                            <h2 className="text-2xl leading-[1.3] tracking-[-0.04em] text-[#231815] break-keep sm:text-3xl md:text-4xl lg:text-[38px] lg:leading-[1.35]">
                                최신 게시글과
                                <br />
                                상담 소식을 확인하세요
                            </h2>

                            <p className="mt-3 font-sans text-sm leading-relaxed tracking-[-0.02em] text-[#5c544f] break-keep sm:text-base md:mt-4 lg:text-lg">
                                도원작명철학원의 안내와 칼럼을
                                <br />
                                한눈에 살펴볼 수 있습니다.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                        {posts.slice(0, 4).map((post) => {
                            const plainContent = post.content ? stripHtml(post.content) : '';
                            const summary = plainContent.length > 82 ? `${plainContent.slice(0, 82)}...` : plainContent;
                            const publishedDate = formatPostDate(post.publishedAt);

                            return (
                                <Link
                                    key={post.id}
                                    href={`/board/post/${post.id}`}
                                    className="group flex min-h-[148px] items-center overflow-hidden rounded-[14px] border border-[#ded4c8] bg-white/70 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#c7a46b] hover:bg-white/85 hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] md:rounded-[18px]"
                                >
                                    <div className="relative mr-3 h-[88px] w-[78px] shrink-0 overflow-hidden rounded-[10px] bg-[#faf7f2] sm:mr-4 sm:h-[124px] sm:w-[112px] sm:rounded-[12px]">
                                        {post.thumbnailUrl ? (
                                            <Image
                                                src={post.thumbnailUrl}
                                                alt={post.title}
                                                fill
                                                sizes="112px"
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center border border-[#b28a52]/15 bg-[#faf7f2] text-center">
                                                <span className="font-serif text-lg tracking-[-0.03em] text-[#c8bba7]">
                                                    DoWon
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                                        <div>
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                <span className="rounded-full border border-[#b28a52]/20 bg-[#faf7f2] px-2.5 py-1 font-sans text-[11px] font-medium text-[#b28a52]">
                                                    {post.categoryName || '일반'}
                                                </span>
                                                {publishedDate && (
                                                    <span className="font-sans text-[11px] text-[#7a7068]">
                                                        {publishedDate}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="line-clamp-2 text-lg font-serif font-medium leading-snug tracking-[-0.03em] text-[#3c312b] transition-colors group-hover:text-[#8a622c]">
                                                {post.title}
                                            </h3>

                                            <p className="mt-2 line-clamp-2 font-sans text-xs leading-relaxed text-[#6c625d] break-keep sm:text-sm">
                                                {summary}
                                            </p>
                                        </div>

                                        <div className="mt-3 flex items-center gap-2 font-sans text-[11px] font-semibold tracking-[0.16em] text-[#b28a52] uppercase">
                                            자세히 보기
                                            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-8 text-center md:mt-10 lg:mt-12">
                    <Link
                        href="/board"
                        className="group inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-[#d9ccbc] bg-white px-6 font-sans text-sm font-medium tracking-tight text-[#5a4632] transition-all duration-300 hover:border-[#b28a52] hover:bg-white/90 sm:h-12 sm:px-8 sm:text-base"
                    >
                        <span>게시판 전체보기</span>
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
