const relationNames: Record<string, string> = {
    combine: '합', clash: '충', control: '극', generate: '생', harm: '해', break: '파',
    punishment: '형', self_punishment: '자형', trine: '삼합', square: '방합',
    half_combine: '반합', transmission: '투간', element: '오행 관계',
    repeat: '같은 지지', same_branch: '같은 지지', self_combine: '자합',
    hidden_combine: '암합', pierce: '천',
};

export function relationName(type?: string) {
    if (!type) return '관계';
    return relationNames[type] || (/^[a-z][a-z_]*$/.test(type) ? '기타 관계' : type);
}
