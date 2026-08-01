'use client';

import Link from 'next/link';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { BaziResult } from '@/components/bazi/types';
import type { BaziGenerationMetadata } from '@/lib/bazi-prompt-config';

type BaziConsultationStatus = 'pending' | 'completed' | 'failed' | string;

type AdminBaziConsultation = {
    id: string;
    type: 'member' | 'guest';
    ownerLabel: string;
    ownerMeta: string;
    subjectName: string | null;
    requestDate: string;
    baziResult: BaziResult | null;
    prompt: string | null;
    resultText: string | null;
    promptVersion: string | null;
    generationMetadata: BaziGenerationMetadata | null;
    status: BaziConsultationStatus;
    completedAt: string | null;
    errorMessage: string | null;
    createdAt: string;
};

export default function AdminBaziConsultationList({
    consultations,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
}: {
    consultations: AdminBaziConsultation[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
}) {
    const [expandedKey, setExpandedKey] = useState<string | null>(null);

    return (
        <div className="mt-8 rounded-xl border border-stone-200 bg-white shadow-sm">
            <div className="flex flex-col gap-1 border-b border-stone-100 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-stone-400">Recent Requests</p>
                    <h3 className="mt-1 text-xl font-bold text-stone-700">최근 만세력 상담 신청</h3>
                </div>
                <p className="text-xs text-stone-400">
                    총 {totalCount.toLocaleString('ko-KR')}건 중 {getPageRangeText(currentPage, pageSize, consultations.length)}
                </p>
            </div>

            {consultations.length === 0 ? (
                <div className="px-5 py-12 text-center text-sm text-stone-400">
                    아직 만세력 상담 신청 내역이 없습니다.
                </div>
            ) : (
                <div className="divide-y divide-stone-100">
                    <div className="hidden grid-cols-[96px_minmax(170px,1fr)_minmax(130px,0.7fr)_minmax(150px,0.8fr)_110px_120px] bg-stone-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-stone-400 lg:grid">
                        <div>구분</div>
                        <div>신청자</div>
                        <div>대상</div>
                        <div>신청일</div>
                        <div>상태</div>
                        <div className="text-right">상세</div>
                    </div>
                    {consultations.map((item) => (
                        <ConsultationRow
                            key={`${item.type}-${item.id}`}
                            item={item}
                            expandedKey={expandedKey}
                            onExpandedKeyChange={setExpandedKey}
                        />
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} />
            )}
        </div>
    );
}

function ConsultationRow({
    item,
    expandedKey,
    onExpandedKeyChange,
}: {
    item: AdminBaziConsultation;
    expandedKey: string | null;
    onExpandedKeyChange: (key: string | null) => void;
}) {
    const rowKey = `${item.type}-${item.id}`;
    const isExpanded = expandedKey === rowKey;

    return (
        <article className="transition-colors hover:bg-stone-50/70">
            <div className="grid gap-4 px-5 py-4 lg:grid-cols-[96px_minmax(170px,1fr)_minmax(130px,0.7fr)_minmax(150px,0.8fr)_110px_120px] lg:items-start">
                <div>
                    <span className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-bold ${
                        item.type === 'member'
                            ? 'bg-stone-800 text-white'
                            : 'bg-amber-50 text-amber-700'
                    }`}>
                        {item.type === 'member' ? '회원' : '비회원'}
                    </span>
                </div>
                <div className="min-w-0">
                    <p className="break-words font-bold text-stone-800 [overflow-wrap:anywhere]">{item.ownerLabel}</p>
                    <p className="mt-1 break-words text-xs text-stone-400 [overflow-wrap:anywhere]">{item.ownerMeta}</p>
                </div>
                <div className="text-sm font-medium text-stone-700">
                    <MobileLabel>대상</MobileLabel>
                    {item.subjectName || '이름 미입력'}
                </div>
                <div className="text-sm text-stone-600">
                    <MobileLabel>신청일</MobileLabel>
                    <p className="font-semibold">{item.requestDate}</p>
                    <p className="mt-1 text-xs text-stone-400">{formatDateTime(item.createdAt)}</p>
                </div>
                <div>
                    <MobileLabel>상태</MobileLabel>
                    <StatusBadge status={item.status} />
                </div>
                <div className="flex items-center justify-start lg:justify-end">
                    <button
                        type="button"
                        onClick={() => onExpandedKeyChange(isExpanded ? null : rowKey)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-stone-200 bg-white px-3 text-sm font-semibold text-stone-600 transition-colors hover:bg-stone-50"
                        aria-expanded={isExpanded}
                    >
                        상세
                        <ChevronDown
                            size={16}
                            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                        />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-stone-100 bg-stone-50/50 px-5 py-5">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                        <dl className="grid content-start gap-2.5 rounded-lg border border-stone-100 bg-white p-4 text-sm text-stone-600">
                            <DetailRow label="상담 ID" value={item.id} />
                            <DetailRow label="프롬프트" value={item.promptVersion || item.generationMetadata?.promptVersion} />
                            <DetailRow label="모델" value={item.generationMetadata?.model} />
                            <DetailRow label="완료일" value={formatDateTime(item.completedAt)} />
                            <DetailRow label="출생 정보" value={formatBirthDetails(item.baziResult)} />
                            <DetailRow label="사주 원국" value={formatBaziPillars(item.baziResult)} />
                        </dl>
                        <div className="grid gap-4">
                            {item.errorMessage && (
                                <DetailPanel title="오류 메시지" tone="error">
                                    {item.errorMessage}
                                </DetailPanel>
                            )}
                            <DetailPanel title="해설 내용">
                                {item.resultText?.trim() || getEmptyResultMessage(item.status)}
                            </DetailPanel>
                            {item.generationMetadata?.steps?.length ? (
                                <DetailPanel title="중간 분석 결과">
                                    {formatGenerationSteps(item.generationMetadata)}
                                </DetailPanel>
                            ) : null}
                            {item.prompt?.trim() && (
                                <DetailPanel title="프롬프트">
                                    {item.prompt}
                                </DetailPanel>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </article>
    );
}

function DetailPanel({
    title,
    tone = 'default',
    children,
}: {
    title: string;
    tone?: 'default' | 'error';
    children: string;
}) {
    return (
        <section className={`rounded-lg border p-4 ${
            tone === 'error'
                ? 'border-red-100 bg-red-50 text-red-700'
                : 'border-stone-100 bg-white text-stone-700'
        }`}>
            <h4 className="text-sm font-bold text-stone-700">{title}</h4>
            <p className="mt-3 max-h-[420px] overflow-y-auto whitespace-pre-wrap break-words text-sm leading-7 [overflow-wrap:anywhere]">
                {children}
            </p>
        </section>
    );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="grid grid-cols-[76px_minmax(0,1fr)] gap-2">
            <dt className="font-semibold text-stone-400">{label}</dt>
            <dd className="break-words text-stone-700 [overflow-wrap:anywhere]">{value || '-'}</dd>
        </div>
    );
}

function MobileLabel({ children }: { children: React.ReactNode }) {
    return <span className="mb-1 block text-xs font-bold text-stone-400 lg:hidden">{children}</span>;
}

function StatusBadge({ status }: { status: BaziConsultationStatus }) {
    const label = status === 'completed' ? '완료' : status === 'failed' ? '실패' : '분석중';
    const className = status === 'completed'
        ? 'bg-emerald-50 text-emerald-700'
        : status === 'failed'
            ? 'bg-red-50 text-red-600'
            : 'bg-amber-50 text-amber-700';

    return (
        <span className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-bold ${className}`}>
            {label}
        </span>
    );
}

function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
        .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2);

    return (
        <nav className="flex flex-wrap items-center justify-center gap-1.5 border-t border-stone-100 px-5 py-4" aria-label="만세력 상담 페이지 네비게이션">
            <PageLink page={currentPage - 1} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
            </PageLink>
            {pages.map((page, index) => {
                const previous = pages[index - 1];
                const shouldShowGap = previous !== undefined && page - previous > 1;

                return (
                    <span key={page} className="flex items-center gap-1.5">
                        {shouldShowGap && <span className="px-1 text-sm text-stone-300">...</span>}
                        <PageLink page={page} active={page === currentPage}>
                            {page}
                        </PageLink>
                    </span>
                );
            })}
            <PageLink page={currentPage + 1} disabled={currentPage === totalPages}>
                <ChevronRight className="h-4 w-4" />
            </PageLink>
        </nav>
    );
}

