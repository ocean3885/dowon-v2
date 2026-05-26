import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CalendarDays, ClipboardList, FileText, Phone, UserRound } from 'lucide-react';
import { createAdminClient, createClient } from '@/utils/supabase/server';
import DeleteSubmitApplicationButton from '@/components/my/DeleteSubmitApplicationButton';

type ConsultationTarget = {
    name?: string | null;
    birthDate?: string | null;
    calendarType?: string | null;
    gender?: string | null;
    birthTimeAccuracy?: string | null;
    birthTime?: string | null;
};

type ServiceDetails = {
    familyName?: string | null;
    generationNameUsage?: string | null;
    generationName?: string | null;
    preferredNames?: string | null;
    hanjaUsage?: string | null;
    avoidedNames?: string | null;
    additionalRequests?: string | null;
};

type SubmitRow = {
    id: number;
    applicant_name: string;
    applicant_phone: string;
    service_type: string;
    service_details: ServiceDetails | null;
    consultation_targets: ConsultationTarget[] | null;
    concern: string | null;
    status: string;
    created_at: string;
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
    paid: '입금완료',
    contacted: '입금완료',
    completed: '상담완료',
    cancelled: '취소',
};

const statusStyles: Record<string, string> = {
    pending: 'border-[#d6bd9a] bg-[#fff7eb] text-[#8a5a20]',
    paid: 'border-[#b9c8dd] bg-[#eef5ff] text-[#315f99]',
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

export default async function MyApplicationsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const adminSupabase = await createAdminClient();
    const { data, error } = await adminSupabase
        .from('submits')
        .select('id, applicant_name, applicant_phone, service_type, service_details, consultation_targets, concern, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('My applications query error:', error);
    }

    const applications = (data || []) as SubmitRow[];

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
                        <div>
                            <p className="font-serif text-lg text-[#d0a66d]">내 상담 신청</p>
                            <h1 className="mt-3 font-serif text-3xl font-light tracking-normal text-white sm:text-4xl">신청서 목록</h1>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/74 break-keep">
                                로그인한 계정으로 접수한 상담 신청서와 진행 상태를 확인할 수 있습니다.
                            </p>
                        </div>
                    </div>
                </div>

                {error ? (
                    <div className="mt-8 rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700">
                        <FileText className="mx-auto h-10 w-10" strokeWidth={1.5} />
                        <p className="mt-5 text-lg font-semibold">상담 신청 목록을 불러오지 못했습니다.</p>
                        <p className="mt-3 text-sm leading-7">
                            잠시 후 다시 시도해주세요. 문제가 계속되면 신청서 테이블 마이그레이션 상태를 확인해야 합니다.
                        </p>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="mt-8 rounded-lg border border-[#ded4c8] bg-white/80 px-6 py-12 text-center shadow-[0_18px_55px_rgba(70,54,36,0.08)]">
                        <ClipboardList className="mx-auto h-11 w-11 text-[#a87943]" strokeWidth={1.5} />
                        <p className="mt-5 text-lg font-semibold text-[#2a2119]">아직 접수된 신청서가 없습니다.</p>
                        <div className="relative mx-auto mt-5 h-36 w-36 sm:h-44 sm:w-44">
                            <Image
                                src="/bg_source/crane_nosubmit.webp"
                                alt=""
                                fill
                                sizes="(min-width: 640px) 176px, 144px"
                                className="object-contain drop-shadow-[0_18px_35px_rgba(120,84,44,0.14)]"
                            />
                        </div>
                        <p className="mt-3 text-sm text-[#746a61]">상담 신청서를 작성하면 이곳에서 진행 상태를 확인할 수 있습니다.</p>
                        <Link
                            href="/submit"
                            className="mt-6 inline-flex h-12 items-center justify-center rounded-md bg-[#bd8a4c] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#aa793d]"
                        >
                            상담 신청하기
                        </Link>
                    </div>
                ) : (
                    <div className="mt-8 grid gap-4">
                        {applications.map((application) => (
                            <article
                                key={application.id}
                                className="group rounded-lg border border-[#ded4c8] bg-white/82 p-5 shadow-[0_12px_35px_rgba(70,54,36,0.06)] transition-colors hover:border-[#c9b79f] hover:bg-white"
                            >
                                <div className="min-w-0">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[application.status] || statusStyles.pending}`}>
                                                {statusLabels[application.status] || application.status}
                                            </span>
                                            <span className="rounded-full bg-[#f7efe5] px-3 py-1 text-xs font-semibold text-[#7a542a]">
                                                {serviceLabels[application.service_type] || application.service_type}
                                            </span>
                                        </div>
                                        <DeleteSubmitApplicationButton id={application.id} />
                                    </div>
                                    <div className="mt-5 grid gap-3 rounded-md border border-[#eee2d3] bg-[#fcfaf6] p-4 text-sm text-[#5f554c] sm:grid-cols-3">
                                        <InfoItem
                                            icon={<UserRound className="h-4 w-4 text-[#a87943]" />}
                                            label="신청인"
                                            value={application.applicant_name}
                                        />
                                        <InfoItem
                                            icon={<Phone className="h-4 w-4 text-[#a87943]" />}
                                            label="연락처"
                                            value={application.applicant_phone}
                                        />
                                        <InfoItem
                                            icon={<CalendarDays className="h-4 w-4 text-[#a87943]" />}
                                            label="접수일"
                                            value={formatDate(application.created_at)}
                                        />
                                    </div>

                                    <div className="mt-5">
                                        <p className="text-sm font-semibold text-[#6f665d]">상담대상 정보</p>
                                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                                            {application.consultation_targets?.length ? (
                                                application.consultation_targets.map((target, index) => (
                                                    <div key={`${target.name || 'target'}-${index}`} className="rounded-md border border-[#eee2d3] bg-white/68 p-4">
                                                        <p className="font-serif text-lg text-[#2a2119]">
                                                            {target.name || `상담대상 ${index + 1}`}
                                                        </p>
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
                                                <DetailRow
                                                    label="돌림자"
                                                    value={formatGenerationName(application.service_details)}
                                                />
                                                <DetailRow label="선호 이름" value={application.service_details?.preferredNames} />
                                                <DetailRow
                                                    label="한자 사용"
                                                    value={formatHanjaUsage(application.service_details?.hanjaUsage)}
                                                />
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
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
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
