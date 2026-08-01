import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createAdminClient, createClient } from '@/utils/supabase/server';
import type { BaziResult } from '@/components/bazi/types';
import { BaziConsultationItem } from '@/components/bazi/BaziConsultationItem';

type FreeBaziConsultationRow = {
    id: string;
    subject_name: string | null;
    request_date_kst: string;
    bazi_result: BaziResult;
    result_text: string | null;
    status: string | null;
    created_at: string;
};

type PageParams = Promise<{ id: string }>;

export default async function MyBaziConsultationDetailPage({ params }: { params: PageParams }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const adminSupabase = await createAdminClient();
    const { data, error } = await adminSupabase
        .from('free_bazi_consultations')
        .select('id, subject_name, request_date_kst, bazi_result, result_text, status, created_at')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) {
        console.error('My free bazi consultation detail query error:', error);
    }

    if (!data) {
        notFound();
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#f8f2e9] px-5 pb-20 pt-28 text-[#211b16] sm:px-6 lg:px-10">
            <PageBackdrop />

            <section className="relative mx-auto max-w-5xl">
                <Link href="/my/bazi-consultations" className="inline-flex h-10 items-center gap-2 rounded-md border border-[#ded4c8] bg-white/82 px-4 text-sm font-semibold text-[#66584a] transition hover:bg-[#f7efe4] hover:text-[#7a542a]">
                    <ArrowLeft className="h-4 w-4" />
                    목록으로
                </Link>

                <div className="mt-5">
                    <BaziConsultationItem
                        consultation={data as FreeBaziConsultationRow}
                        initiallyExpanded
                        hideExpandToggle
                        deleteRedirectTo="/my/bazi-consultations"
                        spaciousText
                    />
                </div>

                <div className="mt-8 flex justify-center">
                    <Link href="/my/bazi-consultations" className="inline-flex h-10 items-center gap-2 rounded-md border border-[#ded4c8] bg-white/82 px-4 text-sm font-semibold text-[#66584a] transition hover:bg-[#f7efe4] hover:text-[#7a542a]">
                        <ArrowLeft className="h-4 w-4" />
                        목록으로
                    </Link>
                </div>
            </section>
        </main>
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
