import Image from 'next/image';

export default function ProcessHero() {
    return (
        <section className="relative w-full py-20 md:py-32 flex items-center justify-center overflow-hidden">
            {/* Background Texture with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/luxury_korean_paper_bg.png"
                    alt="Korean Paper Texture"
                    fill
                    sizes="100vw"
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
    );
}
