import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { ArrowRight, FileText, Sparkles } from 'lucide-react';
import { createAdminClient } from '@/utils/supabase/server';
import type { BaziResult } from '@/components/bazi/types';
import { BaziConsultationItem } from '@/components/bazi/BaziConsultationItem';

const GUEST_ID_COOKIE = 'dowon_bazi_guest_id';

type GuestBaziConsultationRow = {
    id: string;
    subject_name: string | null;
    request_date_kst: string;
    bazi_result: BaziResult;
    result_text: string | null;
    status: string | null;
    created_at: string;
};

export default async function GuestBaziConsultationsPage() {
    const cookieStore = await cookies();
    const guestId = cookieStore.get(GUEST_ID_COOKIE)?.value;
    let consultations: GuestBaziConsultationRow[] = [];
    let hasError = false;

    if (guestId) {
        const adminSupabase = await createAdminClient();
        const { data, error } = await adminSupabase
            .from('guest_bazi_consultations')
            .select('id, subject_name, request_date_kst, bazi_result, result_text, status, created_at')
            .eq('guest_id', guestId)
            .is('claimed_user_id', null)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(30);

        if (error) {
            console.error('Guest free bazi consultations query error:', error);
            hasError = true;
        } else {
            consultations = (data || []) as GuestBaziConsultationRow[];
        }
    }

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
                        <p className="font-serif text-lg text-[#d0a66d]">AI 원국 해설</p>
                        <h1 className="mt-3 font-serif text-3xl font-light tracking-normal text-white sm:text-4xl">
                            비회원 해설 보관함
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/74 break-keep">
                            현재 브라우저에서 신청한 비회원 무료 해설을 확인할 수 있습니다. 쿠키 삭제, 시크릿 모드, 기기 변경 시 이전 결과를 찾기 어려울 수 있습니다.
                        </p>
                    </div>
                </div>

                <div className="mt-6 rounded-lg border border-[#ead9c8] bg-white/72 px-5 py-4 text-sm leading-7 text-[#6a5b4d] shadow-[0_12px_32px_rgba(58,42,29,0.05)]">
                    비회원 결과는 임시 보관용입니다. 계속 보관하고 싶다면 회원가입 후 마이페이지 보관함을 이용해주세요.
                </div>

                {hasError ? (
                    <div className="mt-8 rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700">
                        <FileText className="mx-auto h-10 w-10" strokeWidth={1.5} />
                        <p className="mt-5 text-lg font-semibold">비회원 무료 해설을 불러오지 못했습니다.</p>
                        <p className="mt-3 text-sm leading-7">잠시 후 다시 시도해주세요.</p>
                    </div>
                ) : consultations.length === 0 ? (
                    <div className="mt-8 rounded-lg border border-[#ded4c8] bg-white/80 px-6 py-12 text-center shadow-[0_18px_55px_rgba(70,54,36,0.08)]">
                        <Sparkles className="mx-auto h-11 w-11 text-[#a87943]" strokeWidth={1.5} />
                        <p className="mt-5 text-lg font-semibold text-[#2a2119]">아직 이 브라우저에 저장된 해설이 없습니다.</p>
                        <p className="mt-3 text-sm leading-7 text-[#746a61] break-keep">
                            만세력 조회 후 무료상담신청을 하면 이곳에서 해설을 확인할 수 있습니다.
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
                    <div className="mt-8 grid gap-5">
                        {consultations.map((consultation) => (
                            <BaziConsultationItem key={consultation.id} consultation={consultation} readOnly />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

function PageBackdrop() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(177,132,77,0.10),transparent_24%),radial-gradient(circle_at_88%_12%,rgba(45,35,25,0.08),transparent_22%)]" />
            <div className="absolute -right-16 top-24 h-64 w-64 rounded-full border border-[#d8c8b5]/55" />
            <div className="absolute -left-24 bottom-20 h-80 w-80 rounded-full border border-[#e5d8c8]/70" />
        </div>
    );
}
