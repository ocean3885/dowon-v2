import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { createClient } from '@/utils/supabase/server';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import BoardCategorySelect from '@/components/board/BoardCategorySelect';
import ReservationAside from '@/components/common/ReservationAside';
import {
    ArrowRight,
    Bell,
    BookOpen,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    HelpCircle,
    LayoutGrid,
    MessageCircle,
    PenLine,
    Eye,
    Search,
} from 'lucide-react';
 
type BoardPostRow = {
    id: number;
    title: string;
    content: string;
    published_at: string;
    view_count: number;
    thumbnail_url: string | null;
    category_id: number | null;
    categories?: {
        name?: string | null;
    } | null;
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

const fallbackImages = [
    '/home/desk_hand_pen_bg.webp',
    '/bg_source/bg_mount1.webp',
    '/home/section2_bg.webp',
    '/home/dowon_mountain_bg.webp',
    '/bg_source/cloud_moon1.webp',
];

function getPostImage(post: { thumbnailUrl?: string | null; id: number }, index: number) {
    return post.thumbnailUrl || fallbackImages[(post.id + index) % fallbackImages.length];
}

function normalizeSearchQuery(search?: string | null) {
    return (search || '').trim().slice(0, 80);
}

function escapeIlikeValue(value: string) {
    return value.replace(/[\\%_]/g, (match) => `\\${match}`).replace(/,/g, ' ');
}

function getVisiblePages(currentPage: number, totalPages: number) {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = new Set([1, totalPages, currentPage]);
    if (currentPage > 1) pages.add(currentPage - 1);
    if (currentPage < totalPages) pages.add(currentPage + 1);
    if (currentPage <= 3) {
        pages.add(2);
        pages.add(3);
        pages.add(4);
    }
    if (currentPage >= totalPages - 2) {
        pages.add(totalPages - 1);
        pages.add(totalPages - 2);
        pages.add(totalPages - 3);
    }

    return Array.from(pages).sort((a, b) => a - b);
}

async function getBoardData(categoryId: string | null, page: number, searchQuery: string) {
    const supabase = await createClient();
    const limit = 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('id', { ascending: true });

    let query = supabase
        .from('posts')
        .select(`
            id, 
            title, 
            content, 
            published_at, 
            view_count, 
            thumbnail_url, 
            category_id,
            categories!inner(name, is_active)
        `, { count: 'exact' })
        .eq('categories.is_active', true);

    if (categoryId) {
        query = query.eq('category_id', categoryId);
    }

    if (searchQuery) {
        const keyword = escapeIlikeValue(searchQuery);
        query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
    }

    const { data: postsData, count: total } = await query
        .order('published_at', { ascending: false })
        .order('id', { ascending: false })
        .range(from, to);

    const posts = (postsData as BoardPostRow[] | null || []).map((post) => ({
        ...post,
        publishedAt: post.published_at,
        viewCount: post.view_count,
        thumbnailUrl: post.thumbnail_url,
        categoryId: post.category_id,
        categoryName: post.categories?.name
    }));

    return {
        categories: categories || [],
        posts,
        selectedCategoryId: categoryId,
        pagination: {
            currentPage: page,
            total: total || 0,
            totalPages: Math.max(1, Math.ceil((total || 0) / limit)),
            limit,
        },
    };
}

function buildBoardHref(categoryId: string | null, page: number, searchQuery = '') {
    const params = new URLSearchParams();

    if (categoryId) {
        params.set('categoryId', categoryId);
    }

    if (searchQuery) {
        params.set('search', searchQuery);
    }

    if (page > 1) {
        params.set('page', String(page));
    }

    const query = params.toString();
    return query ? `/board?${query}` : '/board';
}

export default async function BoardPage(
    { searchParams }: {
        searchParams: Promise<{ categoryId?: string; page?: string; search?: string }>
    }
) {
    const { categoryId, page, search } = await searchParams;
    const searchQuery = normalizeSearchQuery(search);
    const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
    const data = await getBoardData(categoryId || null, pageNum, searchQuery);
    const { categories, posts, selectedCategoryId, pagination } = data;
    const selectedCategory = categories.find((category) => String(category.id) === selectedCategoryId);
    const [featuredPost, ...regularPosts] = posts;
    const visiblePages = getVisiblePages(pagination.currentPage, pagination.totalPages);

    return (
        <main className="min-h-screen overflow-hidden bg-[#f7f0e5] text-[#2f261d]">
            <section className="relative min-h-[360px] px-6 pb-28 pt-28 md:min-h-[430px] md:pt-36">
                <div className="absolute inset-y-0 left-1/2 w-full max-w-[2375px] -translate-x-1/2">
                    <Image
                        src="/counseling/longwide1.jpg"
                        alt=""
                        fill
                        priority
                        sizes="(min-width: 2375px) 2375px, 100vw"
                        className="object-cover object-center opacity-90 brightness-[0.74]"
                    />
                </div>
                <div className="absolute inset-0 bg-[#1f1710]/28" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,13,9,0.38),rgba(18,13,9,0.18)_45%,rgba(18,13,9,0.32))]" />
                <div className="relative mx-auto max-w-6xl">
                    <div className="max-w-xl">
                        <p className="mb-4 text-sm font-semibold tracking-[0.28em] text-[#d8b47d]">DOWON BOARD</p>
                        <h1 className="font-serif text-3xl font-light leading-tight tracking-normal text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.32)] md:text-5xl">
                            삶의 <span className="text-[#d8b47d]">흐름</span>을 읽는 <span className="text-[#d8b47d]">이야기</span>
                        </h1>
                        <p className="mt-6 text-base leading-8 text-white/78 drop-shadow-[0_1px_8px_rgba(0,0,0,0.28)] md:text-lg">
                            도원은 단순한 길흉보다<br className="hidden sm:block" />
                            삶의 방향과 흐름을 함께 봅니다.
                        </p>
                        <div className="mt-7 h-px w-24 bg-[#d8b47d]">
                            <span className="block h-1.5 w-1.5 translate-x-20 -translate-y-[3px] rounded-full bg-[#d8b47d]" />
                        </div>
                    </div>
                </div>
            </section>

            <div className="relative mx-auto -mt-11 max-w-6xl px-5 pb-24 sm:-mt-10 md:-mt-9 lg:-mt-10 md:px-6">
                <div className="rounded-lg border border-[#e1d3bd] bg-[#fffaf2] p-3 shadow-[0_18px_60px_rgba(75,55,31,0.10)]">
                    <div className="hidden grid-cols-3 gap-2 md:grid lg:grid-cols-6">
                        <Link
                            href={buildBoardHref(null, 1, searchQuery)}
                            className={`flex h-12 items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors ${
                                !selectedCategoryId
                                    ? 'bg-[#b7894a] text-white shadow-[0_10px_25px_rgba(183,137,74,0.24)]'
                                    : 'text-[#5f554c] hover:bg-[#f6efe4]'
                            }`}
                        >
                            <LayoutGrid className="h-4 w-4" />
                            전체
                        </Link>
                        {categories.map((category) => (
                            <CategoryTab
                                key={category.id}
                                href={buildBoardHref(String(category.id), 1, searchQuery)}
                                active={String(category.id) === selectedCategoryId}
                                name={category.name}
                            />
                        ))}
                    </div>

                    <BoardCategorySelect
                        categories={categories}
                        selectedCategoryId={selectedCategoryId}
                        searchQuery={searchQuery}
                    />
                </div>

                <form action="/board" className="mt-4 rounded-lg border border-[#e1d3bd] bg-[#fffaf2] p-3 shadow-[0_12px_34px_rgba(75,55,31,0.06)]">
                    {selectedCategoryId && <input type="hidden" name="categoryId" value={selectedCategoryId} />}
                    <label htmlFor="board-search" className="sr-only">게시글 검색</label>
                    <div className="flex gap-2">
                        <div className="relative min-w-0 flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a87943]" />
                            <input
                                id="board-search"
                                name="search"
                                type="search"
                                defaultValue={searchQuery}
                                placeholder="제목 또는 내용 검색"
                                className="h-11 w-full rounded-md border border-[#d8c8ae] bg-white/78 pl-10 pr-3 text-sm text-[#2f261d] outline-none transition-colors placeholder:text-[#9a8d80] focus:border-[#b7894a] focus:ring-2 focus:ring-[#b7894a]/15"
                            />
                        </div>
                        <button
                            type="submit"
                            className="inline-flex h-11 items-center justify-center rounded-md bg-[#b7894a] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#9f733b]"
                        >
                            검색
                        </button>
                    </div>
                    {searchQuery && (
                        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#7b6f64]">
                            <span className="min-w-0 truncate">&quot;{searchQuery}&quot; 검색 결과</span>
                            <Link href={buildBoardHref(selectedCategoryId, 1)} className="shrink-0 font-semibold text-[#9a6a2f] hover:underline">
                                검색 초기화
                            </Link>
                        </div>
                    )}
                </form>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium text-[#7b6f64]">
                        {selectedCategory ? selectedCategory.name : '전체 게시글'} <span className="text-[#b7894a]">{pagination.total}</span>
                    </p>
                </div>

                {posts.length > 0 ? (
                    <div className="mt-4 grid gap-5 sm:mt-5 lg:grid-cols-[1fr_260px]">
                        <div>
                            {featuredPost && (
                                <Link
                                    href={`/board/post/${featuredPost.id}`}
                                    className="group grid overflow-hidden rounded-lg border border-[#dfcfb6] bg-white/64 p-2 shadow-[0_16px_40px_rgba(70,54,36,0.08)] transition-colors hover:border-[#c8a46d] sm:p-3 lg:grid-cols-[1fr_1.15fr]"
                                >
                                    <div className="relative min-h-[170px] overflow-hidden rounded-md bg-[#efe3d0] sm:min-h-[230px] lg:min-h-[260px]">
                                        <Image
                                            src={getPostImage(featuredPost, 0)}
                                            alt=""
                                            fill
                                            sizes="(min-width: 1280px) 390px, (min-width: 1024px) 800px, 100vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <article className="flex flex-col justify-center px-3 py-5 sm:py-7 md:px-8">
                                        <p className="text-xs font-semibold text-[#a87943] sm:text-sm">{featuredPost.categoryName || '도원의 이야기'}</p>
                                        <h2 className="mt-3 font-serif text-xl font-light leading-snug tracking-normal text-[#201915] sm:mt-4 md:text-3xl">
                                            {featuredPost.title}
                                        </h2>
                                        <div className="mt-4 h-px w-14 bg-[#b7894a] sm:mt-5" />
                                        <p className="mt-4 line-clamp-2 text-sm leading-7 text-[#6f6256] sm:mt-5 sm:line-clamp-3 md:text-base">
                                            {getExcerpt(featuredPost.content)}
                                        </p>
                                        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#e5dacb] pt-4 text-xs text-[#7b6f64] sm:mt-7 sm:gap-x-5 sm:gap-y-3 sm:pt-5 sm:text-sm">
                                            <span className="inline-flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4 text-[#a87943]" />
                                                {format(new Date(featuredPost.publishedAt), 'yyyy.MM.dd', { locale: ko })}
                                            </span>
                                            <span className="inline-flex items-center gap-2">
                                                <Eye className="h-4 w-4 text-[#a87943]" />
                                                조회수 {featuredPost.viewCount.toLocaleString('ko-KR')}
                                            </span>
                                            <span className="ml-auto inline-flex items-center gap-2 font-semibold text-[#9a6a2f]">
                                                자세히 보기
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </span>
                                        </div>
                                    </article>
                                </Link>
                            )}

                            {regularPosts.length > 0 && (
                                <div className="mt-5 grid gap-3 sm:gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                    {regularPosts.map((post, index) => (
                                        <PostCard key={post.id} post={post} image={getPostImage(post, index + 1)} />
                                    ))}
                                </div>
                            )}

                            {pagination.totalPages > 1 && (
                                <PaginationNav
                                    selectedCategoryId={selectedCategoryId}
                                    currentPage={pagination.currentPage}
                                    totalPages={pagination.totalPages}
                                    visiblePages={visiblePages}
                                    searchQuery={searchQuery}
                                />
                            )}
                        </div>

                        <BoardSidebar />
                    </div>
                ) : (
                    <div className="mt-5 rounded-lg border border-[#dfcfb6] bg-white/64 px-6 py-20 text-center text-[#8a7d70]">
                        표시할 게시글이 없습니다.
                    </div>
                )}
            </div>
        </main>
    );
}

