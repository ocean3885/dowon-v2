'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { CalendarDays, ClipboardList, LockKeyhole, Phone, Search, UserRound } from 'lucide-react';
import { lookupGuestApplications } from '@/lib/actions';
import type { GuestSubmitApplication, LookupGuestApplicationsState } from '@/lib/actions';

type ConsultationTarget = NonNullable<GuestSubmitApplication['consultation_targets']>[number];
type ServiceDetails = NonNullable<GuestSubmitApplication['service_details']>;

const initialState: LookupGuestApplicationsState = {
    success: false,
    message: '',
    applications: [],
};

const serviceLabels: Record<string, string> = {
    saju: '사주 종합 상담',
    love: '연애 · 결혼 상담',
    career: '진로 · 직업 상담',
    wealth: '사업 · 재물 상담',
    naming: '작명 · 개명 상담',
    moving: '이사 · 택일 상담',
};

const statusLabels: Record<string, string> = {
    pending: '접수',
    contacted: '연락완료',
    completed: '상담완료',
    cancelled: '취소',
};

const statusStyles: Record<string, string> = {
    pending: 'border-[#d6bd9a] bg-[#fff7eb] text-[#8a5a20]',
    contacted: 'border-[#b9c8dd] bg-[#eef5ff] text-[#315f99]',
    completed: 'border-[#b8d4c1] bg-[#eefaf1] text-[#347247]',
    cancelled: 'border-[#e2b8b8] bg-[#fff0f0] text-[#a64242]',
};

const generationNameUsageLabels: Record<string, string> = {
    use: '사용',
    none: '없음',
};

const hanjaUsageLabels: Record<string, string> = {
    required: '필수',
    optional: '상관없음',
    hangul: '한글 이름',
};

const inputClassName = 'h-12 w-full rounded-md border border-[#d8c8b5] bg-white px-4 text-sm text-[#2a2119] outline-none transition-colors placeholder:text-[#a59a8d] focus:border-[#a87943]';

function normalizePhoneNumber(value: string) {
    return value.replace(/\D/g, '').slice(0, 11);
}

