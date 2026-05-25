'use client';

import {
    dayPillars,
    relationKeyOptionsByType,
    relationTypes,
    type SajuRelationCase,
} from '@/lib/saju-relations';
import { AlertTriangle, Loader2, Play, RotateCcw, Search, Wand2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type ExistingReading = {
    id: number;
    status: string;
    title: string;
    summary: string;
};

type PreviewCase = SajuRelationCase & {
    existing: ExistingReading | null;
    error?: string;
};

type PreviewResponse = {
    cases: PreviewCase[];
    total: number;
    existingCount: number;
    message?: string;
};

export default function SajuRelationBatchGenerator() {
    const router = useRouter();
    const [relationType, setRelationType] = useState('clash');
    const [relationKey, setRelationKey] = useState(relationKeyOptionsByType.clash[0]?.value || '');
    const [customRelationKey, setCustomRelationKey] = useState('');
    const [dayPillar, setDayPillar] = useState('甲子');
    const [previewCases, setPreviewCases] = useState<PreviewCase[]>([]);
    const [message, setMessage] = useState('');
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    const [generatingCaseKey, setGeneratingCaseKey] = useState<string | null>(null);
    const [generationTotal, setGenerationTotal] = useState(0);
    const [generationMode, setGenerationMode] = useState<'missing' | 'overwrite' | null>(null);
    const [showOverwriteModal, setShowOverwriteModal] = useState(false);
    const relationKeyOptions = relationKeyOptionsByType[relationType] || [];
    const selectedRelationKey = relationKey === '__custom__' ? customRelationKey.trim() : relationKey;
    const missingCases = useMemo(() => previewCases.filter((item) => !item.existing), [previewCases]);
    const failedCases = useMemo(() => previewCases.filter((item) => item.error), [previewCases]);
    const generationRetryCases = useMemo(
        () => previewCases.filter((item) => !item.existing || item.error),
        [previewCases]
    );
    const canGenerateMissing = previewCases.length > 0 && generationRetryCases.length > 0;
    const canOverwriteAll = previewCases.length > 0 && generationRetryCases.length === 0;

    function handleRelationTypeChange(nextRelationType: string) {
        const nextOptions = relationKeyOptionsByType[nextRelationType] || [];
        setRelationType(nextRelationType);
        setRelationKey(nextOptions[0]?.value || '__custom__');
        setCustomRelationKey('');
        setPreviewCases([]);
        setMessage('');
    }

    async function handlePreview() {
        setLoadingPreview(true);
        setMessage('');

        try {
            const response = await fetch('/api/admin/saju-relations/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    relationType,
                    relationKey: selectedRelationKey,
                    dayPillar,
                }),
            });
            const data = (await response.json()) as PreviewResponse;

            if (!response.ok) {
                throw new Error(data.message || '조회에 실패했습니다.');
            }

            setPreviewCases(data.cases);
            setMessage(`총 ${data.total}개 조합 중 ${data.existingCount}개가 이미 등록되어 있습니다.`);
        } catch (error) {
            setPreviewCases([]);
            setMessage(error instanceof Error ? error.message : '조회 중 오류가 발생했습니다.');
        } finally {
            setLoadingPreview(false);
        }
    }

    async function handleGenerate(overwrite = false) {
        const targetCases = overwrite ? previewCases : generationRetryCases;
        if (targetCases.length === 0 || generating) return;

        setGenerating(true);
        setGenerationMode(overwrite ? 'overwrite' : 'missing');
        setGenerationTotal(targetCases.length);
        setMessage('');

        for (let index = 0; index < targetCases.length; index++) {
            const item = targetCases[index];
            setCurrentIndex(index + 1);

            try {
                const response = await fetch('/api/admin/saju-relations/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        relationType: item.relation_type,
                        relationKey: item.relation_key,
                        dayPillar: item.day_pillar,
                        actorPosition: item.actor_position,
                        targetPosition: item.target_position,
                        overwrite: overwrite || Boolean(item.error && item.existing),
                    }),
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || '생성에 실패했습니다.');
                }

                setPreviewCases((prev) => prev.map((prevItem) => {
                    const isSame =
                        prevItem.actor_position === item.actor_position &&
                        prevItem.target_position === item.target_position &&
                        prevItem.actor_char === item.actor_char &&
                        prevItem.target_char === item.target_char;

                    if (!isSame) return prevItem;

                    return {
                        ...prevItem,
                        existing: data.reading || prevItem.existing,
                        error: undefined,
                    };
                }));
            } catch (error) {
                setPreviewCases((prev) => prev.map((prevItem) => {
                    const isSame =
                        prevItem.actor_position === item.actor_position &&
                        prevItem.target_position === item.target_position &&
                        prevItem.actor_char === item.actor_char &&
                        prevItem.target_char === item.target_char;

                    if (!isSame) return prevItem;

                    return {
                        ...prevItem,
                        error: error instanceof Error ? error.message : '생성 중 오류가 발생했습니다.',
                    };
                }));
            }
        }

        setGenerating(false);
        setCurrentIndex(null);
        setGenerationTotal(0);
        setGenerationMode(null);
        setMessage(
            overwrite
                ? '재등록 작업이 완료되었습니다. 기존 데이터는 초안 상태의 새 생성 결과로 갱신되었습니다.'
                : '생성 작업이 완료되었습니다. 실패 항목이 있으면 다시 생성할 수 있습니다.'
        );
        router.refresh();
    }

    async function handleGenerateOne(item: PreviewCase) {
        if (generating) return;

        const itemKey = getPreviewCaseKey(item);
        setGenerating(true);
        setGenerationMode(null);
        setGenerationTotal(1);
        setCurrentIndex(1);
        setGeneratingCaseKey(itemKey);
        setMessage('');

        try {
            const response = await fetch('/api/admin/saju-relations/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    relationType: item.relation_type,
                    relationKey: item.relation_key,
                    dayPillar: item.day_pillar,
                    actorPosition: item.actor_position,
                    targetPosition: item.target_position,
                    overwrite: Boolean(item.existing),
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '생성에 실패했습니다.');
            }

            setPreviewCases((prev) => prev.map((prevItem) => {
                if (getPreviewCaseKey(prevItem) !== itemKey) return prevItem;

                return {
                    ...prevItem,
                    existing: data.reading || prevItem.existing,
                    error: undefined,
                };
            }));
            setMessage(item.existing ? '선택한 조합을 재등록했습니다.' : '선택한 조합을 생성했습니다.');
            router.refresh();
        } catch (error) {
            setPreviewCases((prev) => prev.map((prevItem) => {
                if (getPreviewCaseKey(prevItem) !== itemKey) return prevItem;

                return {
                    ...prevItem,
                    error: error instanceof Error ? error.message : '생성 중 오류가 발생했습니다.',
                };
            }));
            setMessage(error instanceof Error ? error.message : '생성 중 오류가 발생했습니다.');
        } finally {
            setGenerating(false);
            setCurrentIndex(null);
            setGenerationTotal(0);
            setGeneratingCaseKey(null);
        }
    }

    function handleConfirmOverwrite() {
        setShowOverwriteModal(false);
        void handleGenerate(true);
    }

    return (
        <div className="space-y-5">
            <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_160px_auto]">
                    <label className="block">
                        <span className="mb-2 block text-sm font-bold text-stone-700">관계 유형</span>
                        <select
                            value={relationType}
                            onChange={(event) => handleRelationTypeChange(event.target.value)}
                            disabled={generating}
                            className="h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:opacity-60"
                        >
                            {relationTypes.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-bold text-stone-700">관계 키</span>
                        <select
                            value={relationKey}
                            onChange={(event) => {
                                setRelationKey(event.target.value);
                                setPreviewCases([]);
                                setMessage('');
                            }}
                            disabled={generating}
                            className="h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:opacity-60"
                        >
                            {relationKeyOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                            <option value="__custom__">직접 입력</option>
                        </select>
                        {relationKey === '__custom__' && (
                            <input
                                value={customRelationKey}
                                onChange={(event) => {
                                    setCustomRelationKey(event.target.value);
                                    setPreviewCases([]);
                                    setMessage('');
                                }}
                                placeholder="예: 丁亥自合"
                                disabled={generating}
                                className="mt-2 h-11 w-full rounded-lg border border-stone-300 px-3 text-sm text-stone-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:opacity-60"
                            />
                        )}
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-bold text-stone-700">기준 일주</span>
                        <select
                            value={dayPillar}
                            onChange={(event) => {
                                setDayPillar(event.target.value);
                                setPreviewCases([]);
                                setMessage('');
                            }}
                            disabled={generating}
                            className="h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:opacity-60"
                        >
                            {dayPillars.map((pillar) => (
                                <option key={pillar} value={pillar}>
                                    {pillar}
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={handlePreview}
                            disabled={loadingPreview || generating || !selectedRelationKey}
                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-stone-800 px-5 text-sm font-bold text-white transition-colors hover:bg-stone-700 disabled:cursor-wait disabled:opacity-60 md:w-auto"
                        >
                            {loadingPreview ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                            조회
                        </button>
                    </div>
                </div>
            </section>

            {message && (
                <p className="rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-600 shadow-sm">
                    {message}
                </p>
            )}

            {previewCases.length > 0 && (
                <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-stone-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="font-bold text-stone-800">생성 대상 조합</h3>
                            <p className="mt-1 text-sm text-stone-500">
                                미등록 {missingCases.length}개
                                {failedCases.length > 0 ? ` · 실패 ${failedCases.length}개` : ''}
                                {' '} / 전체 {previewCases.length}개
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => handleGenerate(false)}
                                disabled={generating || !canGenerateMissing}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-amber-700 px-4 text-sm font-bold text-white transition-colors hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {generating && generationMode === 'missing' ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Play size={16} />
                                )}
                                {generating && generationMode === 'missing' && currentIndex
                                    ? `생성 중 ${currentIndex}/${generationTotal}`
                                    : '미등록 조합 생성'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowOverwriteModal(true)}
                                disabled={generating || !canOverwriteAll}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 text-sm font-bold text-stone-700 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {generating && generationMode === 'overwrite' ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <RotateCcw size={16} />
                                )}
                                {generating && generationMode === 'overwrite' && currentIndex
                                    ? `재등록 중 ${currentIndex}/${generationTotal}`
                                    : '전체 조합 재등록'}
                            </button>
                        </div>
                    </div>

                    <div className="hidden overflow-x-auto lg:block">
                        <table className="w-full text-left">
                            <thead className="bg-stone-50">
                                <tr>
                                    <th className="px-5 py-3 text-sm font-medium text-stone-500">궁위</th>
                                    <th className="px-5 py-3 text-sm font-medium text-stone-500">글자</th>
                                    <th className="px-5 py-3 text-sm font-medium text-stone-500">십신</th>
                                    <th className="px-5 py-3 text-sm font-medium text-stone-500">상태</th>
                                    <th className="px-5 py-3 text-sm font-medium text-stone-500">제목/오류</th>
                                    <th className="px-5 py-3 text-right text-sm font-medium text-stone-500">작업</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {previewCases.map((item) => (
                                    <PreviewRow
                                        key={getPreviewCaseKey(item)}
                                        item={item}
                                        generating={generating}
                                        isGenerating={generatingCaseKey === getPreviewCaseKey(item)}
                                        onGenerate={handleGenerateOne}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="block divide-y divide-stone-100 lg:hidden">
                        {previewCases.map((item) => (
                            <article key={`${item.actor_position}-${item.target_position}`} className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-bold text-stone-800">{item.palace_pair}</p>
                                        <p className="mt-1 text-sm text-stone-500">
                                            {item.actor_char}-{item.target_char} · {item.ten_star_pair || '-'}
                                        </p>
                                    </div>
                                    <StatusBadge item={item} />
                                </div>
                                <p className={`mt-3 text-sm leading-6 ${item.error ? 'text-red-600' : 'text-stone-500'}`}>
                                    {item.error || item.existing?.title || item.title}
                                </p>
                                <div className="mt-3 flex justify-end">
                                    <SingleGenerateButton
                                        item={item}
                                        generating={generating}
                                        isGenerating={generatingCaseKey === getPreviewCaseKey(item)}
                                        onGenerate={handleGenerateOne}
                                    />
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {showOverwriteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 px-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-full bg-red-50 p-2 text-red-600">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-stone-900">전체 조합 재등록</h3>
                                <p className="mt-2 text-sm leading-6 text-stone-600">
                                    현재 조회된 등록 데이터를 전부 새 생성 결과로 덮어씁니다. 기존 제목, 요약,
                                    상세 해설은 복구할 수 없으며 재등록된 항목은 초안 상태로 변경됩니다.
                                </p>
                                <p className="mt-2 text-sm font-semibold text-red-600">
                                    대상: {previewCases.length.toLocaleString('ko-KR')}개 조합
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setShowOverwriteModal(false)}
                                className="inline-flex h-10 items-center justify-center rounded-lg border border-stone-300 bg-white px-4 text-sm font-bold text-stone-600 hover:bg-stone-50"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmOverwrite}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 text-sm font-bold text-white hover:bg-red-800"
                            >
                                <RotateCcw size={16} />
                                덮어쓰기 실행
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function getPreviewCaseKey(item: PreviewCase) {
    return `${item.day_pillar}-${item.actor_position}-${item.target_position}-${item.actor_char}-${item.target_char}`;
}

function PreviewRow({
    item,
    generating,
    isGenerating,
    onGenerate,
}: {
    item: PreviewCase;
    generating: boolean;
    isGenerating: boolean;
    onGenerate: (item: PreviewCase) => void;
}) {
    return (
        <tr className="hover:bg-stone-50">
            <td className="px-5 py-4 text-sm font-medium text-stone-800">{item.palace_pair}</td>
            <td className="px-5 py-4 text-sm text-stone-600">{item.actor_char}-{item.target_char}</td>
            <td className="px-5 py-4 text-sm text-stone-600">{item.ten_star_pair || '-'}</td>
            <td className="px-5 py-4">
                <StatusBadge item={item} />
            </td>
            <td className={`max-w-lg px-5 py-4 text-sm leading-6 ${item.error ? 'text-red-600' : 'text-stone-500'}`}>
                {item.error || item.existing?.title || item.title}
            </td>
            <td className="px-5 py-4 text-right">
                <SingleGenerateButton
                    item={item}
                    generating={generating}
                    isGenerating={isGenerating}
                    onGenerate={onGenerate}
                />
            </td>
        </tr>
    );
}

function SingleGenerateButton({
    item,
    generating,
    isGenerating,
    onGenerate,
}: {
    item: PreviewCase;
    generating: boolean;
    isGenerating: boolean;
    onGenerate: (item: PreviewCase) => void;
}) {
    const label = item.existing ? '재등록' : item.error ? '재시도' : '생성';

    return (
        <button
            type="button"
            onClick={() => onGenerate(item)}
            disabled={generating}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 text-xs font-bold text-stone-700 transition-colors hover:bg-stone-50 disabled:cursor-wait disabled:opacity-50"
        >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : item.existing ? <RotateCcw size={14} /> : <Wand2 size={14} />}
            {isGenerating ? '진행 중' : label}
        </button>
    );
}

function StatusBadge({ item }: { item: PreviewCase }) {
    if (item.error) {
        return (
            <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                실패
            </span>
        );
    }

    if (item.existing) {
        return (
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                등록됨
            </span>
        );
    }

    return (
        <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
            미등록
        </span>
    );
}
