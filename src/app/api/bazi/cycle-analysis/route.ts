import { NextRequest } from 'next/server';
import { proxyBazi } from '@/lib/bazi-api-proxy';

export function GET(request: NextRequest) {
    return proxyBazi(request, 'cycle-analysis');
}