function formatPhoneNumber(value: string) {
    const digits = normalizePhoneNumber(value);

    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function LookupPageClient() {
    const [state, formAction] = useActionState(lookupGuestApplications, initialState);
    const [phone, setPhone] = useState('');

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#f8f2e9] px-5 pb-20 pt-28 text-[#211b16] sm:px-6 lg:px-10">
            <div className="pointer-events-none absolute right-0 top-72 h-72 w-[70vw] max-w-[720px] opacity-[0.22] mix-blend-multiply md:top-64 md:h-[420px]">
                <Image
                    src="/bg_source/bg_mount3.webp"
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 768px) 720px, 70vw"
                    className="object-contain object-right-top"
                />
            </div>
            <div className="pointer-events-none absolute left-0 bottom-0 h-64 w-[68vw] max-w-[680px] opacity-[0.2] mix-blend-multiply md:h-[380px]">
                <Image
                    src="/bg_source/bg_mount4.webp"
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 768px) 680px, 68vw"
                    className="object-contain object-left-bottom"
                />
            </div>

            <section className="relative mx-auto max-w-6xl">
                <div className="relative overflow-hidden rounded-lg border border-[#ded4c8] bg-[#211b16] px-6 py-7 text-white shadow-[0_18px_55px_rgba(70,54,36,0.07)] sm:px-8 md:px-10">
                    <Image
                        src="/counseling/subimage8.webp"
                        alt=""
                        fill
                        priority
                        sizes="(min-width: 1024px) 1152px, 100vw"
                        className="object-cover object-center opacity-55"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(22,18,14,0.88),rgba(22,18,14,0.62)_52%,rgba(22,18,14,0.28))]" />
                    <div className="relative">
                        <p className="font-serif text-lg text-[#d0a66d]">상담고객 신청서 확인</p>
                        <h1 className="mt-3 font-serif text-3xl font-light tracking-normal text-white sm:text-4xl">신청서 조회</h1>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/74 break-keep">
                            상담 신청 시 입력한 전화번호와 확인 비밀번호로 신청서와 진행 상태를 확인할 수 있습니다.
                        </p>
                    </div>
                </div>

                <form action={formAction} className="mt-8 rounded-lg border border-[#ded4c8] bg-white/82 p-5 shadow-[0_12px_35px_rgba(70,54,36,0.06)] sm:p-6">
                    <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                        <label>
                            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#5f554c]">
                                <Phone className="h-4 w-4 text-[#a87943]" />
                                전화번호
                            </span>
                            <input type="hidden" name="applicantPhone" value={phone} />
                            <input
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel"
                                placeholder="신청 시 입력한 전화번호"
                                required
                                value={formatPhoneNumber(phone)}
                                onChange={(event) => setPhone(normalizePhoneNumber(event.target.value))}
                                maxLength={13}
                                className={inputClassName}
                            />
                        </label>
                        <label>
                            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#5f554c]">
                                <LockKeyhole className="h-4 w-4 text-[#a87943]" />
                                신청서 확인 비밀번호
                            </span>
                            <input
                                name="applicationPassword"
                                type="password"
                                placeholder="4자 이상"
                                minLength={4}
                                required
                                className={inputClassName}
                            />
                        </label>
                        <SubmitButton />
                    </div>
                    <p className="mt-3 text-xs leading-6 text-[#8a7d70] break-keep">
                        전화번호는 숫자로만 입력해주세요.
                    </p>
                </form>

                {state.message && (
                    <div className={`mt-5 rounded-md border px-5 py-4 text-sm font-medium ${state.success ? 'border-[#a87943]/35 bg-[#f8f0e6] text-[#6f4d27]' : 'border-red-200 bg-red-50 text-red-700'}`}>
                        {state.message}
                    </div>
                )}

                {state.applications.length === 0 ? (
                    <div className="mt-8 rounded-lg border border-[#ded4c8] bg-white/70 px-6 py-10 text-center shadow-[0_18px_55px_rgba(70,54,36,0.06)]">
                        <ClipboardList className="mx-auto h-11 w-11 text-[#a87943]" strokeWidth={1.5} />
                        <p className="mt-5 text-lg font-semibold text-[#2a2119]">조회된 신청서가 없습니다.</p>
                        <p className="mt-3 text-sm leading-7 text-[#746a61] break-keep">
                            상담 신청을 완료했다면 위 정보를 입력해 신청서를 확인할 수 있습니다.
                        </p>
                        <Link
                            href="/submit"
                            className="mt-6 inline-flex h-12 items-center justify-center rounded-md bg-[#bd8a4c] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#aa793d]"
                        >
                            상담 신청하기
                        </Link>
                    </div>
                ) : (
                    <div className="mt-8 grid gap-4">
                        {state.applications.map((application) => (
                            <ApplicationCard key={application.id} application={application} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#211b16] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#3a3028] disabled:cursor-wait disabled:opacity-65"
        >
            <Search className="h-4 w-4" />
            {pending ? '조회 중' : '조회하기'}
        </button>
    );
}

function ApplicationCard({ application }: { application: GuestSubmitApplication }) {
    return (
        <article className="rounded-lg border border-[#ded4c8] bg-white/82 p-5 shadow-[0_12px_35px_rgba(70,54,36,0.06)] transition-colors hover:border-[#c9b79f] hover:bg-white">
            <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[application.status] || statusStyles.pending}`}>
                    {statusLabels[application.status] || application.status}
                </span>
                <span className="rounded-full bg-[#f7efe5] px-3 py-1 text-xs font-semibold text-[#7a542a]">
                    {serviceLabels[application.service_type] || application.service_type}
                </span>
            </div>

            <div className="mt-5 grid gap-3 rounded-md border border-[#eee2d3] bg-[#fcfaf6] p-4 text-sm text-[#5f554c] sm:grid-cols-3">
                <InfoItem icon={<UserRound className="h-4 w-4 text-[#a87943]" />} label="신청인" value={application.applicant_name} />
                <InfoItem icon={<Phone className="h-4 w-4 text-[#a87943]" />} label="연락처" value={application.applicant_phone} />
                <InfoItem icon={<CalendarDays className="h-4 w-4 text-[#a87943]" />} label="접수일" value={formatDate(application.created_at)} />
            </div>

            <div className="mt-5">
                <p className="text-sm font-semibold text-[#6f665d]">상담대상 정보</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {application.consultation_targets?.length ? (
                        application.consultation_targets.map((target, index) => (
                            <div key={`${target.name || 'target'}-${index}`} className="rounded-md border border-[#eee2d3] bg-white/68 p-4">
                                <p className="font-serif text-lg text-[#2a2119]">{target.name || `상담대상 ${index + 1}`}</p>
                                <dl className="mt-3 grid gap-2 text-sm text-[#6a5f55]">
                                    <DetailRow label="생년월일" value={target.birthDate} />
                                    <DetailRow label="달력" value={formatCalendarType(target.calendarType)} />
                                    <DetailRow label="성별" value={formatGender(target.gender)} />
                                    <DetailRow label="출생 시간" value={formatBirthTime(target)} />
                                </dl>
                            </div>
                        ))
                    ) : (
                        <p className="rounded-md border border-[#eee2d3] bg-white/68 p-4 text-sm text-[#746a61]">
                            상담대상 정보가 없습니다.
                        </p>
                    )}
                </div>
            </div>

            {application.service_type === 'naming' && (
                <div className="mt-5">
                    <p className="text-sm font-semibold text-[#6f665d]">작명 · 개명 세부 정보</p>
                    <dl className="mt-3 grid gap-3 rounded-md border border-[#eee2d3] bg-white/68 p-4 text-sm text-[#6a5f55] md:grid-cols-2">
                        <DetailRow label="성(姓)" value={application.service_details?.familyName} />
                        <DetailRow label="돌림자" value={formatGenerationName(application.service_details)} />
                        <DetailRow label="선호 이름" value={application.service_details?.preferredNames} />
                        <DetailRow label="한자 사용" value={formatHanjaUsage(application.service_details?.hanjaUsage)} />
                        <DetailRow label="피하고 싶은 이름/한자" value={application.service_details?.avoidedNames} />
                        <DetailRow label="추가 요청" value={application.service_details?.additionalRequests} />
                    </dl>
                </div>
            )}

            <div className="mt-5">
                <p className="text-sm font-semibold text-[#6f665d]">상담 내용</p>
                <p className="mt-3 whitespace-pre-wrap rounded-md bg-[#faf6ef] px-4 py-3 text-sm leading-7 text-[#5f554c]">
                    {application.concern || '작성된 상담 내용이 없습니다.'}
                </p>
            </div>
        </article>
    );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex gap-3">
            <div className="mt-0.5">{icon}</div>
            <div>
                <p className="text-xs font-semibold text-[#8a7d70]">{label}</p>
                <p className="mt-1 break-keep text-[#2f2923]">{value}</p>
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="grid grid-cols-[82px_1fr] gap-2">
            <dt className="text-[#8a7d70]">{label}</dt>
            <dd className="text-[#2f2923]">{value || '-'}</dd>
        </div>
    );
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
}

function formatCalendarType(type?: string | null) {
    const labels: Record<string, string> = {
        solar: '양력',
        lunar: '음력',
        leap_lunar: '음력윤달',
    };
    return type ? labels[type] || type : '-';
}

function formatGender(gender?: string | null) {
    const labels: Record<string, string> = {
        male: '남성',
        female: '여성',
    };
    return gender ? labels[gender] || gender : '-';
}

function formatBirthTime(target: ConsultationTarget) {
    if (target.birthTimeAccuracy === 'unknown') return '모름';
    if (target.birthTimeAccuracy === 'approximate' && target.birthTime) return `${target.birthTime} 무렵`;
    return target.birthTime || '-';
}

function formatGenerationName(details?: ServiceDetails | null) {
    if (!details?.generationNameUsage) return '-';

    const usage = generationNameUsageLabels[details.generationNameUsage] || details.generationNameUsage;
    return details.generationName ? `${usage} (${details.generationName})` : usage;
}

function formatHanjaUsage(value?: string | null) {
    return value ? hanjaUsageLabels[value] || value : '-';
}
