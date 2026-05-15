'use client'

import Image from 'next/image'
import { ShieldCheck, User, Compass, CalendarDays, ArrowRight } from 'lucide-react'

export default function PhilosophySection() {
  return (
    <section className="w-full bg-[#FAF9F6] text-[#1a1a1a] font-serif antialiased overflow-hidden">
      {/* TOP: Main Content Section */}
      <div className="flex flex-col lg:flex-row">
        {/* LEFT COLUMN: Image & Slag */}
        <div className="w-full lg:w-[45%] flex flex-col bg-[#111] border-b lg:border-b-0 lg:border-r border-[#E8E1D5]">
          {/* IMAGE AREA */}
          <div className="relative w-full h-[500px] lg:h-auto lg:flex-1 overflow-hidden bg-[#111] flex justify-end">
            <div className="relative w-[75%] sm:w-[65%] h-full shadow-2xl">
              <Image
                src="/kjh.jpg"
                alt="도원 김종찬 원장"
                fill
                className="object-cover object-center opacity-90 transition-transform duration-1000"
                style={{ objectFit: 'cover' }}
                priority
              />
              {/* Edge Shadow */}
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#111] via-[#111]/50 to-transparent" />
            </div>

            {/* Floating Quote on LEFT black area */}
            <div className="absolute left-8 sm:left-12 lg:left-16 top-1/2 -translate-y-1/2 z-10 max-w-[240px] text-white">
              <div className="mb-6 h-[1px] w-12 bg-[#C8A46B]" />
              <h3 className="mb-4 text-xl sm:text-2xl font-light leading-snug tracking-tight text-[#C8A46B]/90">
                깊이 있는 해석,<br />
                현실적인 삶의 방향.
              </h3>
              <p className="text-sm sm:text-base leading-relaxed text-white/70 font-sans font-light italic">
                "당신의 삶에 담긴 고유한<br className="sm:hidden" /> 흐름을 읽어드립니다."
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Description & Features */}
        <div className="w-full lg:w-[55%] bg-[#FDFBF7] px-8 py-16 sm:px-12 lg:px-20 lg:py-20 flex flex-col justify-center">
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px w-8 bg-[#C8A46B]" />
            <span className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-[#A6834D]">
              Director of Dowon
            </span>
          </div>

          <h2 className="mb-8 text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.2] tracking-[-0.04em] text-[#111] break-keep">
            삶의 이치를 살피고,<br />
            당신만의 <span className="relative inline-block">
              <span className="relative z-10 text-[#C8A46B]">지혜</span>
              <span className="absolute bottom-2 left-0 h-3 w-full bg-[#C8A46B]/10 -z-0" />
            </span>를 함께 찾습니다
          </h2>

          <p className="mb-10 max-w-xl text-lg leading-[1.8] text-[#4a4a4a] font-sans break-keep antialiased">
            도원은 단순한 길흉 판단을 넘어, 삶의 구조와 흐름을 명리학적 관점에서 깊이 있게 해석합니다.
            현실에 발을 딛고 실질적인 변화를 이끌어낼 수 있는 최선의 방향을 제시하는 상담을 지향합니다.
          </p>

          {/* SIGNATURE AREA (Replacing Features Grid) */}
          <div className="border-t border-[#E8E1D5] pt-10">
            <p className="mb-3 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#A6834D]">
              Principal Consultant
            </p>
            <div className="flex items-baseline gap-4 mb-6">
              <h4 className="text-4xl sm:text-6xl font-light tracking-tighter text-[#111]">김종찬</h4>
              <span className="font-serif text-xl sm:text-3xl italic text-[#9c948c] font-light">Kim Jong Chan</span>
            </div>
            <p className="max-w-2xl text-[15px] leading-relaxed text-[#5a5a5a] font-sans break-keep antialiased">
              전통 명리학의 원리를 현대적 시각으로 재해석하여 명확한 해법을 제시합니다.
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM DARK SECTION: Philosophy Quote & Details */}
      <div className="relative bg-[#1a1815] py-16 sm:py-20 text-white px-8 lg:px-24 -mt-px shadow-[0_-1px_0_0_#1a1815]">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-full lg:w-1/3 h-full bg-[radial-gradient(circle_at_top_right,rgba(200,164,107,0.04),transparent_80%)] pointer-events-none" />

        <div className="relative grid grid-cols-1 gap-12 lg:grid-cols-12 max-w-7xl mx-auto">
          {/* QUOTE AREA */}
          <div className="lg:col-span-5">
            <div className="mb-6 inline-flex items-center gap-4">
              <span className="text-5xl font-serif text-[#C8A46B] leading-none">“</span>
              <div className="h-px w-12 bg-[#C8A46B]/40" />
            </div>

            <p className="mb-8 text-2xl sm:text-3xl font-light leading-[1.6] tracking-tight text-[#E5D5BC] break-keep">
              운(運)은 정해진 종착역이 아니라, 우리가 어떤 방향으로 노를 젓느냐에 따라 달라지는 <span className="text-white border-b border-[#C8A46B]/30 pb-1">삶의 물결</span>입니다.
            </p>

            <p className="text-base leading-relaxed text-white/50 font-sans font-light break-keep max-w-md">
              당신이 마주한 지금 이 순간의 고민이 더 나은 내일로 향하는 디딤돌이 될 수 있도록,
              진심을 다해 길을 비추겠습니다.
            </p>
          </div>

          {/* CAREER & EXPERTISE AREA */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div>
              <h4 className="mb-6 font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-[#C8A46B]">
                Career & Experience
              </h4>
              <ul className="space-y-4 font-sans text-[14px] font-light tracking-wide text-white/70">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#C8A46B]/40" />
                  <span>전통 명리학 및 사주 상담 전문가 (30년)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#C8A46B]/40" />
                  <span>주요 기업 경영 컨설팅 및 임원 사주 자문</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#C8A46B]/40" />
                  <span>한국 명리학 연구회 정회원 및 심사위원</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#C8A46B]/40" />
                  <span>명리학 인문 강의 및 다수의 칼럼 기고</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-[#C8A46B]">
                Areas of Expertise
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  '사주 명리 상담', '진로 · 직업 운세', '연애 · 궁합 상담',
                  '재물 · 사업 자문', '이사 · 택일 상담', '기업 성명학'
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[12px] text-white/80 transition-colors hover:bg-[#C8A46B]/10 hover:border-[#C8A46B]/30 font-sans"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
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
    <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF9F6] border border-[#C8A46B]/20 text-[#A6834D]">
        {icon}
      </div>

      <h3 className="mb-4 text-xl font-medium text-[#111] tracking-tight">{title}</h3>

      <p className="text-[14px] leading-[1.7] text-[#6b645d] font-sans font-light break-keep">
        {desc}
      </p>
    </div>
  )
}