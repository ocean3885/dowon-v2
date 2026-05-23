import { NextRequest, NextResponse } from 'next/server';

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
