import { after, NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import type { BaziResult } from '@/components/bazi/types';
import { createAdminClient, createClient } from '@/utils/supabase/server';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';
const INTERPRETATION_MAX_TOKENS = 4000;
const REFINEMENT_MAX_TOKENS = 4000;
const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
        return NextResponse.json(
            { message: '회원 로그인 후 신청할 수 있습니다.' },
            { status: 401 },
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

        // Check if the user is an admin or staff member
        const { data: member } = await adminSupabase
            .from('members')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        const isAdminOrStaff = member?.role === 'admin' || member?.role === 'staff';

        if (isAdminOrStaff) {
            // Administrators and staff have absolutely no daily limits. Allow direct cumulative testing.
        } else {
            // For standard users, enforce the strict 1-day 1-time limit
            const { data: existingRequest, error: existingRequestError } = await adminSupabase
                .from('free_bazi_consultations')
                .select('id')
                .eq('user_id', user.id)
                .eq('request_date_kst', requestDateKst)
                .maybeSingle();

            if (existingRequestError) throw existingRequestError;

            if (existingRequest) {
                return NextResponse.json(
                    { message: '무료 사주 원국 해설은 하루 1회 신청할 수 있습니다. 마이페이지에서 오늘 신청한 해설을 확인해주세요.' },
                    { status: 409 },
                );
            }
        }
        const subjectName = normalizeSubjectName(body.subjectName);
        const prompt = buildPrompt(body.result);
        const { data: consultation, error: insertError } = await adminSupabase
            .from('free_bazi_consultations')
            .insert({
                user_id: user.id,
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
            await generateAndStoreBaziInterpretation(consultation.id, body.result!);
        });

        revalidatePath('/profile');
        revalidatePath('/my/bazi-consultations');

        return NextResponse.json({
            message: '무료 사주 원국 해설 신청이 접수되었습니다. 해설은 분석이 완료되는 대로 마이페이지에 표시됩니다.',
            id: consultation.id,
        });
    } catch (error) {
        console.error('Free bazi consultation failed:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : '무료 해설 신청에 실패했습니다.' },
            { status: 502 },
        );
    }
}

async function generateAndStoreBaziInterpretation(consultationId: string, result: BaziResult) {
    const adminSupabase = await createAdminClient();

    try {
        const rawInterpretation = await createBaziInterpretation(result);
        const interpretation = await refineBaziInterpretation(rawInterpretation);
        const { error } = await adminSupabase
            .from('free_bazi_consultations')
            .update({
                result_text: interpretation,
                status: 'completed',
                completed_at: new Date().toISOString(),
                error_message: null,
            })
            .eq('id', consultationId);

        if (error) throw error;
    } catch (error) {
        console.error('Background free bazi interpretation failed:', error);
        const message = error instanceof Error ? error.message : '사주 해설 생성에 실패했습니다.';
        await adminSupabase
            .from('free_bazi_consultations')
            .update({
                status: 'failed',
                error_message: message,
            })
            .eq('id', consultationId);
    } finally {
        revalidatePath('/profile');
        revalidatePath('/my/bazi-consultations');
    }
}

async function createBaziInterpretation(result: BaziResult) {
    const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: DEEPSEEK_MODEL,
            messages: [
                {
                    role: 'system',
                    content: '당신은 한국어로 사주 원국의 특징과 글자 간 상호작용을 명리학 관점에서 정확하게 분석하는 전문 상담사입니다. 운명 단정, 공포 조장, 건강/투자/법률 확정 조언은 피합니다.',
                },
                {
                    role: 'user',
                    content: buildPrompt(result),
                },
            ],
            max_tokens: INTERPRETATION_MAX_TOKENS,
            temperature: 0.55,
        }),
        cache: 'no-store',
    });
    const data = await response.json();

    if (!response.ok) {
        console.error('DeepSeek consultation failed:', data);
        throw new Error('사주 원국 해설 생성에 실패했습니다.');
    }

    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
        throw new Error('생성된 해설이 비어 있습니다.');
    }

    return content.trim();
}

async function refineBaziInterpretation(rawText: string) {
    const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: DEEPSEEK_MODEL,
            messages: [
                {
                    role: 'system',
                    content: '당신은 제공받은 사주 해설 텍스트를 깔끔하게 다듬고 최종 마무리 멘트를 추가하는 전문 편집자입니다.',
                },
                {
                    role: 'user',
                    content: [
                        '다음 사주 해설 텍스트에 대해 아래 지시사항을 완벽히 적용하여 최종 해설로 다듬어 주세요:',
                        '',
                        '1. 해설의 학술적 깊이, 구체적인 추론 과정, 해석 내용은 절대 변경하거나 누락하지 말고 "그대로 유지"하세요.',
                        '2. 텍스트 내에 직접적으로 언급된 "맹파", "맹파명리", "맹파명리학" 등의 단어가 있다면, 이를 문맥상 자연스럽게 "명리학" 또는 "명리"로 교체해 주세요. (예: "맹파명리학적 관점" -> "명리학적 관점")',
                        '3. 본문의 맨 마지막에 한 줄 띄운 후, AI 상담은 부정확할 수 있으므로 보다 정확한 상담은 유료상담 서비스를 이용하시라는 취지의 문장을 문맥에 맞게 자연스럽게 추가해 주세요.',
                        '4. 화면 렌더링에 방해가 되는 마크다운 특수 기호(###, **, *, -, _, 등)가 있다면 완전히 제거하고, 단락 구분과 일반 줄바꿈(엔터)만을 활용한 깔끔한 줄글 텍스트 상태로 완성해 주세요. (예: "### 1. 성향" -> "[1. 성향 분석]")',
                        '',
                        '[대상 텍스트]',
                        rawText
                    ].join('\n'),
                },
            ],
            max_tokens: REFINEMENT_MAX_TOKENS,
            temperature: 0.3,
        }),
        cache: 'no-store',
    });
    const data = await response.json();

    if (!response.ok) {
        console.error('DeepSeek refinement failed:', data);
        throw new Error('사주 해설 다듬기 과정에 실패했습니다.');
    }

    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
        throw new Error('다듬어진 해설이 비어 있습니다.');
    }

    return content.trim();
}

