import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowRight,
    BarChart3,
    CalendarCheck,
    ChevronDown,
    ClipboardCheck,
    Clock3,
    FileSearch,
    Heart,
    MapPin,
    MessageCircle,
    PenLine,
    Phone,
    RefreshCcw,
    ScrollText,
    Send,
    User,
} from 'lucide-react';
import ReservationSection from '@/components/common/ReservationSection';
import { services, type ServiceIcon } from '@/data/services';

const serviceIcons: Record<ServiceIcon, typeof ScrollText> = {
    scroll: ScrollText,
    heart: Heart,
    user: User,
    chart: BarChart3,
    pen: PenLine,
    calendar: CalendarCheck,
};

const recommendations = [
    { icon: ScrollText, label: '인생의 방향이 고민될 때' },
    { icon: Heart, label: '관계의 흐름이 궁금할 때' },
    { icon: User, label: '진로 · 직업이 고민될 때' },
    { icon: BarChart3, label: '사업 · 재물의 방향이 필요할 때' },
    { icon: PenLine, label: '좋은 이름이 필요할 때' },
    { icon: RefreshCcw, label: '이름을 바꾸고 새로운 시작을 할 때' },
];

const processSteps = [
    {
        icon: CalendarCheck,
        number: '01',
        title: '예약 및 정보 전달',
        description: '원하시는 상담을 선택 후 예약을 진행하고, 기본 정보를 전달합니다.',
    },
    {
        icon: FileSearch,
        number: '02',
        title: '사전 명식 분석',
        description: '전달해주신 정보를 바탕으로 사전 명식 분석을 진행하여 상담을 준비합니다.',
    },
    {
        icon: MessageCircle,
        number: '03',
        title: '1:1 상담 진행',
        description: '분석 내용을 바탕으로 1:1 상담을 통해 궁금한 점을 해소합니다.',
    },
    {
        icon: ClipboardCheck,
        number: '04',
        title: '상담 후 방향 정리',
        description: '상담 내용을 정리하여 앞으로의 방향과 조언을 전달드립니다.',
    },
];

const guideItems = [
    { icon: Clock3, label: '상담 시간', value: '10:00 - 20:00 (예약제)' },
    { icon: Phone, label: '상담 방법', value: '방문 상담 / 전화 상담' },
    { icon: MessageCircle, label: '예약 방법', value: '전화 또는 카카오톡 예약' },
    { icon: ClipboardCheck, label: '예약 변경 및 취소', value: '1일 전까지 가능' },
    { icon: MapPin, label: '위치', value: '전북 전주시 (예약 시 상세 안내)' },
];

const faqs = [
    {
        question: '사주를 잘 몰라도 상담이 가능한가요?',
        answer: '네, 전혀 걱정하지 않으셔도 됩니다. 이해하기 쉽게 설명드립니다.',
    },
    {
        question: '상담 시간은 어떻게 되나요?',
        answer: '상담은 10:00 - 20:00까지 예약제로 진행됩니다.',
    },
    {
        question: '전화 상담도 가능한가요?',
        answer: '네, 방문이 어려운 경우 전화 상담으로도 가능합니다.',
    },
    {
        question: '예약은 어떻게 하나요?',
        answer: '전화 또는 카카오톡으로 편하게 예약하실 수 있습니다.',
    },
];

export default function ServicesPage() {
    return (
        <main className="min-h-screen bg-[#f7f3ec] pt-20 font-serif text-[#18130f] antialiased">
            <HeroSection />
            <ConsultationSection />
            <RecommendationSection />
            <ProcessSection />
            <FaqSection />
            <CtaSection />
            <ReservationSection />
        </main>
    );
}

