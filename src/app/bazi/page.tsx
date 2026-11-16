'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
    ArrowRight,
    Bookmark,
    Clock3,
    Compass,
    Flower2,
    FolderOpen,
    Lightbulb,
    RefreshCw,
    Save,
    ScrollText,
    Sparkles,
    Sprout,
    Sun,
    Trash2,
    X,
    Scale,
} from 'lucide-react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import {
    BaziInterpretationCard,
    DayMonthInterpretationCard,
    SajuChart,
    SpecialStarsCard,
    Card,
    CardTitle,
} from '@/components/bazi/SajuChart';
import type {
    BaziAuthStatus,
    BaziCharacterGraph,
    BaziResult,
    CycleYearItem,
    DaewoonItem,
} from '@/components/bazi/types';
import { CycleRelations } from '@/components/bazi/CharacterRelations';
import { currentDaewoon, cycleQuery, graphIsCurrent, readBaziResponse, selectionYears, type BirthParams } from '@/lib/bazi-contract';
import { createClient } from '@/utils/supabase/client';

type BaziFormValues = {
    subjectName: string;
    year: string;
    month: string;
    day: string;
    hour: string;
    min: string;
    sl: string;
    gen: string;
};

type SavedBaziProfile = BaziFormValues & {
    id: string;
    label: string;
    createdAt?: string;
    updatedAt?: string;
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1899 }, (_, index) => String(currentYear - index));
const months = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'));
const days = Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, '0'));
const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));
const elementColors: Record<string, string> = {
    목: 'bg-[#417e50]',
    화: 'bg-[#db3c39]',
    토: 'bg-[#c58e49]',
    금: 'bg-[#707271]',
    수: 'bg-[#437b99]',
};

const elementHexColors: Record<string, string> = {
    목: '#417e50',
    화: '#db3c39',
    토: '#c58e49',
    금: '#707271',
    수: '#437b99',
};

const elementLabels: Record<string, string> = {
    목: '木',
    화: '火',
    토: '土',
    금: '金',
    수: '水',
};

const supportItems = [
    { icon: Flower2, title: '지금의 당신', body: '내 삶을 분석하여 현재의 상황을 읽어드립니다.' },
    { icon: Compass, title: '앞으로의 방향', body: '균형과 흐름을 통해 더 나은 선택을 돕습니다.' },
    { icon: Sun, title: '기억해야 할 것', body: '당신만의 강점과 주의할 점을 짚어드립니다.' },
] as const;

const privacyItems = [
    { icon: Sprout, title: '개인정보 보호', body: '안심 보관 시스템' },
    { icon: Clock3, title: '정확한 만세력', body: '신뢰할 수 있는 데이터' },
    { icon: ScrollText, title: '전문 상담 연계', body: '맞춤 상담 지원' },
] as const;

type AuthStatusResponse = {
    authenticated?: boolean;
    isAdmin?: boolean;
};

function withAuthTimeout(check: Promise<BaziAuthStatus>, timeoutMs = 5000) {
    return Promise.race<BaziAuthStatus>([
        check,
        new Promise((resolve) => {
            window.setTimeout(() => resolve('guest'), timeoutMs);
        }),
    ]);
}

