import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import {
    buildSajuRelationCases,
    dayPillars,
    getPositionLabel,
    relationTypeLabels,
    type SajuRelationCase,
} from '@/lib/saju-relations';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';
const PROMPT_VERSION = 'saju-relation-day-pillar-v1';

type GeneratedReading = {
    title?: string;
    summary?: string;
    detail?: string;
};

async function requireStaff() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { supabase, user: null, error: NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 }) };
    }

    const { data: member } = await supabase
        .from('members')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!member || !['admin', 'staff'].includes(member.role)) {
        return { supabase, user, error: NextResponse.json({ message: '관리자 권한이 필요합니다.' }, { status: 403 }) };
    }

    return { supabase, user, error: null };
}

export async function POST(request: NextRequest) {
    if (!process.env.DEEPSEEK_API_KEY) {
        return NextResponse.json({ message: 'DeepSeek API 키가 설정되어 있지 않습니다.' }, { status: 500 });
    }

    const auth = await requireStaff();
    if (auth.error) return auth.error;

    let body: {
        relationType?: string;
        relationKey?: string;
        dayPillar?: string;
        actorPosition?: string;
        targetPosition?: string;
        overwrite?: boolean;
    };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
    }

    const relationType = String(body.relationType || '').trim();
    const relationKey = String(body.relationKey || '').trim();
    const dayPillar = String(body.dayPillar || '').trim();
    const actorPosition = String(body.actorPosition || '').trim();
    const targetPosition = String(body.targetPosition || '').trim();
    const overwrite = body.overwrite === true;

    if (!relationType || !relationKey || !dayPillars.includes(dayPillar) || !actorPosition || !targetPosition) {
        return NextResponse.json({ message: '생성 조건을 확인해주세요.' }, { status: 400 });
    }

    const relationCase = buildSajuRelationCases({ relationType, relationKey, dayPillar }).find((item) =>
        item.actor_position === actorPosition && item.target_position === targetPosition
    );

    if (!relationCase) {
        return NextResponse.json({ message: '생성 가능한 조합이 아닙니다.' }, { status: 400 });
    }

    const { data: existing, error: existingError } = await auth.supabase
        .from('saju_relation_readings')
        .select('id, status, title, summary')
        .eq('relation_type', relationCase.relation_type)
        .eq('relation_key', relationCase.relation_key)
        .eq('day_pillar', relationCase.day_pillar)
        .eq('actor_char', relationCase.actor_char)
        .eq('target_char', relationCase.target_char)
        .eq('actor_position', relationCase.actor_position)
        .eq('target_position', relationCase.target_position)
        .maybeSingle();

    if (existingError) {
        return NextResponse.json({ message: '기존 데이터 확인에 실패했습니다.' }, { status: 500 });
    }

    if (existing && !overwrite) {
        return NextResponse.json({ skipped: true, reading: existing });
    }

    const generated = await generateReading(relationCase);
    if (!generated.ok) {
        return NextResponse.json({ message: generated.message }, { status: 502 });
    }

    const now = new Date().toISOString();

    if (existing) {
        const { data: updated, error: updateError } = await auth.supabase
            .from('saju_relation_readings')
            .update({
                ...relationCase,
                title: relationCase.title,
                summary: generated.reading.summary,
                detail: generated.reading.detail,
                status: 'draft',
                source: 'deepseek',
                prompt_version: PROMPT_VERSION,
                model: DEEPSEEK_MODEL,
                generated_at: now,
                reviewed_at: null,
                reviewed_by: null,
                updated_at: now,
            })
            .eq('id', existing.id)
            .select('id, status, title, summary')
            .single();

        if (updateError) {
            return NextResponse.json({ message: '재등록 결과 저장에 실패했습니다.' }, { status: 500 });
        }

        revalidatePath('/admin/saju-relations');
        revalidatePath('/admin/saju-relations/create');
        revalidatePath(`/admin/saju-relations/edit/${existing.id}`);

        return NextResponse.json({ skipped: false, overwritten: true, reading: updated });
    }

    const { data: inserted, error: insertError } = await auth.supabase
        .from('saju_relation_readings')
        .insert({
            ...relationCase,
            title: relationCase.title,
            summary: generated.reading.summary,
            detail: generated.reading.detail,
            status: 'draft',
            source: 'deepseek',
            prompt_version: PROMPT_VERSION,
            model: DEEPSEEK_MODEL,
            generated_at: now,
            updated_at: now,
        })
        .select('id, status, title, summary')
        .single();

    if (insertError) {
        return NextResponse.json({ message: '생성 결과 저장에 실패했습니다.' }, { status: 500 });
    }

    revalidatePath('/admin/saju-relations');
    revalidatePath('/admin/saju-relations/create');

    return NextResponse.json({ skipped: false, reading: inserted });
}

