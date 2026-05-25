import DeleteSajuRelationReadingButton from '@/components/admin/DeleteSajuRelationReadingButton';
import SajuRelationReadingStatusButtons from '@/components/admin/SajuRelationReadingStatusButtons';
import type { SajuRelationReading } from '@/lib/actions';
import { createClient } from '@/utils/supabase/server';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const statusLabels: Record<string, string> = {
    draft: '초안',
    approved: '승인',
    archived: '보관',
};

const relationTypeLabels: Record<string, string> = {
    clash: '충',
    combine: '합',
    stem_combine: '천간합',
    self_combine: '자합',
    punishment: '형',
    harm: '해',
    break: '파',
};

async function getSajuRelationReadings({
    page,
    limit,
    status,
    relationType,
    keyword,
}: {
    page: number;
    limit: number;
    status?: string;
    relationType?: string;
    keyword?: string;
}) {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('saju_relation_readings')
        .select('*', { count: 'exact' });

    if (status) {
        query = query.eq('status', status);
    }

    if (relationType) {
        query = query.eq('relation_type', relationType);
    }

    if (keyword) {
        const escapedKeyword = keyword.replace(/[%_]/g, '\\$&');
        query = query.or(
            `day_pillar.ilike.%${escapedKeyword}%,relation_key.ilike.%${escapedKeyword}%,title.ilike.%${escapedKeyword}%,summary.ilike.%${escapedKeyword}%`
        );
    }

    const { data, count, error } = await query
        .order('updated_at', { ascending: false })
        .order('id', { ascending: false })
        .range(from, to);

    if (error) throw error;

    return {
        readings: (data || []) as SajuRelationReading[],
        totalReadings: count || 0,
    };
}

