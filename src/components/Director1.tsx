'use client';

import { motion } from 'framer-motion';

export default function Director1() {
    return (
        <section className="overflow-hidden bg-stone-50 py-16 md:py-24">
            <div className="mx-auto max-w-6xl px-6 md:px-10">
                <div className="flex flex-col items-center gap-10 min-[900px]:flex-row min-[900px]:items-start min-[900px]:gap-14 lg:gap-20">

                    {/* Image — 줄인 크기 */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative w-full shrink-0 min-[900px]:w-[280px] lg:w-[320px]"
                    >
                        <div className="relative mx-auto aspect-[3/4] w-full max-w-[280px] overflow-hidden rounded-2xl shadow-xl min-[900px]:mx-0 min-[900px]:max-w-none">
                            <img
                                src="/kjh.jpg"
                                alt="김종찬 원장"
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-stone-900/60 to-transparent" />
                            <div className="absolute bottom-5 left-5 text-white">
                                <p className="font-serif text-lg font-bold">김종찬 원장</p>
                                <p className="text-xs opacity-80">도원작명철학원 대표</p>
                            </div>
                        </div>
                        {/* Decorative frame */}
                        <div className="absolute -left-6 top-6 -z-10 hidden h-full w-full -rotate-3 rounded-2xl border-2 border-stone-200 min-[900px]:block" />
                    </motion.div>

                    {/* Text */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative w-full overflow-hidden rounded-2xl border border-stone-200/80 bg-white px-6 py-8 text-stone-800 shadow-sm md:px-10 md:py-10"
                    >
                        {/* Subtle warm glow behind text area */}
                        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-200/50 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-stone-200/60 blur-3xl" />
                        {/* Watermark character */}
                        <div className="pointer-events-none absolute -bottom-4 right-4 select-none font-serif text-[8rem] font-black leading-none text-stone-100 md:text-[10rem]">
                            道
                        </div>

                        <div className="relative">
                            <h2 className="mb-6 font-serif text-2xl font-bold leading-snug text-stone-900 md:text-3xl lg:text-4xl">
                                평생을 곁에 머물<br />
                                가장 귀한 선물, 이름                                 
                            </h2>

                            <div className="space-y-5 font-serif text-base leading-relaxed text-stone-700 md:text-lg">
                                <p className="text-lg font-medium text-stone-900 md:text-xl">
                                    &ldquo;귀하의 타고난 <span className="font-bold text-amber-700">복(福)</span>을 깨우는 <span className="font-bold text-amber-700">완벽한 조화</span>를 찾습니다.&rdquo;
                                </p>

                                <div className="space-y-3 text-[0.95rem] md:text-base">
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

                                <div className="border-t border-stone-200 pt-5">
                                    <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm font-medium text-stone-600">
                                        <li className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                            30년 경력 성명학 대가
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                            정확한 사주 심층 분석
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                            개인 맞춤형 명품 작명
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                            정성을 다하는 인생 상담
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                            동아대 정치외교학과
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                            도원명리학회대표
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
