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

export default function AboutIntroduction() {
    return (
        <section className="pt-8 pb-24 md:pt-12 container max-w-6xl mx-auto px-6">
            <motion.div
                className="grid md:grid-cols-2 gap-16 items-center"
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true }}
                variants={staggerContainer}
            >
                <motion.div variants={fadeInUp} className="relative w-full aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-stone-200">
                    <Image
                        src="/about3.jpg"
                        alt="김종찬 원장"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover hover:scale-105 transition-transform duration-700"
                    />
                </motion.div>
                <motion.div variants={fadeInUp} className="space-y-8">
                    <div className="border-l-4 border-stone-800 pl-6">
                        <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2">원장 김종찬</h2>
                        <p className="text-stone-500 font-serif italic">"인생은 끝없는 여정과도 같습니다"</p>
                    </div>
                    <div className="text-stone-700 space-y-6 leading-loose text-lg">
                        <p>
                            우리 인생은 다양한 고난과 기쁨을 경험하며 살아가는 과정입니다.
                            일상의 어려움부터 시작해 학문의 도전, 배우자를 찾고 가정을 이루는 일,
                            그리고 자녀를 키우며 부모로서 겪는 수많은 고민과 즐거움까지.
                        </p>
                        <p>
                            저 역시 이러한 인생의 여정 속에서 살아가고 있으며,
                            인간의 삶이 직면할 수 있는 다양한 굴레와 과제들을 깊이 고민하며,
                            역학과 사주, 그리고 이름에 대한 연구를 지난 20년 동안 꾸준히 해왔습니다.
                        </p>
                        <p className="font-semibold text-stone-900">
                            저는 사람마다 타고난 기운이 있으며, 이를 잘 조화롭게 하는 것이 중요하다고 믿습니다.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}
