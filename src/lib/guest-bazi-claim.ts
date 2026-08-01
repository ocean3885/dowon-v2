import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/utils/supabase/server';
import type { BaziResult } from '@/components/bazi/types';

const GUEST_ID_COOKIE = 'dowon_bazi_guest_id';

type GuestBaziConsultationRow = {
    id: string;
    request_date_kst: string;
    subject_name: string | null;
    bazi_result: BaziResult;
    prompt: string | null;
    result_text: string | null;
    status: string | null;
    completed_at: string | null;
    error_message: string | null;
    prompt_version: string | null;
    generation_metadata: unknown;
    created_at: string;
};

export async function claimGuestBaziConsultationsForUser(userId: string) {
    const cookieStore = await cookies();
    const guestId = cookieStore.get(GUEST_ID_COOKIE)?.value;

    if (!guestId) {
        return { claimed: 0, skipped: 0 };
    }

    const adminSupabase = await createAdminClient();
    return claimGuestBaziConsultations(adminSupabase, userId, guestId);
}

async function claimGuestBaziConsultations(adminSupabase: SupabaseClient, userId: string, guestId: string) {
    const { data, error } = await adminSupabase
        .from('guest_bazi_consultations')
        .select('id, request_date_kst, subject_name, bazi_result, prompt, result_text, status, completed_at, error_message, prompt_version, generation_metadata, created_at')
        .eq('guest_id', guestId)
        .is('claimed_user_id', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Guest bazi claim query error:', error);
        return { claimed: 0, skipped: 0 };
    }

    const guestConsultations = (data || []) as GuestBaziConsultationRow[];
    let claimed = 0;
    let skipped = 0;

    for (const consultation of guestConsultations) {
        const { data: existingByDate, error: existingByDateError } = await adminSupabase
            .from('free_bazi_consultations')
            .select('id')
            .eq('user_id', userId)
            .eq('request_date_kst', consultation.request_date_kst)
            .maybeSingle();

        if (existingByDateError) {
            console.error('Guest bazi claim duplicate-date check error:', existingByDateError);
            skipped += 1;
            continue;
        }

        if (existingByDate) {
            await markGuestConsultationClaimed(adminSupabase, consultation.id, userId);
            skipped += 1;
            continue;
        }

        const { error: insertError } = await adminSupabase
            .from('free_bazi_consultations')
            .insert({
                user_id: userId,
                source_guest_consultation_id: consultation.id,
                subject_name: consultation.subject_name,
                request_date_kst: consultation.request_date_kst,
                bazi_result: consultation.bazi_result,
                prompt: consultation.prompt,
                result_text: consultation.result_text,
                status: consultation.status || 'pending',
                completed_at: consultation.completed_at,
                error_message: consultation.error_message,
                prompt_version: consultation.prompt_version,
                generation_metadata: consultation.generation_metadata,
                created_at: consultation.created_at,
            });

        if (insertError) {
            console.error('Guest bazi claim insert error:', insertError);
            skipped += 1;
            continue;
        }

        await markGuestConsultationClaimed(adminSupabase, consultation.id, userId);
        claimed += 1;
    }

    return { claimed, skipped };
}

async function markGuestConsultationClaimed(adminSupabase: SupabaseClient, consultationId: string, userId: string) {
    const { error } = await adminSupabase
        .from('guest_bazi_consultations')
        .update({
            claimed_user_id: userId,
            claimed_at: new Date().toISOString(),
        })
        .eq('id', consultationId);

    if (error) {
        console.error('Guest bazi claim marker update error:', error);
    }
}
