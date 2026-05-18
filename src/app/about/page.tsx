import Image from 'next/image';
import {
    ArrowRight,
    BarChart3,
    BriefcaseBusiness,
    CalendarDays,
    Compass,
    CreditCard,
    Heart,
    Home,
    Leaf,
    MessageCircle,
    PenLine,
    Phone,
    Scale,
    User,
    Users,
} from 'lucide-react';

const strengths = [
    {
        icon: Compass,
        title: '흐름 중심 해석',
        description: '결론보다 본질을 읽어 흐름의 맥락을 파악합니다.',
    },
    {
        icon: Scale,
        title: '현실 중심 상담',
        description: '현실에 적용 가능한 방향을 구체적으로 제안합니다.',
    },
    {
        icon: Leaf,
        title: '과장 없는 상담',
        description: '불안과 공포를 조장하지 않고 진실된 조언을 드립니다.',
    },
    {
        icon: User,
        title: '1:1 맞춤 상담',
        description: '개인의 상황과 시기를 고려한 맞춤형 상담을 진행합니다.',
    },
];

const specialties = [
    {
        icon: Compass,
        title: '사주 상담',
        description: '타고난 흐름과 운의 구조를 분석합니다.',
    },
    {
        icon: Heart,
        title: '연애 · 결혼',
        description: '인연의 흐름과 시기를 함께 살펴봅니다.',
    },
    {
        icon: BriefcaseBusiness,
        title: '진로 · 직업',
        description: '적성에 맞는 방향과 타이밍을 제안합니다.',
    },
    {
        icon: BarChart3,
        title: '사업 · 재물',
        description: '사업의 흐름과 재물운의 균형을 봅니다.',
    },
    {
        icon: PenLine,
        title: '작명 · 개명',
        description: '사주에 맞는 이름으로 조화와 균형을 돕습니다.',
    },
    {
        icon: Home,
        title: '이사 · 택일',
        description: '이사, 개업 등 중요한 일의 좋은 시기를 선택합니다.',
    },
];

const processSteps = [
    {
        icon: CalendarDays,
        number: '01',
        title: '현재 흐름 분석',
        description: '사주의 구조와 흐름을 함께 살펴봅니다.',
    },
    {
        icon: MessageCircle,
        number: '02',
        title: '현실적인 방향 제안',
        description: '현재 상황에 맞는 방향을 함께 고민합니다.',
    },
    {
        icon: Leaf,
        number: '03',
        title: '이름과 균형 해석',
        description: '부족한 기운과 조화를 고려하여 해석합니다.',
    },
    {
        icon: Users,
        number: '04',
        title: '충분한 상담',
        description: '예약제로 여유 있는 상담 시간을 제공합니다.',
    },
];

const expertiseTags = ['사주 상담', '연애 · 결혼', '진로 · 직업', '사업 · 재물', '작명 · 개명', '이사 · 택일'];

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#f8f4ed] pt-20 font-serif text-[#17130f] antialiased">
            <HeroSection />
            <StrengthSection />
            <DirectorSection />
            <PhilosophySection />
            <SpecialtySection />
            <ReservationSection />
        </main>
    );
}

