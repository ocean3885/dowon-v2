export type SelectOption = {
    value: string;
    label: string;
};

export type SajuRelationCase = {
    relation_type: string;
    relation_key: string;
    day_pillar: string;
    day_stem: string;
    day_branch: string;
    actor_char: string;
    target_char: string;
    actor_ten_star: string | null;
    target_ten_star: string | null;
    ten_star_pair: string | null;
    actor_position: string;
    target_position: string;
    palace_pair: string;
    title: string;
};

export const relationTypes: SelectOption[] = [
    { value: 'clash', label: '충' },
    { value: 'combine', label: '합' },
    { value: 'stem_combine', label: '천간합' },
    { value: 'self_combine', label: '자합' },
    { value: 'punishment', label: '형' },
    { value: 'harm', label: '해' },
    { value: 'break', label: '파' },
];

export const relationTypeLabels: Record<string, string> = {
    clash: '충',
    combine: '합',
    stem_combine: '천간합',
    self_combine: '자합',
    punishment: '형',
    harm: '해',
    break: '파',
};

export const relationKeyOptionsByType: Record<string, SelectOption[]> = {
    clash: [
        { value: '子午沖', label: '子午沖' },
        { value: '丑未沖', label: '丑未沖' },
        { value: '寅申沖', label: '寅申沖' },
        { value: '卯酉沖', label: '卯酉沖' },
        { value: '辰戌沖', label: '辰戌沖' },
        { value: '巳亥沖', label: '巳亥沖' },
    ],
    combine: [
        { value: '子丑合', label: '子丑合' },
        { value: '寅亥合', label: '寅亥合' },
        { value: '卯戌合', label: '卯戌合' },
        { value: '辰酉合', label: '辰酉合' },
        { value: '巳申合', label: '巳申合' },
        { value: '午未合', label: '午未合' },
    ],
    stem_combine: [
        { value: '甲己合', label: '甲己合' },
        { value: '乙庚合', label: '乙庚合' },
        { value: '丙辛合', label: '丙辛合' },
        { value: '丁壬合', label: '丁壬合' },
        { value: '戊癸合', label: '戊癸合' },
    ],
    self_combine: [
        { value: '丁亥自合', label: '丁亥自合' },
        { value: '戊子自合', label: '戊子自合' },
        { value: '辛巳自合', label: '辛巳自合' },
        { value: '壬午自合', label: '壬午自合' },
    ],
    punishment: [
        { value: '寅巳刑', label: '寅巳刑' },
        { value: '巳申刑', label: '巳申刑' },
        { value: '寅申刑', label: '寅申刑' },
        { value: '丑戌刑', label: '丑戌刑' },
        { value: '戌未刑', label: '戌未刑' },
        { value: '丑未刑', label: '丑未刑' },
        { value: '子卯刑', label: '子卯刑' },
        { value: '辰辰刑', label: '辰辰刑' },
        { value: '午午刑', label: '午午刑' },
        { value: '酉酉刑', label: '酉酉刑' },
        { value: '亥亥刑', label: '亥亥刑' },
    ],
    harm: [
        { value: '子未害', label: '子未害' },
        { value: '丑午害', label: '丑午害' },
        { value: '寅巳害', label: '寅巳害' },
        { value: '卯辰害', label: '卯辰害' },
        { value: '申亥害', label: '申亥害' },
        { value: '酉戌害', label: '酉戌害' },
    ],
    break: [
        { value: '子酉破', label: '子酉破' },
        { value: '丑辰破', label: '丑辰破' },
        { value: '寅亥破', label: '寅亥破' },
        { value: '卯午破', label: '卯午破' },
        { value: '巳申破', label: '巳申破' },
        { value: '未戌破', label: '未戌破' },
    ],
};

export const positionOptions: SelectOption[] = [
    { value: 'year_stem', label: '년간' },
    { value: 'month_stem', label: '월간' },
    { value: 'day_stem', label: '일간' },
    { value: 'hour_stem', label: '시간' },
    { value: 'year_branch', label: '년지' },
    { value: 'month_branch', label: '월지' },
    { value: 'day_branch', label: '일지' },
    { value: 'hour_branch', label: '시지' },
];

const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export const dayStems = stems;
export const dayPillars = Array.from({ length: 60 }, (_, index) => `${stems[index % stems.length]}${branches[index % branches.length]}`);

