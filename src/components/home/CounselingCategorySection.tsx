"use client";

import {
    Users,
    BriefcaseBusiness,
    Heart,
    BarChart3,
    House,
    Baby,
    Target,
    Shield,
    Leaf,
    User,
    ArrowRight,
} from "lucide-react";

const counselingItems = [
    {
        icon: Users,
        title: "사주 상담",
        description:
            "타고난 사주를 바탕으로 인생의 흐름과 방향을 명확히 해석합니다.",
        image: "/home/service_new1.webp",
    },
    {
        icon: BriefcaseBusiness,
        title: "직업 · 진로 상담",
        description:
            "적성과 시기를 분석하여 직업과 진로의 올바른 방향을 제시합니다.",
        image: "/home/service_new2.jpg",
    },
    {
        icon: Heart,
        title: "연애 · 궁합 상담",
        description:
            "두 사람의 인연과 성향을 분석하여 관계의 흐름을 짚어드립니다.",
        image: "/home/service_new6.webp",
    },
    {
        icon: BarChart3,
        title: "재물 · 사업 상담",
        description:
            "재물운의 흐름과 사업운의 시기를 분석하여 성공의 전략을 함께 세웁니다.",
        image: "/home/service_new4.webp",
    },
    {
        icon: House,
        title: "이사 · 택일 상담",
        description:
            "좋은 기운이 흐르는 시기와 공간을 선택하여 안정과 발전을 돕습니다.",
        image: "/home/service_new3.webp",
    },
    {
        icon: Baby,
        title: "작명 · 개명 상담",
        description:
            "이름에 담긴 뜻과 오행의 조화를 통해 삶의 기운을 바르게 세워드립니다.",
        image: "/home/service_new5.jpg",
    },
];

const strengths = [
    {
        icon: Target,
        title: "정확하고 깊이 있는 해석",
        description:
            "명리학의 원리를 기반으로 정확하고 깊이 있는 해석을 제공합니다.",
    },
    {
        icon: User,
        title: "개인 맞춤형 상담",
        description:
            "개인의 상황과 고민에 맞춘 1:1 맞춤 상담을 진행합니다.",
    },
    {
        icon: Shield,
        title: "신뢰와 비밀 보장",
        description:
            "모든 상담 내용을 철저히 비밀로 보장하며 신뢰를 최우선으로 합니다.",
    },
    {
        icon: Leaf,
        title: "현실적인 조언",
        description:
            "막연한 예측이 아닌 현실적인 조언으로 삶의 방향을 제시합니다.",
    },
];

export default function CounselingCategorySection() {
    return (
        <section className="relative overflow-hidden bg-[#fdfaf5] py-20 md:py-28 text-[#1a1a1a] font-serif antialiased">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(200,164,107,0.1),transparent_50%)]" />

            <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
                {/* Heading */}
                <div className="mx-auto max-w-3xl text-center">
                    <div className="mb-6 flex items-center justify-center gap-4">
                        <div className="h-px w-10 bg-[#C8A46B]/40" />
                        <span className="font-sans text-sm font-semibold tracking-[0.15em] text-[#A6834D] antialiased">
                            다양한 삶의 흐름을 함께 해석합니다
                        </span>
                        <div className="h-px w-10 bg-[#C8A46B]/40" />
                    </div>

                    <h2 className="text-4xl font-light tracking-[-0.04em] text-[#111] md:text-6xl break-keep leading-tight">
                        상담 분야 안내
                    </h2>

                    <p className="mx-auto mt-8 max-w-2xl text-base md:text-lg leading-relaxed text-[#333] break-keep antialiased">
                        도원은 개인의 상황과 시기에 맞춘 깊이 있는 해석으로
                        <br className="hidden md:block" />
                        당신의 삶이 나아갈 올바른 방향을 함께 찾아갑니다.
                    </p>
                </div>

                {/* Cards */}
                <div className="mt-12 flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory sm:grid sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden after:content-[''] after:w-6 after:shrink-0 sm:after:hidden">
                    {counselingItems.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={index}
                                className="group relative min-w-[85%] sm:min-w-0 snap-center overflow-hidden rounded-[32px] border border-[#C8A46B]/15 bg-white p-8 transition-all duration-500 hover:border-[#C8A46B]/40 hover:shadow-[0_20px_50px_rgba(200,164,107,0.08)]"
                            >
                                {/* Icon & Title */}
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#C8A46B]/25 bg-[#fdfaf5]">
                                        <Icon
                                            className="h-5 w-5 text-[#C8A46B]"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <h3 className="text-2xl font-serif font-medium tracking-[-0.01em] text-[#1a1a1a] break-keep leading-tight">
                                        {item.title}
                                    </h3>
                                </div>

                                {/* Content */}
                                <div className="relative mb-8">
                                    <p className="text-base leading-relaxed text-[#4a4743] font-sans break-keep antialiased line-clamp-2 md:line-clamp-none">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Image */}
                                <div className="relative h-[180px] overflow-hidden rounded-2xl">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                                </div>

                                {/* Bottom CTA */}
                                <button className="mt-4 flex items-center gap-2 font-sans text-[10px] font-bold tracking-widest text-[#C8A46B] transition-all hover:gap-3 uppercase">
                                    자세히 보기
                                    <ArrowRight className="h-3 w-3" />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Notice */}
                <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-4 rounded-2xl border border-[#C8A46B]/30 bg-white/80 px-6 py-4 text-center md:text-left text-sm text-[#4a453e] backdrop-blur-sm">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#C8A46B]/50 font-sans font-bold text-[#C8A46B] text-[10px]">
                        !
                    </div>

                    <span className="font-medium break-keep antialiased">
                        상담은 100% 사전 예약제로 운영되며, 개개인의 고민에 집중할 수 있도록 충분한 상담 시간을 보장합니다.
                    </span>
                </div>

                {/* Bottom Strengths */}
                <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {strengths.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={index}
                                className="group relative flex flex-col items-center p-6 text-center rounded-[24px] border border-[#C8A46B]/25 bg-white/70 transition-all hover:bg-white hover:border-[#C8A46B]/40 hover:shadow-[0_10px_30px_rgba(200,164,107,0.05)]"
                            >
                                <div className="mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#C8A46B]/20 bg-[#fdfaf5]">
                                    <Icon
                                        className="h-5 w-5 text-[#C8A46B]"
                                        strokeWidth={1.5}
                                    />
                                </div>

                                <h4 className="text-lg font-light tracking-[-0.03em] text-[#171717] break-keep">
                                    {item.title}
                                </h4>

                                <p className="mt-3 text-[13px] leading-relaxed text-[#5a5753] break-keep antialiased">
                                    {item.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}