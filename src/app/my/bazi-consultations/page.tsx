import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ArrowRight, ChevronLeft, ChevronRight, FileText, Sparkles } from 'lucide-react';
import { createAdminClient, createClient } from '@/utils/supabase/server';
import type { BaziResult } from '@/components/bazi/types';
import { BaziConsultationItem } from '@/components/bazi/BaziConsultationItem';

const GUEST_ID_COOKIE = 'dowon_bazi_guest_id';

type FreeBaziConsultationRow = {
    id: string;
    subject_name: string | null;
    request_date_kst: string;
    bazi_result: BaziResult;
    result_text: string | null;
    status: string | null;
    created_at: string;
};

type SearchParams = Promise<{ page?: string }>;

export default async function MyBaziConsultationsPage({ searchParams }: { searchParams: SearchParams }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        if (await hasGuestBaziConsultations()) {
            redirect('/bazi/guest-consultations');
        }

        redirect('/login');
    }

    const params = await searchParams;
    const currentPage = Math.max(1, parseInt(params.page || '1', 10));
    const itemsPerPage = 8;

    const adminSupabase = await createAdminClient();

    // 1. Get total count
    const { count, error: countError } = await adminSupabase
        .from('free_bazi_consultations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

    if (countError) {
        console.error('My free bazi consultations count query error:', countError);
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // 2. Fetch paginated data
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data, error } = await adminSupabase
        .from('free_bazi_consultations')
        .select('id, subject_name, request_date_kst, bazi_result, result_text, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('My free bazi consultations query error:', error);
    }

    const consultations = (data || []) as FreeBaziConsultationRow[];

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
                    <div className="relative">
                        <div>
                            <p className="font-serif text-lg text-[#d0a66d]">AI 원국 해설</p>
                            <h1 className="mt-3 font-serif text-3xl font-light tracking-normal text-white sm:text-4xl">
                                무료 사주 원국 해설
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/74 break-keep">
                                도원만의 사주 분석 기준을 바탕으로 AI가 정리한 무료 해설을 모아 확인할 수 있습니다.
                            </p>
                        </div>
                    </div>
                </div>

                {error || countError ? (
                    <div className="mt-8 rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700">
                        <FileText className="mx-auto h-10 w-10" strokeWidth={1.5} />
                        <p className="mt-5 text-lg font-semibold">무료 사주 원국 해설을 불러오지 못했습니다.</p>
                        <p className="mt-3 text-sm leading-7">잠시 후 다시 시도해주세요.</p>
                    </div>
                ) : consultations.length === 0 ? (
                    <div className="mt-8 rounded-lg border border-[#ded4c8] bg-white/80 px-6 py-12 text-center shadow-[0_18px_55px_rgba(70,54,36,0.08)]">
                        <Sparkles className="mx-auto h-11 w-11 text-[#a87943]" strokeWidth={1.5} />
                        <p className="mt-5 text-lg font-semibold text-[#2a2119]">아직 저장된 원국 해설이 없습니다.</p>
                        <p className="mt-3 text-sm leading-7 text-[#746a61] break-keep">
                            만세력 조회 후 무료상담신청을 하면 이곳에서 전체 해설을 확인할 수 있습니다.
                        </p>
                        <Link
                            href="/bazi"
                            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#bd8a4c] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#aa793d]"
                        >
                            만세력 보기
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="mt-8 grid gap-5">
                            {consultations.map((consultation) => (
                                <BaziConsultationItem key={consultation.id} consultation={consultation} />
                            ))}
                        </div>

                        {/* Pagination controls */}
                        {totalPages > 1 && (
                            <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="페이지 네비게이션">
                                {/* Previous Page Link */}
                                <Link
                                    href={currentPage > 1 ? `/my/bazi-consultations?page=${currentPage - 1}` : '#'}
                                    aria-disabled={currentPage === 1}
                                    className={`inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#ded4c8] bg-white text-sm font-semibold transition-colors ${
                                        currentPage === 1
                                            ? 'pointer-events-none opacity-40 text-[#746a61]'
                                            : 'text-[#66584a] hover:bg-[#f7efe4] hover:text-[#7a542a]'
                                    }`}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Link>

                                {/* Page Numbers */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                                    const isCurrent = pageNum === currentPage;
                                    return (
                                        <Link
                                            key={pageNum}
                                            href={`/my/bazi-consultations?page=${pageNum}`}
                                            aria-current={isCurrent ? 'page' : undefined}
                                            className={`inline-flex h-10 w-10 items-center justify-center rounded-md border text-sm font-semibold transition-colors ${
                                                isCurrent
                                                    ? 'border-[#bd8a4c] bg-[#bd8a4c] text-white shadow-sm'
                                                    : 'border-[#ded4c8] bg-white text-[#66584a] hover:bg-[#f7efe4] hover:text-[#7a542a]'
                                            }`}
                                        >
                                            {pageNum}
                                        </Link>
                                    );
                                })}

                                {/* Next Page Link */}
                                <Link
                                    href={currentPage < totalPages ? `/my/bazi-consultations?page=${currentPage + 1}` : '#'}
                                    aria-disabled={currentPage === totalPages}
                                    className={`inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#ded4c8] bg-white text-sm font-semibold transition-colors ${
                                        currentPage === totalPages
                                            ? 'pointer-events-none opacity-40 text-[#746a61]'
                                            : 'text-[#66584a] hover:bg-[#f7efe4] hover:text-[#7a542a]'
                                    }`}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </nav>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}

async function hasGuestBaziConsultations() {
    const cookieStore = await cookies();
    const guestId = cookieStore.get(GUEST_ID_COOKIE)?.value;

    if (!guestId) return false;

    const adminSupabase = await createAdminClient();
    const { count, error } = await adminSupabase
        .from('guest_bazi_consultations')
        .select('id', { count: 'exact', head: true })
        .eq('guest_id', guestId)
        .is('claimed_user_id', null)
        .gt('expires_at', new Date().toISOString());

    if (error) {
        console.error('Guest free bazi consultations redirect check error:', error);
        return false;
    }

    return Boolean(count && count > 0);
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