function buildPrompt(result: BaziResult) {
    const pillars: Partial<NonNullable<BaziResult['four_pillars']>> = result.four_pillars || {};

    const gender = result.meta?.gender || '사용자';
    const year = formatPillar(pillars.year);
    const month = formatPillar(pillars.month);
    const day = formatPillar(pillars.day);
    const time = formatPillar(pillars.time);
    const currentYear = getKstYear();
    const currentDaewoon = result.daewoon?.current || findCurrentDaewoon(result.daewoon?.list || [], currentYear);
    const currentSewoon = getYearGanji(currentYear);

    return [
        `[성별: ${gender}]인 분이 [년주: ${year} / 월주: ${month} / 일주: ${day} / 시주: ${time}] 명식으로 태어났습니다.`,
        `[현재 운 흐름: 현재 대운 ${formatDaewoon(currentDaewoon)} / 현재 세운 ${currentYear}년 ${currentSewoon.gan}${currentSewoon.ji}]입니다.`,
        `해당 사주 원국을 '맹파명리학(盲派命理)' 관점으로 아주 깊이 있게 분석해 주세요.`,
        '',
        '[작성 및 출력 형식 가이드라인]',
        '1. 성향, 적성, 재물, 배우자, 건강을 위주로 상세히 풀이해 주세요.',
        '2. 원국의 사주가 현재 대운과 현재 세운을 만났을 때 어떻게 작용하는지 별도 항목으로 풀이해 주세요.',
        '3. 단순한 결과 나열이 아닌, "왜 그렇게 분석되는지" 글자 간의 관계(합, 충, 형, 천, 파, 묘고 등)를 구체적으로 짚어가며 논리적으로 설명해 주세요.',
        '4. 전문적인 명리 용어를 쓰되 일반인도 충분히 이해할 수 있도록 정중하고 친절한 한국어 경어체(~합니다, ~입니다)로 작성해 주세요.',
        '5. 화면 렌더링을 위해 마크다운 기호(###, **, *, -, _ 등)는 사용하지 마세요.',
        '   대신 대제목은 "[1. 성향 분석]"과 같은 대괄호 형태로 구분하고, 문단 구분을 위해 줄바꿈(엔터)을 활용해 주세요.',
    ].join('\n');
}

function findCurrentDaewoon(items: NonNullable<BaziResult['daewoon']>['list'], currentYear: number) {
    return items?.find((item) => {
        if (item.start_year === undefined || item.end_year === undefined) return false;
        return item.start_year <= currentYear && currentYear <= item.end_year;
    }) || null;
}

function formatDaewoon(daewoon?: NonNullable<BaziResult['daewoon']>['current']) {
    if (!daewoon) return '-';

    const ganji = `${daewoon.gan || ''}${daewoon.ji || ''}` || '-';
    const yearRange = daewoon.start_year !== undefined && daewoon.end_year !== undefined
        ? `${daewoon.start_year}~${daewoon.end_year}년`
        : '';
    const ageRange = daewoon.start_age !== undefined && daewoon.end_age !== undefined
        ? `${daewoon.start_age}~${daewoon.end_age}세`
        : '';
    const details = [ageRange, yearRange].filter(Boolean).join(', ');

    return details ? `${ganji}(${details})` : ganji;
}

function getYearGanji(year: number) {
    const offset = year - 1984;
    const stemIndex = ((offset % heavenlyStems.length) + heavenlyStems.length) % heavenlyStems.length;
    const branchIndex = ((offset % earthlyBranches.length) + earthlyBranches.length) % earthlyBranches.length;

    return {
        gan: heavenlyStems[stemIndex],
        ji: earthlyBranches[branchIndex],
    };
}

function formatPillar(pillar?: NonNullable<BaziResult['four_pillars']>[keyof NonNullable<BaziResult['four_pillars']>]) {
    return `${formatStemOrBranch(pillar?.gan)}${formatStemOrBranch(pillar?.ji)}`;
}

function formatStemOrBranch(value?: { kr?: string; ch?: string }) {
    if (!value?.kr && !value?.ch) return '-';
    if (!value.kr) return value.ch || '-';
    if (!value.ch) return value.kr;

    return `${value.kr}(${value.ch})`;
}

function getKstDateString() {
    return getKstNow().toISOString().slice(0, 10);
}

function getKstYear() {
    return Number(getKstDateString().slice(0, 4));
}

function getKstNow() {
    return new Date(Date.now() + 9 * 60 * 60 * 1000);
}

function normalizeSubjectName(value?: string) {
    const name = value?.trim().slice(0, 30);
    return name || null;
}
