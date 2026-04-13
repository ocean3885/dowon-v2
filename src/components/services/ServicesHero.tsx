import Image from 'next/image';

export default function ServicesHero() {
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
    );
}
