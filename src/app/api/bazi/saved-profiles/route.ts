import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/utils/supabase/server';

type SavedBaziProfileInput = {
    subjectName?: unknown;
    year?: unknown;
    month?: unknown;
    day?: unknown;
    hour?: unknown;
    min?: unknown;
    sl?: unknown;
    gen?: unknown;
};

type SavedBaziProfileRow = {
    id: string;
    label: string | null;
    subject_name: string | null;
    birth_year: string;
    birth_month: string;
    birth_day: string;
    birth_hour: string;
    birth_minute: string;
    calendar_type: string;
    gender: string;
    created_at: string;
    updated_at: string;
};

export async function GET() {
    const user = await getUser();
    if (!user?.id) {
        return NextResponse.json({ message: '로그인 후 이용할 수 있습니다.' }, { status: 401 });
    }

    try {
        const profiles = await listProfiles(user.id);
        return NextResponse.json({ profiles });
    } catch (error) {
        console.error('Saved bazi profiles query error:', error);
        return NextResponse.json(
            { message: '저장된 사주 정보를 불러오지 못했습니다.' },
            { status: 502 },
        );
    }
}

export async function POST(request: NextRequest) {
    const user = await getUser();
    if (!user?.id) {
        return NextResponse.json({ message: '로그인 후 저장할 수 있습니다.' }, { status: 401 });
    }

    let body: SavedBaziProfileInput;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
    }

    const normalized = normalizeInput(body);
    if (!normalized.ok) {
        return NextResponse.json({ message: normalized.message }, { status: 400 });
    }

    try {
        const adminSupabase = await createAdminClient();
        const { count, error: countError } = await adminSupabase
            .from('saved_bazi_profiles')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id);

        if (countError) throw countError;

        if ((count || 0) >= 30) {
            return NextResponse.json(
                { message: '저장 가능한 사주 정보는 최대 30개입니다. 기존 정보를 삭제한 뒤 다시 저장해주세요.' },
                { status: 409 },
            );
        }

        const { error } = await adminSupabase
            .from('saved_bazi_profiles')
            .insert({
                user_id: user.id,
                label: buildLabel(normalized.value),
                subject_name: normalized.value.subjectName || null,
                birth_year: normalized.value.year,
                birth_month: normalized.value.month,
                birth_day: normalized.value.day,
                birth_hour: normalized.value.hour,
                birth_minute: normalized.value.min,
                calendar_type: normalized.value.sl,
                gender: normalized.value.gen,
            });

        if (error) throw error;

        const profiles = await listProfiles(user.id);
        return NextResponse.json({ profiles });
    } catch (error) {
        console.error('Saved bazi profile insert error:', error);
        return NextResponse.json(
            { message: '사주 정보 저장에 실패했습니다.' },
            { status: 502 },
        );
    }
}

export async function DELETE(request: NextRequest) {
    const user = await getUser();
    if (!user?.id) {
        return NextResponse.json({ message: '로그인 후 삭제할 수 있습니다.' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
        return NextResponse.json({ message: '삭제할 사주 정보가 없습니다.' }, { status: 400 });
    }

    try {
        const adminSupabase = await createAdminClient();
        const { error } = await adminSupabase
            .from('saved_bazi_profiles')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;

        const profiles = await listProfiles(user.id);
        return NextResponse.json({ profiles });
    } catch (error) {
        console.error('Saved bazi profile delete error:', error);
        return NextResponse.json(
            { message: '저장된 사주 정보 삭제에 실패했습니다.' },
            { status: 502 },
        );
    }
}

async function getUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

async function listProfiles(userId: string) {
    const adminSupabase = await createAdminClient();
    const { data, error } = await adminSupabase
        .from('saved_bazi_profiles')
        .select('id, label, subject_name, birth_year, birth_month, birth_day, birth_hour, birth_minute, calendar_type, gender, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (error) throw error;

    return ((data || []) as SavedBaziProfileRow[]).map((row) => ({
        id: row.id,
        label: row.label || buildLabel({
            subjectName: row.subject_name || '',
            year: row.birth_year,
            month: row.birth_month,
            day: row.birth_day,
            hour: row.birth_hour,
            min: row.birth_minute,
            sl: row.calendar_type,
            gen: row.gender,
        }),
        subjectName: row.subject_name || '',
        year: row.birth_year,
        month: row.birth_month,
        day: row.birth_day,
        hour: row.birth_hour,
        min: row.birth_minute,
        sl: row.calendar_type,
        gen: row.gender,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }));
}

function normalizeInput(input: SavedBaziProfileInput):
    | { ok: true; value: { subjectName: string; year: string; month: string; day: string; hour: string; min: string; sl: string; gen: string } }
    | { ok: false; message: string } {
    const value = {
        subjectName: getString(input.subjectName).trim().slice(0, 30),
        year: getString(input.year),
        month: getString(input.month).padStart(2, '0'),
        day: getString(input.day).padStart(2, '0'),
        hour: getString(input.hour).padStart(2, '0'),
        min: getString(input.min).padStart(2, '0'),
        sl: getString(input.sl) || 'sol',
        gen: getString(input.gen) || '남',
    };

    if (!/^\d{4}$/.test(value.year)) return { ok: false, message: '출생 연도가 올바르지 않습니다.' };
    if (!isIntegerInRange(value.month, 1, 12)) return { ok: false, message: '출생 월이 올바르지 않습니다.' };
    if (!isIntegerInRange(value.day, 1, 31)) return { ok: false, message: '출생 일이 올바르지 않습니다.' };
    if (!isIntegerInRange(value.hour, 0, 23)) return { ok: false, message: '출생 시간이 올바르지 않습니다.' };
    if (!isIntegerInRange(value.min, 0, 59)) return { ok: false, message: '출생 분이 올바르지 않습니다.' };
    if (!['sol', 'lun', 'lun_y'].includes(value.sl)) return { ok: false, message: '양력/음력 값이 올바르지 않습니다.' };
    if (!['남', '여'].includes(value.gen)) return { ok: false, message: '성별 값이 올바르지 않습니다.' };

    return { ok: true, value };
}

function buildLabel(value: { subjectName: string; year: string; month: string; day: string; hour: string; min: string; sl?: string; gen?: string }) {
    return value.subjectName || `${value.year}.${value.month}.${value.day} ${value.hour}:${value.min}`;
}

function getString(value: unknown) {
    return typeof value === 'string' ? value : String(value || '');
}

function isIntegerInRange(value: string, min: number, max: number) {
    const number = Number(value);
    return Number.isInteger(number) && number >= min && number <= max;
}
