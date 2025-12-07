'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useRef } from 'react';

export default function Hero() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    const scrollToForm = () => {
        document.getElementById('consultation-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section ref={containerRef} className="relative h-screen flex items-center justify-center overflow-hidden bg-stone-950 text-stone-50">
            {/* Dark Hanji Background Layer */}
            <motion.div
                style={{ y, opacity }}
                className="absolute inset-0 z-0"
            >
                <img
                    src="/luxury_korean_paper_bg.png"
                    alt="Background"
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-stone-950"></div>
            </motion.div>

            {/* Content Container */}
            <div className="relative z-10 container mx-auto px-6 h-full flex flex-col items-center justify-center">

                {/* Main Content */}
                <div className="flex flex-col items-center text-center space-y-8 md:space-y-12 max-w-5xl mx-auto">

                    {/* Top Tagline (New) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col items-center space-y-4"
                    >
                        <span className="inline-block py-1 px-4 border text-amber-500/80 border-amber-500/30 font-serif text-sm md:text-base tracking-[0.3em] font-medium uppercase backdrop-blur-sm bg-black/20">
                            Since 1995
                        </span>
                        <h3 className="text-xl md:text-2xl font-serif text-stone-300 font-light tracking-widest">
                            전통과 품격이 깃든 명품 작명
                        </h3>
                    </motion.div>

                    {/* Main Title Group */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-6 md:space-y-8 flex flex-col items-center w-full"
                    >
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-amber-500 font-light tracking-wide leading-relaxed whitespace-nowrap">
                            김종찬 원장
                        </h2>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black tracking-tight leading-none whitespace-nowrap bg-gradient-to-b from-amber-100 via-white to-stone-300 bg-clip-text text-transparent drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                            도원작명철학원
                        </h1>

                        <div className="flex flex-col items-center gap-2 pt-6 w-full">
                            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-amber-700 to-transparent"></div>
                            <p className="text-lg md:text-xl lg:text-2xl font-serif text-stone-300 font-medium tracking-wide whitespace-nowrap">
                                "이름이 바뀌면, <span className="text-amber-400 font-bold border-b border-amber-800 pb-1">운명의 길</span>이 달라집니다"
                            </p>
                            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-amber-700 to-transparent"></div>
                        </div>
                    </motion.div>

                    {/* Description */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.2, delay: 0.4 }}
                        className="max-w-2xl mx-auto"
                    >
                        <p className="text-stone-300 leading-loose font-serif text-sm md:text-base lg:text-lg break-keep opacity-90">
                            정확한 사주 분석을 통한 맞춤형 작명 전문가.<br className="hidden md:block" />
                            30년 외길의 깊이와 최고의 실력, 그리고 한 자 한 자에 담긴 정성으로<br className="hidden md:block" />
                            귀하의 삶을 빛낼 가장 완벽한 이름을 선사합니다.
                        </p>
                    </motion.div>

                    {/* Call to Action */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="pt-8"
                    >
                        <button
                            onClick={scrollToForm}
                            className="group relative px-10 py-5 bg-transparent border border-stone-600 text-stone-200 overflow-hidden transition-all hover:border-amber-500 hover:text-amber-500"
                        >
                            <div className="absolute inset-0 w-0 bg-stone-900/80 transition-all duration-[250ms] ease-out group-hover:w-full opacity-50"></div>
                            <span className="relative z-10 flex items-center gap-3 font-serif text-lg tracking-widest">
                                무료 상담 신청하기
                                <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform text-amber-500" />
                            </span>
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Vertical Decorative Text (Right Side) */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 0.15, x: 0 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="absolute top-1/2 right-6 md:right-12 -translate-y-1/2 hidden lg:block pointer-events-none select-none"
            >
                <div className="writing-vertical-rl text-[10rem] font-serif font-black text-amber-900/20 mix-blend-overlay tracking-widest">
                    名振四海
                </div>
            </motion.div>
        </section>
    );
}
