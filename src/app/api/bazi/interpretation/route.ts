import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import type { BaziResult } from '@/components/bazi/types';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';
const cache = new Map<string, string>();

export async function POST(request: NextRequest) {
    if (!process.env.DEEPSEEK_API_KEY) {
        return NextResponse.json(
            { message: '해설 API 키가 설정되어 있지 않습니다.' },
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
            { message: '만세력 결과가 없습니다.' },
            { status: 400 },
        );
    }

    const prompt = buildPrompt(body.result);
    const cacheKey = createHash('sha256').update(prompt).digest('hex');
    const cached = cache.get(cacheKey);

    if (cached) {
        return NextResponse.json({ summary: cached });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

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
                        content: '당신은 한국어로 사주 명식의 핵심을 부드럽고 현실적으로 요약하는 상담 보조자입니다. 운명 단정, 공포 조장, 건강/투자/법률 확정 조언은 피하고, 특정 학파명은 언급하지 않습니다.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                max_tokens: 520,
                temperature: 0.55,
            }),
            cache: 'no-store',
            signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: '해설 생성에 실패했습니다.' },
                { status: response.status },
            );
        }

        const summary = data?.choices?.[0]?.message?.content;

        if (typeof summary !== 'string' || !summary.trim()) {
            return NextResponse.json(
                { message: '해설 결과가 비어 있습니다.' },
                { status: 502 },
            );
        }

        const trimmedSummary = summary.trim();
        cache.set(cacheKey, trimmedSummary);

        return NextResponse.json({ summary: trimmedSummary });
    } catch (error) {
        const isTimeout = error instanceof DOMException && error.name === 'AbortError';

        return NextResponse.json(
            { message: isTimeout ? '해설 생성 시간이 초과되었습니다.' : '해설 API 연결에 실패했습니다.' },
            { status: 502 },
        );
    } finally {
        clearTimeout(timeoutId);
    }
}

function buildPrompt(result: BaziResult) {
    const pillars: Partial<NonNullable<BaziResult['four_pillars']>> = result.four_pillars || {};
    const dayPillar = formatPillar(pillars.day);
    const monthPillar = formatPillar(pillars.month);
    const timePillar = formatPillar(pillars.time);

    return [
        `${dayPillar} 일주가 ${monthPillar} 월에 ${timePillar}시에 태어난 경우, 기본적인 특성을 명리학 관점으로 500자 내외로 정리해줘.`,
        '단, 특정 학파명은 절대 쓰지 말아줘.',
        '부드러운 한국어 문장으로 작성하고, 운명 단정이나 공포를 주는 표현은 피해주세요.',
    ].join('\n');
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
