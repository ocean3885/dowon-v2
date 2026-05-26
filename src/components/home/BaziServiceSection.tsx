'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Compass, FileText, Sparkles } from 'lucide-react';

const previewPillars = [
  { label: '년주', top: '甲', bottom: '子' },
  { label: '월주', top: '丁', bottom: '卯' },
  { label: '일주', top: '壬', bottom: '辰' },
  { label: '시주', top: '辛', bottom: '亥' },
];

const featureItems = [
  {
    icon: CalendarDays,
    title: '정확한 사주 원국',
    desc: '생년월일시를 바탕으로 네 기둥과 대운 흐름을 한눈에 확인합니다.',
  },
  {
    icon: Compass,
    title: '현재 운의 흐름',
    desc: '원국과 현재 대운, 세운이 만나는 지점을 차분히 살펴봅니다.',
  },
  {
    icon: FileText,
    title: '무료 AI 원국 해설',
    desc: '회원은 조회한 명식을 바탕으로 무료 원국 해설을 신청할 수 있습니다.',
  },
];

export default function BaziServiceSection() {
  return (
    <section className="relative overflow-hidden bg-[#1a1815] text-white font-serif antialiased">
      <div className="absolute inset-0">
        <Image
          src="/home/banner_bg_img800.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-28"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,15,12,0.96),rgba(18,15,12,0.86)_48%,rgba(18,15,12,0.68))]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:px-10 lg:py-24">
        <div className="flex flex-col justify-center">
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px w-10 bg-[#C8A46B]/50" />
            <span className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-[#C8A46B]">
              Dowon Bazi
            </span>
          </div>

          <h2 className="text-4xl font-light leading-[1.24] tracking-normal text-white sm:text-5xl lg:text-6xl break-keep">
            먼저 내 사주의<br />
            <span className="text-[#C8A46B]">원국과 흐름</span>을 확인하세요
          </h2>

          <p className="mt-7 max-w-xl font-sans text-base leading-8 text-white/68 break-keep sm:text-lg">
            도원 만세력은 사주 정국, 오행 균형, 대운과 세운의 흐름을 정리해 보여줍니다.
            조회한 명식은 무료 AI 원국 해설로 이어져 상담 전 자신의 흐름을 먼저 살필 수 있습니다.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/bazi"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#C8A46B] px-6 font-sans text-sm font-semibold text-[#1a1815] transition-colors hover:bg-[#d8b879]"
            >
              만세력 조회하기
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/my/bazi-consultations"
              className="inline-flex h-12 items-center justify-center rounded-md border border-white/18 px-6 font-sans text-sm font-semibold text-white/82 transition-colors hover:border-[#C8A46B]/50 hover:bg-white/5"
            >
              내 무료 해설 보기
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-[30px] border border-[#C8A46B]/22 bg-[#fbf8f1]/95 p-5 text-[#1f1913] shadow-[0_28px_90px_rgba(0,0,0,0.24)] sm:p-7">
            <div className="flex flex-col gap-5 border-b border-[#e7dac8] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-sans text-[11px] font-bold uppercase tracking-[0.24em] text-[#A6834D]">
                  Bazi Report
                </p>
                <h3 className="mt-2 font-serif text-2xl font-light tracking-normal text-[#1e1711]">
                  도원 명식 리포트
                </h3>
              </div>
              <span className="inline-flex h-8 w-fit items-center rounded-full bg-[#f1e4d1] px-3 font-sans text-xs font-semibold text-[#7a542a]">
                무료상담신청 가능
              </span>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-[#e6d9c8] bg-[#fffdf8]">
              <div className="grid grid-cols-4 border-b border-[#e6d9c8] text-center">
                {previewPillars.map((pillar) => (
                  <div key={pillar.label} className="border-r border-[#e6d9c8] py-3 last:border-r-0">
                    <p className="font-sans text-xs font-semibold text-[#7d6d5c]">{pillar.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 text-center">
                {previewPillars.map((pillar) => (
                  <div key={pillar.label} className="border-r border-[#e6d9c8] last:border-r-0">
                    <p className="border-b border-[#e6d9c8] py-4 font-serif text-4xl leading-none text-[#16110d] sm:text-5xl">
                      {pillar.top}
                    </p>
                    <p className="py-4 font-serif text-4xl leading-none text-[#16110d] sm:text-5xl">
                      {pillar.bottom}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {featureItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-[#e7dac8] bg-[#fcf7ef] p-4">
                    <Icon className="h-5 w-5 text-[#A6834D]" strokeWidth={1.5} />
                    <h4 className="mt-3 font-serif text-lg font-medium text-[#251d16]">{item.title}</h4>
                    <p className="mt-2 font-sans text-xs leading-5 text-[#6b5f54] break-keep">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#e7dac8] bg-[#f8efe3] px-4 py-4">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#A6834D]" strokeWidth={1.5} />
              <p className="font-sans text-sm leading-6 text-[#594c40] break-keep">
                AI 분석은 참고용으로 제공되며 오류가 있을 수 있습니다. 정확하고 깊이 있는 상담이 필요하시다면 도원의 유료 상담 서비스를 이용해 주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
