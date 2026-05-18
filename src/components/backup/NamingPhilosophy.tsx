'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function NamingPhilosophy() {
    return (
        <section className="relative overflow-hidden bg-stone-900 py-20 md:py-32">
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] font-bold text-white select-none leading-none">
                    名
                </div>
            </div>
            <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
            <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

            <div className="container relative z-10 mx-auto max-w-3xl px-6">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-12 text-center md:mb-16"
                >
                    <span className="mb-4 inline-block border border-amber-500/30 bg-amber-500/5 px-4 py-1 font-serif text-xs tracking-[0.3em] text-amber-500/80">
                        NAMING
                    </span>
                    <h2 className="mt-6 font-serif text-2xl leading-snug tracking-tight text-stone-100 md:text-4xl">
                        이름, 평생을 따라다니는
                        <br />
                        <span className="font-custom text-amber-400">당신의 울림</span>
                    </h2>
                </motion.div>

                {/* Body paragraphs */}
                <div className="space-y-8 md:space-y-10">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="font-serif text-base leading-relaxed text-stone-300 md:text-lg md:leading-loose"
                    >
                        우리는 매일 이름으로 불리며 살아갑니다.
                        <br className="hidden md:block" />{' '}
                        반복되는 그 소리는 단순한 호칭을 넘어 삶의 궤적을 만드는
                        <br className="hidden md:block" />{' '}
                        <span className="font-custom text-stone-100">보이지 않는 에너지</span>가 됩니다.
                    </motion.p>

                    {/* 이미지 삽입 */}
                    <div className="flex justify-center">
                        <Image
                            src="/office1.jpg"
                            alt="사무실 내부"
                            width={480}
                            height={320}
                            className="rounded-xl shadow-lg my-4 object-cover"
                            style={{ maxWidth: '100%', width: 'auto', height: 'auto' }}
                            priority
                        />
                    </div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="font-serif text-base leading-relaxed text-stone-300 md:text-lg md:leading-loose"
                    >
                        이름은 태어나는 순간 세상과 맺는 <span className="font-custom text-amber-400">첫 번째 약속</span>이자,
                        가장 오래도록 남는 유산입니다.
                        그렇기에 저희는 이름을 결코 가볍게 짓지 않습니다.
                        타고난 성품(사주)과 삶의 결을 먼저 깊이 들여다보고,
                        그 흐름에 가장 어울리는 <span className="font-custom text-stone-100">&lsquo;이정표&rsquo;</span>로서의 이름을 선물합니다.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="relative border-l-2 border-amber-500/40 pl-6"
                    >
                        <p className="font-serif text-base leading-relaxed text-stone-200 md:text-lg md:leading-loose">
                            우리가 이름에 진심인 이유는 단 하나,
                            <br />
                            그것이 당신의 인생을 실질적으로 변화시키는
                            <br />
                            <span className="font-custom font-bold text-amber-400">가장 가치 있는 선택</span>이기 때문입니다.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
