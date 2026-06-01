import Link from 'next/link';
import { ChevronLeft, ChevronRight, Mail, Phone, Search, ShieldCheck, UserRound } from 'lucide-react';
import { createAdminClient } from '@/utils/supabase/server';

type SearchParams = Promise<{ page?: string; q?: string; role?: string }>;

type MemberRow = {
    id: string;
    email: string;
    name: string | null;
    role: string | null;
    phone: string | null;
    birth_date: string | null;
    created_at: string | null;
};

type MemberStats = {
    submitCount: number;
    baziCount: number;
    lastSubmitAt: string | null;
    lastBaziAt: string | null;
};

type GuestDailyStats = {
    requestDate: string;
    totalCount: number;
    pendingCount: number;
    completedCount: number;
    failedCount: number;
};

const roleLabels: Record<string, string> = {
    admin: '관리자',
    staff: '스태프',
    user: '회원',
};

export default async function AdminMembersPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const currentPage = Math.max(1, parseInt(params.page || '1', 10));
    const query = (params.q || '').trim();
    const role = (params.role || '').trim();
    const itemsPerPage = 20;
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const adminSupabase = await createAdminClient();
    let membersQuery = adminSupabase
        .from('members')
        .select('id, email, name, role, phone, birth_date, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (query) {
        const escapedQuery = escapeIlike(query);
        membersQuery = membersQuery.or(`email.ilike.%${escapedQuery}%,name.ilike.%${escapedQuery}%,phone.ilike.%${escapedQuery}%`);
    }

    if (role && role !== 'all') {
        membersQuery = membersQuery.eq('role', role);
    }

    const { data, count, error } = await membersQuery;
    const members = (data || []) as MemberRow[];
    const memberIds = members.map((member) => member.id);
    const statsByUserId = memberIds.length > 0
        ? await getMemberStats(adminSupabase, memberIds)
        : new Map<string, MemberStats>();
    const guestDailyStats = await getGuestDailyStats(adminSupabase);

    const totalCount = count || 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

    return (
        <section>
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-sm font-semibold text-stone-400">Members</p>
                    <h2 className="mt-1 text-2xl font-bold text-stone-700">회원 관리</h2>
                    <p className="mt-2 text-sm text-stone-500">가입 회원 정보와 상담 이용 현황을 확인합니다.</p>
                </div>

                <form className="flex flex-col gap-2 sm:flex-row" action="/admin/members">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                        <input
                            type="search"
                            name="q"
                            defaultValue={query}
                            placeholder="이름, 이메일, 연락처 검색"
                            className="h-11 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-sm text-stone-700 outline-none transition focus:border-stone-400 sm:w-72"
                        />
                    </div>
                    <select
                        name="role"
                        defaultValue={role || 'all'}
                        className="h-11 rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium text-stone-600 outline-none transition focus:border-stone-400"
                    >
                        <option value="all">전체 권한</option>
                        <option value="admin">관리자</option>
                        <option value="staff">스태프</option>
                        <option value="user">회원</option>
                    </select>
                    <button className="inline-flex h-11 items-center justify-center rounded-lg bg-stone-800 px-5 text-sm font-semibold text-white transition-colors hover:bg-stone-700">
                        검색
                    </button>
                </form>
            </div>

            <GuestDailyStatsSection stats={guestDailyStats} />

            {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
                    회원 목록을 불러오지 못했습니다.
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
                        <p className="text-sm font-semibold text-stone-500">총 {totalCount.toLocaleString('ko-KR')}명</p>
                        <p className="text-xs text-stone-400">최근 가입순</p>
                    </div>

                    {members.length === 0 ? (
                        <div className="px-5 py-14 text-center">
                            <UserRound className="mx-auto h-10 w-10 text-stone-300" strokeWidth={1.5} />
                            <p className="mt-4 text-base font-semibold text-stone-600">조건에 맞는 회원이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-stone-100 text-left">
                                <thead className="bg-stone-50 text-xs font-bold uppercase tracking-wide text-stone-400">
                                    <tr>
                                        <th className="px-5 py-3">회원</th>
                                        <th className="px-5 py-3">권한</th>
                                        <th className="px-5 py-3">연락처</th>
                                        <th className="px-5 py-3">생년월일</th>
                                        <th className="px-5 py-3">상담</th>
                                        <th className="px-5 py-3">무료 해설</th>
                                        <th className="px-5 py-3">가입일</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {members.map((member) => {
                                        const stats = statsByUserId.get(member.id) || defaultStats;

                                        return (
                                            <tr key={member.id} className="align-top transition-colors hover:bg-stone-50/70">
                                                <td className="px-5 py-4">
                                                    <div className="min-w-56">
                                                        <p className="font-bold text-stone-800">{member.name || member.email.split('@')[0]}</p>
                                                        <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-500">
                                                            <Mail className="h-3.5 w-3.5" />
                                                            {member.email}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-bold ${getRoleClass(member.role)}`}>
                                                        <ShieldCheck className="h-3.5 w-3.5" />
                                                        {formatRole(member.role)}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-stone-600">
                                                    {member.phone ? (
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <Phone className="h-3.5 w-3.5 text-stone-400" />
                                                            {member.phone}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-stone-600">{member.birth_date || '-'}</td>
                                                <td className="px-5 py-4">
                                                    <UsageCount count={stats.submitCount} lastAt={stats.lastSubmitAt} />
                                                </td>
                                                <td className="px-5 py-4">
                                                    <UsageCount count={stats.baziCount} lastAt={stats.lastBaziAt} />
                                                </td>
                                                <td className="px-5 py-4 text-sm text-stone-600">{formatDate(member.created_at)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            query={query}
                            role={role}
                        />
                    )}
                </div>
            )}
        </section>
    );
}

function GuestDailyStatsSection({ stats }: { stats: GuestDailyStats[] }) {
    return (
        <div className="mb-8 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-stone-400">Guest Bazi</p>
                    <h3 className="mt-1 text-xl font-bold text-stone-700">날짜별 비회원 무료 해설 신청</h3>
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

function UsageCount({ count, lastAt }: { count: number; lastAt: string | null }) {
    return (
        <div>
            <p className="text-sm font-bold text-stone-800">{count.toLocaleString('ko-KR')}건</p>
            <p className="mt-1 text-xs text-stone-400">{lastAt ? `최근 ${formatDate(lastAt)}` : '이력 없음'}</p>
        </div>
    );
}

function Pagination({
    currentPage,
    totalPages,
    query,
    role,
}: {
    currentPage: number;
    totalPages: number;
    query: string;
    role: string;
}) {
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
        .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2);

    return (
        <nav className="flex flex-wrap items-center justify-center gap-1.5 border-t border-stone-100 px-5 py-4" aria-label="회원 페이지 네비게이션">
            <PageLink page={currentPage - 1} disabled={currentPage === 1} query={query} role={role}>
                <ChevronLeft className="h-4 w-4" />
            </PageLink>
            {pages.map((page, index) => {
                const previous = pages[index - 1];
                const shouldShowGap = previous !== undefined && page - previous > 1;

                return (
                    <span key={page} className="flex items-center gap-1.5">
                        {shouldShowGap && <span className="px-1 text-sm text-stone-300">...</span>}
                        <PageLink page={page} active={page === currentPage} query={query} role={role}>
                            {page}
                        </PageLink>
                    </span>
                );
            })}
            <PageLink page={currentPage + 1} disabled={currentPage === totalPages} query={query} role={role}>
                <ChevronRight className="h-4 w-4" />
            </PageLink>
        </nav>
    );
}

function PageLink({
    page,
    active = false,
    disabled = false,
    query,
    role,
    children,
}: {
    page: number;
    active?: boolean;
    disabled?: boolean;
    query: string;
    role: string;
    children: React.ReactNode;
}) {
    const href = disabled ? '#' : buildMembersHref(page, query, role);

    return (
        <Link
            href={href}
            aria-disabled={disabled}
            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm font-semibold transition-colors ${
                active
                    ? 'border-stone-800 bg-stone-800 text-white'
                    : disabled
                        ? 'pointer-events-none border-stone-100 bg-stone-50 text-stone-300'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
            }`}
        >
            {children}
        </Link>
    );
}

async function getMemberStats(adminSupabase: Awaited<ReturnType<typeof createAdminClient>>, memberIds: string[]) {
    const [submitsResult, baziResult] = await Promise.all([
        adminSupabase
            .from('submits')
            .select('user_id, created_at')
            .in('user_id', memberIds),
        adminSupabase
            .from('free_bazi_consultations')
            .select('user_id, created_at')
            .in('user_id', memberIds),
    ]);

    if (submitsResult.error) {
        console.error('Admin member submit stats query error:', submitsResult.error);
    }

    if (baziResult.error) {
        console.error('Admin member bazi stats query error:', baziResult.error);
    }

    const stats = new Map<string, MemberStats>();
    memberIds.forEach((id) => stats.set(id, { ...defaultStats }));

    (submitsResult.data || []).forEach((row) => {
        if (!row.user_id) return;
        const current = stats.get(row.user_id) || { ...defaultStats };
        current.submitCount += 1;
        current.lastSubmitAt = getLatestDate(current.lastSubmitAt, row.created_at);
        stats.set(row.user_id, current);
    });

    (baziResult.data || []).forEach((row) => {
        if (!row.user_id) return;
        const current = stats.get(row.user_id) || { ...defaultStats };
        current.baziCount += 1;
        current.lastBaziAt = getLatestDate(current.lastBaziAt, row.created_at);
        stats.set(row.user_id, current);
    });

    return stats;
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

const defaultStats: MemberStats = {
    submitCount: 0,
    baziCount: 0,
    lastSubmitAt: null,
    lastBaziAt: null,
};

function getLatestDate(current: string | null, next: string | null) {
    if (!next) return current;
    if (!current) return next;
    return new Date(next).getTime() > new Date(current).getTime() ? next : current;
}

function buildMembersHref(page: number, query: string, role: string) {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (query) params.set('q', query);
    if (role && role !== 'all') params.set('role', role);
    const qs = params.toString();
    return qs ? `/admin/members?${qs}` : '/admin/members';
}

function formatRole(role?: string | null) {
    return role ? roleLabels[role] || role : '-';
}

function getRoleClass(role?: string | null) {
    if (role === 'admin') return 'bg-stone-800 text-white';
    if (role === 'staff') return 'bg-blue-50 text-blue-700';
    return 'bg-amber-50 text-amber-700';
}

function formatDate(value?: string | null) {
    if (!value) return '-';
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(value));
}

function escapeIlike(value: string) {
    return value.replace(/[%_,]/g, (match) => `\\${match}`);
}

function getKstDateNDaysAgo(daysAgo: number) {
    const date = new Date(Date.now() + 9 * 60 * 60 * 1000);
    date.setUTCDate(date.getUTCDate() - daysAgo);
    return date.toISOString().slice(0, 10);
}
