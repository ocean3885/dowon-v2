import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://bazi.dowon.ai.kr/';
const birthKeys = ['year', 'month', 'day', 'hour', 'min', 'sl', 'gen'];

export async function proxyBazi(request: NextRequest, endpoint: 'character-details' | 'cycle-analysis') {
    const params = new URLSearchParams();
    for (const key of birthKeys) {
        const value = request.nextUrl.searchParams.get(key);
        if (value !== null) params.set(key, value);
    }
    if (endpoint === 'cycle-analysis') {
        for (const key of ['daewoon_index', 'sewoon_year']) {
            const value = request.nextUrl.searchParams.get(key);
            if (value !== null) params.set(key, value);
        }
    }
    try {
        const response = await fetch(`${API_URL}${endpoint}?${params}`, {
            headers: { Accept: 'application/json' }, cache: 'no-store',
        });
        return new NextResponse(await response.text(), {
            status: response.status,
            headers: { 'Content-Type': response.headers.get('content-type') || 'application/json; charset=utf-8' },
        });
    } catch {
        return NextResponse.json({ status: 'error', code: 'upstream_unavailable', message: '만세력 API 연결에 실패했습니다.', errors: [] }, { status: 502 });
    }
}
