'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        const callbackUrl = new URL('/auth/callback', window.location.origin);
        callbackUrl.searchParams.set('next', '/reset-password');

        const supabase = createClient();
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
            email.trim(),
            { redirectTo: callbackUrl.toString() },
        );

        setIsLoading(false);

        if (resetError) {
            console.error('Password reset email error:', resetError);
            setError('재설정 메일을 보내지 못했습니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        setIsSent(true);
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fbf8f4] px-6 py-28 font-sans selection:bg-[#c4a06a] selection:text-white">
            <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#d9c5a7]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-[#b8935f]/15 blur-3xl" />

            <section className="relative z-10 w-full max-w-[560px]">
                <div className="rounded-3xl border border-[#d8c9b5] bg-[#fbf8f4]/95 px-7 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur md:rounded-[36px] md:p-12">
                    {isSent ? (
                        <div className="text-center">
                            <CheckCircle2 className="mx-auto text-[#b8935f]" size={48} strokeWidth={1.5} />
                            <h1 className="mt-6 font-serif text-3xl font-light tracking-[-0.04em] md:text-[42px]">
                                메일을 확인해주세요
                            </h1>
                            <p className="mt-5 break-words text-[15px] leading-7 text-[#6b645c]">
                                <span className="font-medium text-[#4d463d]">{email}</span> 주소로<br />
                                비밀번호 재설정 링크를 보냈습니다.
                            </p>
                            <p className="mt-4 text-sm leading-6 text-[#8f8577]">
                                가입 여부와 관계없이 동일하게 안내됩니다.<br />
                                메일이 없다면 스팸함도 확인해주세요.
                            </p>
                            <button
                                type="button"
                                onClick={() => setIsSent(false)}
                                className="mt-8 text-sm text-[#b8935f] transition hover:opacity-70"
                            >
                                다른 이메일로 다시 보내기
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="text-center">
                                <Mail className="mx-auto text-[#b8935f]" size={42} strokeWidth={1.4} />
                                <h1 className="mt-5 font-serif text-3xl font-light tracking-[-0.04em] md:text-[42px]">
                                    비밀번호 찾기
                                </h1>
                                <p className="mt-4 text-[15px] leading-7 text-[#6b645c] md:text-base">
                                    가입한 이메일을 입력하시면<br />비밀번호 재설정 링크를 보내드립니다.
                                </p>
                                <div className="mx-auto mt-7 h-px w-16 bg-[#b8935f]/40" />
                            </div>

                            <form onSubmit={handleSubmit} className="mt-9 space-y-6">
                                <div>
                                    <label htmlFor="email" className="mb-3 block text-sm text-[#4d463d]">
                                        이메일 주소
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        placeholder="이메일 주소를 입력해주세요"
                                        className="h-14 w-full rounded-2xl border border-[#ddd2c3] bg-white/60 px-5 text-[15px] outline-none transition focus:border-[#b8935f] md:h-16"
                                    />
                                </div>

                                {error && (
                                    <p role="alert" className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-center text-sm text-red-500">
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#b8935f] text-base font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 md:h-16"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={24} /> : <>
                                        재설정 메일 받기
                                        <ArrowRight size={19} className="transition group-hover:translate-x-1" />
                                    </>}
                                </button>
                            </form>
                        </>
                    )}

                    <div className="mt-8 text-center">
                        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-[#6d655b] transition hover:text-[#b8935f]">
                            <ArrowLeft size={16} /> 로그인으로 돌아가기
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