async function generateReading(relationCase: SajuRelationCase): Promise<
    | { ok: true; reading: Required<GeneratedReading> }
    | { ok: false; message: string }
> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
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
                        content: [
                            '당신은 맹파명리학 관점에 정통한 한국어 명리학자입니다.',
                            '사주 원국의 기준 일주, 글자 관계, 궁위, 십신, 작용 방향을 중심으로 해설합니다.',
                            '기준 일주의 일간과 일지는 고정 조건으로 보고, 일지 해석이 포함될 때는 반드시 기준 일주의 지지를 반영합니다.',
                            '반드시 JSON만 반환합니다. 마크다운 코드블록을 쓰지 않습니다.',
                        ].join('\n'),
                    },
                    {
                        role: 'user',
                        content: buildPrompt(relationCase),
                    },
                ],
                max_tokens: 760,
                temperature: 0.45,
            }),
            cache: 'no-store',
            signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
            return { ok: false, message: 'DeepSeek 해설 생성에 실패했습니다.' };
        }

        const content = data?.choices?.[0]?.message?.content;
        if (typeof content !== 'string' || !content.trim()) {
            return { ok: false, message: 'DeepSeek 응답이 비어 있습니다.' };
        }

        const parsed = parseGeneratedJson(content);
        if (!parsed.title || !parsed.summary || !parsed.detail) {
            return { ok: false, message: 'DeepSeek 응답 JSON 형식이 올바르지 않습니다.' };
        }

        return {
            ok: true,
            reading: {
                title: parsed.title.trim(),
                summary: parsed.summary.trim(),
                detail: parsed.detail.trim(),
            },
        };
    } catch (error) {
        const isTimeout = error instanceof DOMException && error.name === 'AbortError';
        return {
            ok: false,
            message: isTimeout ? 'DeepSeek 생성 시간이 초과되었습니다.' : 'DeepSeek API 연결에 실패했습니다.',
        };
    } finally {
        clearTimeout(timeoutId);
    }
}

function parseGeneratedJson(content: string): GeneratedReading {
    const normalized = content
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();

    try {
        const parsed = JSON.parse(normalized);
        return {
            title: typeof parsed.title === 'string' ? parsed.title : '',
            summary: typeof parsed.summary === 'string' ? parsed.summary : '',
            detail: typeof parsed.detail === 'string' ? parsed.detail : '',
        };
    } catch {
        return {};
    }
}

