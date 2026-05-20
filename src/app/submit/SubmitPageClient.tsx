'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
    ArrowRight,
    BriefcaseBusiness,
    Check,
    Compass,
    Heart,
    Home,
    Eye,
    EyeOff,
    LineChart,
    PenLine,
    Sparkles,
} from 'lucide-react';
import { submitApplication } from '@/lib/actions';
import { createClient } from '@/utils/supabase/client';
import clsx from 'clsx';

const serviceOptions = [
    {
        value: 'saju',
        title: '사주 종합 상담',
        description: '인생 전반의 흐름과 성향, 현재 시기와 미래 방향을 종합적으로 분석합니다.',
        icon: Compass,
    },
    {
        value: 'love',
        title: '연애 · 결혼 상담',
        description: '연애운, 궁합, 결혼 시기 등 관계의 흐름과 조화를 중심으로 상담합니다.',
        icon: Heart,
    },
    {
        value: 'career',
        title: '진로 · 직업 상담',
        description: '적성과 진로 방향, 직업 선택, 이직·창업 시기 등을 분석하고 조언합니다.',
        icon: BriefcaseBusiness,
    },
    {
        value: 'wealth',
        title: '사업 · 재물 상담',
        description: '사업운, 재물 흐름, 투자 시기, 위험 요소 등을 분석하고 방향을 제시합니다.',
        icon: LineChart,
    },
    {
        value: 'naming',
        title: '작명 · 개명 상담',
        description: '사주의 흐름과 오행의 균형, 발음과 의미를 함께 고려하여 이름을 제안합니다.',
        icon: PenLine,
    },
    {
        value: 'moving',
        title: '이사 · 택일 상담',
        description: '이사, 개업, 계약, 결혼 등 중요한 일의 좋은 시기를 선택하는 상담입니다.',
        icon: Home,
    },
];

const concernPlaceholders: Record<string, string> = {
    saju: '예) 최근 전반적인 운의 흐름, 건강·가족·일의 방향에서 특히 궁금한 부분을 적어주세요.',
    love: '예) 현재 관계 상황, 만난 기간, 궁합에서 특히 알고 싶은 부분을 적어주세요.',
    career: '예) 현재 직업/전공, 이직·창업 고민, 적성이나 시기에 대해 궁금한 점을 적어주세요.',
    wealth: '예) 사업, 투자, 계약, 금전 흐름에서 판단이 필요한 상황을 적어주세요.',
    naming: '예) 작명 또는 개명 목적, 원하는 이름의 분위기, 가족이 중요하게 보는 기준을 적어주세요.',
    moving: '예) 이사·개업·계약·결혼 등 택일이 필요한 일과 희망 시기 범위를 적어주세요.',
};

const initialState = {
    success: false,
    message: '',
};

function normalizePhoneNumber(value: string) {
    return value.replace(/\D/g, '').slice(0, 11);
}

