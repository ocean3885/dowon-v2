import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
        return NextResponse.json(
            { hasRequestedToday: false, message: '로그인하지 않은 상태입니다.' }
        );
    }

    try {
        // Check if the user is an admin or staff member
        const { data: member } = await supabase
            .from('members')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        const isAdminOrStaff = member?.role === 'admin' || member?.role === 'staff';

        if (isAdminOrStaff) {
            // Administrators and staff have absolutely no limits
            return NextResponse.json({
                hasRequestedToday: false,
                isAdmin: true
            });
        }

        const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
        const requestDateKst = kstNow.toISOString().slice(0, 10);

        const { data: existing, error } = await supabase
            .from('free_bazi_consultations')
            .select('id')
            .eq('user_id', user.id)
            .eq('request_date_kst', requestDateKst)
            .maybeSingle();

        if (error) throw error;

        return NextResponse.json({
            hasRequestedToday: !!existing,
            isAdmin: false
        });
    } catch (error) {
        console.error('Check free bazi consultation status error:', error);
        return NextResponse.json(
            { hasRequestedToday: false, message: '조회 중 오류가 발생했습니다.' }
        );
    }
}
