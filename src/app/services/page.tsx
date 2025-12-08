import Image from 'next/image';
import BookingSection from '@/components/BookingSection';
import { ScrollText, Sparkles, Scale } from 'lucide-react';

export default function ServicesPage() {
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
                        Premium Naming Service
                    </span>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-900 mb-8 leading-normal md:leading-snug break-keep">
                        사주에 기반한 <span className="text-stone-700">명품 작명/개명</span>,<br className="hidden md:block" />
                        <span className="text-stone-800 border-b-2 border-stone-300 pb-1">도원사주작명원</span>이 함께합니다.
                    </h1>
                    <div className="w-16 h-1 bg-stone-800 mx-auto mb-8 opacity-20"></div>
                    <p className="text-stone-600 text-base md:text-xl max-w-2xl mx-auto font-medium leading-relaxed break-keep">
                        전통의 깊이와 현대의 감각을 더해<br className="md:hidden" /> 당신의 빛나는 운명을 짓습니다.
                    </p>
                </div>
            </section>

            {/* 1. Philosophy Section */}
            <section className="container mx-auto px-6 mb-20">
                <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 border border-stone-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-stone-50 rounded-full -mr-32 -mt-32 opacity-50 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center mb-12">
                        <div className="flex-1">
                            <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-800 mb-6 flex items-center gap-2">
                                <span className="w-1 h-8 bg-stone-800 rounded-full"></span>
                                1. 김종찬 원장의 명품 작명이란?
                            </h2>
                            <p className="text-stone-700 text-lg leading-relaxed mb-6">
                                오랜 경험을 바탕으로 <span className="font-bold text-stone-900">전통적인 작명법</span>을 준수하면서,
                                끊임없는 연구를 통해 <span className="font-bold text-stone-900">현대적 감각</span>으로
                                세련되고 부르기 쉬운 이름을 김종찬 원장님이 직접 작명하십니다.
                            </p>
                            <p className="text-stone-600">
                                좋은 이름은 단순한 호칭을 넘어, 타고난 운명을 보완하고 인생에 긍정적인 영향을 주는 강력한 힘이 됩니다.
                            </p>
                        </div>
                        <div className="w-full md:w-1/3 flex justify-center">
                            <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-stone-100 shadow-xl">
                                <Image
                                    src="/about2.jpg"
                                    alt="김종찬 원장"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-stone-50 p-6 rounded-xl border border-stone-100 hover:shadow-md transition-shadow group">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:bg-stone-800 group-hover:text-white transition-colors">
                                <ScrollText className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-stone-900 mb-3">전문적인 분석</h3>
                            <p className="text-stone-600 text-sm leading-relaxed">
                                사주의 병(病)과 약(藥)을 정확히 분석하여, 근본적인 운세의 흐름을 파악하고 부족함을 채워줍니다.
                            </p>
                        </div>
                        <div className="bg-stone-50 p-6 rounded-xl border border-stone-100 hover:shadow-md transition-shadow group">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:bg-stone-800 group-hover:text-white transition-colors">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-stone-900 mb-3">현대적 감각</h3>
                            <p className="text-stone-600 text-sm leading-relaxed">
                                촌스럽지 않고 시대에 뒤떨어지지 않는, 세련되고 부르기 좋으며 기억에 남는 이름을 짓습니다.
                            </p>
                        </div>
                        <div className="bg-stone-50 p-6 rounded-xl border border-stone-100 hover:shadow-md transition-shadow group">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:bg-stone-800 group-hover:text-white transition-colors">
                                <Scale className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-stone-900 mb-3">운명 보완</h3>
                            <p className="text-stone-600 text-sm leading-relaxed">
                                사주에서 부족한 오행과 기운을 이름으로 보완하여, 인생의 균형을 맞추고 길운을 불러옵니다.
                            </p>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-stone-500 text-sm">
                            사주명리학과 성명학에 대한 깊은 지식으로 고객님의 인생에 빛이 되는 이름을 찾아드립니다.
                        </p>
                    </div>
                </div>
            </section>

            {/* 2. Process Section */}
            <section className="container mx-auto px-6 mb-20">
                <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-800 mb-4">
                    2. 작명 세부 과정
                </h2>
                <p className="text-stone-600 mb-10">좋은 이름을 짓는 3단계 | 도원사주작명원에서는 좋은 이름을 짓기 위해 다음과 같은 세부적이고 과학적인 절차를 따릅니다.</p>

                <div className="space-y-6">
                    {/* Step 1 */}
                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                        <div className="w-[200px] flex-shrink-0">
                            <Image
                                src="/process1.png"
                                alt="Process Step 1"
                                width={200}
                                height={200}
                                className="w-full h-auto rounded-lg object-contain bg-stone-50"
                            />
                        </div>
                        <div className="flex-grow text-center md:text-left">
                            <div className="inline-block bg-stone-900 text-white px-3 py-1 rounded-full text-sm font-bold mb-3">1단계</div>
                            <h3 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">사주에 필요한 오행(五行) 판단</h3>
                            <ul className="list-disc list-inside space-y-2 text-stone-700 inline-block text-left">
                                <li>오행의 세력 및 분포 파악</li>
                                <li>일간의 강약 분석</li>
                                <li>용신 및 평생 운로 분석</li>
                                <li>타고난 성격/적성/진로 파악</li>
                                <li>가족 및 이성과의 인연 관계 파악</li>
                            </ul>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                        <div className="w-[200px] flex-shrink-0">
                            <Image
                                src="/process2.png"
                                alt="Process Step 2"
                                width={200}
                                height={200}
                                className="w-full h-auto rounded-lg object-contain bg-stone-50"
                            />
                        </div>
                        <div className="flex-grow text-center md:text-left">
                            <div className="inline-block bg-stone-900 text-white px-3 py-1 rounded-full text-sm font-bold mb-3">2단계</div>
                            <h3 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">자의(字意)와 음운(音韻) 분석</h3>
                            <ul className="list-disc list-inside space-y-2 text-stone-700 inline-block text-left">
                                <li>글자의 의미와 발음의 조화로운 선별 및 배열</li>
                                <li>뜻이 나쁜 불용한자(不用漢字)를 피한 작명</li>
                                <li>한자의 본질적인 의미 파악</li>
                            </ul>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                        <div className="w-[200px] flex-shrink-0">
                            <Image
                                src="/process3.png"
                                alt="Process Step 3"
                                width={200}
                                height={200}
                                className="w-full h-auto rounded-lg object-contain bg-stone-50"
                            />
                        </div>
                        <div className="flex-grow text-center md:text-left">
                            <div className="inline-block bg-stone-900 text-white px-3 py-1 rounded-full text-sm font-bold mb-3">3단계</div>
                            <h3 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">기(氣)와 발음(發音), 어감을 판단</h3>
                            <ul className="list-disc list-inside space-y-2 text-stone-700 inline-block text-left">
                                <li>맑고 부르기 좋은 음운 검토</li>
                                <li>이름의 혼탁함이나 놀림감이 되는 요소 검토</li>
                                <li>음(陰)과 양(陽)의 적절한 배합 검토</li>
                                <li>원형이정 4격을 길한 수리로 배열</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Pricing Section */}
            <section className="container mx-auto px-6 mb-20">
                <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-800 mb-8">
                    3. 작명/개명 서비스 안내
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Newborn */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200 hover:border-stone-400 transition-colors">
                        <h3 className="text-xl md:text-2xl font-bold text-stone-900 mb-2">신생아 작명</h3>
                        <p className="text-stone-500 mb-6">아기의 첫 선물, 이름에서부터 특별함을 시작하세요.</p>
                        <p className="text-stone-700 mb-8">소중한 순간, 소중한 이름.</p>
                        <div className="text-3xl font-bold text-stone-900 text-right">150,000원</div>
                    </div>
                    {/* Renaming */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200 hover:border-stone-400 transition-colors">
                        <h3 className="text-xl md:text-2xl font-bold text-stone-900 mb-2">개명</h3>
                        <p className="text-stone-500 mb-6">운명을 바꾸는 힘, 이름에서 시작됩니다.</p>
                        <p className="text-stone-700 mb-8">사주에 맞는 이름으로 개명하여 좋은 기운을 맞이하세요.</p>
                        <div className="text-3xl font-bold text-stone-900 text-right">150,000원</div>
                    </div>
                </div>
                <div className="mt-6 text-stone-500 text-sm text-right">
                    * 이름 추천: 1회 무료 추가 추천 가능 (유선 문의)
                </div>
            </section>

            {/* 4. Steps Section (Online) */}
            {/* 4. Steps Section (Online) */}
            <section className="container mx-auto px-6">
                <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-800 mb-8">
                    4. 작명/개명 진행 절차
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Step A */}
                    <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-6 flex flex-col items-center text-center">
                        <div className="relative w-[150px] h-[170px] mb-6 shadow-md rounded-lg overflow-hidden flex-shrink-0 bg-stone-50">
                            <Image
                                src="/jminfo1.jpg"
                                alt="신청서 작성"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold mb-2 text-stone-900">a. 신청서 작성</h3>
                            <p className="text-stone-600 text-sm leading-relaxed">
                                생년월일시 (음력/양력 구분) 등 필수 기입 내용을 정확히 기재합니다. 희망 한자, 선호하는 이름 유형 등 추가 정보도 기재 바랍니다.
                            </p>
                        </div>
                    </div>

                    {/* Step B */}
                    <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-6 flex flex-col items-center text-center">
                        <div className="relative w-[150px] h-[170px] mb-6 shadow-md rounded-lg overflow-hidden flex-shrink-0 bg-stone-50">
                            <Image
                                src="/jminfo2.jpg"
                                alt="작명료 결제"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold mb-2 text-stone-900">b. 작명료 결제</h3>
                            <p className="text-stone-600 text-sm leading-relaxed">
                                (15만원) 신청서 및 입금 확인 후 작업 시작 전 연락드립니다. 내용 불분명 시 작업이 보류될 수 있습니다.
                            </p>
                        </div>
                    </div>

                    {/* Step C */}
                    <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-6 flex flex-col items-center text-center">
                        <div className="relative w-[150px] h-[170px] mb-6 shadow-md rounded-lg overflow-hidden flex-shrink-0 bg-stone-50">
                            <Image
                                src="/jminfo3.jpg"
                                alt="작명 진행 및 추천"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold mb-2 text-stone-900">c. 작명 진행 및 발송</h3>
                            <p className="text-stone-600 text-sm leading-relaxed">
                                최적의 이름을 뽑아 <strong>작명추천서 (이름 8개)</strong>를 신청서에 기재된 이메일로 보내드립니다.
                            </p>
                        </div>
                    </div>

                    {/* Step D */}
                    <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-6 flex flex-col items-center text-center">
                        <div className="relative w-[150px] h-[170px] mb-6 shadow-md rounded-lg overflow-hidden flex-shrink-0 bg-stone-50">
                            <Image
                                src="/jminfo4.jpg"
                                alt="작명 완료"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold mb-2 text-stone-900">d. 작명 완료</h3>
                            <p className="text-stone-600 text-sm leading-relaxed">
                                추천서의 이름 중 하나를 선택하시면 작명신청이 완료됩니다.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Booking Section */}
            <BookingSection />
        </main>
    );
}
