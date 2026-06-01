import { after, NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import type { BaziResult } from '@/components/bazi/types';
import { createAdminClient, createClient } from '@/utils/supabase/server';
import {
    buildBaziPrompt,
    generateAndStoreBaziInterpretation,
    getGuestDailyLimit,
    getKstDateString,
    normalizeSubjectName,
} from '@/lib/bazi-consultation';

const GUEST_ID_COOKIE = 'dowon_bazi_guest_id';
const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user?.id) {
        return NextResponse.json(
            { message: '로그인 회원은 마이페이지 보관함으로 신청해주세요.' },
            { status: 400 },
        );
    }

    if (!process.env.DEEPSEEK_API_KEY) {
        return NextResponse.json(
            { message: '해설 생성 API 키가 설정되어 있지 않습니다.' },
            { status: 500 },
        );
    }

    let body: { result?: BaziResult; subjectName?: string; birthParams?: BaziResult['birth_params'] };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { message: '요청 형식이 올바르지 않습니다.' },
            { status: 400 },
        );
    }

    if (!body.result?.four_pillars) {
        return NextResponse.json(
            { message: '사주 원국 정보가 없습니다.' },
            { status: 400 },
        );
    }

    try {
        const requestDateKst = getKstDateString();
        const adminSupabase = await createAdminClient();
        const guestId = request.cookies.get(GUEST_ID_COOKIE)?.value || randomUUID();
        const isNewGuest = !request.cookies.get(GUEST_ID_COOKIE)?.value;

        const dailyLimit = await getGuestDailyLimit(adminSupabase);
        if (dailyLimit.enabled) {
            const { count, error: countError } = await adminSupabase
                .from('guest_bazi_consultations')
                .select('id', { count: 'exact', head: true })
                .eq('request_date_kst', requestDateKst);

            if (countError) throw countError;

            if ((count || 0) >= dailyLimit.limit) {
                return withGuestCookie(
                    NextResponse.json(
                        { message: '오늘 비회원 무료 체험 신청이 마감되었습니다. 내일 다시 이용해주세요.' },
                        { status: 429 },
                    ),
                    guestId,
                    isNewGuest,
                );
            }
        }

        const { data: existingRequest, error: existingRequestError } = await adminSupabase
            .from('guest_bazi_consultations')
            .select('id')
            .eq('guest_id', guestId)
            .eq('request_date_kst', requestDateKst)
            .maybeSingle();

        if (existingRequestError) throw existingRequestError;

        if (existingRequest) {
            return withGuestCookie(
                NextResponse.json(
                    { message: '비회원 무료 사주 원국 해설은 하루 1회 신청할 수 있습니다. 비회원 해설 보관함에서 오늘 신청한 해설을 확인해주세요.' },
                    { status: 409 },
                ),
                guestId,
                isNewGuest,
            );
        }

        const subjectName = normalizeSubjectName(body.subjectName);
        const prompt = buildBaziPrompt(body.result);
        const { data: consultation, error: insertError } = await adminSupabase
            .from('guest_bazi_consultations')
            .insert({
                guest_id: guestId,
                subject_name: subjectName,
                request_date_kst: requestDateKst,
                bazi_result: {
                    ...body.result,
                    birth_params: body.birthParams,
                },
                prompt,
                result_text: null,
                status: 'pending',
            })
            .select('id')
            .single();

        if (insertError) throw insertError;

        after(async () => {
            await generateAndStoreBaziInterpretation({
                consultationId: consultation.id,
                result: body.result!,
                tableName: 'guest_bazi_consultations',
                revalidatePaths: ['/bazi/guest-consultations'],
            });
        });

        return withGuestCookie(
            NextResponse.json({
                message: '비회원 무료 사주 원국 해설 신청이 접수되었습니다. 이 브라우저의 비회원 해설 보관함에서 확인할 수 있습니다.',
                id: consultation.id,
            }),
            guestId,
            isNewGuest,
        );
    } catch (error) {
        console.error('Guest bazi consultation failed:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : '비회원 무료 해설 신청에 실패했습니다.' },
            { status: 502 },
        );
    }
}

function withGuestCookie(response: NextResponse, guestId: string, shouldSetCookie: boolean) {
    if (!shouldSetCookie) return response;

    response.cookies.set(GUEST_ID_COOKIE, guestId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: GUEST_COOKIE_MAX_AGE,
    });

    return response;
}
