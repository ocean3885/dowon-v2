"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Calendar,
    EyeOff,
    ShieldCheck,
    LockKeyhole,
    Users,
    Loader2,
    Eye
} from "lucide-react";
import { signup, checkEmailDuplicate } from "@/lib/actions";

const agreementItems = [
    {
        key: 'terms',
        label: "[필수] 서비스 이용약관 동의",
        required: true,
        detail: "도원 서비스 이용을 위한 기본 약관입니다. 회원은 상담 신청, 상담 내역 확인 등 제공되는 서비스를 관련 법령과 운영 정책에 따라 이용해야 합니다.",
    },
    {
        key: 'privacy',
        label: "[필수] 개인정보 수집 및 이용 동의",
        required: true,
        detail: "회원가입 및 상담 서비스 제공을 위해 이름, 이메일, 연락처, 생년월일 등의 정보를 수집할 수 있으며, 수집된 정보는 서비스 제공과 본인 확인 목적으로 사용됩니다.",
    },
    {
        key: 'marketing',
        label: "[선택] 마케팅 정보 수신 동의",
        required: false,
        detail: "이벤트, 서비스 안내, 상담 관련 소식 등을 이메일 또는 문자로 받아볼 수 있습니다. 선택 항목이므로 동의하지 않아도 회원가입은 가능합니다.",
    },
] as const;