function HeroSection() {
    return (
        <section className="relative min-h-[420px] overflow-hidden bg-[#15120f] text-white sm:min-h-[480px] lg:min-h-[400px]">
            <Image
                src="/counseling/subimage5.webp"
                alt="상담 책상 위 명리학 서적과 만년필"
                fill
                priority
                sizes="100vw"
                className="object-cover object-center opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f0d0a]/82 via-[#0f0d0a]/56 to-[#0f0d0a]/10" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/15" />
            <div className="absolute left-0 top-12 hidden h-56 w-56 rounded-full border border-[#b58a55]/10 lg:block" />
            <div className="absolute left-8 top-20 hidden h-40 w-40 rounded-full border border-[#b58a55]/15 lg:block" />

            <div className="relative mx-auto flex min-h-[420px] max-w-7xl items-center px-6 py-16 sm:min-h-[480px] sm:px-10 lg:min-h-[400px]">
                <div className="max-w-2xl">
                    <div className="mb-7 flex items-center gap-4">
                        <span className="font-sans text-sm font-medium text-[#c7a16c]">상담 종류별 가격 안내</span>
                        <span className="h-px w-10 bg-[#c7a16c]/65" />
                    </div>
                    <h1 className="text-4xl font-light leading-[1.35] tracking-[-0.02em] text-white break-keep sm:text-5xl lg:text-6xl">
                        당신의 <span className="text-[#c7a16c]">흐름</span>에 맞는<br />
                        상담을 선택해보세요
                    </h1>
                    <p className="mt-9 max-w-md font-sans text-base leading-8 text-white/72 break-keep">
                        도원은 개인의 상황과 흐름에 따라 가장 필요한 상담 방향을 함께 고민합니다.
                    </p>
                </div>
            </div>
        </section>
    );
}

