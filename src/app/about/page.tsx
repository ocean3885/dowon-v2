'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import BookingSection from '@/components/BookingSection';

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

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-stone-50">
            {/* Redesigned Hero Section (No Image) */}
            <section className="relative pt-48 pb-24 px-6 md:px-0 bg-stone-100/50">
                <div className="container mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="text-amber-700 font-bold tracking-widest mb-4 uppercase text-sm">About Us</p>
                        <h1 className="text-4xl md:text-5xl font-bold font-serif text-stone-900 mb-8 leading-tight">
                            이름 하나로<br className="md:hidden" /> 인생의 이야기가 달라집니다
                        </h1>
                        <div className="h-1 w-20 bg-stone-800 mx-auto mb-8" />
                        <p className="text-lg text-stone-600 font-light max-w-2xl mx-auto leading-relaxed">
                            도원사주작명원에 방문해 주신 여러분, 진심으로 환영합니다.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Introduction Section */}
            <section className="py-24 px-6 md:px-0 container mx-auto">
                <motion.div
                    className="grid md:grid-cols-2 gap-16 items-center"
                    initial="initial"
                    whileInView="whileInView"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                >
                    <motion.div variants={fadeInUp} className="relative aspect-[3/4] md:aspect-square rounded-2xl overflow-hidden shadow-2xl bg-stone-200">
                        {/* Fallback color if image fails, but removed explicit about1 reliance */}
                        <Image
                            src="/about2.jpg"
                            alt="김종찬 원장"
                            fill
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

            {/* Philosophy Section */}
            <section className="bg-stone-900 text-stone-200 py-24 px-6 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                    <Image src="/window.svg" alt="pattern" fill className="object-cover" />
                </div>

                <div className="container mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
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
                            src="/about3.jpg"
                            alt="성명학 연구"
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-700"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Promise & Closing Section */}
            <section className="py-24 px-6 bg-stone-100">
                <div className="container mx-auto max-w-4xl text-center">
                    <motion.div
                        initial="initial"
                        whileInView="whileInView"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="mb-16"
                    >
                        <div className="inline-block border border-stone-300 bg-white px-8 py-4 rounded-full shadow-sm mb-8">
                            <span className="text-xl md:text-2xl font-serif font-bold text-stone-800">
                                "이름이 만드는 첫인상, 우리가 책임집니다"
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-stone-900 mb-6">
                            당신과 아이의 미래를 함께 그리는 도원사주작명원
                        </h3>
                        <p className="text-lg text-stone-600 leading-relaxed">
                            도원사주작명원에서는 각 개인의 사주를 면밀히 분석하고,
                            가장 잘 어울리는 이름을 제안함으로써 여러분의 인생이 보다 평안하고
                            성공적으로 이끌어질 수 있도록 도와드립니다.
                        </p>
                    </motion.div>

                    <motion.div
                        className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl mb-16"
                        variants={fadeInUp}
                        initial="initial"
                        whileInView="whileInView"
                        viewport={{ once: true }}
                    >
                        <Image
                            src="/about4.jpg"
                            alt="도원사주작명원의 약속"
                            fill
                            className="object-cover"
                        />
                    </motion.div>

                    <motion.div
                        variants={fadeInUp}
                        initial="initial"
                        whileInView="whileInView"
                        viewport={{ once: true }}
                        className="prose prose-stone mx-auto text-lg text-stone-600"
                    >
                        <p>
                            마지막으로, 도원사주작명원을 찾아주신 모든 분들께 진심으로 감사드리며,
                            여러분의 삶에 긍정적인 변화가 일어나길 진심으로 기원합니다.
                        </p>
                        <p className="mt-8 font-serif text-xl text-stone-900 font-bold">
                            도원사주작명원 원장 김종찬 올림
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Booking Section */}
            <BookingSection />
        </main>
    );
}
