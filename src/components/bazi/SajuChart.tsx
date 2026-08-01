'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import type { BaziAuthStatus, BaziResult, PillarKey } from './types';
import { getStoredUserId } from '@/utils/supabase/client';

const pillarMeta: Record<PillarKey, { title: string; ganTenGodKey?: string; jiTenGodKey: string }> = {
    time: { title: '시주', ganTenGodKey: 'time_gan', jiTenGodKey: 'time_ji' },
    day: { title: '일주', jiTenGodKey: 'day_ji' },
    month: { title: '월주', ganTenGodKey: 'month_gan', jiTenGodKey: 'month_ji' },
    year: { title: '년주', ganTenGodKey: 'year_gan', jiTenGodKey: 'year_ji' },
};

const pillarOrder: PillarKey[] = ['time', 'day', 'month', 'year'];
const detailKeyByPillar: Record<PillarKey, 'hour' | 'day' | 'month' | 'year'> = {
    time: 'hour',
    day: 'day',
    month: 'month',
    year: 'year',
};

function Card({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <section className={`min-w-0 rounded-lg border border-[#eee2d6] bg-white/72 p-5 shadow-[0_12px_32px_rgba(58,42,29,0.06)] ${className}`}>
            {children}
        </section>
    );
}

function CardTitle({ title, body }: { title: string; body: string }) {
    return (
        <div>
            <div className="flex items-center gap-1.5">
                <h3 className="font-serif text-xl font-bold tracking-normal text-[#2a2018]">{title}</h3>
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#c89a6b] text-[10px] font-bold text-[#ae7442]">?</span>
            </div>
            <p className="mt-2 break-keep text-sm leading-6 text-[#73675c]">{body}</p>
        </div>
    );
}

