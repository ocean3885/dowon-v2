import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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

type PageParams = Promise<{ id: string }>;

export default async function GuestBaziConsultationDetailPage({ params }: { params: PageParams }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const guestId = cookieStore.get(GUEST_ID_COOKIE)?.value;

    if (!guestId) {
        notFound();
    }

    const adminSupabase = await createAdminClient();
    const { data, error } = await adminSupabase
        .from('guest_bazi_consultations')
        .select('id, subject_name, request_date_kst, bazi_result, result_text, status, created_at')
        .eq('id', id)
        .eq('guest_id', guestId)
        .is('claimed_user_id', null)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

    if (error) {
        console.error('Guest bazi consultation detail query error:', error);
    }

    if (!data) {
        notFound();
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#f8f2e9] px-5 pb-20 pt-28 text-[#211b16] sm:px-6 lg:px-10">
            <PageBackdrop />

            <section className="relative mx-auto max-w-5xl">
                <Link href="/bazi/guest-consultations" className="inline-flex h-10 items-center gap-2 rounded-md border border-[#ded4c8] bg-white/82 px-4 text-sm font-semibold text-[#66584a] transition hover:bg-[#f7efe4] hover:text-[#7a542a]">
                    <ArrowLeft className="h-4 w-4" />
                    목록으로
                </Link>

                <div className="mt-5">
                    <BaziConsultationItem consultation={data as GuestBaziConsultationRow} readOnly initiallyExpanded hideExpandToggle />
                </div>
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
