'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Sparkles, GraduationCap, Home, Heart } from 'lucide-react';

const benefits = [
    {
        icon: Sparkles,
        title: '자신감 넘치는 변화',
        description: '성격이 밝고 긍정적으로 변하며 매사에 당당해집니다.',
        color: 'bg-amber-100 text-amber-600',
    },
    {
        icon: GraduationCap,
        title: '성취의 기쁨',
        description: '학업의 능률이 오르고, 간절히 바라던 취업이나 시험에서 좋은 결실을 맺습니다.',
        color: 'bg-orange-100 text-orange-600',
    },
    {
        icon: Home,
        title: '평온한 일상과 풍요',
        description: '가정에 화목이 깃들고 경제적인 흐름이 원활해지는 행운을 경험합니다.',
        color: 'bg-yellow-100 text-yellow-700',
    },
    {
        icon: Heart,
        title: '소중한 인연의 시작',
        description: '좋은 인연을 만나지 못해 고민하던 분들에게 새로운 만남의 기운이 열립니다.',
        color: 'bg-rose-100 text-rose-500',
    },
];

export default function NamingBenefits() {
    return (
        <section className="relative overflow-hidden bg-white py-20 md:py-32">
            {/* Warm decorative background */}
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />

            <div className="container relative z-10 mx-auto max-w-4xl px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-6 text-center"
                >
                    <h2 className="font-serif text-2xl leading-snug tracking-tight text-stone-800 md:text-4xl">
                        &ldquo;당신의 운명을 완성하는
                        <br />
                        마지막 조각, <span className="font-custom text-amber-600">이름</span>&rdquo;
                    </h2>
                </motion.div>

                {/* Intro paragraph */}
                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="mx-auto mb-8 max-w-2xl text-center font-serif text-base leading-relaxed text-stone-600 md:mb-10 md:text-lg md:leading-loose"
                >
                    타고난 사주를 바꿀 수는 없지만, 그 부족함을 채워줄 좋은 이름을 갖는 것은
                    삶의 방향을 바꾸는 지혜입니다.
                    <br className="hidden md:block" />
                    나에게 꼭 맞는 이름은 다음과 같은 변화를 가져옵니다.
                </motion.p>

                {/* 이미지 삽입 */}
                <div className="flex justify-center mb-8 md:mb-12 relative">
                    <Image
                        src="/office2.jpg"
                        alt="사무실 풍경"
                        width={480}
                        height={320}
                        className="rounded-xl shadow-lg object-cover"
                        style={{ width: '100%', height: 'auto' }}
                        priority
                    />
                </div>

                {/* Benefits grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {benefits.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.15 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="group rounded-2xl border border-gray-200/90 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md md:p-8"
                        >
                            <div className="mb-4 flex items-center gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}>
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-custom text-lg font-bold text-stone-800">
                                    {item.title}
                                </h3>
                            </div>
                            <p className="font-serif text-sm leading-relaxed text-stone-500 md:text-base md:leading-relaxed">
                                {item.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
