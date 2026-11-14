// Run: node scripts/test-bazi-contract.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = (relative, mocks = {}, globals = {}) => {
    const filename = path.join(root, relative);
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
        compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
    });
    const loadedModule = { exports: {} };
    const nativeRequire = createRequire(filename);
    vm.runInNewContext(compiled.outputText, {
        module: loadedModule, exports: loadedModule.exports, require: name => mocks[name] || nativeRequire(name),
        URLSearchParams, Response, ...globals,
    });
    return loadedModule.exports;
};
const contract = load('src/lib/bazi-contract.ts');
const labels = load('src/components/bazi/relation-labels.ts');
const ui = load('src/components/bazi/CharacterRelations.tsx', {
    './SajuChart': { Card: ({ children }) => React.createElement('section', null, children), CardTitle: ({ title }) => React.createElement('h3', null, title) },
    './relation-labels': labels,
});
const plain = html => html.replace(/<[^>]*>/g, '');
const params = { year: '1995', month: '5', day: '12', hour: '14', min: '30', sl: 'lun_y', gen: '남' };
const base = { daewoon: { selection_year: 2012, selection_status: 'selected', current: null, list: [
    { index: 0, start_year: 2002, end_year: 2012, selection_start_year: 2002, selection_end_year_exclusive: 2012 },
    { index: 1, start_year: 2012, end_year: 2022, selection_start_year: 2012, selection_end_year_exclusive: 2022 },
] } };
const graph = {
    schema_version: '1.0-draft', contexts: {
        'natal.chart': { scope: 'natal', label: '원국' },
        'daewoon.period_0': { scope: 'daewoon', label: '선택 대운' },
        'sewoon.year_2001': { scope: 'sewoon', label: '2001 세운' },
    },
    characters: {
        'natal.chart.year.stem': { context_id: 'natal.chart', position: 'year', kind: 'stem', char: '甲', attributes: { element: '목' }, pillar_attributes: {}, relation_ids: ['r1'], transmission_relation_ids: [], rooting: { current_status: '실(實)', root_score: 1, root_branch_ids: [], external_support_score: 0, external_support_branch_ids: [], remaining_score: 1, root_impact_status: 'not_evaluated', root_impact_score: null } },
        'natal.chart.day.stem': { context_id: 'natal.chart', position: 'day', kind: 'stem', char: '甲', attributes: { element: '목' }, pillar_attributes: {}, relation_ids: ['r1'], transmission_relation_ids: [], rooting: { current_status: '실(實)', root_score: 1, root_branch_ids: [], external_support_score: 0, external_support_branch_ids: [], remaining_score: 1, root_impact_status: 'not_evaluated', root_impact_score: null } },
        'daewoon.period_0.cycle.stem': { context_id: 'daewoon.period_0', position: 'cycle', kind: 'stem', char: '甲', attributes: {}, pillar_attributes: {}, relation_ids: ['r1'], transmission_relation_ids: [], rooting: null },
        'sewoon.year_2001.cycle.stem': { context_id: 'sewoon.year_2001', position: 'cycle', kind: 'stem', char: '甲', attributes: {}, pillar_attributes: {}, relation_ids: [], transmission_relation_ids: [], rooting: null },
    },
    relations: { r1: { relation_id: 'r1', type: 'combine', participants: ['natal.chart.year.stem', 'natal.chart.day.stem', 'daewoon.period_0.cycle.stem'], context_ids: ['natal.chart', 'daewoon.period_0'], activation_status: 'candidate_only', formation_candidates: [] } },
    coverage: { power_effects_included: false },
};

test('관계 유형 코드가 목록과 요약에서 한글로 표시된다', () => {
    const translated = { ...graph, relations: {
        same: { ...graph.relations.r1, relation_id: 'same', type: 'same_branch' },
        self: { ...graph.relations.r1, relation_id: 'self', type: 'self_punishment', activation_status: 'potential' },
    }, characters: {
        ...graph.characters,
        'natal.chart.day.stem': { ...graph.characters['natal.chart.day.stem'], relation_ids: ['same', 'self'] },
    } };
    const html = plain(renderToStaticMarkup(React.createElement(ui.NatalCharacterDetails, { graph: translated, error: '' })));
    assert.ok(html.includes('같은 지지 1'));
    assert.ok(html.includes('자형 1'));
    assert.ok(html.includes('원국 잠재 관계'));
    assert.ok(!html.includes('same_branch'));
    assert.ok(!html.includes('self_punishment'));
    assert.equal(labels.relationName('unknown_rule'), '기타 관계');
});

test('기본 조회의 대운은 표시 end_year가 아니라 반열린 선택 경계로 고른다', () => {
    assert.equal(contract.currentDaewoon(base).index, 1);
    assert.deepEqual(Array.from(contract.selectionYears(base.daewoon.list[0], [2001, 2002, 2011, 2012])), [2002, 2011]);
    assert.equal(contract.currentDaewoon({ daewoon: { ...base.daewoon, selection_status: 'before_first_period', current: null } }), null);
});

