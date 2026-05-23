'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    ArrowRight,
    Clock3,
    Compass,
    Flower2,
    Lightbulb,
    RefreshCw,
    ScrollText,
    Sparkles,
    Sprout,
    Sun,
} from 'lucide-react';
import { BaziInterpretationCard, SajuChart } from '@/components/bazi/SajuChart';
import type { BaziResult, DaewoonItem, PillarKey } from '@/components/bazi/types';

type BaziFormValues = {
    year: string;
    month: string;
    day: string;
    hour: string;
    min: string;
    sl: string;
    gen: string;
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
    금: 'bg-[#8f9190]',
    수: 'bg-[#5f9ec1]',
};

const elementHexColors: Record<string, string> = {
    목: '#417e50',
    화: '#db3c39',
    토: '#c58e49',
    금: '#8f9190',
    수: '#5f9ec1',
};

const elementLabels: Record<string, string> = {
    목: '木',
    화: '火',
    토: '土',
    금: '金',
    수: '水',
};

const elementTraitText: Record<string, string> = {
    목: '성장과 추진',
    화: '표현과 활력',
    토: '안정과 조율',
    금: '정리와 판단',
    수: '유연함과 사고',
};

const detailKeyByPillar: Record<PillarKey, 'hour' | 'day' | 'month' | 'year'> = {
    time: 'hour',
    day: 'day',
    month: 'month',
    year: 'year',
};

const pillarLabelByDetailKey: Record<string, string> = {
    hour: '시주',
    time: '시주',
    day: '일주',
    month: '월주',
    year: '년주',
};

const hiddenStemsByBranch: Record<string, string[]> = {
    子: ['壬', '癸'],
    丑: ['癸', '辛', '己'],
    寅: ['戊', '丙', '甲'],
    卯: ['甲', '乙'],
    辰: ['乙', '癸', '戊'],
    巳: ['戊', '庚', '丙'],
    午: ['丙', '己', '丁'],
    未: ['丁', '乙', '己'],
    申: ['戊', '壬', '庚'],
    酉: ['庚', '辛'],
    戌: ['辛', '丁', '戊'],
    亥: ['戊', '甲', '壬'],
};