function CategoryTab({
    href,
    active,
    name,
}: {
    href: string;
    active: boolean;
    name: string;
}) {
    return (
        <Link
            href={href}
            className={`flex h-12 items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors ${
                active
                    ? 'bg-[#b7894a] text-white shadow-[0_10px_25px_rgba(183,137,74,0.24)]'
                    : 'text-[#5f554c] hover:bg-[#f6efe4]'
            }`}
        >
            <CategoryIcon name={name} />
            <span className="truncate">{name}</span>
        </Link>
    );
}

function CategoryIcon({ name }: { name?: string | null }) {
    if (!name) return <LayoutGrid className="h-4 w-4" />;
    if (name.includes('공지')) return <Bell className="h-4 w-4" />;
    if (name.includes('상담')) return <MessageCircle className="h-4 w-4" />;
    if (name.includes('칼럼') || name.includes('명리')) return <PenLine className="h-4 w-4" />;
    if (name.includes('질문') || name.includes('답변')) return <HelpCircle className="h-4 w-4" />;
    return <BookOpen className="h-4 w-4" />;
}

function BoardSidebar() {
    return (
        <div className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <aside className="flex min-h-[410px] overflow-hidden rounded-lg border border-[#dfcfb6] bg-white/58 p-6 shadow-[0_14px_36px_rgba(70,54,36,0.06)]">
                <div className="flex w-full flex-col">
                    <div className="relative mb-6 h-36">
                        <Image
                            src="/login/crane_character.webp"
                            alt=""
                            fill
                            sizes="260px"
                            className="object-contain object-center"
                        />
                    </div>
                    <h2 className="font-serif text-xl font-light tracking-normal text-[#201915]">더 깊은 상담이 필요하신가요?</h2>
                    <div className="mt-5 h-px bg-[#e0d0b9]">
                        <span className="mx-auto block h-1.5 w-1.5 -translate-y-[3px] rounded-full bg-[#b7894a]" />
                    </div>
                    <p className="mt-6 text-sm leading-7 text-[#6f6256]">
                        당신의 흐름을 보다 깊이 이해하고, 삶의 방향을 함께 살펴보겠습니다.
                    </p>
                    <div className="mt-auto pb-3 pt-8">
                        <Link
                            href="/submit"
                            className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-md bg-[#b7894a] px-5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(183,137,74,0.18)] transition-colors hover:bg-[#9f733b]"
                        >
                            상담 신청하기
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </aside>
            <ReservationAside />
        </div>
    );
}

function PostCard({
    post,
    image,
}: {
    post: {
        id: number;
        title: string;
        content: string;
        publishedAt: string;
        viewCount: number;
        categoryName?: string | null;
    };
    image: string;
}) {
    return (
        <Link
            href={`/board/post/${post.id}`}
            className="group grid grid-cols-[104px_1fr] overflow-hidden rounded-lg border border-[#dfcfb6] bg-white/64 shadow-[0_10px_24px_rgba(70,54,36,0.06)] transition-colors hover:border-[#c8a46d] sm:block sm:shadow-[0_14px_34px_rgba(70,54,36,0.07)]"
        >
            <div className="relative h-full min-h-[116px] overflow-hidden bg-[#efe3d0] sm:aspect-[1.55] sm:h-auto sm:min-h-0">
                <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 300px, (min-width: 640px) 50vw, 104px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>
            <article className="min-w-0 p-3 sm:p-4">
                <span className="inline-flex max-w-full truncate rounded bg-[#f6ead7] px-2 py-0.5 text-[11px] font-semibold text-[#a87943] sm:px-2.5 sm:py-1 sm:text-xs">
                    {post.categoryName || '미분류'}
                </span>
                <h2 className="mt-2 line-clamp-2 font-serif text-base font-light leading-snug tracking-normal text-[#201915] transition-colors group-hover:text-[#9a6a2f] sm:mt-4 sm:text-xl">
                    {post.title}
                </h2>
                <p className="mt-3 hidden text-sm leading-7 text-[#6f6256] sm:line-clamp-3 sm:block">
                    {getExcerpt(post.content)}
                </p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-[#7b6f64] sm:mt-5 sm:gap-3 sm:text-xs">
                    <span>{format(new Date(post.publishedAt), 'yyyy.MM.dd', { locale: ko })}</span>
                    <span className="h-3 w-px bg-[#d8c8ae]" />
                    <span>조회 {post.viewCount.toLocaleString('ko-KR')}</span>
                    <ArrowRight className="ml-auto hidden h-4 w-4 text-[#b7894a] transition-transform group-hover:translate-x-1 sm:block" />
                </div>
            </article>
        </Link>
    );
}

function PaginationNav({
    selectedCategoryId,
    currentPage,
    totalPages,
    visiblePages,
    searchQuery,
}: {
    selectedCategoryId: string | null;
    currentPage: number;
    totalPages: number;
    visiblePages: number[];
    searchQuery: string;
}) {
    return (
        <div className="mb-8 mt-10 flex flex-wrap items-center justify-center gap-2 text-sm sm:mt-12 lg:mb-0">
            <PaginationButton
                href={buildBoardHref(selectedCategoryId, Math.max(1, currentPage - 1), searchQuery)}
                disabled={currentPage === 1}
                label="이전"
            >
                <ChevronLeft className="h-4 w-4" />
            </PaginationButton>

            {visiblePages.map((pageNumber, index) => {
                const previousPage = visiblePages[index - 1];
                const showEllipsis = previousPage && pageNumber - previousPage > 1;

                return (
                    <span key={pageNumber} className="inline-flex items-center gap-2">
                        {showEllipsis && <span className="px-2 text-[#8a7d70]">...</span>}
                        <Link
                            href={buildBoardHref(selectedCategoryId, pageNumber, searchQuery)}
                            className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 font-semibold transition-colors ${
                                pageNumber === currentPage
                                    ? 'bg-[#b7894a] text-white shadow-[0_8px_18px_rgba(183,137,74,0.24)]'
                                    : 'text-[#5f554c] hover:bg-white/70'
                            }`}
                        >
                            {pageNumber}
                        </Link>
                    </span>
                );
            })}

            <PaginationButton
                href={buildBoardHref(selectedCategoryId, Math.min(totalPages, currentPage + 1), searchQuery)}
                disabled={currentPage === totalPages}
                label="다음"
            >
                <ChevronRight className="h-4 w-4" />
            </PaginationButton>
        </div>
    );
}

function PaginationButton({
    href,
    disabled,
    label,
    children,
}: {
    href: string;
    disabled: boolean;
    label: string;
    children: ReactNode;
}) {
    if (disabled) {
        return (
            <span aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full text-[#c4b7a4]">
                {children}
            </span>
        );
    }

    return (
        <Link
            href={href}
            aria-label={label}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#5f554c] transition-colors hover:bg-white/70"
        >
            {children}
        </Link>
    );
}
