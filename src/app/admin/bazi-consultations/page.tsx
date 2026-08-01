import { createAdminClient } from '@/utils/supabase/server';
import AdminBaziConsultationList from '@/components/admin/AdminBaziConsultationList';
import type { BaziResult } from '@/components/bazi/types';
import type { BaziGenerationMetadata } from '@/lib/bazi-prompt-config';

type SearchParams = Promise<{ page?: string }>;

const BAZI_PAGE_SIZE = 20;

type BaziConsultationStatus = 'pending' | 'completed' | 'failed' | string;

type MemberProfile = {
    id: string;
    email: string;
    name: string | null;
};

type MemberBaziRow = {
    id: string;
    user_id: string;
    subject_name: string | null;
    request_date_kst: string;
    bazi_result: BaziResult | null;
    prompt: string | null;
    result_text: string | null;
    prompt_version: string | null;
    generation_metadata: BaziGenerationMetadata | null;
    status: BaziConsultationStatus | null;
    completed_at: string | null;
    error_message: string | null;
    created_at: string;
};

type GuestBaziRow = {
    id: string;
    guest_id: string;
    subject_name: string | null;
    request_date_kst: string;
    bazi_result: BaziResult | null;
    prompt: string | null;
    result_text: string | null;
    prompt_version: string | null;
    generation_metadata: BaziGenerationMetadata | null;
    status: BaziConsultationStatus | null;
    completed_at: string | null;
    error_message: string | null;
    claimed_user_id: string | null;
    created_at: string;
};

type AdminBaziConsultation = {
    id: string;
    type: 'member' | 'guest';
    ownerLabel: string;
    ownerMeta: string;
    subjectName: string | null;
    requestDate: string;
    baziResult: BaziResult | null;
    prompt: string | null;
    resultText: string | null;
    promptVersion: string | null;
    generationMetadata: BaziGenerationMetadata | null;
    status: BaziConsultationStatus;
    completedAt: string | null;
    errorMessage: string | null;
    createdAt: string;
};

type GuestDailyStats = {
    requestDate: string;
    totalCount: number;
    pendingCount: number;
    completedCount: number;
    failedCount: number;
};

export default async function AdminBaziConsultationsPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const currentPage = Math.max(1, parseInt(params.page || '1', 10));
    const adminSupabase = await createAdminClient();
    const [guestDailyStats, consultationPage] = await Promise.all([
        getGuestDailyStats(adminSupabase),
        getRecentBaziConsultations(adminSupabase, currentPage),
    ]);

    return (
        <section>
            <div className="mb-6">
                <p className="text-sm font-semibold text-stone-400">Bazi Consultations</p>
                <h2 className="mt-1 text-2xl font-bold text-stone-700">만세력상담</h2>
                <p className="mt-2 text-sm text-stone-500">비회원 무료 만세력 해설 신청 현황을 확인합니다.</p>
            </div>

            <GuestDailyStatsSection stats={guestDailyStats} />
            <AdminBaziConsultationList
                consultations={consultationPage.consultations}
                currentPage={currentPage}
                totalPages={consultationPage.totalPages}
                totalCount={consultationPage.totalCount}
                pageSize={BAZI_PAGE_SIZE}
            />
        </section>
    );
}