const hiddenStemWeightsByLength: Record<number, number[]> = {
    1: [1],
    2: [0.7, 0.3],
    3: [0.6, 0.3, 0.1],
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

export default function BaziPage() {
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState<BaziResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

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
            const params = new URLSearchParams(values);
            const response = await fetch(`/api/bazi?${params.toString()}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || '만세력 정보를 불러오지 못했습니다.');
            }

            setResult(data);
            setShowResult(true);
        } catch (requestError) {
            setShowResult(false);
            setResult(null);
            setError(requestError instanceof Error ? requestError.message : '만세력 정보를 불러오지 못했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setShowResult(false);
        setResult(null);
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
                        <BaziForm birthTimeId="desktop-birth-time" error={error} isLoading={isLoading} onAnalyze={handleAnalyze} onReset={handleReset} />
                    </div>
                </div>
            </section>

            <div className="relative mx-auto w-[min(1180px,calc(100%-24px))]">
                <div className="relative z-10 -mt-10 lg:hidden">
                    <BaziForm birthTimeId="mobile-birth-time" error={error} isLoading={isLoading} onAnalyze={handleAnalyze} onReset={handleReset} />
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
                        <section id="bazi-result" className="scroll-mt-28 space-y-4">
                            <ResultHeading result={result} />

                            <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                                <SajuChart result={result} />
                                <DecadeFlow result={result} />
                                <ElementBalance result={result} />
                                <TraitPanel result={result} />
                                <BaziInterpretationCard result={result} />
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
    error,
    isLoading,
    onAnalyze,
    onReset,
}: {
    birthTimeId: string;
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

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);

                onAnalyze({
                    year: String(formData.get('year') || ''),
                    month: String(Number(formData.get('month') || '0')),
                    day: String(Number(formData.get('day') || '0')),
                    hour: String(Number(formData.get('hour') || '0')),
                    min: String(Number(formData.get('min') || '0')),
                    sl: String(formData.get('sl') || 'sol'),
                    gen: String(formData.get('gen') || '남'),
                });
            }}
            onReset={onReset}
            className="rounded-lg border border-[#eadfd4] bg-[rgba(255,252,248,0.97)] p-5 shadow-[0_14px_44px_rgba(44,30,18,0.14)] backdrop-blur"
        >
            <div className="mb-5">
                <h2 className="font-serif text-2xl font-bold tracking-normal text-[#281d15]">사주 정보 입력</h2>
                <p className="mt-2 text-sm text-[#75685e]">정확한 해석을 위해 정보를 입력해주세요.</p>
            </div>

            <fieldset className="space-y-5">
                <legend className="sr-only">사주 정보 입력</legend>

                <div>
                    <label className="text-sm font-semibold text-[#56483c]">생년월일</label>
                    <div className="mt-2 grid grid-cols-[1.14fr_.85fr_.85fr] gap-2">
                        <SelectBox label="년도" name="year" defaultValue={defaultYear} values={years} suffix="년" />
                        <SelectBox label="월" name="month" defaultValue={defaultMonth} values={months} suffix="월" />
                        <SelectBox label="일" name="day" defaultValue={defaultDay} values={days} suffix="일" />
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
                    defaultValue="sol"
                />

                <div>
                    <label htmlFor={birthTimeId} className="text-sm font-semibold text-[#56483c]">출생시간</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <SelectBox label="시" name="hour" defaultValue={defaultHour} values={hours} suffix="시" id={birthTimeId} />
                        <SelectBox label="분" name="min" defaultValue={defaultMinute} values={minutes} suffix="분" />
                    </div>
                </div>

                <ToggleGroup title="성별" name="gen" options={[{ label: '남성', value: '남' }, { label: '여성', value: '여' }]} defaultValue="남" />
            </fieldset>

            {error && (
                <p className="mt-5 rounded-md border border-[#e7c6b8] bg-[#fff6f1] px-4 py-3 text-sm leading-6 text-[#9a462d]">
                    {error}
                </p>
            )}

            <button disabled={isLoading} className="mt-6 inline-flex h-14 w-full items-center justify-center gap-3 rounded-md bg-[#11100e] px-5 text-base font-semibold text-white transition hover:bg-[#2a211a] disabled:cursor-wait disabled:bg-[#5f554d]">
                {isLoading ? '확인하는 중' : '만세력 확인하기'}
                <ArrowRight className="h-5 w-5" />
            </button>

            <button type="reset" className="mx-auto mt-4 flex items-center gap-1.5 text-sm font-medium text-[#786755]">
                <RefreshCw className="h-4 w-4" />
                입력 초기화
            </button>
        </form>
    );
}

function SelectBox({
    id,
    label,
    name,
    values,
    suffix,
    defaultValue,
}: {
    id?: string;
    label: string;
    name: string;
    values: readonly string[];
    suffix: string;
    defaultValue: string;
}) {
    return (
        <label className="flex min-w-0 items-center gap-1">
            <span className="sr-only">{label}</span>
            <select
                id={id}
                aria-label={label}
                name={name}
                defaultValue={defaultValue}
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
    defaultValue,
}: {
    title: string;
    name: string;
    options: readonly { label: string; value: string }[];
    defaultValue: string;
}) {
    return (
        <fieldset>
            <legend className="text-sm font-semibold text-[#56483c]">{title}</legend>
            <div className={`mt-2 grid gap-2 ${options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {options.map((option) => (
                    <label key={option.value} className="cursor-pointer">
                        <input type="radio" name={name} value={option.value} defaultChecked={option.value === defaultValue} className="peer sr-only" />
                        <span className="flex h-12 items-center justify-center rounded-md border border-[#e4d8cb] bg-white/62 text-sm font-semibold text-[#75685e] transition peer-checked:border-[#a97945] peer-checked:bg-[#a97945] peer-checked:text-white">
                            {option.label}
                        </span>
                    </label>
                ))}
            </div>
        </fieldset>
    );
}

function FeatureStrip({ expanded = false }: { expanded?: boolean }) {
    const features = [
        { icon: Lightbulb, title: '정확한 만세력', body: '기반 해석' },
        { icon: Compass, title: '전문 명리학', body: '시스템' },
        { icon: ScrollText, title: '개인 맞춤', body: '분석 리포트' },
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
    return `${item.start_age}~${item.end_age}세`;
}

function getElementBalance(result: BaziResult) {
    const counts: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    const pillars = result.four_pillars;
    const details = result.analysis?.details || {};

    if (pillars) {
        pillarOrder.forEach((key) => {
            const ganElement = elementByChar[pillars[key]?.gan?.ch || ''];
            if (ganElement) counts[ganElement] += 1;

            const branchChar = pillars[key]?.ji?.ch || '';
            const detailKey = detailKeyByPillar[key];
            const hiddenStems = extractHiddenStems(details[detailKey]?.branch?.jijanggan)
                || hiddenStemsByBranch[branchChar]
                || [];
            const weights = hiddenStemWeightsByLength[hiddenStems.length] || [];

            hiddenStems.forEach((stem, index) => {
                const element = elementByChar[stem];
                if (element) counts[element] += weights[index] || 0;
            });
        });
    }

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0) || 1;
    return Object.entries(counts).map(([element, count]) => {
        const percent = Math.round((count / total) * 100);
        return {
            label: `${element}(${elementLabels[element]})`,
            amount: `${percent}%`,
            width: `${Math.max(percent, 4)}%`,
            color: elementColors[element],
            hexColor: elementHexColors[element],
            value: percent,
        };
    });
}

function extractHiddenStems(jijanggan?: string[]) {
    if (!jijanggan?.length) return null;

    const stems = jijanggan
        .map((stem) => stem.match(/[甲乙丙丁戊己庚辛壬癸]/)?.[0])
        .filter((stem): stem is string => Boolean(stem));

    return stems.length ? stems : null;
}

function buildConicGradient(elements: ReturnType<typeof getElementBalance>) {
    let start = 0;
    const segments = elements.map((element, index) => {
        const end = index === elements.length - 1 ? 100 : start + element.value;
        const segment = `${element.hexColor} ${start}% ${end}%`;
        start = end;

        return segment;
    });

    return `conic-gradient(${segments.join(',')})`;
}

function buildElementBalanceDescription(elements: ReturnType<typeof getElementBalance>) {
    const sortedElements = [...elements].sort((a, b) => b.value - a.value);
    const strongest = sortedElements[0];
    const weakest = [...elements].sort((a, b) => a.value - b.value)[0];

    if (!strongest || !weakest) {
        return ['천간과 지장간을 함께 보면 오행의 분포를 확인할 수 있습니다.', '부족한 기운을 의식적으로 보완하면 판단과 행동의 균형을 잡는 데 도움이 됩니다.'];
    }

    const strongestName = strongest.label;
    const weakestName = weakest.label;
    const strongestElement = strongest.label.slice(0, 1);
    const weakestElement = weakest.label.slice(0, 1);

    return [
        `천간과 지장간을 함께 보면 ${strongestName}의 기운이 가장 두드러집니다.`,
        `${elementTraitText[strongestElement] || '타고난 성향'}의 성향이 잘 드러날 수 있으며, ${weakestName}의 ${elementTraitText[weakestElement] || '감각'}을 보완하면 판단과 행동의 균형을 잡는 데 도움이 됩니다.`,
    ];
}

function getInteractionItems(result: BaziResult) {
    const analysis = result.analysis as Record<string, unknown> | undefined;
    if (!analysis) return [];

    return interactionConfigs.flatMap((config) => {
        const matches = findValuesByKey(analysis, config.key);
        const labels = dedupeInteractionLabels(config.key, matches.flatMap((match) => {
            const contextPrefix = config.key === 'jahab' ? getPillarContextLabel(match.path) : '';
            const labels = normalizeInteractionByKey(config.key, match.value);
            return labels.map((label) => contextPrefix ? `${contextPrefix} ${config.label} · ${label}` : label);
        }));

        return labels.map((title) => ({
            key: `${config.key}-${title}`,
            label: config.label,
            hanja: config.hanja,
            title,
        }));
    });
}

function dedupeInteractionLabels(key: string, labels: string[]) {
    if (!['half_haps', 'chungs', 'cheons', 'breaks'].includes(key)) return Array.from(new Set(labels));

    const seen = new Set<string>();
    return labels.filter((label) => {
        const dedupeKey = getBranchPairKey(label);
        if (!dedupeKey) return true;
        if (seen.has(dedupeKey)) return false;

        seen.add(dedupeKey);
        return true;
    });
}

function getBranchPairKey(label: string) {
    const branches = label.match(/[子丑寅卯辰巳午未申酉戌亥]/g);
    if (!branches || branches.length < 2) return '';

    return branches.slice(0, 2).sort().join('');
}

function normalizeInteractionByKey(key: string, value: unknown) {
    if (key === 'jahab') return normalizeJahabValue(value);
    if (key === 'half_haps') return normalizeHalfHapsValue(value);
    if (key === 'chungs') return normalizeBranchPairValue(value, '충(沖)');
    if (key === 'cheons') return normalizeBranchPairValue(value, '천(穿)');
    if (key === 'breaks') return normalizeBranchPairValue(value, '파(破)');

    return normalizeInteractionValue(value);
}

function findValuesByKey(value: unknown, targetKey: string, path: string[] = []): Array<{ value: unknown; path: string[] }> {
    if (!value || typeof value !== 'object') return [];

    if (Array.isArray(value)) {
        return value.flatMap((item, index) => findValuesByKey(item, targetKey, [...path, String(index)]));
    }

    return Object.entries(value as Record<string, unknown>).flatMap(([key, childValue]) => {
        const nextPath = [...path, key];
        const matchedValues = key === targetKey ? [{ value: childValue, path: nextPath }] : [];
        return [...matchedValues, ...findValuesByKey(childValue, targetKey, nextPath)];
    });
}

function getPillarContextLabel(path: string[]) {
    const pillarKey = [...path].reverse().find((key) => pillarLabelByDetailKey[key]);
    return pillarKey ? pillarLabelByDetailKey[pillarKey] : '';
}

function normalizeJahabValue(value: unknown): string[] {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return normalizeInteractionValue(value);
    }

    const objectValue = value as Record<string, unknown>;
    if (objectValue.exists === false || objectValue.active === false) return [];

    const stem = firstInteractionText(objectValue.stem) || firstInteractionText(objectValue.gan);
    const branch = firstInteractionText(objectValue.branch) || firstInteractionText(objectValue.ji);
    const pillar = `${stem || ''}${branch || ''}`;

    if (pillar) return [pillar];

    const extractedPillar = extractPillarText(value);
    if (extractedPillar) return [extractedPillar];

    return normalizeJahabFallbackValue(value);
}

function firstInteractionText(value: unknown) {
    return normalizeInteractionValue(value)[0] || '';
}

function extractPillarText(value: unknown) {
    const text = JSON.stringify(value);
    const stem = text.match(/[甲乙丙丁戊己庚辛壬癸]/)?.[0] || '';
    const branch = text.match(/[子丑寅卯辰巳午未申酉戌亥]/)?.[0] || '';

    return stem && branch ? `${stem}${branch}` : '';
}

function normalizeJahabFallbackValue(value: unknown): string[] {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return normalizeInteractionValue(value);
    }

    return Object.entries(value as Record<string, unknown>)
        .filter(([key, childValue]) => key !== 'combined_element' && typeof childValue !== 'boolean')
        .flatMap(([, childValue]) => normalizeInteractionValue(childValue));
}