function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-[#ebe3d6]">
            <div className="absolute right-0 top-24 h-[220px] w-[140px] lg:hidden">
                <Image
                    src="/login/mountain_r.webp"
                    alt=""
                    fill
                    sizes="140px"
                    className="object-contain object-right opacity-40"
                />
                <svg
                    viewBox="0 0 140 220"
                    aria-hidden="true"
                    className="pointer-events-none absolute right-[-8px] top-[-66px] z-10 h-full w-full scale-x-[-1]"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M12 18C74 48 80 174 18 206"
                        stroke="#A77B45"
                        strokeOpacity="0.22"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                    />
                    <path
                        d="M30 34C84 66 88 156 34 188"
                        stroke="#A77B45"
                        strokeOpacity="0.14"
                        strokeWidth="1"
                        strokeLinecap="round"
                    />
                </svg>
            </div>
            <div className="absolute left-0 top-10 hidden h-[380px] w-[220px] lg:block">
                <Image
                    src="/login/mountain_lb.webp"
                    alt=""
                    fill
                    sizes="220px"
                    className="object-contain object-left opacity-20"
                />
                <svg
                    viewBox="0 0 220 380"
                    aria-hidden="true"
                    className="relative z-10 h-full w-full"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M12 24C110 82 118 298 16 356"
                        stroke="#A77B45"
                        strokeOpacity="0.26"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M42 52C126 108 132 276 46 330"
                        stroke="#A77B45"
                        strokeOpacity="0.16"
                        strokeWidth="1"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            <div className="absolute inset-y-0 right-0 hidden w-[46vw] min-w-[540px] lg:block">
                <Image
                    src="/about/profile1.webp"
                    alt="도원 상담 공간에서 상담을 준비하는 모습"
                    fill
                    priority
                    sizes="46vw"
                    className="object-cover object-center brightness-[0.97] contrast-[0.94]"
                />
                <div className="absolute inset-0 bg-[#f1e9dc]/10" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 pb-0 pt-12 sm:px-10 lg:py-10">
                <div className="lg:min-h-[360px]">
                    <div className="flex max-w-2xl flex-col justify-center py-4 lg:min-h-[360px] lg:px-14 lg:py-8">
                        <div className="mb-8 flex items-center gap-5">
                            <span className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-[#a77b45]">
                                About Us
                            </span>
                            <span className="h-px w-10 bg-[#a77b45]/50" />
                        </div>

                        <h1 className="text-3xl font-light leading-[1.45] text-[#15110d] break-keep sm:text-4xl lg:text-5xl">
                            삶의 흐름을 읽고,<br />
                            당신에게 필요한 <span className="text-[#a77b45]">방향</span>을<br />
                            함께 고민합니다
                        </h1>

                        <p className="mt-10 max-w-md font-sans text-base leading-8 text-[#49423a] break-keep">
                            도원은 단순한 결과보다 사람의 흐름과 균형을 깊이 있게 바라봅니다.
                        </p>
                    </div>
                </div>

                <div className="relative mt-8 min-h-[280px] overflow-hidden -mx-6 sm:-mx-10 sm:min-h-[360px] lg:hidden">
                    <Image
                        src="/about/profile1.webp"
                        alt="도원 상담 공간에서 상담을 준비하는 모습"
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover object-center brightness-[0.97] contrast-[0.94]"
                    />
                    <div className="absolute inset-0 bg-[#f1e9dc]/10" />
                </div>
            </div>
        </section>
    );
}

