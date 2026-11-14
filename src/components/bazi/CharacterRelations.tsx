'use client';

import { useState } from 'react';
import type { BaziCharacter, BaziCharacterDisplayItem, BaziCharacterGraph, BaziRelation } from './types';
import { Card, CardTitle } from './SajuChart';
import { relationName } from './relation-labels';

const positions: Record<string, string> = { year: '년', month: '월', day: '일', hour: '시', cycle: '운' };
const kindNames = { stem: '천간', branch: '지지' };
const elementBadgeColors: Record<string, string> = {
    목: 'bg-[#417e50] text-white',
    화: 'bg-[#db3c39] text-white',
    토: 'bg-[#c58e49] text-white',
    금: 'bg-[#707271] text-white',
    수: 'bg-[#437b99] text-white',
};

export function characterLabel(graph: BaziCharacterGraph, id: string) {
    const character = graph.characters[id];
    if (!character) return id;
    const context = graph.contexts[character.context_id];
    const scope = context?.scope === 'natal' ? '원국' : context?.label || character.context_id;
    return `${scope} ${positions[character.position] || character.position}${kindNames[character.kind]} ${character.char}`;
}

function shortCharacterName(graph: BaziCharacterGraph, id: string) {
    const character = graph.characters[id];
    if (!character) return id;
    if (character.display?.title) return character.display.title;
    return characterLabel(graph, id);
}

function relationStatus(relation: BaziRelation) {
    if (relation.activation_status === 'candidate_only') return '관계 후보';
    if (relation.activation_status === 'detected') return '관계 탐지';
    if (relation.activation_status === 'active') return '원국 관계 활성';
    if (relation.activation_status === 'suppressed') return '원국 관계 억제';
    if (relation.activation_status === 'conditional') return '원국 조건부';
    if (relation.activation_status === 'potential') return '원국 잠재 관계';
    return relation.presentation?.status_label || '상태 확인 필요';
}

function relationStatusColor(status: string) {
    if (status === 'active' || status === 'detected') return 'bg-[#417e50]/15 text-[#2d5c38] border-[#417e50]/30';
    if (status === 'candidate_only' || status === 'potential' || status === 'conditional') return 'bg-[#c58e49]/15 text-[#885a21] border-[#c58e49]/30';
    if (status === 'suppressed') return 'bg-[#9a4b34]/15 text-[#9a4b34] border-[#9a4b34]/30';
    return 'bg-[#f0e4d6] text-[#514030] border-[#e2d2c0]';
}

function relationTypeSummary(graph: BaziCharacterGraph, ids: string[]) {
    const counts = new Map<string, number>();
    for (const id of ids) {
        const relation = graph.relations[id];
        if (!relation) continue;
        const name = relationName(relation.type);
        counts.set(name, (counts.get(name) || 0) + 1);
    }
    const entries = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko'));
    return entries.slice(0, 4).map(([name, count]) => `${name} ${count}`).join(' · ')
        + (entries.length > 4 ? ` · 외 ${entries.length - 4}종` : '');
}

function cycleScopeLabel(graph: BaziCharacterGraph, relation: BaziRelation) {
    const scopes = new Set(relation.context_ids.map(id => graph.contexts[id]?.scope).filter(Boolean));
    return (['natal', 'daewoon', 'sewoon'] as const)
        .filter(scope => scopes.has(scope))
        .map(scope => ({ natal: '원국', daewoon: '대운', sewoon: '세운' })[scope])
        .join(' ↔ ') || '소속 미제공';
}

