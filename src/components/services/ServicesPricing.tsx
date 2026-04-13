export default function ServicesPricing() {
    return (
        <section className="container mx-auto px-6 mb-20">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-800 mb-8 flex items-center gap-2">
                <span className="w-1 h-8 bg-stone-800 rounded-full"></span>
                작명/개명 서비스 안내
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
                {/* Newborn */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200 hover:border-stone-400 transition-colors">
                    <h3 className="text-xl md:text-2xl font-bold text-stone-900 mb-2">신생아 작명</h3>
                    <p className="text-stone-500 mb-6">아기의 첫 선물, 이름에서부터 특별함을 시작하세요.</p>
                    <p className="text-stone-700 mb-8">소중한 순간, 소중한 이름.</p>
                    <div className="text-3xl font-bold text-stone-900 text-right">200,000원</div>
                </div>
                {/* Renaming */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200 hover:border-stone-400 transition-colors">
                    <h3 className="text-xl md:text-2xl font-bold text-stone-900 mb-2">개명</h3>
                    <p className="text-stone-500 mb-6">운명을 바꾸는 힘, 이름에서 시작됩니다.</p>
                    <p className="text-stone-700 mb-8">사주에 맞는 이름으로 개명하여 좋은 기운을 맞이하세요.</p>
                    <div className="text-3xl font-bold text-stone-900 text-right">200,000원</div>
                </div>
            </div>
            <div className="mt-6 text-stone-500 text-sm text-right">
                * 이름 추천: 1회 무료 추가 추천 가능 (유선 문의)
            </div>
        </section>
    );
}