function StrengthSection() {
    return (
        <section className="bg-[#fbf8f2] px-6 py-12 sm:py-16 lg:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex items-center gap-5">
                    <h2 className="text-2xl font-light text-[#17130f]">왜 도원인가요?</h2>
                    <span className="h-px w-10 bg-[#a77b45]/40" />
                </div>

                <div className="grid grid-cols-1 divide-y divide-[#d8cbbb] border-[#d8cbbb] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
                    {strengths.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div key={item.title} className="px-4 py-8 text-center sm:px-8">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#a77b45]/45 text-[#a77b45]">
                                    <Icon className="h-7 w-7" strokeWidth={1.4} />
                                </div>
                                <h3 className="mt-7 text-xl font-light text-[#17130f] break-keep">
                                    {item.title}
                                </h3>
                                <p className="mx-auto mt-4 max-w-[180px] font-sans text-sm leading-7 text-[#504941] break-keep">
                                    {item.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function DirectorSection() {
    return (
        <section className="bg-[#f3ede4] px-6 py-12 lg:px-10">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.95fr] lg:items-stretch">
                <div className="relative min-h-[380px] overflow-hidden rounded-lg">
                    <Image
                        src="/about/profile4.webp"
                        alt="도원사주작명원 김종찬 원장"
                        fill
                        sizes="(min-width: 1024px) 34vw, 100vw"
                        className="object-cover object-center"
                    />
                </div>

                <div className="grid gap-10 bg-[#f7f1e8] p-8 shadow-[0_18px_50px_rgba(91,65,35,0.06)] sm:p-10 lg:grid-cols-[1.2fr_0.8fr]">
                    <div>
                        <p className="font-sans text-sm font-medium text-[#a77b45]">원장 소개</p>
                        <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-2">
                            <h2 className="text-4xl font-light text-[#17130f]">김종찬</h2>
                            <span className="font-sans text-sm text-[#5f554b]">도원사주작명원 원장</span>
                        </div>

                        <blockquote className="mt-8 border-b border-[#a77b45]/35 pb-7 text-2xl font-light leading-relaxed text-[#211b15] break-keep">
                            “삶은 끊임없이 변화하는 흐름이라 생각합니다.”
                        </blockquote>

                        <div className="mt-8 space-y-5 font-sans text-sm leading-8 text-[#4b443c] break-keep">
                            <p>
                                20년 넘게 사주와 성명학을 연구하며 수많은 분들의 삶과 선택을 함께 고민해왔습니다.
                            </p>
                            <p>
                                인생은 누구에게나 예상하지 못한 흐름과 중요한 갈림길이 찾아옵니다. 도원은 단순히 결과를 단정하기보다, 현재의 흐름 속에서 더 나은 방향을 함께 찾는 상담을 지향합니다.
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-[#d8cbbb] pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                        <InfoList title="주요 경력" items={['명리학 / 사주명리 상담 15년 경력', '다수의 기업 및 개인 상담 진행', '사주명리학 연구회 정회원', '명리학 강의 및 칼럼 활동']} />

                        <div className="mt-10">
                            <h3 className="font-sans text-base font-medium text-[#a77b45]">전문 분야</h3>
                            <div className="mt-5 flex flex-wrap gap-3">
                                {expertiseTags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full border border-[#a77b45]/45 px-4 py-2 font-sans text-sm text-[#5b4731]"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function PhilosophySection() {
    return (
        <section className="relative overflow-hidden bg-[#171512] px-6 py-14 text-white lg:px-10">
            <div className="absolute inset-y-0 left-0 w-1/3 opacity-[0.08] [background-image:radial-gradient(circle_at_0%_50%,#c59a61_0,transparent_42%)]" />

            <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.25fr] lg:items-center">
                <div className="border-b border-white/10 pb-10 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-12">
                    <div className="mb-6 flex items-center gap-4">
                        <span className="h-px w-8 bg-[#c59a61]" />
                        <span className="font-sans text-sm font-semibold text-[#c59a61]">이름에 담는 철학</span>
                    </div>
                    <h2 className="text-3xl font-light leading-relaxed text-[#eee0cc] break-keep sm:text-4xl">
                        이름은 단순한 호칭이 아닙니다.
                    </h2>
                    <p className="mt-7 font-sans text-lg leading-9 text-white/75 break-keep">
                        삶 속에서 가장 오래 불리고, 자신을 가장 가까이 대변하는 존재입니다.
                    </p>
                    <p className="mt-7 max-w-lg font-sans text-sm leading-8 text-white/55 break-keep">
                        도원은 사주의 흐름과 균형을 바탕으로 개인의 삶에 조화롭게 어울리는 이름을 제안합니다.
                    </p>
                </div>

                <div>
                    <div className="mb-8">
                        <h3 className="font-sans text-lg font-medium text-[#c59a61]">상담 진행 과정</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {processSteps.map((item, index) => {
                            const Icon = item.icon;

                            return (
                                <div key={item.number} className="relative text-center">
                                    {index < processSteps.length - 1 && (
                                        <ArrowRight className="absolute right-[-24px] top-8 hidden h-4 w-4 text-[#c59a61]/55 lg:block" />
                                    )}
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#c59a61]/65 text-[#c59a61]">
                                        <Icon className="h-7 w-7" strokeWidth={1.4} />
                                    </div>
                                    <span className="mt-4 block font-sans text-sm text-[#c59a61]">{item.number}</span>
                                    <h4 className="mt-3 text-lg font-light text-[#eee0cc] break-keep">{item.title}</h4>
                                    <p className="mx-auto mt-3 max-w-[150px] font-sans text-sm leading-7 text-white/55 break-keep">
                                        {item.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

function SpecialtySection() {
    return (
        <section className="bg-[#fbf8f2] px-6 py-12 sm:py-16 lg:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center gap-5">
                    <h2 className="text-2xl font-light text-[#17130f]">전문 상담 분야</h2>
                    <span className="h-px w-10 bg-[#a77b45]/40" />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
                    {specialties.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.title}
                                className="rounded-lg border border-[#eadfce] bg-white/86 p-6 text-center shadow-[0_12px_32px_rgba(91,65,35,0.06)]"
                            >
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#a77b45]/35 text-[#a77b45]">
                                    <Icon className="h-6 w-6" strokeWidth={1.4} />
                                </div>
                                <h3 className="mt-5 text-xl font-light text-[#17130f] break-keep">{item.title}</h3>
                                <p className="mt-4 font-sans text-sm leading-7 text-[#514a42] break-keep">{item.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function ReservationSection() {
    return (
        <section className="bg-[#fbf8f2] px-6 pb-16 lg:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="flex items-center gap-5">
                        <h2 className="text-2xl font-light text-[#17130f]">상담 예약 및 문의</h2>
                        <span className="h-px w-10 bg-[#a77b45]/40" />
                    </div>
                    <p className="font-sans text-sm text-[#5b544d] break-keep">
                        예약 상담으로 운영됩니다. 편하신 방법으로 문의해주세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <a
                        href="https://booking.naver.com/booking/6/bizes/167387"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group rounded-lg border border-[#b89768]/45 bg-white/70 p-6 transition-colors hover:bg-white"
                    >
                        <ContactCardHeader icon={<CalendarDays className="h-7 w-7" />} title="네이버 예약" />
                        <p className="mt-5 font-sans text-sm leading-7 text-[#514a42] break-keep">
                            원하는 날짜와 시간을 간편하게 선택하세요.
                        </p>
                        <span className="mt-5 inline-flex h-11 items-center gap-3 rounded bg-[#a77b45] px-6 font-sans text-sm font-semibold text-white transition-colors group-hover:bg-[#946b3a]">
                            예약하기
                            <ArrowRight className="h-4 w-4" />
                        </span>
                    </a>

                    <a href="tel:063-285-7255" className="rounded-lg border border-[#b89768]/45 bg-white/70 p-6 transition-colors hover:bg-white">
                        <ContactCardHeader icon={<Phone className="h-7 w-7" />} title="전화 문의" />
                        <p className="mt-5 font-sans text-sm text-[#514a42]">방문 전 사전예약 필수</p>
                        <p className="mt-3 font-sans text-3xl font-medium text-[#17130f]">063-285-7255</p>
                        <p className="mt-2 font-sans text-sm text-[#514a42]">오전 10:00 - 오후 6:00</p>
                    </a>

                    <div className="rounded-lg border border-[#b89768]/45 bg-white/70 p-6">
                        <ContactCardHeader icon={<CreditCard className="h-7 w-7" />} title="상담비 입금 계좌" />
                        <p className="mt-5 font-sans text-sm text-[#514a42]">하나은행 (예금주: 김종찬)</p>
                        <p className="mt-3 font-sans text-2xl font-medium text-[#17130f] sm:text-3xl">7029-1100-3499-07</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
    return (
        <div>
            <h3 className="font-sans text-base font-medium text-[#a77b45]">{title}</h3>
            <ul className="mt-5 space-y-3 font-sans text-sm leading-7 text-[#4b443c]">
                {items.map((item) => (
                    <li key={item} className="flex gap-2">
                        <span className="mt-[0.7em] h-1 w-1 shrink-0 rounded-full bg-[#a77b45]" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ContactCardHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#a77b45]/35 bg-[#fbf8f2] text-[#a77b45]">
                {icon}
            </div>
            <h3 className="text-xl font-light text-[#17130f]">{title}</h3>
        </div>
    );
}
