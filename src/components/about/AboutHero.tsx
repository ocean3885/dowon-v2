'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function AboutHero() {
    return (
        <section className="relative w-full pt-20 pb-12 md:pt-32 md:pb-16 flex items-center justify-center overflow-hidden">
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
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="block text-stone-500 font-serif tracking-widest text-sm md:text-base mb-4 uppercase">
                        About Us
                    </span>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-900 mb-8 leading-normal md:leading-snug break-keep">
                        이름 하나로<br className="md:hidden" /> 인생의 이야기가 달라집니다
                    </h1>
                    <div className="w-16 h-1 bg-stone-800 mx-auto mb-8 opacity-20"></div>
                    <p className="text-stone-600 text-base md:text-xl max-w-2xl mx-auto font-medium leading-relaxed break-keep">
                        도원사주작명원에 방문해 주신 여러분, 진심으로 환영합니다.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
