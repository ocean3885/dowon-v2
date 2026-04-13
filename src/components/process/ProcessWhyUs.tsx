import { ScrollText, CheckCircle2, Sparkles } from 'lucide-react';

export default function ProcessWhyUs() {
    return (
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
    );
}