export default function SignupPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [agreements, setAgreements] = useState({
        terms: false,
        privacy: false,
        marketing: false,
    });
    const [openAgreement, setOpenAgreement] = useState<string | null>(null);
    const [emailCheck, setEmailCheck] = useState<{ status: 'idle' | 'loading' | 'success' | 'error', message: string }>({
        status: 'idle',
        message: ''
    });
    const isAllAgreed = Object.values(agreements).every(Boolean);

    const handleAgreementChange = (key: keyof typeof agreements, checked: boolean) => {
        setAgreements((current) => ({ ...current, [key]: checked }));
    };

    const handleAllAgreementChange = (checked: boolean) => {
        setAgreements({
            terms: checked,
            privacy: checked,
            marketing: checked,
        });
    };

    const handleCheckDuplicate = async () => {
        if (!email) {
            setEmailCheck({ status: 'error', message: '이메일을 먼저 입력해주세요.' });
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailCheck({ status: 'error', message: '올바른 이메일 형식이 아닙니다.' });
            return;
        }

        setEmailCheck({ status: 'loading', message: '' });
        try {
            const result = await checkEmailDuplicate(email);
            if (result.success) {
                setEmailCheck({ status: 'success', message: result.message });
            } else {
                setEmailCheck({ status: 'error', message: result.message });
            }
        } catch {
            setEmailCheck({ status: 'error', message: '오류가 발생했습니다.' });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);

        // Basic Validation
        const password = formData.get("password") as string;
        const passwordConfirm = formData.get("passwordConfirm") as string;
        const email = formData.get("email") as string;
        const name = formData.get("name") as string;

        if (!name || !email || !password) {
            setError("필수 정보를 모두 입력해주세요.");
            setIsLoading(false);
            return;
        }

        // Email Format Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("올바른 이메일 형식을 입력해주세요.");
            setIsLoading(false);
            return;
        }

        if (emailCheck.status !== 'success') {
            setError("이메일 중복 확인을 진행해주세요.");
            setIsLoading(false);
            return;
        }

        // Birth Date Validation (Optional but must be complete if entered)
        const birthDateVal = formData.get("birthDate") as string;
        if (birthDateVal && birthDateVal.length !== 10) {
            setError("생년월일을 올바른 형식(YYYY.MM.DD)으로 입력해주세요.");
            setIsLoading(false);
            return;
        }

        // Phone Number Validation (Optional but must be valid if entered)
        const phoneVal = formData.get("phone") as string;
        if (phoneVal) {
            const phoneRegex = /^[0-9]{10,11}$/;
            if (!phoneRegex.test(phoneVal)) {
                setError("휴대폰 번호를 숫자만 10~11자리로 입력해주세요.");
                setIsLoading(false);
                return;
            }
        }

        if (password !== passwordConfirm) {
            setError("비밀번호가 일치하지 않습니다.");
            setIsLoading(false);
            return;
        }

        if (!agreements.terms || !agreements.privacy) {
            setError("필수 약관에 동의해주세요.");
            setIsLoading(false);
            return;
        }

        const result = await signup(formData);

        if (result.success) {
            router.push("/signup/complete");
        } else {
            setError(result.message || "회원가입 실패");
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen overflow-hidden bg-[#fbf8f4] text-[#1d1b18] font-sans relative">

            <section className="relative flex min-h-screen flex-col lg:flex-row pt-20 lg:pt-24">
                {/* Section Background Image */}
                <div className="hidden lg:block absolute inset-0 pointer-events-none z-0">
                    <div className="absolute bottom-0 left-0 w-[600px] h-[450px] md:w-[700px] md:h-[500px] lg:w-[800px] lg:h-[600px]">
                        <Image
                            src="/login/signup_lefbg_fade.webp"
                            alt="background"
                            fill
                            className="object-contain object-left-bottom opacity-80"
                            priority
                        />
                        {/* soft fade from right and top */}
                        <div className="absolute inset-y-0 right-0 bg-gradient-to-l from-[#fbf8f4] via-[#fbf8f4]/90 to-transparent w-3/4 z-10" />
                        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-[#fbf8f4] via-[#fbf8f4]/60 to-transparent h-[60%] z-10" />
                    </div>
                </div>

                {/* left top mountain */}
                <Image
                    src="/login/mountain_lb.webp"
                    alt="mountain left top"
                    width={700}
                    height={700}
                    className="pointer-events-none absolute top-80 left-0 opacity-20 md:opacity-30 w-[220px] md:w-[400px] lg:w-[500px] z-0"
                    style={{ height: 'auto' }}
                />

                {/* right mountain */}
                <Image
                    src="/login/mountain_r.webp"
                    alt="mountain right"
                    width={500}
                    height={500}
                    className="pointer-events-none absolute bottom-0 right-0 opacity-30 md:opacity-40 w-[200px] md:w-[350px] lg:w-[500px] z-0"
                    style={{ height: 'auto' }}
                />

                {/* LEFT */}
                <div className="relative flex w-full flex-col justify-between overflow-hidden bg-transparent px-8 pt-16 lg:w-[44%] lg:px-16 lg:py-24">
                    {/* content */}
                    <div className="relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left">
                        <h1 className="text-[40px] font-light leading-[1.4] tracking-[-0.04em] text-[#191714] md:text-[56px] lg:text-[55px] font-serif">
                            도원과 함께,
                            <br />
                            당신의 <span className="text-[#b8935f]">흐름</span>을
                            <br />
                            깊이 있게 이해하세요
                        </h1>

                        <p className="mt-8 text-lg leading-[1.8] text-[#5d564d] md:mt-10 md:leading-[2]">
                            정확한 상담과 맞춤 서비스를 위해
                            <br />
                            회원가입을 진행해주세요.
                        </p>

                        {/* features */}
                        <div className="mt-12 hidden sm:flex sm:flex-row justify-center lg:justify-start sm:gap-4 md:gap-6 md:mt-16 lg:gap-4 xl:gap-8">
                            {[
                                {
                                    icon: "✺",
                                    title: "맞춤 상담",
                                    desc: "회원 정보를 바탕으로 더 깊이 있는 상담을 제공합니다.",
                                },
                                {
                                    icon: "⌘",
                                    title: "안전한 정보 관리",
                                    desc: "소중한 개인정보는 안전하게 보호되고 관리됩니다.",
                                },
                                {
                                    icon: "✦",
                                    title: "다양한 서비스 이용",
                                    desc: "만세력, 작명, 한자 등 도원의 모든 서비스를 이용할 수 있습니다.",
                                },
                            ].map((item, idx) => (
                                <div key={idx} className="lg:flex-1">
                                    <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0e8dc] text-[15px] text-[#b8935f]">
                                            {item.icon}
                                        </div>
                                        <h3 className="text-base font-medium">{item.title}</h3>
                                    </div>

                                    <p className="whitespace-pre-line text-[14px] leading-[1.6] text-[#6a635a] md:leading-[1.7]">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* spacer for bottom image if needed */}
                    <div className="relative z-10 h-20 lg:h-32" />
                </div>

                {/* RIGHT */}
                <div className="flex w-full items-center justify-center lg:justify-start px-6 pb-10 lg:w-[56%] lg:p-12 xl:p-20 bg-transparent">
                    <div className="w-full max-w-[700px] rounded-[32px] border border-[#e8dfd3] bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur md:p-10 lg:p-12 xl:p-16">
                        {/* heading */}
                        <div className="text-center">
                            <h2 className="text-[36px] font-light tracking-[-0.04em] md:text-[44px] font-serif">
                                회원가입
                            </h2>

                            <div className="mx-auto mt-5 flex items-center justify-center gap-3">
                                <div className="h-px w-12 bg-[#d7c3a3]" />
                                <div className="h-2 w-2 rounded-full bg-[#b8935f]" />
                                <div className="h-px w-12 bg-[#d7c3a3]" />
                            </div>
                        </div>

                        {/* form */}
                        <form onSubmit={handleSubmit} className="mt-8 space-y-6 md:mt-10">
                            {/* 기본 정보 */}
                            <div>
                                <h3 className="mb-4 text-[17px] font-serif font-medium border-l-4 border-[#b8935f] pl-3 text-[#332f2a]">기본 정보</h3>

                                <div className="space-y-3">
                                    <InputRow
                                        label="이름"
                                        name="name"
                                        placeholder="이름을 입력해주세요."
                                        required
                                    />

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1">
                                            <InputRow
                                                label="이메일 (아이디)"
                                                name="email"
                                                type="email"
                                                placeholder="이메일 주소를 입력해주세요."
                                                required
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    if (emailCheck.status !== 'idle') {
                                                        setEmailCheck({ status: 'idle', message: '' });
                                                    }
                                                }}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleCheckDuplicate}
                                            disabled={emailCheck.status === 'loading'}
                                            className="sm:mt-[27px] h-[50px] rounded-xl border border-[#d9cec0] px-5 text-sm transition hover:border-[#b8935f] hover:bg-[#fbf8f4] disabled:opacity-50 whitespace-nowrap"
                                        >
                                            {emailCheck.status === 'loading' ? <Loader2 className="animate-spin" size={16} /> : "중복확인"}
                                        </button>
                                    </div>

                                    {emailCheck.message && (
                                        <p className={`text-xs mt-1 ml-1 ${emailCheck.status === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {emailCheck.message}
                                        </p>
                                    )}

                                    <PasswordRow
                                        label="비밀번호"
                                        name="password"
                                        placeholder="영문, 숫자, 특수문자 포함 8~20자"
                                        required
                                        showPassword={showPassword}
                                        onTogglePassword={() => setShowPassword(!showPassword)}
                                    />

                                    <PasswordRow
                                        label="비밀번호 확인"
                                        name="passwordConfirm"
                                        placeholder="비밀번호를 다시 입력해주세요."
                                        required
                                        showPassword={showPassword}
                                        onTogglePassword={() => setShowPassword(!showPassword)}
                                    />
                                </div>
                            </div>

                            {/* 추가 정보 (UI Only for now as backend only takes email/name/pass) */}
                            <div>
                                <h3 className="mb-4 text-[17px] font-serif font-medium border-l-4 border-[#b8935f]/40 pl-3 text-[#332f2a]">
                                    추가 정보 (선택)
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputRow
                                        label="휴대폰 번호"
                                        name="phone"
                                        placeholder="- 없이 숫자만"
                                    />

                                    <div>
                                        <label className="mb-2 block text-xs font-medium text-[#4f483f]">
                                            생년월일
                                        </label>

                                        <div className="relative">
                                            <input
                                                name="birthDate"
                                                type="text"
                                                placeholder="YYYY.MM.DD"
                                                value={birthDate}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, "");
                                                    if (value.length <= 8) {
                                                        let formatted = value;
                                                        if (value.length > 4 && value.length <= 6) {
                                                            formatted = `${value.slice(0, 4)}.${value.slice(4)}`;
                                                        } else if (value.length > 6) {
                                                            formatted = `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6)}`;
                                                        }
                                                        setBirthDate(formatted);
                                                    }
                                                }}
                                                className="h-[50px] w-full rounded-xl border border-[#e4dbcf] bg-[#fcfbf8] px-4 pr-10 text-sm outline-none transition focus:border-[#b8935f]"
                                            />

                                            <Calendar
                                                size={16}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8f8577]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 약관 */}
                            <div>
                                <h3 className="mb-4 text-[17px] font-serif font-medium border-l-4 border-[#b8935f]/40 pl-3 text-[#332f2a]">약관 동의</h3>

                                <div className="space-y-3 rounded-2xl border border-[#eee6db] bg-[#fcfbf8] p-5">
                                    <label className="flex items-center gap-3 text-[15px] cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 accent-[#b8935f]"
                                            checked={isAllAgreed}
                                            onChange={(event) => handleAllAgreementChange(event.target.checked)}
                                        />
                                        <span className="group-hover:text-[#b8935f] transition-colors font-medium">전체 동의합니다.</span>
                                    </label>

                                    <div className="h-px bg-[#ece3d8]" />

                                    {agreementItems.map((item) => (
                                        <div
                                            key={item.key}
                                            className="space-y-2"
                                        >
                                            <div className="flex items-center justify-between">
                                                <label className="flex items-center gap-3 text-[15px] text-[#4f483f] cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 accent-[#b8935f]"
                                                        required={item.required}
                                                        checked={agreements[item.key]}
                                                        onChange={(event) => handleAgreementChange(item.key, event.target.checked)}
                                                    />
                                                    {item.label}
                                                </label>

                                                <button
                                                    type="button"
                                                    onClick={() => setOpenAgreement((current) => current === item.key ? null : item.key)}
                                                    className="text-sm text-[#8b7d69] underline"
                                                >
                                                    {openAgreement === item.key ? "닫기" : "보기"}
                                                </button>
                                            </div>
                                            {openAgreement === item.key && (
                                                <div className="rounded-xl border border-[#eadfce] bg-white/70 px-4 py-3 text-sm leading-6 text-[#6a635a]">
                                                    {item.detail}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* feedback messages */}
                            {error && (
                                <p className="text-red-500 text-sm text-center bg-red-50 py-3 rounded-xl border border-red-100">{error}</p>
                            )}

                            {/* submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="h-[54px] w-full rounded-2xl bg-[#b8935f] text-base font-medium text-white transition hover:opacity-90 shadow-lg shadow-[#b8935f]/20 flex items-center justify-center disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "회원가입 완료"}
                            </button>

                            {/* login link */}
                            <div className="text-center text-[15px] text-[#6d655b]">
                                이미 계정이 있으신가요?{" "}
                                <Link
                                    href="/login"
                                    className="font-medium text-[#9b7744] hover:underline"
                                >
                                    로그인
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* bottom benefits */}
            <section className="border-t border-[#e7ddd0] bg-[#f7f2eb] relative z-20">
                <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 px-6 py-10 md:grid-cols-3 md:py-12">
                    {[
                        {
                            icon: <ShieldCheck size={28} />,
                            title: "안전한 개인정보 보호",
                            desc: "SSL 보안으로 안전하게 보호됩니다.",
                        },
                        {
                            icon: <LockKeyhole size={28} />,
                            title: "회원 정보 비공개",
                            desc: "회원님의 정보는 비공개로 보호됩니다.",
                        },
                        {
                            icon: <Users size={28} />,
                            title: "언제든지 탈퇴 가능",
                            desc: "언제든지 자유롭게 탈퇴하실 수 있습니다.",
                        },
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-5 md:px-6 md:border-r border-[#e4d8ca] last:border-none"
                        >
                            <div className="text-[#b8935f] shrink-0">{item.icon}</div>

                            <div>
                                <h4 className="font-medium">{item.title}</h4>

                                <p className="mt-1 text-sm text-[#6f675d]">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}

/* input row component */
function InputRow({
    label,
    placeholder,
    name,
    type = "text",
    required = false,
    value,
    onChange,
}: {
    label: string;
    placeholder: string;
    name?: string;
    type?: string;
    required?: boolean;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div>
            <label className="mb-2 block text-xs font-medium text-[#4f483f]">
                {label} {required && <span className="text-red-400">*</span>}
            </label>

            <input
                name={name}
                type={type}
                required={required}
                {...(value !== undefined ? { value, onChange } : {})}
                placeholder={placeholder}
                className="h-[50px] w-full rounded-xl border border-[#e4dbcf] bg-[#fcfbf8] px-4 text-sm outline-none transition focus:border-[#b8935f] placeholder:text-[#ccc2b5]"
            />
        </div>
    );
}

/* password row component */
function PasswordRow({
    label,
    placeholder,
    name,
    required = false,
    showPassword,
    onTogglePassword
}: {
    label: string;
    placeholder: string;
    name?: string;
    required?: boolean;
    showPassword?: boolean;
    onTogglePassword?: () => void;
}) {
    return (
        <div>
            <label className="mb-2 block text-xs font-medium text-[#4f483f]">
                {label} {required && <span className="text-red-400">*</span>}
            </label>

            <div className="relative">
                <input
                    name={name}
                    type={showPassword ? "text" : "password"}
                    required={required}
                    placeholder={placeholder}
                    className="h-[50px] w-full rounded-xl border border-[#e4dbcf] bg-[#fcfbf8] px-4 pr-10 text-sm outline-none transition focus:border-[#b8935f] placeholder:text-[#ccc2b5]"
                />

                <button
                    type="button"
                    onClick={onTogglePassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8f8577] hover:text-[#b8935f] transition-colors"
                >
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
            </div>
        </div>
    );
}