function PageLink({
    page,
    active = false,
    disabled = false,
    children,
}: {
    page: number;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
}) {
    const href = disabled ? '#' : buildBaziConsultationsHref(page);

    return (
        <Link
            href={href}
            aria-disabled={disabled}
            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm font-semibold transition-colors ${
                active
                    ? 'border-stone-800 bg-stone-800 text-white'
                    : disabled
                        ? 'pointer-events-none border-stone-100 bg-stone-50 text-stone-300'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
            }`}
        >
            {children}
        </Link>
    );
}

function buildBaziConsultationsHref(page: number) {
    if (page <= 1) return '/admin/bazi-consultations';
    return `/admin/bazi-consultations?page=${page}`;
}

function getPageRangeText(currentPage: number, pageSize: number, currentLength: number) {
    if (currentLength === 0) return '0건 표시';
    const start = (currentPage - 1) * pageSize + 1;
    const end = start + currentLength - 1;
    return `${start.toLocaleString('ko-KR')}-${end.toLocaleString('ko-KR')}건 표시`;
}

function getEmptyResultMessage(status: BaziConsultationStatus) {
    if (status === 'pending') return '아직 해설 생성이 완료되지 않았습니다.';
    if (status === 'failed') return '해설 생성에 실패하여 표시할 내용이 없습니다.';
    return '저장된 해설 내용이 없습니다.';
}

function formatGenerationSteps(metadata: BaziGenerationMetadata) {
    return metadata.steps
        .map((step) => [
            `[${step.label}] ${step.ok ? '성공' : '실패'}`,
            step.ok ? step.content : step.error || '오류 메시지가 없습니다.',
        ].join('\n'))
        .join('\n\n');
}

function formatDateTime(value?: string | null) {
    if (!value) return '-';
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

function formatBaziPillars(result?: BaziResult | null) {
    const pillars = result?.four_pillars;
    const year = formatStemBranch(pillars?.year);
    const month = formatStemBranch(pillars?.month);
    const day = formatStemBranch(pillars?.day);
    const time = formatStemBranch(pillars?.time);

    return [year, month, day, time].filter(Boolean).join(' · ') || '-';
}

function formatStemBranch(pillar?: NonNullable<BaziResult['four_pillars']>[keyof NonNullable<BaziResult['four_pillars']>]) {
    const gan = pillar?.gan?.ch || pillar?.gan?.kr || '';
    const ji = pillar?.ji?.ch || pillar?.ji?.kr || '';
    return `${gan}${ji}`.trim();
}

function formatBirthDetails(result?: BaziResult | null) {
    const params = result?.birth_params;
    const gender = result?.meta?.gender || params?.gen || '-';

    if (params) {
        const calendarType = params.sl === 'sol' ? '양력' : params.sl === 'lun' ? '음력' : '음력(윤)';
        return `${calendarType} ${params.year}년 ${params.month}월 ${params.day}일 ${params.hour}시 ${params.min}분 · ${gender}성`;
    }

    const solar = result?.calendar?.solar;
    if (solar?.year) {
        return `양력 ${solar.year}년 ${solar.month}월 ${solar.day}일 · ${gender}성`;
    }

    return '-';
}
