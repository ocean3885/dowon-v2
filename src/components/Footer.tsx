import React from 'react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-stone-950 text-stone-300 py-12 border-t border-stone-800">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-center space-y-4 text-center text-sm md:text-base font-light tracking-wide">

                    {/* Business Info Group 1 */}
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                        <Link href="/admin" className="hover:text-stone-100 transition-colors">
                            <span>상호 : 도원사주작명원</span>
                        </Link>
                        <span className="hidden md:inline text-stone-600">|</span>
                        <span>대표 : 김종찬</span>
                    </div>

                    {/* Address */}
                    <div>
                        <span>주소 : 전주시 완산구 전주객사4길 46, 715호</span>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                        <span>tel : 063-285-7255</span>
                        <span className="hidden md:inline text-stone-600">|</span>
                        <span>mobile : 010-5518-7255</span>
                    </div>

                    {/* Business Info Group 2 */}
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 opacity-80">
                        <span>e-mail : ocean3885@naver.com</span>
                        <span className="hidden md:inline text-stone-600">|</span>
                        <span>사업자등록번호 : 109-21-77233</span>
                    </div>

                    {/* Copyright */}
                    <div className="pt-8 mt-4 border-t border-stone-800 w-full max-w-2xl">
                        <p className="text-stone-500 text-xs">
                            Copyright © 도원사주작명원 All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
