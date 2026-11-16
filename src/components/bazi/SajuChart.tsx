'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Sparkles,
    Star,
    Briefcase,
    Zap,
    X,
    BookOpen,
} from 'lucide-react';
import type {
    BaziAuthStatus,
    BaziCharacter,
    BaziCharacterDisplayItem,
    BaziCharacterGraph,
    BaziRelation,
    BaziResult,
    PillarKey,
    JijangganDetail,
} from './types';
import { XuShiContent, BinZhuContent } from './DynamicsDetails';
import { relationName } from './relation-labels';
import { getStoredUserId } from '@/utils/supabase/client';

const pillarMeta: Record<PillarKey, { title: string; ganTenGodKey?: string; jiTenGodKey: string }> = {
    time: { title: '시주(時柱)', ganTenGodKey: 'time_gan', jiTenGodKey: 'time_ji' },
    day: { title: '일주(日柱)', jiTenGodKey: 'day_ji' },
    month: { title: '월주(月柱)', ganTenGodKey: 'month_gan', jiTenGodKey: 'month_ji' },
    year: { title: '년주(年柱)', ganTenGodKey: 'year_gan', jiTenGodKey: 'year_ji' },
};

const pillarOrder: PillarKey[] = ['time', 'day', 'month', 'year'];
const detailKeyByPillar: Record<PillarKey, 'hour' | 'day' | 'month' | 'year'> = {
    time: 'hour',
    day: 'day',
    month: 'month',
    year: 'year',
};

// Default fallback colors if API color is missing
const elementColorClassMap: Record<string, string> = {
    목: 'bg-[#417e50] text-white',
    화: 'bg-[#db3c39] text-white',
    토: 'bg-[#c58e49] text-white',
    금: 'bg-[#707271] text-white',
    수: 'bg-[#437b99] text-white',
};

export function Card({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <section className={`min-w-0 rounded-lg border border-[#eee2d6] bg-white/78 p-5 shadow-[0_12px_32px_rgba(58,42,29,0.06)] backdrop-blur-sm ${className}`}>
            {children}
        </section>
    );
}

export function CardTitle({
    title,
    body,
    icon: Icon,
    badge,
}: {
    title: string;
    body: string;
    icon?: typeof Sparkles;
    badge?: string;
}) {
    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-5 w-5 text-[#ae7442]" />}
                    <h3 className="font-serif text-xl font-bold tracking-normal text-[#2a2018]">{title}</h3>
                </div>
                <p className="mt-1.5 break-keep text-sm leading-6 text-[#73675c]">{body}</p>
            </div>
            {badge && (
                <span className="mt-1 inline-flex shrink-0 items-center rounded-full border border-[#d6ba99] bg-[#fbf5ee] px-3 py-1 text-xs font-semibold text-[#8b5a2b] sm:mt-0">
                    {badge}
                </span>
            )}
        </div>
    );
}

const positionLabelByCode: Record<string, string> = {
    year: '년',
    month: '월',
    day: '일',
    hour: '시',
    cycle: '운',
};

function formatCharNodeLabel(graph: BaziCharacterGraph, id: string) {
    const character = graph.characters[id];
    if (!character) return id;
    if (character.display?.title) return character.display.title;
    const context = graph.contexts[character.context_id];
    const scope = context?.scope === 'natal' ? '원국' : context?.label || character.context_id;
    return `${scope} ${positionLabelByCode[character.position] || character.position}${character.kind === 'stem' ? '천간' : '지지'} ${character.char}`;
}

