import type { SupabaseClient } from '@supabase/supabase-js';
import type { BaziResult } from '@/components/bazi/types';
import { DEEPSEEK_MODEL } from '@/lib/deepseek';
import { DEFAULT_GEMINI_MODEL } from '@/lib/gemini';

export const BAZI_PROMPT_SETTING_KEY = 'bazi_free_consultation_prompt_pipeline';
export const BAZI_PROMPT_VERSIONS_KEY = 'bazi_prompt_pipeline_versions';

export type BaziPromptVersionItem = {
    id: string;
    version: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    config: BaziPromptPipelineConfig;
};

export type BaziPromptStepConfig = {
    key: string;
    label: string;
    enabled: boolean;
    systemPrompt: string;
    userPromptTemplate: string;
    temperature: number;
    maxTokens: number;
};

export type BaziFinalizePromptConfig = {
    provider?: 'gemini' | 'deepseek';
    model?: string;
    systemPrompt: string;
    userPromptTemplate: string;
    temperature: number;
    maxTokens: number;
};

export type BaziPromptPipelineConfig = {
    enabled: boolean;
    version: string;
    model: string;
    executionMode: 'parallel' | 'sequential';
    steps: BaziPromptStepConfig[];
    finalize: BaziFinalizePromptConfig;
};

export type BaziPromptStepResult = {
    key: string;
    label: string;
    ok: boolean;
    content: string;
    error?: string;
};

export type BaziGenerationMetadata = {
    promptVersion: string;
    model: string;
    generatedAt: string;
    steps: BaziPromptStepResult[];
};

