import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    ArrowLeft,
    ArrowRight,
    BarChart3,
    CalendarCheck,
    Check,
    Clock3,
    Heart,
    PenLine,
    ScrollText,
    User,
} from 'lucide-react';
import ReservationSection from '@/components/common/ReservationSection';
import { getServiceBySlug, services, type ServiceIcon } from '@/data/services';

type ServicePageProps = {
    params: Promise<{
        slug: string;
    }>;
};

const serviceIcons: Record<ServiceIcon, typeof ScrollText> = {
    scroll: ScrollText,
    heart: Heart,
    user: User,
    chart: BarChart3,
    pen: PenLine,
    calendar: CalendarCheck,
};

export function generateStaticParams() {
    return services.map((service) => ({
        slug: service.slug,
    }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
    const { slug } = await params;
    const service = getServiceBySlug(slug);

    if (!service) {
        return {
            title: '상담 안내',
        };
    }

    return {
        title: `${service.title} | 도원사주작명원`,
        description: service.description,
    };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
    const { slug } = await params;
    const service = getServiceBySlug(slug);

    if (!service) {
        notFound();
    }

    const Icon = serviceIcons[service.icon];
    const otherServices = services.filter((item) => item.slug !== service.slug).slice(0, 3);

    return (
        <main className="min-h-screen bg-[#f8f4ee] pt-20 font-serif text-[#17130f] antialiased">
            <section className="relative overflow-hidden bg-[#15120f] text-white">
                <Image
                    src={service.heroImage}
                    alt={`${service.title} 대표 이미지`}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center opacity-[0.65]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0f0d0a]/88 via-[#0f0d0a]/58 to-[#0f0d0a]/18" />

                <div className="relative mx-auto flex min-h-[420px] max-w-7xl items-center px-6 py-16 sm:min-h-[480px] sm:px-10 lg:min-h-[460px]">
                    <div className="max-w-2xl">
                        <Link href="/services" className="mb-8 inline-flex items-center gap-2 font-sans text-sm font-medium text-[#d2ae78] transition-colors hover:text-white">
                            <ArrowLeft className="h-4 w-4" />
                            상담 안내로 돌아가기
                        </Link>
                        <div className="mb-6 flex items-center gap-4">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#c7a16c]/55 text-[#c7a16c]">
                                <Icon className="h-6 w-6" strokeWidth={1.45} />
                            </span>
                            <span className="font-sans text-sm font-medium text-[#c7a16c]">상담 세부 안내</span>
                        </div>
                        <h1 className="text-4xl font-light leading-[1.35] text-white break-keep sm:text-5xl lg:text-6xl">
                            {service.title}
                        </h1>
                        <p className="mt-6 max-w-xl font-sans text-base leading-8 text-white/75 break-keep">
                            {service.subtitle}
                        </p>
                    </div>
                </div>
            </section>

            <section className="px-6 py-14 sm:px-10 sm:py-16">
                <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
                    <div>
                        <div className="relative overflow-hidden border border-[#d8cbbb] bg-[#15130f] sm:min-h-[340px]">
                            <div className="relative min-h-[220px] sm:absolute sm:inset-0 sm:min-h-0">
                                <Image
                                    src={service.detailImage}
                                    alt={`${service.title} 상세 이미지`}
                                    fill
                                    sizes="(min-width: 1024px) 760px, 100vw"
                                    className="object-cover object-center opacity-[0.76]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#15130f]/72 via-[#15130f]/20 to-transparent sm:from-[#15130f]/86 sm:via-[#15130f]/34" />
                            </div>
                            <div className="relative max-w-3xl bg-[#15130f] px-5 py-6 sm:absolute sm:bottom-0 sm:left-0 sm:bg-transparent sm:px-8 sm:py-8">
                                <p className="font-sans text-sm font-medium text-[#d2ae78]">상담 안내</p>
                                <h2 className="mt-3 text-xl font-light leading-snug text-white break-keep sm:text-3xl">
                                    {service.description}
                                </h2>
                                <p className="mt-4 max-w-2xl font-sans text-sm leading-7 text-white/72 break-keep">
                                    개인의 상황과 질문을 바탕으로 사주의 흐름을 해석하고, 현재 시점에서 현실적으로 참고할 수 있는 방향을 정리해드립니다.
                                </p>
                            </div>
                        </div>

                        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
                            <DetailList title="이런 분께 추천합니다" items={service.recommendedFor} />
                            <DetailList title="상담에서 다루는 내용" items={service.includes} />
                        </div>
                    </div>

                    <aside className="border border-[#d8cbbb] bg-white/68 p-7 shadow-[0_14px_34px_rgba(67,45,24,0.045)]">
                        <div className="flex items-center gap-4 border-b border-[#e5d8c7] pb-6">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#a77b45]/35 bg-[#fbf8f3] text-[#a77b45]">
                                <Icon className="h-5 w-5" strokeWidth={1.45} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-light text-[#17130f]">{service.title}</h2>
                                <p className="mt-1 font-sans text-sm text-[#7a6a58]">{service.price}</p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3 font-sans">
                            <InfoRow label="상담 시간" value={service.duration} icon={<Clock3 className="h-4 w-4" />} />
                            <InfoRow label="상담 비용" value={service.price} icon={<Check className="h-4 w-4" />} />
                        </div>

                        <div className="mt-7 border-t border-[#e5d8c7] pt-6">
                            <p className="font-sans text-sm font-medium text-[#17130f]">주요 항목</p>
                            <ul className="mt-4 space-y-2 font-sans text-sm text-[#514a42]">
                                {service.items.map((item) => (
                                    <li key={item} className="flex gap-2">
                                        <span className="mt-[0.65em] h-1 w-1 shrink-0 rounded-full bg-[#a77b45]" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Link
                            href="/submit"
                            className="mt-8 inline-flex min-h-[52px] w-full items-center justify-center gap-3 bg-[#a77b45] px-6 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#8f683b]"
                        >
                            상담 신청하기
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </aside>
                </div>
            </section>

            <section className="bg-[#fbf8f3] px-6 py-14 sm:px-10 sm:py-16">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10 flex items-center gap-5">
                        <h2 className="text-2xl font-light text-[#17130f]">상담 진행 흐름</h2>
                        <span className="h-px w-10 bg-[#a77b45]/45" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        {service.process.map((step, index) => (
                            <article key={step.title} className="border border-[#e1d4c3] bg-white/62 p-6">
                                <span className="font-sans text-sm font-semibold text-[#a77b45]">{String(index + 1).padStart(2, '0')}</span>
                                <h3 className="mt-5 text-xl font-light text-[#17130f] break-keep">{step.title}</h3>
                                <p className="mt-4 font-sans text-sm leading-7 text-[#554c42] break-keep">{step.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-6 py-14 sm:px-10 sm:py-16">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex items-center gap-5">
                        <h2 className="text-2xl font-light text-[#17130f]">다른 상담도 살펴보기</h2>
                        <span className="h-px w-10 bg-[#a77b45]/45" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {otherServices.map((item) => {
                            const OtherIcon = serviceIcons[item.icon];

                            return (
                                <Link key={item.slug} href={`/services/${item.slug}`} className="group border border-[#e1d4c3] bg-white/62 p-6 transition-colors hover:bg-white">
                                    <OtherIcon className="h-6 w-6 text-[#a77b45]" strokeWidth={1.45} />
                                    <h3 className="mt-5 text-xl font-light text-[#17130f] break-keep">{item.title}</h3>
                                    <p className="mt-3 font-sans text-sm leading-7 text-[#554c42] break-keep">{item.description}</p>
                                    <span className="mt-5 inline-flex items-center gap-2 font-sans text-sm font-medium text-[#8f683b]">
                                        자세히 보기
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            <ReservationSection />
        </main>
    );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
    return (
        <div className="border border-[#e1d4c3] bg-white/62 p-6">
            <h3 className="text-xl font-light text-[#17130f]">{title}</h3>
            <ul className="mt-5 space-y-3 font-sans text-sm leading-7 text-[#554c42]">
                {items.map((item) => (
                    <li key={item} className="flex gap-3 break-keep">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-[#a77b45]" strokeWidth={1.7} />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 border border-[#eadfce] bg-[#fbf8f3]/70 px-4 py-3">
            <div className="flex items-center gap-3 text-[#a77b45]">
                {icon}
                <span className="text-sm font-medium text-[#17130f]">{label}</span>
            </div>
            <span className="text-sm text-[#5a5046]">{value}</span>
        </div>
    );
}