export function SajuChart({ result }: { result: BaziResult }) {
    const pillars = result.four_pillars;
    const tenGods = result.ten_gods || {};
    const details = result.analysis?.details || {};

    return (
        <Card className="xl:col-span-2">
            <CardTitle title="사주 정국" body="태어난 순간의 네 기둥과 각 기둥의 세력, 지장간 구조입니다." />

            <div className="mt-4 overflow-hidden rounded-md border border-[#ecdccd] bg-[#fffaf4]">
                <div className="grid grid-cols-4 border-b border-[#eadfd4] text-center">
                    {pillarOrder.map((key) => (
                        <div key={key} className="border-r border-[#eadfd4] py-3 last:border-r-0 lg:py-4">
                            <p className="text-xs font-semibold text-[#65574b] lg:text-sm">{pillarMeta[key].title}</p>
                            <p className="mt-3 text-xs text-[#9d7750] lg:text-sm">{pillarMeta[key].ganTenGodKey ? tenGods[pillarMeta[key].ganTenGodKey] : '일간(나)'}</p>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-4 text-center">
                    {pillarOrder.map((key) => {
                        const pillar = pillars?.[key];
                        const detail = details[detailKeyByPillar[key]];
                        const branchInfo = detail?.branch;

                        return (
                            <article key={key} className="min-w-0 border-r border-[#eadfd4] last:border-r-0">
                                <div className="border-b border-[#eadfd4] py-4 lg:py-5">
                                    <p className="font-serif text-[2.15rem] leading-none text-[#15110d] lg:text-[2.85rem]">{pillar?.gan?.ch || '-'}</p>
                                </div>
                                <div className="border-b border-[#eadfd4] py-4 lg:py-5">
                                    <p className="font-serif text-[2.15rem] leading-none text-[#15110d] lg:text-[2.85rem]">{pillar?.ji?.ch || '-'}</p>
                                </div>
                                <p className="border-b border-[#eadfd4] py-3 text-xs text-[#8a6245] lg:text-sm">{tenGods[pillarMeta[key].jiTenGodKey] || '-'}</p>
                                <p className="break-keep px-2 py-3 text-center text-xs leading-5 text-[#74675b] lg:text-base lg:leading-7">
                                    {branchInfo?.jijanggan?.join(', ') || '없음'}
                                </p>
                            </article>
                        );
                    })}
                </div>
            </div>

        </Card>
    );
}

export function BaziInterpretationCard({
    result,
    authStatus,
    subjectName,
    birthParams,
}: {
    result: BaziResult;
    authStatus: BaziAuthStatus;
    subjectName?: string;
    birthParams?: {
        year: string;
        month: string;
        day: string;
        hour: string;
        min: string;
        sl: string;
        gen: string;
    };
}) {
    const router = useRouter();
    const [requestStatus, setRequestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [requestMessage, setRequestMessage] = useState('');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
    const isServiceReady = true;

    useEffect(() => {
        if (authStatus === 'checking') return;

        let isMounted = true;

        if (authStatus === 'member') {
            // 1. Instant synchronous check from browser local storage to prevent duplicate clicks during background request
            try {
                const todayStr = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
                const userId = getStoredUserId();
                if (userId) {
                    const storedDate = localStorage.getItem(`bazi_submitted_date_${userId}`);
                    if (storedDate === todayStr) {
                        setHasSubmittedToday(true);
                    }
                }
            } catch (e) {
                console.error('Failed to read Bazi submit date from local storage:', e);
            }
        }

        // 2. Perform deep asynchronous check with the backend status API
        const checkDailyStatus = async () => {
            try {
                const response = await fetch(
                    authStatus === 'member'
                        ? '/api/bazi/free-consultation/status'
                        : '/api/bazi/guest-consultation/status',
                );
                const data = await response.json();
                if (isMounted) {
                    if (data.isAdmin) {
                        // Administrators have no daily limit. Clear any local state blocks.
                        setHasSubmittedToday(false);
                        const userId = getStoredUserId();
                        if (userId) {
                            localStorage.removeItem(`bazi_submitted_date_${userId}`);
                        }
                    } else if (data.hasRequestedToday) {
                        setHasSubmittedToday(true);
                    } else if (data.isGuestDailyLimitReached) {
                        setRequestStatus('error');
                        setRequestMessage('오늘 비회원 무료 체험 신청이 마감되었습니다. 내일 다시 이용해주세요.');
                    } else {
                        setHasSubmittedToday(false);
                    }
                }
            } catch (err) {
                console.error('Failed to check daily free Bazi status:', err);
            }
        };

        checkDailyStatus();

        return () => {
            isMounted = false;
        };
    }, [authStatus]);

    const handleFreeConsultation = async () => {
        if (authStatus === 'checking') return;

        setRequestStatus('loading');
        setRequestMessage('');

        try {
            const response = await fetch(
                authStatus === 'member'
                    ? '/api/bazi/free-consultation'
                    : '/api/bazi/guest-consultation',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ result, subjectName, birthParams }),
                },
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || '무료 해설 신청에 실패했습니다.');
            }

            if (authStatus === 'member') {
                try {
                    const todayStr = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
                    const userId = getStoredUserId();
                    if (userId) {
                        localStorage.setItem(`bazi_submitted_date_${userId}`, todayStr);
                    }
                } catch (e) {
                    console.error('Failed to set local storage submission block lock:', e);
                }
            }

            setHasSubmittedToday(true);
            setIsConfirmOpen(false);
            setRequestStatus('success');
            router.push(authStatus === 'member' ? '/bazi/complete' : '/bazi/complete?guest=1');
        } catch (error) {
            setRequestStatus('error');
            setRequestMessage(error instanceof Error ? error.message : '무료 해설 신청에 실패했습니다.');
        }
    };

    return (
        <Card>
            <div className="flex gap-3">
                <Sparkles className="mt-1 h-6 w-6 shrink-0 text-[#b98451]" strokeWidth={1.4} />
                <div className="min-w-0 flex-1">
                    <CardTitle title="무료 사주 원국 해설" body="도원만의 사주 분석 기준을 바탕으로 AI가 원국의 구조와 흐름을 차분히 정리해드립니다." />
                </div>
            </div>

            <div className="mt-4 rounded-md bg-[#fbf5ef] p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <p className="mt-1 break-keep text-sm leading-6 text-[#7a6a5c]">
                            현재 화면에 표시된 사주 정국, 오행 균형, 합충형파해를 도원의 분석 관점으로 반영해 AI 해설로 일목요연하게 정리해 드립니다.
                        </p>
                    </div>

                    {!isServiceReady ? (
                        <button
                            type="button"
                            disabled
                            className="inline-flex h-11 shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-md bg-[#b8aa9c] px-5 text-sm font-semibold text-white opacity-75"
                        >
                            <Sparkles className="h-4 w-4" />
                            무료상담신청
                        </button>
                    ) : authStatus === 'checking' ? (
                        <button
                            type="button"
                            disabled
                            className="inline-flex h-11 shrink-0 cursor-wait items-center justify-center gap-2 rounded-md bg-[#b8aa9c] px-5 text-sm font-semibold text-white opacity-75"
                        >
                            <Sparkles className="h-4 w-4" />
                            회원 확인 중
                        </button>
                    ) : (
                        hasSubmittedToday ? (
                            <button
                                type="button"
                                disabled
                                className="inline-flex h-11 shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-md bg-[#dcd2c4] px-5 text-sm font-semibold text-[#807060]"
                            >
                                <Sparkles className="h-4 w-4" />
                                오늘 신청 완료
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsConfirmOpen(true)}
                                disabled={requestStatus === 'loading'}
                                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-[#2d241c] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#46382c] disabled:cursor-wait disabled:bg-[#76695d]"
                            >
                                <Sparkles className="h-4 w-4" />
                                {requestStatus === 'loading' ? '신청 중' : '무료상담신청'}
                            </button>
                        )
                    )}
                </div>

                {requestMessage && (
                    <p className={`mt-3 rounded-md px-3 py-2 text-sm leading-6 ${requestStatus === 'success'
                        ? 'bg-[#eef8ef] text-[#357247]'
                        : 'bg-[#fff2ec] text-[#a05738]'
                        }`}>
                        {requestMessage}
                    </p>
                )}

                {!isServiceReady ? (
                    <div className="mt-4 border-t border-[#ead9c8] pt-4">
                        <p className="break-keep text-sm leading-6 text-[#5d4c3d]">
                            현재 서비스 준비중입니다.
                        </p>
                    </div>
                ) : authStatus === 'guest' && (
                    <div className="mt-4 border-t border-[#ead9c8] pt-4">
                        <p className="break-keep text-sm leading-6 text-[#5d4c3d]">
                            비회원도 이 브라우저에서 매일 1회 무료 해설을 신청하고 다시 확인할 수 있습니다. 중요한 해설은{' '}
                            <Link href="/signup" className="font-semibold text-[#8d5e2f] underline underline-offset-4 hover:text-[#5d3f23]">
                                회원가입 후 보관함에 저장
                            </Link>
                            해주세요.
                        </p>
                    </div>
                )}

                {isServiceReady && authStatus !== 'checking' && hasSubmittedToday && (
                    <div className="mt-4 border-t border-[#ead9c8] pt-4">
                        <p className="break-keep text-sm leading-6 text-[#865d30]">
                            오늘 이미 무료 사주 원국 해설을 신청하셨습니다. 무료상담 서비스는 하루 1회 신청 가능합니다.{' '}
                            <Link href={authStatus === 'member' ? '/my/bazi-consultations' : '/bazi/guest-consultations'} className="font-semibold text-[#a06828] underline underline-offset-4 hover:text-[#5d3f23]">
                                {authStatus === 'member' ? '마이페이지 사주 보관함' : '비회원 해설 보관함'}
                            </Link>
                            에서 결과(약 5분 소요)를 확인해 보세요!
                        </p>
                    </div>
                )}
            </div>

            {isConfirmOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4" role="dialog" aria-modal="true" aria-labelledby="free-consultation-title">
                    <div className="w-full max-w-md rounded-lg border border-[#eadfd4] bg-[#fffdf9] p-5 shadow-[0_24px_70px_rgba(24,17,11,0.28)]">
                        <h4 id="free-consultation-title" className="font-serif text-xl font-bold tracking-normal text-[#2a2018]">무료상담 신청 안내</h4>
                        <p className="mt-3 break-keep text-sm leading-7 text-[#66584c]">
                            현재 조회한 만세력 결과를 도원만의 사주 분석 기준으로 살피고, AI가 정리한 원국 해설을 신청합니다. 생성에는 보통 5~10분 정도 소요됩니다. 무료상담은 하루 1회 신청 가능하고, 상담 결과는 {authStatus === 'member' ? '마이페이지' : '이 브라우저의 비회원 해설 보관함'}에서 확인 가능합니다.
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsConfirmOpen(false)}
                                disabled={requestStatus === 'loading'}
                                className="inline-flex h-10 items-center justify-center rounded-md border border-[#d8c4ad] bg-white px-4 text-sm font-semibold text-[#5d4c3d] transition-colors hover:bg-[#fbf5ef] disabled:cursor-wait disabled:opacity-60"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={handleFreeConsultation}
                                disabled={requestStatus === 'loading'}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#2d241c] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#46382c] disabled:cursor-wait disabled:bg-[#76695d]"
                            >
                                <Sparkles className="h-4 w-4" />
                                {requestStatus === 'loading' ? '신청 중' : '신청하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