export const defaultBaziPromptPipelineConfig: BaziPromptPipelineConfig = {
    enabled: true,
    version: 'free-bazi-rich-v1',
    model: DEEPSEEK_MODEL,
    executionMode: 'parallel',
    steps: [
        {
            key: 'core',
            label: '원국 구조 분석',
            enabled: true,
            systemPrompt: '당신은 한국어로 사주 원국의 구조, 월령, 일간의 힘, 오행 흐름을 정밀하게 해석하는 명리학 상담사입니다. 운명 단정, 공포 조장, 건강/투자/법률 확정 조언은 피합니다.',
            userPromptTemplate: [
                '{{baziSummary}}',
                '',
                '위 명식의 원국 구조를 깊이 있게 분석해 주세요.',
                '일간의 상태, 월령의 작용, 오행의 흐름, 사주 네 기둥의 상호작용을 중심으로 설명합니다.',
                '합, 충, 형, 파, 해, 묘고 등 글자 관계가 의미를 만드는 경우 그 이유를 구체적으로 짚어주세요.',
                '마크다운 기호는 쓰지 말고, 정중한 한국어 경어체로 작성해 주세요.',
            ].join('\n'),
            temperature: 0.45,
            maxTokens: 1800,
        },
        {
            key: 'personality',
            label: '성향 및 관계 분석',
            enabled: true,
            systemPrompt: '당신은 사주 원국을 바탕으로 성향, 사고방식, 감정 표현, 대인관계 패턴을 현실적으로 설명하는 한국어 상담사입니다.',
            userPromptTemplate: [
                '{{baziSummary}}',
                '',
                '위 명식에서 드러나는 성향, 사고방식, 대인관계 흐름을 분석해 주세요.',
                '장점과 보완점을 균형 있게 설명하고, 단정적 성격 규정은 피합니다.',
                '왜 그렇게 볼 수 있는지 원국의 글자와 오행 작용을 근거로 설명해 주세요.',
            ].join('\n'),
            temperature: 0.55,
            maxTokens: 1800,
        },
        {
            key: 'career',
            label: '적성 및 일의 방식 분석',
            enabled: true,
            systemPrompt: '당신은 사주 원국의 십신, 오행, 궁위 흐름을 바탕으로 적성, 일 처리 방식, 사회적 역할을 분석하는 한국어 명리 상담사입니다.',
            userPromptTemplate: [
                '{{baziSummary}}',
                '',
                '위 명식의 적성, 일 처리 방식, 직업적 강점과 보완점을 분석해 주세요.',
                '특정 직업을 단정하기보다 어떤 환경, 역할, 일의 방식에서 강점이 드러나기 쉬운지 설명합니다.',
                '일간, 월지, 식상/재성/관성/인성의 작용이 보이면 그 흐름을 풀어주세요.',
            ].join('\n'),
            temperature: 0.55,
            maxTokens: 1800,
        },
        {
            key: 'flow',
            label: '대운 및 세운 흐름 분석',
            enabled: true,
            systemPrompt: '당신은 사주 원국과 현재 대운, 세운의 관계를 조심스럽고 현실적인 언어로 해석하는 한국어 상담사입니다.',
            userPromptTemplate: [
                '{{baziSummary}}',
                '',
                '현재 운 흐름을 원국과 연결해 분석해 주세요.',
                '현재 대운: {{currentDaewoon}}',
                '현재 세운: {{currentYear}}년 {{currentSewoon}}',
                '대운과 세운이 원국에 주는 자극, 보완, 긴장, 전환 가능성을 구조 중심으로 설명합니다.',
                '사건을 확정적으로 예언하지 말고 흐름과 주의점 중심으로 작성해 주세요.',
            ].join('\n'),
            temperature: 0.5,
            maxTokens: 1600,
        },
    ],
    finalize: {
        provider: 'gemini',
        model: DEFAULT_GEMINI_MODEL,
        systemPrompt: '당신은 여러 사주 분석 초안을 하나의 자연스럽고 깊이 있는 최종 상담문으로 편집하는 전문 한국어 편집자입니다.',
        userPromptTemplate: [
            '{{baziSummary}}',
            '',
            '[분석 초안]',
            '{{stepResults}}',
            '',
            '위 분석 초안을 바탕으로 하나의 완성된 무료 사주 원국 해설문을 작성해 주세요.',
            '요구사항:',
            '1. 분석 내용의 깊이와 근거는 유지하되 중복은 제거합니다.',
            '2. 문단 흐름은 [1. 원국의 핵심 구조], [2. 성향과 관계], [3. 적성과 일의 방식], [4. 현재 운 흐름], [5. 보완점과 조언] 형태로 정리합니다.',
            '3. 맹파, 맹파명리, 맹파명리학 같은 특정 학파명은 최종문에 쓰지 말고 명리학 또는 명리로 자연스럽게 바꿉니다.',
            '4. 마크다운 기호(###, **, *, -, _)는 쓰지 않습니다.',
            '5. 운명 단정, 공포 조장, 건강/투자/법률 확정 조언은 피합니다.',
            '6. 마지막에 AI 상담은 부정확할 수 있으므로 보다 정확한 상담은 유료상담 서비스를 이용하시라는 취지의 문장을 자연스럽게 추가합니다.',
        ].join('\n'),
        temperature: 0.35,
        maxTokens: 5000,
    },
};

export async function getBaziPromptPipelineConfig(adminSupabase: SupabaseClient) {
    const { data, error } = await adminSupabase
        .from('service_settings')
        .select('value')
        .eq('key', BAZI_PROMPT_SETTING_KEY)
        .maybeSingle();

    if (error) {
        console.error('Bazi prompt pipeline setting query error:', error);
        return defaultBaziPromptPipelineConfig;
    }

    return normalizeBaziPromptPipelineConfig(data?.value);
}

export async function getBaziPromptSavedVersions(adminSupabase: SupabaseClient): Promise<BaziPromptVersionItem[]> {
    const { data, error } = await adminSupabase
        .from('service_settings')
        .select('value')
        .eq('key', BAZI_PROMPT_VERSIONS_KEY)
        .maybeSingle();

    if (error || !data?.value || !Array.isArray(data.value)) {
        return [];
    }

    return (data.value as any[])
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
            id: getString(item.id, item.version || 'v1'),
            version: getString(item.version, 'v1'),
            name: getString(item.name, '버전'),
            description: getString(item.description, ''),
            createdAt: getString(item.createdAt, new Date().toISOString()),
            updatedAt: getString(item.updatedAt, new Date().toISOString()),
            config: normalizeBaziPromptPipelineConfig(item.config),
        }));
}