test('대운과 세운 선택은 입력 달력 종류를 유지하고 한 선택값만 전송한다', () => {
    const daewoon = contract.cycleQuery(params, { daewoonIndex: 0 });
    const sewoon = contract.cycleQuery(params, { sewoonYear: 2001 });
    assert.equal(daewoon.get('sl'), 'lun_y');
    assert.equal(daewoon.get('daewoon_index'), '0');
    assert.equal(daewoon.has('sewoon_year'), false);
    assert.equal(sewoon.get('sewoon_year'), '2001');
    assert.equal(sewoon.has('daewoon_index'), false);
});

test('동일 한자라도 원국 위치와 운 소속을 별개 글자로 표시하고 중앙 관계를 참조한다', () => {
    assert.equal(contract.graphIsCurrent(graph), true);
    assert.notEqual(ui.characterLabel(graph, 'natal.chart.year.stem'), ui.characterLabel(graph, 'natal.chart.day.stem'));
    assert.notEqual(ui.characterLabel(graph, 'natal.chart.day.stem'), ui.characterLabel(graph, 'daewoon.period_0.cycle.stem'));
    const natal = plain(renderToStaticMarkup(React.createElement(ui.NatalCharacterDetails, { graph, error: '' })));
    assert.ok(natal.includes('이 글자의 관계 1건 보기'));
    assert.ok(natal.includes('원국 전체 관계 1건 보기'));
    assert.ok(natal.includes('원국 년천간 甲'));
    assert.ok(natal.includes('선택 대운 운천간 甲'));
    assert.ok(natal.includes('관계에 따른 통근 영향: 미평가'));
    assert.ok(natal.includes('검증된 잔존 점수가 아닙니다'));
});

test('첫 대운 이전 세운에는 대운 없이 후보·탐지와 미평가 범위를 표시한다', () => {
    const cycle = { ...graph,
        contexts: Object.fromEntries(Object.entries(graph.contexts).filter(([id]) => !id.startsWith('daewoon.'))),
        characters: Object.fromEntries(Object.entries(graph.characters).filter(([id]) => !id.startsWith('daewoon.'))),
        selection: { mode: 'sewoon', daewoon_index: null, sewoon_year: 2001, daewoon_status: 'before_first_period' }, relations: {
            r2: { relation_id: 'r2', type: 'transmission', participants: ['natal.chart.year.stem', 'sewoon.year_2001.cycle.stem'], context_ids: ['natal.chart', 'sewoon.year_2001'], activation_status: 'detected' },
            r3: { relation_id: 'r3', type: 'combine', participants: ['natal.chart.day.stem', 'sewoon.year_2001.cycle.stem'], context_ids: ['natal.chart', 'sewoon.year_2001'], activation_status: 'candidate_only' },
    } };
    const html = renderToStaticMarkup(React.createElement(ui.CycleRelations, { graph: cycle, error: '', loading: false }));
    const rendered = plain(html);
    assert.ok(rendered.includes('첫 대운 이전 · 대운 없음'));
    assert.ok(rendered.includes('원국 ↔ 세운 · 2건'));
    assert.ok(!rendered.includes('원국 ↔ 대운'));
    assert.ok(rendered.includes('관계 후보'));
    assert.ok(rendered.includes('관계 탐지'));
    assert.ok(rendered.includes('성립·경합·합화·실제 세력 변화·통근 손상'));
    assert.equal((html.match(/<details/g) || []).length, 1);
});

test('세운의 관계를 소속별로 접고 건수를 보여준다', () => {
    const cycle = { ...graph, selection: { mode: 'sewoon', daewoon_index: 0, sewoon_year: 2001, daewoon_status: 'selected' }, relations: {
        ...graph.relations,
        r2: { relation_id: 'r2', type: 'transmission', participants: ['natal.chart.year.stem', 'sewoon.year_2001.cycle.stem'], context_ids: ['natal.chart', 'sewoon.year_2001'], activation_status: 'detected' },
        r3: { relation_id: 'r3', type: 'clash', participants: ['daewoon.period_0.cycle.stem', 'sewoon.year_2001.cycle.stem'], context_ids: ['daewoon.period_0', 'sewoon.year_2001'], activation_status: 'candidate_only' },
    } };
    const html = renderToStaticMarkup(React.createElement(ui.CycleRelations, { graph: cycle, error: '', loading: false }));
    const rendered = plain(html);
    for (const label of ['원국 ↔ 대운 · 1건', '원국 ↔ 세운 · 1건', '대운 ↔ 세운 · 1건']) assert.ok(rendered.includes(label), label);
    assert.equal((html.match(/<details/g) || []).length, 3);
    assert.ok(!html.includes('<details open'));
});