function normalizeHalfHapsValue(value: unknown): string[] {
    return normalizeBranchPairValue(value, '반합');
}

function normalizeBranchPairValue(value: unknown, suffix: string): string[] {
    if (!value) return [];

    if (Array.isArray(value)) {
        return value.flatMap((item) => normalizeBranchPairValue(item, suffix));
    }

    if (typeof value !== 'object') {
        return normalizeInteractionValue(value);
    }

    const objectValue = value as Record<string, unknown>;
    if (objectValue.exists === false || objectValue.active === false) return [];

    const my = extractBranchText(objectValue.my);
    const withBranch = extractBranchText(objectValue.with);

    if (my && withBranch) return [`${my}${withBranch} ${suffix}`];

    return Object.entries(objectValue)
        .filter(([, childValue]) => typeof childValue !== 'boolean')
        .flatMap(([, childValue]) => normalizeBranchPairValue(childValue, suffix));
}

function extractBranchText(value: unknown) {
    if (!value) return '';

    if (typeof value === 'string' || typeof value === 'number') {
        return String(value).match(/[子丑寅卯辰巳午未申酉戌亥]/)?.[0] || '';
    }

    const text = JSON.stringify(value);
    return text.match(/[子丑寅卯辰巳午未申酉戌亥]/)?.[0] || '';
}

