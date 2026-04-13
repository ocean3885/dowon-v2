import Image from 'next/image';
import { ScrollText, Sparkles, Scale } from 'lucide-react';

export default function ServicesPhilosophy() {
    return (
        <section className="container mx-auto px-6 mb-20">
            <div className="bg-white mt-6 rounded-xl shadow-lg p-8 md:p-12 border border-stone-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-stone-50 rounded-full -mr-32 -mt-32 opacity-50 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center mb-12">
                    <div className="flex-1">
                        <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-800 mb-6 flex items-center gap-2">
                            <span className="w-1 h-8 bg-stone-800 rounded-full"></span>
                            김종찬 원장의 명품 작명이란?
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
                                sizes="256px"
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-stone-50 p-6 rounded-xl border border-stone-100 hover:shadow-md transition-shadow group">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:bg-stone-800 group-hover:text-white transition-colors flex-shrink-0">
                                <ScrollText className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-stone-900">전문적인 분석</h3>
                        </div>
                        <p className="text-stone-600 text-sm leading-relaxed">
                            사주의 병(病)과 약(藥)을 정확히 분석하여, 근본적인 운세의 흐름을 파악하고 부족함을 채워줍니다.
                        </p>
                    </div>
                    <div className="bg-stone-50 p-6 rounded-xl border border-stone-100 hover:shadow-md transition-shadow group">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:bg-stone-800 group-hover:text-white transition-colors flex-shrink-0">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-stone-900">현대적 감각</h3>
                        </div>
                        <p className="text-stone-600 text-sm leading-relaxed">
                            촌스럽지 않고 시대에 뒤떨어지지 않는, 세련되고 부르기 좋으며 기억에 남는 이름을 짓습니다.
                        </p>
                    </div>
                    <div className="bg-stone-50 p-6 rounded-xl border border-stone-100 hover:shadow-md transition-shadow group">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:bg-stone-800 group-hover:text-white transition-colors flex-shrink-0">
                                <Scale className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-stone-900">운명 보완</h3>
                        </div>
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
    );
}
