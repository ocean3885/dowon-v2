import { FileEdit, CreditCard, Calendar, MessageCircle } from 'lucide-react';

export default function ProcessSteps() {
    return (
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
    );
}
