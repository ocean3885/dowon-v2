// Run: node scripts/test-bazi-dynamics.mjs [optional-real-api-response.json]
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(__dirname, '../src/components/bazi/DynamicsDetails.tsx');
const compiled = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
});
const loaded = { exports: {} };
vm.runInNewContext(compiled.outputText, { module: loaded, exports: loaded.exports, require: createRequire(sourcePath) });
const { XuShiContent, BinZhuContent, InteractionDetails, scoreText } = loaded.exports;
const render = (component, props) => renderToStaticMarkup(React.createElement(component, props));
const plain = html => html.replace(/<[^>]*>/g, '');

const relation = {
    relation_id: 'root-clash', category: '지지', type: '충(沖)', name: '子午충',
    from_pillar: 'year', to_pillar: 'month', participants: ['year', 'month'], score: 2,
};
const group = {
    relation_id: 'wood-group', category: '지지', type: '삼합(三合)', name: '삼합 木국',
    relation_scope: 'group', from_pillar: 'all', to_pillar: 'all',
    participants: ['year', 'month', 'day', 'hour'],
    formations: [['year', 'month', 'day'], ['month', 'day', 'hour']], score: 3,
};
const v2Xu = {
    analysis_scope: 'natal', real_count: 0, transformed_empty_count: 1, hollow_penetrate_count: 2, weak_count: 1,
    overall_status: '공통 뿌리를 제외한 후 잔존 기반을 비교합니다.',
    pillars: { hour: {
        char: '甲', ten_star: '비견', score: 0.8, effective_score: 0,
        original_status: '실(實)', current_status: '변허(變虛)', transition_code: 'real_to_empty',
        root_structure: { primary_root_pillars: ['month'], remaining_root_pillars: [], excluded_root_pillars: ['month'], remaining_support: 'none' },
        root_evidence: [{ pillar: 'month', branch_char: '午', score: 0.8, effective_score: 0, is_affected: true, interactions: [relation] }],
        transition_reasons: ['월지 기여도를 제외합니다.'], reason: '뿌리 점수 제외', meaning: '전통적 해석 참고',
    } },
    shared_roots: [{ root_pillar: 'month', branch_char: '午', is_affected: true,
        dependents: [{ stem_pillar: 'hour', score: 0.8, effective_score: 0, current_status: '변허(變虛)' }] }],
    impact_groups: [{ interaction: relation, affected_root_pillars: ['month'], affected_stem_pillars: ['hour'] }],
};

test('새 허실 응답의 점수, 상태, 시주와 뿌리 근거를 표시한다', () => {
    const html = render(XuShiContent, { data: v2Xu });
    const text = plain(html);
    for (const expected of ['실0개', '변허1개', '허투2개', '허1개', '시간 (甲)', '실(實) → 변허(變虛)', '잔여 0', '월지 (午)', '子午충', '기여도 0.8 → 잔여 0', '천간: 시간']) {
        assert.ok(text.includes(expected), expected);
    }
    assert.ok(html.includes('<details'));
    assert.ok(text.includes('대운·세운에 따른 시기별 변화는 아닙니다'));
});

test('과거 허실 응답의 신규 필드를 0이나 없음으로 추정하지 않는다', () => {
    const html = plain(render(XuShiContent, { data: {
        real_count: 1, overall_status: '과거 총평', pillars: { year: { char: '甲', current_status: '실(實)', reason: '과거 근거' } },
    } }));
    assert.ok(html.includes('과거 총평'));
    assert.ok(html.includes('과거 근거'));
    assert.ok(html.includes('허미제공'));
    assert.ok(html.includes('잔여 미제공'));
    assert.ok(!html.includes('허0개'));
    assert.ok(!html.includes('통근 뿌리가 없습니다'));
    assert.ok(!html.includes('공유하는 뿌리가 없습니다'));
});

test('제공된 빈 목록과 상세 미제공을 구분한다', () => {
    const html = plain(render(XuShiContent, { data: {
        pillars: { day: { root_evidence: [] } }, shared_roots: [], impact_groups: [],
    } }));
    assert.ok(html.includes('계산에 사용된 통근 뿌리가 없습니다'));
    assert.ok(html.includes('공유하는 뿌리가 없습니다'));
    assert.ok(html.includes('통근에 반영된 충·형·해 관계가 없습니다'));
});

