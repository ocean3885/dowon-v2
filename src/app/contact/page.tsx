'use client';

import React from 'react';
import BookingSection from '@/components/BookingSection';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Info, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
    const address = "전주시 완산구 전주객사4길 46, 715호";

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('주소가 복사되었습니다.');
        });
    };

    return (
        <main className="min-h-screen bg-stone-50">
            {/* Header */}
            <section className="relative pt-48 pb-20 px-6 bg-stone-100/50">
                <div className="container mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="text-amber-700 font-bold tracking-widest mb-4 uppercase text-sm">Location & Contact</p>
                        <h1 className="text-4xl md:text-5xl font-bold font-serif text-stone-900 mb-6">오시는 길</h1>
                        <div className="h-1 w-20 bg-stone-800 mx-auto" />
                    </motion.div>
                </div>
            </section>

            <section className="py-20 px-6 container mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-start">

                    {/* Visual / Map Placeholder */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                    >
                        <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-xl bg-stone-200 border border-stone-300">
                            {/* Interactive map substitution layout */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-stone-100">
                                <MapPin className="w-12 h-12 text-amber-700 mb-4" />
                                <h3 className="text-2xl font-bold text-stone-800 mb-2">도원사주작명원</h3>
                                <p className="text-stone-600 mb-8">{address}</p>

                                <div className="flex flex-wrap justify-center gap-3">
                                    <a
                                        href={`https://map.naver.com/v5/search/${encodeURIComponent(address)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-3 bg-[#03C75A] text-white rounded-lg hover:bg-[#02b351] transition font-medium text-sm flex items-center gap-2"
                                    >
                                        네이버 지도
                                    </a>
                                    <a
                                        href={`https://map.kakao.com/link/search/${encodeURIComponent(address)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-3 bg-[#FEE500] text-black rounded-lg hover:bg-[#fddf00] transition font-medium text-sm flex items-center gap-2"
                                    >
                                        카카오 맵
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                            <div className="flex items-start gap-4">
                                <Info className="w-6 h-6 text-amber-700 shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-amber-900 mb-2">주차 안내</h4>
                                    <p className="text-amber-800 leading-relaxed text-sm">
                                        건물내 주차장이 협소하오니 가급적 대중교통을 이용해주시거나,<br className="hidden md:block" />
                                        주변 유료 주차장을 이용해주시기 바랍니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Info Cards */}
                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        {/* Address Card */}
                        <div className="bg-white rounded-xl p-8 shadow-sm border border-stone-200">
                            <div className="flex items-center gap-3 mb-4">
                                <MapPin className="w-6 h-6 text-stone-400" />
                                <h3 className="text-lg font-bold text-stone-900">주소</h3>
                            </div>
                            <p className="text-xl text-stone-700 mb-4 font-medium">{address}</p>
                            <button
                                onClick={() => copyToClipboard(address)}
                                className="text-sm text-stone-500 hover:text-stone-900 underline transition"
                            >
                                주소 복사하기
                            </button>
                        </div>

                        {/* Contact Card */}
                        <div className="bg-white rounded-xl p-8 shadow-sm border border-stone-200">
                            <div className="flex items-center gap-3 mb-6">
                                <Phone className="w-6 h-6 text-stone-400" />
                                <h3 className="text-lg font-bold text-stone-900">연락처</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                                    <span className="text-stone-500">TEL</span>
                                    <a href="tel:063-285-7255" className="text-xl font-medium text-stone-800 hover:text-amber-700 transition">
                                        063-285-7255
                                    </a>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-stone-500">Mobile</span>
                                    <a href="tel:010-5518-7255" className="text-xl font-medium text-stone-800 hover:text-amber-700 transition">
                                        010-5518-7255
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Reservation Notice */}
                        <div className="bg-stone-900 rounded-xl p-8 text-white shadow-lg">
                            <div className="flex items-start gap-4">
                                <CheckCircle2 className="w-8 h-8 text-amber-500 shrink-0" />
                                <div>
                                    <h3 className="text-lg font-bold mb-2 text-amber-500">100% 예약제 운영</h3>
                                    <p className="text-stone-300 leading-relaxed mb-6">
                                        도원사주작명원은 고객님 한 분 한 분께 최선을 다하기 위해
                                        모든 상담을 예약제로 운영하고 있습니다.
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-stone-400">
                                        <Clock className="w-4 h-4" />
                                        <span>방문 전 반드시 전화나 문자로 예약 부탁드립니다.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </section>

            <BookingSection />
        </main>
    );
}
