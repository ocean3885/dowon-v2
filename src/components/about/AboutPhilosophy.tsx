'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8, ease: "easeOut" }
};

const staggerContainer = {
    initial: {},
    whileInView: { transition: { staggerChildren: 0.2 } },
};

export default function AboutPhilosophy() {
    return (
        <section className="bg-stone-900 text-stone-200 py-24 px-6 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                <Image src="/window.svg" alt="pattern" fill sizes="50vw" className="object-cover" />
            </div>

            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10 px-6">
                <motion.div
                    className="order-2 md:order-1 space-y-8"
                    initial="initial"
                    whileInView="whileInView"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                >
                    <motion.div variants={fadeInUp}>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
                            매순간 당신을 대변하는 이름
                        </h2>
                        <div className="h-1 w-20 bg-amber-600 mb-8" />
                    </motion.div>
                    <motion.p variants={fadeInUp} className="text-lg leading-loose text-stone-300">
                        특히 성명학은 인간의 후천적 운명을 다루는 학문으로서,
                        사주에서 부족한 부분을 보완해줄 수 있는 좋은 이름을 짓는 것이 매우 중요합니다.
                    </motion.p>
                    <motion.p variants={fadeInUp} className="text-lg leading-loose text-stone-300">
                        좋은 이름은 단순한 라벨이 아니라, 그 사람의 인생에 긍정적인 영향을 미치는 중요한 요소가 될 수 있습니다.
                        이름은 평생 동안 자신을 대표하며, 사회 속에서 자주 사용되어 그 효과가 지속적으로 작용하게 됩니다.
                    </motion.p>
                    <motion.p variants={fadeInUp} className="text-lg leading-loose text-stone-300">
                        이름만으로 모든 것을 결정 짓는 것은 아니라는 점을 명심해야 합니다.
                        그러나 이름은 우리가 나아갈 길에 도움을 주는 강력한 수단입니다.
                    </motion.p>
                </motion.div>
                <motion.div
                    className="order-1 md:order-2 relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl border border-stone-800"
                    variants={fadeInUp}
                    initial="initial"
                    whileInView="whileInView"
                    viewport={{ once: true }}
                >
                    <Image
                        src="/about2.jpg"
                        alt="성명학 연구"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover hover:scale-105 transition-transform duration-700"
                    />
                </motion.div>
            </div>
        </section>
    );
}
