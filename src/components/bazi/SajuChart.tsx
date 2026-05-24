'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import type { BaziAuthStatus, BaziResult, PillarKey } from './types';

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

export function BaziInterpretationCard({ result, authStatus }: { result: BaziResult; authStatus: BaziAuthStatus }) {
    const [requestStatus, setRequestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [requestMessage, setRequestMessage] = useState('');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const isServiceReady = false;

    const handleFreeConsultation = async () => {
        if (authStatus !== 'member') return;

        setRequestStatus('loading');
        setRequestMessage('');

        try {
            const response = await fetch('/api/bazi/free-consultation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ result }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || '무료 해설 신청에 실패했습니다.');
            }

            setRequestStatus('success');
            setRequestMessage(data?.message || '무료 사주 원국 해설을 이메일로 발송했습니다.');
            setIsConfirmOpen(false);
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
                    <CardTitle title="무료 사주 원국 해설" body="지금 조회한 만세력 결과를 바탕으로 원국의 구조와 흐름을 자세히 풀어드립니다." />
                </div>
            </div>

            <div className="mt-4 rounded-md bg-[#fbf5ef] p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <p className="mt-1 break-keep text-sm leading-6 text-[#7a6a5c]">
                            현재 화면에 표시된 사주 정국, 오행 균형, 합충형파해 정보를 함께 반영해 기본 성향과 흐름을 정리하고 가입된 회원 이메일로 보내드립니다.
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
                    ) : authStatus === 'member' ? (
                        <button
	                            type="button"
	                            onClick={() => setIsConfirmOpen(true)}
	                            disabled={requestStatus === 'loading'}
                            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-[#2d241c] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#46382c] disabled:cursor-wait disabled:bg-[#76695d]"
                        >
                            <Sparkles className="h-4 w-4" />
                            {requestStatus === 'loading' ? '신청 중' : '무료상담신청'}
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
                        <button
                            type="button"
                            disabled
                            className="inline-flex h-11 shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-md bg-[#b8aa9c] px-5 text-sm font-semibold text-white opacity-75"
                        >
                            <Sparkles className="h-4 w-4" />
                            무료상담신청
                        </button>
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
                            무료 사주 원국 해설은 회원에게 제공됩니다.{' '}
                            <Link href="/signup" className="font-semibold text-[#8d5e2f] underline underline-offset-4 hover:text-[#5d3f23]">
                                회원가입 후 신청해주세요.
                            </Link>
                        </p>
                    </div>
                )}
            </div>

            {isConfirmOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4" role="dialog" aria-modal="true" aria-labelledby="free-consultation-title">
                    <div className="w-full max-w-md rounded-lg border border-[#eadfd4] bg-[#fffdf9] p-5 shadow-[0_24px_70px_rgba(24,17,11,0.28)]">
                        <h4 id="free-consultation-title" className="font-serif text-xl font-bold tracking-normal text-[#2a2018]">무료상담 신청 안내</h4>
                        <p className="mt-3 break-keep text-sm leading-7 text-[#66584c]">
                            현재 조회한 만세력 결과에 대한 자세한 원국 해설을 신청합니다. 무료상담은 하루 1회 신청 가능하고, 상담 결과는 마이페이지 및 이메일에서 확인 가능합니다.
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