export function normalizeBaziPromptPipelineConfig(value: unknown): BaziPromptPipelineConfig {
    const source = isObject(value) ? value : {};
    const fallback = defaultBaziPromptPipelineConfig;
    const stepsValue = Array.isArray(source.steps) ? source.steps : fallback.steps;
    const steps = stepsValue
        .map((step, index) => normalizeStepConfig(step, fallback.steps[index] || fallback.steps[0], index))
        .filter((step): step is BaziPromptStepConfig => Boolean(step));
    const finalizeSource = isObject(source.finalize) ? source.finalize : {};

    return {
        enabled: typeof source.enabled === 'boolean' ? source.enabled : fallback.enabled,
        version: getString(source.version, fallback.version),
        model: getString(source.model, fallback.model),
        executionMode: source.executionMode === 'sequential' ? 'sequential' : fallback.executionMode,
        steps: steps.length > 0 ? steps : fallback.steps,
        finalize: {
            provider: (finalizeSource.provider === 'deepseek' ? 'deepseek' : 'gemini') as 'gemini' | 'deepseek',
            model: getString(
                finalizeSource.model,
                finalizeSource.provider === 'deepseek' ? 'deepseek-v4-pro' : (fallback.finalize.model || DEFAULT_GEMINI_MODEL)
            ),
            systemPrompt: getString(finalizeSource.systemPrompt, fallback.finalize.systemPrompt),
            userPromptTemplate: getString(finalizeSource.userPromptTemplate, fallback.finalize.userPromptTemplate),
            temperature: getNumber(finalizeSource.temperature, fallback.finalize.temperature, 0, 2),
            maxTokens: getInteger(finalizeSource.maxTokens, fallback.finalize.maxTokens, 256, 8000),
        },
    };
}

export function renderBaziPromptTemplate(template: string, result: BaziResult, extra: Record<string, string> = {}) {
    const context = buildBaziPromptContext(result);
    return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
        return extra[key] ?? context[key] ?? '';
    });
}

export function buildDefaultBaziPrompt(result: BaziResult) {
    const firstEnabledStep = defaultBaziPromptPipelineConfig.steps.find((step) => step.enabled) || defaultBaziPromptPipelineConfig.steps[0];
    return renderBaziPromptTemplate(firstEnabledStep.userPromptTemplate, result);
}

export function buildStepResultsText(results: BaziPromptStepResult[]) {
    return results
        .map((result) => [
            `[${result.label}]`,
            result.ok ? result.content : `생성 실패: ${result.error || '알 수 없는 오류'}`,
        ].join('\n'))
        .join('\n\n');
}

function normalizeStepConfig(value: unknown, fallback: BaziPromptStepConfig | undefined, index: number) {
    if (!fallback && !isObject(value)) return null;

    const source = isObject(value) ? value : {};
    const base = fallback || {
        key: `step-${index + 1}`,
        label: `분석 ${index + 1}`,
        enabled: true,
        systemPrompt: defaultBaziPromptPipelineConfig.steps[0].systemPrompt,
        userPromptTemplate: defaultBaziPromptPipelineConfig.steps[0].userPromptTemplate,
        temperature: 0.5,
        maxTokens: 1600,
    };

    return {
        key: sanitizeKey(getString(source.key, base.key || `step-${index + 1}`)),
        label: getString(source.label, base.label || `분석 ${index + 1}`),
        enabled: typeof source.enabled === 'boolean' ? source.enabled : base.enabled,
        systemPrompt: getString(source.systemPrompt, base.systemPrompt),
        userPromptTemplate: getString(source.userPromptTemplate, base.userPromptTemplate),
        temperature: getNumber(source.temperature, base.temperature, 0, 2),
        maxTokens: getInteger(source.maxTokens, base.maxTokens, 256, 8000),
    };
}

export type BaziPromptVariableCategory = '명식 기본' | '오행·원국' | '신살·기후' | '적성·진로' | '운의 흐름' | '파이프라인';

export type BaziPromptVariableDefinition = {
    key: string;
    label: string;
    category: BaziPromptVariableCategory;
    description: string;
    example: string;
    forFinalizeOnly?: boolean;
    forStepsOnly?: boolean;
};

