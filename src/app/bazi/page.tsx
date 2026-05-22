'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    ArrowRight,
    BadgeCheck,
    ClipboardPenLine,
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

const pillars = [
    { title: '시주', role: '식신', stem: '辛', stemKorean: '신', branch: '巳', branchKorean: '사', element: '화(火)' },
    { title: '일주', role: '일간(나)', stem: '己', stemKorean: '기', branch: '丑', branchKorean: '축', element: '토(土)' },
    { title: '월주', role: '정재', stem: '癸', stemKorean: '계', branch: '亥', branchKorean: '해', element: '수(水)' },
    { title: '년주', role: '정관', stem: '庚', stemKorean: '경', branch: '午', branchKorean: '오', element: '화(火)' },
] as const;

const elements = [
    { label: '목(木)', amount: '15%', width: '30%', color: 'bg-[#417e50]' },
    { label: '화(火)', amount: '30%', width: '60%', color: 'bg-[#db3c39]' },
    { label: '토(土)', amount: '45%', width: '90%', color: 'bg-[#c58e49]' },
    { label: '금(金)', amount: '25%', width: '50%', color: 'bg-[#8f9190]' },
    { label: '수(水)', amount: '20%', width: '40%', color: 'bg-[#5f9ec1]' },
] as const;

const traits = [
    { icon: FeatherMark, title: '현실 감각', body: '실용적이고 현실적인 판단' },
    { icon: BadgeCheck, title: '책임감', body: '맡은 바를 끝까지 해내는 성향' },
    { icon: ClipboardPenLine, title: '신중함', body: '신중하게 생각하고 행동하는 스타일' },
] as const;

