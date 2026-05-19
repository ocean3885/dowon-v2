import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CalendarDays, ChevronRight, FileText, UserRound } from 'lucide-react';
import { createAdminClient, createClient } from '@/utils/supabase/server';

type ConsultationTarget = {
    name?: string | null;
    birthDate?: string | null;
    calendarType?: string | null;
    gender?: string | null;
    birthTimeAccuracy?: string | null;
    birthTime?: string | null;
};

type SubmitRow = {
    id: number;
    applicant_name: string;
    applicant_phone: string;
    service_type: string;
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

export default async function MyApplicationsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const adminSupabase = await createAdminClient();
    const { data, error } = await adminSupabase
        .from('submits')
        .select('id, applicant_name, applicant_phone, service_type, consultation_targets, concern, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('My applications query error:', error);
    }

    const applications = (data || []) as SubmitRow[];

    return (
        <main className="min-h-screen bg-[#fbfaf8] px-5 pb-20 pt-32 text-[#211b16] sm:px-6 lg:px-10">
            <section className="mx-auto max-w-5xl">
                <div className="mb-8">
                    <p className="font-serif text-lg text-[#a87943]">내 상담 신청</p>
                    <h1 className="mt-3 font-serif text-4xl font-light tracking-normal text-[#2a2119]">신청서 목록</h1>
                    <p className="mt-4 text-sm leading-7 text-[#746a61]">
                        로그인한 계정으로 접수한 상담 신청서를 확인할 수 있습니다.
                    </p>
                </div>

                {error ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700">
                        <FileText className="mx-auto h-10 w-10" strokeWidth={1.5} />
                        <p className="mt-5 text-lg font-semibold">상담 신청 목록을 불러오지 못했습니다.</p>
                        <p className="mt-3 text-sm leading-7">
                            잠시 후 다시 시도해주세요. 문제가 계속되면 신청서 테이블 마이그레이션 상태를 확인해야 합니다.
                        </p>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="rounded-lg border border-[#ded4c8] bg-white/80 px-6 py-12 text-center shadow-[0_18px_55px_rgba(70,54,36,0.08)]">
                        <FileText className="mx-auto h-10 w-10 text-[#a87943]" strokeWidth={1.5} />
                        <p className="mt-5 text-lg font-semibold text-[#2a2119]">아직 접수된 신청서가 없습니다.</p>
                        <p className="mt-3 text-sm text-[#746a61]">상담 신청서를 작성하면 이곳에서 진행 상태를 확인할 수 있습니다.</p>
                        <Link
                            href="/submit"
                            className="mt-6 inline-flex h-12 items-center justify-center rounded-md bg-[#bd8a4c] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#aa793d]"
                        >
                            상담 신청하기
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {applications.map((application) => (
                            <article
                                key={application.id}
                                className="rounded-lg border border-[#ded4c8] bg-white/82 p-5 shadow-[0_12px_35px_rgba(70,54,36,0.06)]"
                            >
                                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="rounded-full bg-[#f8f0e6] px-3 py-1 text-xs font-semibold text-[#7a542a]">
                                                {statusLabels[application.status] || application.status}
                                            </span>
                                            <span className="text-sm text-[#746a61]">
                                                {serviceLabels[application.service_type] || application.service_type}
                                            </span>
                                        </div>
                                        <h2 className="mt-4 text-xl font-semibold text-[#2a2119]">
                                            {formatTargets(application.consultation_targets)}
                                        </h2>
                                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#746a61]">
                                            <span className="inline-flex items-center gap-2">
                                                <UserRound className="h-4 w-4" />
                                                신청인 {application.applicant_name}
                                            </span>
                                            <span className="inline-flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4" />
                                                {new Date(application.created_at).toLocaleString('ko-KR')}
                                            </span>
                                        </div>
                                        {application.concern && (
                                            <p className="mt-4 line-clamp-2 text-sm leading-7 text-[#5f554c]">
                                                {application.concern}
                                            </p>
                                        )}
                                    </div>
                                    <Link
                                        href="/submit"
                                        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-[#d8cec1] px-4 text-sm font-semibold text-[#6f4d27] transition-colors hover:border-[#a87943] hover:bg-[#fffaf2]"
                                    >
                                        새 신청
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

function formatTargets(targets: ConsultationTarget[] | null) {
    if (!targets?.length) return '상담대상 정보 없음';

    return targets
        .map((target, index) => {
            const name = target.name || `상담대상 ${index + 1}`;
            return target.birthDate ? `${name} (${target.birthDate})` : name;
        })
        .join(' / ');
}
