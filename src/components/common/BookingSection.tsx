import { ArrowRight, Calendar, CreditCard, Phone } from 'lucide-react';

export default function BookingSection() {
    return (
        <section className="relative overflow-hidden bg-[#1a1815] px-6 py-20 text-white font-serif antialiased sm:py-24 lg:px-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,164,107,0.08),transparent_45%)] pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px bg-[#C8A46B]/20" />

            <div className="relative mx-auto max-w-7xl">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
                    <div className="lg:col-span-5">
                        <div className="mb-6 flex items-center justify-center gap-4 lg:justify-start">
                            <span className="h-px w-8 bg-[#C8A46B]" />
                            <span className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-[#C8A46B]">
                                Reservation Guide
                            </span>
                        </div>

                        <h2 className="text-center text-4xl font-light leading-[1.25] tracking-[-0.04em] text-[#E5D5BC] break-keep sm:text-5xl lg:text-left lg:text-6xl">
                            상담 예약 및 문의
                        </h2>

                        <p className="mx-auto mt-6 max-w-md text-center font-sans text-base font-light leading-relaxed text-white/55 break-keep lg:mx-0 lg:text-left">
                            상담은 사전 예약제로 진행됩니다. 편하신 방법으로 일정을 남겨주시면 충분한 상담 시간을 준비하겠습니다.
                        </p>
                    </div>

                    <div className="lg:col-span-7">
                        <div className="border border-white/10 bg-white/[0.03] p-5 text-center shadow-[0_24px_70px_rgba(0,0,0,0.18)] sm:p-8 lg:p-10 lg:text-left">
                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
                                <div className="flex flex-col items-center justify-between border-b border-white/10 pb-6 lg:items-start lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
                                    <div className="flex w-full flex-col items-center lg:items-start">
                                        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-[#C8A46B]/30 bg-[#C8A46B]/10 text-[#C8A46B]">
                                            <Calendar className="h-5 w-5" strokeWidth={1.5} />
                                        </div>

                                        <p className="font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-[#C8A46B]/80">
                                            Naver Booking
                                        </p>

                                        <h3 className="mt-3 text-2xl font-light tracking-[-0.03em] text-[#E5D5BC] break-keep sm:text-3xl">
                                            원하는 날짜와 시간을<br />
                                            간편하게 선택하세요.
                                        </h3>

                                        <p className="mt-4 max-w-sm font-sans text-sm font-light leading-relaxed text-white/45 break-keep">
                                            예약 페이지에서 가능한 일정을 확인하신 뒤 방문 시간을 선택하실 수 있습니다.
                                        </p>
                                    </div>

                                    <a
                                        href="https://booking.naver.com/booking/6/bizes/167387"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group mt-8 inline-flex h-13 w-full max-w-sm items-center justify-center gap-2 bg-[#C8A46B] px-7 font-sans text-sm font-bold text-[#1a1815] transition-colors hover:bg-[#d7b57c] lg:w-auto"
                                    >
                                        네이버 예약하기
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </a>
                                </div>

                                <div className="grid gap-4">
                                    <InfoCard
                                        icon={<Phone className="h-4 w-4" strokeWidth={1.5} />}
                                        eyebrow="Phone"
                                        label="전화 문의"
                                        title="063-285-7255"
                                        description="오전 10:00 - 오후 6:00"
                                        href="tel:063-285-7255"
                                    />

                                    <div className="border border-white/10 bg-[#1a1815]/70 p-5 transition-colors hover:bg-white/[0.04]">
                                        <div className="mb-4 flex items-center justify-center gap-3 lg:justify-start">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#C8A46B]/25 bg-[#C8A46B]/10 text-[#C8A46B]">
                                                <CreditCard className="h-4 w-4" strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <p className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-[#C8A46B]/70">
                                                    Bank Account
                                                </p>
                                                <h3 className="mt-1 text-lg font-light text-[#E5D5BC]">
                                                    계좌 정보
                                                </h3>
                                            </div>
                                        </div>

                                        <p className="font-sans text-xs text-white/45">
                                            하나은행 (예금주: 김종찬)
                                        </p>
                                        <p className="mt-2 font-sans text-lg font-semibold tracking-tight text-white sm:text-xl">
                                            7029-1100-3499-07
                                        </p>
                                    </div>

                                    <div className="border border-[#C8A46B]/20 bg-[#C8A46B]/10 px-5 py-4 text-center font-sans text-sm font-medium text-[#E5D5BC] break-keep lg:text-left">
                                        방문 전 사전예약 필수
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function InfoCard({
    icon,
    eyebrow,
    label,
    title,
    description,
    href,
}: {
    icon: React.ReactNode;
    eyebrow: string;
    label: string;
    title: string;
    description: string;
    href: string;
}) {
    return (
        <a
            href={href}
            className="group block border border-white/10 bg-[#1a1815]/70 p-5 transition-colors hover:bg-white/[0.04]"
        >
            <div className="mb-4 flex items-center justify-center gap-3 lg:justify-start">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#C8A46B]/25 bg-[#C8A46B]/10 text-[#C8A46B]">
                    {icon}
                </div>
                <div>
                    <p className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-[#C8A46B]/70">
                        {eyebrow}
                    </p>
                    <h3 className="mt-1 text-lg font-light text-[#E5D5BC]">
                        {label}
                    </h3>
                </div>
            </div>

            <p className="font-sans text-xl font-semibold tracking-tight text-white">
                {title}
            </p>
            <p className="mt-2 font-sans text-xs text-white/45">
                {description}
            </p>
            <div className="mt-4 flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#C8A46B]">
                바로 연결
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
        </a>
    );
}
