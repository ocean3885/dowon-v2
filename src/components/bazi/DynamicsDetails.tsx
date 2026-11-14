import type { ReactNode } from 'react';
import type { BinZhuDynamics, InteractionMatrixItem, XuShiDynamics } from './types';
import { relationName } from './relation-labels';

const panel = 'rounded-lg border border-[#ede2d7] bg-[#fcf9f5] p-3.5';
const text = 'break-words text-sm leading-6 text-[#514030]';
const muted = 'break-words text-[13px] leading-6 text-[#685748]';
const pillarNames: Record<string, string> = { year: '년', month: '월', day: '일', hour: '시', time: '시' };
const orderedPillars = ['year', 'month', 'day', 'hour'];

export function positionName(key?: string, suffix = '주') {
    if (!key) return '위치 미제공';
    if (key === 'all') return '전체 (참여 위치 미제공)';
    return pillarNames[key] ? `${pillarNames[key]}${suffix}` : key;
}

function positions(keys: string[] | undefined, suffix = '주') {
    return keys === undefined ? '정보 미제공' : keys.length ? keys.map(key => positionName(key, suffix)).join(' · ') : '없음';
}

export function scoreText(value?: number) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return '미제공';
    const rounded = Math.round(value * 1000) / 1000;
    if (value > 0 && rounded === 0) return '0.001 미만';
    if (value < 0.5 && rounded === 0.5) return '0.5 미만';
    if (value > 0.5 && rounded === 0.5) return '0.5 초과';
    return rounded.toLocaleString('ko-KR', { maximumFractionDigits: 3 });
}

function Score({ value }: { value?: number }) {
    return <span title={typeof value === 'number' ? String(value) : undefined}>{scoreText(value)}</span>;
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
    return <details className={`${panel} mt-3`}>
        <summary className="cursor-pointer text-sm font-semibold text-[#705035] focus-visible:outline-2 focus-visible:outline-offset-4">{title}</summary>
        <div className="mt-3 space-y-3">{children}</div>
    </details>;
}

