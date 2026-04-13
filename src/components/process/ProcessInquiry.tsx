import { HelpCircle, MapPin, PhoneCall } from 'lucide-react';

export default function ProcessInquiry() {
    return (
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
    );
}