function formatPhoneNumber(value: string) {
    const digits = normalizePhoneNumber(value);

    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

type Applicant = {
    name: string;
    phone: string;
    email: string;
};

type SubmitPageClientProps = {
    initialApplicant: Applicant;
    initialIsLoggedIn: boolean;
};

export default function SubmitPageClient({ initialApplicant, initialIsLoggedIn }: SubmitPageClientProps) {
    const [state, formAction] = useActionState(submitApplication, initialState);
    const [selectedService, setSelectedService] = useState('');
    const [isCheckingAuth, setIsCheckingAuth] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);
    const [applicant, setApplicant] = useState(initialApplicant);
    const [clientMessage, setClientMessage] = useState('');

    useEffect(() => {
        const loadApplicant = async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    return;
                }

                setIsLoggedIn(true);

                const { data: member } = await supabase
                    .from('members')
                    .select('name, phone, email')
                    .eq('id', user.id)
                    .maybeSingle();

                setApplicant({
                    name: member?.name || user.user_metadata?.full_name || '',
                    phone: member?.phone || user.user_metadata?.phone || '',
                    email: member?.email || user.email || '',
                });
            } finally {
                setIsCheckingAuth(false);
            }
        };

        loadApplicant();
    }, []);

    const validateBeforeSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        setClientMessage('');

        const form = event.currentTarget;

        if (!form.reportValidity()) {
            event.preventDefault();
            setClientMessage('필수 항목을 입력해주세요.');
            return;
        }

        const formData = new FormData(form);
        const getValue = (name: string) => String(formData.get(name) || '').trim();
        const serviceType = String(formData.get('serviceType') || '');
        const namingFamilyName = String(formData.get('namingFamilyName') || '').trim();
        const applicationPassword = getValue('applicationPassword');
        const applicantPhone = getValue('applicantPhone');

        const validateTarget = (prefix: 'target1' | 'target2') => {
            const birthDate = getValue(`${prefix}BirthDate`);
            const calendarType = getValue(`${prefix}CalendarType`);
            const gender = getValue(`${prefix}Gender`);
            const birthTimeAccuracy = getValue(`${prefix}BirthTimeAccuracy`) || (prefix === 'target1' ? 'exact' : '');
            const birthTimePeriod = getValue(`${prefix}BirthTimePeriod`);
            const birthTimeHour = getValue(`${prefix}BirthTimeHour`);
            const hasAnyValue = Boolean(
                getValue(`${prefix}Name`) ||
                birthDate ||
                calendarType ||
                gender ||
                birthTimeAccuracy ||
                birthTimePeriod ||
                birthTimeHour
            );

            if (!hasAnyValue) return '';

            if (!birthDate || !calendarType || !gender || !birthTimeAccuracy) {
                return prefix === 'target1'
                    ? '상담대상 정보를 입력해주세요.'
                    : '추가 상담대상을 입력하는 경우 생년월일, 성별, 출생 시간 정보를 함께 입력해주세요.';
            }

            if (birthTimeAccuracy !== 'unknown' && (!birthTimePeriod || !birthTimeHour)) {
                return prefix === 'target1'
                    ? '상담대상의 출생 시간을 입력해주세요. 모르는 경우 "모르겠어요"를 선택해주세요.'
                    : '추가 상담대상의 출생 시간을 입력해주세요. 모르는 경우 "모르겠어요"를 선택해주세요.';
            }

            return '';
        };

        let message = '';
        const target1Message = validateTarget('target1');
        const target2Message = validateTarget('target2');

        if (applicantPhone.length < 10 || applicantPhone.length > 11) {
            message = '전화번호는 숫자 10~11자리로 입력해주세요.';
        } else if (!isLoggedIn && applicationPassword && applicationPassword.length < 4) {
            message = '신청서 확인 비밀번호는 4자 이상 입력해주세요.';
        } else if (target1Message) {
            message = target1Message;
        } else if (target2Message) {
            message = target2Message;
        } else if (!serviceType) {
            message = '상담 종류를 선택해주세요.';
        } else if (serviceType === 'naming' && !namingFamilyName) {
            message = '작명 · 개명 상담은 성(姓)을 입력해주세요.';
        }

        if (message) {
            event.preventDefault();
            setClientMessage(message);
        }
    };

    const feedbackMessage = clientMessage || state.message;
    const isFeedbackSuccess = !clientMessage && state.success;

    return (
        <main className="min-h-screen bg-[#fbfaf8] text-[#211b16]">
            <section className="relative min-h-[420px] overflow-hidden bg-[#16130f] pt-20 text-white md:min-h-[460px]">
                <Image
                    src="/counseling/subimage3.webp"
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover opacity-58 md:opacity-70"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,13,10,0.95)_0%,rgba(16,13,10,0.74)_12%,rgba(16,13,10,0.25)_100%)]" />
                <div className="absolute left-[-120px] top-10 h-80 w-80 rounded-full border border-[#b1844d]/15" />
                <div className="absolute left-[-82px] top-16 h-56 w-56 rounded-full border border-[#b1844d]/15" />

                <div className="relative mx-auto flex min-h-[340px] max-w-7xl items-center px-6 py-16 lg:px-10">
                    <div className="max-w-xl">
                        <p className="font-serif text-lg text-[#c69a61]">상담 신청</p>
                        <h1 className="mt-7 font-serif text-4xl font-light leading-[1.35] tracking-normal text-white break-keep md:text-6xl">
                            당신의 이야기를<br />
                            <span className="text-[#c69a61]">차분히</span> 들려주세요
                        </h1>
                        <div className="mt-7 h-px w-16 bg-[#c69a61]" />
                        <p className="mt-7 max-w-md text-sm leading-8 text-white/78 break-keep md:text-base">
                            입력해주신 정보는 상담 준비를 위한 용도로만 사용되며, 안전하게 보호됩니다.
                        </p>
                    </div>
                </div>
            </section>

            <section className="px-5 py-8 sm:px-6 lg:px-10">
                <div className="mx-auto mb-4 flex max-w-6xl flex-col gap-3 rounded-md border border-[#ded4c8] bg-white/72 px-5 py-4 text-sm shadow-[0_10px_30px_rgba(70,54,36,0.05)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <p className="font-medium text-[#4f4338]">이미 상담신청 하셨나요?</p>
                    <Link
                        href={isLoggedIn ? '/my/applications' : '/submit/lookup'}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#b1844d] px-4 text-sm font-semibold text-[#6f4d27] transition-colors hover:bg-[#fffaf2]"
                    >
                        내 신청서 확인하기
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                <form action={formAction} onSubmit={validateBeforeSubmit} className="mx-auto max-w-6xl rounded-lg border border-[#ded4c8] bg-white/78 p-6 shadow-[0_18px_55px_rgba(70,54,36,0.08)] sm:p-8 lg:p-10">
                    <FormRow title="신청인 정보" description="상담 예약 및 신청서 확인에 필요한 정보를 입력해주세요.">
                        <div className="grid gap-6 lg:grid-cols-2">
                            <TextField
                                label="이름"
                                name="applicantName"
                                placeholder="신청인 이름을 입력해주세요"
                                required
                                value={applicant.name}
                                onChange={(value) => setApplicant((current) => ({ ...current, name: value }))}
                            />
                            <PhoneField
                                name="applicantPhone"
                                value={applicant.phone}
                                onChange={(value) => setApplicant((current) => ({ ...current, phone: normalizePhoneNumber(value) }))}
                            />
                            <TextField
                                label="이메일"
                                name="applicantEmail"
                                type="email"
                                placeholder="예) dowon@email.com"
                                optional
                                value={applicant.email}
                                onChange={(value) => setApplicant((current) => ({ ...current, email: value }))}
                            />
                            {!isCheckingAuth && !isLoggedIn && (
                                <PasswordField
                                    label="신청서 확인 비밀번호"
                                    name="applicationPassword"
                                    placeholder="비회원 신청서 확인용 비밀번호"
                                    required
                                />
                            )}
                        </div>
                    </FormRow>

                    <FormRow title="상담대상 정보" description="상담을 받을 분의 생년월일시와 성별을 입력해주세요.">
                        <div className="grid gap-6 lg:grid-cols-2">
                            <TextField label="상담대상 이름" name="target1Name" placeholder="이름을 입력해주세요" optional className="lg:col-span-2" />
                            <div className="lg:col-span-2">
                                <FieldLabel required>생년월일</FieldLabel>
                                <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
                                    <input
                                        name="target1BirthDate"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={10}
                                        placeholder="YYYY.MM.DD"
                                        required
                                        onInput={formatBirthDateInput}
                                        className={inputClassName}
                                    />
                                    <Segment name="target1CalendarType" value="solar" label="양력" defaultChecked />
                                    <Segment name="target1CalendarType" value="lunar" label="음력" />
                                    <Segment name="target1CalendarType" value="leap_lunar" label="음력윤달" />
                                </div>
                            </div>
                            <div>
                                <FieldLabel required>출생 시간</FieldLabel>
                                <BirthTimeFields prefix="target1" defaultChecked />
                            </div>
                            <div>
                                <FieldLabel required>성별</FieldLabel>
                                <div className="grid grid-cols-2 gap-3">
                                    <Segment name="target1Gender" value="male" label="남성" defaultChecked />
                                    <Segment name="target1Gender" value="female" label="여성" />
                                </div>
                            </div>
                        </div>
                    </FormRow>

                    <FormRow title="추가 상담대상" description="궁합처럼 대상자가 두 명인 경우에만 입력해주세요.">
                        <div className="grid gap-6 lg:grid-cols-2">
                            <TextField label="상담대상 2 이름" name="target2Name" placeholder="이름을 입력해주세요" optional className="lg:col-span-2" />
                            <div className="lg:col-span-2">
                                <FieldLabel>생년월일</FieldLabel>
                                <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
                                    <input
                                        name="target2BirthDate"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={10}
                                        placeholder="YYYY.MM.DD"
                                        onInput={formatBirthDateInput}
                                        className={inputClassName}
                                    />
                                    <Segment name="target2CalendarType" value="solar" label="양력" />
                                    <Segment name="target2CalendarType" value="lunar" label="음력" />
                                    <Segment name="target2CalendarType" value="leap_lunar" label="음력윤달" />
                                </div>
                            </div>
                            <div>
                                <FieldLabel>출생 시간</FieldLabel>
                                <BirthTimeFields prefix="target2" />
                            </div>
                            <div>
                                <FieldLabel>성별</FieldLabel>
                                <div className="grid grid-cols-2 gap-3">
                                    <Segment name="target2Gender" value="male" label="남성" />
                                    <Segment name="target2Gender" value="female" label="여성" />
                                </div>
                            </div>
                        </div>
                    </FormRow>

                    <FormRow title="상담 종류 선택" description="받고 싶은 상담 종류를 하나 선택해주세요.">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {serviceOptions.map((service) => (
                                <label
                                    key={service.value}
                                    className="group relative min-h-36 cursor-pointer rounded-md border border-[#e2d8cd] bg-white p-5 transition-colors hover:border-[#b1844d]/70 hover:bg-[#fffdf9]"
                                >
                                    <input
                                        type="radio"
                                        name="serviceType"
                                        value={service.value}
                                        required
                                        checked={selectedService === service.value}
                                        onChange={() => setSelectedService(service.value)}
                                        className="peer sr-only"
                                    />
                                    <span className="absolute right-4 top-4 h-5 w-5 rounded-full border border-[#d8cec1] bg-white peer-checked:border-[#a87943]" />
                                    <span className="absolute right-[21px] top-[21px] h-2.5 w-2.5 rounded-full bg-[#a87943] opacity-0 transition-opacity peer-checked:opacity-100" />
                                    <service.icon className="h-8 w-8 text-[#a87943]" strokeWidth={1.5} />
                                    <span className="mt-4 block text-lg font-semibold text-[#2a2119]">{service.title}</span>
                                    <span className="mt-3 block text-sm leading-7 text-[#6b6158] break-keep">{service.description}</span>
                                    <span className="pointer-events-none absolute inset-0 rounded-md ring-0 ring-[#a87943] peer-checked:ring-2" />
                                </label>
                            ))}
                        </div>
                    </FormRow>

                    {selectedService === 'naming' && <NamingDetailFields />}

                    <FormRow title="현재 고민 / 상담 내용" description="현재 가장 고민되는 부분이나 상담에서 듣고 싶은 내용을 자유롭게 적어주세요.">
                        <div>
                            <textarea
                                name="concern"
                                maxLength={500}
                                rows={6}
                                placeholder={concernPlaceholders[selectedService] || '예) 상담에서 듣고 싶은 내용을 자유롭게 작성해주세요.'}
                                className={clsx(inputClassName, 'min-h-36 resize-y py-4')}
                            />
                            <p className="mt-2 text-right text-xs text-[#9a9086]">최대 500자</p>
                        </div>
                    </FormRow>

                    <FormRow title="개인정보 동의" description="개인정보 수집 및 이용에 동의해주세요.">
                        <label className="flex cursor-pointer items-start gap-4">
                            <input name="privacyAgreed" type="checkbox" required className="peer sr-only" />
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[#d1c4b4] bg-white text-white peer-checked:border-[#a87943] peer-checked:bg-[#a87943]">
                                <Check className="h-4 w-4" />
                            </span>
                            <span className="text-sm leading-7 text-[#554b42] break-keep">
                                <strong className="font-semibold text-[#2a2119]">개인정보 수집 및 이용에 동의합니다. (필수)</strong>
                                <br />
                                입력하신 정보는 상담 진행 목적 외에는 사용되지 않으며, 안전하게 보호됩니다.
                            </span>
                        </label>
                    </FormRow>

                    {feedbackMessage && (
                        <div
                            className={clsx(
                                'mt-7 rounded-md border px-5 py-4 text-sm font-medium',
                                isFeedbackSuccess
                                    ? 'border-[#a87943]/35 bg-[#f8f0e6] text-[#6f4d27]'
                                    : 'border-red-200 bg-red-50 text-red-700'
                            )}
                        >
                            {feedbackMessage}
                        </div>
                    )}

                    <div className="mt-8 overflow-hidden rounded-md bg-[#171512] px-6 py-7 text-white sm:px-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="flex items-center gap-2 font-serif text-2xl text-[#c69a61]">
                                    <Sparkles className="h-5 w-5" strokeWidth={1.5} />
                                    당신의 흐름을 함께 살펴보겠습니다.
                                </p>
                                <p className="mt-3 text-sm text-white/58">신청해주시면 확인 후 빠르게 연락드리겠습니다.</p>
                            </div>
                            <SubmitButton />
                        </div>
                    </div>
                </form>
            </section>
        </main>
    );
}

function FormRow({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section className="grid gap-6 border-b border-[#e4dbd1] py-8 first:pt-0 last:border-b-0 lg:grid-cols-[240px_1fr]">
            <div>
                <h2 className="border-l-4 border-[#a87943] pl-4 text-lg font-semibold text-[#2a2119]">{title}</h2>
                <p className="mt-4 max-w-none text-sm leading-7 text-[#746a61] break-keep">{description}</p>
            </div>
            <div>{children}</div>
        </section>
    );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="mb-2 block text-sm font-semibold text-[#2a2119]">
            {children} {required && <span className="text-[#a35d35]">*</span>}
        </label>
    );
}

function TextField({
    label,
    name,
    placeholder,
    type = 'text',
    required,
    optional,
    className,
    value,
    onChange,
}: {
    label: string;
    name: string;
    placeholder: string;
    type?: string;
    required?: boolean;
    optional?: boolean;
    className?: string;
    value?: string;
    onChange?: (value: string) => void;
}) {
    return (
        <div className={className}>
            <FieldLabel required={required}>
                {label} {optional && <span className="font-normal text-[#8d8379]">(선택)</span>}
            </FieldLabel>
            <input
                name={name}
                type={type}
                placeholder={placeholder}
                required={required}
                value={value}
                onChange={onChange ? (event) => onChange(event.target.value) : undefined}
                className={inputClassName}
            />
        </div>
    );
}

function PhoneField({
    name,
    value,
    onChange,
}: {
    name: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div>
            <FieldLabel required>전화번호</FieldLabel>
            <input type="hidden" name={name} value={normalizePhoneNumber(value)} />
            <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="예) 010-1234-5678"
                required
                value={formatPhoneNumber(value)}
                onChange={(event) => onChange(event.target.value)}
                maxLength={13}
                className={inputClassName}
            />
        </div>
    );
}

function PasswordField({
    label,
    name,
    placeholder,
    required,
}: {
    label: string;
    name: string;
    placeholder: string;
    required?: boolean;
}) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div>
            <FieldLabel required={required}>{label}</FieldLabel>
            <div className="relative">
                <input
                    name={name}
                    type={isVisible ? 'text' : 'password'}
                    placeholder={placeholder}
                    required={required}
                    className={clsx(inputClassName, 'pr-12')}
                />
                <button
                    type="button"
                    onClick={() => setIsVisible((current) => !current)}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-[#6f665d] transition-colors hover:bg-[#f6efe7] hover:text-[#6f4d27]"
                    aria-label={isVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                    {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
        </div>
    );
}

function Segment({
    name,
    value,
    label,
    defaultChecked,
}: {
    name: string;
    value: string;
    label: string;
    defaultChecked?: boolean;
}) {
    return (
        <label className="min-w-0 cursor-pointer">
            <input type="radio" name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
            <span className="flex h-12 items-center justify-center rounded-md border border-[#d8cec1] bg-white px-4 text-sm font-medium text-[#6f665d] transition-colors peer-checked:border-[#a87943] peer-checked:bg-[#fffaf2] peer-checked:text-[#6f4d27]">
                {label}
            </span>
        </label>
    );
}

function NamingDetailFields() {
    return (
        <FormRow title="작명 · 개명 세부 정보" description="이름을 제안할 때 함께 고려할 기준을 입력해주세요.">
            <div className="grid gap-6 lg:grid-cols-2">
                <TextField label="성(姓)" name="namingFamilyName" placeholder="예) 김, 이, 박 / 복성인 경우 전체 성" required />
                <div>
                    <FieldLabel required>돌림자 여부</FieldLabel>
                    <div className="grid grid-cols-2 gap-3">
                        <Segment name="namingGenerationNameUsage" value="use" label="사용" defaultChecked />
                        <Segment name="namingGenerationNameUsage" value="none" label="없음" />
                    </div>
                    <input
                        name="namingGenerationName"
                        type="text"
                        placeholder="예) 가운데 글자 '민' 사용"
                        className={clsx(inputClassName, 'mt-3')}
                    />
                </div>
                <TextField
                    label="선호 이름"
                    name="namingPreferredNames"
                    placeholder="예) 도윤, 서아처럼 마음에 드는 이름이나 발음"
                    optional
                />
                <div>
                    <FieldLabel>한자 사용 여부</FieldLabel>
                    <div className="grid grid-cols-3 gap-3">
                        <Segment name="namingHanjaUsage" value="required" label="필수" />
                        <Segment name="namingHanjaUsage" value="optional" label="상관없음" defaultChecked />
                        <Segment name="namingHanjaUsage" value="hangul" label="한글 이름" />
                    </div>
                </div>
                <TextField
                    label="피하고 싶은 이름/한자"
                    name="namingAvoidedNames"
                    placeholder="예) 가족 이름과 겹치는 글자, 피하고 싶은 한자"
                    optional
                    className="lg:col-span-2"
                />
                <div className="lg:col-span-2">
                    <FieldLabel>추가 요청사항</FieldLabel>
                    <textarea
                        name="namingAdditionalRequests"
                        rows={4}
                        maxLength={300}
                        placeholder="예) 두 글자 이름 선호, 특정 발음 선호, 형제자매 이름과의 조화 등"
                        className={clsx(inputClassName, 'min-h-28 resize-y py-4')}
                    />
                    <p className="mt-2 text-right text-xs text-[#9a9086]">최대 300자</p>
                </div>
            </div>
        </FormRow>
    );
}

function BirthTimeFields({ prefix, defaultChecked }: { prefix: string; defaultChecked?: boolean }) {
    const [period, setPeriod] = useState('');
    const hourOptions =
        period === 'pm'
            ? Array.from({ length: 12 }, (_, index) => index + 12)
            : Array.from({ length: 12 }, (_, index) => index);

    return (
        <>
            <div className="grid gap-3 sm:grid-cols-3">
                <Segment name={`${prefix}BirthTimeAccuracy`} value="exact" label="알고 있어요" defaultChecked={defaultChecked} />
                <Segment name={`${prefix}BirthTimeAccuracy`} value="approximate" label="대략 알아요" />
                <Segment name={`${prefix}BirthTimeAccuracy`} value="unknown" label="모르겠어요" />
            </div>
            <div className="mt-3 grid grid-cols-[1fr_1fr_1fr] gap-3">
                <select
                    name={`${prefix}BirthTimePeriod`}
                    value={period}
                    onChange={(event) => setPeriod(event.target.value)}
                    className={selectClassName}
                    aria-label="오전 오후"
                >
                    <option value="" disabled>
                        오전/오후
                    </option>
                    <option value="am">오전</option>
                    <option value="pm">오후</option>
                </select>
                <select name={`${prefix}BirthTimeHour`} defaultValue="" className={selectClassName} aria-label="출생 시">
                    <option value="" disabled>
                        시
                    </option>
                    {hourOptions.map((hour) => (
                        <option key={hour} value={String(hour)}>
                            {hour}시
                        </option>
                    ))}
                </select>
                <select name={`${prefix}BirthTimeMinute`} defaultValue="00" className={selectClassName} aria-label="출생 분">
                    {Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, '0')).map((minute) => (
                        <option key={minute} value={minute}>
                            {minute}분
                        </option>
                    ))}
                </select>
            </div>
        </>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-md bg-[#bd8a4c] px-8 text-sm font-semibold text-white transition-colors hover:bg-[#aa793d] disabled:cursor-wait disabled:opacity-65 sm:w-auto sm:min-w-64"
        >
            {pending ? '신청 중입니다' : '상담 신청하기'}
            <ArrowRight className="h-4 w-4" />
        </button>
    );
}

const inputClassName =
    'h-12 w-full rounded-md border border-[#d8cec1] bg-white px-4 text-sm text-[#2a2119] outline-none transition-colors placeholder:text-[#aaa198] focus:border-[#a87943] focus:ring-2 focus:ring-[#a87943]/15';

const selectClassName =
    'h-12 w-full rounded-md border border-[#d8cec1] bg-white px-3 text-sm text-[#2a2119] outline-none transition-colors focus:border-[#a87943] focus:ring-2 focus:ring-[#a87943]/15';

function formatBirthDateInput(event: React.FormEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const numbers = input.value.replace(/\D/g, '').slice(0, 8);
    const parts = [numbers.slice(0, 4), numbers.slice(4, 6), numbers.slice(6, 8)].filter(Boolean);

    input.value = parts.join('.');
}
