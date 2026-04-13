import Image from 'next/image';

export default function ServicesProcess() {
    return (
        <section className="container mx-auto px-6 mb-20">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-stone-800 rounded-full"></span>
                작명 세부 과정
            </h2>
            <p className="text-stone-600 mb-10">좋은 이름을 짓는 3단계 | 도원사주작명원에서는 좋은 이름을 짓기 위해 다음과 같은 세부적이고 과학적인 절차를 따릅니다.</p>

            <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                    <div className="relative w-[200px] aspect-square flex-shrink-0">
                        <Image
                            src="/process1.png"
                            alt="Process Step 1"
                            fill
                            sizes="200px"
                            className="rounded-lg object-contain bg-stone-50"
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
                    <div className="relative w-[200px] aspect-square flex-shrink-0">
                        <Image
                            src="/process2.png"
                            alt="Process Step 2"
                            fill
                            sizes="200px"
                            className="rounded-lg object-contain bg-stone-50"
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
                    <div className="relative w-[200px] aspect-square flex-shrink-0">
                        <Image
                            src="/process3.png"
                            alt="Process Step 3"
                            fill
                            sizes="200px"
                            className="rounded-lg object-contain bg-stone-50"
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
    );
}