test('HTTP 상태, code, errors를 함께 표시한다', async () => {
    const response = new Response(JSON.stringify({ code: 'invalid_birth_input', message: 'hour 범위 오류', errors: [
        { field: 'hour', message: 'hour 범위 오류', constraints: { minimum: 0, maximum: 23 } },
    ] }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    await assert.rejects(contract.readBaziResponse(response, '실패'), /HTTP 400 · invalid_birth_input:[\s\S]*hour: hour 범위 오류 \(0~23\)/);
    assert.match(contract.apiErrorText(404, { code: 'calendar_date_not_found', errors: [] }, '실패'), /양력·음력 날짜/);
});

test('프록시는 원래 HTTP 오류 상태와 구조화된 본문을 보존한다', async () => {
    let calledUrl = '';
    const proxy = load('src/lib/bazi-api-proxy.ts', {}, { fetch: async url => {
        calledUrl = url;
        return new Response(JSON.stringify({ code: 'sewoon_year_out_of_range', errors: [{ field: 'sewoon_year', message: '범위 밖' }] }), { status: 400 });
    } });
    const request = { nextUrl: { searchParams: new URL(`https://local/api/bazi/cycle-analysis?${contract.cycleQuery(params, { sewoonYear: 2001 })}`).searchParams } };
    const response = await proxy.proxyBazi(request, 'cycle-analysis');
    assert.equal(response.status, 400);
    assert.equal((await response.json()).code, 'sewoon_year_out_of_range');
    assert.ok(calledUrl.includes('sewoon_year=2001'));
    assert.ok(!calledUrl.includes('daewoon_index='));
});

test('글자별 display 요약(sections, relation_groups)과 관계 presentation을 표시한다', () => {
    const richGraph = {
        ...graph,
        selection: { mode: 'sewoon', daewoon_index: 0, sewoon_year: 2001, daewoon_status: 'selected' },
        characters: {
            ...graph.characters,
            'natal.chart.day.stem': {
                ...graph.characters['natal.chart.day.stem'],
                display: {
                    version: '1.0.0',
                    title: '원국 일간 甲',
                    subtitle: '목 · 양 · 일간',
                    sections: [
                        { key: 'rooting', title: '통근', items: [{ text: '타주 지원 · 월지 巳', character_ids: ['natal.chart.year.stem'], relation_ids: [], detail_lines: [] }] },
                    ],
                    relation_groups: [
                        { key: 'natal.chart', title: '원국', items: [{ text: '년간 甲 · 투간 ←', character_ids: ['natal.chart.year.stem'], relation_ids: ['r1'], detail_lines: ['원국 년간 甲 → 원국 일간 甲'] }] },
                        { key: 'sewoon.year_2001', title: '세운 2001 辛巳', items: [{ text: '천간 甲 · 충', character_ids: ['sewoon.year_2001.cycle.stem'], relation_ids: [], detail_lines: [] }] },
                    ],
                },
            },
            'sewoon.year_2001.cycle.stem': {
                ...graph.characters['sewoon.year_2001.cycle.stem'],
                display: {
                    version: '1.0.0',
                    title: '세운 천간 甲',
                    subtitle: '목 · 양 · 비견',
                    sections: [{ key: 'pillar', title: '기둥 정보', items: [{ text: '운성 · 건록', character_ids: [], relation_ids: [], detail_lines: [] }] }],
                    relation_groups: [{ key: 'natal.chart', title: '원국', items: [{ text: '일간 甲 · 충', character_ids: ['natal.chart.day.stem'], relation_ids: [], detail_lines: [] }] }],
                },
            },
        },
        relations: {
            r1: {
                ...graph.relations.r1,
                presentation: {
                    rule_version: '1.0.0',
                    title: '원국 일간 甲 · 년간 甲의 관계',
                    status_label: '탐지',
                    description: '지장간 투간 설명 문장입니다.',
                    reasons: [{ code: 'detected_fact', text: '등록 규칙으로 확인한 관계 사실입니다.' }],
                },
            },
        },
    };
    const natalText = plain(renderToStaticMarkup(React.createElement(ui.NatalCharacterDetails, { graph: richGraph, error: '' })));
    assert.ok(natalText.includes('원국 일간 甲'));
    assert.ok(natalText.includes('타주 지원 · 월지 巳'));
    assert.ok(natalText.includes('년간 甲 · 투간 ←'));
    assert.ok(natalText.includes('지장간 투간 설명 문장입니다.'));

    const cycleText = plain(renderToStaticMarkup(React.createElement(ui.CycleRelations, { graph: richGraph, error: '', loading: false })));
    assert.ok(cycleText.includes('세운 천간 甲'));
    assert.ok(cycleText.includes('운성 · 건록'));
    assert.ok(cycleText.includes('세운 2001 辛巳'));
});