export function RelationList({
    graph,
    ids,
    compact = false,
}: {
    graph: BaziCharacterGraph;
    ids: string[];
    compact?: boolean;
}) {
    if (!ids.length) return <p className="text-sm text-[#78695c]">제공된 관계 참조가 없습니다.</p>;
    return <ul className="divide-y divide-[#eadfd4]">
        {ids.map(id => {
            const relation = graph.relations[id];
            if (!relation) return <li key={id} className="py-2 text-sm text-[#9a462d]">관계 참조를 찾을 수 없습니다: {id}</li>;
            const presentation = relation.presentation;
            const hasExtra = !compact && (
                !!(relation.direction?.from_character && relation.direction?.to_character)
                || !!relation.candidate_element
                || !!relation.formation_candidates?.length
                || !!presentation?.reasons?.length
            );
            return <li key={id} className="py-2.5 text-sm leading-6 text-[#514030]">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <strong>{relationName(relation.type)}</strong>
                    <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${relationStatusColor(relation.activation_status)}`}>
                        {relationStatus(relation)}
                    </span>
                    {presentation?.status_label && (
                        <span className="rounded bg-[#efe5d8] px-1.5 py-0.5 text-xs font-medium text-[#6e5a47]">
                            {presentation.status_label}
                        </span>
                    )}
                    <span className="min-w-0 break-keep text-[#685748]">
                        {relation.participants.map(participant => characterLabel(graph, participant)).join(' · ')}
                    </span>
                </div>
                {presentation?.description && (
                    <p className="mt-1 break-keep text-xs leading-5 text-[#5f4e3e] sm:text-[13px]">{presentation.description}</p>
                )}
                {compact && (
                    <div className="mt-1 space-y-0.5 text-xs leading-5 text-[#78695c] sm:text-[13px]">
                        {relation.direction?.from_character && relation.direction?.to_character && (
                            <p>방향: {characterLabel(graph, relation.direction.from_character)} → {characterLabel(graph, relation.direction.to_character)}</p>
                        )}
                        {relation.candidate_element && <p>후보 오행: {relation.candidate_element}</p>}
                        {!!relation.formation_candidates?.length && (
                            <p>후보 조합: {relation.formation_candidates.map(group => group.map(participant => characterLabel(graph, participant)).join(' · ')).join(' / ')}</p>
                        )}
                    </div>
                )}
                {hasExtra && <details className="mt-1 pl-1 text-xs text-[#78695c]">
                    <summary className="w-fit cursor-pointer font-medium text-[#7c5b3b]">근거 세부 보기</summary>
                    <div className="mt-1 space-y-1 pl-2">
                        {relation.direction?.from_character && relation.direction?.to_character &&
                            <p>방향: {characterLabel(graph, relation.direction.from_character)} → {characterLabel(graph, relation.direction.to_character)}</p>}
                        {relation.candidate_element && <p>후보 오행: {relation.candidate_element}</p>}
                        {!!relation.formation_candidates?.length && <p>후보 조합: {relation.formation_candidates.map(group => group.map(participant => characterLabel(graph, participant)).join(' · ')).join(' / ')}</p>}
                        {presentation?.reasons?.map((reason, idx) => (
                            <p key={reason.code || idx} className="text-[#685748]">• {reason.text}</p>
                        ))}
                    </div>
                </details>}
            </li>;
        })}
    </ul>;
}

function CharacterDisplayCard({
    graph,
    character,
    onSelectCharacter,
}: {
    graph: BaziCharacterGraph;
    character: BaziCharacter;
    onSelectCharacter?: (id: string) => void;
}) {
    const display = character.display;
    if (!display) return null;

    const sections = display.sections || [];
    const relationGroups = display.relation_groups || [];

    const renderLinkedItem = (item: BaziCharacterDisplayItem, idx: number) => {
        const linkedRelations = (item.relation_ids || [])
            .map(id => graph.relations[id])
            .filter((rel): rel is BaziRelation => Boolean(rel));
        const jumpTargets = (item.character_ids || []).filter(targetId => Boolean(graph.characters[targetId]));

        return (
            <div key={`${item.text}-${idx}`} className="rounded-lg border border-[#eadccf] bg-white/90 px-3 py-2 text-xs leading-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-[#35281e]">{item.text}</span>
                    {onSelectCharacter && jumpTargets.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                            {jumpTargets.map(targetId => {
                                const target = graph.characters[targetId];
                                if (!target || target.context_id !== 'natal.chart') return null;
                                return (
                                    <button
                                        key={targetId}
                                        type="button"
                                        onClick={() => onSelectCharacter(targetId)}
                                        className="rounded border border-[#d9c3ac] bg-[#faf3eb] px-1.5 py-0.5 text-[11px] font-medium text-[#7b522a] transition hover:bg-[#efe1d1]"
                                    >
                                        {positions[target.position] || target.position}{target.kind === 'stem' ? '간' : '지'} {target.char} 이동
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
                {!!item.detail_lines?.length && (
                    <div className="mt-1 space-y-0.5 text-[11px] text-[#756557]">
                        {item.detail_lines.map((line, lineIdx) => (
                            <p key={lineIdx}>{line}</p>
                        ))}
                    </div>
                )}
                {linkedRelations.some(rel => rel.presentation?.description) && (
                    <div className="mt-1 space-y-0.5 border-t border-[#f2e8de] pt-1 text-[11px] text-[#665648]">
                        {linkedRelations.map(rel => rel.presentation?.description && (
                            <p key={rel.relation_id}>{rel.presentation.description}</p>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="mt-3 space-y-3">
            {sections.length > 0 && (
                <div className={`grid gap-2.5 ${sections.length > 1 ? 'md:grid-cols-2' : ''}`}>
                    {sections.map(section => (
                        <div key={section.key} className="rounded-lg border border-[#e6d6c6] bg-[#fffcf8] p-3">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="inline-flex items-center rounded bg-[#ede0d1] px-2 py-0.5 text-xs font-bold text-[#69492a]">
                                    {section.title}
                                </span>
                                {section.key === 'storehouse' && (
                                    <span className="text-[11px] font-semibold text-[#9a6738]">묘고(墓庫)</span>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                {section.items.map((item, idx) => renderLinkedItem(item, idx))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {relationGroups.length > 0 ? (
                <div className="space-y-2.5">
                    {relationGroups.map(group => (
                        <div key={group.key} className="rounded-lg border border-[#e6d6c6] bg-[#fffcf8] p-3">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs font-bold text-[#69492a]">
                                    {group.title} 관계 요약 ({group.items.length}건)
                                </span>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {group.items.map((item, idx) => renderLinkedItem(item, idx))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="rounded-lg border border-[#e6d6c6] bg-[#fffcf8] px-3 py-2.5 text-xs text-[#78695c]">
                    이 글자에 직접 연결된 요약 관계 항목이 없습니다.
                </p>
            )}
        </div>
    );
}

const natalPillarOrder = ['hour', 'day', 'month', 'year'] as const;

export function NatalCharacterDetails({ graph, error }: { graph: BaziCharacterGraph | null; error: string }) {
    const [selectedId, setSelectedId] = useState('natal.chart.day.stem');
    const rawEntries = Object.entries(graph?.characters || {}).filter(([, item]) => item.context_id === 'natal.chart');

    // Sort in traditional Saju chart visual order (or keep all entries if custom ids)
    const entries = [...rawEntries].sort(([idA, a], [idB, b]) => {
        const posA = natalPillarOrder.indexOf(a.position as typeof natalPillarOrder[number]);
        const posB = natalPillarOrder.indexOf(b.position as typeof natalPillarOrder[number]);
        if (posA !== posB && posA !== -1 && posB !== -1) return posA - posB;
        if (a.kind !== b.kind) return a.kind === 'stem' ? -1 : 1;
        return idA.localeCompare(idB);
    });

    const selected = graph?.characters[selectedId] || entries[0]?.[1];
    const activeId = graph?.characters[selectedId] ? selectedId : (entries[0]?.[0] || selectedId);
    const allRelationIds = Object.keys(graph?.relations || {});

    return <Card className="xl:col-span-2">
        <CardTitle title="원국 글자별 상세와 관계" body="각 글자의 오행·십성 속성, 지장간 투간·묘고·통근 요약(display)과 중앙 관계 참조를 보여줍니다." />
        {!graph && !error && <p className="mt-4 text-sm text-[#78695c]">글자별 상세를 조회하는 중입니다.</p>}
        {error && <p role="alert" className="mt-4 whitespace-pre-line rounded bg-[#fff2ec] p-3 text-sm text-[#9a462d]">{error}</p>}
        {graph && <>
            <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
                {entries.map(([id, item]) => {
                    const isSelected = id === activeId;
                    const element = item.attributes?.element;
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setSelectedId(id)}
                            aria-pressed={isSelected}
                            aria-label={characterLabel(graph, id)}
                            className={`flex flex-col items-center justify-between rounded-xl border p-2.5 text-center transition ${
                                isSelected
                                    ? 'border-[#a97945] bg-[#ae7a43] text-white shadow-sm'
                                    : 'border-[#e5d5c3] bg-[#fffaf4] text-[#35281e] hover:border-[#cfa87d] hover:bg-[#fff5e8]'
                            }`}
                        >
                            <span className={`text-[11px] font-semibold ${isSelected ? 'text-white/90' : 'text-[#7e6d5e]'}`}>
                                {positions[item.position] || item.position}{item.kind === 'stem' ? '간' : '지'}
                            </span>
                            <div className="my-1 flex items-center gap-1">
                                {element && (
                                    <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                                        isSelected ? 'bg-white/25 text-white' : (elementBadgeColors[element] || 'bg-neutral-600 text-white')
                                    }`}>
                                        {element}
                                    </span>
                                )}
                                <span className="font-serif text-2xl font-bold leading-none">{item.char}</span>
                            </div>
                            <span className={`text-[11px] font-medium ${isSelected ? 'text-white/90' : 'text-[#9a6738]'}`}>
                                {item.attributes?.ten_god || (item.kind === 'stem' ? '천간' : '지지')}
                            </span>
                        </button>
                    );
                })}
            </div>
            {selected && <div className="mt-4 rounded-xl border border-[#e5d5c3] bg-[#fbf7f1] p-4 text-sm leading-6 text-[#514030]">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[#eadccf] pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-serif text-lg font-bold text-[#2a2018]">
                            {selected.display?.title ? `${selected.display.title} (${characterLabel(graph, activeId)})` : characterLabel(graph, activeId)}
                        </h4>
                        {selected.pillar_attributes?.unseong && (
                            <span className="rounded border border-[#d6beaa] bg-white px-2 py-0.5 text-xs font-semibold text-[#735339]">
                                12운성: {selected.pillar_attributes.unseong}
                                {selected.pillar_attributes.unseong_self ? ` (자좌 ${selected.pillar_attributes.unseong_self})` : ''}
                            </span>
                        )}
                    </div>
                    <span className="font-medium text-[#685748]">
                        {selected.display?.subtitle || [selected.attributes.element, selected.attributes.yin_yang, selected.attributes.ten_god].filter(Boolean).join(' · ') || '속성 미제공'}
                    </span>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
                    <p className="text-[#685748]">
                        관계 <strong>{selected.relation_ids.length}건</strong>
                        {selected.relation_ids.length > 0 && ` · ${relationTypeSummary(graph, selected.relation_ids)}`}
                    </p>
                    {selected.rooting && (
                        <p className="text-[#685748]">
                            동주 통근 <strong>{selected.rooting.current_status}</strong> · 관계에 따른 통근 영향{' '}
                            {selected.rooting.root_impact_status === 'not_evaluated' && selected.rooting.root_impact_score === null
                                ? '미평가'
                                : selected.rooting.root_impact_status}
                        </p>
                    )}
                </div>

                {/* Render structured display sections & relation_groups when provided by API */}
                <CharacterDisplayCard graph={graph} character={selected} onSelectCharacter={setSelectedId} />

                <div className="mt-3 grid gap-2 md:grid-cols-2">
                    <details className="rounded-lg border border-[#e8d9c9] bg-white/80 p-3">
                        <summary className="cursor-pointer font-semibold text-[#514030]">기둥·통근 정보</summary>
                        <div className="mt-2 space-y-1 text-xs leading-5 text-[#685748] sm:text-sm sm:leading-6">
                            {selected.pillar_attributes.unseong && <p>기둥 운성: {selected.pillar_attributes.unseong}</p>}
                            {selected.pillar_attributes.unseong_self && <p>자좌 운성: {selected.pillar_attributes.unseong_self}</p>}
                            {!!selected.pillar_attributes.jijanggan?.length && (
                                <p>
                                    기둥 지장간:{' '}
                                    {selected.pillar_attributes.jijanggan
                                        .map(item => `${item.ch}${item.ten_god ? `(${item.ten_god})` : ''}${item.ratio ? ` ${item.ratio}` : ''}`)
                                        .join(' · ')}
                                </p>
                            )}
                            {!!selected.pillar_attributes.special_stars?.length && (
                                <p>기둥 신살: {selected.pillar_attributes.special_stars.join(' · ')}</p>
                            )}
                            {selected.rooting && <>
                                <p>동주 통근 원점수: {selected.rooting.root_score}</p>
                                <p>동주 뿌리: {selected.rooting.root_branch_ids.map(id => characterLabel(graph, id)).join(' · ') || '없음'}</p>
                                <p>타주 지원: {selected.rooting.external_support_score} · {selected.rooting.external_support_branch_ids.map(id => characterLabel(graph, id)).join(' · ') || '없음'}</p>
                                <p>관계에 따른 통근 영향: {selected.rooting.root_impact_status === 'not_evaluated' && selected.rooting.root_impact_score === null ? '미평가' : selected.rooting.root_impact_status}</p>
                                <p className="text-xs text-[#857567]">잠정 동주 판정입니다. 호환용 remaining_score는 검증된 잔존 점수가 아닙니다.</p>
                            </>}
                        </div>
                    </details>
                    <details className="rounded-lg border border-[#e8d9c9] bg-white/80 p-3">
                        <summary className="cursor-pointer font-semibold text-[#514030]">이 글자의 관계 {selected.relation_ids.length}건 보기</summary>
                        <div className="mt-2"><RelationList graph={graph} ids={selected.relation_ids} /></div>
                    </details>
                </div>
            </div>}
            <details className="mt-4 rounded-lg border border-[#e5d5c3] bg-[#fbf7f1] p-4">
                <summary className="cursor-pointer font-semibold text-[#514030]">원국 전체 관계 {allRelationIds.length}건 보기</summary>
                <p className="mt-2 text-xs text-[#78695c]">중앙 관계 사전의 항목을 한 번씩 표시합니다. 건수는 관계의 강도나 효과를 뜻하지 않습니다.</p>
                <div className="mt-3"><RelationList graph={graph} ids={allRelationIds} /></div>
            </details>
        </>}
    </Card>;
}