function Status({ value }: { value?: string }) {
    const colors = value === '실(實)' ? 'bg-[#417e50]/15 text-[#2d5c38]'
        : value === '변허(變虛)' ? 'bg-[#9a4b34]/15 text-[#9a4b34]'
            : 'bg-[#c58e49]/15 text-[#885a21]';
    return <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-bold ${colors}`}>{value || '상태 미제공'}</span>;
}

function RelationLabel({ relation }: { relation: InteractionMatrixItem }) {
    return <span>{relation.name || relationName(relation.type)} · {relation.participants !== undefined
        ? positions(relation.participants)
        : `${positionName(relation.from_pillar)} ↔ ${positionName(relation.to_pillar)}`}</span>;
}

export function XuShiContent({ data }: { data: XuShiDynamics }) {
    const counts = [['실', data.real_count], ['변허', data.transformed_empty_count], ['허투', data.hollow_penetrate_count], ['허', data.weak_count]] as const;
    return <div className="mt-5 space-y-4">
        <p className={muted}>원국의 동주 통근 판정입니다. 지지 관계와 그 통근 영향은 분리되어 있으며 대운·세운 변화는 포함하지 않습니다.</p>
        {counts.some(([, count]) => typeof count === 'number') && <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {counts.map(([label, count]) => <div key={label} className={panel}>
                <dt className={muted}>{label}</dt><dd className="mt-1 font-semibold text-[#45372a]">{typeof count === 'number' ? `${count}개` : '미제공'}</dd>
            </div>)}
        </dl>}
        {data.overall_status && <p className={`${panel} ${text}`}>{data.overall_status}</p>}
        {orderedPillars.map(key => {
            const item = data.pillars?.[key] || (key === 'hour' ? data.pillars?.time : undefined);
            if (!item) return null;
            const roots = item.root_evidence;
            const structure = item.root_structure;
            return <div key={key} className={panel}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-serif font-bold text-[#35281e]">{positionName(key, '간')} {item.char && `(${item.char})`} <span className="text-sm font-normal">{item.ten_star}</span></h4>
                    <Status value={item.current_status || item.original_status} />
                </div>
                <p className={`mt-2 ${muted}`}>{item.root_impact_status === 'legacy_evaluated'
                    ? `과거 규칙 상태: ${item.original_status || '미제공'} → ${item.current_status || '미제공'}`
                    : `동주 판정: ${item.current_status || item.original_status || '미제공'}`}</p>
                <p className={muted}>동주 통근 원점수: <Score value={item.score} /></p>
                <p className={muted}>관계에 따른 통근 영향: {item.root_impact_status === 'not_evaluated' && item.root_impact_score === null ? '미평가' : item.root_impact_status || '정보 미제공'}</p>
                {item.transition_code === 'real_to_empty' && item.root_impact_status === 'legacy_evaluated' && <p className={muted}>과거 규칙에서 실에서 변허로 분류되었습니다.</p>}
                {structure && <dl className={`mt-2 ${muted}`}>
                    <div><dt className="inline font-semibold">주요 뿌리: </dt><dd className="inline">{positions(structure.primary_root_pillars, '지')}</dd></div>
                    {item.root_impact_status === 'legacy_evaluated' && <div><dt className="inline font-semibold">과거 규칙 잔존 기반: </dt><dd className="inline">{positions(structure.remaining_root_pillars, '지')}</dd></div>}
                </dl>}
                {item.reason && <p className={`mt-2 ${muted}`}>{item.reason}</p>}
                {item.meaning && <p className={`mt-2 ${text}`}><span className="font-semibold">해석 참고: </span>{item.meaning}</p>}
                {roots !== undefined ? <DetailSection title="뿌리별 점수와 판단 근거">
                    {roots.length ? roots.map((root, index) => <div key={`${root.pillar || root.position}-${index}`} className="border-b border-[#ede2d7] pb-2 last:border-0">
                        <p className={text}>{root.pillar ? positionName(root.pillar, '지') : `${root.position || '?'}지`} ({root.branch_char || '글자 미제공'})</p>
                        <p className={muted}>동주 통근 기여도 <Score value={root.score} /> · {item.root_impact_status === 'not_evaluated' ? '관계 영향 미평가' : root.is_affected === true ? '관계 반영으로 제외' : root.is_affected === false ? '기여도 유지' : '영향 정보 미제공'}</p>
                        {root.interactions?.map((relation, idx) => <p key={relation.relation_id || idx} className={muted}><RelationLabel relation={relation} /></p>)}
                    </div>) : <p className={muted}>계산에 사용된 통근 뿌리가 없습니다.</p>}
                    {!!item.transition_reasons?.length && <ol className={`list-decimal space-y-1 pl-5 ${muted}`}>{item.transition_reasons.map((reason, index) => <li key={index}>{reason}</li>)}</ol>}
                </DetailSection> : <p className={`mt-2 ${muted}`}>이 결과에는 뿌리별 상세 정보가 포함되어 있지 않습니다.</p>}
            </div>;
        })}
        {data.shared_roots !== undefined && <DetailSection title="공통 뿌리와 천간별 기여도">
            {data.shared_roots.length ? data.shared_roots.map((root, index) => <div key={root.root_pillar || index}>
                <p className={text}>{positionName(root.root_pillar, '지')} ({root.branch_char || '글자 미제공'}) · {data.pillars?.[root.root_pillar || '']?.root_impact_status === 'not_evaluated' ? '관계 영향 미평가' : root.is_affected === true ? '관계 영향 있음' : root.is_affected === false ? '관계 영향 없음' : '영향 정보 미제공'}</p>
                {root.dependents?.map((dependent, idx) => <p key={dependent.stem_pillar || idx} className={muted}>{positionName(dependent.stem_pillar, '간')} · <Score value={dependent.score} /> → <Score value={dependent.effective_score} /> · {dependent.current_status || '상태 미제공'}</p>)}
            </div>) : <p className={muted}>둘 이상의 천간이 공유하는 뿌리가 없습니다.</p>}
        </DetailSection>}
        {Object.values(data.pillars || {}).some(item => item.related_interactions !== undefined) && <DetailSection title="통근과 분리해 기록한 지지 관계">
            {orderedPillars.map(key => data.pillars?.[key]?.related_interactions?.map((relation, index) =>
                <p key={`${key}-${relation.relation_id || index}`} className={muted}>{positionName(key, '지')} · <RelationLabel relation={relation} /> · 통근 영향 미평가</p>))}
        </DetailSection>}
        {data.impact_groups !== undefined && <DetailSection title="관계별 영향 범위">
            <p className={muted}>같은 관계에 연결된 뿌리와 천간을 모았습니다. 각 관계가 단독으로 상태 변화를 일으켰다는 뜻은 아닙니다.</p>
            {data.impact_groups.length ? data.impact_groups.map((group, index) => <div key={group.interaction?.relation_id || index}>
                {group.interaction && <p className={text}><RelationLabel relation={group.interaction} /></p>}
                <p className={muted}>뿌리: {positions(group.affected_root_pillars, '지')} / 천간: {positions(group.affected_stem_pillars, '간')}</p>
            </div>) : <p className={muted}>기록된 관계별 통근 영향 그룹이 없습니다. 관계 영향은 미평가일 수 있습니다.</p>}
        </DetailSection>}
        <p className={muted}>호환용 effective_score와 remaining_score는 검증된 관계 반영 후 잔존 점수가 아닙니다. 점수는 읽기 쉽게 소수 셋째 자리까지 표시합니다.</p>
    </div>;
}

export function BinZhuContent({ data }: { data: BinZhuDynamics }) {
    const flow = data.control_flow;
    const guestElements = data.guest_structure?.elements;
    const hostElements = data.host_structure?.elements;
    const hasLinks = Boolean(data.guest_host_links?.length);
    const hasGroupConnections = Boolean(data.group_connections?.length);

    return <div className="mt-5 space-y-4">
        {flow && <div className={panel}>
            <p className={muted}>관계 유형 비교</p>
            <h4 className="mt-1 font-serif text-lg font-bold text-[#2a2018]">{flow.direction || '판정 미제공'}</h4>
            {flow.summary_meaning && <p className={`mt-2 ${text}`}>{flow.summary_meaning}</p>}
        </div>}
        {data.pairwise_scores ? <div>
            <dl className="grid grid-cols-2 gap-3">
                <div className={panel}><dt className={muted}>합 관계 점수</dt><dd className={text}><Score value={data.pairwise_scores.combination} /></dd></div>
                <div className={panel}><dt className={muted}>충·해 관계 점수</dt><dd className={text}><Score value={data.pairwise_scores.conflict} /></dd></div>
            </dl>
            <p className={`mt-2 ${muted}`}>빈과 주 사이의 쌍별 관계 점수입니다. 성취 가능성이나 직업 적합성 점수가 아닙니다.</p>
        </div> : <p className={muted}>이 결과에는 관계 점수가 포함되어 있지 않습니다. 빈(년·월)과 주(일·시)의 영역 구성 및 연결 통로를 중심으로 표시합니다.</p>}
        <div className="grid gap-3 sm:grid-cols-2">
            <div className={panel}>
                <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-[#6e563e]">빈(賓) · 사회적 환경</p>
                    <span className="rounded bg-[#ede0d1] px-2 py-0.5 text-xs font-semibold text-[#69492a]">
                        {data.guest_structure?.scope || '범위 미제공'}
                    </span>
                </div>
                {guestElements && (
                    <div className="mt-2.5 grid grid-cols-2 gap-2">
                        {(['year', 'month'] as const).map(pillarKey => {
                            const el = guestElements[pillarKey];
                            if (!el) return null;
                            return (
                                <div key={pillarKey} className="rounded border border-[#e8d9c9] bg-white/85 p-2 text-xs">
                                    <p className="font-bold text-[#7c5b3b]">{positionName(pillarKey)}</p>
                                    {el.stem && <p className="mt-0.5 text-[#35281e]">{el.stem}</p>}
                                    {el.branch && <p className="text-[#514030]">{el.branch}</p>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <div className={panel}>
                <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-[#6e563e]">주(主) · 개인 영역</p>
                    <span className="rounded bg-[#ede0d1] px-2 py-0.5 text-xs font-semibold text-[#69492a]">
                        {data.host_structure?.scope || '범위 미제공'}
                    </span>
                </div>
                {hostElements && (
                    <div className="mt-2.5 grid grid-cols-2 gap-2">
                        {(['day', 'hour'] as const).map(pillarKey => {
                            const el = hostElements[pillarKey] || (pillarKey === 'hour' ? hostElements.time : undefined);
                            if (!el) return null;
                            return (
                                <div key={pillarKey} className="rounded border border-[#e8d9c9] bg-white/85 p-2 text-xs">
                                    <p className="font-bold text-[#7c5b3b]">{positionName(pillarKey)}</p>
                                    {el.stem && <p className="mt-0.5 text-[#35281e]">{el.stem}</p>}
                                    {el.branch && <p className="text-[#514030]">{el.branch}</p>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
        {flow?.career_advice && <div className={panel}><p className="text-sm font-bold text-[#9d6836]">관계 해석 참고</p><p className={`mt-2 ${text}`}>{flow.career_advice}</p></div>}
        {(hasLinks || hasGroupConnections) && !flow && (
            <div className={panel}>
                <p className="text-xs font-bold text-[#7c5b3b]">빈–주 교차 관계 요약</p>
                <div className="mt-2 space-y-1.5">
                    {data.guest_host_links?.map((link, idx) => (
                        <div key={link.relation_id || idx} className="flex flex-wrap items-center justify-between gap-2 rounded border border-[#e8d9c9] bg-white/90 px-3 py-2 text-xs">
                            <span className="font-medium text-[#35281e]">{link.detail || link.type || '빈–주 연결 통로'}</span>
                            <div className="flex items-center gap-1.5">
                                {link.is_adjacent !== undefined && (
                                    <span className="rounded bg-[#f3eae0] px-1.5 py-0.5 text-[11px] text-[#6e5a47]">
                                        {link.is_adjacent ? '인접' : '비인접'}
                                    </span>
                                )}
                                {link.activation_status && (
                                    <span className="rounded bg-[#417e50]/15 px-1.5 py-0.5 text-[11px] font-semibold text-[#2d5c38]">
                                        {link.activation_status === 'detected' ? '관계 탐지' : link.activation_status}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    {data.group_connections?.map((group, idx) => (
                        <div key={group.relation_id || idx} className="rounded border border-[#e8d9c9] bg-white/90 px-3 py-2 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-semibold text-[#35281e]">{group.type || '다자 관계'} · {positions(group.participants)}</span>
                                <span className="text-[11px] text-[#78695c]">빈: {positions(group.guest_participants)} / 주: {positions(group.host_participants)}</span>
                            </div>
                            {group.description && <p className="mt-1 text-[11px] text-[#685748]">{group.description}</p>}
                        </div>
                    ))}
                </div>
            </div>
        )}
        {data.guest_host_links !== undefined && <DetailSection title="점수에 반영한 빈–주 통로">
            {data.guest_host_links.length ? data.guest_host_links.map((link, index) => <p key={link.relation_id || index} className={text}>{link.detail || link.type || '관계 설명 미제공'}</p>) : <p className={muted}>점수에 반영한 빈–주 통로가 없습니다.</p>}
        </DetailSection>}
        {data.group_connections !== undefined && <DetailSection title="삼합·방합의 공동 참여 구조">
            {data.group_connections.length ? data.group_connections.map((group, index) => <div key={group.relation_id || index}>
                <p className={text}>{group.type || '다자 관계'} · {positions(group.participants)}</p>
                <p className={muted}>빈: {positions(group.guest_participants)} / 주: {positions(group.host_participants)}</p>
                {group.included_in_score === false && <p className={muted}>참여 구조만 설명하며 쌍별 점수에는 가산하지 않습니다.</p>}
                {group.description && <p className={muted}>{group.description}</p>}
            </div>) : <p className={muted}>제공된 다자 참여 구조가 없습니다.</p>}
        </DetailSection>}
        {data.excluded_interactions !== undefined && <DetailSection title="점수에서 제외한 다자·위치 미확인 관계">
            {data.excluded_interactions.length ? data.excluded_interactions.map((relation, index) => <div key={relation.relation_id || index}>
                <p className={text}><RelationLabel relation={relation} /></p>
                <p className={muted}>{relation.reason_code === 'group_relation_unsupported' ? '다자 관계는 쌍별 점수에서 제외됩니다.' : relation.reason_code === 'invalid_endpoint' ? '관계의 기둥 위치를 확인할 수 없어 제외되었습니다.' : '제외 사유 미제공'}</p>
            </div>) : <p className={muted}>이 범위의 제외 항목이 없습니다.</p>}
            <p className={muted}>모든 미가산 관계의 목록은 아닙니다. 형·파·극, 빈 내부와 주 내부 관계 등은 현재 빈주 점수 규칙에 포함되지 않습니다.</p>
        </DetailSection>}
    </div>;
}

export function InteractionDetails({ matrix }: { matrix?: InteractionMatrixItem[] }) {
    if (matrix === undefined) return null;
    return <DetailSection title="관계별 참여 기둥과 성립 조합">
        {matrix.length ? matrix.map((relation, index) => <div key={relation.relation_id || `${relation.category}-${relation.type}-${relation.from_pillar}-${relation.to_pillar}-${index}`} className="border-b border-[#ede2d7] pb-3 last:border-0">
            <p className={text}>{relation.category && `${relation.category} · `}<RelationLabel relation={relation} /></p>
            {relation.description && <p className={muted}>{relation.description}</p>}
            {!!relation.formations?.length && <ul className={`list-disc pl-5 ${muted}`}>{relation.formations.map((formation, idx) => <li key={idx}>성립 조합: {positions(formation)}</li>)}</ul>}
            {relation.relation_scope === 'group' && <p className={muted}>여러 조합이 있어도 같은 삼합·방합의 조화 점수는 한 번만 가산합니다.</p>}
            <p className={muted}>관계 점수: <Score value={relation.score} /></p>
        </div>) : <p className={muted}>제공된 관계 항목이 없습니다.</p>}
    </DetailSection>;
}
