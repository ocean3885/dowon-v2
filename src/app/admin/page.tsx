import { redirect } from 'next/navigation';
import { getConsultations, type AdminSubmitApplication } from '@/lib/actions';
import DeleteConsultationButton from '@/components/admin/DeleteConsultationButton';
import SubmitStatusButtons from '@/components/admin/SubmitStatusButtons';

const serviceTypeLabels: Record<string, string> = {
    saju: '사주 종합 상담',
    love: '연애 · 결혼 상담',
    career: '진로 · 직업 상담',
    wealth: '사업 · 재물 상담',
    naming: '작명 · 개명 상담',
    moving: '이사 · 택일 상담',
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

export default async function AdminPage() {
    let consultations: AdminSubmitApplication[] = [];
    try {
        consultations = await getConsultations();
    } catch {
        redirect('/login');
    }

    return (
        <>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-stone-700">상담 신청 목록</h2>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {consultations.length === 0 ? (
                    <div className="col-span-full bg-white p-8 rounded-xl shadow-sm border border-stone-200 text-center text-stone-400">
                        아직 신청된 상담 내역이 없습니다.
                    </div>
                ) : (
                    consultations.map((item) => (
                        <article key={item.id} className="flex h-full flex-col rounded-lg border border-stone-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
                            <div className="flex flex-col gap-4 border-b border-stone-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-stone-400">#{item.id}</p>
                                    <h3 className="mt-1 break-words text-2xl font-bold text-stone-800">{item.name}</h3>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                    <span className="inline-flex h-8 items-center rounded-full bg-amber-50 px-3 text-sm font-semibold text-amber-700">
                                        {serviceTypeLabels[item.serviceType] || item.serviceType}
                                    </span>
                                    <DeleteConsultationButton id={item.id} />
                                </div>
                            </div>

                            <div className="border-b border-stone-100 py-3">
                                <SubmitStatusButtons id={item.id} status={item.status} />
                            </div>

                            <div className="mt-5 grid gap-4 rounded-lg border border-stone-100 bg-stone-50/70 p-4 text-base text-stone-600 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
                                <InfoItem label="신청인" value={item.name} />
                                <InfoItem label="연락처" value={item.contact} />
                                <InfoItem label="이메일" value={item.email || '-'} />
                                <InfoItem label="접수일" value={formatDate(item.createdAt)} />
                            </div>

                            <section className="mt-5">
                                <SectionTitle title="상담대상 정보" meta={`${item.consultationTargets?.length || 0}명`} />
                                <div className="mt-3 grid gap-3 md:grid-cols-2">
                                    {item.consultationTargets?.length ? (
                                        item.consultationTargets.map((target, index) => (
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

                            {item.serviceType === 'naming' && (
                                <section className="mt-5">
                                    <SectionTitle title="작명 · 개명 세부 정보" />
                                    <dl className="mt-3 grid gap-2.5 rounded-lg border border-stone-100 bg-white p-4 text-base text-stone-600 md:grid-cols-2">
                                        <DetailRow label="성(姓)" value={item.serviceDetails?.familyName} />
                                        <DetailRow label="돌림자" value={formatGenerationName(item.serviceDetails)} />
                                        <DetailRow label="선호 이름" value={item.serviceDetails?.preferredNames} />
                                        <DetailRow label="한자 사용" value={formatHanjaUsage(item.serviceDetails?.hanjaUsage)} />
                                        <DetailRow label="피하고 싶은 이름/한자" value={item.serviceDetails?.avoidedNames} />
                                        <DetailRow label="추가 요청" value={item.serviceDetails?.additionalRequests} />
                                    </dl>
                                </section>
                            )}

                            <section className="mt-5">
                                <SectionTitle title="상담 내용" />
                                <p className="mt-3 whitespace-pre-wrap break-words rounded-lg bg-stone-50 px-4 py-3 text-base leading-8 text-stone-600 [overflow-wrap:anywhere]">
                                    {item.notes || '작성된 상담 내용이 없습니다.'}
                                </p>
                            </section>
                        </article>
                    ))
                )}
            </div>
        </>
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
            <h4 className="text-base font-bold text-stone-700">{title}</h4>
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

function formatBirthTime(target: NonNullable<AdminSubmitApplication['consultationTargets']>[number]) {
    if (target.birthTimeAccuracy === 'unknown') return '모름';
    if (target.birthTimeAccuracy === 'approximate' && target.birthTime) return `${target.birthTime} 무렵`;
    return target.birthTime || '-';
}

function formatGenerationName(details?: AdminSubmitApplication['serviceDetails']) {
    if (!details?.generationNameUsage) return '-';

    const usage = generationNameUsageLabels[details.generationNameUsage] || details.generationNameUsage;
    return details.generationName ? `${usage} (${details.generationName})` : usage;
}

function formatHanjaUsage(value?: string | null) {
    return value ? hanjaUsageLabels[value] || value : '-';
}