function getPageNumbers(current: number, total: number) {
    if (total === 0) return [1];

    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);

    if (end - start < 4) {
        if (start === 1) end = Math.min(total, 5);
        else if (end === total) start = Math.max(1, total - 4);
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function buildPageHref(page: number, params: Record<string, string | undefined>) {
    const searchParams = new URLSearchParams();
    searchParams.set('page', String(page));

    for (const [key, value] of Object.entries(params)) {
        if (value) searchParams.set(key, value);
    }

    return `/admin/saju-relations?${searchParams.toString()}`;
}

const paginationLinkClass =
    'inline-flex h-9 min-w-9 items-center justify-center rounded border border-stone-200 bg-white px-3 text-sm font-medium text-stone-600 hover:bg-stone-50';
const paginationDisabledClass =
    'inline-flex h-9 min-w-9 cursor-not-allowed items-center justify-center rounded border border-stone-100 bg-stone-50 px-3 text-sm font-medium text-stone-300';

export default async function AdminSajuRelationsPage(props: {
    searchParams?: Promise<{
        page?: string;
        status?: string;
        relationType?: string;
        q?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const requestedPage = Number(searchParams?.page);
    const currentPage =
        Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1;
    const status = searchParams?.status || '';
    const relationType = searchParams?.relationType || '';
    const keyword = searchParams?.q?.trim() || '';
    const readingsPerPage = 12;

    const { readings, totalReadings } = await getSajuRelationReadings({
        page: currentPage,
        limit: readingsPerPage,
        status,
        relationType,
        keyword,
    });
    const totalPages = Math.ceil(totalReadings / readingsPerPage);
    const paginationParams = { status, relationType, q: keyword };

    if (totalPages > 0 && currentPage > totalPages) {
        redirect(buildPageHref(totalPages, paginationParams));
    }

    const pageNumbers = getPageNumbers(currentPage, totalPages);
    const rangeStart = totalReadings === 0 ? 0 : (currentPage - 1) * readingsPerPage + 1;
    const rangeEnd = Math.min(currentPage * readingsPerPage, totalReadings);

    return (
        <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-stone-800">사주 관계 해설 관리</h2>
                    <p className="mt-1 text-sm text-stone-500">
                        총 {totalReadings.toLocaleString('ko-KR')}개의 해설 데이터
                    </p>
                </div>
                <Link
                    href="/admin/saju-relations/create"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-stone-800 px-4 text-sm font-bold text-white transition-colors hover:bg-stone-700"
                >
                    <Plus size={16} />
                    신규 등록
                </Link>
            </div>

            <form className="mb-5 grid gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-[180px_180px_minmax(0,1fr)_auto]">
                <select
                    name="status"
                    defaultValue={status}
                    className="h-10 rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                >
                    <option value="">전체 상태</option>
                    <option value="draft">초안</option>
                    <option value="approved">승인</option>
                    <option value="archived">보관</option>
                </select>
                <select
                    name="relationType"
                    defaultValue={relationType}
                    className="h-10 rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                >
                    <option value="">전체 관계</option>
                    <option value="clash">충</option>
                    <option value="combine">합</option>
                    <option value="stem_combine">천간합</option>
                    <option value="self_combine">자합</option>
                    <option value="punishment">형</option>
                    <option value="harm">해</option>
                    <option value="break">파</option>
                </select>
                <input
                    name="q"
                    defaultValue={keyword}
                    placeholder="기준 일주, 관계 키, 제목, 요약 검색"
                    className="h-10 rounded-lg border border-stone-300 px-3 text-sm text-stone-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="h-10 rounded-lg bg-stone-800 px-4 text-sm font-bold text-white hover:bg-stone-700"
                    >
                        검색
                    </button>
                    <Link
                        href="/admin/saju-relations"
                        className="inline-flex h-10 items-center rounded-lg border border-stone-300 bg-white px-4 text-sm font-bold text-stone-600 hover:bg-stone-50"
                    >
                        초기화
                    </Link>
                </div>
            </form>

            <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
                <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full text-left">
                        <thead className="border-b border-stone-200 bg-stone-50">
                            <tr>
                                <th className="px-5 py-3 text-sm font-medium text-stone-500">ID</th>
                                <th className="px-5 py-3 text-sm font-medium text-stone-500">관계</th>
                                <th className="px-5 py-3 text-sm font-medium text-stone-500">조건</th>
                                <th className="px-5 py-3 text-sm font-medium text-stone-500">제목/요약</th>
                                <th className="px-5 py-3 text-sm font-medium text-stone-500">상태</th>
                                <th className="px-5 py-3 text-sm font-medium text-stone-500">수정일</th>
                                <th className="px-5 py-3 text-right text-sm font-medium text-stone-500">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {readings.map((reading) => (
                                <tr key={reading.id} className="hover:bg-stone-50">
                                    <td className="px-5 py-4 text-sm text-stone-500">{reading.id}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-bold text-stone-800">
                                                {relationTypeLabels[reading.relation_type] || reading.relation_type}
                                            </span>
                                            <span className="text-sm text-stone-500">{reading.relation_key}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-stone-600">
                                        <div>{reading.day_pillar}日柱 · {reading.actor_char}-{reading.target_char}</div>
                                        <div className="mt-1 text-xs text-stone-400">
                                            {reading.palace_pair || `${reading.actor_position}-${reading.target_position}`}
                                        </div>
                                    </td>
                                    <td className="max-w-md px-5 py-4">
                                        <Link
                                            href={`/admin/saju-relations/edit/${reading.id}`}
                                            className="font-medium text-stone-800 hover:underline"
                                        >
                                            {reading.title}
                                        </Link>
                                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-500">
                                            {reading.summary}
                                        </p>
                                        <div className="mt-3 rounded-md bg-stone-50 px-3 py-2">
                                            <p className="line-clamp-4 whitespace-pre-line text-xs leading-5 text-stone-500">
                                                {reading.detail}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <SajuRelationReadingStatusButtons id={reading.id} status={reading.status} />
                                    </td>
                                    <td className="px-5 py-4 text-sm text-stone-500 whitespace-nowrap">
                                        {format(new Date(reading.updated_at), 'yyyy-MM-dd', { locale: ko })}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link
                                                href={`/admin/saju-relations/edit/${reading.id}`}
                                                className="text-sm font-medium text-stone-600 hover:text-stone-900"
                                            >
                                                수정
                                            </Link>
                                            <DeleteSajuRelationReadingButton id={reading.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {readings.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-stone-400">
                                        등록된 사주 관계 해설이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="block divide-y divide-stone-100 lg:hidden">
                    {readings.map((reading) => (
                        <article key={reading.id} className="p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-600">
                                            {relationTypeLabels[reading.relation_type] || reading.relation_type}
                                        </span>
                                        <span className="text-xs font-semibold text-stone-400">
                                            {statusLabels[reading.status] || reading.status}
                                        </span>
                                    </div>
                                    <h3 className="mt-3 text-base font-bold leading-6 text-stone-800">
                                        <Link href={`/admin/saju-relations/edit/${reading.id}`} className="hover:underline">
                                            {reading.title}
                                        </Link>
                                    </h3>
                                </div>
                                <DeleteSajuRelationReadingButton id={reading.id} />
                            </div>
                            <p className="mt-2 text-sm leading-6 text-stone-500">{reading.summary}</p>
                            <div className="mt-3 grid gap-2 text-sm text-stone-500">
                                <span>{reading.day_pillar}日柱 · {reading.relation_key}</span>
                                <span>{reading.palace_pair || `${reading.actor_position}-${reading.target_position}`}</span>
                            </div>
                            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <SajuRelationReadingStatusButtons id={reading.id} status={reading.status} />
                                <Link
                                    href={`/admin/saju-relations/edit/${reading.id}`}
                                    className="text-sm font-medium text-stone-600 hover:text-stone-900"
                                >
                                    수정
                                </Link>
                            </div>
                        </article>
                    ))}
                    {readings.length === 0 && (
                        <div className="p-8 text-center text-sm text-stone-400">
                            등록된 사주 관계 해설이 없습니다.
                        </div>
                    )}
                </div>
            </div>

            {totalPages > 1 && (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-stone-500">
                        {rangeStart.toLocaleString('ko-KR')}-{rangeEnd.toLocaleString('ko-KR')} /{' '}
                        {totalReadings.toLocaleString('ko-KR')}개 표시
                    </p>
                    <div className="flex flex-wrap justify-center gap-1">
                        {currentPage > 1 ? (
                            <Link
                                href={buildPageHref(1, paginationParams)}
                                className={paginationLinkClass}
                            >
                                처음
                            </Link>
                        ) : (
                            <span className={paginationDisabledClass}>처음</span>
                        )}

                        {currentPage > 1 ? (
                            <Link
                                href={buildPageHref(currentPage - 1, paginationParams)}
                                className={paginationLinkClass}
                            >
                                이전
                            </Link>
                        ) : (
                            <span className={paginationDisabledClass}>이전</span>
                        )}

                        {pageNumbers.map((pageNumber) => (
                            <Link
                                key={pageNumber}
                                href={buildPageHref(pageNumber, paginationParams)}
                                aria-current={pageNumber === currentPage ? 'page' : undefined}
                                className={`inline-flex h-9 min-w-9 items-center justify-center rounded border px-3 text-sm font-medium ${
                                    pageNumber === currentPage
                                        ? 'border-stone-800 bg-stone-800 text-white'
                                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                                }`}
                            >
                                {pageNumber}
                            </Link>
                        ))}

                        {currentPage < totalPages ? (
                            <Link
                                href={buildPageHref(currentPage + 1, paginationParams)}
                                className={paginationLinkClass}
                            >
                                다음
                            </Link>
                        ) : (
                            <span className={paginationDisabledClass}>다음</span>
                        )}

                        {currentPage < totalPages ? (
                            <Link
                                href={buildPageHref(totalPages, paginationParams)}
                                className={paginationLinkClass}
                            >
                                마지막
                            </Link>
                        ) : (
                            <span className={paginationDisabledClass}>마지막</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