function ConsultationSection() {
    return (
        <section className="bg-[#f8f4ee] px-6 py-14 sm:px-10 sm:py-16">
            <div className="mx-auto max-w-7xl">
                <SectionHeading eyebrow="상담 종류 및 가격" title="필요한 순간, 가장 필요한 상담" description="다양한 상담 메뉴를 통해 인생의 방향을 함께 찾아갑니다." />

                <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {services.map((item) => {
                        const Icon = serviceIcons[item.icon];

                        return (
                            <article key={item.title} className="flex min-h-[360px] flex-col border border-[#e2d6c6] bg-white/75 p-6 text-center shadow-[0_14px_36px_rgba(67,45,24,0.055)]">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#a77b45]/45 text-[#a77b45]">
                                    <Icon className="h-6 w-6" strokeWidth={1.45} />
                                </div>
                                <h3 className="mt-6 text-xl font-light text-[#17130f] break-keep">{item.title}</h3>
                                <p className="mt-4 min-h-[72px] font-sans text-sm leading-7 text-[#514940] break-keep">{item.description}</p>
                                <div className="mb-6 mt-5 border-t border-[#e7dccd] pt-5">
                                    <ul className="mx-auto inline-block space-y-2 text-left font-sans text-sm text-[#4e453b]">
                                        {item.items.map((detail) => (
                                            <li key={detail} className="flex gap-2">
                                                <span className="mt-[0.65em] h-1 w-1 shrink-0 rounded-full bg-[#a77b45]" />
                                                <span>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mt-auto border-t border-[#e7dccd] pt-5">
                                    <div className="font-sans">
                                        <strong className="text-xl font-semibold text-[#17130f]">{item.price}</strong>
                                    </div>
                                    <Link
                                        href="/submit"
                                        className="mt-5 inline-flex h-10 w-full items-center justify-center bg-[#a77b45] font-sans text-sm font-medium text-white transition-colors hover:bg-[#8f683b]"
                                    >
                                        상담 신청
                                    </Link>
                                    <Link href={`/services/${item.slug}`} className="mt-2 inline-flex h-10 w-full items-center justify-center border border-[#b89768]/45 font-sans text-sm text-[#7a5a32] transition-colors hover:bg-[#f3eadf]">
                                        자세히 보기
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function RecommendationSection() {
    return (
        <section className="bg-[#15130f] text-white">
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr]">
                <div className="px-6 py-10 sm:px-10 lg:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))] lg:pr-10">
                    <div className="mb-8 flex items-center gap-5">
                        <h2 className="font-sans text-base font-medium text-[#c7a16c]">이런 분께 추천합니다</h2>
                        <span className="h-px w-12 bg-[#c7a16c]/45" />
                    </div>
                    <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
                        {recommendations.map((item, index) => {
                            const Icon = item.icon;

                            return (
                                <div key={item.label} className={`px-4 text-center ${index > 0 ? 'border-l border-white/10' : ''}`}>
                                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-[#c7a16c]/55 text-[#c7a16c]">
                                        <Icon className="h-5 w-5" strokeWidth={1.45} />
                                    </div>
                                    <p className="mx-auto mt-4 max-w-[120px] font-sans text-sm leading-6 text-white/78 break-keep">{item.label}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="relative min-h-[240px] overflow-hidden lg:min-h-full">
                    <Image
                        src="/counseling/subimage6.webp"
                        alt="차분한 상담 공간"
                        fill
                        sizes="(min-width: 1024px) 34vw, 100vw"
                        className="object-cover object-right opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#15130f]/20" />
                </div>
            </div>
        </section>
    );
}

function ProcessSection() {
    return (
        <section className="relative overflow-hidden bg-[#fbf8f3] px-6 py-14 sm:px-10 sm:py-16">
            <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.85fr_1fr] lg:items-stretch">
                <div className="lg:flex lg:h-full lg:flex-col">
                    <div className="mb-10 flex items-center gap-5">
                        <h2 className="text-2xl font-light text-[#17130f]">상담 진행 방식</h2>
                        <span className="h-px w-10 bg-[#a77b45]/45" />
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {processSteps.map((item, index) => {
                            const Icon = item.icon;

                            return (
                                <div key={item.number} className="relative text-center">
                                    {index < processSteps.length - 1 && (
                                        <ArrowRight className="absolute right-[-20px] top-12 hidden h-4 w-4 text-[#a77b45]/45 lg:block" />
                                    )}
                                    <span className="font-sans text-sm font-semibold text-[#a77b45]">{item.number}</span>
                                    <div className="mx-auto mt-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#a77b45]/35 text-[#a77b45]">
                                        <Icon className="h-6 w-6" strokeWidth={1.45} />
                                    </div>
                                    <h3 className="mt-6 text-lg font-light text-[#17130f] break-keep">{item.title}</h3>
                                    <p className="mx-auto mt-4 max-w-[190px] font-sans text-sm leading-7 text-[#554c42] break-keep">{item.description}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="relative mt-10 hidden min-h-[170px] flex-1 overflow-hidden border border-[#d8cbbb] bg-[#15130f] shadow-[0_14px_34px_rgba(67,45,24,0.045)] lg:block">
                        <Image
                            src="/home/banner_bg_img800.jpg"
                            alt="차분한 상담실 분위기"
                            fill
                            sizes="(min-width: 1280px) 820px, 100vw"
                            className="object-cover object-center opacity-70 blur-[0.6px]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#15130f]/58 via-[#15130f]/22 to-transparent" />
                        <div className="absolute bottom-6 left-7">
                            <p className="font-sans text-sm font-medium text-[#d2ae78]">Dowon Consultation</p>
                            <p className="mt-2 text-2xl font-light leading-snug text-white break-keep">
                                차분한 공간에서 흐름을 함께 살핍니다
                            </p>
                        </div>
                    </div>
                </div>

                <aside className="border border-[#d8cbbb] bg-white/55 p-7 text-center shadow-[0_14px_34px_rgba(67,45,24,0.045)]">
                    <div className="mb-7 flex flex-col items-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#a77b45]/35 bg-[#fbf8f3] text-[#a77b45] shadow-[0_10px_24px_rgba(118,82,42,0.08)]">
                            <Send className="h-5 w-5" strokeWidth={1.45} />
                        </div>
                        <div className="flex w-full items-center justify-center gap-4">
                            <span className="h-px flex-1 bg-[#d9c6ac]" />
                            <h3 className="text-2xl font-light text-[#17130f]">상담 안내</h3>
                            <span className="h-px flex-1 bg-[#d9c6ac]" />
                        </div>
                        <p className="mt-3 font-sans text-sm leading-6 text-[#7a6a58] break-keep">
                            예약 전 확인하실 기본 정보를 정리했습니다.
                        </p>
                    </div>
                    <div className="space-y-3 text-left">
                        {guideItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <div key={item.label} className="flex items-start gap-4 border border-[#eadfce] bg-[#fbf8f3]/70 px-4 py-3 font-sans">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#a77b45]">
                                        <Icon className="h-4 w-4" strokeWidth={1.55} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#17130f]">{item.label}</p>
                                        <p className="mt-1 text-sm text-[#5a5046] break-keep">{item.value}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </aside>
            </div>
        </section>
    );
}

function FaqSection() {
    return (
        <section id="faq" className="bg-[#f8f4ee] px-6 py-12 sm:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center gap-5">
                    <h2 className="text-2xl font-light text-[#17130f]">자주 묻는 질문</h2>
                    <span className="h-px w-10 bg-[#a77b45]/45" />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {faqs.map((item) => (
                        <details key={item.question} className="group border border-[#e1d4c3] bg-white/62 px-6 py-5">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                                <span className="font-sans text-base text-[#17130f] break-keep">
                                    <span className="mr-2 font-serif text-[#a77b45]">Q.</span>
                                    {item.question}
                                </span>
                                <ChevronDown className="h-4 w-4 shrink-0 text-[#6a5a49] transition-transform group-open:rotate-180" />
                            </summary>
                            <p className="mt-3 border-t border-[#eadfce] pt-3 font-sans text-sm leading-7 text-[#554c42] break-keep">
                                <span className="mr-2 font-serif text-[#a77b45]">A.</span>
                                {item.answer}
                            </p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}

function CtaSection() {
    return (
        <section className="relative overflow-hidden bg-[#15130f] px-6 py-14 text-white sm:px-10">
            <Image
                src="/counseling/subimage3.webp"
                alt=""
                fill
                sizes="100vw"
                className="object-cover object-center opacity-[0.12]"
            />
            <div className="absolute inset-0 bg-[#15130f]/86" />
            <div className="absolute -left-20 top-4 h-60 w-60 rounded-full border border-[#a77b45]/10" />

            <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                    <h2 className="text-3xl font-light leading-[1.45] text-white break-keep sm:text-4xl">
                        지금 필요한 방향이 무엇인지,<br />
                        <span className="text-[#c7a16c]">도원</span>이 함께 살펴보겠습니다.
                    </h2>
                    <p className="mt-5 font-sans text-sm leading-7 text-white/62 break-keep">
                        상담은 예약제로 운영되며, 신중한 상담을 약속드립니다.
                    </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row lg:min-w-[520px]">
                    <Link
                        href="/submit"
                        className="inline-flex min-h-[58px] flex-1 items-center justify-center gap-3 bg-[#b2864d] px-6 py-4 font-sans text-sm font-semibold leading-none text-white transition-colors hover:bg-[#c79a5d] sm:min-h-[52px] sm:px-8 sm:py-0"
                    >
                        상담 신청하기
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <a
                        href="tel:063-285-7255"
                        className="inline-flex min-h-[58px] flex-1 items-center justify-center gap-3 border border-[#b2864d]/60 px-6 py-4 font-sans text-sm font-semibold leading-none text-[#ead6ba] transition-colors hover:bg-white/5 sm:min-h-[52px] sm:px-8 sm:py-0"
                    >
                        예약 문의하기
                        <Phone className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </section>
    );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
    return (
        <div className="text-center">
            <div className="mb-5 flex items-center justify-center gap-4">
                <span className="font-sans text-sm font-medium text-[#a77b45]">{eyebrow}</span>
                <span className="h-px w-10 bg-[#a77b45]/45" />
            </div>
            <h2 className="text-3xl font-light leading-snug text-[#17130f] break-keep sm:text-4xl">{title}</h2>
            <p className="mt-4 font-sans text-sm leading-7 text-[#5a5046] break-keep">{description}</p>
        </div>
    );
}
