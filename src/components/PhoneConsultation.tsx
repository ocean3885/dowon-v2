import React from 'react';
import Image from 'next/image';
import { PhoneCall } from 'lucide-react';

export default function PhoneConsultation() {
    return (
        <section className="container mx-auto max-w-5xl px-6 py-12 md:py-16">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col md:flex-row relative">
                {/* Image Section */}
                <div className="md:w-5/12 h-64 md:h-auto relative bg-stone-200 flex-shrink-0">
                    {/* 여기에 나중에 원하는 이미지를 넣을 수 있도록 준비된 레이아웃입니다 */}
                    <Image
                        src="/about4.jpg"
                        alt="전화상담 안내"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-stone-900/10 transition-colors hover:bg-transparent duration-500"></div>
                </div>

                {/* Content Section */}
                <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center relative bg-stone-50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white border border-stone-100 rounded-full flex items-center justify-center text-amber-700 shadow-sm">
                            <PhoneCall className="w-5 h-5" />
                        </div>
                        <span className="text-amber-700 font-bold tracking-widest text-sm uppercase">Contact Us</span>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-4 leading-snug">
                        방문이 어려우신가요?<br />
                        <span className="text-stone-700">전화 상담 가능합니다.</span>
                    </h2>
                    
                    <p className="text-stone-600 mb-8 leading-relaxed max-w-lg">
                        거리가 멀거나 바쁜 일정으로 직접 방문이 힘든 고객님들을 위해
                        방문 상담과 완전히 동일한 수준의 1:1 전문 전화 상담을 진행하고 있습니다.
                    </p>
                    
                    <div className="inline-flex justify-center bg-white border border-stone-200 px-6 py-5 md:px-8 md:py-6 rounded-xl shadow-sm w-full md:w-fit group hover:border-amber-600 hover:shadow-md transition-all">
                        <div className="flex flex-col items-center text-center">
                            <span className="text-sm md:text-base font-semibold text-stone-500 mb-1 md:mb-2 text-center">예약 및 상담 문의</span>
                            <span className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-stone-900 tracking-tight group-hover:text-amber-700 transition-colors text-center">
                                063-285-7255
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
