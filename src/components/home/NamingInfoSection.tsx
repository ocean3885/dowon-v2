'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
    ArrowRight,
    Baby,
    User,
    Briefcase,
    Building2,
    Phone,
} from 'lucide-react'

const namingMenus = [
    {
        icon: Baby,
        title: '아이 이름 작명',
    },
    {
        icon: User,
        title: '개명 상담',
    },
    {
        icon: Briefcase,
        title: '사업자 상호 작명',
    },
    {
        icon: Building2,
        title: '브랜드 네이밍',
    },
]

export default function NamingInfoSection() {
    return (
        <section className="relative overflow-hidden bg-[#f6f2eb] py-8 md:py-12 lg:py-14 font-serif antialiased">
            {/* background image with opacity */}
            <div
                className="absolute inset-0 bg-cover bg-no-repeat bg-left sm:bg-center opacity-30 pointer-events-none"
                style={{ backgroundImage: 'url("/home/right_blur_bg_bright.webp")' }}
            />
            {/* subtle glow bg */}
            <div className="absolute left-0 top-0 h-full w-[40%] bg-[radial-gradient(circle_at_left,rgba(207,170,109,0.22),transparent_60%)] pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-[1600px] px-6 lg:px-12">
                {/* top */}
                <div className="grid gap-6 lg:gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                    {/* left text */}
                    <div className="flex items-center justify-center lg:justify-start">
                        <div className="w-full max-w-[480px] mx-auto lg:mx-0 text-center lg:text-left">
                            <div className="mb-3 flex items-center justify-center lg:justify-start gap-3">
                                <span className="font-sans text-xs md:text-sm font-medium tracking-[0.2em] text-[#b28a52] antialiased">
                                    이런 분들이 찾습니다
                                </span>
                                <div className="h-px w-8 bg-[#b28a52]/40" />
                            </div>

                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] leading-[1.3] lg:leading-[1.35] tracking-[-0.04em] text-[#231815] break-keep">
                                당신의 상황에 맞는
                                <br />
                                최적의 이름을 제안합니다
                            </h2>

                            <p className="mt-3 md:mt-4 font-sans text-sm sm:text-base lg:text-lg leading-relaxed tracking-[-0.02em] text-[#5c544f] break-keep">
                                인생의 중요한 순간마다,
                                <br />
                                이름은 새로운 시작의 힘이 됩니다.
                            </p>
                        </div>
                    </div>

                    {/* right cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {namingMenus.map((item, idx) => {
                            const Icon = item.icon

                            return (
                                <button
                                    key={idx}
                                    className="group flex h-auto py-3 sm:py-4 md:h-[76px] lg:h-[84px] items-center rounded-[14px] md:rounded-[18px] border border-[#ded4c8] bg-white/70 px-4 sm:px-5 lg:px-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#c7a46b] hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#faf7f2] border border-[#b28a52]/20">
                                            <Icon
                                                strokeWidth={1.5}
                                                className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-[#b28a52]"
                                            />
                                        </div>

                                        <span className="text-sm sm:text-base md:text-lg font-serif font-medium tracking-[-0.02em] text-[#3c312b]">
                                            {item.title}
                                        </span>
                                    </div>

                                    <ArrowRight className="ml-auto h-3.5 w-3.5 text-[#b28a52] transition-transform duration-300 group-hover:translate-x-1" />
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* bottom contact */}
                <div className="mt-8 md:mt-10 lg:mt-12 overflow-hidden rounded-[16px] md:rounded-[22px] border border-[#e4dbcf] bg-white/70 p-3 sm:p-5 md:p-6 shadow-[0_10px_25px_rgba(0,0,0,0.02)]">
                    <div className="grid gap-6 lg:gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                        {/* image */}
                        <div className="relative min-h-[160px] sm:min-h-[220px] lg:min-h-[280px] overflow-hidden rounded-[12px] md:rounded-[16px]">
                            <Image
                                src="/home/desk_hand_pen_bg_mini.webp"
                                alt="작명 상담"
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* content */}
                        <div className="flex flex-col justify-center px-1 sm:px-2 py-1">
                            <div className="mb-3 flex items-center justify-center lg:justify-start gap-3">
                                <span className="font-sans text-xs font-semibold tracking-[0.2em] text-[#b28a52] uppercase">
                                    CONTACT US
                                </span>
                                <div className="h-px w-8 bg-[#b28a52]/40" />
                            </div>

                            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-[28px] font-serif leading-[1.3] lg:leading-[1.35] tracking-[-0.04em] text-[#231815] break-keep text-center lg:text-left">
                                당신의 삶에 오래 남을 이름,
                                <br />
                                도원이 함께 고민합니다.
                            </h3>

                            <p className="mt-3 md:mt-4 font-sans text-xs sm:text-sm leading-relaxed text-[#5c544f] break-keep text-center lg:text-left">
                                소중한 이름에 담긴 의미와 기운을 세심하게 살피겠습니다.
                                <br />
                                상담은 예약제로 진행되며, 충분한 상담 시간을 보장합니다.
                            </p>

                            <div className="mt-4 md:mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-[1.1fr_270px]">
                                {/* phone card */}
                                <div className="rounded-[12px] md:rounded-[16px] border border-[#ebe2d7] bg-[#faf7f2] p-4 md:p-5 flex flex-col justify-center items-center text-left w-full min-w-[250px] overflow-hidden">
                                    <div className="flex flex-col items-start mx-auto">
                                        <div className="flex items-center gap-2 text-[#b28a52] whitespace-nowrap">
                                            <Phone className="h-3.5 w-3.5 shrink-0" />
                                            <span className="font-sans text-[clamp(0.7rem,2.5vw,0.8rem)] sm:text-xs md:text-sm font-medium">
                                                작명 상담 문의
                                            </span>
                                        </div>

                                        <div className="mt-2 text-[clamp(1.25rem,6vw,1.75rem)] sm:text-[clamp(1.25rem,3.5vw,1.75rem)] md:text-[clamp(1.5rem,3vw,2rem)] lg:text-[clamp(1.6rem,2.5vw,2.25rem)] font-serif font-semibold leading-none tracking-tight text-[#231815] whitespace-nowrap">
                                            063-285-7255
                                        </div>

                                        <p className="mt-2.5 font-sans text-[clamp(0.65rem,2.2vw,0.75rem)] sm:text-[11px] md:text-xs text-[#6c625d] whitespace-nowrap">
                                            상담 가능 시간 10:00 - 19:00 (평일,주말)
                                        </p>
                                    </div>
                                </div>

                                {/* buttons */}
                                <div className="flex flex-col gap-2">
                                    <Link href="/submit" className="group flex h-10 md:h-12 lg:h-[50px] items-center justify-center gap-2 rounded-[10px] md:rounded-[12px] bg-gradient-to-r from-[#7b5524] to-[#9b7137] font-sans text-sm sm:text-base font-medium tracking-tight text-white transition-all duration-300 hover:opacity-95">
                                        작명 상담 신청하기
                                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>

                                    <Link href="/services" className="group flex h-10 md:h-12 lg:h-[50px] items-center justify-center gap-2 rounded-[10px] md:rounded-[12px] border border-[#d9ccbc] bg-white font-sans text-sm sm:text-base font-medium tracking-tight text-[#5a4632] transition-all duration-300 hover:border-[#b28a52]">
                                        상담 절차 보기
                                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
