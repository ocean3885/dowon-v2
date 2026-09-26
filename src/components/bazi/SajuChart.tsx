'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Sparkles,
    Shield,
    Star,
    Compass,
    Briefcase,
    Zap,
    HelpCircle,
} from 'lucide-react';
import type {
    BaziAuthStatus,
    BaziResult,
    PillarKey,
    JijangganDetail,
} from './types';
import { getStoredUserId } from '@/utils/supabase/client';

const pillarMeta: Record<PillarKey, { title: string; ganTenGodKey?: string; jiTenGodKey: string }> = {
    time: { title: '시주(時柱)', ganTenGodKey: 'time_gan', jiTenGodKey: 'time_ji' },
    day: { title: '일주(日柱)', jiTenGodKey: 'day_ji' },
    month: { title: '월주(月柱)', ganTenGodKey: 'month_gan', jiTenGodKey: 'month_ji' },
    year: { title: '년주(年柱)', ganTenGodKey: 'year_gan', jiTenGodKey: 'year_ji' },
};

const pillarOrder: PillarKey[] = ['time', 'day', 'month', 'year'];
const detailKeyByPillar: Record<PillarKey, 'hour' | 'day' | 'month' | 'year'> = {
    time: 'hour',
    day: 'day',
    month: 'month',
    year: 'year',
};

// Default fallback colors if API color is missing
const elementColorClassMap: Record<string, string> = {
    목: 'bg-[#417e50] text-white',
    화: 'bg-[#db3c39] text-white',
    토: 'bg-[#c58e49] text-white',
    금: 'bg-[#707271] text-white',
    수: 'bg-[#437b99] text-white',
};

const elementBgClassMap: Record<string, string> = {
    목: 'border-[#417e50]/30 bg-[#417e50]/10 text-[#2d5c38]',
    화: 'border-[#db3c39]/30 bg-[#db3c39]/10 text-[#9c2422]',
    토: 'border-[#c58e49]/30 bg-[#c58e49]/10 text-[#885a21]',
    금: 'border-[#707271]/30 bg-[#707271]/10 text-[#4c4e4d]',
    수: 'border-[#437b99]/30 bg-[#437b99]/10 text-[#2a5b75]',
};

export function Card({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <section className={`min-w-0 rounded-lg border border-[#eee2d6] bg-white/78 p-5 shadow-[0_12px_32px_rgba(58,42,29,0.06)] backdrop-blur-sm ${className}`}>
            {children}
        </section>
    );
}

export function CardTitle({
    title,
    body,
    icon: Icon,
    badge,
}: {
    title: string;
    body: string;
    icon?: typeof Sparkles;
    badge?: string;
}) {
    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-5 w-5 text-[#ae7442]" />}
                    <h3 className="font-serif text-xl font-bold tracking-normal text-[#2a2018]">{title}</h3>
                </div>
                <p className="mt-1.5 break-keep text-sm leading-6 text-[#73675c]">{body}</p>
            </div>
            {badge && (
                <span className="mt-1 inline-flex shrink-0 items-center rounded-full border border-[#d6ba99] bg-[#fbf5ee] px-3 py-1 text-xs font-semibold text-[#8b5a2b] sm:mt-0">
                    {badge}
                </span>
            )}
        </div>
    );
}

