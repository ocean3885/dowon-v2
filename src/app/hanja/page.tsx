import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import HanjaCardList, { type HanjaCardData } from '@/components/hanja/HanjaCardList';
import HanjaFilterPanel from '@/components/hanja/HanjaFilterPanel';
import { createClient } from '@/utils/supabase/server';

type HanjaRow = HanjaCardData & {
    rad_stk: number | null;
    rad_elem: string | null;
    stk_info: string | null;
    disused: boolean | null;
};

type HanjaSearchParams = {
    search?: string;
    sound?: string;
    element?: string;
    strokes?: string;
    page?: string;
};

const PAGE_SIZE = 12;
const MAX_STROKES = 30;

const soundGroups = [
    { label: '전체', value: 'all' },
    { label: '가', value: 'ga', start: '가', end: '나' },
    { label: '나', value: 'na', start: '나', end: '다' },
    { label: '다', value: 'da', start: '다', end: '라' },
    { label: '라', value: 'ra', start: '라', end: '마' },
    { label: '마', value: 'ma', start: '마', end: '바' },
    { label: '바', value: 'ba', start: '바', end: '사' },
    { label: '사', value: 'sa', start: '사', end: '아' },
    { label: '아', value: 'a', start: '아', end: '자' },
    { label: '자', value: 'ja', start: '자', end: '차' },
    { label: '차', value: 'cha', start: '차', end: '카' },
    { label: '카', value: 'ka', start: '카', end: '타' },
    { label: '타', value: 'ta', start: '타', end: '파' },
    { label: '파', value: 'pa', start: '파', end: '하' },
    { label: '하', value: 'ha', start: '하', end: '힣' },
] as const;

const elementGroups = [
    { label: '전체', value: 'all' },
    { label: '목', value: 'wood', chars: ['木', '목'], dot: 'bg-[#6da774]' },
    { label: '화', value: 'fire', chars: ['火', '화'], dot: 'bg-[#c75d4a]' },
    { label: '토', value: 'earth', chars: ['土', '토'], dot: 'bg-[#d6a34d]' },
    { label: '금', value: 'metal', chars: ['金', '금'], dot: 'bg-[#9b9b94]' },
    { label: '수', value: 'water', chars: ['水', '수'], dot: 'bg-[#63a3c4]' },
] as const;

export const dynamic = 'force-dynamic';

export default async function HanjaPage(props: {
    searchParams?: Promise<HanjaSearchParams>;
}) {
    const searchParams = await props.searchParams;
    const search = normalizeText(searchParams?.search);
    const sound = getSoundGroup(searchParams?.sound);
    const element = getElementGroup(searchParams?.element);
    const strokes = normalizeStrokeCount(searchParams?.strokes);
    const page = normalizePage(searchParams?.page);
    const supabase = await createClient();

    let query = supabase
        .from('inmyunghanja')
        .select('pk, pron, char, main_mean, tot_stk, main_elem, rad_stk, rad, rad_elem, detail_mean, meaning, stk_info, rad_mean, disused', {
            count: 'exact',
        })
        .or('disused.is.null,disused.eq.false');

    if (search) {
        const keyword = escapeIlikeValue(search);
        query = query.or([
            `char.ilike.%${keyword}%`,
            `pron.ilike.%${keyword}%`,
            `main_mean.ilike.%${keyword}%`,
            `meaning.ilike.%${keyword}%`,
            `detail_mean.ilike.%${keyword}%`,
        ].join(','));
    }

    if (sound.value !== 'all') {
        query = query.gte('pron', sound.start).lt('pron', sound.end);
    }

    if (element.value !== 'all') {
        query = query.in('main_elem', element.chars);
    }

    if (strokes !== null) {
        query = query.eq('tot_stk', strokes);
    }

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count, error } = await query
        .order('tot_stk', { ascending: true, nullsFirst: false })
        .order('pron', { ascending: true, nullsFirst: false })
        .order('pk', { ascending: true })
        .range(from, to);

    const characters = (data || []) as HanjaRow[];
    const total = count || 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <main className="min-h-screen bg-[#f7f1e8] pb-20 pt-20 text-[#231d17]">
            <Hero />

            <section className="relative mx-auto -mt-12 w-[min(1280px,calc(100%-32px))]">
                <HanjaFilterPanel
                    key={`hanja-filter-${strokes ?? 'all'}`}
                    search={search}
                    soundValue={sound.value}
                    elementValue={element.value}
                    strokes={strokes}
                    soundGroups={soundGroups}
                    elementGroups={elementGroups}
                />

                <HanjaCardList
                    characters={characters}
                    hasError={Boolean(error)}
                    total={total}
                    currentPage={page}
                    totalPages={totalPages}
                    search={search}
                    sound={sound.value}
                    element={element.value}
                    strokes={strokes}
                />

                <ThemeStrip />
                <ConsultationBanner />
            </section>
        </main>
    );
}

