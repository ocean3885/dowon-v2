'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { submitLead } from '@/lib/actions';
import { Send, CheckCircle, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function ConsultationForm() {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [notesLength, setNotesLength] = useState(0);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('submitting');

        const formData = new FormData(e.currentTarget);
        const result = await submitLead(formData);

        if (result.success) {
            setStatus('success');
            setMessage(result.message);
            (e.target as HTMLFormElement).reset();
        } else {
            setStatus('error');
            setMessage(result.message || '오류가 발생했습니다.');
        }
    };

    return (
        <section id="consultation-form" className="py-12 md:py-24 bg-stone-900 text-stone-100">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 font-display">상담 신청</h2>
                    <p className="text-stone-400 font-serif">
                        고민이 있으신가요? 내용을 남겨주시면 원장님이 직접 확인 후 연락드립니다.
                    </p>
                </div>

                <div className="bg-stone-800 p-8 md:p-12 rounded-2xl shadow-2xl border border-stone-700">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-stone-300">성함 *</label>
                                <input
                                    name="name"
                                    required
                                    className="w-full bg-stone-900 border border-stone-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-stone-400 focus:border-transparent outline-none transition-all"
                                    placeholder="예: 홍길동"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-stone-300">연락처 *</label>
                                <input
                                    name="contact"
                                    required
                                    className="w-full bg-stone-900 border border-stone-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-stone-400 focus:border-transparent outline-none transition-all"
                                    placeholder="예: 010-1234-5678"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-stone-300">생년월일 (음/양력 기재) *</label>
                                <input
                                    name="birthDate"
                                    required
                                    className="w-full bg-stone-900 border border-stone-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-stone-400 focus:border-transparent outline-none transition-all"
                                    placeholder="예: 1980.05.20 (양력)"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-stone-300">태어난 시간 (모를 경우 미입력)</label>
                                <input
                                    name="birthTime"
                                    className="w-full bg-stone-900 border border-stone-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-stone-400 focus:border-transparent outline-none transition-all"
                                    placeholder="예: 오후 2시 30분"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-stone-300">성별 *</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="gender" value="male" className="accent-amber-500 w-5 h-5" required />
                                        <span className="text-stone-300">남성</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="gender" value="female" className="accent-amber-500 w-5 h-5" required />
                                        <span className="text-stone-300">여성</span>
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-stone-300">상담 분야 *</label>
                                <select
                                    name="serviceType"
                                    required
                                    className="w-full bg-stone-900 border border-stone-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-stone-400 focus:border-transparent outline-none transition-all text-stone-100"
                                >
                                    <option value="">선택해주세요</option>
                                    <option value="saju">사주 명리</option>
                                    <option value="naming">신생아 작명</option>
                                    <option value="rename">개명</option>
                                    <option value="gunghap">궁합</option>
                                    <option value="date">택일</option>
                                    <option value="other">기타 상담</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-300">상담 내용 / 메모 *</label>
                            <textarea
                                name="notes"
                                rows={4}
                                className="w-full bg-stone-900 border border-stone-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-stone-400 focus:border-transparent outline-none transition-all resize-none"
                                placeholder="상담받고 싶은 내용을 적어주세요. (최대 500자)"
                                required
                                maxLength={500}
                                onChange={(e) => setNotesLength(e.target.value.length)}
                            ></textarea>
                            <div className="text-right text-xs text-stone-500 mt-1">
                                {notesLength} / 500자
                            </div>
                        </div>

                        <div className="text-center text-stone-400 text-sm py-2">
                            * 원장님께서 상담이 많아 답변이 늦어질 경우 <a href="tel:063-285-7255" className="text-amber-500 font-bold hover:underline">063-285-7255</a> 로 직접 전화문의 바랍니다.
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className={clsx(
                                "w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all",
                                status === 'success'
                                    ? "bg-green-600 text-white cursor-default"
                                    : "bg-stone-100 text-stone-900 hover:bg-white hover:scale-[1.01]"
                            )}
                        >
                            {status === 'submitting' && <Loader2 className="animate-spin" />}
                            {status === 'success' && <CheckCircle />}
                            {status === 'submitting' ? '제출 중...' : status === 'success' ? '제출 완료' : '상담 신청하기'}
                        </button>

                        {status === 'error' && (
                            <p className="text-red-400 text-center text-sm">{message}</p>
                        )}
                        {status === 'success' && (
                            <p className="text-green-400 text-center text-sm">{message}</p>
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
}