function normalizeInteractionValue(value: unknown): string[] {
    if (!value) return [];

    if (typeof value === 'string' || typeof value === 'number') {
        const text = String(value).trim();
        return text ? [text] : [];
    }

    if (Array.isArray(value)) {
        return value.flatMap(normalizeInteractionValue);
    }

    if (typeof value !== 'object') return [];

    const objectValue = value as Record<string, unknown>;
    if (objectValue.exists === false || objectValue.active === false) return [];

    const preferredKeys = ['name', 'label', 'title', 'relation', 'type', 'pair', 'chars', 'branches', 'stems', 'combined_element'];
    const parts = preferredKeys.flatMap((key) => normalizeInteractionValue(objectValue[key]));

    if (parts.length) return [parts.join(' · ')];

    return Object.entries(objectValue)
        .filter(([, childValue]) => typeof childValue !== 'boolean')
        .flatMap(([, childValue]) => normalizeInteractionValue(childValue));
}

function findCurrentDaewoonItem(items: DaewoonItem[]) {
    return items.find((item) => {
        if (item.start_year === undefined || item.end_year === undefined) return false;
        return item.start_year <= currentYear && currentYear <= item.end_year;
    });
}

function findDaewoonListIndex(items: DaewoonItem[], current?: DaewoonItem | null) {
    if (!current) return -1;

    return items.findIndex((item) => {
        if (item.index !== undefined && current.index !== undefined) return item.index === current.index;
        if (item.start_year !== undefined && current.start_year !== undefined) return item.start_year === current.start_year;

        return item.gan === current.gan && item.ji === current.ji;
    });
}

