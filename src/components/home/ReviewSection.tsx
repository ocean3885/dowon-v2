// components/ReviewSection.tsx

"use client";

import Image from "next/image";
import {
    CalendarDays,
    MessageCircle,
    Smile,
    Users,
    Star
} from "lucide-react";
import clsx from "clsx";

const reviews = [
    {
        title: "막연했던 고민의 원인을 명확히 알게 되니 마음이 한결 가벼워졌어요.",
        desc: "제 상황에 맞는 현실적인 조언 덕분에 앞으로의 방향을 확실히 정할 수 있었습니다.",
        meta: "30대 직장인  |  진로·직업 상담",
        image: "/about4.jpg",
    },
    {
        title: "인연과 관계에 대한 깊은 이해가 많은 도움이 되었습니다.",
        desc: "상대방의 성향과 흐름을 알게 되니 관계가 훨씬 편안해졌어요.",
        meta: "40대 여성  |  연애·궁합 상담",
        image: "/about4.jpg",
    },
    {
        title: "사업 방향을 잡는 데 큰 도움이 되었습니다.",
        desc: "시기의 흐름을 짚어주신 덕분에 중요한 결정에 확신을 가질 수 있었고 좋은 결과로 이어지고 있습니다.",
        meta: "40대 남성  |  사업·재물 상담",
        image: "/about4.jpg",
    },
    {
        title: "정확한 분석과 따뜻한 조언이 인상 깊었습니다.",
        desc: "단순히 미래를 알려주는 것이 아니라 지금 제가 할 수 있는 것까지 알려주셨어요.",
        meta: "20대 여성  |  사주 상담",
        image: "/about4.jpg",
    },
];

const stats = [
    {
        icon: <Smile className="h-7 w-7 text-[#C8A46B]" />,
        value: "98%",
        label: "상담 만족도",
        desc: "상담 후 만족하셨다는 고객 비율",
    },
    {
        icon: <Users className="h-7 w-7 text-[#C8A46B]" />,
        value: "7,200+",
        label: "누적 상담 건수",
        desc: "다양한 고민과 함께한 시간",
    },
    {
        icon: <CalendarDays className="h-7 w-7 text-[#C8A46B]" />,
        value: "30+년",
        label: "상담 경력",
        desc: "오랜 경험과 깊이 있는 해석",
    },
    {
        icon: <MessageCircle className="h-7 w-7 text-[#C8A46B]" />,
        value: "95%",
        label: "재상담 의사",
        desc: "신뢰로 이어지는 상담",
    },
];