function Hero() {
    return (
        <section className="relative min-h-[380px] overflow-hidden border-b border-[#d8c8b2]">
            <Image
                src="/home/naming_bg.webp"
                alt=""
                fill
                priority
                loading="eager"
                sizes="100vw"
                className="object-cover object-[68%_center]"
            />
            <div className="relative mx-auto flex min-h-[380px] w-[min(1280px,calc(100%-32px))] items-center">
                <div className="max-w-xl pb-14 pt-12">
                    <h1 className="break-keep font-serif text-4xl font-light leading-[1.35] tracking-normal text-[#f8f2e8] drop-shadow-[0_2px_18px_rgba(0,0,0,0.42)] sm:text-5xl">
                        이름에 담기는
                        <br />
                        <span className="text-[#d7a366]">한자</span>의 <span className="text-[#e2bd84]">의미와 흐름</span>
                    </h1>
                    <p className="mt-6 max-w-md break-keep text-sm leading-7 text-white/82 drop-shadow-[0_2px_14px_rgba(0,0,0,0.48)] sm:text-base">
                        도원은 인명용 한자의 뜻과 음, 오행과 획수의 조화를 함께 고려합니다.
                    </p>
                </div>
            </div>
        </section>
    );
}

function ThemeStrip() {
    const themes = [
        { title: '밝은 의미', body: '빛과 희망의 뜻을 살펴봅니다.' },
        { title: '지혜로운 의미', body: '지혜와 배움의 흐름을 찾습니다.' },
        { title: '강인한 의미', body: '단단한 기운의 글자를 봅니다.' },
        { title: '부드러운 의미', body: '온화한 울림을 함께 봅니다.' },
        { title: '오행별 한자', body: '목 · 화 · 토 · 금 · 수' },
    ];

    return (
        <section className="mt-6 rounded-lg border border-[#e5d8c8] bg-white/58 px-5 py-5">
            <div className="flex flex-col gap-3 border-b border-[#eee4d8] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-serif text-xl text-[#241c15]">많이 찾는 테마별 한자</h2>
                <Link href="/services/naming" className="inline-flex items-center gap-1 text-sm font-semibold text-[#80552c]">
                    작명 상담 안내
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
            <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-5">
                {themes.map((theme) => (
                    <article key={theme.title} className="border-l border-[#eadfd3] pl-4">
                        <p className="text-sm font-semibold text-[#493b2d]">{theme.title}</p>
                        <p className="mt-2 text-xs leading-6 text-[#786b5e]">{theme.body}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}

function ConsultationBanner() {
    return (
        <section className="relative mt-5 overflow-hidden rounded-lg border border-[#322419] bg-[#15110d] px-6 py-7 text-white sm:px-8">
            <Image
                src="/home/naming_bg.webp"
                alt=""
                fill
                sizes="(min-width: 1280px) 1280px, 100vw"
                className="object-cover object-right opacity-30"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,12,9,0.98),rgba(15,12,9,0.76)_62%,rgba(15,12,9,0.5))]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="font-serif text-2xl font-light tracking-normal">
                        좋은 이름은 <span className="text-[#d3a066]">한 글자의 의미</span>에서 시작됩니다.
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-white/72">한자의 뜻과 흐름을 바탕으로, 당신만의 이름을 함께 지어드립니다.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Link href="/submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#ad7b42] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#966633]">
                        작명 상담 신청
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link href="/services/naming" className="inline-flex h-12 items-center justify-center rounded-md border border-white/24 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                        상담 안내 보기
                    </Link>
                </div>
            </div>
        </section>
    );
}

function getSoundGroup(value?: string) {
    return soundGroups.find((group) => group.value === value) || soundGroups[0];
}

function getElementGroup(value?: string) {
    return elementGroups.find((group) => group.value === value) || elementGroups[0];
}

function normalizeText(value?: string) {
    return (value || '').trim().slice(0, 60);
}

function normalizeStrokeCount(value?: string) {
    if (!value) return null;

    const count = Number(value);
    if (!Number.isFinite(count)) return null;
    return Math.min(MAX_STROKES, Math.max(1, Math.round(count)));
}

function normalizePage(value?: string) {
    const page = Number(value);
    if (!Number.isFinite(page)) return 1;
    return Math.max(1, Math.floor(page));
}

function escapeIlikeValue(value: string) {
    return value.replace(/[\\%_]/g, (match) => `\\${match}`).replace(/,/g, ' ');
}
