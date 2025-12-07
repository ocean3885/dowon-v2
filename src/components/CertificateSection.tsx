'use client';

import { motion } from 'framer-motion';

export default function CertificateSection() {
    return (
        <section className="py-24 bg-stone-100 overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center gap-16 max-w-6xl mx-auto">

                    {/* Text Area */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-full md:w-1/2 space-y-8"
                    >
                        <div className="space-y-4">
                            <span className="inline-block py-1 px-3 border border-amber-600/30 bg-amber-50 text-amber-700 text-sm font-serif font-bold tracking-widest rounded-sm">
                                SPECIAL GIFT
                            </span>
                            <h2 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 leading-tight">
                                품격 있는 작명,<br />
                                <span className="text-amber-600">고급 인증서</span>로 완성하다
                            </h2>
                        </div>

                        <div className="space-y-6 text-stone-700 font-serif text-lg leading-relaxed">
                            <p>
                                도원작명철학원에서 작명하시는 모든 분께<br />
                                정성을 담은 <strong>고급 작명 인증서</strong>를 무료로 평생 소장하실 수 있도록 제공해드립니다.
                            </p>
                            <p>
                                이름에 담긴 깊은 뜻과 사주에 맞는 오행의 조화를 한 눈에 확인하실 수 있습니다.
                            </p>
                        </div>

                        <div className="pt-4">
                            <ul className="grid grid-cols-1 gap-3 font-medium text-stone-600">
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                    고급 지류와 금박 가공
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                    작명 해설서 포함
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                    평생 소장 가치
                                </li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* Image Area */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-full md:w-1/2"
                    >
                        <div className="relative aspect-[5/3] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform md:rotate-2 hover:rotate-0 transition-transform duration-500">
                            <img
                                src="/naming_certificate.jpg"
                                alt="고급 작명 인증서"
                                className="w-full h-full object-cover bg-stone-200"
                            />
                            {/* Reflection/Sheen Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
                        </div>
                        <p className="text-center text-stone-500 text-sm mt-4 font-serif italic">
                            * 실제 제공되는 인증서와 이미지는 다를 수 있습니다.
                        </p>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