export const BAZI_PROMPT_VARIABLES: BaziPromptVariableDefinition[] = [
    // 명식 기본
    { key: 'baziSummary', label: '명식 종합 요약', category: '명식 기본', description: '성별, 사주 4기둥, 대운 흐름을 종합한 문장', example: '[성별: 남]인 분이 [년주: 丙(화)午(화) / 월주: 戊(토)戌(토) / 일주: 甲(목)子(수) / 시주: 辛(금)未(토)] 명식으로 태어났습니다.' },
    { key: 'gender', label: '성별', category: '명식 기본', description: '남 또는 여', example: '남' },
    { key: 'age', label: '나이', category: '명식 기본', description: '한국 나이 및 만 나이', example: '35세 (만 34세)' },
    { key: 'birthDateSolar', label: '양력 생년월일', category: '명식 기본', description: '양력 생년월일', example: '1990-10-15' },
    { key: 'birthTime', label: '출생 시간', category: '명식 기본', description: '출생 시간 (시:분)', example: '14:30' },
    { key: 'ddi', label: '띠', category: '명식 기본', description: '십이지 동물 띠', example: '말띠' },
    { key: 'yearPillar', label: '년주', category: '명식 기본', description: '년천간 및 년지지', example: '丙(화)午(화)' },
    { key: 'monthPillar', label: '월주', category: '명식 기본', description: '월천간 및 월지지', example: '戊(토)戌(토)' },
    { key: 'dayPillar', label: '일주', category: '명식 기본', description: '일천간 및 일지지', example: '甲(목)子(수)' },
    { key: 'timePillar', label: '시주', category: '명식 기본', description: '시천간 및 시지지', example: '辛(금)未(토)' },

    // 오행·원국
    { key: 'dayMaster', label: '일간(본인/나)', category: '오행·원국', description: '사주의 주인공인 일간 글자 및 오행/음양', example: '갑(甲, 목/양, 일간)' },
    { key: 'dayUnseong', label: '일지 십이운성', category: '오행·원국', description: '일간 기준 일지의 십이운성', example: '목욕' },
    { key: 'fiveElementsSummary', label: '오행 요약', category: '오행·원국', description: '오행 발달 및 주도/결핍 특성 요약 문장', example: '토(3개) 기운이 발달하여 주도적인 성향을 띱니다.' },
    { key: 'fiveElementsCounts', label: '오행 개수', category: '오행·원국', description: '목화토금수 글자 개수', example: '목: 1개, 화: 2개, 토: 3개, 금: 1개, 수: 1개' },
    { key: 'dominantElement', label: '과다 오행', category: '오행·원국', description: '가장 많은 오행', example: '토' },
    { key: 'deficientElement', label: '결핍 오행', category: '오행·원국', description: '부족하거나 없는 오행', example: '금' },

    // 신살·기후
    { key: 'specialStarsList', label: '신살/길신 전체', category: '신살·기후', description: '도출된 모든 신살과 길신 및 위치/설명', example: '홍염살(년지: 친화력과 매력), 괴강살(월주: 총명함과 배포), 천을귀인(시지: 귀인의 조력)' },
    { key: 'luckyStars', label: '길신 목록', category: '신살·기후', description: '천을귀인, 문창귀인 등 길신 목록', example: '천을귀인(시지)' },
    { key: 'salStars', label: '신살/흉살 목록', category: '신살·기후', description: '홍염살, 괴강살, 도화살 등 신살 목록', example: '홍염살(년지), 괴강살(월주)' },
    { key: 'interactionsSummary', label: '합충형파해 상호작용', category: '신살·기후', description: '사주 글자 간의 결합/충돌 상호작용 불릿 목록', example: '• 년지(午)-월지(戌) 후반합: 협력 및 발전적 결합\n• 년지(午)-일지(子) 육충: 기반 변동 및 마찰' },
    { key: 'climate', label: '사주 기후/긴장도', category: '신살·기후', description: '사주 전체의 조화도와 긴장도 평가', example: '긴장과 조화가 공존하는 복합형 (긴장도: 4.6, 조화도: 2.8)' },

    // 적성·진로
    { key: 'careerAdvice', label: '진로/재물 권장 조언', category: '적성·진로', description: '사회적 시장에서 역량을 발휘하기 좋은 진로 권장', example: '전문성이나 독자적인 수단을 무기로 독립 사업, 전문직, 성과형 프로젝트에서 큰 성취를 이룰 수 있습니다.' },
    { key: 'binZhuMeaning', label: '빈주 사회적 작용', category: '적성·진로', description: '나(일/시)와 사회/시장(년/월)의 주도권 관계 해석', example: '자신의 역량과 수단(일/시주)으로 사회와 시장(년/월주)의 기회와 자원을 적극적으로 내 것으로 만드는 구조입니다.' },
    { key: 'binZhuDirection', label: '빈주 흐름 방향', category: '적성·진로', description: '주 ➔ 빈 또는 빈 ➔ 주 통제 방향', example: '주 ➔ 빈 (주통빈/자원취용형)' },
    { key: 'xuShiDynamics', label: '허실 변화(유동성)', category: '적성·진로', description: '천간 글자의 실자/변허/허투에 따른 적응력 분석', example: '천간 4자 중 실자변허(變虛) 2개, 허(虛) 2개로 고정된 환경보다 유동적 환경에서의 전환 적응력이 강점으로 작용합니다.' },
    { key: 'aiConsultationPrompts', label: 'AI 상담 핵심 힌트', category: '적성·진로', description: '엔진이 추출한 핵심 명리 불릿포인트 요약 목록', example: '• 【오행 분포】 토(3개) 기운 발달\n• 【주요 신살】 홍염살(년지), 괴강살(월주)\n• 【진로/재물 권장】 전문직 권장' },

    // 운의 흐름
    { key: 'currentYear', label: '기준 연도', category: '운의 흐름', description: '현재 한국 기준 연도', example: '2026' },
    { key: 'currentSewoon', label: '현재 세운', category: '운의 흐름', description: '올해의 세운 간지', example: '丙午' },
    { key: 'currentDaewoon', label: '현재 대운', category: '운의 흐름', description: '현재 머물고 있는 대운 간지와 연도 범위', example: '戊戌(35~44세, 2024~2033년)' },
    { key: 'currentDaewoonYearRange', label: '현재 대운 연도', category: '운의 흐름', description: '현재 대운 시작~종료 연도', example: '2024~2033년' },
    { key: 'previousDaewoon', label: '이전 대운', category: '운의 흐름', description: '직전 대운 간지와 연도', example: '丁酉(25~34세, 2014~2023년)' },
    { key: 'previousDaewoonYearRange', label: '이전 대운 연도', category: '운의 흐름', description: '직전 대운 시작~종료 연도', example: '2014~2023년' },
    { key: 'nextDaewoon', label: '이후 대운', category: '운의 흐름', description: '다음 대운 간지와 연도', example: '己亥(45~54세, 2034~2043년)' },
    { key: 'nextDaewoonYearRange', label: '이후 대운 연도', category: '운의 흐름', description: '다음 대운 시작~종료 연도', example: '2034~2043년' },

    // 파이프라인
    { key: 'previousStepResults', label: '이전 단계 누적 결과', category: '파이프라인', description: '순차 실행 모드에서 직전 단계까지의 분석 내용이 누적됨', example: '[원국 구조 분석]\n...', forStepsOnly: true },
    { key: 'stepResults', label: '전체 분석 단계 결과', category: '파이프라인', description: '모든 분석 단계의 결과가 종합되어 전달됨 (최종 통합 편집 단계 전용)', example: '[원국 구조 분석]\n...\n\n[성향 및 관계 분석]\n...', forFinalizeOnly: true },
];