function getYearGanji(year: number) {
    const offset = year - 1984;
    const stemIndex = ((offset % heavenlyStems.length) + heavenlyStems.length) % heavenlyStems.length;
    const branchIndex = ((offset % earthlyBranches.length) + earthlyBranches.length) % earthlyBranches.length;

    return {
        gan: heavenlyStems[stemIndex],
        ji: earthlyBranches[branchIndex],
    };
}

function buildYearCyclesFromDaewoon(daewoon?: DaewoonItem | null): Array<[number, string, string]> {
    if (daewoon?.start_year === undefined || daewoon.end_year === undefined) return [];

    const length = Math.max(0, daewoon.end_year - daewoon.start_year + 1);
    return Array.from({ length }, (_, index) => {
        const year = daewoon.start_year! + index;
        const { gan, ji } = getYearGanji(year);

        return [year, gan, ji];
    });
}

function ResultHeading({ result }: { result: BaziResult }) {
    return (
        <header className="rounded-lg border border-[#eadfd4] bg-white/72 px-5 py-4 shadow-[0_12px_32px_rgba(58,42,29,0.05)] sm:flex sm:items-end sm:justify-between">
            <div>
                <p className="text-xs font-semibold text-[#a26e3c]">Dowon Analysis</p>
                <h2 className="mt-1 font-serif text-2xl font-bold tracking-normal text-[#291f17]">도원 명식 리포트</h2>
            </div>
            <p className="mt-2 text-sm text-[#75695f] sm:mt-0">
                양력 {formatCalendarDate(result.calendar?.solar)} · 음력 {formatCalendarDate(result.calendar?.lunar)}
            </p>
        </header>
    );
}

