'use client';

import { useState } from 'react';
import { login } from '@/lib/actions';
import { Loader2, EyeOff, Eye, ArrowRight } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const result = await login(formData);

        if (result && !result.success) {
            setError(result.message || '로그인 실패');
            setIsLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen w-full overflow-hidden bg-[#fbf8f4] font-sans selection:bg-[#c4a06a] selection:text-white">
            {/* SVG paper texture noise */}
            <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08] mix-blend-multiply" aria-hidden="true">
                <filter id="paperNoise">
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#paperNoise)" />
            </svg>

            {/* left top tree decor */}
            <Image
                src="/login/tree_rt.webp"
                alt="tree left top"
                width={300}
                height={300}
                className="pointer-events-none absolute top-10 left-0 z-0 h-auto w-[200px] opacity-40 md:w-[300px] md:opacity-50 lg:w-[300px]"
                style={{ height: 'auto' }}
            />

            {/* left bottom mountain */}
            <Image
                src="/login/mountain_lb.webp"
                alt="mountain left bottom"
                width={700}
                height={700}
                className="pointer-events-none absolute bottom-0 left-0 h-auto w-[220px] opacity-30 md:w-[400px] md:opacity-40 lg:w-[550px]"
                style={{ height: 'auto' }}
            />

            {/* right mountain */}
            <Image
                src="/login/mountain_r.webp"
                alt="mountain right"
                width={500}
                height={500}
                className="pointer-events-none absolute bottom-0 right-0 h-auto w-[200px] opacity-30 md:w-[350px] md:opacity-40 lg:w-[500px]"
                style={{ height: 'auto' }}
            />

            <section className="relative z-10 mx-auto flex min-h-screen max-w-[1440px] flex-col items-center justify-center gap-12 px-6 py-8 pt-32 md:gap-16 md:px-8 md:pt-40 lg:flex-row lg:gap-20 lg:px-16 lg:py-12 lg:pt-48">
                {/* LEFT */}
                <div className="relative flex w-full max-w-[620px] flex-col items-center lg:items-start z-10">
                    {/* title */}
                    <div className="relative text-center lg:text-left lg:w-fit">
                        <p className="mb-2 md:mb-4 text-[36px] md:text-[44px] lg:text-[52px] font-light font-serif leading-tight tracking-[-0.03em] relative z-10">
                            다시,
                        </p>

                        <h1 className="text-[32px] md:text-[44px] lg:text-[56px] font-light font-serif leading-[1.3] tracking-[-0.04em] relative z-10">
                            방문해주셔서<br />
                            감사합니다
                        </h1>

                        <div className="mt-5 md:mt-10 h-px w-16 md:w-24 bg-[#b8935f]/40 mx-auto lg:mx-0" />

                        <p className="mt-4 md:mt-10 text-[15px] md:text-lg leading-[1.8] md:leading-[2] text-[#5f584f]">
                            도원은 삶의 방향과 흐름을
                            <br />
                            차분히 함께 살펴봅니다.
                        </p>
                    </div>


                </div>

                {/* RIGHT CARD */}
                <div className="w-full max-w-[560px] pb-12 lg:pb-0 px-2 sm:px-0 self-center lg:self-auto">
                    <div className="rounded-3xl lg:rounded-[36px] border border-[#d8c9b5] bg-[#fbf8f4]/95 px-8 py-10 md:p-10 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur">
                        {/* heading */}
                        <div className="text-center">
                            <h2 className="text-[36px] md:text-[48px] font-light font-serif tracking-[-0.04em]">
                                로그인
                            </h2>

                            <p className="mt-3 md:mt-5 text-base md:text-lg text-[#6b645c]">
                                도원의 상담과 기록을 이어보세요.
                            </p>

                            <div className="mx-auto mt-6 md:mt-8 h-px w-16 md:w-20 bg-[#b8935f]/40" />
                        </div>

                        {/* form */}
                        <form onSubmit={handleSubmit} className="mt-8 md:mt-12 space-y-6 md:space-y-8">
                            {/* email */}
                            <div>
                                <label className="mb-2 md:mb-3 block text-sm text-[#4d463d]">
                                    이메일 주소
                                </label>

                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="이메일 주소를 입력해주세요"
                                    className="h-14 md:h-16 w-full rounded-2xl border border-[#ddd2c3] bg-white/60 px-5 text-[14px] md:text-[15px] outline-none transition focus:border-[#b8935f]"
                                />
                            </div>

                            {/* password */}
                            <div>
                                <label className="mb-2 md:mb-3 block text-sm text-[#4d463d]">
                                    비밀번호
                                </label>

                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="비밀번호를 입력해주세요"
                                        className="h-14 md:h-16 w-full rounded-2xl border border-[#ddd2c3] bg-white/60 px-5 pr-14 text-[14px] md:text-[15px] outline-none transition focus:border-[#b8935f]"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-[#8f8577] hover:text-[#b8935f] transition-colors"
                                    >
                                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg border border-red-100">{error}</p>
                            )}

                            {/* options */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-[#5c554c]">
                                    <input
                                        type="checkbox"
                                        className="h-3.5 w-3.5 md:h-4 md:w-4 rounded border-[#ccb28a] accent-[#b8935f]"
                                    />
                                    로그인 상태 유지
                                </label>

                                <Link
                                    href="/forgot-password"
                                    className="text-xs md:text-sm text-[#b8935f] transition hover:opacity-70"
                                >
                                    비밀번호 찾기
                                </Link>
                            </div>

                            {/* login button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group flex h-14 md:h-16 w-full items-center justify-center gap-3 rounded-2xl bg-[#b8935f] text-base md:text-lg font-medium text-white transition hover:opacity-90 disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <>
                                        도원으로 들어가기
                                        <ArrowRight
                                            size={18}
                                            className="transition group-hover:translate-x-1 md:w-5 md:h-5"
                                        />
                                    </>
                                )}
                            </button>
                        </form>



                        {/* signup */}
                        <div className="mt-8 md:mt-10 text-center text-[14px] md:text-[15px] text-[#6d655b]">
                            아직 도원 회원이 아니신가요?{" "}
                            <Link
                                href="/signup"
                                className="ml-1 text-[#b8935f] transition hover:opacity-70"
                            >
                                회원가입
                            </Link>
                        </div>
                    </div>

                    {/* footer */}
                    <div className="mt-6 md:mt-8 flex items-center justify-center gap-2 md:gap-3 text-xs md:text-sm text-[#8f8577]">
                        <div className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full border border-[#d4c2aa] text-[10px] md:text-xs">
                            ✓
                        </div>

                        입력하신 정보는 안전하게 보호됩니다.
                    </div>
                </div>
            </section>
        </main>
    );
}