export function CycleRelations({ graph, error, loading }: { graph: BaziCharacterGraph | null; error: string; loading: boolean }) {
    if (loading) return <p className="mt-4 text-sm text-[#78695c]">선택한 운의 관계를 조회하는 중입니다.</p>;
    if (error) return <p role="alert" className="mt-4 whitespace-pre-line rounded bg-[#fff2ec] p-3 text-sm text-[#9a462d]">{error}</p>;
    if (!graph?.selection) return null;

    const cycleIds = Object.keys(graph.relations).filter(id =>
        graph.relations[id].context_ids.some(contextId => graph.contexts[contextId]?.scope !== 'natal')
    );
    const groups = new Map<string, string[]>();
    for (const id of cycleIds) {
        const label = cycleScopeLabel(graph, graph.relations[id]);
        groups.set(label, [...(groups.get(label) || []), id]);
    }

    // Cycle characters (daewoon / sewoon stems & branches) that include display summaries
    const cycleCharacters = Object.entries(graph.characters)
        .filter(([, char]) => char.context_id !== 'natal.chart' && Boolean(char.display));

    // Natal characters that have cycle-related relation_groups in display
    const natalCycleHighlights = Object.entries(graph.characters)
        .filter(([, char]) => char.context_id === 'natal.chart' && (char.display?.relation_groups || []).some(g => g.key !== 'natal.chart'));

    return <div className="mt-6 space-y-4 border-t border-[#e8d9c9] pt-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <h4 className="font-serif text-lg font-bold text-[#33281f] sm:text-xl">선택한 운(運)의 작용 및 관계 분석</h4>
            <p className="text-xs font-medium text-[#78695c] sm:text-sm">
                {graph.selection.mode === 'sewoon' ? `${graph.selection.sewoon_year}년 세운` : `${graph.selection.daewoon_index}번 대운`}
                {' · '}
                {graph.selection.daewoon_status === 'before_first_period' ? '첫 대운 이전 · 대운 없음' : '대응 대운 포함'}
                {graph.selection.mode === 'sewoon' && ' · 달력 연도 기준(입춘 전후 미구분)'}
            </p>
        </div>

        {/* Cycle Character Display Summaries (Daewoon / Sewoon Stem & Branch cards) */}
        {cycleCharacters.length > 0 && (
            <div className="space-y-2.5">
                <h5 className="text-sm font-bold text-[#6e563e] sm:text-base">운(運) 글자별 요약 및 작용</h5>
                <div className="grid gap-3 md:grid-cols-2">
                    {cycleCharacters.map(([id, char]) => {
                        const display = char.display!;
                        const element = char.attributes?.element;
                        return (
                            <div key={id} className="rounded-lg border border-[#e4d3c1] bg-white/90 p-4">
                                <div className="flex items-center justify-between border-b border-[#efe4d8] pb-2.5">
                                    <div className="flex items-center gap-2">
                                        {element && (
                                            <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${elementBadgeColors[element] || 'bg-neutral-600 text-white'}`}>
                                                {element}
                                            </span>
                                        )}
                                        <strong className="font-serif text-base text-[#2a2018] sm:text-lg">
                                            {display.title || shortCharacterName(graph, id)}
                                        </strong>
                                    </div>
                                    {display.subtitle && (
                                        <span className="text-xs font-semibold text-[#8c6b4b] sm:text-sm">{display.subtitle}</span>
                                    )}
                                </div>

                                {!!display.sections?.length && (
                                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                                        {display.sections.map(section =>
                                            section.items.map((item, idx) => (
                                                <span key={`${section.key}-${idx}`} className="rounded-md bg-[#f6ede2] px-2.5 py-1 text-xs font-medium text-[#685442] sm:text-[13px]">
                                                    {section.title}: {item.text}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                )}

                                {!!display.relation_groups?.length ? (
                                    <div className="mt-3 space-y-2">
                                        {display.relation_groups.map(group => (
                                            <div key={group.key} className="rounded-md border border-[#efe4d8] bg-[#fcf9f5] p-2.5">
                                                <p className="text-xs font-bold text-[#7c5b3b] sm:text-[13px]">{group.title}</p>
                                                <ul className="mt-1.5 space-y-1 text-[13px] leading-5 text-[#4b3c2f] sm:text-sm sm:leading-6">
                                                    {group.items.map((item, idx) => (
                                                        <li key={idx} className="flex flex-col">
                                                            <span className="font-medium">• {item.text}</span>
                                                            {item.detail_lines?.map((line, lIdx) => (
                                                                <span key={lIdx} className="pl-3 text-xs leading-5 text-[#78695c] sm:text-[13px]">{line}</span>
                                                            ))}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-2.5 text-xs text-[#8c7d71] sm:text-sm">직접 연결된 관계 항목이 없습니다.</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* Natal Characters affected by selected cycle */}
        {natalCycleHighlights.length > 0 && (
            <div className="rounded-lg border border-[#e4d3c1] bg-white/85 p-4">
                <h5 className="text-sm font-bold text-[#6e563e] sm:text-base">원국 글자 기준 운(運) 반응 요약</h5>
                <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                    {natalCycleHighlights.map(([id, char]) => {
                        const cycleGroups = (char.display?.relation_groups || []).filter(g => g.key !== 'natal.chart');
                        return (
                            <div key={id} className="rounded-md border border-[#ede1d4] bg-[#fcf9f5] p-3">
                                <div className="flex items-center justify-between border-b border-[#efe4d8] pb-1.5 font-bold text-[#35281e]">
                                    <span className="text-sm sm:text-[15px]">{char.display?.title || shortCharacterName(graph, id)}</span>
                                    <span className="text-xs font-semibold text-[#8c6b4b]">{char.attributes?.ten_god}</span>
                                </div>
                                <div className="mt-2 space-y-1.5">
                                    {cycleGroups.map(group => (
                                        <div key={group.key}>
                                            <span className="text-xs font-bold text-[#9a6738]">[{group.title}]</span>
                                            {group.items.map((item, idx) => (
                                                <p key={idx} className="mt-0.5 text-xs leading-5 text-[#514030] sm:text-[13px]">• {item.text}</p>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        <p className="text-xs leading-6 text-[#78695c] sm:text-[13px]">건수는 탐지된 항목 수입니다. 관계 성립·경합·합화·실제 세력 변화·통근 손상과 운 글자 통근은 미평가이며 원국 판정은 유지됩니다.</p>
        {groups.size > 0 ? <div className="space-y-2.5">
            {[...groups].map(([label, ids]) => <details key={label} className="rounded-lg border border-[#e8d9c9] bg-white/85 p-3.5">
                <summary className="cursor-pointer text-sm font-semibold text-[#514030] sm:text-base">{label} · {ids.length}건</summary>
                <p className="mt-1.5 text-xs text-[#78695c] sm:text-[13px]">종류별 건수: {relationTypeSummary(graph, ids)}</p>
                <div className="mt-2"><RelationList graph={graph} ids={ids} compact /></div>
            </details>)}
        </div> : <p className="text-sm text-[#78695c]">이 선택에서 제공된 소속 간 관계가 없습니다.</p>}
    </div>;
}