export default function BaziPage() {
    const [supabase] = useState(() => createClient());
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState<BaziResult | null>(null);
    const [characterGraph, setCharacterGraph] = useState<BaziCharacterGraph | null>(null);
    const [characterGraphError, setCharacterGraphError] = useState('');
    const analysisRequest = useRef(0);
    const [subjectName, setSubjectName] = useState('');
    const [birthParams, setBirthParams] = useState<{
        year: string;
        month: string;
        day: string;
        hour: string;
        min: string;
        sl: string;
        gen: string;
    } | null>(null);
    const [authStatus, setAuthStatus] = useState<BaziAuthStatus>('checking');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        async function checkUserWithBrowserClient() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    return 'member';
                }

                const { data: { user } } = await supabase.auth.getUser();
                return user ? 'member' : 'guest';
            } catch {
                return 'guest';
            }
        }

        async function checkUser() {
            const controller = new AbortController();
            const timeoutId = window.setTimeout(() => controller.abort(), 5000);

            try {
                const response = await fetch('/api/auth/status', {
                    cache: 'no-store',
                    signal: controller.signal,
                });

                if (response.ok) {
                    const data = await response.json() as AuthStatusResponse;
                    if (isMounted) {
                        setAuthStatus(data.authenticated ? 'member' : 'guest');
                        setIsAdmin(Boolean(data.isAdmin));
                    }
                    return;
                }
            } catch {
                // Fall back to browser client
            } finally {
                window.clearTimeout(timeoutId);
            }

            const nextStatus = await withAuthTimeout(checkUserWithBrowserClient());
            if (isMounted) {
                setAuthStatus(nextStatus);
                setIsAdmin(false);
            }
        }

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
            if (session?.user) {
                setAuthStatus('member');
                checkUser();
                return;
            }

            if (event === 'INITIAL_SESSION') {
                checkUser();
                return;
            }

            setAuthStatus('guest');
            setIsAdmin(false);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [supabase]);

    useEffect(() => {
        if (!showResult) return;

        document.getElementById('bazi-result')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }, [showResult]);

    const handleAnalyze = async (values: BaziFormValues) => {
        const requestId = ++analysisRequest.current;
        setIsLoading(true);
        setError('');
        setCharacterGraph(null);
        setCharacterGraphError('');

        try {
            const { subjectName: nextSubjectName, ...baziParams } = values;
            const params = new URLSearchParams(baziParams);
            if (nextSubjectName) {
                params.set('name', nextSubjectName.trim());
            }
            const response = await fetch(`/api/bazi?${params.toString()}`);
            const data = await readBaziResponse<BaziResult>(response, '만세력 정보를 불러오지 못했습니다.');
            if (requestId !== analysisRequest.current) return;

            setResult(data);
            setSubjectName(nextSubjectName.trim());
            setBirthParams(baziParams);
            setShowResult(true);

            // Fetch natal character details in background for SajuChart interactive character drawer
            const detailParams = new URLSearchParams(baziParams);
            fetch(`/api/bazi/character-details?${detailParams.toString()}`)
                .then((res) => readBaziResponse<BaziCharacterGraph>(res, '글자별 상세 정보를 불러오지 못했습니다.'))
                .then((graphData) => {
                    if (requestId !== analysisRequest.current) return;
                    if (!graphIsCurrent(graphData)) {
                        setCharacterGraphError('지원하지 않는 글자 관계 스키마 버전입니다.');
                        return;
                    }
                    setCharacterGraph(graphData);
                })
                .catch((err) => {
                    if (requestId !== analysisRequest.current) return;
                    setCharacterGraphError(err instanceof Error ? err.message : '글자별 상세 정보를 불러오지 못했습니다.');
                });
        } catch (requestError) {
            if (requestId !== analysisRequest.current) return;
            setShowResult(false);
            setResult(null);
            setCharacterGraph(null);
            setCharacterGraphError('');
            setSubjectName('');
            setBirthParams(null);
            setError(requestError instanceof Error ? requestError.message : '만세력 정보를 불러오지 못했습니다.');
        } finally {
            if (requestId === analysisRequest.current) setIsLoading(false);
        }
    };

    const handleReset = () => {
        analysisRequest.current += 1;
        setIsLoading(false);
        setShowResult(false);
        setResult(null);
        setCharacterGraph(null);
        setCharacterGraphError('');
        setSubjectName('');
        setBirthParams(null);
        setError('');
    };

    return (
        <main className="overflow-hidden bg-[#f7f3ed] pb-16 pt-20 text-[#211a14]">
            <section className="relative isolate min-h-[466px] overflow-hidden border-b border-[#d9cbbb]">
                <Image
                    src="/home/banner_bg_img800.jpg"
                    alt=""
                    fill
                    priority
                    loading="eager"
                    sizes="100vw"
                    className="object-cover object-[67%_center]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,10,8,0.48),rgba(11,10,8,0.84))]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_15%,rgba(207,151,79,0.2),transparent_26%)]" />

                <div className="relative mx-auto grid min-h-[466px] w-[min(1180px,calc(100%-32px))] items-start gap-8 pb-20 pt-12 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-center lg:pb-14">
                    <div className="max-w-lg pt-7 text-white">
                        <p className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#efdcc0]">
                            <Sparkles className="h-4 w-4" />
                            도원 만세력
                        </p>
                        <h1 className="break-keep font-serif text-[2.05rem] font-light leading-[1.42] tracking-normal sm:text-5xl">
                            당신의 <span className="text-[#dca15a]">흐름</span>을
                            <br />
                            명리의 구조로
                            <br className="sm:hidden" /> 읽어봅니다
                        </h1>
                        <p className="mt-6 max-w-sm break-keep text-sm leading-7 text-white/88 sm:text-base">
                            사주의 근원과 흐름을 바탕으로 삶의 방향과 시기를 깊이 있게 해석합니다.
                        </p>
                    </div>

                    <div className="hidden lg:block">
                        <BaziForm birthTimeId="desktop-birth-time" authStatus={authStatus} error={error} isLoading={isLoading} onAnalyze={handleAnalyze} onReset={handleReset} />
                    </div>
                </div>
            </section>

            <div className="relative mx-auto w-[min(1180px,calc(100%-24px))]">
                <div className="relative z-10 -mt-10 lg:hidden">
                    <BaziForm birthTimeId="mobile-birth-time" authStatus={authStatus} error={error} isLoading={isLoading} onAnalyze={handleAnalyze} onReset={handleReset} />
                </div>

                <div className={`grid gap-4 pt-4 lg:gap-7 lg:pt-8 ${showResult ? '' : 'mx-auto max-w-6xl'}`}>
                    {!showResult && (
                        <aside className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,.92fr)] lg:items-stretch">
                            <div className="lg:col-span-2">
                                <FeatureStrip expanded />
                            </div>
                            <AboutPanel />
                            <ConsultationBanner variant="intro" />
                        </aside>
                    )}

                    {showResult && result && (
                        <section id="bazi-result" className="scroll-mt-28 space-y-5">
                            <ResultHeading result={result} subjectName={subjectName} />

                            <div className="grid min-w-0 gap-5 xl:grid-cols-2">
                                <SajuChart result={result} characterGraph={characterGraph} characterGraphError={characterGraphError} />
                                <DayMonthInterpretationCard result={result} />
                                <DecadeFlow key={`cycle-${JSON.stringify(birthParams)}`} result={result} birthParams={birthParams} />
                                <ElementBalance result={result} />
                                <SpecialStarsCard result={result} />
                                {isAdmin && (
                                    <BaziInterpretationCard result={result} authStatus={authStatus} subjectName={subjectName} birthParams={birthParams || undefined} />
                                )}
                            </div>

                            <ConsultationBanner />
                            <PrivacyStrip />
                        </section>
                    )}
                </div>
            </div>
        </main>
    );
}

