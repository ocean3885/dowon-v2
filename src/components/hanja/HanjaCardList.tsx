import Link from 'next/link';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

export type HanjaCardData = {
    pk: number;
    pron: string | null;
    char: string | null;
    tot_stk: number | null;
    main_elem: string | null;
    rad: string | null;
    rad_mean: string | null;
    detail_mean: string | null;
    meaning: string | null;
};

type HanjaCardListProps = {
    characters: HanjaCardData[];
    hasError: boolean;
    total: number;
    currentPage: number;
    totalPages: number;
    search: string;
    sound: string;
    element: string;
    strokes: number | null;
};

export default function HanjaCardList({
    characters,
    hasError,
    total,
    currentPage,
    totalPages,
    search,
    sound,
    element,
    strokes,
}: HanjaCardListProps) {
    return (
        <section className="mt-5 min-w-0">
            <div className="flex flex-col gap-3 px-1 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-[#5d5146]">
                    전체 <span className="text-[#a7753e]">{formatCount(total)}</span>자
                </p>
                <p className="text-xs leading-6 text-[#8b7c6c]">
                    인명용 한자 데이터에서 검색 조건에 맞는 결과를 보여드립니다.
                </p>
            </div>

            {hasError ? (
                <StatePanel
                    title="한자 목록을 불러오지 못했습니다."
                    body="데이터베이스 연결과 인명용 한자 테이블 상태를 확인해주세요."
                />
            ) : characters.length === 0 ? (
                <StatePanel
                    title="검색 결과가 없습니다."
                    body="한자, 음, 뜻을 바꾸거나 획수 조건을 해제해 다시 찾아보세요."
                />
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {characters.map((character) => (
                            <CharacterCard key={character.pk} character={character} />
                        ))}
                    </div>
                    <Pagination
                        currentPage={Math.min(currentPage, totalPages)}
                        totalPages={totalPages}
                        params={{
                            search,
                            sound,
                            element,
                            strokes,
                        }}
                    />
                </>
            )}
        </section>
    );
}

function CharacterCard({ character }: { character: HanjaCardData }) {
    return (
        <article className="flex min-h-[176px] flex-col rounded-lg border border-[#eadfd3] bg-white/74 p-4 shadow-[0_14px_38px_rgba(76,58,38,0.05)] sm:min-h-[224px] sm:p-5">
            <div className="grid grid-cols-[minmax(86px,0.9fr)_minmax(0,1fr)] gap-3 sm:grid-cols-[minmax(110px,0.95fr)_minmax(0,1fr)] sm:gap-4">
                <div className="flex min-w-0 flex-col items-center justify-center rounded-md border border-[#f0e6dc] bg-[#fcfaf6] px-2 py-3 text-center">
                    <p className="font-serif text-5xl leading-none text-[#100c09] sm:text-6xl">{character.char || '?'}</p>
                    <p className="mt-2 line-clamp-2 break-keep text-sm font-semibold leading-5 text-[#31261e] sm:mt-3 sm:text-base sm:leading-6">
                        {character.meaning || '-'}
                    </p>
                </div>

                <dl className="grid min-w-0 content-center divide-y divide-[#f0e6dc] rounded-md border border-[#f0e6dc] bg-white/54 px-3 text-xs sm:px-4 sm:text-sm">
                    <CardFact label="획수" value={character.tot_stk ? `${character.tot_stk}획` : '-'} />
                    <CardFact label="오행" value={formatElement(character.main_elem)} />
                    <CardFact label="부수" value={formatRadical(character)} />
                </dl>
            </div>

            <p className="mt-3 line-clamp-2 border-t border-[#f0e6dc] pt-3 text-center text-xs leading-5 text-[#74675a] sm:mt-4 sm:text-sm sm:leading-6">
                {character.detail_mean || '상세 뜻 정보가 없습니다.'}
            </p>
        </article>
    );
}

function CardFact({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex min-w-0 items-center justify-between gap-2 py-2 sm:py-2.5">
            <dt className="shrink-0 text-[#8a7b6c]">{label}</dt>
            <dd className="min-w-0 truncate font-semibold text-[#493b2d]">{value}</dd>
        </div>
    );
}

function formatRadical(character: HanjaCardData) {
    const radical = [character.rad, character.rad_mean].filter(Boolean).join(' · ');
    return radical || '-';
}

function Pagination({
    currentPage,
    totalPages,
    params,
}: {
    currentPage: number;
    totalPages: number;
    params: HrefParams;
}) {
    if (totalPages <= 1) return null;

    return (
        <nav className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-[#e7dacb] bg-white/62 px-3 py-3">
            <PageLink
                href={buildHanjaHref({ ...params, page: Math.max(1, currentPage - 1) })}
                disabled={currentPage <= 1}
                label="이전"
                icon={<ChevronLeft className="h-4 w-4" />}
            />
            <p className="text-sm font-semibold text-[#625447]">
                {currentPage} / {totalPages}
            </p>
            <PageLink
                href={buildHanjaHref({ ...params, page: Math.min(totalPages, currentPage + 1) })}
                disabled={currentPage >= totalPages}
                label="다음"
                icon={<ChevronRight className="h-4 w-4" />}
                iconAfter
            />
        </nav>
    );
}

function PageLink({
    href,
    disabled,
    label,
    icon,
    iconAfter = false,
}: {
    href: string;
    disabled: boolean;
    label: string;
    icon: React.ReactNode;
    iconAfter?: boolean;
}) {
    if (disabled) {
        return (
            <span className="inline-flex h-10 items-center gap-1 rounded-md border border-[#eee3d8] px-3 text-sm font-semibold text-[#c4b7aa]">
                {!iconAfter && icon}
                {label}
                {iconAfter && icon}
            </span>
        );
    }

    return (
        <Link href={href} className="inline-flex h-10 items-center gap-1 rounded-md border border-[#d7c6af] px-3 text-sm font-semibold text-[#66584a] transition-colors hover:bg-[#f7efe4]">
            {!iconAfter && icon}
            {label}
            {iconAfter && icon}
        </Link>
    );
}

function StatePanel({ title, body }: { title: string; body: string }) {
    return (
        <div className="rounded-lg border border-[#e5d8c8] bg-white/68 px-6 py-14 text-center">
            <BookOpen className="mx-auto h-9 w-9 text-[#a7753e]" strokeWidth={1.5} />
            <h2 className="mt-4 font-serif text-2xl text-[#241c15]">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-[#75685b]">{body}</p>
        </div>
    );
}

type HrefParams = {
    search?: string;
    sound?: string;
    element?: string;
    strokes?: number | null;
    page?: number;
};

function buildHanjaHref(params: HrefParams) {
    const query = new URLSearchParams();

    if (params.search) query.set('search', params.search);
    if (params.sound && params.sound !== 'all') query.set('sound', params.sound);
    if (params.element && params.element !== 'all') query.set('element', params.element);
    if (params.strokes !== undefined && params.strokes !== null) query.set('strokes', String(params.strokes));
    if (params.page && params.page > 1) query.set('page', String(params.page));

    const serialized = query.toString();
    return serialized ? `/hanja?${serialized}` : '/hanja';
}

function formatElement(value?: string | null) {
    if (!value) return '-';

    const labels: Record<string, string> = {
        木: '목',
        火: '화',
        土: '토',
        金: '금',
        水: '수',
    };

    return labels[value] || value;
}

function formatCount(value: number) {
    return new Intl.NumberFormat('ko-KR').format(value);
}
