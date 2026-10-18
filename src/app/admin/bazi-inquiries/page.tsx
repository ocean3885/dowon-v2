import { createAdminClient } from '@/utils/supabase/server';
import AdminBaziInquiryList, { type BaziInquiryItem } from '@/components/admin/AdminBaziInquiryList';
import type { BaziResult } from '@/components/bazi/types';
import { Users, Calendar, Sparkles, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

type SearchParams = Promise<{
    page?: string;
    search?: string;
    gender?: string;
}>;

interface InquiryRow {
    id: string;
    user_id: string | null;
    subject_name: string | null;
    gender: string;
    birth_year: number;
    birth_month: number;
    birth_day: number;
    birth_hour: number;
    birth_min: number;
    calendar_type: string;
    bazi_result: unknown;
    client_ip: string | null;
    created_at: string;
}

interface MemberRow {
    id: string;
    name: string | null;
    email: string | null;
}

function getTodayStartUtc(): string {
    const todayKst = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return new Date(`${todayKst}T00:00:00+09:00`).toISOString();
}

export default async function AdminBaziInquiriesPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const currentPage = Math.max(1, parseInt(params.page || '1', 10));
    const searchQuery = (params.search || '').trim();
    const genderFilter = (params.gender || '').trim();

    const adminSupabase = await createAdminClient();

    let query = adminSupabase
        .from('bazi_inquiry_logs')
        .select(`
            id,
            user_id,
            subject_name,
            gender,
            birth_year,
            birth_month,
            birth_day,
            birth_hour,
            birth_min,
            calendar_type,
            bazi_result,
            client_ip,
            created_at
        `, { count: 'exact' });

    if (searchQuery) {
        query = query.ilike('subject_name', `%${searchQuery}%`);
    }

    if (genderFilter) {
        query = query.eq('gender', genderFilter);
    }

    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data: rows, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

    // If table does not exist yet (migration needed)
    const isTableMissing = error && (
        error.code === '42P01' ||
        error.code === 'PGRST205' ||
        (typeof error.message === 'string' && (
            error.message.includes('relation "public.bazi_inquiry_logs" does not exist') ||
            error.message.includes('Could not find the table')
        ))
    );

    if (isTableMissing) {
        return (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-6 text-stone-800">
                <div className="flex items-center gap-2 text-amber-700 font-bold mb-2">
                    <Sparkles className="w-5 h-5" />
                    <span>만세력 조회 로그 테이블 생성이 필요합니다</span>
                </div>
                <p className="text-sm text-stone-600 mb-4 leading-relaxed">
                    데이터베이스에 <code>bazi_inquiry_logs</code> 테이블이 아직 생성되지 않았습니다. 아래 마이그레이션 SQL을 Supabase 대시보드의 SQL Editor에서 1회 실행해 주시면 즉시 모든 조회가 기록됩니다.
                </p>
                <div className="bg-stone-900 text-stone-100 p-4 rounded-lg font-mono text-xs overflow-x-auto select-all">
                    {`-- Supabase SQL Editor에서 실행할 스크립트
CREATE TABLE IF NOT EXISTS public.bazi_inquiry_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    subject_name TEXT,
    gender TEXT NOT NULL,
    birth_year INTEGER NOT NULL,
    birth_month INTEGER NOT NULL,
    birth_day INTEGER NOT NULL,
    birth_hour INTEGER NOT NULL,
    birth_min INTEGER NOT NULL,
    calendar_type TEXT NOT NULL,
    bazi_result JSONB NOT NULL,
    client_ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bazi_inquiry_logs_created_at_idx ON public.bazi_inquiry_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS bazi_inquiry_logs_subject_name_idx ON public.bazi_inquiry_logs (subject_name);

ALTER TABLE public.bazi_inquiry_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow staff to manage bazi inquiry logs"
  ON public.bazi_inquiry_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.members
      WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'staff')
    )
  );

GRANT ALL ON public.bazi_inquiry_logs TO authenticated, service_role;`}
                </div>
            </div>
        );
    }

    if (error) {
        console.error('Admin bazi inquiry logs query error:', error);
        return (
            <div className="rounded-xl border border-red-200 bg-red-50/60 p-6 text-stone-800">
                <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
                    <Sparkles className="w-5 h-5" />
                    <span>만세력 조회 기록을 불러오는 중 오류가 발생했습니다</span>
                </div>
                <p className="text-sm text-stone-600 mb-2">
                    {error.message || '데이터베이스 조회 중 오류가 발생했습니다.'}
                </p>
            </div>
        );
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

    // Fetch quick stats (Today count) in KST
    const startOfTodayUtc = getTodayStartUtc();
    const { count: todayCount } = await adminSupabase
        .from('bazi_inquiry_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfTodayUtc);

    // Fetch Member inquiries count
    const { count: memberCount } = await adminSupabase
        .from('bazi_inquiry_logs')
        .select('*', { count: 'exact', head: true })
        .not('user_id', 'is', null);

    // Batch load member profiles for inquiries that have user_id
    const inquiryRows = (rows as unknown as InquiryRow[]) || [];
    const userIds = Array.from(new Set(inquiryRows.map((row) => row.user_id).filter((id): id is string => Boolean(id))));
    const memberMap = new Map<string, MemberRow>();
    if (userIds.length > 0) {
        const { data: memberRows, error: memberError } = await adminSupabase
            .from('members')
            .select('id, name, email')
            .in('id', userIds);
        if (!memberError && memberRows) {
            (memberRows as MemberRow[]).forEach((m) => memberMap.set(m.id, m));
        }
    }

    const inquiries: BaziInquiryItem[] = inquiryRows.map((row) => {
        const member = row.user_id ? memberMap.get(row.user_id) : undefined;
        return {
            id: row.id,
            userId: row.user_id,
            userEmail: member?.email || null,
            userName: member?.name || null,
            subjectName: row.subject_name,
            gender: row.gender,
            birthYear: row.birth_year,
            birthMonth: row.birth_month,
            birthDay: row.birth_day,
            birthHour: row.birth_hour,
            birthMin: row.birth_min,
            calendarType: row.calendar_type,
            baziResult: row.bazi_result as BaziResult,
            clientIp: row.client_ip,
            createdAt: row.created_at,
        };
    });

    return (
        <section>
            <div className="mb-6">
                <p className="text-sm font-semibold text-stone-400">Bazi Inquiries History</p>
                <h2 className="mt-1 text-2xl font-bold text-stone-800 font-serif">만세력로그</h2>
                <p className="mt-2 text-sm text-stone-500">
                    방문자가 /bazi 페이지에서 생년월일시를 입력하고 조회한 모든 사주 만세력 데이터를 실시간으로 보관하고 열람합니다.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between text-stone-500">
                        <span className="text-xs font-bold uppercase tracking-wider">전체 누적 조회</span>
                        <div className="p-2 bg-stone-100 rounded-lg text-stone-700">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-stone-800">
                        {totalCount.toLocaleString('ko-KR')} <span className="text-xs font-normal text-stone-500">건</span>
                    </p>
                </div>

                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between text-stone-500">
                        <span className="text-xs font-bold uppercase tracking-wider">오늘 조회</span>
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                            <Calendar className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-amber-600">
                        {(todayCount || 0).toLocaleString('ko-KR')} <span className="text-xs font-normal text-stone-500">건</span>
                    </p>
                </div>

                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between text-stone-500">
                        <span className="text-xs font-bold uppercase tracking-wider">회원 조회</span>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-green-700">
                        {(memberCount || 0).toLocaleString('ko-KR')} <span className="text-xs font-normal text-stone-500">건</span>
                    </p>
                </div>

                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between text-stone-500">
                        <span className="text-xs font-bold uppercase tracking-wider">비회원 조회</span>
                        <div className="p-2 bg-stone-50 rounded-lg text-stone-500">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-stone-600">
                        {(totalCount - (memberCount || 0)).toLocaleString('ko-KR')} <span className="text-xs font-normal text-stone-500">건</span>
                    </p>
                </div>
            </div>

            {/* Main Table List */}
            <AdminBaziInquiryList
                inquiries={inquiries}
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={PAGE_SIZE}
                searchQuery={searchQuery}
                genderFilter={genderFilter}
            />
        </section>
    );
}