export function buildBaziPromptContext(result: BaziResult): Record<string, string> {
    const pillars: Partial<NonNullable<BaziResult['four_pillars']>> = result.four_pillars || {};
    const meta = result.meta || {};
    const gender = meta.gender || '사용자';
    const yearPillar = formatPillar(pillars.year);
    const monthPillar = formatPillar(pillars.month);
    const dayPillar = formatPillar(pillars.day);
    const timePillar = formatPillar(pillars.hour || pillars.time);
    const currentYear = getKstYear();
    const daewoonList = result.daewoon?.list || [];
    const currentDaewoon = result.daewoon?.current || findCurrentDaewoon(daewoonList, currentYear);
    const adjacentDaewoon = findAdjacentDaewoon(daewoonList, currentDaewoon);
    const currentSewoon = currentDaewoon ? getYearGanji(currentYear) : null;
    const previousDaewoonText = adjacentDaewoon.previous ? formatDaewoon(adjacentDaewoon.previous) : '-';
    const currentDaewoonText = currentDaewoon ? formatDaewoon(currentDaewoon) : '-';
    const nextDaewoonText = adjacentDaewoon.next ? formatDaewoon(adjacentDaewoon.next) : '-';
    const previousDaewoonYearRange = adjacentDaewoon.previous ? formatDaewoonYearRange(adjacentDaewoon.previous) : '-';
    const currentDaewoonYearRange = currentDaewoon ? formatDaewoonYearRange(currentDaewoon) : '-';
    const nextDaewoonYearRange = adjacentDaewoon.next ? formatDaewoonYearRange(adjacentDaewoon.next) : '-';
    const currentSewoonText = currentSewoon ? `${currentSewoon.gan}${currentSewoon.ji}` : '-';

    const baziSummary = [
        `[성별: ${gender}]인 분이 [년주: ${yearPillar} / 월주: ${monthPillar} / 일주: ${dayPillar} / 시주: ${timePillar}] 명식으로 태어났습니다.`,
        currentDaewoon ? `[현재 운 흐름: 이전 대운 ${previousDaewoonText} / 현재 대운 ${currentDaewoonText} / 이후 대운 ${nextDaewoonText} / 현재 세운 ${currentYear}년 ${currentSewoonText}]입니다.` : '',
        currentDaewoon ? `[대운 연도 범위: 이전 ${previousDaewoonYearRange} / 현재 ${currentDaewoonYearRange} / 이후 ${nextDaewoonYearRange}]입니다.` : '',
    ].filter(Boolean).join('\n');

    // Basic meta
    const ageKorean = meta.age_korean ? `${meta.age_korean}세` : '';
    const ageMan = meta.age_man ? `(만 ${meta.age_man}세)` : '';
    const ageText = [ageKorean, ageMan].filter(Boolean).join(' ') || '-';
    const birthDateSolar = meta.birth_date_solar || '-';
    const birthTime = meta.birth_time || '-';
    const ddi = meta.ddi ? `${meta.ddi}띠` : '-';

    // Day master (일간) & Day Unseong
    const dayGan = pillars.day?.gan;
    const dayMaster = dayGan
        ? `${dayGan.kr || dayGan.ch || ''}(${dayGan.ch || ''}, ${dayGan.element || ''}${dayGan.yin_yang ? '/' + dayGan.yin_yang : ''}, 일간)`
        : '-';
    const dayUnseong = pillars.day?.unseong || '-';

    // Advanced analysis: Five elements
    const fe = result.advanced_analysis?.five_elements;
    const fiveElementsSummary = fe?.summary || '-';
    const fiveElementsCounts = fe?.counts
        ? Object.entries(fe.counts).map(([k, v]) => `${k}: ${v}개`).join(', ')
        : '-';
    const dominantElement = fe?.dominant?.length ? fe.dominant.join(', ') : '없음';
    const deficientElement = fe?.deficient?.length ? fe.deficient.join(', ') : '없음';

    // Advanced analysis: Special stars
    const stars = result.advanced_analysis?.special_stars || [];
    const specialStarsList = stars.length > 0
        ? stars.map((s) => `${s.name}(${s.position || s.pillar || ''}${s.description ? ': ' + s.description : ''})`).join(', ')
        : '해당 없음';
    const luckyStars = stars.filter((s) => s.type?.includes('길신')).map((s) => `${s.name}(${s.position || s.pillar || ''})`).join(', ') || '없음';
    const salStars = stars.filter((s) => !s.type?.includes('길신')).map((s) => `${s.name}(${s.position || s.pillar || ''})`).join(', ') || '없음';

    // Advanced analysis: Interactions & Climate
    const inter = result.advanced_analysis?.interactions;
    const interactionsSummary = inter?.summary_list?.length
        ? inter.summary_list.map((item) => `• ${item}`).join('\n')
        : '-';
    const climate = inter?.climate
        ? `${inter.climate} (긴장도: ${inter.tension_score ?? '-'}, 조화도: ${inter.harmony_score ?? '-'})`
        : '-';

    // Advanced analysis: Bin-Zhu & Xu-Shi dynamics
    const bz = result.advanced_analysis?.bin_zhu_dynamics?.control_flow;
    const careerAdvice = bz?.career_advice || '-';
    const binZhuMeaning = bz?.summary_meaning || '-';
    const binZhuDirection = bz?.direction || '-';
    const xuShiDynamics = result.advanced_analysis?.xu_shi_dynamics?.overall_status || '-';

    // Advanced analysis: AI prompts
    const aiPrompts = result.advanced_analysis?.ai_consultation_prompts || [];
    const aiConsultationPrompts = aiPrompts.length > 0
        ? aiPrompts.map((p) => `• ${p}`).join('\n')
        : '-';

    return {
        gender,
        yearPillar,
        monthPillar,
        dayPillar,
        timePillar,
        currentYear: String(currentYear),
        previousDaewoon: previousDaewoonText,
        previousDaewoonYearRange,
        currentDaewoon: currentDaewoonText,
        currentDaewoonYearRange,
        nextDaewoon: nextDaewoonText,
        nextDaewoonYearRange,
        currentSewoon: currentSewoonText,
        baziSummary,
        age: ageText,
        birthDateSolar,
        birthTime,
        ddi,
        dayMaster,
        dayUnseong,
        fiveElementsSummary,
        fiveElementsCounts,
        dominantElement,
        deficientElement,
        specialStarsList,
        luckyStars,
        salStars,
        interactionsSummary,
        climate,
        careerAdvice,
        binZhuMeaning,
        binZhuDirection,
        xuShiDynamics,
        aiConsultationPrompts,
    };
}

