import type { BaziCharacterGraph, BaziResult, DaewoonItem } from '@/components/bazi/types';

export type BirthParams = { year: string; month: string; day: string; hour: string; min: string; sl: string; gen: string };

export function selectionYears(item: DaewoonItem, years: number[]) {
    const start = item.selection_start_year;
    const end = item.selection_end_year_exclusive;
    if (start === undefined || end === undefined) return [];
    return years.filter(year => year >= start && year < end);
}

export function currentDaewoon(result: BaziResult) {
    const daewoon = result.daewoon;
    if (daewoon?.selection_status !== 'selected') return null;
    return daewoon.current || daewoon.list?.find(item => item.selection_start_year !== undefined
        && item.selection_end_year_exclusive !== undefined
        && daewoon.selection_year !== undefined
        && item.selection_start_year <= daewoon.selection_year
        && daewoon.selection_year < item.selection_end_year_exclusive) || null;
}

export function cycleQuery(params: BirthParams, selection: { daewoonIndex: number } | { sewoonYear: number }) {
    const query = new URLSearchParams(params);
    if ('daewoonIndex' in selection) query.set('daewoon_index', String(selection.daewoonIndex));
    else query.set('sewoon_year', String(selection.sewoonYear));
    return query;
}

export function graphIsCurrent(value: unknown): value is BaziCharacterGraph {
    return !!value && typeof value === 'object' && (value as BaziCharacterGraph).schema_version === '1.0-draft'
        && !!(value as BaziCharacterGraph).characters && !!(value as BaziCharacterGraph).relations;
}

type ApiError = { code?: string; message?: string; errors?: Array<{ field?: string | null; message?: string; constraints?: Record<string, unknown> }> };

export function apiErrorText(status: number, body: ApiError | null, fallback: string) {
    const code = body?.code;
    const heading = status === 404 && code === 'calendar_date_not_found' ? '해당 양력·음력 날짜를 찾을 수 없습니다.'
        : status === 400 && code === 'sewoon_year_out_of_range' ? '제공되는 세운 연도 범위를 벗어났습니다.'
            : status === 400 && code === 'daewoon_index_out_of_range' ? '제공되는 대운 범위를 벗어났습니다.'
                : status === 400 && code === 'invalid_cycle_selection' ? '대운 또는 세운 중 하나만 선택해 주세요.'
                    : status === 400 && code === 'daewoon_unavailable' ? '해당 연도에 대응하는 대운을 조회할 수 없습니다.'
                        : status === 422 ? '필수 입력값이나 형식을 확인해 주세요.'
                            : status >= 500 ? '만세력 서버 처리 중 오류가 발생했습니다.'
                                : body?.message || fallback;
    const details = (body?.errors || []).map(error => {
        const field = error.field ? `${error.field}: ` : '';
        const constraints = error.constraints;
        const range = constraints && typeof constraints.minimum === 'number' && typeof constraints.maximum === 'number'
            ? ` (${constraints.minimum}~${constraints.maximum})` : '';
        const allowed = constraints && Array.isArray(constraints.allowed) ? ` (허용: ${constraints.allowed.join(', ')})` : '';
        const allowedYears = constraints && Array.isArray(constraints.allowed_years) ? ` (제공 연도: ${constraints.allowed_years.join(', ')})` : '';
        const fields = constraints && Array.isArray(constraints.exactly_one_of) ? ` (하나만 선택: ${constraints.exactly_one_of.join(', ')})` : '';
        return `${field}${error.message || '입력 오류'}${range}${allowed}${allowedYears}${fields}`;
    });
    return [`HTTP ${status}${code ? ` · ${code}` : ''}: ${heading}`, ...details].join('\n');
}

export async function readBaziResponse<T>(response: Response, fallback: string): Promise<T> {
    const body = await response.json() as T & ApiError;
    if (!response.ok) throw new Error(apiErrorText(response.status, body, fallback));
    return body;
}
