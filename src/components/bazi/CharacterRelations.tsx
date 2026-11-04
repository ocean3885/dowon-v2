'use client';

import { useState } from 'react';
import type { BaziCharacterGraph, BaziRelation } from './types';
import { Card, CardTitle } from './SajuChart';
import { relationName } from './relation-labels';

const positions: Record<string, string> = { year: '년', month: '월', day: '일', hour: '시', cycle: '운' };
const kindNames = { stem: '천간', branch: '지지' };
export function characterLabel(graph: BaziCharacterGraph, id: string) {
    const character = graph.characters[id];
    if (!character) return id;
    const context = graph.contexts[character.context_id];
    const scope = context?.scope === 'natal' ? '원국' : context?.label || character.context_id;
    return `${scope} ${positions[character.position] || character.position}${kindNames[character.kind]} ${character.char}`;
}

function relationStatus(relation: BaziRelation) {
    if (relation.activation_status === 'candidate_only') return '관계 후보';
    if (relation.activation_status === 'detected') return '관계 탐지';
    if (relation.activation_status === 'active') return '원국 관계 활성';
    if (relation.activation_status === 'suppressed') return '원국 관계 억제';
    if (relation.activation_status === 'conditional') return '원국 조건부';
    if (relation.activation_status === 'potential') return '원국 잠재 관계';
    return '상태 확인 필요';
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

export function RelationList({ graph, ids }: { graph: BaziCharacterGraph; ids: string[] }) {
    if (!ids.length) return <p className="text-sm text-[#78695c]">제공된 관계 참조가 없습니다.</p>;
    return <ul className="divide-y divide-[#eadfd4]">
        {ids.map(id => {
            const relation = graph.relations[id];
            if (!relation) return <li key={id} className="text-sm text-[#9a462d]">관계 참조를 찾을 수 없습니다: {id}</li>;
            const hasExtra = !!(relation.direction?.from_character && relation.direction?.to_character)
                || !!relation.candidate_element || !!relation.formation_candidates?.length;
            return <li key={id} className="py-2.5 text-sm leading-6 text-[#514030]">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <strong>{relationName(relation.type)}</strong>
                    <span className="rounded bg-[#f0e4d6] px-2 text-xs font-semibold">{relationStatus(relation)}</span>
                    <span className="min-w-0 break-keep text-[#685748]">{relation.participants.map(participant => characterLabel(graph, participant)).join(' · ')}</span>
                </div>
                {hasExtra && <details className="mt-1 pl-1 text-xs text-[#78695c]">
                    <summary className="w-fit cursor-pointer">근거 세부 보기</summary>
                    <div className="mt-1 pl-2">
                        {relation.direction?.from_character && relation.direction?.to_character &&
                            <p>방향: {characterLabel(graph, relation.direction.from_character)} → {characterLabel(graph, relation.direction.to_character)}</p>}
                        {relation.candidate_element && <p>후보 오행: {relation.candidate_element}</p>}
                        {!!relation.formation_candidates?.length && <p>후보 조합: {relation.formation_candidates.map(group => group.map(participant => characterLabel(graph, participant)).join(' · ')).join(' / ')}</p>}
                    </div>
                </details>}
            </li>;
        })}
    </ul>;
}

export function NatalCharacterDetails({ graph, error }: { graph: BaziCharacterGraph | null; error: string }) {
    const [selectedId, setSelectedId] = useState('natal.chart.day.stem');
    const entries = Object.entries(graph?.characters || {}).filter(([, item]) => item.context_id === 'natal.chart');
    const selected = graph?.characters[selectedId];
    const allRelationIds = Object.keys(graph?.relations || {});
    return <Card className="xl:col-span-2">
        <CardTitle title="원국 글자별 상세와 관계" body="각 글자의 위치와 소속을 구분해 속성, 동주 통근, 중앙 관계 참조를 보여줍니다." />
        {!graph && !error && <p className="mt-4 text-sm text-[#78695c]">글자별 상세를 조회하는 중입니다.</p>}
        {error && <p role="alert" className="mt-4 whitespace-pre-line rounded bg-[#fff2ec] p-3 text-sm text-[#9a462d]">{error}</p>}
        {graph && <>
            <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
                {entries.map(([id, item]) => <button key={id} type="button" onClick={() => setSelectedId(id)}
                    aria-pressed={id === selectedId} aria-label={characterLabel(graph, id)}
                    className={`rounded-lg border p-2 text-center ${id === selectedId ? 'border-[#a97945] bg-[#ae7a43] text-white' : 'border-[#e5d5c3] bg-[#fffaf4]'}`}>
                    <span className="block text-[11px]">{positions[item.position] || item.position}{item.kind === 'stem' ? '간' : '지'}</span>
                    <span className="font-serif text-2xl font-bold">{item.char}</span>
                </button>)}
            </div>
            {selected && <div className="mt-4 rounded-lg border border-[#e5d5c3] bg-[#fbf7f1] p-4 text-sm leading-6 text-[#514030]">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h4 className="font-serif text-lg font-bold">{characterLabel(graph, selectedId)}</h4>
                    <span className="text-[#685748]">{[selected.attributes.element, selected.attributes.yin_yang, selected.attributes.ten_god].filter(Boolean).join(' · ') || '속성 미제공'}</span>
                </div>
                <p className="mt-2 text-[#685748]">관계 {selected.relation_ids.length}건{selected.relation_ids.length > 0 && ` · ${relationTypeSummary(graph, selected.relation_ids)}`}</p>
                {selected.rooting && <p className="mt-1 text-[#685748]">동주 통근 {selected.rooting.current_status} · 관계에 따른 통근 영향 {selected.rooting.root_impact_status === 'not_evaluated' && selected.rooting.root_impact_score === null ? '미평가' : selected.rooting.root_impact_status}</p>}
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                    <details className="rounded border border-[#e8d9c9] bg-white/80 p-3">
                        <summary className="cursor-pointer font-semibold">기둥·통근 정보</summary>
                        <div className="mt-2 space-y-1 text-[#685748]">
                            {selected.pillar_attributes.unseong && <p>기둥 운성: {selected.pillar_attributes.unseong}</p>}
                            {!!selected.pillar_attributes.jijanggan?.length && <p>기둥 지장간: {selected.pillar_attributes.jijanggan.map(item => item.ch).join(' · ')}</p>}
                            {selected.rooting && <>
                                <p>동주 통근 원점수: {selected.rooting.root_score}</p>
                                <p>동주 뿌리: {selected.rooting.root_branch_ids.map(id => characterLabel(graph, id)).join(' · ') || '없음'}</p>
                                <p>타주 지원: {selected.rooting.external_support_score} · {selected.rooting.external_support_branch_ids.map(id => characterLabel(graph, id)).join(' · ') || '없음'}</p>
                                <p>관계에 따른 통근 영향: {selected.rooting.root_impact_status === 'not_evaluated' && selected.rooting.root_impact_score === null ? '미평가' : selected.rooting.root_impact_status}</p>
                                <p className="text-xs">잠정 동주 판정입니다. 호환용 remaining_score는 검증된 잔존 점수가 아닙니다.</p>
                            </>}
                        </div>
                    </details>
                    <details className="rounded border border-[#e8d9c9] bg-white/80 p-3">
                        <summary className="cursor-pointer font-semibold">이 글자의 관계 {selected.relation_ids.length}건 보기</summary>
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
    const cycleIds = Object.keys(graph.relations).filter(id => graph.relations[id].context_ids.some(contextId => graph.contexts[contextId]?.scope !== 'natal'));
    const groups = new Map<string, string[]>();
    for (const id of cycleIds) {
        const label = cycleScopeLabel(graph, graph.relations[id]);
        groups.set(label, [...(groups.get(label) || []), id]);
    }
    const candidateCount = cycleIds.filter(id => graph.relations[id].activation_status === 'candidate_only').length;
    const detectedCount = cycleIds.filter(id => graph.relations[id].activation_status === 'detected').length;
    return <div className="mt-5 space-y-3">
        <h4 className="font-serif text-lg font-bold text-[#33281f]">선택한 운의 관계 후보·탐지</h4>
        <p className="text-sm text-[#78695c]">{graph.selection.mode === 'sewoon' ? `${graph.selection.sewoon_year}년 세운` : `${graph.selection.daewoon_index}번 대운`} · {graph.selection.daewoon_status === 'before_first_period' ? '첫 대운 이전 · 대운 없음' : '대응 대운 포함'}{graph.selection.mode === 'sewoon' && ' · 달력 연도 기준(입춘 전후 미구분)'}</p>
        <div className="grid grid-cols-3 gap-2 text-center">
            {([['관계 후보', candidateCount], ['관계 탐지', detectedCount], ['참여 범위', groups.size]] as const).map(([label, count]) =>
                <div key={label} className="rounded-lg border border-[#e8d9c9] bg-white/80 p-2.5">
                    <p className="text-xs text-[#78695c]">{label}</p><p className="font-serif text-lg font-bold text-[#514030]">{count}{label === '참여 범위' ? '곳' : '건'}</p>
                </div>)}
        </div>
        <p className="text-xs leading-5 text-[#78695c]">건수는 탐지된 항목 수입니다. 관계 성립·경합·합화·실제 세력 변화·통근 손상과 운 글자 통근은 미평가이며 원국 판정은 유지됩니다.</p>
        {groups.size > 0 ? <div className="space-y-2">
            {[...groups].map(([label, ids]) => <details key={label} className="rounded-lg border border-[#e8d9c9] bg-white/80 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-[#514030]">{label} · {ids.length}건</summary>
                <p className="mt-1 text-xs text-[#78695c]">종류별 건수: {relationTypeSummary(graph, ids)}</p>
                <div className="mt-2"><RelationList graph={graph} ids={ids} /></div>
            </details>)}
        </div> : <p className="text-sm text-[#78695c]">이 선택에서 제공된 소속 간 관계가 없습니다.</p>}
    </div>;
}
