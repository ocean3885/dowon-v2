'use client';

import Link from 'next/link';
import { CalendarDays, ChevronRight, Loader2 } from 'lucide-react';
import type { BaziResult } from './types';

type BaziConsultationListRow = {
    id: string;
    subject_name: string | null;
    request_date_kst: string;
    bazi_result: BaziResult;
    status: string | null;
    created_at: string;
};

export function BaziConsultationListItem({
    consultation,
    href,
}: {
    consultation: BaziConsultationListRow;
    href: string;
}) {
    const status = consultation.status || 'completed';
    const isPending = status === 'pending';
    const isFailed = status === 'failed';
    const title = formatBaziTitle(consultation);

    return (
        <article className="rounded-lg border border-[#ded4c8] bg-white/82 p-5 shadow-[0_12px_35px_rgba(70,54,36,0.06)] transition-all hover:shadow-[0_18px_45px_rgba(70,54,36,0.09)]">
            <Link href={href} className="group block">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex h-8 items-center rounded-full bg-[#f7efe5] px-3 text-xs font-semibold text-[#7a542a]">
                                {consultation.request_date_kst}
                            </span>
                            {isPending && (
                                <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#ead9c8] bg-[#fff8ed] px-3 text-xs font-semibold text-[#a87943]">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    분석중
                                </span>
                            )}
                            {isFailed && (
                                <span className="inline-flex h-8 items-center rounded-full border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-600">
                                    생성 실패
                                </span>
                            )}
                            <span className="inline-flex h-8 items-center gap-1 rounded-full border border-[#ead9c8] bg-[#fcfaf6] px-3 text-xs font-semibold text-[#746a61]">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {formatDateTime(consultation.created_at)}
                            </span>
                        </div>

                        <h2 className="mt-3 break-keep font-serif text-xl text-[#2a2119] transition-colors group-hover:text-[#8f6235]">
                            {title}
                        </h2>
                        {renderBirthDetails(consultation) && (
                            <p className="mt-2 w-fit rounded-md border border-[#f0e6da] bg-[#fdfaf5] px-3 py-1.5 text-xs font-semibold text-[#8a7664]">
                                생년월일시: {renderBirthDetails(consultation)}
                            </p>
                        )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
                        <span className="inline-flex h-10 items-center gap-1 rounded-md bg-[#2d241c] px-4 text-sm font-semibold text-white transition group-hover:bg-[#46382c]">
                            상세보기
                            <ChevronRight className="h-4 w-4" />
                        </span>
                    </div>
                </div>
            </Link>
        </article>
    );
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

function formatBaziTitle(item: BaziConsultationListRow) {
    const pillars = formatBaziPillars(item.bazi_result);
    return item.subject_name ? `${item.subject_name} · ${pillars}` : pillars;
}

function formatBaziPillars(result: BaziResult) {
    const pillars = result.four_pillars;
    const year = formatStemBranch(pillars?.year);
    const month = formatStemBranch(pillars?.month);
    const day = formatStemBranch(pillars?.day);
    const time = formatStemBranch(pillars?.time);

    return [year, month, day, time].filter(Boolean).join(' · ') || '사주 원국 해설';
}

function formatStemBranch(pillar?: NonNullable<BaziResult['four_pillars']>[keyof NonNullable<BaziResult['four_pillars']>]) {
    const gan = pillar?.gan?.ch || pillar?.gan?.kr || '';
    const ji = pillar?.ji?.ch || pillar?.ji?.kr || '';
    return `${gan}${ji}`.trim();
}

function renderBirthDetails(item: BaziConsultationListRow) {
    const params = item.bazi_result.birth_params;
    const gender = item.bazi_result.meta?.gender || params?.gen || '-';

    if (params) {
        const calendarType = params.sl === 'sol' ? '양력' : params.sl === 'lun' ? '음력' : '음력(윤)';
        const timeStr = `${params.hour}시 ${params.min}분`;
        return `${calendarType} ${params.year}년 ${params.month}월 ${params.day}일 ${timeStr} · ${gender}성`;
    }

    const solar = item.bazi_result.calendar?.solar;
    if (solar?.year) {
        return `양력 ${solar.year}년 ${solar.month}월 ${solar.day}일 · ${gender}성`;
    }

    return null;
}
