import type { ReactNode } from 'react';
import { ArrowRight, CalendarDays, CreditCard, Phone } from 'lucide-react';

export default function ReservationAside() {
    return (
        <aside className="rounded-lg border border-[#dfcfb6] bg-[#fffaf2] p-5 shadow-[0_14px_36px_rgba(70,54,36,0.05)]">
            <div className="mb-5">
                <p className="text-xs font-semibold tracking-[0.22em] text-[#a87943]">RESERVATION</p>
                <h2 className="mt-2 font-serif text-xl font-light tracking-normal text-[#201915]">상담 예약 및 문의</h2>
                <p className="mt-3 text-sm leading-6 text-[#6f6256] break-keep">
                    예약 상담으로 운영됩니다. 편하신 방법으로 문의해주세요.
                </p>
            </div>

            <div className="space-y-3">
                <a
                    href="https://booking.naver.com/booking/6/bizes/167387/items/5603981"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-md border border-[#d9c6a9] bg-white/68 p-3 transition-colors hover:bg-white"
                >
                    <IconFrame>
                        <CalendarDays className="h-4 w-4" />
                    </IconFrame>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#2f261d]">네이버 예약</p>
                        <p className="mt-1 text-xs text-[#7b6f64]">날짜와 시간 선택</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#b7894a] transition-transform group-hover:translate-x-1" />
                </a>

                <a
                    href="tel:063-285-7255"
                    className="flex items-center gap-3 rounded-md border border-[#d9c6a9] bg-white/68 p-3 transition-colors hover:bg-white"
                >
                    <IconFrame>
                        <Phone className="h-4 w-4" />
                    </IconFrame>
                    <div>
                        <p className="text-sm font-semibold text-[#2f261d]">전화 문의</p>
                        <p className="mt-1 text-xs text-[#7b6f64]">063-285-7255</p>
                    </div>
                </a>

                <div className="flex items-center gap-3 rounded-md border border-[#d9c6a9] bg-white/68 p-3">
                    <IconFrame>
                        <CreditCard className="h-4 w-4" />
                    </IconFrame>
                    <div>
                        <p className="text-sm font-semibold text-[#2f261d]">상담비 입금 계좌</p>
                        <p className="mt-1 text-xs text-[#7b6f64]">하나은행</p>
                        <p className="mt-1 text-xs text-[#7b6f64]">7029-1100-3499-07</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

function IconFrame({ children }: { children: ReactNode }) {
    return (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#b7894a]/30 bg-[#f8ecd8] text-[#a87943]">
            {children}
        </span>
    );
}
