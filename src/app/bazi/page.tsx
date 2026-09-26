'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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
    Activity,
    Scale,
} from 'lucide-react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import {
    BaziInterpretationCard,
    SajuChart,
    SpecialStarsCard,
    XuShiDynamicsCard,
    BinZhuDynamicsCard,
    Card,
    CardTitle,
} from '@/components/bazi/SajuChart';
import type {
    BaziAuthStatus,
    BaziResult,
    CycleYearItem,
    DaewoonItem,
    PillarKey,
} from '@/components/bazi/types';
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

const pillarOrder: PillarKey[] = ['time', 'day', 'month', 'year'];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1899 }, (_, index) => String(currentYear - index));
const months = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'));
const days = Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, '0'));
const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));
const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

const elementByChar: Record<string, string> = {
    甲: '목', 乙: '목', 寅: '목', 卯: '목',
    丙: '화', 丁: '화', 巳: '화', 午: '화',
    戊: '토', 己: '토', 辰: '토', 戌: '토', 丑: '토', 未: '토',
    庚: '금', 辛: '금', 申: '금', 酉: '금',
    壬: '수', 癸: '수', 子: '수', 亥: '수',
};

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

const interactionConfigs = [
    { key: 'jahab', label: '자합', hanja: '自合' },
    { key: 'six_haps', label: '육합', hanja: '六合' },
    { key: 'three_haps', label: '삼합', hanja: '三合' },
    { key: 'half_haps', label: '반합', hanja: '半合' },
    { key: 'square_haps', label: '방합', hanja: '方合' },
    { key: 'cheons', label: '천', hanja: '穿' },
    { key: 'chungs', label: '충', hanja: '沖' },
    { key: 'breaks', label: '파', hanja: '破' },
    { key: 'punishments', label: '형', hanja: '刑' },
] as const;

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
        setIsLoading(true);
        setError('');

        try {
            const { subjectName: nextSubjectName, ...baziParams } = values;
            const params = new URLSearchParams(baziParams);
            const response = await fetch(`/api/bazi?${params.toString()}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || '만세력 정보를 불러오지 못했습니다.');
            }

            setResult(data);
            setSubjectName(nextSubjectName.trim());
            setBirthParams(baziParams);
            setShowResult(true);
        } catch (requestError) {
            setShowResult(false);
            setResult(null);
            setSubjectName('');
            setBirthParams(null);
            setError(requestError instanceof Error ? requestError.message : '만세력 정보를 불러오지 못했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setShowResult(false);
        setResult(null);
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
                                <SajuChart result={result} />
                                <DecadeFlow result={result} />
                                <ElementBalance result={result} />
                                <TraitPanel result={result} />
                                <SpecialStarsCard result={result} />
                                <XuShiDynamicsCard result={result} />
                                <BinZhuDynamicsCard result={result} />
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
        { icon: ScrollText, title: '개인 맞춤 리포트', body: '심층 AI 분석' },
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
        </header>
    );
}

function ElementBalance({ result }: { result: BaziResult }) {
    const advancedFive = result.advanced_analysis?.five_elements;
    const energyBalance = result.analysis?.summary?.total_energy_balance;

    const fiveOrder = ['목', '화', '토', '금', '수'];

    const rawPercentages = advancedFive?.percentages || {};
    const rawScores = advancedFive?.scores || {};
    const rawCounts = advancedFive?.counts || {};

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
    } else if (advancedFive?.dominant && advancedFive.dominant.length > 1) {
        centerTitle = '우세 오행';
        centerMainText = advancedFive.dominant.map((d) => `${d}(${elementLabels[d] || ''})`).join('·');
        centerSubText = topElement ? `최대 ${topElement.value}%` : '';
    } else if (advancedFive?.dominant && advancedFive.dominant.length === 1) {
        const d = advancedFive.dominant[0];
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

    const dominantText = advancedFive?.dominant?.length ? advancedFive.dominant.join(', ') : '';
    const deficientText = advancedFive?.deficient?.length ? advancedFive.deficient.join(', ') : '';

    return (
        <Card>
            <CardTitle
                title="오행 균형 & 세력 분포"
                body="사주 원국과 지장간을 정밀 계량화한 오행 에너지 점수와 구성비입니다."
                icon={Scale}
                badge={energyBalance || undefined}
            />

            <div className="mt-5 flex flex-col items-center justify-center sm:flex-row sm:gap-6">
                <div className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full shadow-md" style={{ background: conicGradient }}>
                    <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#fffaf4] text-center shadow-inner px-2">
                        <span className="text-[10px] font-bold text-[#867566] tracking-wide">{centerTitle}</span>
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
                        <div key={el.element} className="grid grid-cols-[46px_1fr_42px] items-center gap-3 text-xs lg:text-sm">
                            <span className="font-semibold text-[#493c31]">{el.label}</span>
                            <div className="h-2.5 overflow-hidden rounded-full bg-[#efe8df]">
                                <div className={`h-full rounded-full transition-all duration-500 ${el.color}`} style={{ width: el.width }} />
                            </div>
                            <span className="text-right font-bold text-[#342a22]">
                                {el.amount}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {advancedFive?.summary ? (
                <div className="mt-5 rounded-lg border border-[#eee1d4] bg-[#fcf8f3] p-4">
                    <p className="break-keep text-xs leading-6 text-[#594b3f] lg:text-sm">
                        {advancedFive.summary}
                    </p>
                    {(dominantText || deficientText) && (
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            {dominantText && (
                                <span className="rounded bg-[#eadfd2] px-2 py-0.5 font-bold text-[#74502b]">
                                    우세: {dominantText}
                                </span>
                            )}
                            {deficientText && (
                                <span className="rounded bg-[#efe7e0] px-2 py-0.5 font-bold text-[#8b4d3b]">
                                    결핍/보완: {deficientText}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            ) : null}
        </Card>
    );
}

function TraitPanel({ result }: { result: BaziResult }) {
    const interactions = result.advanced_analysis?.interactions;
    const summaryList = interactions?.summary_list || [];
    const climate = interactions?.climate;
    const harmonyScore = interactions?.harmony_score ?? 0;
    const tensionScore = interactions?.tension_score ?? 0;

    return (
        <Card>
            <CardTitle
                title="합·충·형·파·해 (합충 작용)"
                body="기둥 간 결합(합)과 변화·마찰(충·형·파·해)의 상호작용 및 전체적인 조화 분위기입니다."
                icon={Activity}
                badge={climate || undefined}
            />

            {/* Harmony vs Tension Bar */}
            {(harmonyScore > 0 || tensionScore > 0) && (
                <div className="mt-5 rounded-lg border border-[#ede1d4] bg-[#faf4ec] p-4">
                    <div className="flex items-center justify-between text-xs font-bold text-[#56483c]">
                        <span className="text-[#3b7548]">조화도 ({harmonyScore.toFixed(1)})</span>
                        <span className="text-[#9e432c]">긴장도 ({tensionScore.toFixed(1)})</span>
                    </div>
                    <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-[#e8ded3]">
                        <div
                            className="bg-[#417e50] transition-all"
                            style={{
                                width: `${(harmonyScore / (harmonyScore + tensionScore || 1)) * 100}%`,
                            }}
                        />
                        <div
                            className="bg-[#c44329] transition-all"
                            style={{
                                width: `${(tensionScore / (harmonyScore + tensionScore || 1)) * 100}%`,
                            }}
                        />
                    </div>
                </div>
            )}

            {summaryList.length > 0 ? (
                <div className="mt-4 space-y-2">
                    {summaryList.map((item, idx) => {
                        const isHarmonious = item.includes('합') && !item.includes('충') && !item.includes('형') && !item.includes('파') && !item.includes('천');

                        return (
                            <div
                                key={idx}
                                className="flex items-start gap-2.5 rounded-lg border border-[#eee2d6] bg-[#fcf9f5] p-3 text-xs leading-6 text-[#4a3d32] lg:text-sm"
                            >
                                <span className={`mt-0.5 inline-block shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                    isHarmonious ? 'bg-[#417e50]/15 text-[#2d5c38]' : 'bg-[#9a4b34]/15 text-[#9a4b34]'
                                }`}>
                                    {isHarmonious ? '조화' : '변동'}
                                </span>
                                <span className="break-keep font-medium">{item}</span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="mt-5 rounded-lg border border-[#eee1d4] bg-[#fcf8f3] p-4">
                    <p className="break-keep text-sm font-semibold text-[#493c31]">뚜렷한 충돌 또는 합 작용이 없습니다.</p>
                    <p className="mt-1.5 break-keep text-xs leading-6 text-[#66584c]">
                        원국이 비교적 평온한 상태이며, 오행의 세력과 십성의 순환을 중심으로 흐름을 살피는 것이 좋습니다.
                    </p>
                </div>
            )}
        </Card>
    );
}

function DecadeFlow({ result }: { result: BaziResult }) {
    const daewoon = result.daewoon;
    const list = daewoon?.list || [];
    const currentDaewoon = daewoon?.current || list.find((item) => item.start_year !== undefined && item.end_year !== undefined && item.start_year <= currentYear && currentYear <= item.end_year);
    const currentIndex = currentDaewoon?.index;
    const [selectedDaewoonIndex, setSelectedDaewoonIndex] = useState<number | null>(null);

    const initialIdx = list.findIndex((item) => item.index === currentIndex);
    const activeDaewoonIndex = selectedDaewoonIndex !== null && selectedDaewoonIndex < list.length
        ? selectedDaewoonIndex
        : Math.max(initialIdx, 0);

    const selectedDaewoon = list[activeDaewoonIndex] || currentDaewoon;

    // Build 10-year 세운 from API future_100 cycles
    const cycles100 = result.cycles?.future_100 || [];
    const activeYears: CycleYearItem[] = (selectedDaewoon?.start_year !== undefined && selectedDaewoon.end_year !== undefined)
        ? cycles100.filter((c) => c.year >= selectedDaewoon.start_year! && c.year <= selectedDaewoon.end_year!)
        : [];

    return (
        <Card className="xl:col-span-2">
            <CardTitle
                title="대운(大運) 및 세운(歲運) 흐름"
                body="10년 단위의 거대한 인생 환경(대운)과 매년 변화하는 1년 주기 운(세운)입니다."
                icon={Compass}
                badge={`${daewoon?.direction || '순행'} · ${daewoon?.start_age ? `${Math.floor(daewoon.start_age)}세 시작` : ''}`}
            />

            {/* Daewoon 10-period Grid */}
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10">
                {list.map((item, index) => {
                    const isCurrent = item.index === currentIndex;
                    const isSelected = index === activeDaewoonIndex;
                    const ganElem = item.gan_detail?.element;
                    const jiElem = item.ji_detail?.element;

                    return (
                        <button
                            type="button"
                            key={`${item.index}-${item.start_year}`}
                            onClick={() => setSelectedDaewoonIndex(index)}
                            aria-pressed={isSelected}
                            className={`flex flex-col justify-between rounded-xl border p-2.5 text-center transition ${isSelected
                                ? 'border-[#a97945] bg-[#ae7a43] text-white shadow-md'
                                : 'border-[#ede2d7] bg-[#fcf8f3] text-[#74675b] hover:border-[#d2b38f] hover:bg-[#fff8ee]'
                                }`}
                        >
                            <div>
                                <p className={`text-[10px] font-bold ${isSelected ? 'text-white/80' : 'text-[#a26e3c]'}`}>
                                    {formatAgeRange(item)}
                                </p>
                                <div className="mt-1 flex items-center justify-center gap-1">
                                    <span className="font-serif text-lg font-bold leading-none sm:text-xl">
                                        {item.gan}{item.ji}
                                    </span>
                                </div>
                                {(item.gan_ten_god || item.ji_ten_god) && (
                                    <p className={`mt-1 text-[10px] font-medium ${isSelected ? 'text-white/90' : 'text-[#856b56]'}`}>
                                        {item.gan_ten_god || item.ji_ten_god}
                                    </p>
                                )}
                            </div>

                            <div className="mt-2 border-t border-black/10 pt-1">
                                <p className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-[#9c8e82]'}`}>
                                    {item.start_year || '-'}
                                </p>
                                {isCurrent && (
                                    <span className={`mt-0.5 inline-block rounded px-1 text-[9px] font-bold ${
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
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <span className="rounded bg-[#eddccb] px-2 py-0.5 text-xs font-bold text-[#7d4f23]">
                            선택 대운
                        </span>
                        <h4 className="mt-1 font-serif text-xl font-bold text-[#33281f]">
                            {selectedDaewoon ? `${selectedDaewoon.gan || ''}${selectedDaewoon.ji || ''} 대운 (${formatAgeRange(selectedDaewoon)})` : '대운 선택'}
                        </h4>
                    </div>
                    {selectedDaewoon && (
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#6e5d4e]">
                            {selectedDaewoon.unseong && (
                                <span className="rounded border border-[#d6ba99] bg-white px-2 py-0.5 font-semibold text-[#8b5a2b]">
                                    12운성: {selectedDaewoon.unseong}
                                </span>
                            )}
                            <span className="font-medium">
                                기간: {selectedDaewoon.start_year}~{selectedDaewoon.end_year}년
                            </span>
                        </div>
                    )}
                </div>

                {/* 10-year 세운 cards */}
                <div className="mt-4">
                    <p className="mb-2 text-xs font-bold text-[#8c6b4b]">해당 대운의 10년 세운 (歲運)</p>
                    {activeYears.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10">
                            {activeYears.map((c) => {
                                const isCurrent = c.year === currentYear;

                                return (
                                    <div
                                        key={c.year}
                                        className={`flex flex-col justify-between rounded-lg border p-2 text-center ${
                                            isCurrent
                                                ? 'border-[#a97945] bg-[#ae7a43] text-white shadow-sm'
                                                : 'border-[#eadfd4] bg-white/80 text-[#54463a]'
                                        }`}
                                    >
                                        <div>
                                            <p className={`text-[10px] font-semibold ${isCurrent ? 'text-white/85' : 'text-[#8e7f73]'}`}>
                                                {c.year} ({c.age}세)
                                            </p>
                                            <p className="mt-1 font-serif text-base font-bold leading-none">
                                                {c.gan.ch}{c.ji.ch}
                                            </p>
                                            <p className={`mt-0.5 text-[10px] ${isCurrent ? 'text-white/90' : 'text-[#7e6d5e]'}`}>
                                                ({c.gan.kr}{c.ji.kr})
                                            </p>
                                        </div>

                                        <div className="mt-1.5 border-t border-black/5 pt-1 text-[9px]">
                                            <p className={`font-semibold ${isCurrent ? 'text-white/90' : 'text-[#9c6a38]'}`}>
                                                {c.ji.ten_god || c.gan.ten_god || '-'}
                                            </p>
                                            {c.unseong && (
                                                <p className={isCurrent ? 'text-white/75' : 'text-[#a29284]'}>{c.unseong}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-xs text-[#8c7d71]">세운 데이터를 불러오지 못했습니다.</p>
                    )}
                </div>
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
