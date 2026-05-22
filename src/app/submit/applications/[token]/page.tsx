import { createAdminClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

export const metadata = {
    title: '상담 신청 상세',
    robots: {
        index: false,
        follow: false,
    },
};

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

type SubmitDetail = {
    id: number;
    applicant_name: string;
    applicant_phone: string;
    applicant_email: string | null;
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
    contacted: '연락완료',
    completed: '상담완료',
    cancelled: '취소',
};

const statusStyles: Record<string, string> = {
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    contacted: 'border-blue-200 bg-blue-50 text-blue-700',
    completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    cancelled: 'border-red-200 bg-red-50 text-red-700',
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

export default async function SubmitApplicationDetailPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;

    if (!token || token.length < 32) {
        notFound();
    }

    const supabase = await createAdminClient();
    const { data, error } = await supabase
        .from('submits')
        .select('id, applicant_name, applicant_phone, applicant_email, service_type, service_details, consultation_targets, concern, status, created_at')
        .eq('admin_view_token', token)
        .single();

    if (error || !data) {
        notFound();
    }

    const application = data as SubmitDetail;

    return (
        <main className="min-h-screen bg-stone-50 px-4 pb-8 pt-28 text-stone-800 sm:px-6">
            <article className="mx-auto max-w-4xl rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
                <header className="border-b border-stone-100 pb-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-stone-400">상담 신청 #{application.id}</p>
                            <h1 className="mt-2 text-2xl font-bold text-stone-900 sm:text-3xl">
                                {application.applicant_name}
                            </h1>
                            <p className="mt-2 text-base text-stone-500">{formatDate(application.created_at)}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex h-9 items-center rounded-full border px-3 text-sm font-semibold ${statusStyles[application.status] || statusStyles.pending}`}>
                                {statusLabels[application.status] || application.status}
                            </span>
                            <span className="inline-flex h-9 items-center rounded-full bg-amber-50 px-3 text-sm font-semibold text-amber-700">
                                {serviceLabels[application.service_type] || application.service_type}
                            </span>
                        </div>
                    </div>
                </header>

                <section className="mt-5 grid gap-4 rounded-lg border border-stone-100 bg-stone-50/70 p-4 text-base sm:grid-cols-3">
                    <InfoItem label="신청인" value={application.applicant_name} />
                    <InfoItem label="연락처" value={application.applicant_phone} />
                    <InfoItem label="이메일" value={application.applicant_email || '-'} />
                </section>

                <section className="mt-6">
                    <SectionTitle title="상담대상 정보" meta={`${application.consultation_targets?.length || 0}명`} />
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {application.consultation_targets?.length ? (
                            application.consultation_targets.map((target, index) => (
                                <div key={`${target.name || 'target'}-${index}`} className="rounded-lg border border-stone-100 bg-white p-4">
                                    <p className="font-serif text-xl text-stone-800">
                                        {target.name || `상담대상 ${index + 1}`}
                                    </p>
                                    <dl className="mt-3 grid gap-2.5 text-base text-stone-600">
                                        <DetailRow label="생년월일" value={target.birthDate} />
                                        <DetailRow label="달력" value={formatCalendarType(target.calendarType)} />
                                        <DetailRow label="성별" value={formatGender(target.gender)} />
                                        <DetailRow label="출생 시간" value={formatBirthTime(target)} />
                                    </dl>
                                </div>
                            ))
                        ) : (
                            <p className="rounded-lg border border-stone-100 bg-white p-4 text-base text-stone-500">
                                상담대상 정보가 없습니다.
                            </p>
                        )}
                    </div>
                </section>

                {application.service_type === 'naming' && (
                    <section className="mt-6">
                        <SectionTitle title="작명 · 개명 세부 정보" />
                        <dl className="mt-3 grid gap-2.5 rounded-lg border border-stone-100 bg-white p-4 text-base text-stone-600 md:grid-cols-2">
                            <DetailRow label="성(姓)" value={application.service_details?.familyName} />
                            <DetailRow label="돌림자" value={formatGenerationName(application.service_details)} />
                            <DetailRow label="선호 이름" value={application.service_details?.preferredNames} />
                            <DetailRow label="한자 사용" value={formatHanjaUsage(application.service_details?.hanjaUsage)} />
                            <DetailRow label="피하고 싶은 이름/한자" value={application.service_details?.avoidedNames} />
                            <DetailRow label="추가 요청" value={application.service_details?.additionalRequests} />
                        </dl>
                    </section>
                )}

                <section className="mt-6">
                    <SectionTitle title="상담 내용" />
                    <p className="mt-3 whitespace-pre-wrap break-words rounded-lg bg-stone-50 px-4 py-3 text-base leading-8 text-stone-600 [overflow-wrap:anywhere]">
                        {application.concern || '작성된 상담 내용이 없습니다.'}
                    </p>
                </section>
            </article>
        </main>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0">
            <p className="text-sm font-semibold text-stone-400">{label}</p>
            <p className="mt-1 break-words text-base font-medium text-stone-800 [overflow-wrap:anywhere]">{value}</p>
        </div>
    );
}

function SectionTitle({ title, meta }: { title: string; meta?: string }) {
    return (
        <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-stone-700">{title}</h2>
            {meta && <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-500">{meta}</span>}
            <span className="h-px flex-1 bg-stone-100" />
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-2">
            <dt className="text-stone-400">{label}</dt>
            <dd className="break-words text-stone-700 [overflow-wrap:anywhere]">{value || '-'}</dd>
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
