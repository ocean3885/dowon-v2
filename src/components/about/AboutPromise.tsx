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

export default function AboutPromise() {
    return (
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
                        sizes="(max-width: 1024px) 100vw, 896px"
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
    );
}
