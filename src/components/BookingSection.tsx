import { Calendar, Phone, CreditCard, ChevronRight } from 'lucide-react';

export default function BookingSection() {
    return (
        <section className="py-12 md:py-24 bg-white border-b border-stone-100">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4 font-serif">상담 예약 및 문의</h2>
                        <p className="text-stone-500 font-light">
                            편하신 방법으로 상담을 예약하시거나 문의해주세요.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Naver Booking Card */}
                        <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6 text-white shadow-md">
                                <Calendar size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-stone-800 mb-2">네이버 예약</h3>
                            <p className="text-stone-500 text-sm mb-6 leading-relaxed">
                                원하는 날짜와 시간을<br />
                                간편하게 선택하세요.
                            </p>
                            <a
                                href="https://booking.naver.com/booking/6/bizes/167387"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-auto inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors w-full justify-center"
                            >
                                예약하기 <ChevronRight size={18} />
                            </a>
                        </div>

                        {/* Phone Contact Card */}
                        <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300">
                            <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mb-6 text-white shadow-md">
                                <Phone size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-stone-800 mb-2">전화 문의</h3>
                            <p className="text-amber-600 font-bold text-sm mb-6 bg-amber-50 px-3 py-1 rounded-full">
                                방문 전 사전예약 필수
                            </p>
                            <div className="mt-auto w-full">
                                <a
                                    href="tel:063-285-7255"
                                    className="text-2xl font-bold text-stone-800 hover:text-stone-600 transition-colors block mb-2"
                                >
                                    063-285-7255
                                </a>
                                <p className="text-stone-400 text-xs">
                                    오전 10:00 - 오후 6:00
                                </p>
                            </div>
                        </div>

                        {/* Bank Info Card */}
                        <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300">
                            <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mb-6 text-stone-600 shadow-inner">
                                <CreditCard size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-stone-800 mb-2">계좌 정보</h3>
                            <p className="text-stone-500 text-sm mb-6">
                                상담비 입금 계좌
                            </p>
                            <div className="mt-auto w-full bg-white p-4 rounded-xl border border-stone-200">
                                <p className="text-stone-500 text-xs mb-1">하나은행 (예금주: 김종찬)</p>
                                <p className="text-lg font-bold text-stone-800 font-mono tracking-tight">
                                    7029-1100-3499-07
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
