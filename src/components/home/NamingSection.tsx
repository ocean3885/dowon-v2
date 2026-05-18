'use client'

import Image from 'next/image'
import {
  BadgeCheck,
  PenSquare,
  Scale,
  Waves,
  FileText,
  ArrowRight,
  Compass,
  Languages,
  Sparkles,
} from 'lucide-react'

export default function NamingSection() {
  return (
    <section className="w-full bg-[#FAF9F6] text-[#1a1a1a] font-serif antialiased overflow-hidden">
      {/* TOP: Concept Section */}
      <div className="flex flex-col lg:flex-row border-t border-[#E8E1D5]">
        {/* LEFT CONTENT */}
        <div className="w-full lg:w-[55%] bg-[#FDFBF7] px-8 py-16 sm:px-12 lg:px-20 lg:py-20 flex flex-col justify-center order-2 lg:order-1">
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px w-8 bg-[#C8A46B]" />
            <span className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-[#A6834D]">
              Naming Philosophy
            </span>
          </div>

          <h2 className="mb-8 text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.2] tracking-[-0.04em] text-[#111] break-keep">
            좋은 이름은<br />
            삶의 <span className="relative inline-block">
              <span className="relative z-10 text-[#C8A46B]">흐름</span>
              <span className="absolute bottom-2 left-0 h-3 w-full bg-[#C8A46B]/10 -z-0" />
            </span>를 담는 그릇입니다
          </h2>

          <p className="mb-12 max-w-xl text-lg leading-[1.8] text-[#4a4a4a] font-sans break-keep antialiased">
            도원은 단순한 호칭을 넘어, 사주의 흐름과 오행의 균형, 발음과 의미를 모두 고려합니다. 
            당신의 삶에 자연스럽게 스며들어 힘이 되어줄 최적의 이름을 제안합니다.
          </p>

          {/* FEATURES GRID */}
          <div className="grid grid-cols-1 gap-12 border-t border-[#E8E1D5] pt-16 sm:grid-cols-3">
            <FeatureCard
              icon={<FileText className="h-6 w-6" strokeWidth={1.2} />}
              title="전문적인 분석"
              desc="사주와 오행을 바탕으로 이름의 구조와 내포된 의미를 깊이 있게 분석합니다."
            />

            <FeatureCard
              icon={<Scale className="h-6 w-6" strokeWidth={1.2} />}
              title="조화로운 균형"
              desc="음양의 조화와 수리의 길흉을 고려하여 안정감 있는 이름을 제안합니다."
            />

            <FeatureCard
              icon={<BadgeCheck className="h-6 w-6" strokeWidth={1.2} />}
              title="의미와 품격"
              desc="바른 뜻과 아름다운 발음, 그리고 삶의 품격을 높여주는 이름을 짓습니다."
            />
          </div>
        </div>

        {/* RIGHT IMAGE AREA */}
        <div className="w-full lg:w-[45%] flex flex-col bg-[#111] border-l border-[#E8E1D5] order-1 lg:order-2">
          <div className="relative w-full h-[500px] lg:h-full min-h-[450px] lg:min-h-[600px] overflow-hidden bg-[#111] flex justify-end">
            <div className="relative w-[75%] sm:w-[65%] h-full shadow-2xl">
              <Image
                src="/home/naming_bg.webp"
                alt="작명 배경"
                fill
                className="object-cover object-right-bottom opacity-80"
                priority
              />
              {/* Edge Shadow */}
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#111] via-[#111]/40 to-transparent" />
            </div>

            {/* Floating Quote on LEFT black area */}
            <div className="absolute left-8 sm:left-12 lg:left-16 top-1/2 -translate-y-1/2 z-10 max-w-[260px] text-white">
              <div className="mb-6 h-[1px] w-12 bg-[#C8A46B]" />
              <h3 className="mb-4 text-xl sm:text-2xl font-light leading-snug tracking-tight text-[#C8A46B]/90 break-keep">
                이름은 단순한 호칭이 아니라,<br />
                삶의 기운을 담는<br />
                첫 번째 단추입니다.
              </h3>
              <p className="text-sm sm:text-base leading-relaxed text-white/60 font-sans font-light italic break-keep">
                "평생 불리울 당신의 가치를<br className="sm:hidden" /> 정성으로 빚어냅니다."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PROCESS SECTION: Dark Theme */}
      <div className="relative bg-[#1a1815] py-12 sm:py-16 text-white px-8 lg:px-24 -mt-px shadow-[0_-1px_0_0_#1a1815]">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full lg:w-1/3 h-full bg-[radial-gradient(circle_at_top_left,rgba(200,164,107,0.04),transparent_80%)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-start mb-10 lg:mb-12 gap-8 lg:gap-20 text-center lg:text-left">
            <div className="max-w-2xl mx-auto lg:mx-0">
              <div className="mb-4 flex lg:inline-flex items-center justify-center lg:justify-start gap-4">
                <span className="text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#C8A46B]">
                  Naming Process
                </span>
                <div className="h-px w-10 bg-[#C8A46B]/30" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-light tracking-tight text-[#E5D5BC] break-keep">
                좋은 이름을 짓는<br />
                도원의 <span className="text-white border-b border-[#C8A46B]/30">4단계 체계</span>
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-white/50 font-sans font-light break-keep max-w-sm lg:mx-0 mx-auto lg:mt-auto">
              신중하고 정밀한 분석을 거쳐, 당신의 운명에 가장 잘 어우러지는 이름을 제안합니다.
            </p>
          </div>

          {/* TIMELINE STEPS */}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 relative">
            {/* Desktop Connector Line */}
            <div className="absolute top-[50px] left-0 w-full h-px bg-white/5 hidden lg:block" />
            
            <StepCard
              number="01"
              icon={<Compass className="h-6 w-6" strokeWidth={1.2} />}
              title="사주 · 오행 분석"
              desc="사주의 오행 강약과 용신을 정밀 분석하여 이름의 방향성을 설정합니다."
            />

            <StepCard
              number="02"
              icon={<Scale className="h-6 w-6" strokeWidth={1.2} />}
              title="음양 · 수리 조화"
              desc="성씨와의 조화와 수리의 길흉을 고려하여 최적의 균형을 맞춥니다."
            />

            <StepCard
              number="03"
              icon={<Languages className="h-6 w-6" strokeWidth={1.2} />}
              title="발음 · 의미 검토"
              desc="발음의 명확성과 한자의 깊은 의미를 검토하여 품격을 높입니다."
            />

            <StepCard
              number="04"
              icon={<Sparkles className="h-6 w-6" strokeWidth={1.2} />}
              title="최종 이름 제안"
              desc="분석 결과를 바탕으로 최적의 이름을 제안하고 상세한 해설을 제공합니다."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="flex flex-col items-start sm:items-start text-left">
      <div className="mb-4 flex flex-row items-center gap-4 sm:mb-6 sm:flex-col sm:items-start sm:gap-0 2xl:flex-row 2xl:items-center 2xl:gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FAF9F6] border border-[#C8A46B]/20 text-[#A6834D]">
          {icon}
        </div>
        <h3 className="text-xl font-medium text-[#111] tracking-tight sm:mt-6 2xl:mt-0">{title}</h3>
      </div>
      <p className="text-[14px] leading-[1.7] text-[#6b645d] font-sans font-light break-keep">
        {desc}
      </p>
    </div>
  )
}

function StepCard({
  number,
  icon,
  title,
  desc,
}: {
  number: string
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="relative flex flex-col items-center lg:items-start text-center lg:text-left group">
      <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a1815] border border-[#C8A46B]/30 text-[#C8A46B] transition-all group-hover:bg-[#C8A46B] group-hover:text-[#1a1815] group-hover:border-[#C8A46B]">
        {icon}
      </div>
      
      <span className="mb-2 block font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#C8A46B]">
        Step {number}
      </span>
      
      <h4 className="mb-3 text-xl font-light text-[#E5D5BC]">{title}</h4>
      
      <p className="text-[13px] leading-[1.7] text-white/50 font-sans font-light break-keep">
        {desc}
      </p>
    </div>
  )
}