export function SajuChart({ result }: { result: BaziResult }) {
    const pillars = result.four_pillars;
    const tenGods = result.ten_gods || {};
    const specialStarsByPillar = result.advanced_analysis?.special_stars_by_pillar || {};
    const details = result.analysis?.details || {};

    return (
        <Card className="xl:col-span-2">
            <CardTitle
                title="사주 정국 (四柱 正局)"
                body="태어난 순간 부여된 4개의 기둥, 오행의 성질, 12운성 및 지장간 상세 구조입니다."
                icon={Sparkles}
            />

            <div className="mt-5 overflow-hidden rounded-xl border border-[#ecdccd] bg-[#fffaf4] shadow-inner">
                {/* Header Row: Pillar Names & Top Stars */}
                <div className="grid grid-cols-4 border-b border-[#eadfd4] text-center bg-[#faf4ec]">
                    {pillarOrder.map((key) => {
                        const stars = specialStarsByPillar[key] || (key === 'time' ? specialStarsByPillar.hour : []) || [];
                        const ganTenGod = pillarMeta[key].ganTenGodKey ? tenGods[pillarMeta[key].ganTenGodKey] : '일간(본인)';

                        return (
                            <div key={key} className="flex flex-col justify-between border-r border-[#eadfd4] p-3 last:border-r-0 lg:p-4">
                                <div>
                                    <span className="inline-block rounded-md bg-[#eee4d6] px-2.5 py-0.5 text-xs font-bold text-[#56483c] lg:text-sm">
                                        {pillarMeta[key].title}
                                    </span>
                                    <p className="mt-2 text-xs font-semibold text-[#a07141] lg:text-sm">{ganTenGod}</p>
                                </div>
                                {stars.length > 0 && (
                                    <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
                                        {stars.map((star) => (
                                            <span
                                                key={star}
                                                className="rounded bg-[#eed9c4] px-1.5 py-0.5 text-[10px] font-semibold text-[#7e4f21] lg:text-xs"
                                            >
                                                {star}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Main 4-Pillars Grid */}
                <div className="grid grid-cols-4 text-center">
                    {pillarOrder.map((key) => {
                        const pillar = pillars?.[key] || (key === 'time' ? pillars?.hour : undefined);
                        const detail = details[detailKeyByPillar[key]];
                        const gan = pillar?.gan;
                        const ji = pillar?.ji;
                        const unseong = pillar?.unseong || detail?.stem?.unseong;

                        // Jijanggan list: prefer rich objects from pillar, fall back to string list from details
                        const jijangganList: JijangganDetail[] = pillar?.jijanggan || (
                            detail?.branch?.jijanggan?.map((ch) => ({ ch })) || []
                        );

                        const ganElemColor = gan?.element ? (elementBgClassMap[gan.element] || 'bg-[#efebe6] text-[#2c221a]') : 'bg-[#efebe6] text-[#2c221a]';
                        const jiElemColor = ji?.element ? (elementBgClassMap[ji.element] || 'bg-[#efebe6] text-[#2c221a]') : 'bg-[#efebe6] text-[#2c221a]';

                        return (
                            <article key={key} className="flex min-w-0 flex-col border-r border-[#eadfd4] last:border-r-0">
                                {/* Heavenly Stem (천간) */}
                                <div className="border-b border-[#eadfd4] bg-white/70 p-3 lg:p-5">
                                    <div className="mx-auto flex w-fit items-center gap-1.5">
                                        {gan?.element && (
                                            <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${elementColorClassMap[gan.element] || 'bg-neutral-600 text-white'}`}>
                                                {gan.element}
                                            </span>
                                        )}
                                        {gan?.yin_yang && (
                                            <span className="text-[11px] font-medium text-[#88786a]">{gan.yin_yang}</span>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <p className="font-serif text-3xl font-bold leading-none text-[#15110d] lg:text-[3.25rem]">
                                            {gan?.ch || '-'}
                                        </p>
                                        {gan?.kr && (
                                            <p className="mt-1 text-xs font-semibold text-[#837264] lg:text-sm">({gan.kr})</p>
                                        )}
                                    </div>
                                </div>

                                {/* Earthly Branch (지지) */}
                                <div className="border-b border-[#eadfd4] bg-white/70 p-3 lg:p-5">
                                    <div className="mx-auto flex w-fit items-center gap-1.5">
                                        {ji?.element && (
                                            <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${elementColorClassMap[ji.element] || 'bg-neutral-600 text-white'}`}>
                                                {ji.element}
                                            </span>
                                        )}
                                        {ji?.yin_yang && (
                                            <span className="text-[11px] font-medium text-[#88786a]">{ji.yin_yang}</span>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <p className="font-serif text-3xl font-bold leading-none text-[#15110d] lg:text-[3.25rem]">
                                            {ji?.ch || '-'}
                                        </p>
                                        {ji?.kr && (
                                            <p className="mt-1 text-xs font-semibold text-[#837264] lg:text-sm">({ji.kr})</p>
                                        )}
                                    </div>
                                </div>

                                {/* Ten God (지지 십성) & 12 Unseong */}
                                <div className="border-b border-[#eadfd4] bg-[#fbf7f1] px-2 py-2.5">
                                    <p className="text-xs font-bold text-[#8a6245] lg:text-sm">
                                        {tenGods[pillarMeta[key].jiTenGodKey] || '-'}
                                    </p>
                                    {unseong && (
                                        <span className="mt-1.5 inline-block rounded border border-[#d6beaa] bg-[#fffcf8] px-2 py-0.5 text-[11px] font-semibold text-[#735339]">
                                            {unseong}
                                        </span>
                                    )}
                                </div>

                                {/* Jijanggan Details */}
                                <div className="flex-1 bg-white/50 p-1.5 sm:p-2.5 lg:p-3">
                                    <p className="mb-1.5 text-[10px] font-semibold text-[#968677] sm:text-[11px]">
                                        지장간<span className="hidden sm:inline"> (地藏干)</span>
                                    </p>
                                    {jijangganList.length > 0 ? (
                                        <div className="space-y-1 sm:space-y-1.5">
                                            {jijangganList.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between rounded border border-[#efe6dc] bg-[#fffdfa] px-1.5 py-0.5 text-[11px] sm:px-2 sm:py-1 sm:text-xs"
                                                >
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-serif text-xs font-bold text-[#2d2117] sm:text-sm">{item.ch}</span>
                                                        {item.kr && <span className="hidden text-[10px] text-[#867566] sm:inline">({item.kr})</span>}
                                                        {item.type && (
                                                            <span className="hidden rounded bg-[#f0e7dd] px-1 text-[9px] text-[#715c4a] md:inline">
                                                                {item.type}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[10px] sm:text-[11px]">
                                                        {item.ten_god && (
                                                            <span className="font-medium text-[#9a6738]">{item.ten_god}</span>
                                                        )}
                                                        {item.ratio && (
                                                            <span className="hidden text-[10px] text-[#a19588] lg:inline">({item.ratio})</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-[#9d8f82]">없음</p>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
}

export function SpecialStarsCard({ result }: { result: BaziResult }) {
    const specialStars = result.advanced_analysis?.special_stars || [];

    if (specialStars.length === 0) return null;

    return (
        <Card className="xl:col-span-2">
            <CardTitle
                title="타고난 신살 및 길신 (神殺 · 吉神)"
                body="사주 원국에 깃든 고유한 재능, 잠재력 및 보호 작용을 해석합니다."
                icon={Star}
                badge={`총 ${specialStars.length}개 발견`}
            />

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {specialStars.map((star, index) => {
                    const isLucky = star.type?.includes('길신') || star.name.includes('귀인');
                    const isSpecial = star.type?.includes('특수');

                    return (
                        <div
                            key={`${star.name}-${index}`}
                            className="flex flex-col justify-between rounded-lg border border-[#eee2d6] bg-[#fcf8f3] p-4 transition hover:border-[#d9be9e] hover:shadow-sm"
                        >
                            <div>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                            isLucky
                                                ? 'bg-[#417e50]/20 text-[#2d5c38]'
                                                : isSpecial
                                                ? 'bg-[#c58e49]/20 text-[#885a21]'
                                                : 'bg-[#9a4b34]/20 text-[#9a4b34]'
                                        }`}>
                                            {isLucky ? '吉' : isSpecial ? '特' : '殺'}
                                        </span>
                                        <h4 className="font-serif text-lg font-bold text-[#2a2018]">{star.name}</h4>
                                    </div>
                                    {star.position && (
                                        <span className="rounded bg-[#eee3d6] px-2 py-0.5 text-xs font-semibold text-[#665445]">
                                            {star.position} ({star.char})
                                        </span>
                                    )}
                                </div>

                                {star.type && (
                                    <p className="mt-2 text-xs font-semibold text-[#a26e3c]">{star.type}</p>
                                )}

                                <p className="mt-2 break-keep text-xs leading-6 text-[#5e5043] lg:text-sm">
                                    {star.description || '고유한 기운과 특징을 나타냅니다.'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

export function XuShiDynamicsCard({ result }: { result: BaziResult }) {
    const xuShi = result.advanced_analysis?.xu_shi_dynamics;
    if (!xuShi) return null;

    const pillars = xuShi.pillars || {};
    const pillarKeys: Array<'year' | 'month' | 'day' | 'hour'> = ['year', 'month', 'day', 'hour'];
    const pillarLabels: Record<string, string> = {
        year: '년간',
        month: '월간',
        day: '일간',
        hour: '시간',
    };

    return (
        <Card>
            <CardTitle
                title="허실(虛實) 동태 & 통근 구조"
                body="천간 기운이 현실적 기반(뿌리)을 갖췄는지(실), 혹은 기획·표출(허투)로 쓰이는지 분석합니다."
                icon={Zap}
            />

            {xuShi.overall_status && (
                <div className="mt-5 rounded-lg border border-[#e5d4c2] bg-[#faf3ea] p-4">
                    <p className="text-xs font-bold text-[#a06f3e]">사주 전체 허실 총평</p>
                    <p className="mt-1.5 break-keep text-sm leading-6 text-[#45372a]">{xuShi.overall_status}</p>
                </div>
            )}

            <div className="mt-4 space-y-3">
                {pillarKeys.map((k) => {
                    const item = pillars[k];
                    if (!item) return null;
                    const isReal = item.current_status?.includes('실');

                    return (
                        <div key={k} className="rounded-lg border border-[#ede2d7] bg-[#fcf9f5] p-3.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-serif font-bold text-[#35281e]">
                                        {pillarLabels[k]} ({item.char})
                                    </span>
                                    <span className="text-xs font-medium text-[#7d6c5d]">{item.ten_star}</span>
                                </div>
                                <span className={`rounded px-2 py-0.5 text-xs font-bold ${
                                    isReal ? 'bg-[#417e50]/15 text-[#2d5c38]' : 'bg-[#c58e49]/15 text-[#885a21]'
                                }`}>
                                    {item.current_status || item.original_status || '-'}
                                </span>
                            </div>

                            {item.reason && (
                                <p className="mt-1.5 text-xs text-[#786757]">
                                    <span className="font-semibold text-[#5a483a]">뿌리 근거:</span> {item.reason}
                                </p>
                            )}
                            {item.meaning && (
                                <p className="mt-1 break-keep text-xs leading-5 text-[#4a3d31]">
                                    <span className="font-semibold text-[#a26e3c]">발현 특징:</span> {item.meaning}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

export function BinZhuDynamicsCard({ result }: { result: BaziResult }) {
    const binZhu = result.advanced_analysis?.bin_zhu_dynamics;
    if (!binZhu) return null;

    const controlFlow = binZhu.control_flow;
    const guestScope = binZhu.guest_structure?.scope || '년주/월주 (사회·시장·타인)';
    const hostScope = binZhu.host_structure?.scope || '일주/시주 (나·배우자·수단)';

    return (
        <Card>
            <CardTitle
                title="빈주(賓主) 구조 & 진로 흐름"
                body="사회·시장(빈)과 내면·수단(주)의 상호작용 및 최적의 커리어/행동 전략을 제시합니다."
                icon={Briefcase}
            />

            {controlFlow?.direction && (
                <div className="mt-5 rounded-lg border border-[#e5d4c2] bg-[#faf3ea] p-4">
                    <span className="inline-block rounded bg-[#eed8c1] px-2 py-0.5 text-xs font-bold text-[#865120]">
                        주된 역학 방향
                    </span>
                    <h4 className="mt-2 font-serif text-lg font-bold text-[#2a2018]">{controlFlow.direction}</h4>
                    {controlFlow.summary_meaning && (
                        <p className="mt-2 break-keep text-sm leading-6 text-[#514030]">
                            {controlFlow.summary_meaning}
                        </p>
                    )}
                </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-[#ede2d7] bg-[#fcf9f5] p-3.5">
                    <p className="text-xs font-bold text-[#846b54]">빈(賓) - 외부 환경</p>
                    <p className="mt-1 text-xs text-[#5a483a]">{guestScope}</p>
                </div>
                <div className="rounded-lg border border-[#ede2d7] bg-[#fcf9f5] p-3.5">
                    <p className="text-xs font-bold text-[#a06f3e]">주(主) - 내면과 수단</p>
                    <p className="mt-1 text-xs text-[#5a483a]">{hostScope}</p>
                </div>
            </div>

            {controlFlow?.career_advice && (
                <div className="mt-4 rounded-lg border border-[#d6beaa] bg-[#fffaf5] p-4">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-[#9d6836]">
                        <Compass className="h-4 w-4" />
                        진로 및 사회활동 조언
                    </p>
                    <p className="mt-1.5 break-keep text-sm leading-6 text-[#45372a]">
                        {controlFlow.career_advice}
                    </p>
                </div>
            )}
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
        <Card className="xl:col-span-2">
            <div className="flex gap-3">
                <Sparkles className="mt-1 h-6 w-6 shrink-0 text-[#b98451]" strokeWidth={1.4} />
                <div className="min-w-0 flex-1">
                    <CardTitle
                        title="무료 사주 원국 해설 신청"
                        body="고도화된 도원 명리학 엔진의 분석 데이터를 바탕으로 AI가 원국의 구조와 흐름을 정밀하게 해설해 드립니다."
                    />
                </div>
            </div>

            <div className="mt-4 rounded-xl border border-[#ecdccd] bg-[#fbf5ef] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <p className="break-keep text-sm leading-6 text-[#7a6a5c]">
                            사주 정국, 12운성, 지장간 세력, 오행 스코어, 신살, 허실 동태, 빈주 흐름을 총망라하여 나만을 위한 맞춤형 AI 리포트를 생성합니다.
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

                {isServiceReady && authStatus === 'guest' && (
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