test('표시 반올림으로 상태를 재판정하지 않고 경계값을 구분한다', () => {
    assert.equal(scoreText(0), '0');
    assert.equal(scoreText(undefined), '미제공');
    assert.equal(scoreText(NaN), '미제공');
    assert.equal(scoreText(0.49999999999999994), '0.5 미만');
    assert.equal(scoreText(0.5000000000000001), '0.5 초과');
    const html = plain(render(XuShiContent, { data: { pillars: {
        day: { score: 0.3, effective_score: 0, original_status: '허(虛)', current_status: '허(虛)' },
    } } }));
    assert.ok(html.includes('허(虛) → 허(虛)'));
    assert.ok(!html.includes('변허(變虛)'));
});

test('과거 time 위치 키도 시간으로 표시한다', () => {
    const html = plain(render(XuShiContent, { data: { pillars: { time: { char: '丁', current_status: '실(實)' } } } }));
    assert.ok(html.includes('시간 (丁)'));
});

test('새 빈주 응답의 0점, 참여 구조, 점수 제외 사유를 표시한다', () => {
    const html = plain(render(BinZhuContent, { data: {
        pairwise_scores: { combination: 0, conflict: 1.5 },
        control_flow: { direction: '충·해 관계 우세', career_advice: '관계 집계의 해석 참고' },
        group_connections: [{ ...group, guest_participants: ['year', 'month'], host_participants: ['day', 'hour'], included_in_score: false }],
        excluded_interactions: [{ ...group, reason_code: 'group_relation_unsupported' }],
        guest_host_links: [{ relation_id: 'root-clash', detail: '빈과 주의 연결 근거' }],
    } }));
    for (const expected of ['합 관계 점수0', '충·해 관계 점수1.5', '충·해 관계 우세', '빈: 년주 · 월주 / 주: 일주 · 시주', '점수에는 가산하지 않습니다', '다자 관계는 쌍별 점수에서 제외', '빈과 주의 연결 근거']) {
        assert.ok(html.includes(expected), expected);
    }
    assert.ok(!html.includes('진로 및 사회활동 조언'));
});

test('과거 빈주 응답은 기존 문장을 보존하고 누락 점수를 구분한다', () => {
    const html = plain(render(BinZhuContent, { data: { control_flow: { direction: '과거 판정', career_advice: '과거 해석' } } }));
    assert.ok(html.includes('과거 판정'));
    assert.ok(html.includes('과거 해석'));
    assert.ok(html.includes('관계 점수가 포함되어 있지 않습니다'));
    assert.ok(!html.includes('합 관계 점수0'));
});

test('다자 관계의 실제 참여 기둥과 두 성립 조합을 표시한다', () => {
    const html = plain(render(InteractionDetails, { matrix: [group] }));
    assert.ok(html.includes('년주 · 월주 · 일주 · 시주'));
    assert.equal((html.match(/성립 조합:/g) || []).length, 2);
    assert.ok(html.includes('성립 조합: 월주 · 일주 · 시주'));
    assert.ok(html.includes('점수는 한 번만 가산'));
});

test('참여 정보 없는 all을 임의의 네 기둥으로 바꾸지 않는다', () => {
    const html = plain(render(InteractionDetails, { matrix: [{ type: '삼합(三合)', from_pillar: 'all', to_pillar: 'all' }] }));
    assert.ok(html.includes('참여 위치 미제공'));
    assert.ok(!html.includes('년주 · 월주 · 일주 · 시주'));
    assert.equal(render(InteractionDetails, {}), '');
});

const responsePath = process.argv[2];
test('실제 API 응답의 분석 영역을 오류 없이 렌더링한다', { skip: !responsePath }, () => {
    const result = JSON.parse(fs.readFileSync(responsePath, 'utf8'));
    const advanced = result.advanced_analysis;
    const xu = plain(render(XuShiContent, { data: advanced.xu_shi_dynamics }));
    const bin = plain(render(BinZhuContent, { data: advanced.bin_zhu_dynamics }));
    const interactions = plain(render(InteractionDetails, { matrix: advanced.interactions.matrix }));
    assert.ok(xu.includes(advanced.xu_shi_dynamics.overall_status));
    assert.ok(bin.includes(advanced.bin_zhu_dynamics.control_flow.direction));
    for (const item of advanced.interactions.matrix) assert.ok(interactions.includes(item.name));
});
