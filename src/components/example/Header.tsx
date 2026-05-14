"use client";

import { Calendar, Phone } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto flex h-[84px] max-w-7xl items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center border border-[#C8A46B]/50 bg-[#111111]">
            <div className="h-8 w-8 border border-[#C8A46B]" />
          </div>

          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white">
              도원작명명리학원
            </h1>

            <p className="mt-1 text-sm text-[#C8A46B]">
              사주 · 작명 · 운의 흐름 분석
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden items-center gap-14 text-[17px] text-white/90 lg:flex">
          <a href="#" className="transition hover:text-[#C8A46B]">
            도원 소개
          </a>

          <a href="#" className="transition hover:text-[#C8A46B]">
            상담 분야
          </a>

          <a href="#" className="transition hover:text-[#C8A46B]">
            상담 후기
          </a>

          <a href="#" className="transition hover:text-[#C8A46B]">
            칼럼
          </a>

          <a href="#" className="transition hover:text-[#C8A46B]">
            상담 신청
          </a>
        </nav>

        {/* CTA */}
        <div className="hidden items-center gap-4 lg:flex">
          <button className="flex h-14 w-14 items-center justify-center rounded-full border border-[#C8A46B]/40 bg-white/[0.02] transition hover:border-[#C8A46B] hover:bg-white/[0.04]">
            <Phone className="h-5 w-5 text-[#C8A46B]" />
          </button>

          <button className="flex h-14 items-center gap-3 rounded-sm bg-[#C8A46B] px-8 text-base font-medium text-black transition hover:bg-[#d7b57c]">
            <Calendar className="h-5 w-5" />
            상담 예약
          </button>
        </div>
      </div>
    </header>
  );
}