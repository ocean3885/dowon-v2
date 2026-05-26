import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createAdminClient, createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
        return NextResponse.json(
            { message: '로그인 후 이용할 수 있습니다.' },
            { status: 401 },
        );
    }

    let body: { id?: string; subjectName?: string };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { message: '요청 형식이 올바르지 않습니다.' },
            { status: 400 },
        );
    }

    const { id, subjectName } = body;

    if (!id) {
        return NextResponse.json(
            { message: '해설 ID가 필요합니다.' },
            { status: 400 },
        );
    }

    const trimmedName = subjectName ? subjectName.trim() : '';

    try {
        const adminSupabase = await createAdminClient();

        // 1. Verify ownership of the consultation
        const { data: existing, error: fetchError } = await adminSupabase
            .from('free_bazi_consultations')
            .select('user_id')
            .eq('id', id)
            .maybeSingle();

        if (fetchError) throw fetchError;

        if (!existing) {
            return NextResponse.json(
                { message: '해당 해설을 찾을 수 없습니다.' },
                { status: 404 },
            );
        }

        if (existing.user_id !== user.id) {
            return NextResponse.json(
                { message: '본인의 해설만 수정할 수 있습니다.' },
                { status: 403 },
            );
        }

        // 2. Update the subject_name
        const { error: updateError } = await adminSupabase
            .from('free_bazi_consultations')
            .update({ subject_name: trimmedName || null })
            .eq('id', id);

        if (updateError) throw updateError;

        revalidatePath('/profile');
        revalidatePath('/my/bazi-consultations');

        return NextResponse.json({
            message: '이름이 변경되었습니다.',
            subject_name: trimmedName || null,
        });
    } catch (error) {
        console.error('Rename free bazi consultation error:', error);
        return NextResponse.json(
            { message: '이름 변경에 실패했습니다.' },
            { status: 500 },
        );
    }
}
