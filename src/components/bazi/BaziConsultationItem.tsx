'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, ChevronDown, ChevronUp, Edit2, Check, X, Loader2 } from 'lucide-react';
import type { BaziResult } from './types';
import { DeleteBaziConsultationButton } from './DeleteBaziConsultationButton';

type FreeBaziConsultationRow = {
    id: string;
    subject_name: string | null;
    request_date_kst: string;
    bazi_result: BaziResult;
    result_text: string | null;
    status: string | null;
    created_at: string;
};

export function BaziConsultationItem({ consultation }: { consultation: FreeBaziConsultationRow }) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(consultation.subject_name || '');
    const [currentName, setCurrentName] = useState(consultation.subject_name || '');
    const [isSaving, setIsSaving] = useState(false);
    const status = consultation.status || 'completed';
    const isPending = status === 'pending';
    const isFailed = status === 'failed';
    const hasResult = Boolean(consultation.result_text?.trim());

    useEffect(() => {
        if (!isPending) return;

        const intervalId = window.setInterval(() => {
            router.refresh();
        }, 15000);

        return () => window.clearInterval(intervalId);
    }, [isPending, router]);

    const handleSaveName = async () => {
        const trimmedName = newName.trim();
        setIsSaving(true);
        try {
            const response = await fetch('/api/bazi/free-consultation/rename', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: consultation.id, subjectName: trimmedName }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '이름 변경에 실패했습니다.');
            }

            setCurrentName(data.subject_name || '');
            setNewName(data.subject_name || '');
            setIsEditing(false);
        } catch (error) {
            alert(error instanceof Error ? error.message : '이름 변경에 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    const formatDateTime = (value?: string | null) => {
        if (!value) return '-';
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(value));
    };

    const formatBaziTitle = (item: FreeBaziConsultationRow, nameOverride?: string) => {
        const pillars = formatBaziPillars(item.bazi_result);
        const displayName = nameOverride !== undefined ? nameOverride : (item.subject_name || '');
        return displayName ? `${displayName} · ${pillars}` : pillars;
    };

    const formatBaziPillars = (result: BaziResult) => {
        const pillars = result.four_pillars;
        const year = formatStemBranch(pillars?.year);
        const month = formatStemBranch(pillars?.month);
        const day = formatStemBranch(pillars?.day);
        const time = formatStemBranch(pillars?.time);

        return [year, month, day, time].filter(Boolean).join(' · ') || '사주 원국 해설';
    };

    const formatStemBranch = (pillar?: NonNullable<BaziResult['four_pillars']>[keyof NonNullable<BaziResult['four_pillars']>]) => {
        const gan = pillar?.gan?.ch || pillar?.gan?.kr || '';
        const ji = pillar?.ji?.ch || pillar?.ji?.kr || '';
        return `${gan}${ji}`.trim();
    };

    const renderBirthDetails = (item: FreeBaziConsultationRow) => {
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
    };

    return (
        <article className="rounded-lg border border-[#ded4c8] bg-white/82 p-5 shadow-[0_12px_35px_rgba(70,54,36,0.06)] transition-all hover:shadow-[0_18px_45px_rgba(70,54,36,0.09)]">
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
                    {isEditing ? (
                        <div className="mt-3 flex items-center gap-2 max-w-sm">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                disabled={isSaving}
                                placeholder="이름 입력 (예: 내 사주, 친구)"
                                className="h-10 w-full rounded-md border border-[#d7c6af] bg-white px-3 text-sm text-[#493b2d] outline-none transition focus:border-[#ad7b42]"
                                maxLength={20}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveName();
                                    if (e.key === 'Escape') {
                                        setNewName(currentName);
                                        setIsEditing(false);
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleSaveName}
                                disabled={isSaving}
                                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#bd8a4c] text-white transition hover:bg-[#aa793d] disabled:opacity-50"
                            >
                                <Check className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setNewName(currentName);
                                    setIsEditing(false);
                                }}
                                disabled={isSaving}
                                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#d7c6af] bg-white text-[#66584a] transition hover:bg-[#f7efe4] disabled:opacity-50"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                            <h2 className="break-keep font-serif text-xl text-[#2a2119]">
                                {formatBaziTitle(consultation, currentName)}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#d7c6af]/60 bg-white/60 text-[#66584a] hover:bg-[#f7efe4] hover:text-[#7a542a] transition-all ml-1 shadow-sm"
                                title="이름 수정"
                            >
                                <Edit2 className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                    {renderBirthDetails(consultation) && (
                        <p className="mt-2 text-xs font-semibold text-[#8a7664] bg-[#fdfaf5] border border-[#f0e6da] rounded-md px-3 py-1.5 w-fit">
                            생년월일시: {renderBirthDetails(consultation)}
                        </p>
                    )}
                </div>
                <div className="shrink-0 self-start sm:self-center">
                    <DeleteBaziConsultationButton id={consultation.id} />
                </div>
            </div>

            {/* Interpretation Text Container with smooth transition */}
            <div className="relative mt-5">
                {isPending ? (
                    <div className="rounded-md border border-[#eee2d3] bg-[#fcfaf6] px-4 py-6 text-sm leading-7 text-[#6f6256] md:px-6">
                        <div className="flex items-center gap-2 font-semibold text-[#a87943]">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            분석중입니다...
                        </div>
                        <p className="mt-3 break-keep">
                            해설 생성이 완료되면 이곳에 자동으로 표시됩니다. 잠시 후 새로고침하거나 다시 확인해주세요.
                        </p>
                    </div>
                ) : isFailed ? (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-6 text-sm leading-7 text-red-700 md:px-6">
                        해설 생성에 실패했습니다. 불필요한 항목은 삭제 후 다시 신청해주세요.
                    </div>
                ) : (
                    <div
                        className={`whitespace-pre-wrap rounded-md border border-[#eee2d3] bg-[#fcfaf6] px-4 py-4 text-sm leading-8 text-[#4f463e] md:px-6 md:py-6 md:text-base md:leading-9 transition-all duration-300 ${
                            isExpanded ? 'max-h-none pb-4' : 'max-h-36 overflow-hidden pb-12'
                        }`}
                    >
                        {consultation.result_text}

                        {/* Gradient Fade Overlay when collapsed */}
                        {!isExpanded && (
                            <div className="absolute inset-x-0 bottom-0 h-16 rounded-b-md bg-gradient-to-t from-[#fcfaf6] via-[#fcfaf6]/80 to-transparent pointer-events-none" />
                        )}
                    </div>
                )}
            </div>

            {/* Toggle Button */}
            {hasResult && !isPending && !isFailed && (
                <div className="mt-4 flex justify-center">
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#d7c6af] bg-white px-4 text-xs font-semibold text-[#66584a] shadow-sm transition-all hover:bg-[#f7efe4] hover:text-[#7a542a]"
                >
                    {isExpanded ? (
                        <>
                            접기
                            <ChevronUp className="h-3.5 w-3.5" />
                        </>
                    ) : (
                        <>
                            해설 전체 펼쳐보기
                            <ChevronDown className="h-3.5 w-3.5" />
                        </>
                    )}
                </button>
                </div>
            )}
        </article>
    );
}
