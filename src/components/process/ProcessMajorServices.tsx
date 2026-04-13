import Image from 'next/image';

export default function ProcessMajorServices() {
    return (
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
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
                            <span className="text-lg font-bold text-stone-900">100,000원</span>
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
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold text-stone-900 mb-2">작명 개명</h3>
                        <p className="text-stone-600 text-sm leading-relaxed mb-4 flex-grow">
                            사주에 맞는 명품 이름으로 작명 및 개명을 통하여 좋은 기운을 맞이하세요.
                        </p>
                        <div className="pt-4 border-t border-stone-100 text-right">
                            <span className="text-lg font-bold text-stone-900">200,000원</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