function GuestDailyStatsSection({ stats }: { stats: GuestDailyStats[] }) {
    return (
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-stone-400">Guest Bazi</p>
                    <h3 className="mt-1 text-xl font-bold text-stone-700">날짜별 비회원 무료 해설 신청</h3>
                    <p className="mt-1 text-xs text-stone-400">최근 14일 신청 내역만 집계해서 표시합니다.</p>
                </div>
                <p className="text-xs text-stone-400">최근 14일 기준</p>
            </div>

            {stats.length === 0 ? (
                <div className="mt-5 rounded-lg border border-stone-100 bg-stone-50 px-5 py-8 text-center text-sm text-stone-400">
                    아직 비회원 무료 해설 신청 내역이 없습니다.
                </div>
            ) : (
                <div className="mt-5 overflow-x-auto">
                    <table className="min-w-full divide-y divide-stone-100 text-left">
                        <thead className="bg-stone-50 text-xs font-bold uppercase tracking-wide text-stone-400">
                            <tr>
                                <th className="px-4 py-3">날짜</th>
                                <th className="px-4 py-3">전체</th>
                                <th className="px-4 py-3">완료</th>
                                <th className="px-4 py-3">분석중</th>
                                <th className="px-4 py-3">실패</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {stats.map((item) => (
                                <tr key={item.requestDate}>
                                    <td className="px-4 py-3 text-sm font-semibold text-stone-700">{item.requestDate}</td>
                                    <td className="px-4 py-3 text-sm font-bold text-stone-900">{item.totalCount.toLocaleString('ko-KR')}건</td>
                                    <td className="px-4 py-3 text-sm text-emerald-700">{item.completedCount.toLocaleString('ko-KR')}건</td>
                                    <td className="px-4 py-3 text-sm text-amber-700">{item.pendingCount.toLocaleString('ko-KR')}건</td>
                                    <td className="px-4 py-3 text-sm text-red-600">{item.failedCount.toLocaleString('ko-KR')}건</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

async function getGuestDailyStats(adminSupabase: Awaited<ReturnType<typeof createAdminClient>>) {
    const { data, error } = await adminSupabase
        .from('guest_bazi_consultations')
        .select('request_date_kst, status')
        .gte('request_date_kst', getKstDateNDaysAgo(13))
        .order('request_date_kst', { ascending: false });

    if (error) {
        console.error('Admin guest bazi daily stats query error:', error);
        return [];
    }

    const statsByDate = new Map<string, GuestDailyStats>();

    (data || []).forEach((row) => {
        const requestDate = row.request_date_kst;
        if (!requestDate) return;

        const current = statsByDate.get(requestDate) || {
            requestDate,
            totalCount: 0,
            pendingCount: 0,
            completedCount: 0,
            failedCount: 0,
        };

        current.totalCount += 1;

        if (row.status === 'completed') {
            current.completedCount += 1;
        } else if (row.status === 'failed') {
            current.failedCount += 1;
        } else {
            current.pendingCount += 1;
        }

        statsByDate.set(requestDate, current);
    });

    return Array.from(statsByDate.values()).sort((a, b) => b.requestDate.localeCompare(a.requestDate));
}

async function getRecentBaziConsultations(
    adminSupabase: Awaited<ReturnType<typeof createAdminClient>>,
    currentPage: number
) {
    const to = currentPage * BAZI_PAGE_SIZE - 1;
    const from = 0;
    const [memberCountResult, guestCountResult, memberResult, guestResult] = await Promise.all([
        adminSupabase
            .from('free_bazi_consultations')
            .select('id', { count: 'exact', head: true }),
        adminSupabase
            .from('guest_bazi_consultations')
            .select('id', { count: 'exact', head: true }),
        adminSupabase
            .from('free_bazi_consultations')
            .select('id, user_id, subject_name, request_date_kst, bazi_result, prompt, result_text, prompt_version, generation_metadata, status, completed_at, error_message, created_at')
            .order('created_at', { ascending: false })
            .range(from, to),
        adminSupabase
            .from('guest_bazi_consultations')
            .select('id, guest_id, subject_name, request_date_kst, bazi_result, prompt, result_text, prompt_version, generation_metadata, status, completed_at, error_message, claimed_user_id, created_at')
            .order('created_at', { ascending: false })
            .range(from, to),
    ]);

    if (memberCountResult.error) {
        console.error('Admin member bazi consultations count query error:', memberCountResult.error);
    }

    if (guestCountResult.error) {
        console.error('Admin guest bazi consultations count query error:', guestCountResult.error);
    }

    if (memberResult.error) {
        console.error('Admin member bazi consultations query error:', memberResult.error);
    }

    if (guestResult.error) {
        console.error('Admin guest bazi consultations query error:', guestResult.error);
    }

    const memberRows = (memberResult.data || []) as MemberBaziRow[];
    const guestRows = (guestResult.data || []) as GuestBaziRow[];
    const profilesById = await getMemberProfiles(
        adminSupabase,
        Array.from(new Set(memberRows.map((row) => row.user_id).filter(Boolean)))
    );

    const memberConsultations = memberRows.map((row): AdminBaziConsultation => {
        const profile = profilesById.get(row.user_id);
        const fallbackName = profile?.email ? profile.email.split('@')[0] : '회원';

        return {
            id: row.id,
            type: 'member',
            ownerLabel: profile?.name || fallbackName,
            ownerMeta: profile?.email || row.user_id,
            subjectName: row.subject_name,
            requestDate: row.request_date_kst,
            baziResult: row.bazi_result,
            prompt: row.prompt,
            resultText: row.result_text,
            promptVersion: row.prompt_version,
            generationMetadata: row.generation_metadata,
            status: row.status || 'pending',
            completedAt: row.completed_at,
            errorMessage: row.error_message,
            createdAt: row.created_at,
        };
    });

    const guestConsultations = guestRows.map((row): AdminBaziConsultation => ({
        id: row.id,
        type: 'guest',
        ownerLabel: row.claimed_user_id ? '회원 전환 완료' : '비회원',
        ownerMeta: `Guest ${row.guest_id.slice(0, 8)}`,
        subjectName: row.subject_name,
        requestDate: row.request_date_kst,
        baziResult: row.bazi_result,
        prompt: row.prompt,
        resultText: row.result_text,
        promptVersion: row.prompt_version,
        generationMetadata: row.generation_metadata,
        status: row.status || 'pending',
        completedAt: row.completed_at,
        errorMessage: row.error_message,
        createdAt: row.created_at,
    }));

    const totalCount = (memberCountResult.count || 0) + (guestCountResult.count || 0);
    const consultations = [...memberConsultations, ...guestConsultations]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice((currentPage - 1) * BAZI_PAGE_SIZE, currentPage * BAZI_PAGE_SIZE);

    return {
        consultations,
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / BAZI_PAGE_SIZE)),
    };
}

async function getMemberProfiles(
    adminSupabase: Awaited<ReturnType<typeof createAdminClient>>,
    memberIds: string[]
) {
    if (memberIds.length === 0) return new Map<string, MemberProfile>();

    const { data, error } = await adminSupabase
        .from('members')
        .select('id, email, name')
        .in('id', memberIds);

    if (error) {
        console.error('Admin bazi member profile query error:', error);
        return new Map<string, MemberProfile>();
    }

    return new Map(((data || []) as MemberProfile[]).map((profile) => [profile.id, profile]));
}

function getKstDateNDaysAgo(daysAgo: number) {
    const date = new Date(Date.now() + 9 * 60 * 60 * 1000);
    date.setUTCDate(date.getUTCDate() - daysAgo);
    return date.toISOString().slice(0, 10);
}