const decades = ['0~9세', '10~19세', '20~29세', '30~39세'] as const;
const days = Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, '0'));

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

    useEffect(() => {
        if (!showResult) return;

        document.getElementById('bazi-result')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }, [showResult]);

    return (
        <main className="overflow-hidden bg-[#f7f3ed] pb-16 pt-20 text-[#211a14]">
            <section className="relative isolate min-h-[466px] overflow-hidden border-b border-[#d9cbbb]">
                <Image
                    src="/home/banner_bg_img800.jpg"
                    alt=""
                    fill
                    priority
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
                        <BaziForm birthTimeId="desktop-birth-time" onAnalyze={() => setShowResult(true)} onReset={() => setShowResult(false)} />
                    </div>
                </div>
            </section>

            <div className="relative mx-auto w-[min(1180px,calc(100%-24px))]">
                <div className="relative z-10 -mt-10 lg:hidden">
                    <BaziForm birthTimeId="mobile-birth-time" onAnalyze={() => setShowResult(true)} onReset={() => setShowResult(false)} />
                </div>

                <div className={`grid gap-4 pt-4 lg:gap-7 lg:pt-8 ${showResult ? 'lg:grid-cols-[390px_minmax(0,1fr)]' : 'mx-auto max-w-6xl'}`}>
                    <aside className={showResult ? 'space-y-4 lg:pt-2' : 'grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,.92fr)] lg:items-stretch'}>
                        <div className={showResult ? '' : 'lg:col-span-2'}>
                            <FeatureStrip expanded={!showResult} />
                        </div>
                        <AboutPanel />
                        <ConsultationBanner variant={showResult ? 'sidebar' : 'intro'} />
                    </aside>

                    {showResult && (
                        <section id="bazi-result" className="scroll-mt-28 space-y-4">
                            <ResultHeading />

                            <div className="grid gap-4 xl:grid-cols-2">
                                <SajuChart />
                                <ElementBalance />
                                <TraitPanel />
                                <DecadeFlow />
                                <YearFlow />
                                <InterpretationPanel />
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
    onAnalyze,
    onReset,
}: {
    birthTimeId: string;
    onAnalyze: () => void;
    onReset: () => void;
}) {
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                onAnalyze();
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
                        <SelectBox label="년도" defaultValue="1990" values={['1988', '1989', '1990', '1991', '1992']} suffix="년" />
                        <SelectBox label="월" defaultValue="01" values={['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']} suffix="월" />
                        <SelectBox label="일" defaultValue="01" values={days} suffix="일" />
                    </div>
                </div>

                <ToggleGroup title="양력/음력" labels={['양력', '음력']} />

                <div>
                    <label htmlFor={birthTimeId} className="text-sm font-semibold text-[#56483c]">출생시간</label>
                    <div className="relative mt-2">
                        <input
                            id={birthTimeId}
                            type="time"
                            defaultValue="10:30"
                            className="h-12 w-full rounded-md border border-[#e4d8cb] bg-white/72 px-4 pr-11 text-sm text-[#493b2d] outline-none transition focus:border-[#ad7b42]"
                        />
                        <Clock3 className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b4814c]" />
                    </div>
                    <label className="mt-3 inline-flex items-center gap-2 text-sm text-[#6d6259]">
                        <input type="checkbox" className="h-4 w-4 rounded border-[#cbb9a4] accent-[#ad7b42]" />
                        출생시간 모름
                    </label>
                </div>

                <ToggleGroup title="성별" labels={['남성', '여성']} />
            </fieldset>

            <button className="mt-6 inline-flex h-14 w-full items-center justify-center gap-3 rounded-md bg-[#11100e] px-5 text-base font-semibold text-white transition hover:bg-[#2a211a]">
                만세력 확인하기
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
    label,
    values,
    suffix,
    defaultValue,
}: {
    label: string;
    values: readonly string[];
    suffix: string;
    defaultValue: string;
}) {
    return (
        <label className="flex min-w-0 items-center gap-1">
            <span className="sr-only">{label}</span>
            <select
                aria-label={label}
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

function ToggleGroup({ title, labels }: { title: string; labels: readonly [string, string] }) {
    return (
        <div>
            <p className="text-sm font-semibold text-[#56483c]">{title}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
                {labels.map((label, index) => (
                    <label key={label} className="cursor-pointer">
                        <input type="radio" name={title} defaultChecked={index === 0} className="peer sr-only" />
                        <span className="flex h-12 items-center justify-center rounded-md border border-[#e4d8cb] bg-white/62 text-sm font-semibold text-[#75685e] transition peer-checked:border-[#a97945] peer-checked:bg-[#a97945] peer-checked:text-white">
                            {label}
                        </span>
                    </label>
                ))}
            </div>
        </div>
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

function ResultHeading() {
    return (
        <header className="rounded-lg border border-[#eadfd4] bg-white/72 px-5 py-4 shadow-[0_12px_32px_rgba(58,42,29,0.05)] sm:flex sm:items-end sm:justify-between">
            <div>
                <p className="text-xs font-semibold text-[#a26e3c]">Bazi Analysis</p>
                <h2 className="mt-1 font-serif text-2xl font-bold tracking-normal text-[#291f17]">분석 결과</h2>
            </div>
            <p className="mt-2 text-sm text-[#75695f] sm:mt-0">입력한 생시를 바탕으로 사주의 구조를 살펴봅니다.</p>
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
        <section className={`rounded-lg border border-[#eee2d6] bg-white/72 p-5 shadow-[0_12px_32px_rgba(58,42,29,0.06)] ${className}`}>
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

function SajuChart() {
    return (
        <Card>
            <CardTitle title="사주 정국" body="태어난 순간의 네 기둥입니다." />

            <div className="mt-4 overflow-hidden rounded-md border border-[#ecdccd] bg-[#fffaf4]">
                <div className="grid grid-cols-4 border-b border-[#eadfd4] text-center">
                    {pillars.map((pillar) => (
                        <div key={pillar.title} className="border-r border-[#eadfd4] py-3 last:border-r-0">
                            <p className="text-xs font-semibold text-[#65574b]">{pillar.title}</p>
                            <p className="mt-3 text-xs text-[#9d7750]">{pillar.role}</p>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-4 text-center">
                    {pillars.map((pillar) => (
                        <article key={pillar.stem} className="border-r border-[#eadfd4] last:border-r-0">
                            <div className="border-b border-[#eadfd4] py-4">
                                <p className="font-serif text-[2.15rem] leading-none text-[#15110d]">{pillar.stem}</p>
                                <p className="mt-2 text-xs text-[#716459]">{pillar.stemKorean}</p>
                            </div>
                            <div className="border-b border-[#eadfd4] py-4">
                                <p className="font-serif text-[2.15rem] leading-none text-[#15110d]">{pillar.branch}</p>
                                <p className="mt-2 text-xs text-[#716459]">{pillar.branchKorean}</p>
                            </div>
                            <p className="py-3 text-xs text-[#8a6245]">{pillar.element}</p>
                        </article>
                    ))}
                </div>
            </div>

            <div className="mt-4 flex gap-3 rounded-md bg-[#fbf5ef] p-4">
                <Sparkles className="mt-1 h-6 w-6 shrink-0 text-[#b98451]" strokeWidth={1.4} />
                <p className="break-keep text-sm leading-7 text-[#58493c]">
                    일간은 기토(己土)로, 따뜻한 대지와 같은 성향을 지니고 있습니다.
                </p>
            </div>

            <OutlineButton />
        </Card>
    );
}

function ElementBalance() {
    return (
        <Card>
            <CardTitle title="오행 균형 분석" body="오행의 분포와 균형을 확인해보세요." />

            <div className="mt-5 flex items-center justify-center">
                <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-[conic-gradient(#417e50_0_11%,#db3c39_11%_33%,#c58e49_33%_67%,#8f9190_67%_85%,#5f9ec1_85%_100%)]">
                    <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-[#fffaf4] text-center shadow-inner">
                        <strong className="font-serif text-3xl tracking-normal">토</strong>
                        <span className="mt-1 text-base font-semibold">강함</span>
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
                토의 기운이 강한 편으로 중심이 안정적이며, 의의 기운이 있어 추진력과 실행력이 좋습니다.
            </p>
        </Card>
    );
}

function TraitPanel() {
    return (
        <Card>
            <CardTitle title="핵심 성향 분석" body="사주의 구조가 알려주는 당신의 모습입니다." />
            <div className="mt-6 grid grid-cols-3 gap-3">
                {traits.map(({ icon: Icon, title, body }) => (
                    <article key={title} className="min-w-0 text-center">
                        <Icon className="mx-auto h-9 w-9 text-[#b57f48]" strokeWidth={1.25} />
                        <h4 className="mt-3 text-sm font-bold text-[#503d2d]">{title}</h4>
                        <p className="mt-2 break-keep text-xs leading-5 text-[#716459]">{body}</p>
                    </article>
                ))}
            </div>
        </Card>
    );
}

function DecadeFlow() {
    return (
        <Card>
            <CardTitle title="대운 흐름" body="10년 단위의 큰 흐름을 확인할 수 있습니다." />

            <div className="mt-5 grid grid-cols-4 gap-2">
                {decades.map((decade) => (
                    <button
                        key={decade}
                        className={`h-11 rounded-md text-xs font-semibold ${decade === '20~29세'
                            ? 'bg-[#ae7a43] text-white shadow-[0_8px_18px_rgba(138,91,44,0.22)]'
                            : 'border border-[#ede2d7] bg-[#fcf8f3] text-[#74675b]'
                            }`}
                    >
                        {decade}
                    </button>
                ))}
            </div>

            <div className="mt-5 px-1">
                <div className="relative h-px bg-[#c69a6b]">
                    <span className="absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-[#b47b41] bg-[#fcf8f3]" />
                    <span className="absolute left-[45%] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-[#b47b41] bg-[#fcf8f3]" />
                    <span className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-[#d6b998] bg-[#fcf8f3]" />
                </div>
            </div>

            <h4 className="mt-7 font-serif text-xl font-bold tracking-normal">도약의 시기</h4>
            <p className="mt-3 text-sm leading-6 text-[#66594d]">능력을 발휘하고 기반을 쌓는 시기</p>
            <OutlineButton />
        </Card>
    );
}

function YearFlow() {
    return (
        <Card>
            <CardTitle title="올해 흐름" body="올해는 갑진(甲辰)년입니다." />

            <div className="mt-5 grid grid-cols-4 gap-2">
                {['핵심 키워드', '변화', '정리', '관계'].map((label, index) => (
                    <button
                        key={label}
                        className={`h-10 rounded-md text-xs font-semibold ${index === 0
                            ? 'bg-[#b47d42] text-white'
                            : 'border border-[#ede2d7] bg-[#fcf8f3] text-[#74675b]'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-full bg-[#efe4d7]">
                    <Image
                        src="/home/banner_bg_img800.jpg"
                        alt=""
                        fill
                        sizes="144px"
                        className="object-cover object-[76%_78%] opacity-80"
                    />
                    <div className="absolute inset-0 bg-[#fff2dd]/25" />
                </div>
                <p className="break-keep text-sm leading-8 text-[#4a3b2e]">
                    새로운 변화가 생기는 해입니다.
                    <br />
                    기반을 정리하고 방향을 재정비하면 좋은 기회를 만날 수 있습니다.
                </p>
            </div>

            <div className="mt-5 grid gap-2">
                <FlowNote title="주의할 점" body="너무 서두르기보다 계획적으로 움직이는 것이 중요합니다." />
                <FlowNote title="한 줄 조언" body="중심을 지키며 기회를 준비하는 시간이 필요합니다." />
            </div>
        </Card>
    );
}

function FlowNote({ title, body }: { title: string; body: string }) {
    return (
        <article className="rounded-md border border-[#eee2d6] bg-[#fffaf4] p-3">
            <h4 className="text-xs font-bold text-[#594839]">{title}</h4>
            <p className="mt-1 break-keep text-xs leading-5 text-[#776a5f]">{body}</p>
        </article>
    );
}

function InterpretationPanel() {
    return (
        <Card>
            <CardTitle title="도원 해석" body="단순 길흉이 아닌, 삶의 방향과 흐름을 함께 봅니다." />

            <blockquote className="mt-5 rounded-md border border-[#eadbc9] bg-[#fcf7f0] p-5 font-serif text-base leading-8 tracking-normal text-[#38291d]">
                당신의 사주는 안정적인 중심을 가진 구조입니다. 균형과 책임감으로 신뢰를 얻으며,
                시간이 지나면서 더욱 빛을 발하는 흐름입니다.
            </blockquote>

            <div className="mt-5 space-y-4">
                {supportItems.map(({ icon: Icon, title, body }) => (
                    <article key={title} className="flex gap-4">
                        <Icon className="mt-1 h-7 w-7 shrink-0 text-[#bf8750]" strokeWidth={1.35} />
                        <div>
                            <h4 className="text-sm font-bold text-[#6a4d33]">{title}</h4>
                            <p className="mt-1 break-keep text-sm leading-6 text-[#6f6257]">{body}</p>
                        </div>
                    </article>
                ))}
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

function OutlineButton() {
    return (
        <button className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-[#e4d5c4] bg-[#fffaf4] text-sm font-semibold text-[#85572f] transition hover:border-[#b5814a] hover:bg-white">
            자세히 보기
            <ArrowRight className="h-4 w-4" />
        </button>
    );
}

function FeatherMark({ className, strokeWidth }: { className?: string; strokeWidth?: number }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
            <path
                d="M20.5 3.5c-6.2.1-10.8 2.7-13.4 7.8-1.1 2.1-1.5 4.5-1.7 7.2 2.1-.4 4.1-1.3 5.8-2.7 4-3.2 6.6-7.2 9.3-12.3Z"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
            />
            <path d="M4 20c3.2-3.1 6.6-5.9 10.2-8.4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
        </svg>
    );
}