export function SajuChart({
    result,
    characterGraph = null,
    characterGraphError = '',
}: {
    result: BaziResult;
    characterGraph?: BaziCharacterGraph | null;
    characterGraphError?: string;
}) {
    const [selection, setSelection] = useState<{ result: BaziResult; id: string } | null>(null);
    const selectedCharId = selection?.result === result ? selection.id : null;
    const pillars = result.four_pillars;
    const tenGods = result.ten_gods || {};
    const specialStarsByPillar = result.advanced_analysis?.special_stars_by_pillar || {};
    const details = result.analysis?.details || {};

    const toggleCharacter = (id: string) => {
        setSelection((prev) => (prev?.result === result && prev.id === id ? null : { result, id }));
    };

    const selectCharacter = (id: string | null) => {
        setSelection(id ? { result, id } : null);
    };

    const selectedCharacter: BaziCharacter | undefined =
        selectedCharId && characterGraph ? characterGraph.characters[selectedCharId] : undefined;

    return (
        <Card className="xl:col-span-2">
            <CardTitle
                title="사주 정국 (四柱 正局)"
                body="태어난 순간 부여된 4개의 기둥, 오행의 성질, 12운성 및 지장간 상세 구조입니다."
                icon={Sparkles}
            />

            <div className="mt-5 overflow-hidden rounded-xl border border-[#ecdccd] bg-[#fffaf4] shadow-inner">
                {/* Header Row: Pillar Names & Top Stars */}
                <div className="grid grid-cols-4 border-b border-[#eadfd4] text-center bg-[#faf4ec]">
                    {pillarOrder.map((key) => {
                        const pillar = pillars?.[key] || (key === 'time' ? pillars?.hour : undefined);
                        const stars = specialStarsByPillar[key] || (key === 'time' ? specialStarsByPillar.hour : undefined) || pillar?.special_stars || [];
                        const ganTenGod = pillarMeta[key].ganTenGodKey ? (tenGods[pillarMeta[key].ganTenGodKey] || pillar?.gan?.ten_god) : '일간(본인)';

                        return (
                            <div key={key} className="flex flex-col justify-between border-r border-[#eadfd4] p-3 last:border-r-0 lg:p-4">
                                <div>
                                    <span className="inline-block rounded-md bg-[#eee4d6] px-2.5 py-0.5 text-xs font-bold text-[#56483c] lg:text-sm">
                                        {pillarMeta[key].title}
                                    </span>
                                    <p className="mt-2 text-xs font-semibold text-[#a07141] lg:text-sm">{ganTenGod}</p>
                                </div>
                                {stars.length > 0 && (
                                    <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
                                        {stars.map((star) => (
                                            <span
                                                key={star}
                                                className="rounded bg-[#eed9c4] px-1.5 py-0.5 text-xs font-semibold text-[#7e4f21]"
                                            >
                                                {star}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Main 4-Pillars Grid */}
                <div className="grid grid-cols-4 text-center">
                    {pillarOrder.map((key) => {
                        const posKey = detailKeyByPillar[key];
                        const stemId = `natal.chart.${posKey}.stem`;
                        const branchId = `natal.chart.${posKey}.branch`;
                        const isStemSelected = selectedCharId === stemId;
                        const isBranchSelected = selectedCharId === branchId;

                        const pillar = pillars?.[key] || (key === 'time' ? pillars?.hour : undefined);
                        const detail = details[posKey];
                        const gan = pillar?.gan;
                        const ji = pillar?.ji;
                        const unseong = pillar?.unseong || detail?.stem?.unseong;
                        const unseongSelf = pillar?.unseong_self;

                        // Jijanggan list: prefer rich objects from pillar, fall back to string list from details
                        const jijangganList: JijangganDetail[] = pillar?.jijanggan || (
                            detail?.branch?.jijanggan?.map((ch) => ({ ch })) || []
                        );

                        return (
                            <article key={key} className="flex min-w-0 flex-col border-r border-[#eadfd4] last:border-r-0">
                                {/* Heavenly Stem (천간) */}
                                <button
                                    type="button"
                                    onClick={() => toggleCharacter(stemId)}
                                    aria-pressed={isStemSelected}
                                    aria-label={`${pillarMeta[key].title} 천간 ${gan?.ch || ''} 상세 보기`}
                                    className={`group relative w-full border-b border-[#eadfd4] p-3 text-center transition lg:p-5 ${
                                        isStemSelected
                                            ? 'bg-[#fbf0e1] ring-2 ring-inset ring-[#b57d43]'
                                            : 'bg-white/70 hover:bg-[#fdf5ea]'
                                    }`}
                                >
                                    <div className="mx-auto flex w-fit items-center gap-1.5">
                                        {gan?.element && (
                                            <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${elementColorClassMap[gan.element] || 'bg-neutral-600 text-white'}`}>
                                                {gan.element}
                                            </span>
                                        )}
                                        {gan?.yin_yang && (
                                            <span className="text-xs font-medium text-[#88786a]">{gan.yin_yang}</span>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <p className="font-serif text-3xl font-bold leading-none text-[#15110d] transition group-hover:text-[#7c4f20] lg:text-[3.25rem]">
                                            {gan?.ch || '-'}
                                        </p>
                                        {gan?.kr && (
                                            <p className="mt-1 text-xs font-semibold text-[#837264] lg:text-sm">({gan.kr})</p>
                                        )}
                                    </div>
                                </button>

                                {/* Earthly Branch (지지) */}
                                <button
                                    type="button"
                                    onClick={() => toggleCharacter(branchId)}
                                    aria-pressed={isBranchSelected}
                                    aria-label={`${pillarMeta[key].title} 지지 ${ji?.ch || ''} 상세 보기`}
                                    className={`group relative w-full border-b border-[#eadfd4] p-3 text-center transition lg:p-5 ${
                                        isBranchSelected
                                            ? 'bg-[#fbf0e1] ring-2 ring-inset ring-[#b57d43]'
                                            : 'bg-white/70 hover:bg-[#fdf5ea]'
                                    }`}
                                >
                                    <div className="mx-auto flex w-fit items-center gap-1.5">
                                        {ji?.element && (
                                            <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${elementColorClassMap[ji.element] || 'bg-neutral-600 text-white'}`}>
                                                {ji.element}
                                            </span>
                                        )}
                                        {ji?.yin_yang && (
                                            <span className="text-xs font-medium text-[#88786a]">{ji.yin_yang}</span>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <p className="font-serif text-3xl font-bold leading-none text-[#15110d] transition group-hover:text-[#7c4f20] lg:text-[3.25rem]">
                                            {ji?.ch || '-'}
                                        </p>
                                        {ji?.kr && (
                                            <p className="mt-1 text-xs font-semibold text-[#837264] lg:text-sm">({ji.kr})</p>
                                        )}
                                    </div>
                                </button>

                                {/* Ten God (지지 십성) & 12 Unseong */}
                                <div className="border-b border-[#eadfd4] bg-[#fbf7f1] px-2 py-2.5">
                                    <p className="text-xs font-bold text-[#8a6245] lg:text-sm">
                                        {tenGods[pillarMeta[key].jiTenGodKey] || ji?.ten_god || '-'}
                                    </p>
                                    {(unseong || unseongSelf) && (
                                        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1">
                                            {unseong && (
                                                <span className="inline-block rounded border border-[#d6beaa] bg-[#fffcf8] px-2 py-0.5 text-xs font-semibold text-[#735339]">
                                                    {unseong}
                                                </span>
                                            )}
                                            {unseongSelf && (
                                                <span className="inline-block rounded border border-[#e5d6c5] bg-[#f8f1e7] px-1.5 py-0.5 text-[11px] font-medium text-[#876b52]" title="자좌 12운성">
                                                    자좌 {unseongSelf}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Jijanggan Details */}
                                <div className="flex-1 bg-white/50 p-1.5 sm:p-2.5 lg:p-3">
                                    <p className="mb-1.5 text-xs font-semibold text-[#968677]">
                                        지장간<span className="hidden sm:inline"> (地藏干)</span>
                                    </p>
                                    {jijangganList.length > 0 ? (
                                        <div className="space-y-1 sm:space-y-1.5">
                                            {jijangganList.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between rounded border border-[#efe6dc] bg-[#fffdfa] px-1.5 py-0.5 text-xs sm:px-2 sm:py-1"
                                                >
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-serif text-xs font-bold text-[#2d2117] sm:text-sm">{item.ch}</span>
                                                        {item.kr && <span className="hidden text-xs text-[#867566] sm:inline">({item.kr})</span>}
                                                        {item.type && (
                                                            <span className="hidden rounded bg-[#f0e7dd] px-1 text-[11px] text-[#715c4a] md:inline">
                                                                {item.type}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[11px] sm:text-xs">
                                                        {item.ten_god && (
                                                            <span className="font-medium text-[#9a6738]">{item.ten_god}</span>
                                                        )}
                                                        {item.ratio && (
                                                            <span className="hidden text-[11px] text-[#a19588] lg:inline">({item.ratio})</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-[#9d8f82]">없음</p>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>

            {/* Subtle Click Hint Bar when collapsed */}
            {!selectedCharId && (
                <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-[#eadccd] bg-[#fbf6ef] px-3.5 py-2 text-xs text-[#6f5f50] sm:text-sm">
                    <span>
                        💡 사주 정국 표의 <strong className="font-semibold text-[#4c3928]">천간·지지 한자</strong>를 클릭하면 해당 글자의 통근·투간·원국 합충 요약을 바로 확인할 수 있습니다.
                    </span>
                </div>
            )}

            {/* Collapsible Character Summary Drawer when a character cell is clicked */}
            {selectedCharId && (
                <div className="mt-3.5 rounded-xl border border-[#dec7ae] bg-[#fbf6ef] p-4 shadow-sm">
                    {characterGraphError ? (
                        <div className="flex items-center justify-between gap-3 text-sm text-[#9a462d]">
                            <p>{characterGraphError}</p>
                            <button
                                type="button"
                                onClick={() => selectCharacter(null)}
                                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#d9c3ac] bg-white px-2.5 py-1 text-xs font-semibold text-[#5c4938] hover:bg-[#f5ebe0]"
                            >
                                닫기 <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ) : !characterGraph || !selectedCharacter ? (
                        <div className="flex items-center justify-between gap-3 text-sm text-[#78695c]">
                            <p>선택한 글자의 상세 요약 정보를 불러오는 중입니다...</p>
                            <button
                                type="button"
                                onClick={() => selectCharacter(null)}
                                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#d9c3ac] bg-white px-2.5 py-1 text-xs font-semibold text-[#5c4938] hover:bg-[#f5ebe0]"
                            >
                                닫기 <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ) : (
                        <SelectedCharacterDrawer
                            graph={characterGraph}
                            characterId={selectedCharId}
                            character={selectedCharacter}
                            onSelectCharacter={selectCharacter}
                            onClose={() => selectCharacter(null)}
                        />
                    )}
                </div>
            )}
        </Card>
    );
}

function SelectedCharacterDrawer({
    graph,
    characterId,
    character,
    onSelectCharacter,
    onClose,
}: {
    graph: BaziCharacterGraph;
    characterId: string;
    character: BaziCharacter;
    onSelectCharacter: (id: string) => void;
    onClose: () => void;
}) {
    const display = character.display;
    const element = character.attributes?.element;
    const sections = display?.sections || [];
    const relationGroups = display?.relation_groups || [];

    const renderSummaryItem = (item: BaziCharacterDisplayItem, idx: number) => {
        const linkedRelations = (item.relation_ids || [])
            .map((id) => graph.relations[id])
            .filter((rel): rel is BaziRelation => Boolean(rel));
        const jumpTargets = (item.character_ids || []).filter(
            (targetId) => targetId !== characterId && Boolean(graph.characters[targetId]),
        );

        return (
            <div key={`${item.text}-${idx}`} className="rounded-lg border border-[#eadccf] bg-white/95 px-3 py-2 text-xs leading-5 sm:text-[13px]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-[#35281e]">{item.text}</span>
                    {jumpTargets.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                            {jumpTargets.map((targetId) => {
                                const target = graph.characters[targetId];
                                if (!target || target.context_id !== 'natal.chart') return null;
                                return (
                                    <button
                                        key={targetId}
                                        type="button"
                                        onClick={() => onSelectCharacter(targetId)}
                                        className="rounded border border-[#d9c3ac] bg-[#faf3eb] px-2 py-0.5 text-[11px] font-semibold text-[#7b522a] transition hover:bg-[#efe1d1]"
                                    >
                                        {positionLabelByCode[target.position] || target.position}{target.kind === 'stem' ? '간' : '지'} {target.char} 보기
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
                {!!item.detail_lines?.length && (
                    <div className="mt-1 space-y-0.5 text-xs text-[#756557]">
                        {item.detail_lines.map((line, lineIdx) => (
                            <p key={lineIdx}>{line}</p>
                        ))}
                    </div>
                )}
                {linkedRelations.some((rel) => rel.presentation?.description) && (
                    <div className="mt-1 space-y-0.5 border-t border-[#f2e8de] pt-1 text-xs text-[#665648]">
                        {linkedRelations.map((rel) =>
                            rel.presentation?.description ? (
                                <p key={rel.relation_id}>{rel.presentation.description}</p>
                            ) : null,
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e6d6c5] pb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                    {element && (
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${elementColorClassMap[element] || 'bg-neutral-600 text-white'}`}>
                            {element}
                        </span>
                    )}
                    <h4 className="font-serif text-lg font-bold text-[#2a2018] sm:text-xl">
                        {display?.title || formatCharNodeLabel(graph, characterId)}
                    </h4>
                    <span className="rounded-md bg-[#ede0d1] px-2.5 py-0.5 text-xs font-semibold text-[#69492a] sm:text-sm">
                        {display?.subtitle || [character.attributes?.element, character.attributes?.yin_yang, character.attributes?.ten_god].filter(Boolean).join(' · ')}
                    </span>
                    {character.pillar_attributes?.unseong && (
                        <span className="rounded border border-[#d6beaa] bg-white px-2 py-0.5 text-xs font-semibold text-[#735339]">
                            12운성: {character.pillar_attributes.unseong}
                            {character.pillar_attributes.unseong_self ? ` · 자좌 ${character.pillar_attributes.unseong_self}` : ''}
                        </span>
                    )}
                    {character.rooting && (
                        <span className="rounded border border-[#d6beaa] bg-white px-2 py-0.5 text-xs font-semibold text-[#685748]">
                            동주 통근: {character.rooting.current_status}
                        </span>
                    )}
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center gap-1 rounded-md border border-[#d8c3ad] bg-white px-2.5 py-1 text-xs font-semibold text-[#5c4938] transition hover:bg-[#f3e8dc]"
                >
                    닫기 <X className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Sections (통근 / 묘고 / 지장간 투간 / 기둥 정보) */}
            {sections.length > 0 && (
                <div className={`grid gap-2.5 ${sections.length > 1 ? 'md:grid-cols-2' : ''}`}>
                    {sections.map((section) => (
                        <div key={section.key} className="rounded-lg border border-[#e6d6c6] bg-[#fffcf8] p-3">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="inline-flex items-center rounded bg-[#ede0d1] px-2 py-0.5 text-xs font-bold text-[#69492a]">
                                    {section.title}
                                </span>
                                {section.key === 'storehouse' && (
                                    <span className="text-xs font-semibold text-[#9a6738]">묘고(墓庫)</span>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                {section.items.map((item, idx) => renderSummaryItem(item, idx))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Relation Groups (원국 합·충·형·파·해·투간 요약) */}
            {relationGroups.length > 0 ? (
                <div className="space-y-2.5">
                    {relationGroups.map((group) => (
                        <div key={group.key} className="rounded-lg border border-[#e6d6c6] bg-[#fffcf8] p-3">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs font-bold text-[#69492a] sm:text-sm">
                                    {group.title} 관계 요약 ({group.items.length}건)
                                </span>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {group.items.map((item, idx) => renderSummaryItem(item, idx))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="rounded-lg border border-[#e6d6c6] bg-[#fffcf8] px-3 py-2 text-xs text-[#78695c] sm:text-sm">
                    이 글자에 직접 연결된 원국 관계 요약 항목이 없습니다.
                </p>
            )}

            {/* Optional Fallback / Raw Relation List if display is absent */}
            {!display && character.relation_ids.length > 0 && (
                <div className="rounded-lg border border-[#e6d6c6] bg-[#fffcf8] p-3 text-xs sm:text-sm">
                    <p className="mb-2 font-bold text-[#69492a]">연결된 관계 ({character.relation_ids.length}건)</p>
                    <ul className="divide-y divide-[#eadfd4]">
                        {character.relation_ids.map((relId) => {
                            const rel = graph.relations[relId];
                            if (!rel) return null;
                            return (
                                <li key={relId} className="py-1.5 text-[#514030]">
                                    <strong>{relationName(rel.type)}</strong> ·{' '}
                                    {rel.participants.map((p) => formatCharNodeLabel(graph, p)).join(' · ')}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}

const hanjaToKrMap: Record<string, string> = {
    甲: '갑', 乙: '을', 丙: '병', 丁: '정', 戊: '무',
    己: '기', 庚: '경', 辛: '신', 壬: '임', 癸: '계',
    子: '자', 丑: '축', 寅: '인', 卯: '묘', 辰: '진', 巳: '사',
    午: '오', 未: '미', 申: '신', 酉: '유', 戌: '술', 亥: '해',
};

function toKoreanGanJi(text?: string) {
    if (!text) return '';
    return Array.from(text).map((ch) => hanjaToKrMap[ch] || ch).join('');
}

export function DayMonthInterpretationCard({ result }: { result: BaziResult }) {
    const interpretation = result.day_month_interpretation ?? result.advanced_analysis?.day_month_interpretation;
    if (!interpretation || !interpretation.explanation?.trim()) {
        return null;
    }

    const { day_pillar, month_branch, explanation } = interpretation;
    const dayGanKr = result.four_pillars?.day?.gan?.kr || '';
    const dayJiKr = result.four_pillars?.day?.ji?.kr || '';
    const dayKr = toKoreanGanJi(day_pillar) || (dayGanKr && dayJiKr ? `${dayGanKr}${dayJiKr}` : day_pillar);
    const monthKr = toKoreanGanJi(month_branch) || result.four_pillars?.month?.ji?.kr || month_branch;

    return (
        <Card className="xl:col-span-2 relative overflow-hidden border-[#e6d5c1] bg-[linear-gradient(180deg,rgba(255,252,247,0.95),rgba(250,242,232,0.9))]">
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(205,154,91,0.14),transparent_70%)]" />
            <div className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(181,131,78,0.1),transparent_70%)]" />

            <div className="relative">
                <div className="flex flex-col items-center text-center sm:px-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dfc8ae] bg-[#fffaf3] px-3.5 py-1 text-xs font-medium tracking-wide text-[#8c5d30]">
                        <BookOpen className="h-3.5 w-3.5 text-[#b07b46]" />
                        계절과 마음이 만나는 풍경
                    </span>

                    <h3 className="mt-4 break-keep font-serif text-xl font-normal leading-relaxed text-[#2c2016] sm:text-2xl">
                        당신은{' '}
                        <span className="font-bold text-[#9c632b]">
                            &ldquo;{monthKr}&rdquo;
                        </span>
                        월에 태어난{' '}
                        <span className="font-bold text-[#7d4918]">
                            &ldquo;{dayKr}&rdquo;
                        </span>
                        일주 입니다.
                    </h3>

                    {(day_pillar || month_branch) && (
                        <p className="mt-1.5 font-serif text-xs tracking-widest text-[#94806e] sm:text-sm">
                            {month_branch ? `${month_branch}월(月)` : ''}
                            {month_branch && day_pillar ? ' · ' : ''}
                            {day_pillar ? `${day_pillar}일주(日柱)` : ''}
                        </p>
                    )}

                    <div className="mt-4 flex items-center gap-2 text-[#d4b899]" aria-hidden="true">
                        <span className="h-px w-10 bg-[#dfd0c0]" />
                        <span className="text-xs">✦</span>
                        <span className="h-px w-10 bg-[#dfd0c0]" />
                    </div>
                </div>

                <div className="mt-5 rounded-xl border border-[#ead9c7] bg-[#fffdf9]/90 px-5 py-6 shadow-[inset_0_1px_12px_rgba(122,88,52,0.05)] sm:px-8 sm:py-7">
                    <p className="whitespace-pre-line break-keep font-serif text-[15px] leading-8 tracking-[0.01em] text-[#3d3025] sm:text-base sm:leading-9">
                        {explanation}
                    </p>
                </div>
            </div>
        </Card>
    );
}

export function SpecialStarsCard({ result }: { result: BaziResult }) {
    const specialStars = result.advanced_analysis?.special_stars || [];

    return (
        <Card>
            <CardTitle
                title="타고난 신살 및 길신 (神殺 · 吉神)"
                body="사주 원국에 깃든 고유한 재능, 잠재력 및 보호 작용의 전통적 상징입니다."
                icon={Star}
                badge={`총 ${specialStars.length}개 발견`}
            />

            {specialStars.length === 0 ? (
                <div className="mt-5 rounded-lg border border-[#eee2d6] bg-[#fcf8f3] p-4 text-sm text-[#6f6257]">
                    원국에서 등록 기준에 해당하는 주요 신살·길신이 탐지되지 않았습니다.
                </div>
            ) : (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {specialStars.map((star, index) => {
                        const isLucky = star.type?.includes('길신') || star.name.includes('귀인');
                        const isSpecial = star.type?.includes('특수');
                        const basisText = star.basis?.map(b => b.display_name || `${b.pillar || ''} ${b.char || ''}`.trim()).filter(Boolean).join(' · ');

                        return (
                            <div
                                key={`${star.name}-${index}`}
                                className="flex flex-col justify-between rounded-lg border border-[#eee2d6] bg-[#fcf8f3] p-4 transition hover:border-[#d9be9e] hover:shadow-sm"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                                isLucky
                                                    ? 'bg-[#417e50]/20 text-[#2d5c38]'
                                                    : isSpecial
                                                    ? 'bg-[#c58e49]/20 text-[#885a21]'
                                                    : 'bg-[#9a4b34]/20 text-[#9a4b34]'
                                            }`}>
                                                {isLucky ? '吉' : isSpecial ? '特' : '殺'}
                                            </span>
                                            <h4 className="font-serif text-lg font-bold text-[#2a2018]">{star.name}</h4>
                                        </div>
                                        {star.position && (
                                            <span className="rounded bg-[#eee3d6] px-2 py-0.5 text-xs font-semibold text-[#665445]">
                                                {star.position} ({star.char})
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                                        {star.type && (
                                            <span className="font-semibold text-[#a26e3c]">{star.type}</span>
                                        )}
                                        {basisText && (
                                            <span className="rounded border border-[#e5d6c5] bg-white/80 px-1.5 py-0.5 text-[11px] font-medium text-[#756557]">
                                                산출 기준: {basisText}
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-2 break-keep text-sm leading-6 text-[#5e5043]">
                                        {star.description || '고유한 기운과 특징을 나타냅니다.'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}

export function XuShiDynamicsCard({ result }: { result: BaziResult }) {
    const data = result.advanced_analysis?.xu_shi_dynamics;
    if (!data) return null;
    return <Card>
        <CardTitle title="허실(虛實)과 통근 구조" body="동주 통근의 잠정 판정과 별도로 기록된 지지 관계를 살펴봅니다. 관계의 통근 영향은 미평가입니다." icon={Zap} />
        <XuShiContent data={data} />
    </Card>;
}

export function BinZhuDynamicsCard({ result }: { result: BaziResult }) {
    const data = result.advanced_analysis?.bin_zhu_dynamics;
    if (!data) return null;
    return <Card>
        <CardTitle title="빈주(賓主) 관계 구조" body="사회적 환경(빈)과 개인 영역(주)의 관계 유형과 공동 참여 구조를 살펴봅니다." icon={Briefcase} />
        <BinZhuContent data={data} />
    </Card>;
}

export function BaziInterpretationCard({
    result,
    authStatus,
    subjectName,
    birthParams,
}: {
    result: BaziResult;
    authStatus: BaziAuthStatus;
    subjectName?: string;
    birthParams?: {
        year: string;
        month: string;
        day: string;
        hour: string;
        min: string;
        sl: string;
        gen: string;
    };
}) {
    const router = useRouter();
    const [requestStatus, setRequestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [requestMessage, setRequestMessage] = useState('');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
    const isServiceReady = true;

    useEffect(() => {
        if (authStatus === 'checking') return;

        let isMounted = true;

        if (authStatus === 'member') {
            try {
                const todayStr = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
                const userId = getStoredUserId();
                if (userId) {
                    const storedDate = localStorage.getItem(`bazi_submitted_date_${userId}`);
                    if (storedDate === todayStr) {
                        setHasSubmittedToday(true);
                    }
                }
            } catch (e) {
                console.error('Failed to read Bazi submit date from local storage:', e);
            }
        }

        const checkDailyStatus = async () => {
            try {
                const response = await fetch(
                    authStatus === 'member'
                        ? '/api/bazi/free-consultation/status'
                        : '/api/bazi/guest-consultation/status',
                );
                const data = await response.json();
                if (isMounted) {
                    if (data.isAdmin) {
                        setHasSubmittedToday(false);
                        const userId = getStoredUserId();
                        if (userId) {
                            localStorage.removeItem(`bazi_submitted_date_${userId}`);
                        }
                    } else if (data.hasRequestedToday) {
                        setHasSubmittedToday(true);
                    } else if (data.isGuestDailyLimitReached) {
                        setRequestStatus('error');
                        setRequestMessage('오늘 비회원 무료 체험 신청이 마감되었습니다. 내일 다시 이용해주세요.');
                    } else {
                        setHasSubmittedToday(false);
                    }
                }
            } catch (err) {
                console.error('Failed to check daily free Bazi status:', err);
            }
        };

        checkDailyStatus();

        return () => {
            isMounted = false;
        };
    }, [authStatus]);

    const handleFreeConsultation = async () => {
        if (authStatus === 'checking') return;

        setRequestStatus('loading');
        setRequestMessage('');

        try {
            const response = await fetch(
                authStatus === 'member'
                    ? '/api/bazi/free-consultation'
                    : '/api/bazi/guest-consultation',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ result, subjectName, birthParams }),
                },
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || '무료 해설 신청에 실패했습니다.');
            }

            if (authStatus === 'member') {
                try {
                    const todayStr = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
                    const userId = getStoredUserId();
                    if (userId) {
                        localStorage.setItem(`bazi_submitted_date_${userId}`, todayStr);
                    }
                } catch (e) {
                    console.error('Failed to set local storage submission block lock:', e);
                }
            }

            setHasSubmittedToday(true);
            setIsConfirmOpen(false);
            setRequestStatus('success');
            router.push(authStatus === 'member' ? '/bazi/complete' : '/bazi/complete?guest=1');
        } catch (error) {
            setRequestStatus('error');
            setRequestMessage(error instanceof Error ? error.message : '무료 해설 신청에 실패했습니다.');
        }
    };

    return (
        <Card className="xl:col-span-2">
            <div className="flex gap-3">
                <Sparkles className="mt-1 h-6 w-6 shrink-0 text-[#b98451]" strokeWidth={1.4} />
                <div className="min-w-0 flex-1">
                    <CardTitle
                        title="무료 사주 원국 해설 신청"
                        body="고도화된 도원 명리학 엔진의 분석 데이터를 바탕으로 AI가 원국의 구조와 흐름을 정밀하게 해설해 드립니다."
                    />
                </div>
            </div>

            <div className="mt-4 rounded-xl border border-[#ecdccd] bg-[#fbf5ef] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <p className="break-keep text-sm leading-6 text-[#7a6a5c]">
                            사주 정국, 12운성, 지장간 세력, 오행 스코어, 신살, 허실 동태, 빈주 흐름을 총망라하여 나만을 위한 맞춤형 AI 리포트를 생성합니다.
                        </p>
                    </div>

                    {!isServiceReady ? (
                        <button
                            type="button"
                            disabled
                            className="inline-flex h-11 shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-md bg-[#b8aa9c] px-5 text-sm font-semibold text-white opacity-75"
                        >
                            <Sparkles className="h-4 w-4" />
                            무료상담신청
                        </button>
                    ) : authStatus === 'checking' ? (
                        <button
                            type="button"
                            disabled
                            className="inline-flex h-11 shrink-0 cursor-wait items-center justify-center gap-2 rounded-md bg-[#b8aa9c] px-5 text-sm font-semibold text-white opacity-75"
                        >
                            <Sparkles className="h-4 w-4" />
                            회원 확인 중
                        </button>
                    ) : (
                        hasSubmittedToday ? (
                            <button
                                type="button"
                                disabled
                                className="inline-flex h-11 shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-md bg-[#dcd2c4] px-5 text-sm font-semibold text-[#807060]"
                            >
                                <Sparkles className="h-4 w-4" />
                                오늘 신청 완료
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsConfirmOpen(true)}
                                disabled={requestStatus === 'loading'}
                                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-[#2d241c] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#46382c] disabled:cursor-wait disabled:bg-[#76695d]"
                            >
                                <Sparkles className="h-4 w-4" />
                                {requestStatus === 'loading' ? '신청 중' : '무료상담신청'}
                            </button>
                        )
                    )}
                </div>

                {requestMessage && (
                    <p className={`mt-3 rounded-md px-3 py-2 text-sm leading-6 ${requestStatus === 'success'
                        ? 'bg-[#eef8ef] text-[#357247]'
                        : 'bg-[#fff2ec] text-[#a05738]'
                        }`}>
                        {requestMessage}
                    </p>
                )}

                {isServiceReady && authStatus === 'guest' && (
                    <div className="mt-4 border-t border-[#ead9c8] pt-4">
                        <p className="break-keep text-sm leading-6 text-[#5d4c3d]">
                            비회원도 이 브라우저에서 매일 1회 무료 해설을 신청하고 다시 확인할 수 있습니다. 중요한 해설은{' '}
                            <Link href="/signup" className="font-semibold text-[#8d5e2f] underline underline-offset-4 hover:text-[#5d3f23]">
                                회원가입 후 보관함에 저장
                            </Link>
                            해주세요.
                        </p>
                    </div>
                )}

                {isServiceReady && authStatus !== 'checking' && hasSubmittedToday && (
                    <div className="mt-4 border-t border-[#ead9c8] pt-4">
                        <p className="break-keep text-sm leading-6 text-[#865d30]">
                            오늘 이미 무료 사주 원국 해설을 신청하셨습니다. 무료상담 서비스는 하루 1회 신청 가능합니다.{' '}
                            <Link href={authStatus === 'member' ? '/my/bazi-consultations' : '/bazi/guest-consultations'} className="font-semibold text-[#a06828] underline underline-offset-4 hover:text-[#5d3f23]">
                                {authStatus === 'member' ? '마이페이지 사주 보관함' : '비회원 해설 보관함'}
                            </Link>
                            에서 결과(약 5분 소요)를 확인해 보세요!
                        </p>
                    </div>
                )}
            </div>

            {isConfirmOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4" role="dialog" aria-modal="true" aria-labelledby="free-consultation-title">
                    <div className="w-full max-w-md rounded-lg border border-[#eadfd4] bg-[#fffdf9] p-5 shadow-[0_24px_70px_rgba(24,17,11,0.28)]">
                        <h4 id="free-consultation-title" className="font-serif text-xl font-bold tracking-normal text-[#2a2018]">무료상담 신청 안내</h4>
                        <p className="mt-3 break-keep text-sm leading-7 text-[#66584c]">
                            현재 조회한 만세력 결과를 도원만의 사주 분석 기준으로 살피고, AI가 정리한 원국 해설을 신청합니다. 생성에는 보통 5~10분 정도 소요됩니다. 무료상담은 하루 1회 신청 가능하고, 상담 결과는 {authStatus === 'member' ? '마이페이지' : '이 브라우저의 비회원 해설 보관함'}에서 확인 가능합니다.
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsConfirmOpen(false)}
                                disabled={requestStatus === 'loading'}
                                className="inline-flex h-10 items-center justify-center rounded-md border border-[#d8c4ad] bg-white px-4 text-sm font-semibold text-[#5d4c3d] transition-colors hover:bg-[#fbf5ef] disabled:cursor-wait disabled:opacity-60"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={handleFreeConsultation}
                                disabled={requestStatus === 'loading'}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#2d241c] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#46382c] disabled:cursor-wait disabled:bg-[#76695d]"
                            >
                                <Sparkles className="h-4 w-4" />
                                {requestStatus === 'loading' ? '신청 중' : '신청하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
