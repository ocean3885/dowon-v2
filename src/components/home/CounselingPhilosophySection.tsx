"use client";

import Image from "next/image";
import {
  Search,
  Scale,
  Leaf,
  User,
  Quote,
} from "lucide-react";

const philosophyItems = [
  {
    icon: Search,
    title: "깊이 있는 구조 해석",
    description:
      "표면적인 길흉 판단을 넘어 사주의 구조와 흐름을 깊이 있게 분석하여 인생의 방향성을 제시합니다.",
  },
  {
    icon: Scale,
    title: "현실 중심 상담",
    description:
      "이론에만 머무르지 않고 당신의 현실과 상황에 맞는 실질적인 조언을 드립니다.",
  },
  {
    icon: Leaf,
    title: "과장 없는 상담",
    description:
      "불안과 공포를 조장하지 않습니다. 있는 그대로의 흐름을 전하고 스스로의 선택을 존중합니다.",
  },
  {
    icon: User,
    title: "1:1 맞춤 상담",
    description:
      "개인의 성향, 환경, 시기를 종합적으로 고려하여 당신만을 위한 맞춤형 해석과 방향을 안내합니다.",
  },
];

export default function CounselingPhilosophySection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#070707] text-white font-serif py-12 md:py-16">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/home/section2_bg.webp"
          alt="Counseling Philosophy Background"
          fill
          className="object-cover"
          priority
        />
        {/* Subtle Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070707]/80 via-transparent to-[#070707]/80" />
      </div>

      {/* Background Texture */}
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_top,rgba(255,215,160,0.15),transparent_40%)] z-10" />

      {/* Ambient Glow */}
      <div className="absolute left-0 bottom-0 w-[500px] h-[500px] bg-[#C8A46B]/10 blur-3xl rounded-full" />

      <div className="relative z-20 mx-auto w-full max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-8 lg:gap-16 lg:grid-cols-[1fr_1.15fr]">
          {/* LEFT */}
          <div className="relative flex flex-col justify-center">
            <div>
              {/* Small Label */}
              <div className="mb-6 flex items-center justify-center lg:justify-start gap-4">
                <div className="h-px w-14 bg-[#C8A46B]/40" />
                <span className="font-sans text-sm font-medium tracking-[0.2em] text-[#C8A46B] antialiased">
                  도원의 상담 철학
                </span>
                <div className="h-px w-14 bg-[#C8A46B]/40" />
              </div>

              {/* Title */}
              <h2 className="leading-[1.3] md:leading-[1.4] tracking-[-0.04em] break-keep text-center lg:text-left">
                <span className="block text-3xl font-light text-white md:text-5xl lg:text-6xl antialiased">
                  도원은 단순한 길흉보다
                </span>

                <span className="mt-5 block text-3xl font-light text-[#C8A46B] md:text-5xl lg:text-6xl antialiased">
                  삶의 흐름과 구조를 봅니다
                </span>
              </h2>

              {/* Description */}
              <div className="mt-6 md:mt-8 space-y-4 text-base md:text-lg leading-relaxed text-white/70 antialiased break-keep text-center lg:text-left">
                <p>
                  사주명리는 운명을 단정짓는 것이 아니라,
                  <br className="hidden md:block" />
                  나의 흐름을 이해하고 선택을 돕는 도구입니다.
                </p>

                <p>
                  도원은 현실적인 해석과 방향 제시를 통해
                  <br className="hidden md:block" />
                  당신이 원하는 삶을 설계할 수 있도록 돕습니다.
                </p>
              </div>
            </div>

            {/* Bottom Decoration */}
            <div className="pointer-events-none absolute -bottom-10 -left-10 opacity-20">
              <div className="w-[260px] h-[260px] rounded-full border border-[#C8A46B]/30" />
              <div className="absolute inset-10 rounded-full border border-[#C8A46B]/20" />
              <div className="absolute inset-20 rounded-full border border-[#C8A46B]/10" />
            </div>

          </div>

          {/* RIGHT */}
          <div className="flex flex-col">
            {/* Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {philosophyItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-[24px] md:rounded-[30px] border border-[#C8A46B]/20 bg-white/[0.02] p-4 md:p-6 transition-all duration-500 hover:border-[#C8A46B]/40 hover:bg-white/[0.03]"
                  >
                    {/* Glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(200,164,107,0.08),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    {/* Icon */}
                    <div className="relative mb-6 flex h-14 w-14 mx-auto items-center justify-center rounded-full border border-[#C8A46B]/40">
                      <Icon
                        className="h-6 w-6 text-[#C8A46B]"
                        strokeWidth={1.5}
                      />
                    </div>

                    {/* Title */}
                    <h3 className="relative text-xl md:text-2xl font-light tracking-[-0.03em] text-[#C8A46B] text-center break-keep">
                      {item.title}
                    </h3>

                    <div className="mt-4 mx-auto h-px w-10 bg-[#C8A46B]/30" />

                    {/* Desc */}
                    <p className="relative mt-3 whitespace-pre-line text-sm md:text-base leading-relaxed text-white/60 antialiased text-center break-keep">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Quote Section - Top/Bottom Border Design */}
            <div className="relative mt-12 overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(200,164,107,0.05),transparent_70%)]" />

              <div className="relative z-10 border-y border-[#C8A46B]/20 py-10 md:py-12 text-center">
                <Quote className="absolute left-4 top-4 h-6 w-6 rotate-180 text-[#C8A46B]/40 md:left-8 md:top-6" />

                <p className="mx-auto max-w-4xl px-4 md:px-6 text-xl md:text-2xl leading-relaxed tracking-[-0.02em] text-[#f3e5d1] antialiased break-keep font-light">
                  도원은 당신의 삶이 더 단단하고 의미 있게 흐를 수 있도록, 진심을 다해 함께 고민하고 길을 제시하는 곳입니다.
                </p>

                <Quote className="absolute bottom-4 right-4 h-6 w-6 text-[#C8A46B]/40 md:right-8 md:bottom-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}