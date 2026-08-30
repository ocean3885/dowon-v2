'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [isValidSession, setIsValidSession] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;
        const supabase = createClient();

        const checkSession = async () => {
            const { data, error: userError } = await supabase.auth.getUser();
            if (!isMounted) return;
            setIsValidSession(!userError && Boolean(data.user));
            setIsChecking(false);
        };

        void checkSession();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('비밀번호는 8자 이상으로 입력해주세요.');
            return;
        }

        if (password !== confirmation) {
            setError('비밀번호가 서로 일치하지 않습니다.');
            return;
        }

        setIsLoading(true);
        const supabase = createClient();
        const { error: updateError } = await supabase.auth.updateUser({ password });
        setIsLoading(false);

        if (updateError) {
            console.error('Password update error:', updateError);
            setError('비밀번호를 변경하지 못했습니다. 링크가 만료되었다면 다시 요청해주세요.');
            return;
        }

        setIsComplete(true);
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fbf8f4] px-6 py-28 font-sans selection:bg-[#c4a06a] selection:text-white">
            <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#d9c5a7]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-[#b8935f]/15 blur-3xl" />

            <section className="relative z-10 w-full max-w-[560px]">
                <div className="rounded-3xl border border-[#d8c9b5] bg-[#fbf8f4]/95 px-7 py-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur md:rounded-[36px] md:p-12">
                    {isChecking ? (
                        <div className="py-16">
                            <Loader2 className="mx-auto animate-spin text-[#b8935f]" size={36} />
                            <p className="mt-5 text-sm text-[#6b645c]">재설정 링크를 확인하고 있습니다.</p>
                        </div>
                    ) : isComplete ? (
                        <>
                            <CheckCircle2 className="mx-auto text-[#b8935f]" size={48} strokeWidth={1.5} />
                            <h1 className="mt-6 font-serif text-3xl font-light tracking-[-0.04em] md:text-[42px]">변경되었습니다</h1>
                            <p className="mt-5 text-[15px] leading-7 text-[#6b645c]">새 비밀번호로 로그인하실 수 있습니다.</p>
                            <Link href="/login" className="mt-8 flex h-14 w-full items-center justify-center rounded-2xl bg-[#b8935f] text-base font-medium text-white transition hover:opacity-90 md:h-16">
                                로그인하기
                            </Link>
                        </>
                    ) : !isValidSession ? (
                        <>
                            <LockKeyhole className="mx-auto text-[#b8935f]" size={44} strokeWidth={1.4} />
                            <h1 className="mt-6 font-serif text-3xl font-light tracking-[-0.04em] md:text-[40px]">링크를 확인해주세요</h1>
                            <p className="mt-5 text-[15px] leading-7 text-[#6b645c]">재설정 링크가 만료되었거나 올바르지 않습니다.<br />새 링크를 요청해주세요.</p>
                            <Link href="/forgot-password" className="mt-8 flex h-14 w-full items-center justify-center rounded-2xl bg-[#b8935f] text-base font-medium text-white transition hover:opacity-90 md:h-16">
                                재설정 링크 다시 받기
                            </Link>
                        </>
                    ) : (
                        <>
                            <LockKeyhole className="mx-auto text-[#b8935f]" size={44} strokeWidth={1.4} />
                            <h1 className="mt-5 font-serif text-3xl font-light tracking-[-0.04em] md:text-[42px]">새 비밀번호 설정</h1>
                            <p className="mt-4 text-[15px] leading-7 text-[#6b645c]">앞으로 사용할 비밀번호를 입력해주세요.</p>
                            <div className="mx-auto mt-7 h-px w-16 bg-[#b8935f]/40" />

                            <form onSubmit={handleSubmit} className="mt-9 space-y-5 text-left">
                                <PasswordField
                                    id="password"
                                    label="새 비밀번호"
                                    value={password}
                                    onChange={setPassword}
                                    show={showPassword}
                                    onToggle={() => setShowPassword((value) => !value)}
                                />
                                <PasswordField
                                    id="password-confirmation"
                                    label="새 비밀번호 확인"
                                    value={confirmation}
                                    onChange={setConfirmation}
                                    show={showPassword}
                                    onToggle={() => setShowPassword((value) => !value)}
                                />

                                {error && <p role="alert" className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-center text-sm text-red-500">{error}</p>}

                                <button type="submit" disabled={isLoading} className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#b8935f] text-base font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 md:h-16">
                                    {isLoading ? <Loader2 className="animate-spin" size={24} /> : '비밀번호 변경하기'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}

function PasswordField({
    id,
    label,
    value,
    onChange,
    show,
    onToggle,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    show: boolean;
    onToggle: () => void;
}) {
    return (
        <div>
            <label htmlFor={id} className="mb-3 block text-sm text-[#4d463d]">{label}</label>
            <div className="relative">
                <input
                    id={id}
                    type={show ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder="8자 이상 입력해주세요"
                    className="h-14 w-full rounded-2xl border border-[#ddd2c3] bg-white/60 px-5 pr-14 text-[15px] outline-none transition focus:border-[#b8935f] md:h-16"
                />
                <button type="button" onClick={onToggle} aria-label={show ? '비밀번호 숨기기' : '비밀번호 보기'} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#8f8577] transition hover:text-[#b8935f]">
                    {show ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
            </div>
        </div>
    );
}
