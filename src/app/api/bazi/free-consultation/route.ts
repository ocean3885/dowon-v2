import { NextRequest, NextResponse } from 'next/server';
import type { BaziResult, PillarKey } from '@/components/bazi/types';
import { sendEmail } from '@/lib/email';
import { createClient } from '@/utils/supabase/server';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';
const pillarOrder: PillarKey[] = ['year', 'month', 'day', 'time'];
const pillarLabels: Record<PillarKey, string> = {
    year: '년주',
    month: '월주',
    day: '일주',
    time: '시주',
};

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
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

    let body: { result?: BaziResult };

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
        const interpretation = await createBaziInterpretation(body.result);
        const subject = '[도원] 무료 사주 원국 해설이 도착했습니다';

        await sendEmail({
            to: user.email,
            subject,
            html: buildEmailHtml(interpretation, body.result),
            text: buildEmailText(interpretation, body.result),
        });

        return NextResponse.json({
            message: `${user.email}로 무료 사주 원국 해설을 발송했습니다.`,
        });
    } catch (error) {
        console.error('Free bazi consultation failed:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : '무료 해설 신청에 실패했습니다.' },
            { status: 502 },
        );
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
                    content: '당신은 한국어로 사주 원국의 기본 성향과 방향성을 차분히 정리하는 상담 보조자입니다. 운명 단정, 공포 조장, 건강/투자/법률 확정 조언은 피합니다.',
                },
                {
                    role: 'user',
                    content: buildPrompt(result),
                },
            ],
            max_tokens: 900,
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

function buildPrompt(result: BaziResult) {
    const pillars: Partial<NonNullable<BaziResult['four_pillars']>> = result.four_pillars || {};
    const tenGods = result.ten_gods || {};
    const detail = result.analysis?.details?.day;

    return [
        '아래 사주 원국을 바탕으로 무료 상담용 이메일 해설을 작성해줘.',
        '구성은 1) 기본 성향 2) 관계/일 처리 방식 3) 보완하면 좋은 방향 4) 상담에서 더 살펴볼 포인트 순서로 정리해줘.',
        '전체 분량은 900자 내외로 하고, 쉽고 부드러운 한국어 문장으로 작성해줘.',
        '단정적인 예언보다 성향과 선택의 방향 중심으로 작성해줘.',
        '',
        `성별: ${result.meta?.gender || '-'}`,
        `띠: ${result.meta?.ddi || '-'}`,
        `일간 상태: ${detail?.stem?.status || '-'}`,
        `일간 운성: ${detail?.stem?.unseong || '-'}`,
        `십성: ${Object.entries(tenGods).map(([key, value]) => `${key}=${value || '-'}`).join(', ') || '-'}`,
        ...pillarOrder.map((key) => {
            const pillar = pillars[key];
            return `${pillarLabels[key]}: ${formatStemOrBranch(pillar?.gan)}${formatStemOrBranch(pillar?.ji)}`;
        }),
    ].join('\n');
}

function formatStemOrBranch(value?: { kr?: string; ch?: string }) {
    if (!value?.kr && !value?.ch) return '-';
    if (!value.kr) return value.ch || '-';
    if (!value.ch) return value.kr;

    return `${value.kr}(${value.ch})`;
}

function buildEmailText(interpretation: string, result: BaziResult) {
    return [
        '무료 사주 원국 해설',
        '',
        buildPillarText(result),
        '',
        interpretation,
        '',
        '도원작명철학원',
    ].join('\n');
}

function buildEmailHtml(interpretation: string, result: BaziResult) {
    return `
        <div style="font-family:Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;line-height:1.7;color:#2b2119;background:#fbf7f1;padding:24px;">
            <div style="max-width:640px;margin:0 auto;background:#fffdf9;border:1px solid #eadfd4;border-radius:10px;padding:24px;">
                <p style="margin:0 0 8px;color:#a26e3c;font-weight:700;font-size:13px;">도원 무료 해설</p>
                <h1 style="margin:0 0 18px;font-size:24px;color:#241b14;">무료 사주 원국 해설</h1>
                <div style="margin:0 0 18px;padding:14px;background:#fbf5ef;border-radius:8px;color:#5a4a3d;">
                    ${escapeHtml(buildPillarText(result)).replace(/\n/g, '<br />')}
                </div>
                <div style="white-space:pre-line;font-size:15px;color:#3f3329;">${escapeHtml(interpretation)}</div>
                <p style="margin:24px 0 0;color:#8a7b6f;font-size:13px;">도원작명철학원</p>
            </div>
        </div>
    `;
}

function buildPillarText(result: BaziResult) {
    const pillars: Partial<NonNullable<BaziResult['four_pillars']>> = result.four_pillars || {};
    return pillarOrder
        .map((key) => `${pillarLabels[key]} ${formatStemOrBranch(pillars[key]?.gan)}${formatStemOrBranch(pillars[key]?.ji)}`)
        .join('\n');
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
