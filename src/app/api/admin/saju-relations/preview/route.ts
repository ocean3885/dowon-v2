import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { buildSajuRelationCases, dayPillars } from '@/lib/saju-relations';

type ExistingReading = {
    id: number;
    actor_char: string;
    target_char: string;
    actor_position: string;
    target_position: string;
    status: string;
    title: string;
    summary: string;
};

async function requireStaff() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { supabase, error: NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 }) };
    }

    const { data: member } = await supabase
        .from('members')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!member || !['admin', 'staff'].includes(member.role)) {
        return { supabase, error: NextResponse.json({ message: '관리자 권한이 필요합니다.' }, { status: 403 }) };
    }

    return { supabase, user, error: null };
}

export async function POST(request: NextRequest) {
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    let body: {
        relationType?: string;
        relationKey?: string;
        dayPillar?: string;
    };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
    }

    const relationType = String(body.relationType || '').trim();
    const relationKey = String(body.relationKey || '').trim();
    const dayPillar = String(body.dayPillar || '').trim();

    if (!relationType || !relationKey || !dayPillars.includes(dayPillar)) {
        return NextResponse.json({ message: '관계 유형, 관계 키, 기준 일주를 확인해주세요.' }, { status: 400 });
    }

    const cases = buildSajuRelationCases({ relationType, relationKey, dayPillar });

    if (cases.length === 0) {
        return NextResponse.json({ message: '생성 가능한 조합을 찾지 못했습니다.' }, { status: 400 });
    }

    const { data, error } = await auth.supabase
        .from('saju_relation_readings')
        .select('id, actor_char, target_char, actor_position, target_position, status, title, summary')
        .eq('relation_type', relationType)
        .eq('relation_key', relationKey)
        .eq('day_pillar', dayPillar);

    if (error) {
        return NextResponse.json({ message: '기존 데이터를 조회하지 못했습니다.' }, { status: 500 });
    }

    const existingReadings = (data || []) as ExistingReading[];
    const casesWithExisting = cases.map((item) => {
        const existing = existingReadings.find((reading) =>
            reading.actor_char === item.actor_char &&
            reading.target_char === item.target_char &&
            reading.actor_position === item.actor_position &&
            reading.target_position === item.target_position
        );

        return {
            ...item,
            existing: existing || null,
        };
    });

    return NextResponse.json({
        cases: casesWithExisting,
        total: casesWithExisting.length,
        existingCount: casesWithExisting.filter((item) => item.existing).length,
    });
}
