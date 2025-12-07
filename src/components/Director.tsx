'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Director() {
    return (
        <section className="py-24 bg-stone-50 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">

                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-full md:w-1/2 relative"
                    >
                        <div className="relative aspect-[3/4] w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl">
                            {/* Note: In a real app, you should configure remote patterns in next.config.ts for external images */}
                            <img
                                src="https://myungridan-gil.com/static/section/img/37.jpg"
                                alt="김종찬 원장"
                                className="object-cover w-full h-full"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent"></div>
                            <div className="absolute bottom-6 left-6 text-white">
                                <p className="text-xl font-bold font-serif">김종찬 원장</p>
                                <p className="text-sm opacity-80">도원작명철학원 대표</p>
                            </div>
                        </div>
                        {/* Decorative element */}
                        <div className="absolute -z-10 top-10 -left-10 w-full h-full border-2 border-stone-200 rounded-2xl transform -rotate-3 hidden md:block"></div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-full md:w-1/2 text-stone-800"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-8 font-serif text-stone-900 leading-tight">
                            30년 외길의 정성,<br />
                            운명을 바꾸는 최고의 실력
                        </h2>
                        <div className="space-y-8 text-lg leading-relaxed font-serif text-stone-700">
                            <p className="font-medium text-stone-900 text-xl">
                                "이름은 평생을 함께하는 가장 소중한 친구입니다."
                            </p>
                            <div className="space-y-4">
                                <p>
                                    정확한 사주 분석으로 <strong>부족한 기운</strong>을 채웁니다.
                                </p>
                                <p>
                                    30년 성명학 외길, 수많은 분들의 <strong>운명을 긍정으로</strong> 바꿨습니다.
                                </p>
                                <p>
                                    한 획 한 획 정성을 다한 이름, 귀하의 <strong>든든한 버팀목</strong>이 되겠습니다.
                                </p>
                            </div>
                            <div className="pt-6 border-t border-stone-200">
                                <ul className="grid grid-cols-2 gap-4 text-sm font-sans font-medium text-stone-600">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                        30년 경력 성명학 대가
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                        정확한 사주 심층 분석
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                        개인 맞춤형 명품 작명
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                        정성을 다하는 인생 상담
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
