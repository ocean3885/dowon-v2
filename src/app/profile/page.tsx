import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
    ArrowRight,
    CalendarDays,
    ClipboardList,
    LogOut,
    Mail,
    Phone,
    UserRound,
} from 'lucide-react';
import { logout } from '@/lib/actions';
import DeleteAccountButton from '@/components/profile/DeleteAccountButton';
import { createAdminClient, createClient } from '@/utils/supabase/server';

type MemberRow = {
    email: string | null;
    name: string | null;
    phone: string | null;
    birth_date: string | null;
    created_at: string | null;
};

type RecentSubmitRow = {
    id: number;
    service_type: string;
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
    pending: 'border-[#d6bd9a] bg-[#fff7eb] text-[#8a5a20]',
    contacted: 'border-[#b9c8dd] bg-[#eef5ff] text-[#315f99]',
    completed: 'border-[#b8d4c1] bg-[#eefaf1] text-[#347247]',
    cancelled: 'border-[#e2b8b8] bg-[#fff0f0] text-[#a64242]',
};

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const adminSupabase = await createAdminClient();
    const [{ data: memberData }, { data: submitData, error: submitError }] = await Promise.all([
        adminSupabase
            .from('members')
            .select('email, name, phone, birth_date, created_at')
            .eq('id', user.id)
            .maybeSingle(),
        adminSupabase
            .from('submits')
            .select('id, service_type, status, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
    ]);

    if (submitError) {
        console.error('Recent profile applications query error:', submitError);
    }

    const member = memberData as MemberRow | null;
    const applications = (submitData || []) as RecentSubmitRow[];
    const displayName = member?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || '회원';

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#f8f2e9] px-5 pb-20 pt-28 text-[#211b16] sm:px-6 lg:px-10">
            <PageBackdrop />
            <section className="relative mx-auto max-w-6xl">
                <div className="relative overflow-hidden rounded-lg border border-[#ded4c8] bg-[#211b16] px-6 py-7 text-white shadow-[0_18px_55px_rgba(70,54,36,0.07)] sm:px-8 md:px-10">
                    <Image
                        src="/counseling/subimage8.webp"
                        alt=""
                        fill
                        priority
                        sizes="(min-width: 1024px) 1152px, 100vw"
                        className="object-cover object-center opacity-50"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(22,18,14,0.9),rgba(22,18,14,0.64)_54%,rgba(22,18,14,0.28))]" />
                    <div className="relative max-w-2xl">
                        <p className="font-serif text-lg text-[#d0a66d]">프로필</p>
                        <h1 className="mt-3 font-serif text-3xl font-light tracking-normal text-white sm:text-4xl">
                            {displayName}님의 마이페이지
                        </h1>
                        <p className="mt-4 text-sm leading-7 text-white/76 break-keep">
                            기본 연락 정보와 최근 상담 신청 상태를 한곳에서 확인할 수 있습니다.
                        </p>
                    </div>
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
                    <div className="grid content-start gap-5">
                        <section className="rounded-lg border border-[#ded4c8] bg-white/84 p-5 shadow-[0_14px_40px_rgba(70,54,36,0.07)] sm:p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-md border border-[#ead9c1] bg-[#f7efe3] text-[#9a6b34]">
                                    <UserRound className="h-7 w-7" strokeWidth={1.6} />
                                </div>
                                <Link
                                    href="/profile/edit"
                                    className="inline-flex h-10 items-center justify-center rounded-md border border-[#d7c6af] px-4 text-sm font-semibold text-[#66584a] transition-colors hover:bg-[#f7efe4]"
                                >
                                    수정
                                </Link>
                            </div>
                            <h2 className="mt-5 font-serif text-2xl text-[#241c15]">{displayName}</h2>
                            <dl className="mt-5 grid gap-4 text-sm">
                                <ProfileRow icon={<Mail className="h-4 w-4" />} label="이메일" value={member?.email || user.email || '-'} />
                                <ProfileRow icon={<Phone className="h-4 w-4" />} label="휴대폰" value={formatPhone(member?.phone)} />
                                <ProfileRow icon={<CalendarDays className="h-4 w-4" />} label="생년월일" value={formatBirthDate(member?.birth_date)} />
                                <ProfileRow icon={<UserRound className="h-4 w-4" />} label="가입일" value={formatDate(member?.created_at)} />
                            </dl>
                        </section>

                        <section className="rounded-lg border border-[#ded4c8] bg-white/76 p-5 shadow-[0_14px_40px_rgba(70,54,36,0.06)] sm:p-6">
                            <h2 className="font-serif text-xl text-[#241c15]">계정 관리</h2>
                            <div className="mt-4 grid gap-3">
                                <Link
                                    href="/profile/edit"
                                    className="inline-flex h-11 items-center justify-between rounded-md border border-[#eadfce] bg-[#fcfaf6] px-4 text-sm font-semibold text-[#594c40] transition-colors hover:bg-[#f7efe4]"
                                >
                                    프로필 정보 수정
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <form action={logout}>
                                    <button className="inline-flex h-11 w-full items-center justify-between rounded-md border border-[#eadfce] bg-[#fcfaf6] px-4 text-sm font-semibold text-[#594c40] transition-colors hover:bg-[#f7efe4]">
                                        로그아웃
                                        <LogOut className="h-4 w-4" />
                                    </button>
                                </form>
                                <DeleteAccountButton />
                            </div>
                        </section>
                    </div>

                    <section className="rounded-lg border border-[#ded4c8] bg-white/82 p-5 shadow-[0_18px_55px_rgba(70,54,36,0.08)] sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-[#a87943]">상담 신청</p>
                                <h2 className="mt-2 font-serif text-2xl text-[#241c15]">최근 신청 현황</h2>
                            </div>
                            <Link
                                href="/my/applications"
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#bd8a4c] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#aa793d]"
                            >
                                전체 보기
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {submitError ? (
                            <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-5 text-sm leading-7 text-red-700">
                                최근 신청 내역을 불러오지 못했습니다.
                            </div>
                        ) : applications.length === 0 ? (
                            <div className="mt-6 rounded-md border border-[#eee2d3] bg-[#fcfaf6] px-5 py-10 text-center">
                                <ClipboardList className="mx-auto h-10 w-10 text-[#a87943]" strokeWidth={1.5} />
                                <p className="mt-4 text-base font-semibold text-[#2a2119]">최근 상담 신청이 없습니다.</p>
                                <p className="mt-2 text-sm leading-7 text-[#746a61]">신청서를 접수하면 진행 상태가 이곳에 표시됩니다.</p>
                                <Link
                                    href="/submit"
                                    className="mt-5 inline-flex h-11 items-center justify-center rounded-md border border-[#d7c6af] px-5 text-sm font-semibold text-[#66584a] transition-colors hover:bg-[#f7efe4]"
                                >
                                    상담 신청하기
                                </Link>
                            </div>
                        ) : (
                            <div className="mt-6 grid gap-3">
                                {applications.map((application) => (
                                    <article
                                        key={application.id}
                                        className="flex flex-col gap-4 rounded-md border border-[#eee2d3] bg-[#fcfaf6] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[application.status] || statusStyles.pending}`}>
                                                    {statusLabels[application.status] || application.status}
                                                </span>
                                                <span className="text-sm font-semibold text-[#2a2119]">
                                                    {serviceLabels[application.service_type] || application.service_type}
                                                </span>
                                            </div>
                                            <p className="mt-3 text-sm text-[#746a61]">
                                                접수일 {formatDate(application.created_at)}
                                            </p>
                                        </div>
                                        <Link
                                            href="/my/applications"
                                            className="inline-flex h-10 shrink-0 items-center justify-center rounded-md border border-[#d7c6af] px-4 text-sm font-semibold text-[#66584a] transition-colors hover:bg-[#f7efe4]"
                                        >
                                            상세 보기
                                        </Link>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </section>
        </main>
    );
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="grid grid-cols-[20px_76px_minmax(0,1fr)] items-start gap-2">
            <dt className="mt-0.5 text-[#a87943]">{icon}</dt>
            <dt className="text-[#8a7d70]">{label}</dt>
            <dd className="min-w-0 break-all font-medium text-[#2f2923]">{value}</dd>
        </div>
    );
}

function PageBackdrop() {
    return (
        <>
            <div className="pointer-events-none absolute right-0 top-72 h-72 w-[70vw] max-w-[720px] opacity-[0.2] mix-blend-multiply md:top-64 md:h-[420px]">
                <Image
                    src="/bg_source/bg_mount3.webp"
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 768px) 720px, 70vw"
                    className="object-contain object-right-top"
                />
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-[68vw] max-w-[680px] opacity-[0.18] mix-blend-multiply md:h-[380px]">
                <Image
                    src="/bg_source/bg_mount4.webp"
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 768px) 680px, 68vw"
                    className="object-contain object-left-bottom"
                />
            </div>
        </>
    );
}

function formatPhone(value?: string | null) {
    const digits = value?.replace(/\D/g, '') || '';

    if (!digits) return '-';
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, digits.length === 10 ? 6 : 7)}-${digits.slice(digits.length === 10 ? 6 : 7)}`;
}

function formatBirthDate(value?: string | null) {
    if (!value) return '-';

    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(value));
}

function formatDate(value?: string | null) {
    if (!value) return '-';

    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(value));
}