function Card({
    children,
    className = '',
}: {
    children: React.ReactNode;
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

function ElementBalance({ result }: { result: BaziResult }) {
    const elements = getElementBalance(result);
    const strongest = [...elements].sort((a, b) => b.value - a.value)[0];
    const conicGradient = buildConicGradient(elements);
    const descriptions = buildElementBalanceDescription(elements);

    return (
        <Card>
            <CardTitle title="오행 균형 분석" body="천간과 지장간을 함께 반영한 오행 분포입니다." />

            <div className="mt-5 flex items-center justify-center">
                <div className="relative flex h-44 w-44 items-center justify-center rounded-full" style={{ background: conicGradient }}>
                    <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-[#fffaf4] text-center shadow-inner">
                        <strong className="font-serif text-3xl tracking-normal">{strongest?.label.slice(0, 1) || '-'}</strong>
                        <span className="mt-1 text-base font-semibold">{strongest?.amount || '-'}</span>
                    </div>
                </div>
            </div>

            <div className="mt-5 space-y-3">
                {elements.map((element) => (
                    <div key={element.label} className="grid grid-cols-[46px_1fr_38px] items-center gap-3 text-sm">
                        <span className="text-[#493c31]">{element.label}</span>
                        <span className="h-2 overflow-hidden rounded-full bg-[#efe8df]">
                            <span className={`block h-full rounded-full ${element.color}`} style={{ width: element.width }} />
                        </span>
                        <span className="text-right font-semibold text-[#342a22]">{element.amount}</span>
                    </div>
                ))}
            </div>

            <p className="mt-5 rounded-md border border-[#eee1d4] bg-[#fcf8f3] p-4 break-keep text-sm leading-7 text-[#594b3f]">
                {descriptions.map((description) => (
                    <span key={description} className="block">{description}</span>
                ))}
            </p>
        </Card>
    );
}

function TraitPanel({ result }: { result: BaziResult }) {
    const interactionItems = getInteractionItems(result);
    const groupedItems = interactionConfigs
        .map((config) => ({
            ...config,
            items: interactionItems.filter((item) => item.label === config.label),
        }))
        .filter((group) => group.items.length > 0);

    return (
        <Card>
            <CardTitle title="합·충·형·파·해" body="원국 안에 표시된 주요 합·충·형·파·해 작용입니다." />

            {groupedItems.length > 0 ? (
                <div className="mt-5 rounded-md border border-[#eee1d4] bg-[#fcf8f3] p-4">
                    <dl className="space-y-3">
                    {groupedItems.map((group) => (
                        <div key={group.key} className="break-keep text-sm leading-7 text-[#4f4033]">
                            <dt className="inline font-bold text-[#33281f]">
                                {group.label}
                                <span className="font-serif text-[15px] font-bold tracking-normal">({group.hanja})</span>
                            </dt>
                            <dd className="inline">
                                {' : '}
                                <span className="font-serif text-[15px] tracking-normal">{group.items.map((item) => item.title).join(', ')}</span>
                            </dd>
                        </div>
                    ))}
                    </dl>
                </div>
            ) : (
                <div className="mt-5 rounded-md border border-[#eee1d4] bg-[#fcf8f3] p-4">
                    <p className="break-keep text-sm font-semibold text-[#493c31]">표시된 기본 합충 작용이 없습니다.</p>
                    <p className="mt-2 break-keep text-sm leading-6 text-[#66584c]">
                        이 경우에는 오행 균형, 일간의 세력, 십성 배치를 중심으로 명식을 살피는 것이 자연스럽습니다.
                    </p>
                </div>
            )}
        </Card>
    );
}

function DecadeFlow({ result }: { result: BaziResult }) {
    const daewoon = result.daewoon;
    const list = daewoon?.list || [];
    const currentDaewoon = daewoon?.current || findCurrentDaewoonItem(list);
    const upcomingDaewoon = currentDaewoon ? undefined : list.find((item) => item.start_year !== undefined && item.start_year > currentYear);
    const currentIndex = currentDaewoon?.index;
    const initialDaewoonIndex = findDaewoonListIndex(list, currentDaewoon);
    const [selectedDaewoonIndex, setSelectedDaewoonIndex] = useState<number | null>(null);
    const activeDaewoonIndex = selectedDaewoonIndex !== null && selectedDaewoonIndex < list.length
        ? selectedDaewoonIndex
        : Math.max(initialDaewoonIndex, 0);
    const selectedDaewoon = list[activeDaewoonIndex] || currentDaewoon;
    const activeYearGroup = buildYearCyclesFromDaewoon(selectedDaewoon);

    return (
        <Card>
            <CardTitle title="대운 흐름" body="10년 단위의 큰 흐름을 확인할 수 있습니다." />

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {list.map((item, index) => {
                    const isCurrent = item.index === currentIndex;
                    const isSelected = index === activeDaewoonIndex;

                    return (
                        <button
                            type="button"
                            key={`${item.index}-${item.start_year}`}
                            onClick={() => setSelectedDaewoonIndex(index)}
                            aria-pressed={isSelected}
                            className={`min-w-0 rounded-md border px-2 py-3 text-center transition-colors ${isSelected
                                ? 'border-[#a97945] bg-[#ae7a43] text-white shadow-[0_8px_18px_rgba(138,91,44,0.22)]'
                                : 'border-[#ede2d7] bg-[#fcf8f3] text-[#74675b] hover:border-[#d2b38f] hover:bg-[#fff8ee]'
                                }`}
                        >
                            <p className="font-serif text-lg font-bold leading-none tracking-normal sm:text-xl">
                                {item.gan}{item.ji}
                            </p>
                            <p className={`mt-2 text-[11px] font-semibold ${isSelected ? 'text-white/88' : 'text-[#6f6256]'}`}>
                                {formatAgeRange(item)}
                            </p>
                            <p className={`mt-1 text-[11px] ${isSelected ? 'text-white/78' : 'text-[#8a7b6f]'}`}>
                                {item.start_year || '-'}~{item.end_year || '-'}
                            </p>
                            {isCurrent && (
                                <p className={`mt-1 text-[10px] font-semibold ${isSelected ? 'text-white/85' : 'text-[#a26e3c]'}`}>현재</p>
                            )}
                        </button>
                    );
                })}
            </div>

            <h4 className="mt-7 font-serif text-xl font-bold tracking-normal">
                {selectedDaewoon ? `선택 대운 ${selectedDaewoon.gan || ''}${selectedDaewoon.ji || ''}` : '대운 시작 전'}
            </h4>
            <p className="mt-3 text-sm leading-6 text-[#66594d]">
                {selectedDaewoon
                    ? `${daewoon?.direction || '-'} · ${formatAgeRange(selectedDaewoon)} · ${selectedDaewoon.start_year || '-'}~${selectedDaewoon.end_year || '-'}년`
                    : `${daewoon?.direction || '-'} · ${daewoon?.start_age ?? '-'}세부터 시작${upcomingDaewoon ? ` · 첫 대운 ${upcomingDaewoon.gan || ''}${upcomingDaewoon.ji || ''} ${upcomingDaewoon.start_year || '-'}년` : ''}`}
            </p>

            <div className="mt-6 rounded-md border border-[#eee1d4] bg-[#fcf8f3] p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold text-[#a26e3c]">세운 흐름</p>
                        <h4 className="mt-1 font-serif text-lg font-bold tracking-normal text-[#33281f]">
                            {selectedDaewoon ? `${selectedDaewoon.gan || ''}${selectedDaewoon.ji || ''} 대운의 세운` : '선택 대운의 세운'}
                        </h4>
                    </div>
                    <p className="text-xs font-semibold text-[#806c59]">
                        {activeYearGroup?.[0]?.[0] || '-'}~{activeYearGroup?.[activeYearGroup.length - 1]?.[0] || '-'}년
                    </p>
                </div>

                {activeYearGroup?.length ? (
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {activeYearGroup.map(([year, gan, ji]) => {
                            const isCurrent = year === currentYear;

                            return (
                                <div
                                    key={year}
                                    className={`min-w-0 rounded-md border px-2 py-2 text-center ${isCurrent
                                        ? 'border-[#a97945] bg-[#ae7a43] text-white shadow-[0_8px_18px_rgba(138,91,44,0.18)]'
                                        : 'border-[#eadfd4] bg-white/70 text-[#66584c]'
                                        }`}
                                >
                                    <p className="text-[11px] font-semibold">{year}</p>
                                    <p className="mt-1 font-serif text-base font-bold leading-none tracking-normal">{gan}{ji}</p>
                                    {isCurrent && <p className="mt-1 text-[10px] font-semibold text-white/85">현재</p>}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="mt-3 break-keep text-sm leading-6 text-[#66584c]">활성 대운에 해당하는 세운 정보를 불러오지 못했습니다.</p>
                )}
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
        <section className={`relative isolate overflow-hidden rounded-lg border border-[#33251a] bg-[#15110d] text-white shadow-[0_18px_40px_rgba(24,17,11,0.18)] ${isSidebar
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
