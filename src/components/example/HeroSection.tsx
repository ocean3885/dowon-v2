// app/components/HeroSection.tsx

"use client";

import {
    BookOpen,
    ShieldCheck,
    Target,
    User,
    Calendar,
} from "lucide-react";

export default function HeroSection() {
    return (
        <section className="relative h-screen flex flex-col overflow-hidden bg-[#090909] pt-[84px] text-white font-serif">
            {/* Background (Same as before) */}
            <div className="absolute inset-0">
                {/* background image */}
                <div className="absolute inset-0 bg-[url('/home/dowon_mountain_bg.webp')] bg-cover bg-center" />

                {/* radial glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,164,107,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(200,164,107,0.08),transparent_30%)]" />

                {/* texture (removed) */}

                {/* decorative circles */}
                <div className="absolute right-[-8%] top-1/2 h-[900px] w-[900px] -translate-y-1/2 rounded-full border border-[#C8A46B]/20" />

                <div className="absolute right-[5%] top-1/2 h-[650px] w-[650px] -translate-y-1/2 rounded-full border border-[#C8A46B]/10" />

                <div className="absolute right-[18%] top-1/2 h-[350px] w-[350px] -translate-y-1/2 rounded-full border border-[#C8A46B]/20" />

                {/* dark overlay */}
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Hero Content - Grows to fill available space */}
            <div className="relative z-10 mx-auto flex flex-grow w-full max-w-7xl items-center px-6 py-8 lg:px-10">
                <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
                    {/* Left Content */}
                    <div className="flex flex-col justify-center text-center lg:text-left">
                        {/* small label */}
                        <div className="mb-4 flex items-center justify-center gap-4 md:mb-8 lg:justify-start">
                            <div className="h-px w-8 bg-[#C8A46B] md:w-12" />

                            <span className="text-sm font-sans font-medium tracking-wider text-[#C8A46B] antialiased md:text-lg">
                                사주를 넘어 흐름을 읽습니다
                            </span>
                        </div>

                        {/* title */}
                        <h1 className="mx-auto max-w-3xl break-keep text-4xl font-normal leading-[1.2] tracking-[-0.05em] sm:text-5xl md:text-6xl lg:mx-0 lg:max-w-none lg:text-7xl">
                            운의 구조를
                            <br className="hidden sm:block lg:hidden" />
                            {" "}
                            <span className="lg:whitespace-nowrap text-[#C8A46B]">
                                현실적으로 해석합니다
                            </span>
                        </h1>

                        {/* description */}
                        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed tracking-wide text-white/80 antialiased break-keep sm:text-lg md:mt-8 md:text-xl md:leading-9 lg:mx-0">
                            관계, 직업, 재물의 흐름을 정확히 읽어
                            <br className="hidden sm:block" />
                            당신의 삶이 나아갈 방향을 제시합니다.
                        </p>

                        {/* CTA */}
                        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center md:mt-12 lg:justify-start">
                            <button className="flex h-14 w-full items-center justify-center gap-3 rounded-sm bg-[#C8A46B] px-8 text-base font-sans font-bold text-black transition hover:bg-[#d7b57c] sm:h-16 sm:w-auto sm:px-10 sm:text-lg">
                                <Calendar className="h-5 w-5" />
                                상담 신청
                            </button>

                            <button className="flex h-14 w-full items-center justify-center gap-3 rounded-sm border border-white/15 bg-white/[0.02] px-8 text-base font-sans font-medium text-white transition hover:border-[#C8A46B]/50 hover:bg-white/[0.04] sm:h-16 sm:w-auto sm:px-10 sm:text-lg">
                                상담 분야 보기
                                <span>→</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Visual (Hidden on mobile/tablet) */}
                    <div className="relative hidden lg:block">
                        {/* mountain glow */}
                        <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(200,164,107,0.2),transparent_60%)] blur-3xl" />

                        {/* decorative particles */}
                        <div className="absolute right-[120px] top-[180px] h-2 w-2 rounded-full bg-[#C8A46B]" />
                        <div className="absolute right-[240px] top-[320px] h-1.5 w-1.5 rounded-full bg-[#C8A46B]/80" />
                        <div className="absolute right-[340px] top-[200px] h-1 w-1 rounded-full bg-[#C8A46B]/70" />

                        {/* bottom mountain silhouette */}
                        <div className="absolute bottom-[-60px] right-[-80px] h-[420px] w-[620px] rounded-[100px] bg-gradient-to-t from-[#1A140F] to-transparent blur-2xl" />
                    </div>
                </div>
            </div>

            {/* Feature Section - Pinned to bottom, compact on mobile */}
            <div className="relative z-20 pb-10 pt-4 md:pb-16 md:pt-10">
                <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-6 px-6 md:grid-cols-2 md:gap-10 lg:grid-cols-4 lg:px-10">
                    <FeatureItem
                        icon={<BookOpen className="h-5 w-5 text-[#C8A46B] md:h-7 md:w-7" />}
                        title="깊이 있는 분석"
                        desc="사주의 구조와 흐름을 체계적으로 해석합니다."
                    />

                    <FeatureItem
                        icon={<Target className="h-5 w-5 text-[#C8A46B] md:h-7 md:w-7" />}
                        title="현실적인 조언"
                        desc="이론에 그치지 않고 삶에 적용 가능한 방향을 제시합니다."
                    />

                    <FeatureItem
                        icon={<User className="h-5 w-5 text-[#C8A46B] md:h-7 md:w-7" />}
                        title="1:1 맞춤 상담"
                        desc="개인의 상황과 고민에 맞춘 밀도 높은 상담을 진행합니다."
                    />

                    <FeatureItem
                        icon={<ShieldCheck className="h-5 w-5 text-[#C8A46B] md:h-7 md:w-7" />}
                        title="신뢰와 전문성"
                        desc="오랜 경험과 전문성으로 신뢰할 수 있는 상담을 약속합니다."
                    />
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
                <div className="flex h-10 w-6 items-start justify-center rounded-full border border-[#C8A46B]/40 p-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#C8A46B] animate-bounce mt-1" />
                </div>
            </div>
        </section>
    );
}

function FeatureItem({
    icon,
    title,
    desc,
}: {
    icon: React.ReactNode;
    title: string;
    desc: string;
}) {
    return (
        <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-3 md:gap-5">
            <div className="mt-1">{icon}</div>

            <div>
                <h3 className="text-sm font-medium tracking-tight text-white antialiased md:text-xl">
                    {title}
                </h3>

                <p className="mt-2 hidden text-xs leading-5 tracking-wide text-white/70 antialiased md:block md:mt-3 md:text-base md:leading-7">
                    {desc}
                </p>
            </div>
        </div>
    );
}