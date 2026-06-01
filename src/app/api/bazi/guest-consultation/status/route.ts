import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/utils/supabase/server';
import { getGuestDailyLimit, getKstDateString } from '@/lib/bazi-consultation';

const GUEST_ID_COOKIE = 'dowon_bazi_guest_id';

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user?.id) {
        return NextResponse.json({
            hasRequestedToday: false,
            isMember: true,
            isGuestDailyLimitReached: false,
        });
    }

    const guestId = request.cookies.get(GUEST_ID_COOKIE)?.value;
    const requestDateKst = getKstDateString();

    try {
        const adminSupabase = await createAdminClient();
        const dailyLimit = await getGuestDailyLimit(adminSupabase);
        let isGuestDailyLimitReached = false;

        if (dailyLimit.enabled) {
            const { count, error: countError } = await adminSupabase
                .from('guest_bazi_consultations')
                .select('id', { count: 'exact', head: true })
                .eq('request_date_kst', requestDateKst);

            if (countError) throw countError;
            isGuestDailyLimitReached = (count || 0) >= dailyLimit.limit;
        }

        if (!guestId) {
            return NextResponse.json({
                hasRequestedToday: false,
                isMember: false,
                isGuestDailyLimitReached,
            });
        }

        const { data: existing, error } = await adminSupabase
            .from('guest_bazi_consultations')
            .select('id')
            .eq('guest_id', guestId)
            .eq('request_date_kst', requestDateKst)
            .maybeSingle();

        if (error) throw error;

        return NextResponse.json({
            hasRequestedToday: !!existing,
            isMember: false,
            isGuestDailyLimitReached,
        });
    } catch (error) {
        console.error('Check guest bazi consultation status error:', error);
        return NextResponse.json(
            {
                hasRequestedToday: false,
                isMember: false,
                isGuestDailyLimitReached: false,
                message: '조회 중 오류가 발생했습니다.',
            },
        );
    }
}