function buildPrompt(relationCase: SajuRelationCase) {
    const relationLabel = relationTypeLabels[relationCase.relation_type] || relationCase.relation_type;
    const actorPositionLabel = getPositionLabel(relationCase.actor_position);
    const targetPositionLabel = getPositionLabel(relationCase.target_position);
    const actorTenStar = relationCase.actor_ten_star || '해당 십신';
    const targetTenStar = relationCase.target_ten_star || '해당 십신';
    const tenStarPair = relationCase.ten_star_pair || `${actorTenStar}-${targetTenStar}`;

    return [
        `${relationCase.day_pillar}日柱를 기준으로, ${actorPositionLabel}의 ${relationCase.actor_char}이 ${targetPositionLabel}의 ${relationCase.target_char}와 ${relationLabel} 관계를 이루는 구조를 해설합니다.`,
        '',
        `기준 일주는 ${relationCase.day_pillar}이며, 일간은 ${relationCase.day_stem}, 일지는 ${relationCase.day_branch}입니다.`,
        '',
        `${relationCase.actor_char}은 ${relationCase.day_stem}日干에게 ${actorTenStar}로 작용하고, ${relationCase.target_char}은 ${relationCase.day_stem}日干에게 ${targetTenStar}로 작용합니다.`,
        '',
        `따라서 이 조합은 ${tenStarPair}이 ${relationCase.palace_pair} 축에서 연결되는 구조로 봅니다.`,
        '',
        `관계 식별자는 ${relationCase.relation_key}입니다.`,
        `관계 명칭은 ${relationLabel}이며, 관계 유형은 ${relationCase.relation_type}입니다.`,
        `해설 문장에서는 관계 명칭 ${relationLabel}을 사용하고, ${relationCase.relation_key}는 내부 식별자로만 참고합니다.`,
        '',
        '해석 관점:',
        `- 이 해설의 주체는 ${actorPositionLabel}의 ${relationCase.actor_char}입니다.`,
        `- ${targetPositionLabel}의 ${relationCase.target_char}는 ${relationCase.actor_char}가 마주하는 상대 글자이자 작용 조건입니다.`,
        `- 따라서 해설은 “${relationCase.actor_char} 입장에서 ${relationCase.target_char}를 보았을 때 어떤 상황에 놓이는가”를 중심으로 작성합니다.`,
        `- ${relationCase.actor_char}가 ${relationCase.target_char}와 ${relationLabel} 관계를 이루면서 받는 압박, 자극, 끌림, 충돌, 제약, 전환, 발현 양상을 설명합니다.`,
        `- ${relationCase.target_char}를 주어로 삼아 해석하지 말고, 반드시 ${relationCase.actor_char}의 상태 변화와 작용 결과를 중심으로 설명합니다.`,
        '',
        '위치 해석 주의:',
        `- actorPositionLabel 또는 targetPositionLabel이 일간인 경우, 그 글자는 반드시 기준 일주의 천간 ${relationCase.day_stem}로 해석합니다.`,
        `- actorPositionLabel 또는 targetPositionLabel이 일지인 경우, 그 글자는 반드시 기준 일주의 지지 ${relationCase.day_branch}로 해석합니다.`,
        `- 일간 또는 일지가 관계 당사자로 포함되지 않은 경우에도, ${relationCase.day_stem}과 ${relationCase.day_branch}는 기준 일주의 해석 기준축으로만 사용합니다.`,
        '- 일간과 일지를 임의로 바꾸거나, 선택된 궁위와 다른 위치를 전제로 해석하지 않습니다.',
        '',
        '맹파명리학 관점에서 기준 일주, 궁위, 십신, 글자 간 관계를 중심으로 설명해주세요.',
        '',
        `단순히 ${relationLabel}의 일반론을 반복하지 말고, ${relationCase.day_pillar}日柱, ${tenStarPair}, ${relationCase.palace_pair}, 그리고 “${relationCase.actor_char}가 ${relationCase.target_char}를 마주한 상황”이 함께 만드는 의미를 해석해주세요.`,
        '',
        '작성 규칙:',
        '- title, summary, detail 필드를 가진 JSON 객체만 반환합니다.',
        `- title은 반드시 "${relationCase.title}"로 작성합니다.`,
        '- summary는 한 문장으로 작성합니다.',
        '- detail은 문장 수를 제한하지 않습니다.',
        '- 다만 관리자 검수용 초안이므로 불필요한 반복 없이 500~900자 이내로 작성합니다.',
        '- detail은 여러 문단이 아닌 하나의 문자열로 작성합니다.',
        '- detail에는 다음 내용을 자연스럽게 포함합니다:',
        `  1. 기준 일주 ${relationCase.day_pillar}에서 이 관계가 놓이는 의미`,
        `  2. ${actorTenStar}인 ${relationCase.actor_char}가 ${targetTenStar}인 ${relationCase.target_char}를 마주했을 때의 상태`,
        `  3. ${actorPositionLabel}의 ${relationCase.actor_char}가 ${targetPositionLabel}의 ${relationCase.target_char}와 ${relationLabel}을 이루며 겪는 작용 양상`,
        '- 명리 용어는 정확하게 사용합니다.',
        '- 관리자 검수용 초안에 맞게 간결하게 작성합니다.',
        '- 단정적 예언, 길흉 확정, 사건 확정 표현은 피합니다.',
        '- “~로 해석될 수 있다”, “~의 흐름으로 볼 수 있다”, “~이 강조된다”처럼 구조 해설 중심으로 작성합니다.',
        '- 마크다운 코드블록을 사용하지 않습니다.',
        '- JSON 외의 설명, 주석, 머리말, 꼬리말을 출력하지 않습니다.',
        '- title, summary, detail 외의 필드를 추가하지 않습니다.',
        '- 모든 값은 문자열로 작성합니다.',
        '',
        '반환 예:',
        `{"title":"${relationCase.title}","summary":"...","detail":"..."}`,
    ].filter(Boolean).join('\n');
}