const stemPositions = positionOptions.filter((position) => position.value.endsWith('_stem'));
const branchPositions = positionOptions.filter((position) => position.value.endsWith('_branch'));
const positionLabelByValue = Object.fromEntries(positionOptions.map((position) => [position.value, position.label]));
const samePillarPositionPairs = [
    ['year_stem', 'year_branch'],
    ['month_stem', 'month_branch'],
    ['day_stem', 'day_branch'],
    ['hour_stem', 'hour_branch'],
] as const;
const branchMainStem: Record<string, string> = {
    子: '癸',
    丑: '己',
    寅: '甲',
    卯: '乙',
    辰: '戊',
    巳: '丙',
    午: '丁',
    未: '己',
    申: '庚',
    酉: '辛',
    戌: '戊',
    亥: '壬',
};

const stemElement: Record<string, string> = {
    甲: 'wood',
    乙: 'wood',
    丙: 'fire',
    丁: 'fire',
    戊: 'earth',
    己: 'earth',
    庚: 'metal',
    辛: 'metal',
    壬: 'water',
    癸: 'water',
};

const stemPolarity: Record<string, 'yang' | 'yin'> = {
    甲: 'yang',
    乙: 'yin',
    丙: 'yang',
    丁: 'yin',
    戊: 'yang',
    己: 'yin',
    庚: 'yang',
    辛: 'yin',
    壬: 'yang',
    癸: 'yin',
};

const branchPolarity: Record<string, 'yang' | 'yin'> = {
    子: 'yang',
    丑: 'yin',
    寅: 'yang',
    卯: 'yin',
    辰: 'yang',
    巳: 'yin',
    午: 'yang',
    未: 'yin',
    申: 'yang',
    酉: 'yin',
    戌: 'yang',
    亥: 'yin',
};

const generatedBy: Record<string, string> = {
    wood: 'water',
    fire: 'wood',
    earth: 'fire',
    metal: 'earth',
    water: 'metal',
};

const generates: Record<string, string> = {
    wood: 'fire',
    fire: 'earth',
    earth: 'metal',
    metal: 'water',
    water: 'wood',
};

const controls: Record<string, string> = {
    wood: 'earth',
    fire: 'metal',
    earth: 'water',
    metal: 'wood',
    water: 'fire',
};

export function getPositionLabel(position: string) {
    return positionLabelByValue[position] || position;
}

export function parseRelationChars(relationKey: string) {
    const chars = Array.from(relationKey).filter((char) => stems.includes(char) || branches.includes(char));
    return {
        actorChar: chars[0] || '',
        targetChar: chars[1] || '',
    };
}

export function parseDayPillar(dayPillar: string) {
    const chars = Array.from(dayPillar);
    const dayStem = chars[0] || '';
    const dayBranch = chars[1] || '';

    if (!dayPillars.includes(dayPillar) || !stems.includes(dayStem) || !branches.includes(dayBranch)) {
        return null;
    }

    return { dayStem, dayBranch };
}

export function getTenStar(dayStem: string, targetChar: string) {
    const targetStem = branches.includes(targetChar) ? branchMainStem[targetChar] : targetChar;
    const dayElement = stemElement[dayStem];
    const targetElement = stemElement[targetStem];
    const samePolarity = stemPolarity[dayStem] === stemPolarity[targetStem];

    if (!dayElement || !targetElement) return null;
    if (dayElement === targetElement) return samePolarity ? '비견' : '겁재';
    if (generates[dayElement] === targetElement) return samePolarity ? '식신' : '상관';
    if (controls[dayElement] === targetElement) return samePolarity ? '편재' : '정재';
    if (controls[targetElement] === dayElement) return samePolarity ? '편관' : '정관';
    if (generatedBy[dayElement] === targetElement) return samePolarity ? '편인' : '정인';

    return null;
}

export function canUseBranchAsDayBranch(dayStem: string, branch: string) {
    return stemPolarity[dayStem] === branchPolarity[branch];
}

export function getPositionOptionsForChar(char: string, dayStem?: string, dayBranch?: string) {
    if (stems.includes(char)) {
        return stemPositions.filter((position) => position.value !== 'day_stem' || char === dayStem);
    }

    if (branches.includes(char)) {
        return branchPositions.filter(
            (position) => position.value !== 'day_branch' || !dayBranch || char === dayBranch
        );
    }

    return [];
}