export function getSampleBaziPromptContext(): Record<string, string> {
    const map: Record<string, string> = {};
    for (const v of BAZI_PROMPT_VARIABLES) {
        map[v.key] = v.example;
    }
    return map;
}

function findCurrentDaewoon(items: NonNullable<BaziResult['daewoon']>['list'], currentYear: number) {
    return items?.find((item) => {
        if (item.start_year === undefined || item.end_year === undefined) return false;
        return item.start_year <= currentYear && currentYear <= item.end_year;
    }) || null;
}

function findAdjacentDaewoon(
    items: NonNullable<BaziResult['daewoon']>['list'],
    currentDaewoon?: NonNullable<BaziResult['daewoon']>['current'],
) {
    if (!currentDaewoon || !items?.length) {
        return { previous: null, next: null };
    }

    const currentIndex = items.findIndex((item) => (
        item.start_year === currentDaewoon.start_year
        && item.end_year === currentDaewoon.end_year
        && item.start_age === currentDaewoon.start_age
        && item.end_age === currentDaewoon.end_age
        && item.gan === currentDaewoon.gan
        && item.ji === currentDaewoon.ji
    ));

    if (currentIndex === -1) {
        return { previous: null, next: null };
    }

    return {
        previous: items[currentIndex - 1] || null,
        next: items[currentIndex + 1] || null,
    };
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

function formatDaewoonYearRange(daewoon?: NonNullable<BaziResult['daewoon']>['current']) {
    if (!daewoon || daewoon.start_year === undefined || daewoon.end_year === undefined) return '-';

    return `${daewoon.start_year}~${daewoon.end_year}년`;
}

function getYearGanji(year: number) {
    const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
    const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
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

function getKstYear() {
    return Number(new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 4));
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getString(value: unknown, fallback: string) {
    return typeof value === 'string' && value.trim() ? value : fallback;
}

function getNumber(value: unknown, fallback: number, min: number, max: number) {
    const number = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
}

function getInteger(value: unknown, fallback: number, min: number, max: number) {
    return Math.floor(getNumber(value, fallback, min, max));
}

function sanitizeKey(value: string) {
    return value.trim().replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 40) || 'step';
}
