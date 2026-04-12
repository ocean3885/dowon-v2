'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const services = [
    {
        image: "/service1.png",
        title: "사주 명리",
        description: "생년월일시를 통해 타고난 기질과 운의 흐름을 분석하여 인생의 길흉화복을 예측합니다.",
    },
    {
        image: "/service2.png",
        title: "신생아 작명",
        description: "아이의 사주에 부족한 기운을 보완하고 부르기 좋으며 듣기 좋은 명품 이름을 짓습니다.",
    },
    {
        image: "/service3.png",
        title: "궁합",
        description: "연인, 부부, 동업자와의 성격 조화와 기운의 합을 분석하여 관계의 발전을 돕습니다.",
    },
    {
        image: "/service4.png",
        title: "개명",
        description: "잘못 지어진 이름으로 인한 흉을 피하고, 새로운 이름으로 삶의 긍정적인 변화를 돕습니다.",
    },
    {
        image: "/service5.png",
        title: "택일",
        description: "결혼, 이사, 개업 등 중요한 행사에 가장 길한 날짜와 시간을 선정해드립니다.",
    },
    {
        image: "/service6.png",
        title: "진로/적성",
        description: "학생 및 직장인의 타고난 적성을 파악하여 가장 성공 확률이 높은 진로를 제시합니다.",
    },
];

export default function Services() {
    return (
        <section className="py-12 md:py-24 bg-stone-100 dark:bg-stone-900">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-16">
                    <span className="text-stone-500 dark:text-stone-400 font-serif tracking-widest uppercase mb-2 block">Services</span>
                    <h2 className="text-3xl md:text-5xl font-bold font-display text-stone-900 dark:text-stone-100">상담 분야</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-stone-200 dark:border-stone-700 flex items-center gap-5"
                        >
                            <div className="shrink-0">
                                <Image
                                    src={service.image}
                                    alt={service.title}
                                    width={100}
                                    height={80}
                                    style={{ width: 'auto', height: 'auto' }}
                                    className="rounded-lg object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold font-display text-stone-800 dark:text-stone-100 mb-2">{service.title}</h3>
                                <p className="text-stone-600 dark:text-stone-300 leading-relaxed font-serif text-sm">
                                    {service.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