function BaziForm({
    birthTimeId,
    authStatus,
    error,
    isLoading,
    onAnalyze,
    onReset,
}: {
    birthTimeId: string;
    authStatus: BaziAuthStatus;
    error: string;
    isLoading: boolean;
    onAnalyze: (values: BaziFormValues) => void;
    onReset: () => void;
}) {
    const [defaultDateTime] = useState(() => new Date());
    const defaultYear = String(defaultDateTime.getFullYear());
    const defaultMonth = String(defaultDateTime.getMonth() + 1).padStart(2, '0');
    const defaultDay = String(defaultDateTime.getDate()).padStart(2, '0');
    const defaultHour = String(defaultDateTime.getHours()).padStart(2, '0');
    const defaultMinute = String(defaultDateTime.getMinutes()).padStart(2, '0');
    const defaultValues: BaziFormValues = {
        subjectName: '',
        year: defaultYear,
        month: defaultMonth,
        day: defaultDay,
        hour: defaultHour,
        min: defaultMinute,
        sl: 'sol',
        gen: '남',
    };
    const [formValues, setFormValues] = useState<BaziFormValues>(defaultValues);
    const [isStorageOpen, setIsStorageOpen] = useState(false);
    const [savedProfiles, setSavedProfiles] = useState<SavedBaziProfile[]>([]);
    const [storageStatus, setStorageStatus] = useState<'idle' | 'loading' | 'saving' | 'deleting' | 'error'>('idle');
    const [storageMessage, setStorageMessage] = useState('');

    const canUseStorage = authStatus === 'member';
    const isStorageBusy = storageStatus === 'loading' || storageStatus === 'saving' || storageStatus === 'deleting';

    useEffect(() => {
        if (!isStorageOpen || !canUseStorage) return;

        loadSavedProfiles();
    }, [isStorageOpen, canUseStorage]);

    const updateFormValue = (key: keyof BaziFormValues, value: string) => {
        setFormValues((current) => ({ ...current, [key]: value }));
    };

    const resetCurrentForm = () => {
        setFormValues(defaultValues);
        onReset();
    };

    const submitValues = () => {
        onAnalyze({
            subjectName: formValues.subjectName.trim(),
            year: formValues.year,
            month: String(Number(formValues.month || '0')),
            day: String(Number(formValues.day || '0')),
            hour: String(Number(formValues.hour || '0')),
            min: String(Number(formValues.min || '0')),
            sl: formValues.sl || 'sol',
            gen: formValues.gen || '남',
        });
    };

    async function loadSavedProfiles() {
        setStorageStatus('loading');
        setStorageMessage('');

        try {
            const response = await fetch('/api/bazi/saved-profiles', { cache: 'no-store' });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || '저장된 사주 정보를 불러오지 못했습니다.');
            }

            setSavedProfiles(data.profiles || []);
            setStorageStatus('idle');
        } catch (requestError) {
            setStorageStatus('error');
            setStorageMessage(requestError instanceof Error ? requestError.message : '저장된 사주 정보를 불러오지 못했습니다.');
        }
    }

    async function saveCurrentProfile() {
        if (!canUseStorage) {
            setStorageMessage('로그인 후 사주 정보를 저장할 수 있습니다.');
            return;
        }

        setStorageStatus('saving');
        setStorageMessage('');

        try {
            const response = await fetch('/api/bazi/saved-profiles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formValues),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || '사주 정보 저장에 실패했습니다.');
            }

            setSavedProfiles(data.profiles || []);
            setStorageStatus('idle');
            setStorageMessage('현재 입력값을 저장했습니다.');
        } catch (requestError) {
            setStorageStatus('error');
            setStorageMessage(requestError instanceof Error ? requestError.message : '사주 정보 저장에 실패했습니다.');
        }
    }

    async function deleteSavedProfile(id: string) {
        setStorageStatus('deleting');
        setStorageMessage('');

        try {
            const response = await fetch(`/api/bazi/saved-profiles?id=${encodeURIComponent(id)}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || '저장된 사주 정보 삭제에 실패했습니다.');
            }

            setSavedProfiles(data.profiles || []);
            setStorageStatus('idle');
        } catch (requestError) {
            setStorageStatus('error');
            setStorageMessage(requestError instanceof Error ? requestError.message : '저장된 사주 정보 삭제에 실패했습니다.');
        }
    }

    function applySavedProfile(profile: SavedBaziProfile) {
        setFormValues({
            subjectName: profile.subjectName || '',
            year: profile.year,
            month: profile.month.padStart(2, '0'),
            day: profile.day.padStart(2, '0'),
            hour: profile.hour.padStart(2, '0'),
            min: profile.min.padStart(2, '0'),
            sl: profile.sl || 'sol',
            gen: profile.gen || '남',
        });
        setIsStorageOpen(false);
        setStorageMessage('');
    }

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                submitValues();
            }}
            onReset={(event) => {
                event.preventDefault();
                resetCurrentForm();
            }}
            className="rounded-lg border border-[#eadfd4] bg-[rgba(255,252,248,0.97)] p-5 shadow-[0_14px_44px_rgba(44,30,18,0.14)] backdrop-blur"
        >
            <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                    <h2 className="font-serif text-2xl font-bold tracking-normal text-[#281d15]">사주 정보 입력</h2>
                    <p className="mt-2 text-sm text-[#75685e]">정확한 해석을 위해 정보를 입력해주세요.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsStorageOpen(true)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#e1d1c0] bg-white/78 text-[#7a542a] transition hover:border-[#b88b57] hover:bg-[#fbf4ec]"
                    aria-label="저장한 사주 정보"
                    title="저장한 사주 정보"
                >
                    <Bookmark className="h-4 w-4" />
                </button>
            </div>

            <fieldset className="space-y-5">
                <legend className="sr-only">사주 정보 입력</legend>

                <div>
                    <label htmlFor={`${birthTimeId}-subject-name`} className="text-sm font-semibold text-[#56483c]">이름</label>
                    <input
                        id={`${birthTimeId}-subject-name`}
                        name="subjectName"
                        type="text"
                        maxLength={30}
                        value={formValues.subjectName}
                        onChange={(event) => updateFormValue('subjectName', event.target.value)}
                        placeholder="예) 홍길동"
                        className="mt-2 h-12 w-full rounded-md border border-[#e4d8cb] bg-white/72 px-3 text-sm text-[#493b2d] outline-none transition placeholder:text-[#aa9d90] focus:border-[#ad7b42]"
                    />
                </div>

                <div>
                    <label className="text-sm font-semibold text-[#56483c]">생년월일</label>
                    <div className="mt-2 grid grid-cols-[1.14fr_.85fr_.85fr] gap-2">
                        <SelectBox label="년도" name="year" value={formValues.year} onChange={(value) => updateFormValue('year', value)} values={years} suffix="년" />
                        <SelectBox label="월" name="month" value={formValues.month} onChange={(value) => updateFormValue('month', value)} values={months} suffix="월" />
                        <SelectBox label="일" name="day" value={formValues.day} onChange={(value) => updateFormValue('day', value)} values={days} suffix="일" />
                    </div>
                </div>

                <ToggleGroup
                    title="양력/음력"
                    name="sl"
                    options={[
                        { label: '양력', value: 'sol' },
                        { label: '음력', value: 'lun' },
                        { label: '음력윤달', value: 'lun_y' },
                    ]}
                    value={formValues.sl}
                    onChange={(value) => updateFormValue('sl', value)}
                />

                <div>
                    <label htmlFor={birthTimeId} className="text-sm font-semibold text-[#56483c]">출생시간</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <SelectBox label="시" name="hour" value={formValues.hour} onChange={(value) => updateFormValue('hour', value)} values={hours} suffix="시" id={birthTimeId} />
                        <SelectBox label="분" name="min" value={formValues.min} onChange={(value) => updateFormValue('min', value)} values={minutes} suffix="분" />
                    </div>
                </div>

                <ToggleGroup title="성별" name="gen" options={[{ label: '남성', value: '남' }, { label: '여성', value: '여' }]} value={formValues.gen} onChange={(value) => updateFormValue('gen', value)} />
            </fieldset>

            {error && (
                <p className="mt-5 rounded-md border border-[#e7c6b8] bg-[#fff6f1] px-4 py-3 text-sm leading-6 text-[#9a462d]">
                    {error}
                </p>
            )}

            {canUseStorage && (
                <div className="mt-5">
                    <button
                        type="button"
                        onClick={saveCurrentProfile}
                        disabled={isStorageBusy}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-[#d8c7b5] bg-white/72 px-5 text-sm font-semibold text-[#6a4d33] transition hover:border-[#b88b57] hover:bg-[#fbf4ec] disabled:cursor-wait disabled:bg-[#eee5dc] disabled:text-[#928578]"
                    >
                        <Save className="h-4 w-4" />
                        {storageStatus === 'saving' ? '저장 중' : '현재 정보 저장'}
                    </button>
                    {storageMessage && (
                        <p className={`mt-3 rounded-md px-3 py-2 text-sm leading-6 ${storageStatus === 'error' ? 'bg-[#fff2ec] text-[#a05738]' : 'bg-[#eef8ef] text-[#357247]'}`}>
                            {storageMessage}
                        </p>
                    )}
                </div>
            )}

            <button disabled={isLoading} className="mt-6 inline-flex h-14 w-full items-center justify-center gap-3 rounded-md bg-[#11100e] px-5 text-base font-semibold text-white transition hover:bg-[#2a211a] disabled:cursor-wait disabled:bg-[#5f554d]">
                {isLoading ? '확인하는 중' : '만세력 확인하기'}
                <ArrowRight className="h-5 w-5" />
            </button>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                <button type="reset" className="flex items-center gap-1.5 text-sm font-medium text-[#786755]">
                    <RefreshCw className="h-4 w-4" />
                    입력 초기화
                </button>
            </div>

            {isStorageOpen && (
                <BaziProfileStorageModal
                    authStatus={authStatus}
                    profiles={savedProfiles}
                    status={storageStatus}
                    message={storageMessage}
                    onClose={() => setIsStorageOpen(false)}
                    onLoad={applySavedProfile}
                    onDelete={deleteSavedProfile}
                />
            )}
        </form>
    );
}

function SelectBox({
    id,
    label,
    name,
    values,
    suffix,
    value,
    onChange,
}: {
    id?: string;
    label: string;
    name: string;
    values: readonly string[];
    suffix: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="flex min-w-0 items-center gap-1">
            <span className="sr-only">{label}</span>
            <select
                id={id}
                aria-label={label}
                name={name}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-12 min-w-0 flex-1 rounded-md border border-[#e4d8cb] bg-white/72 px-3 text-sm text-[#493b2d] outline-none transition focus:border-[#ad7b42]"
            >
                {values.map((value) => (
                    <option key={value}>{value}</option>
                ))}
            </select>
            <span className="shrink-0 text-xs text-[#65584c]">{suffix}</span>
        </label>
    );
}

function ToggleGroup({
    title,
    name,
    options,
    value,
    onChange,
}: {
    title: string;
    name: string;
    options: readonly { label: string; value: string }[];
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <fieldset>
            <legend className="text-sm font-semibold text-[#56483c]">{title}</legend>
            <div className={`mt-2 grid gap-2 ${options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {options.map((option) => (
                    <label key={option.value} className="cursor-pointer">
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={option.value === value}
                            onChange={() => onChange(option.value)}
                            className="peer sr-only"
                        />
                        <span className="flex h-12 items-center justify-center rounded-md border border-[#e4d8cb] bg-white/62 text-sm font-semibold text-[#75685e] transition peer-checked:border-[#a97945] peer-checked:bg-[#a97945] peer-checked:text-white">
                            {option.label}
                        </span>
                    </label>
                ))}
            </div>
        </fieldset>
    );
}

function BaziProfileStorageModal({
    authStatus,
    profiles,
    status,
    message,
    onClose,
    onLoad,
    onDelete,
}: {
    authStatus: BaziAuthStatus;
    profiles: SavedBaziProfile[];
    status: 'idle' | 'loading' | 'saving' | 'deleting' | 'error';
    message: string;
    onClose: () => void;
    onLoad: (profile: SavedBaziProfile) => void;
    onDelete: (id: string) => void;
}) {
    const isBusy = status === 'loading' || status === 'saving' || status === 'deleting';

    return (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/45 px-4" role="dialog" aria-modal="true" aria-labelledby="bazi-profile-storage-title">
            <div className="max-h-[min(720px,calc(100vh-48px))] w-full max-w-lg overflow-hidden rounded-lg border border-[#eadfd4] bg-[#fffdf9] shadow-[0_24px_70px_rgba(24,17,11,0.28)]">
                <div className="flex items-start justify-between gap-4 border-b border-[#eadfd4] px-5 py-4">
                    <div>
                        <h3 id="bazi-profile-storage-title" className="font-serif text-xl font-bold tracking-normal text-[#2a2018]">사주 정보 저장함</h3>
                        <p className="mt-1 break-keep text-sm leading-6 text-[#74675b]">자주 보는 생년월일시를 계정에 저장하고 다시 불러옵니다.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[#7b6a5a] transition hover:bg-[#f6eee5]"
                        aria-label="닫기"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {authStatus === 'checking' ? (
                    <div className="px-5 py-8 text-center text-sm font-medium text-[#6f6257]">회원 정보를 확인하고 있습니다.</div>
                ) : authStatus !== 'member' ? (
                    <div className="px-5 py-7">
                        <div className="rounded-md border border-[#ead9c8] bg-[#fbf5ef] px-4 py-5 text-center">
                            <p className="break-keep text-sm leading-7 text-[#5d4c3d]">로그인 후 사주 정보를 저장하고 계정별로 다시 불러올 수 있습니다.</p>
                            <Link href="/login" className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-[#2d241c] px-4 text-sm font-semibold text-white transition hover:bg-[#46382c]">
                                로그인하기
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-y-auto px-5 py-5">
                        {message && (
                            <p className={`rounded-md px-3 py-2 text-sm leading-6 ${status === 'error' ? 'bg-[#fff2ec] text-[#a05738]' : 'bg-[#eef8ef] text-[#357247]'}`}>
                                {message}
                            </p>
                        )}

                        <section className={message ? 'mt-4' : ''}>
                            <div className="mb-2 flex items-center justify-between">
                                <h4 className="text-sm font-bold text-[#56483c]">저장된 정보</h4>
                                <span className="text-xs font-medium text-[#9a8d80]">{profiles.length}개</span>
                            </div>

                            {status === 'loading' ? (
                                <div className="rounded-md border border-[#eadfd4] bg-white/70 px-4 py-6 text-center text-sm text-[#73675c]">불러오는 중입니다.</div>
                            ) : profiles.length === 0 ? (
                                <div className="rounded-md border border-dashed border-[#dccbbb] bg-white/60 px-4 py-6 text-center">
                                    <FolderOpen className="mx-auto h-6 w-6 text-[#b88b57]" />
                                    <p className="mt-2 text-sm leading-6 text-[#73675c]">아직 저장된 사주 정보가 없습니다.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {profiles.map((profile) => (
                                        <article key={profile.id} className="rounded-md border border-[#eadfd4] bg-white/72 p-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h5 className="break-keep text-sm font-bold leading-6 text-[#3d3026]">{profile.label}</h5>
                                                    <p className="mt-1 text-xs leading-5 text-[#84776b]">{formatSavedProfileDetails(profile)}</p>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => onLoad(profile)}
                                                        disabled={isBusy}
                                                        className="inline-flex h-8 items-center justify-center rounded-md bg-[#8f6235] px-3 text-xs font-semibold text-white transition hover:bg-[#714b28] disabled:cursor-wait disabled:bg-[#b8aa9c]"
                                                    >
                                                        적용
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onDelete(profile.id)}
                                                        disabled={isBusy}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#9a4b34] transition hover:bg-[#fff2ec] disabled:cursor-wait disabled:opacity-50"
                                                        aria-label={`${profile.label} 삭제`}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}

function formatSavedProfileDetails(values: BaziFormValues) {
    const calendarLabel = values.sl === 'lun'
        ? '음력'
        : values.sl === 'lun_y'
            ? '음력윤달'
            : '양력';

    return `${calendarLabel} ${values.year}.${values.month.padStart(2, '0')}.${values.day.padStart(2, '0')} ${values.hour.padStart(2, '0')}:${values.min.padStart(2, '0')} · ${values.gen}`;
}

function FeatureStrip({ expanded = false }: { expanded?: boolean }) {
    const features = [
        { icon: Lightbulb, title: '정밀 만세력', body: '고도화 명리 엔진' },
        { icon: Compass, title: '자평·맹파 이론', body: '허실 및 빈주 역학' },
        { icon: ScrollText, title: '정통 사주 리포트', body: '오차 없는 정밀 데이터' },
    ] as const;

    return (
        <section className={`grid grid-cols-3 gap-2 rounded-lg text-center ${expanded
            ? 'border border-[#eee2d6] bg-white/48 px-3 py-5 shadow-[0_12px_32px_rgba(58,42,29,0.05)] lg:px-8'
            : 'px-1 py-5'
            }`}>
            {features.map(({ icon: Icon, title, body }) => (
                <article key={title} className={`min-w-0 ${expanded ? 'lg:flex lg:items-center lg:justify-center lg:gap-4 lg:border-r lg:border-[#eadfd3] lg:text-left last:lg:border-r-0' : ''}`}>
                    <Icon className={`h-7 w-7 text-[#b47d43] ${expanded ? 'mx-auto lg:mx-0' : 'mx-auto'}`} strokeWidth={1.45} />
                    <div>
                        <h2 className={`break-keep text-xs font-semibold leading-5 text-[#514234] ${expanded ? 'mt-3 lg:mt-0 lg:text-sm' : 'mt-3'}`}>{title}</h2>
                        <p className={`leading-5 text-[#827568] ${expanded ? 'text-xs lg:text-sm' : 'text-xs'}`}>{body}</p>
                    </div>
                </article>
            ))}
        </section>
    );
}

function AboutPanel() {
    return (
        <section className="rounded-lg border border-[#eee3d7] bg-white/62 p-5 shadow-[0_12px_35px_rgba(58,42,29,0.06)]">
            <h2 className="font-serif text-2xl font-bold tracking-normal text-[#2d2117]">도원은 이런 곳입니다</h2>
            <p className="mt-3 break-keep text-sm leading-7 text-[#46392d]">
                단순 길흉이 아닌, 삶의 방향과 흐름을 함께 봅니다.
            </p>

            <div className="mt-5 space-y-4 rounded-md border border-[#f0e5da] bg-white/74 p-4">
                {supportItems.map(({ icon: Icon, title, body }) => (
                    <article key={title} className="flex gap-4">
                        <Icon className="mt-0.5 h-7 w-7 shrink-0 text-[#bd8750]" strokeWidth={1.35} />
                        <div>
                            <h3 className="text-sm font-semibold text-[#6a4d33]">{title}</h3>
                            <p className="mt-1 break-keep text-sm leading-6 text-[#6f6257]">{body}</p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

function formatCalendarDate(date?: { year?: number; month?: string | number; day?: string | number }) {
    if (!date?.year || !date.month || !date.day) return '-';
    return `${date.year}.${String(date.month).padStart(2, '0')}.${String(date.day).padStart(2, '0')}`;
}

function formatAgeRange(item?: DaewoonItem) {
    if (item?.start_age === undefined || item?.end_age === undefined) return '-';
    return `${Math.floor(item.start_age)}~${Math.floor(item.end_age)}세`;
}

function ResultHeading({ result, subjectName }: { result: BaziResult; subjectName?: string }) {
    const meta = result.meta;
    const calendar = result.calendar;

    return (
        <header className="rounded-xl border border-[#eadfd4] bg-white/80 p-5 shadow-[0_12px_32px_rgba(58,42,29,0.05)] backdrop-blur-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="rounded-md bg-[#eee1d3] px-2 py-0.5 text-xs font-bold text-[#8a5b2e]">
                            도원 명식 리포트
                        </span>
                        {calendar?.solar_plan && (
                            <span className="rounded-md bg-[#eaf4eb] px-2 py-0.5 text-xs font-semibold text-[#2f663c]">
                                {calendar.solar_plan}
                            </span>
                        )}
                    </div>
                    <h2 className="mt-1.5 font-serif text-2xl font-bold tracking-normal text-[#291f17] sm:text-3xl">
                        {subjectName ? `${subjectName} 님의 사주 원국` : '명식 종합 분석'}
                    </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#65574c] sm:text-sm">
                    <span className="rounded-lg border border-[#eadbd0] bg-[#fbf7f2] px-3 py-1.5">
                        양력 <strong className="text-[#2c2118]">{formatCalendarDate(calendar?.solar)}</strong>
                        {meta?.birth_time ? ` ${meta.birth_time}` : ''}
                        {meta?.birth_weekday ? ` (${meta.birth_weekday})` : ''}
                    </span>
                    <span className="rounded-lg border border-[#eadbd0] bg-[#fbf7f2] px-3 py-1.5">
                        음력 <strong className="text-[#2c2118]">{formatCalendarDate(calendar?.lunar)}</strong>
                    </span>
                    {meta?.age_korean && (
                        <span className="rounded-lg border border-[#d6ba99] bg-[#fcf4ec] px-3 py-1.5 font-bold text-[#8b5a2b]">
                            {meta.age_korean}세 (만 {meta.age_man || meta.age_korean - 1}세)
                            {meta.ddi ? ` · ${meta.ddi}띠` : ''}
                            {meta.gender ? ` · ${meta.gender}성` : ''}
                        </span>
                    )}
                </div>
            </div>
            <aside aria-label="분석 안내" className="mt-5 flex flex-col gap-3 rounded-lg border border-[#e5d1b8] bg-[#fff8ec] px-4 py-3 text-sm leading-6 text-[#634b32] sm:flex-row sm:items-center sm:justify-between">
                <p className="break-keep">
                    <strong className="mr-2 text-[#805124]">분석 안내</strong>
                    현재 명식 분석 기능은 개발·검증 중입니다. 아래 결과는 참고용으로 확인해 주세요. 정확한 분석은 직접 상담을 의뢰해 주세요.
                </p>
                <Link href="/submit" className="inline-flex shrink-0 items-center gap-1 font-semibold text-[#805124] underline underline-offset-4 hover:text-[#5f3718]">
                    상담 의뢰하기 <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
            </aside>
        </header>
    );
}

function ElementBalance({ result }: { result: BaziResult }) {
    const advancedFive = result.advanced_analysis?.five_elements;
    const energyBalance = result.analysis?.summary?.rooting_summary || result.analysis?.summary?.total_energy_balance;

    const fiveOrder = ['목', '화', '토', '금', '수'];

    const rawPercentages = advancedFive?.percentages || {};
    const rawScores = advancedFive?.scores || {};
    const rawCounts = advancedFive?.counts || {};
    const frequentList = advancedFive?.frequent_elements || advancedFive?.dominant || [];
    const absentList = advancedFive?.absent_elements || advancedFive?.deficient || [];

    const elements = fiveOrder.map((el) => {
        const percent = rawPercentages[el] !== undefined
            ? Math.round(rawPercentages[el])
            : 0;
        const score = rawScores[el] !== undefined ? rawScores[el] : undefined;
        const count = rawCounts[el] !== undefined ? rawCounts[el] : undefined;

        return {
            element: el,
            label: `${el}(${elementLabels[el]})`,
            amount: `${percent}%`,
            width: `${Math.max(percent, 4)}%`,
            score,
            count,
            color: elementColors[el],
            hexColor: elementHexColors[el],
            value: percent,
        };
    });

    // Determine top dominant element accurately from sorted percentage values
    const sortedByPercent = [...elements].sort((a, b) => b.value - a.value);
    const topElement = sortedByPercent[0];
    const isAllEqual = sortedByPercent[0]?.value === sortedByPercent[4]?.value && sortedByPercent[0]?.value > 0;

    let centerTitle = '최대 기운';
    let centerMainText = topElement?.element ? `${topElement.element}(${elementLabels[topElement.element]})` : '-';
    let centerSubText = topElement && topElement.value > 0 ? `${topElement.value}%` : '';

    if (isAllEqual) {
        centerTitle = '오행 상태';
        centerMainText = '오행 균형';
        centerSubText = '균등 분포';
    } else if (frequentList.length > 1) {
        centerTitle = '우세 오행';
        centerMainText = frequentList.map((d) => `${d}(${elementLabels[d] || ''})`).join('·');
        centerSubText = topElement ? `최대 ${topElement.value}%` : '';
    } else if (frequentList.length === 1) {
        const d = frequentList[0];
        centerTitle = '최대 기운';
        centerMainText = `${d}(${elementLabels[d] || ''})`;
        centerSubText = rawPercentages[d] !== undefined ? `${Math.round(rawPercentages[d])}%` : `${topElement?.value || 0}%`;
    }

    // Build conic gradient
    let start = 0;
    const segments = elements.map((element, index) => {
        const end = index === elements.length - 1 ? 100 : start + element.value;
        const segment = `${element.hexColor} ${start}% ${end}%`;
        start = end;
        return segment;
    });
    const conicGradient = `conic-gradient(${segments.join(',')})`;

    const dominantText = frequentList.length ? frequentList.join(', ') : '';
    const deficientText = absentList.length ? absentList.join(', ') : '';

    return (
        <Card>
            <CardTitle
                title="오행 균형 & 세력 분포"
                body="사주 원국 8글자의 오행 개수·구성비 및 가중 지수입니다."
                icon={Scale}
                badge={energyBalance || undefined}
            />

            <div className="mt-5 flex flex-col items-center justify-center sm:flex-row sm:gap-6">
                <div className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full shadow-md" style={{ background: conicGradient }}>
                    <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#fffaf4] text-center shadow-inner px-2">
                        <span className="text-xs font-bold text-[#867566] tracking-wide">{centerTitle}</span>
                        <strong className={`font-serif font-bold tracking-normal text-[#2d2117] ${centerMainText.length > 5 ? 'text-lg mt-0.5' : 'text-2xl mt-0.5'}`}>
                            {centerMainText}
                        </strong>
                        {centerSubText && (
                            <span className="mt-0.5 text-xs font-semibold text-[#a06f3e]">
                                {centerSubText}
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-4 w-full flex-1 space-y-2.5 sm:mt-0">
                    {elements.map((el) => (
                        <div key={el.element} className="grid grid-cols-[46px_1fr_auto] items-center gap-3 text-xs lg:text-sm">
                            <span className="font-semibold text-[#493c31]">{el.label}</span>
                            <div className="h-2.5 overflow-hidden rounded-full bg-[#efe8df]">
                                <div className={`h-full rounded-full transition-all duration-500 ${el.color}`} style={{ width: el.width }} />
                            </div>
                            <span className="text-right font-bold text-[#342a22]">
                                {el.count !== undefined ? `${el.count}개 · ` : ''}
                                {el.amount}
                                {el.score !== undefined ? <span className="ml-1 text-[11px] font-normal text-[#7e6d5e]">({el.score}점)</span> : null}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {advancedFive?.summary ? (
                <div className="mt-5 rounded-lg border border-[#eee1d4] bg-[#fcf8f3] p-4">
                    <p className="break-keep text-sm leading-6 text-[#594b3f]">
                        {advancedFive.summary}
                    </p>
                    {(dominantText || deficientText) && (
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            {dominantText && (
                                <span className="rounded bg-[#eadfd2] px-2 py-0.5 font-bold text-[#74502b]">
                                    다빈도/우세: {dominantText}
                                </span>
                            )}
                            {deficientText && (
                                <span className="rounded bg-[#efe7e0] px-2 py-0.5 font-bold text-[#8b4d3b]">
                                    미분포/보완: {deficientText}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            ) : null}
        </Card>
    );
}

function DecadeFlow({ result, birthParams }: { result: BaziResult; birthParams: BirthParams | null }) {
    const daewoon = result.daewoon;
    const list = daewoon?.list || [];
    const selectedCurrent = currentDaewoon(result);
    const currentIndex = selectedCurrent?.index;
    const [selectedDaewoonIndex, setSelectedDaewoonIndex] = useState<number | null>(null);
    const [selectedSewoonYear, setSelectedSewoonYear] = useState<number | null>(null);
    const [cycleGraph, setCycleGraph] = useState<BaziCharacterGraph | null>(null);
    const [cycleError, setCycleError] = useState('');
    const [cycleLoading, setCycleLoading] = useState(false);
    const requestSerial = useRef(0);

    const initialIdx = list.findIndex((item) => item.index === currentIndex);
    const activeDaewoonIndex = selectedDaewoonIndex !== null && selectedDaewoonIndex < list.length
        ? selectedDaewoonIndex
        : initialIdx;

    const selectedDaewoon = activeDaewoonIndex >= 0 && !(selectedSewoonYear !== null && list[0]?.selection_start_year !== undefined && selectedSewoonYear < list[0].selection_start_year)
        ? list[activeDaewoonIndex] : null;

    const cycles100 = result.cycles?.future_100 || [];
    const activeYears: CycleYearItem[] = selectedDaewoon
        ? cycles100.filter(c => selectionYears(selectedDaewoon, [c.year]).length > 0) : [];
    const beforeFirstYears = list[0]?.selection_start_year === undefined ? []
        : cycles100.filter(c => c.year < list[0].selection_start_year!);

    async function loadCycle(selection: { daewoonIndex: number } | { sewoonYear: number }) {
        if (!birthParams) return;
        const serial = ++requestSerial.current;
        setCycleGraph(null);
        setCycleError('');
        setCycleLoading(true);
        try {
            const response = await fetch(`/api/bazi/cycle-analysis?${cycleQuery(birthParams, selection)}`);
            const graph = await readBaziResponse<BaziCharacterGraph>(response, '선택한 운을 불러오지 못했습니다.');
            if (!graphIsCurrent(graph) || !graph.selection) throw new Error('지원하지 않는 운 조회 응답 버전입니다.');
            if (serial === requestSerial.current) setCycleGraph(graph);
        } catch (requestError) {
            if (serial === requestSerial.current) setCycleError(requestError instanceof Error ? requestError.message : '선택한 운을 불러오지 못했습니다.');
        } finally {
            if (serial === requestSerial.current) setCycleLoading(false);
        }
    }

    useEffect(() => {
        if (!birthParams) return;
        const currentDaewoonItem = currentDaewoon(result);
        const allYears = result.cycles?.future_100 || [];
        const hasCurrentSewoonInDaewoon = currentDaewoonItem
            ? selectionYears(currentDaewoonItem, [currentYear]).length > 0 && allYears.some(c => c.year === currentYear)
            : false;

        if (hasCurrentSewoonInDaewoon) {
            setSelectedSewoonYear(currentYear);
            loadCycle({ sewoonYear: currentYear });
        } else if (currentDaewoonItem?.index !== undefined) {
            loadCycle({ daewoonIndex: currentDaewoonItem.index });
        } else if (allYears.some(c => c.year === currentYear)) {
            setSelectedSewoonYear(currentYear);
            loadCycle({ sewoonYear: currentYear });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [birthParams, result]);

    return (
        <Card className="xl:col-span-2">
            <CardTitle
                title="대운(大運) 및 세운(歲運) 흐름"
                body="10년 단위의 거대한 인생 환경(대운)과 매년 변화하는 1년 주기 운(세운) 및 원국과의 관계 요약입니다."
                icon={Compass}
                badge={`${daewoon?.direction || '순행'} · ${daewoon?.start_age ? `${Math.floor(daewoon.start_age)}세 시작` : ''}`}
            />

            {/* Daewoon 10-period Grid */}
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10">
                {list.map((item, index) => {
                    const isCurrent = item.index === currentIndex;
                    const isSelected = index === activeDaewoonIndex && !!selectedDaewoon;
                    const tenGodLabel = [item.gan_ten_god, item.ji_ten_god].filter(Boolean).join('·');

                    return (
                        <button
                            type="button"
                            key={`${item.index}-${item.start_year}`}
                            onClick={() => { setSelectedDaewoonIndex(index); setSelectedSewoonYear(null); loadCycle({ daewoonIndex: item.index ?? index }); }}
                            aria-pressed={isSelected && selectedSewoonYear === null}
                            className={`flex flex-col justify-between rounded-xl border p-2.5 text-center transition ${isSelected
                                ? 'border-[#a97945] bg-[#ae7a43] text-white shadow-md'
                                : 'border-[#ede2d7] bg-[#fcf8f3] text-[#74675b] hover:border-[#d2b38f] hover:bg-[#fff8ee]'
                                }`}
                        >
                            <div>
                                <p className={`text-xs font-bold sm:text-[13px] ${isSelected ? 'text-white/90' : 'text-[#a26e3c]'}`}>
                                    {formatAgeRange(item)}
                                </p>
                                <div className="mt-1.5 flex items-center justify-center gap-1">
                                    <span className="font-serif text-xl font-bold leading-none sm:text-2xl">
                                        {item.gan}{item.ji}
                                    </span>
                                </div>
                                {tenGodLabel && (
                                    <p className={`mt-1.5 break-keep text-xs font-medium leading-4 ${isSelected ? 'text-white/95' : 'text-[#7c624d]'}`}>
                                        {tenGodLabel}
                                    </p>
                                )}
                            </div>

                            <div className="mt-2 border-t border-black/10 pt-1.5">
                                <p className={`text-xs font-medium ${isSelected ? 'text-white/85' : 'text-[#8c7e72]'}`}>
                                    {item.start_year || '-'}
                                </p>
                                {isCurrent && (
                                    <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[11px] font-bold leading-none ${
                                        isSelected ? 'bg-white text-[#96632f]' : 'bg-[#ae7a43] text-white'
                                    }`}>
                                        현재
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Selected Daewoon + Annual Cycles (세운) */}
            <div className="mt-6 rounded-xl border border-[#ecdccd] bg-[#fbf6ee] p-4 lg:p-5">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <span className="rounded bg-[#eddccb] px-2.5 py-0.5 text-xs font-bold text-[#7d4f23] sm:text-[13px]">
                            {selectedDaewoon ? '선택 대운' : '운 선택'}
                        </span>
                        <h4 className="mt-1.5 font-serif text-xl font-bold text-[#33281f] sm:text-2xl">
                            {selectedDaewoon ? `${selectedDaewoon.gan || ''}${selectedDaewoon.ji || ''} 대운 (${formatAgeRange(selectedDaewoon)})` : selectedSewoonYear !== null && beforeFirstYears.some(c => c.year === selectedSewoonYear) ? '첫 대운 이전 세운' : '대운을 선택해 주세요'}
                        </h4>
                    </div>
                    {selectedDaewoon && (
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#6e5d4e] sm:text-sm">
                            {(selectedDaewoon.gan_ten_god || selectedDaewoon.ji_ten_god) && (
                                <span className="rounded-md border border-[#d6ba99] bg-white px-2.5 py-1 font-semibold text-[#735339]">
                                    십성: {[selectedDaewoon.gan_ten_god, selectedDaewoon.ji_ten_god].filter(Boolean).join(' · ')}
                                </span>
                            )}
                            {selectedDaewoon.unseong && (
                                <span className="rounded-md border border-[#d6ba99] bg-white px-2.5 py-1 font-semibold text-[#8b5a2b]">
                                    12운성: {selectedDaewoon.unseong}
                                </span>
                            )}
                            <span className="font-semibold text-[#5e4d3f]">
                                기간: {selectedDaewoon.start_year}~{selectedDaewoon.end_year}년
                            </span>
                        </div>
                    )}
                </div>

                {/* 10-year 세운 cards */}
                {selectedDaewoon && <div className="mt-5">
                    <p className="mb-2.5 text-xs font-bold text-[#8c6b4b] sm:text-sm">해당 대운의 10년 세운 (歲運) — 연도를 클릭하면 해당 세운의 관계를 조회합니다</p>
                    {activeYears.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10">
                            {activeYears.map((c) => {
                                const isCurrent = c.year === currentYear;
                                const isHighlighted = selectedSewoonYear === c.year || isCurrent && selectedSewoonYear === null;
                                const sewoonTenGod = [c.gan.ten_god, c.ji.ten_god].filter(Boolean).join('·') || '-';

                                return (
                                    <button type="button" onClick={() => { setSelectedSewoonYear(c.year); loadCycle({ sewoonYear: c.year }); }}
                                        aria-pressed={selectedSewoonYear === c.year}
                                        key={c.year}
                                        className={`flex flex-col justify-between rounded-lg border p-2.5 text-center transition ${
                                            isHighlighted
                                                ? 'border-[#a97945] bg-[#ae7a43] text-white shadow-sm'
                                                : 'border-[#eadfd4] bg-white/85 text-[#54463a] hover:border-[#d2b38f] hover:bg-[#fff8ee]'
                                        }`}
                                    >
                                        <div>
                                            <p className={`text-xs font-bold ${isHighlighted ? 'text-white/90' : 'text-[#7e6f63]'}`}>
                                                {c.year} ({c.age}세)
                                            </p>
                                            <p className="mt-1.5 font-serif text-lg font-bold leading-none sm:text-xl">
                                                {c.gan.ch}{c.ji.ch}
                                            </p>
                                            <p className={`mt-1 text-xs font-medium ${isHighlighted ? 'text-white/90' : 'text-[#736253]'}`}>
                                                ({c.gan.kr}{c.ji.kr})
                                            </p>
                                        </div>

                                        <div className="mt-2 border-t border-black/10 pt-1.5 text-xs">
                                            <p className={`break-keep font-semibold leading-4 ${isHighlighted ? 'text-white/95' : 'text-[#9c6a38]'}`}>
                                                {sewoonTenGod}
                                            </p>
                                            {c.unseong && (
                                                <p className={`mt-0.5 font-medium ${isHighlighted ? 'text-white/85' : 'text-[#8c7b6c]'}`}>{c.unseong}</p>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-[#8c7d71]">이 대운 구간에는 제공되는 세운 연도가 없습니다.</p>
                    )}
                </div>}
                {beforeFirstYears.length > 0 && <div className="mt-5">
                    <p className="mb-2 text-xs font-bold text-[#8c6b4b] sm:text-sm">첫 대운 이전 세운</p>
                    <div className="flex flex-wrap gap-2">{beforeFirstYears.map(c => <button key={c.year} type="button"
                        aria-pressed={selectedSewoonYear === c.year}
                        onClick={() => { setSelectedSewoonYear(c.year); setSelectedDaewoonIndex(null); loadCycle({ sewoonYear: c.year }); }}
                        className={`rounded border px-3 py-2 text-sm font-medium ${selectedSewoonYear === c.year ? 'border-[#a97945] bg-[#ae7a43] text-white' : 'border-[#eadfd4] bg-white'}`}>
                        {c.year}년 {c.gan.ch}{c.ji.ch}</button>)}</div>
                </div>}
                <CycleRelations graph={cycleGraph} error={cycleError} loading={cycleLoading} />
            </div>
        </Card>
    );
}

function ConsultationBanner({
    variant = 'wide',
}: {
    variant?: 'wide' | 'sidebar' | 'intro';
}) {
    const isSidebar = variant === 'sidebar';
    const isIntro = variant === 'intro';

    return (
        <section className={`relative isolate overflow-hidden rounded-xl border border-[#33251a] bg-[#15110d] text-white shadow-[0_18px_40px_rgba(24,17,11,0.18)] ${isSidebar
            ? 'min-h-[265px] p-5'
            : isIntro
                ? 'min-h-[265px] p-5 lg:flex lg:min-h-0 lg:p-6'
                : 'p-5 sm:p-7'
            }`}>
            <Image
                src="/home/banner_bg_img800.jpg"
                alt=""
                fill
                sizes={isSidebar ? '(min-width: 1024px) 390px, 100vw' : isIntro ? '(min-width: 1024px) 520px, 100vw' : '(min-width: 1280px) 760px, 100vw'}
                className={`object-cover opacity-52 ${isIntro ? 'object-[72%_center]' : 'object-[76%_center]'}`}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,11,8,0.98),rgba(14,11,8,0.82)_58%,rgba(14,11,8,0.42))]" />
            <div className={`relative ${isSidebar
                ? 'flex min-h-[223px] flex-col justify-between'
                : isIntro
                    ? 'flex min-h-[223px] flex-col justify-between gap-5 lg:grid lg:min-h-0 lg:w-full lg:grid-rows-[1fr_auto] lg:content-between'
                    : 'grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end'
                }`}>
                <div>
                    <h2 className={`break-keep font-serif font-light leading-[1.45] tracking-normal text-[#dca15a] ${isIntro ? 'text-[1.55rem] lg:max-w-sm' : 'text-[1.65rem]'}`}>
                        더 깊은 흐름과 방향이 궁금하다면
                        <br />
                        도원과 함께 살펴보세요.
                    </h2>
                    <p className={`mt-3 max-w-md break-keep text-sm leading-7 text-white/82 ${isIntro ? 'lg:max-w-sm' : ''}`}>
                        개인 상담을 통해 당신의 사주를 더욱 깊이 있게 해석해드립니다.
                    </p>
                </div>
                <div className={`grid gap-2 ${isSidebar
                    ? ''
                    : isIntro
                        ? 'lg:grid-cols-2'
                        : 'sm:grid-cols-2 lg:min-w-[340px]'
                    }`}>
                    <Link href="/submit" className="inline-flex h-13 items-center justify-center gap-2 rounded-md bg-[#ad7b42] px-5 text-sm font-semibold transition hover:bg-[#be8a4f]">
                        상담 신청하기
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link href="/services" className="inline-flex h-13 items-center justify-center gap-2 rounded-md border border-[#9b7449] px-5 text-sm font-semibold transition hover:bg-white/10">
                        상담 절차 안내
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

function PrivacyStrip() {
    return (
        <section className="grid gap-3 border-y border-[#eadfd3] py-6 sm:grid-cols-3">
            {privacyItems.map(({ icon: Icon, title, body }) => (
                <article key={title} className="flex items-center gap-3 px-3 sm:justify-center">
                    <Icon className="h-7 w-7 shrink-0 text-[#bd8750]" strokeWidth={1.35} />
                    <div>
                        <h3 className="text-xs font-bold text-[#574638]">{title}</h3>
                        <p className="mt-1 text-xs text-[#807267]">{body}</p>
                    </div>
                </article>
            ))}
        </section>
    );
}