function buildPositionPairs({
    relationType,
    actorChar,
    targetChar,
    dayStem,
    dayBranch,
}: {
    relationType: string;
    actorChar: string;
    targetChar: string;
    dayStem: string;
    dayBranch: string;
}) {
    if (relationType === 'self_combine') {
        const actorIsStem = stems.includes(actorChar);
        const targetIsStem = stems.includes(targetChar);

        if (actorIsStem === targetIsStem) return [];

        return samePillarPositionPairs
            .map(([stemPosition, branchPosition]) => ({
                actorPosition: actorIsStem ? stemPosition : branchPosition,
                targetPosition: targetIsStem ? stemPosition : branchPosition,
            }))
            .filter((pair) => isPossibleDayPillarPair({ pair, actorChar, targetChar, dayStem, dayBranch }));
    }

    const actorPositions = getPositionOptionsForChar(actorChar, dayStem, dayBranch);
    const targetPositions = getPositionOptionsForChar(targetChar, dayStem, dayBranch);
    const pairs: { actorPosition: string; targetPosition: string }[] = [];

    for (const actorPosition of actorPositions) {
        for (const targetPosition of targetPositions) {
            if (actorPosition.value === targetPosition.value) continue;

            pairs.push({
                actorPosition: actorPosition.value,
                targetPosition: targetPosition.value,
            });
        }
    }

    return pairs.filter((pair) => isPossibleDayPillarPair({ pair, actorChar, targetChar, dayStem, dayBranch }));
}

function isPossibleDayPillarPair({
    pair,
    actorChar,
    targetChar,
    dayStem,
    dayBranch,
}: {
    pair: { actorPosition: string; targetPosition: string };
    actorChar: string;
    targetChar: string;
    dayStem: string;
    dayBranch: string;
}) {
    if (pair.actorPosition === 'day_stem' && actorChar !== dayStem) return false;
    if (pair.targetPosition === 'day_stem' && targetChar !== dayStem) return false;
    if (pair.actorPosition === 'day_branch' && actorChar !== dayBranch) return false;
    if (pair.targetPosition === 'day_branch' && targetChar !== dayBranch) return false;

    return true;
}

export function buildSajuRelationCases({
    relationType,
    relationKey,
    dayPillar,
}: {
    relationType: string;
    relationKey: string;
    dayPillar: string;
}) {
    const { actorChar, targetChar } = parseRelationChars(relationKey);
    const parsedDayPillar = parseDayPillar(dayPillar);

    if (!actorChar || !targetChar || !parsedDayPillar) {
        return [];
    }

    const { dayStem, dayBranch } = parsedDayPillar;
    const positionPairs = buildPositionPairs({ relationType, actorChar, targetChar, dayStem, dayBranch });
    const actorTenStar = getTenStar(dayStem, actorChar);
    const targetTenStar = getTenStar(dayStem, targetChar);
    const tenStarPair = actorTenStar && targetTenStar ? `${actorTenStar}-${targetTenStar}` : null;
    const cases: SajuRelationCase[] = [];

    for (const pair of positionPairs) {
        const actorPositionLabel = getPositionLabel(pair.actorPosition);
        const targetPositionLabel = getPositionLabel(pair.targetPosition);
        const palacePair = `${actorPositionLabel}-${targetPositionLabel}`;
        const actorTenStarLabel = actorTenStar || '-';
        const targetTenStarLabel = targetTenStar || '-';

        cases.push({
            relation_type: relationType,
            relation_key: relationKey,
            day_pillar: dayPillar,
            day_stem: dayStem,
            day_branch: dayBranch,
            actor_char: actorChar,
            target_char: targetChar,
            actor_ten_star: actorTenStar,
            target_ten_star: targetTenStar,
            ten_star_pair: tenStarPair,
            actor_position: pair.actorPosition,
            target_position: pair.targetPosition,
            palace_pair: palacePair,
            title: `${dayPillar}日柱 ${actorPositionLabel}(${actorTenStarLabel})-${targetPositionLabel}(${targetTenStarLabel}) ${relationKey}`,
        });
    }

    return cases;
}
