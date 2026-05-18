'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
    const pathname = usePathname();

    const scrollToTopOnHome = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (pathname !== '/') return;

        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-[#151310] text-white font-sans antialiased">
            <div className="h-px w-full bg-[#C8A46B]/20" />

            <div className="mx-auto max-w-7xl px-6 py-9 lg:px-10">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                    <div className="mx-auto max-w-sm text-center lg:mx-0 lg:text-left">
                        <Link
                            href="/"
                            onClick={scrollToTopOnHome}
                            className="font-serif text-2xl font-light tracking-[-0.04em] text-[#E5D5BC] transition-colors hover:text-white"
                        >
                            도원작명철학원
                        </Link>

                        <p className="mt-3 text-sm font-light leading-relaxed text-white/40 break-keep">
                            정통 명리 상담과 작명, 개명을 통해 삶의 방향을 함께 살핍니다.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 text-center text-sm text-white/48 sm:gap-x-8 lg:grid lg:grid-cols-3 lg:gap-x-10 lg:gap-y-5 lg:text-left">
                        <InfoItem
                            icon={<MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />}
                            label="주소"
                        >
                            전주시 완산구 전주객사4길 46, 715호
                        </InfoItem>

                        <InfoItem
                            icon={<Phone className="h-3.5 w-3.5" strokeWidth={1.5} />}
                            label="전화"
                        >
                            <a href="tel:063-285-7255" className="transition-colors hover:text-[#C8A46B]">
                                063-285-7255
                            </a>
                            <span className="mx-2 text-white/20">/</span>
                            <span>010-5518-7255</span>
                        </InfoItem>

                        <InfoItem
                            icon={<Mail className="h-3.5 w-3.5" strokeWidth={1.5} />}
                            label="이메일"
                        >
                            <a href="mailto:ocean3885@naver.com" className="transition-colors hover:text-[#C8A46B]">
                                ocean3885@naver.com
                            </a>
                        </InfoItem>

                        <InfoItem label="대표">
                            김종찬
                        </InfoItem>

                        <InfoItem label="사업자등록번호">
                            109-21-77233
                        </InfoItem>
                    </div>
                </div>

                <div className="mt-8 border-t border-white/10 pt-5 text-center text-xs text-white/30 lg:text-left">
                    <p>Copyright © 도원작명철학원 All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

function InfoItem({
    icon,
    label,
    children,
}: {
    icon?: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="max-w-[280px] sm:max-w-none lg:max-w-[260px]">
            <div className="mb-1.5 flex items-center justify-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] text-[#C8A46B]/70 lg:justify-start">
                {icon}
                <span>{label}</span>
            </div>
            <div className="leading-relaxed break-keep">
                {children}
            </div>
        </div>
    );
}
