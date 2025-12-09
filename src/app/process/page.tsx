import Image from 'next/image';
import BookingSection from '@/components/BookingSection';
import {
    ScrollText,
    Users,
    Sparkles,
    Building2,
    FileEdit,
    CreditCard,
    Calendar,
    MessageCircle,
    CheckCircle2,
    MapPin,
    PhoneCall,
    HelpCircle
} from 'lucide-react';

export default function ProcessPage() {
    return (
        <main className="pt-24 min-h-screen bg-stone-50">
            {/* Hero Section */}
            <section className="relative w-full py-20 md:py-32 flex items-center justify-center overflow-hidden">
                {/* Background Texture with Overlay */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/luxury_korean_paper_bg.png"
                        alt="Korean Paper Texture"
                        fill
                        className="object-cover opacity-40"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-50/80"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <span className="block text-stone-500 font-serif tracking-widest text-sm md:text-base mb-4 uppercase">
                        Premium Consulting
                    </span>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-900 mb-8 leading-normal md:leading-snug break-keep">
                        인생의 중대한 순간,<br />
                        <span className="text-stone-700">김종찬 원장의 전문 상담</span>으로<br className="md:hidden" /> 길을 찾으세요.
                    </h1>
                    <div className="w-16 h-1 bg-stone-800 mx-auto mb-8 opacity-20"></div>
                    <p className="text-stone-600 text-base md:text-xl max-w-3xl mx-auto font-medium leading-relaxed break-keep">
                        도원사주작명원은 단순히 이름을 짓는 것을 넘어, 사주명리학과 성명학에 기반하여 고객님의 인생 전반에 걸친 중요한 결정과 운명의 흐름을 읽어 드립니다.
                    </p>
                </div>
            </section>

            {/* Why Us Section (Reusing Philosophy Style) */}
            <section className="container mx-auto px-6 mb-20">
                <div className="mt-8 bg-white rounded-xl shadow-lg p-8 md:p-12 border border-stone-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-stone-50 rounded-full -mr-32 -mt-32 opacity-50 pointer-events-none"></div>

                    <div className="text-center mb-12">
                        <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-800 mb-4 flex items-center gap-2">
                            <span className="w-1 h-8 bg-stone-800 rounded-full"></span>
                            도원만의 전문상담
                        </h2>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-stone-50 p-8 rounded-xl border border-stone-100 group hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:bg-stone-800 group-hover:text-white transition-colors flex-shrink-0">
                                    <ScrollText className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-stone-900">오랜 경험과 전문성</h3>
                            </div>
                            <p className="text-stone-600 text-sm leading-relaxed">
                                김종찬 원장은 풍부한 임상 경험과 깊이 있는 학문적 지식을 겸비하고 있습니다. 고객님의 사주를 정확히 분석하고 현실적인 해결책을 제시합니다.
                            </p>
                        </div>
                        {/* Feature 2 */}
                        <div className="bg-stone-50 p-8 rounded-xl border border-stone-100 group hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:bg-stone-800 group-hover:text-white transition-colors flex-shrink-0">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-stone-900">인생의 길잡이 역할</h3>
                            </div>
                            <p className="text-stone-600 text-sm leading-relaxed">
                                인생의 중요한 기로(결혼, 취업, 이사, 사업 시작 등)에서 명쾌하고 객관적인 인사이트를 제공하여 현명한 결정을 내릴 수 있도록 돕습니다.
                            </p>
                        </div>
                        {/* Feature 3 */}
                        <div className="bg-stone-50 p-8 rounded-xl border border-stone-100 group hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:bg-stone-800 group-hover:text-white transition-colors flex-shrink-0">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-stone-900">운명의 보완 및 활용</h3>
                            </div>
                            <p className="text-stone-600 text-sm leading-relaxed">
                                타고난 운명을 비관하는 것이 아니라, 부족한 부분을 알고 보완하여 더욱 긍정적이고 주도적인 삶을 살 수 있도록 방향을 제시합니다.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 1. Major Services Section */}
            <section className="container mx-auto px-6 mb-24">
                <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-800 mb-10 flex items-center gap-2">
                    <span className="w-1 h-8 bg-stone-800 rounded-full"></span>
                    주요 상담 서비스 안내
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Service 1: Saju */}
                    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
                        <div className="relative h-48 bg-stone-100">
                            <Image
                                src="/sj_card_bg.jpg"
                                alt="사주 상담"
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-xl font-bold text-stone-900 mb-2">사주 상담</h3>
                            <p className="text-stone-600 text-sm leading-relaxed mb-4 flex-grow">
                                개인의 타고난 운명의 지도(사주팔자)를 상세히 분석합니다. 재물운, 건강운, 직업운, 대운의 흐름 등 전반적인 인생의 흐름을 짚어드립니다.
                            </p>
                            <div className="pt-4 border-t border-stone-100 text-right">
                                <span className="text-lg font-bold text-stone-900">40,000원</span>
                            </div>
                        </div>
                    </div>

                    {/* Service 2: Gunghap */}
                    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
                        <div className="relative h-48 bg-stone-100">
                            <Image
                                src="/etc_card_bg.jpg"
                                alt="궁합 상담"
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-xl font-bold text-stone-900 mb-2">궁합 상담</h3>
                            <p className="text-stone-600 text-sm leading-relaxed mb-4 flex-grow">
                                결혼을 앞둔 연인 또는 사업 동반자 등 두 사람의 관계를 심층 분석합니다. 서로의 부족한 점을 보완할 수 있는 지혜로운 조언을 드립니다.
                            </p>
                            <div className="pt-4 border-t border-stone-100 text-right">
                                <span className="text-lg font-bold text-stone-900">80,000원</span>
                            </div>
                        </div>
                    </div>

                    {/* Service 3: Birth Date */}
                    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
                        <div className="relative h-48 bg-stone-100">
                            <Image
                                src="/jm_card_bg.jpg"
                                alt="출산 택일"
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-xl font-bold text-stone-900 mb-2">출산 택일</h3>
                            <p className="text-stone-600 text-sm leading-relaxed mb-4 flex-grow">
                                아기가 태어날 가장 좋은 시간과 날짜를 선택하여, 아기에게 최상의 사주팔자를 선물합니다. 인생의 시작점부터 좋은 기운을 담습니다.
                            </p>
                            <div className="pt-4 border-t border-stone-100 text-right">
                                <span className="text-lg font-bold text-stone-900">80,000원</span>
                            </div>
                        </div>
                    </div>

                    {/* Service 4: Business Name */}
                    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
                        <div className="relative h-48 bg-stone-100">
                            <Image
                                src="/gm_card_bg.jpg"
                                alt="상호 작명"
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-xl font-bold text-stone-900 mb-2">상호 작명</h3>
                            <p className="text-stone-600 text-sm leading-relaxed mb-4 flex-grow">
                                사업의 번창과 재물운 증진에 도움이 되는 길(吉)한 상호를 작명합니다. 브랜드에 좋은 기운과 뜻을 담아드립니다.
                            </p>
                            <div className="pt-4 border-t border-stone-100 text-right">
                                <span className="text-lg font-bold text-stone-900">200,000원</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Process Section */}
            <section className="container mx-auto px-6 mb-20">
                <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-800 mb-10 flex items-center gap-2">
                    <span className="w-1 h-8 bg-stone-800 rounded-full"></span>
                    상담 신청 및 진행 절차
                </h2>

                <div className="grid md:grid-cols-4 gap-6">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-stone-100 shadow-sm relative">
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-stone-700">
                            <FileEdit className="w-8 h-8" />
                        </div>
                        <div className="absolute top-6 left-6 w-6 h-6 bg-stone-800 rounded-full text-white flex items-center justify-center text-xs font-bold">1</div>
                        <h3 className="font-bold text-lg mb-2">신청서 확인</h3>
                        <p className="text-sm text-stone-600 leading-relaxed">
                            원하시는 상담 종류의 신청서를 확인하고<br />정보를 기재해주세요.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-stone-100 shadow-sm relative">
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-stone-700">
                            <CreditCard className="w-8 h-8" />
                        </div>
                        <div className="absolute top-6 left-6 w-6 h-6 bg-stone-800 rounded-full text-white flex items-center justify-center text-xs font-bold">2</div>
                        <h3 className="font-bold text-lg mb-2">상담료 결제</h3>
                        <p className="text-sm text-stone-600 leading-relaxed">
                            상담료를 입금 계좌로 결제합니다.<br />(입금 확인 후 진행)
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-stone-100 shadow-sm relative">
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-stone-700">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <div className="absolute top-6 left-6 w-6 h-6 bg-stone-800 rounded-full text-white flex items-center justify-center text-xs font-bold">3</div>
                        <h3 className="font-bold text-lg mb-2">예약 및 안내</h3>
                        <p className="text-sm text-stone-600 leading-relaxed">
                            상담 날짜 및 시간, 상담 방식(전화/방문)을<br />개별적으로 안내드립니다.
                        </p>
                    </div>

                    {/* Step 4 */}
                    <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-stone-100 shadow-sm relative">
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-stone-700">
                            <MessageCircle className="w-8 h-8" />
                        </div>
                        <div className="absolute top-6 left-6 w-6 h-6 bg-stone-800 rounded-full text-white flex items-center justify-center text-xs font-bold">4</div>
                        <h3 className="font-bold text-lg mb-2">전문 상담 진행</h3>
                        <p className="text-sm text-stone-600 leading-relaxed">
                            김종찬 원장님과의 1:1 심층 상담으로<br />명쾌한 조언을 얻으세요.
                        </p>
                    </div>
                </div>
            </section>

            {/* 4. Inquiry Info */}
            {/* 4. Inquiry Info */}
            <section className="container mx-auto px-6 mb-20">
                <div className="bg-white rounded-xl shadow-lg border border-stone-100 p-8 md:p-12 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-800 mb-8 flex items-center gap-3">
                        <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-600">
                            <HelpCircle className="w-5 h-5" />
                        </div>
                        기타 문의 및 유의사항
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-stone-50 p-6 rounded-lg border border-stone-100 flex items-start gap-4">
                            <MapPin className="w-6 h-6 text-stone-400 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-stone-900 mb-2">방문 상담 안내</h3>
                                <p className="text-stone-600 text-sm leading-relaxed">
                                    방문 상담을 원하시는 경우, 반드시 사전에 유선으로 예약해 주시기 바랍니다.<br />
                                    <span className="text-stone-400 text-xs mt-1 block">(메뉴: 오시는 길 참고)</span>
                                </p>
                            </div>
                        </div>
                        <div className="bg-stone-50 p-6 rounded-lg border border-stone-100 flex items-start gap-4">
                            <PhoneCall className="w-6 h-6 text-stone-400 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-stone-900 mb-2">추가 문의</h3>
                                <p className="text-stone-600 text-sm leading-relaxed">
                                    상담 내용에 대해 추가적으로 궁금하신 점이 있다면, 언제든지 유선 전화로 문의해 주시면 친절하게 안내해 드리겠습니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Booking Section */}
            <BookingSection />
        </main>
    );
}
