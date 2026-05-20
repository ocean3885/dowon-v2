import type { ReactNode } from 'react';
import { ArrowRight, CalendarDays, CreditCard, Phone } from 'lucide-react';

export default function ReservationSection() {
    return (
        <section className="bg-[#fbf8f2] px-6 pb-16 pt-14 sm:pt-16 lg:px-10">
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
                        href="https://booking.naver.com/booking/6/bizes/167387/items/5603981"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group rounded-lg border border-[#b89768]/45 bg-white/70 p-6 text-center transition-colors hover:bg-white"
                    >
                        <ContactCardHeader icon={<CalendarDays className="h-7 w-7" />} title="네이버 예약" />
                        <p className="mt-5 font-sans text-sm leading-7 text-[#514a42] break-keep">
                            원하는 날짜와 시간을 간편하게 선택하세요.
                        </p>
                        <span className="mt-5 inline-flex h-12 w-full max-w-xs items-center justify-center gap-3 rounded bg-[#a77b45] px-7 font-sans text-sm font-semibold text-white transition-colors group-hover:bg-[#946b3a] sm:h-13 sm:w-auto sm:min-w-44 sm:px-9 lg:w-full lg:max-w-[220px]">
                            예약하기
                            <ArrowRight className="h-4 w-4" />
                        </span>
                    </a>

                    <a href="tel:063-285-7255" className="rounded-lg border border-[#b89768]/45 bg-white/70 p-6 text-center transition-colors hover:bg-white">
                        <ContactCardHeader icon={<Phone className="h-7 w-7" />} title="전화 문의" />
                        <p className="mt-5 font-sans text-sm text-[#514a42]">방문 전 사전예약 필수</p>
                        <p className="mt-3 font-sans text-3xl font-medium text-[#17130f]">063-285-7255</p>
                        <p className="mt-2 font-sans text-sm text-[#514a42]">오전 10:00 - 오후 6:00</p>
                    </a>

                    <div className="rounded-lg border border-[#b89768]/45 bg-white/70 p-6 text-center">
                        <ContactCardHeader icon={<CreditCard className="h-7 w-7" />} title="상담비 입금 계좌" />
                        <p className="mt-5 font-sans text-sm text-[#514a42]">하나은행 (예금주: 김종찬)</p>
                        <p className="mt-3 font-sans text-2xl font-medium text-[#17130f] sm:text-3xl">7029-1100-3499-07</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ContactCardHeader({ icon, title }: { icon: ReactNode; title: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#a77b45]/35 bg-[#fbf8f2] text-[#a77b45]">
                {icon}
            </div>
            <h3 className="text-xl font-light text-[#17130f]">{title}</h3>
        </div>
    );
}
