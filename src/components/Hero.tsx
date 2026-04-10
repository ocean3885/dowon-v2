'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useRef } from 'react';
import Image from 'next/image';

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
        <section ref={containerRef} className="relative h-svh min-h-[680px] flex items-center justify-center overflow-hidden bg-stone-950 text-stone-50">
            {/* Dark Hanji Background Layer */}
            <motion.div
                style={{ y, opacity }}
                className="absolute inset-0 z-0"
            >
                <Image
                    src="/luxury_korean_paper_bg.png"
                    alt="Background"
                    fill
                    className="object-cover opacity-80"
                    priority
                />
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-stone-950"></div>
            </motion.div>

            {/* Content Container */}
            <div className="relative z-10 mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center px-6">

                {/* Badge row: Since 1995 + 재방문 1위 */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-8 flex flex-col items-center gap-4 md:mb-10"
                >
                    <span className="border border-amber-500/30 bg-black/20 px-3 py-1 font-serif text-xs tracking-[0.3em] text-amber-500/80 backdrop-blur-sm md:text-sm">
                        Since 1995
                    </span>
                    <span className="flex items-center gap-1.5 font-serif text-lg tracking-widest text-stone-300 md:text-xl lg:text-2xl">
                        재방문
                        <span className="bg-amber-500 px-1.5 py-0.5 text-xl font-black text-stone-950 shadow-[0_0_16px_rgba(245,158,11,0.3)] md:px-2 md:text-2xl lg:text-3xl">1위</span>
                        작명소
                    </span>
                </motion.div>

                {/* Sub-headline */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-4 font-serif text-lg font-light tracking-wide text-amber-500 md:mb-5 md:text-2xl lg:text-3xl"
                >
                    30년 외길, 사주로 운명의 길을 여는
                </motion.h2>

                {/* Main title */}
                <motion.h1
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-8 bg-linear-to-b from-amber-100 via-white to-stone-300 bg-clip-text font-serif text-4xl font-black leading-none tracking-tight text-transparent drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] md:mb-10 md:text-6xl lg:text-7xl"
                >
                    도원작명철학원
                </motion.h1>

                {/* Divider + Quote */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.35 }}
                    className="mb-8 flex flex-col items-center gap-3 md:mb-10"
                >
                    <div className="h-px w-20 bg-linear-to-r from-transparent via-amber-700 to-transparent" />
                    <p className="font-serif text-lg font-medium tracking-wide text-stone-300 md:text-xl lg:text-2xl">
                        &ldquo;이름이 바뀌면, <span className="border-b border-amber-800 pb-0.5 font-bold text-amber-400">운명의 길</span>이 달라집니다&rdquo;
                    </p>
                    <div className="h-px w-20 bg-linear-to-r from-transparent via-amber-700 to-transparent" />
                </motion.div>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.45 }}
                    className="mb-12 max-w-xl text-center font-serif text-sm leading-loose text-stone-300/90 md:mb-14 md:text-base lg:text-lg"
                >
                    정확한 사주 분석을 통한 맞춤형 작명 전문가.<br className="hidden md:block" />
                    30년 외길의 깊이와 최고의 실력, 그리고 한 자 한 자에 담긴 정성으로<br className="hidden md:block" />
                    귀하의 삶을 빛낼 가장 완벽한 이름을 선사합니다.
                </motion.p>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6 }}
                >
                    <button
                        onClick={scrollToForm}
                        className="group relative overflow-hidden border border-stone-600 bg-transparent px-10 py-5 text-stone-200 transition-all hover:border-amber-500 hover:text-amber-500"
                    >
                        <div className="absolute inset-0 w-0 bg-stone-900/80 opacity-50 transition-all duration-250 ease-out group-hover:w-full" />
                        <span className="relative z-10 flex items-center gap-3 font-serif text-lg tracking-widest">
                            상담 신청하기
                            <ArrowDown className="h-4 w-4 text-amber-500 transition-transform group-hover:translate-y-1" />
                        </span>
                    </button>
                </motion.div>
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
