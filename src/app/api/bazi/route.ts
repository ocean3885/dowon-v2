import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/utils/supabase/server';

const BAZI_API_URL = 'https://bazi.dowon.ai.kr/';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const params = new URLSearchParams();

    for (const key of ['year', 'month', 'day', 'hour', 'min', 'sl', 'gen']) {
        const value = searchParams.get(key);
        if (!value) continue;

        params.set(
            key,
            ['month', 'day', 'hour', 'min'].includes(key) ? String(Number(value)) : value,
        );
    }

    try {
        const response = await fetch(`${BAZI_API_URL}?${params.toString()}`, {
            headers: {
                Accept: 'application/json',
            },
            cache: 'no-store',
        });

        const body = await response.text();

        if (!response.ok) {
            return NextResponse.json(
                { message: '만세력 정보를 불러오지 못했습니다.' },
                { status: response.status },
            );
        }

        // Parse result and asynchronously log inquiry data
        try {
            const baziData = JSON.parse(body);
            const subjectName = searchParams.get('name') || searchParams.get('subjectName') || '';
            const year = searchParams.get('year') || '0';
            const month = searchParams.get('month') || '0';
            const day = searchParams.get('day') || '0';
            const hour = searchParams.get('hour') || '0';
            const min = searchParams.get('min') || '0';
            const sl = searchParams.get('sl') || '1';
            const gen = searchParams.get('gen') || '1';

            const calendarLabel = sl === '0' ? '음력' : sl === '2' ? '윤달' : '양력';
            const genderLabel = gen === '1' ? '남' : '여';

            const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
            const userAgent = request.headers.get('user-agent') || null;

            let userId: string | null = null;
            try {
                const userClient = await createClient();
                const { data: { user } } = await userClient.auth.getUser();
                if (user?.id) userId = user.id;
            } catch {
                // Ignore auth error for guest
            }

            const adminClient = await createAdminClient();
            await adminClient.from('bazi_inquiry_logs').insert({
                user_id: userId,
                subject_name: subjectName.trim() || null,
                gender: genderLabel,
                birth_year: Number(year),
                birth_month: Number(month),
                birth_day: Number(day),
                birth_hour: Number(hour),
                birth_min: Number(min),
                calendar_type: calendarLabel,
                bazi_result: baziData,
                client_ip: clientIp,
                user_agent: userAgent,
            });
        } catch (logError) {
            // Logging failure should never block or fail the user's view
            console.warn('Bazi inquiry logging error:', logError);
        }

        return new NextResponse(body, {
            headers: {
                'Content-Type': response.headers.get('content-type') || 'application/json; charset=utf-8',
            },
        });
    } catch {
        return NextResponse.json(
            { message: '만세력 API 연결에 실패했습니다.' },
            { status: 502 },
        );
    }
}