export default function ReviewSection() {
    return (
        <section className="relative overflow-hidden bg-[#1a1815] py-24 sm:py-32 text-white -mt-[2px] shadow-[0_-2px_0_0_#1a1815]">
            <div className="relative z-10 mx-auto max-w-7xl px-8 lg:px-12">
                {/* Header & Review Cards Area with Background */}
                <div className="relative -mx-8 lg:-mx-12 px-8 lg:px-12 pt-16 pb-12 overflow-hidden">
                    {/* Background Texture & Image restricted to this area */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <div className="absolute inset-0 scale-x-[-1] opacity-80">
                            <Image
                                src="/home/section2_bg.webp"
                                alt="Review Section Background"
                                fill
                                className="object-cover"
                                priority
                            />
                            {/* Gradient to blend with the rest of the section */}
                            <div className="absolute inset-0 bg-gradient-to-b from-[#1a1815] via-transparent to-[#1a1815]" />
                        </div>
                    </div>

                    <div className="relative z-10">
                        {/* Header */}
                        <div className="mb-20">
                            <div className="mb-6 flex items-center gap-4">
                                <span className="h-px w-8 bg-[#C8A46B]" />
                                <span className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-[#C8A46B]">
                                    Client Testimonials
                                </span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
                                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light leading-[1.2] tracking-tight text-[#E5D5BC] break-keep">
                                    도원과 함께한<br />
                                    변화의 이야기
                                </h2>
                                <p className="max-w-md text-base sm:text-lg leading-relaxed text-white/50 font-sans font-light break-keep lg:mb-2">
                                    삶의 흐름을 이해하고 방향을 잡아가는 과정,
                                    도원과 함께한 분들의 진솔한 이야기를 확인해보세요.
                                </p>
                            </div>
                        </div>

                        {/* Review Cards (Compact 2-Grid on Mobile) */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-12">
                            {reviews.map((review, idx) => (
                                <div
                                    key={idx}
                                    className="group relative flex flex-col h-full overflow-hidden border border-white/5 bg-white/[0.03] backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.05] hover:border-white/10"
                                >
                                    <div className="p-4 sm:p-8 flex-1">
                                        <span className="text-3xl sm:text-5xl font-serif text-[#C8A46B]/40 leading-none block mb-1 sm:mb-4">“</span>
                                        <h3 className="text-sm sm:text-xl font-serif font-light leading-snug sm:leading-relaxed text-[#E5D5BC] mb-2 sm:mb-6 break-keep group-hover:text-white transition-colors">
                                            {review.title}
                                        </h3>
                                        <p className="text-[12px] sm:text-sm leading-normal sm:leading-relaxed text-white/50 font-sans font-light break-keep mb-4 sm:mb-8">
                                            {review.desc}
                                        </p>

                                        <div className="mt-auto">
                                            <div className="flex gap-0.5 sm:gap-1 mb-2 sm:mb-4">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="w-2 h-2 sm:w-3 sm:h-3 fill-[#C8A46B] text-[#C8A46B]" />
                                                ))}
                                            </div>
                                            <div className="text-[9px] sm:text-[11px] font-sans font-medium tracking-wider text-[#C8A46B]/70 uppercase">
                                                {review.meta}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 mb-16 overflow-hidden rounded-sm relative z-10">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-[#1a1815] p-5 sm:p-10 transition-colors hover:bg-white/[0.02]">
                            <div className="mb-3 sm:mb-6 opacity-80 scale-90 sm:scale-100 origin-left">{stat.icon}</div>
                            <div className="text-2xl sm:text-4xl font-serif font-light text-[#E5D5BC] mb-1 sm:mb-2 tracking-tighter">
                                {stat.value}
                            </div>
                            <div className="text-[10px] sm:text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#C8A46B]/80 mb-2 sm:mb-3">
                                {stat.label}
                            </div>
                            <p className="text-[11px] sm:text-sm leading-relaxed text-white/40 font-sans font-light break-keep">
                                {stat.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 p-8 sm:p-12 lg:p-14">


                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        <div className="lg:col-span-7">
                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-light leading-[1.3] text-[#E5D5BC] break-keep mb-4 sm:mb-6">
                                당신의 이야기도<br />
                                도원에서 시작될 수 있습니다.
                            </h3>
                            <p className="text-sm sm:text-base text-white/50 font-sans font-light break-keep mb-6 sm:mb-8 max-w-xl">
                                삶의 고민은 성장을 위한 정거장입니다. 지금의 고민이 앞으로의 방향이 될 수 있도록
                                김종찬 원장이 진심을 다해 함께하겠습니다.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button className="h-12 sm:h-14 px-8 bg-[#C8A46B] text-black font-sans font-bold text-sm transition-all hover:bg-[#d7b57c] flex items-center justify-center gap-2">
                                    상담 신청하기
                                    <span className="text-xl">→</span>
                                </button>
                                <button className="h-12 sm:h-14 px-8 border border-white/20 text-white font-sans font-medium text-sm transition-all hover:bg-white/5 flex items-center justify-center">
                                    상담 절차 안내
                                </button>
                            </div>
                        </div>

                        <div className="lg:col-span-5 relative">
                            <div className="aspect-[16/10] lg:aspect-[16/9] relative overflow-hidden rounded-sm opacity-85 transition-opacity duration-500">
                                <Image
                                    src="/about4.jpg"
                                    alt="상담 안내"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            {/* Decorative Frame */}
                            <div className="absolute -inset-3 border border-[#C8A46B]/20 pointer-events-none -z-10" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}