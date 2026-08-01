'use client';

import { RotateCcw, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import {
    updateBaziPromptPipelineConfig,
    type BaziPromptPipelineFormState,
} from '@/lib/actions';
import type { BaziPromptPipelineConfig } from '@/lib/bazi-prompt-config';

const initialState: BaziPromptPipelineFormState = {
    success: false,
    message: '',
};

export default function BaziPromptPipelineForm({
    config,
    defaultConfig,
}: {
    config: BaziPromptPipelineConfig;
    defaultConfig: BaziPromptPipelineConfig;
}) {
    const router = useRouter();
    const [formConfig, setFormConfig] = useState(config);
    const [state, formAction, isPending] = useActionState(updateBaziPromptPipelineConfig, initialState);

    useEffect(() => {
        if (!state.message) return;

        alert(state.message);
        if (state.success) router.refresh();
    }, [router, state]);

    return (
        <form action={formAction} className="mb-8 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <input type="hidden" name="config" value={JSON.stringify(formConfig)} />

            <div className="flex flex-col gap-4 border-b border-stone-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-sm font-semibold text-stone-400">Prompt Pipeline</p>
                    <h3 className="mt-1 text-xl font-bold text-stone-700">만세력 무료상담 프롬프트 설정</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-500">
                        여러 분석 단계의 결과를 만든 뒤 최종 편집 단계에서 하나의 상담문으로 통합합니다.
                    </p>
                    <p className="mt-1 text-xs text-stone-400">
                        사용 가능 변수: {'{{baziSummary}}'}, {'{{gender}}'}, {'{{yearPillar}}'}, {'{{monthPillar}}'}, {'{{dayPillar}}'}, {'{{timePillar}}'}, {'{{currentYear}}'}, {'{{previousDaewoon}}'}, {'{{previousDaewoonYearRange}}'}, {'{{currentDaewoon}}'}, {'{{currentDaewoonYearRange}}'}, {'{{nextDaewoon}}'}, {'{{nextDaewoonYearRange}}'}, {'{{currentSewoon}}'}, {'{{previousStepResults}}'}, {'{{stepResults}}'}
                    </p>
                    <p className="mt-1 text-xs text-stone-400">
                        {'{{previousStepResults}}'}는 순차 실행에서 이전 단계 결과가 누적되어 들어가고, {'{{stepResults}}'}는 최종 통합 편집 단계에서 전체 분석 결과가 들어갑니다.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="submit"
                        name="intent"
                        value="reset"
                        disabled={isPending}
                        onClick={() => setFormConfig(defaultConfig)}
                        className="inline-flex h-10 items-center gap-2 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-stone-600 transition-colors hover:bg-stone-50 disabled:cursor-wait disabled:opacity-60"
                    >
                        <RotateCcw className="h-4 w-4" />
                        기본값 복원
                    </button>
                    <button
                        type="submit"
                        name="intent"
                        value="save"
                        disabled={isPending}
                        className="inline-flex h-10 items-center gap-2 rounded-md bg-stone-800 px-4 text-sm font-bold text-white transition-colors hover:bg-stone-700 disabled:cursor-wait disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />
                        저장
                    </button>
                </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
                <TextInput
                    label="버전"
                    value={formConfig.version}
                    onChange={(value) => setFormConfig((current) => ({ ...current, version: value }))}
                />
                <TextInput
                    label="모델"
                    value={formConfig.model}
                    onChange={(value) => setFormConfig((current) => ({ ...current, model: value }))}
                />
                <label className="block">
                    <span className="mb-2 block text-sm font-bold text-stone-500">실행 방식</span>
                    <select
                        value={formConfig.executionMode}
                        onChange={(event) => setFormConfig((current) => ({
                            ...current,
                            executionMode: event.target.value === 'sequential' ? 'sequential' : 'parallel',
                        }))}
                        className="h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                    >
                        <option value="parallel">병렬 실행</option>
                        <option value="sequential">순차 실행</option>
                    </select>
                </label>
            </div>

            <div className="mt-5 grid gap-4">
                {formConfig.steps.map((step, index) => (
                    <section key={step.key} className="rounded-lg border border-stone-100 bg-stone-50/60 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                                <TextInput
                                    label="단계 키"
                                    value={step.key}
                                    onChange={(value) => updateStep(index, { key: value })}
                                />
                                <TextInput
                                    label="단계 이름"
                                    value={step.label}
                                    onChange={(value) => updateStep(index, { label: value })}
                                />
                            </div>
                            <label className="inline-flex items-center gap-2 text-sm font-bold text-stone-600">
                                <input
                                    type="checkbox"
                                    checked={step.enabled}
                                    onChange={(event) => updateStep(index, { enabled: event.target.checked })}
                                    className="h-4 w-4 rounded border-stone-300"
                                />
                                사용
                            </label>
                        </div>

                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                            <Textarea
                                label="System Prompt"
                                value={step.systemPrompt}
                                rows={7}
                                onChange={(value) => updateStep(index, { systemPrompt: value })}
                            />
                            <Textarea
                                label="User Prompt Template"
                                value={step.userPromptTemplate}
                                rows={7}
                                onChange={(value) => updateStep(index, { userPromptTemplate: value })}
                            />
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <NumberInput
                                label="Temperature"
                                value={step.temperature}
                                step="0.05"
                                min="0"
                                max="2"
                                onChange={(value) => updateStep(index, { temperature: value })}
                            />
                            <NumberInput
                                label="Max Tokens"
                                value={step.maxTokens}
                                step="100"
                                min="256"
                                max="8000"
                                onChange={(value) => updateStep(index, { maxTokens: value })}
                            />
                        </div>
                    </section>
                ))}
            </div>

            <section className="mt-5 rounded-lg border border-stone-100 bg-white p-4">
                <h4 className="text-base font-bold text-stone-700">최종 통합 편집</h4>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <Textarea
                        label="Finalize System Prompt"
                        value={formConfig.finalize.systemPrompt}
                        rows={7}
                        onChange={(value) => setFormConfig((current) => ({
                            ...current,
                            finalize: { ...current.finalize, systemPrompt: value },
                        }))}
                    />
                    <Textarea
                        label="Finalize User Prompt Template"
                        value={formConfig.finalize.userPromptTemplate}
                        rows={7}
                        onChange={(value) => setFormConfig((current) => ({
                            ...current,
                            finalize: { ...current.finalize, userPromptTemplate: value },
                        }))}
                    />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <NumberInput
                        label="Temperature"
                        value={formConfig.finalize.temperature}
                        step="0.05"
                        min="0"
                        max="2"
                        onChange={(value) => setFormConfig((current) => ({
                            ...current,
                            finalize: { ...current.finalize, temperature: value },
                        }))}
                    />
                    <NumberInput
                        label="Max Tokens"
                        value={formConfig.finalize.maxTokens}
                        step="100"
                        min="256"
                        max="8000"
                        onChange={(value) => setFormConfig((current) => ({
                            ...current,
                            finalize: { ...current.finalize, maxTokens: value },
                        }))}
                    />
                </div>
            </section>
        </form>
    );

    function updateStep(index: number, values: Partial<BaziPromptPipelineConfig['steps'][number]>) {
        setFormConfig((current) => ({
            ...current,
            steps: current.steps.map((step, stepIndex) => (
                stepIndex === index ? { ...step, ...values } : step
            )),
        }));
    }
}

function TextInput({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-bold text-stone-500">{label}</span>
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none transition focus:border-stone-400"
            />
        </label>
    );
}

function NumberInput({
    label,
    value,
    min,
    max,
    step,
    onChange,
}: {
    label: string;
    value: number;
    min: string;
    max: string;
    step: string;
    onChange: (value: number) => void;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-bold text-stone-500">{label}</span>
            <input
                type="number"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
                className="h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none transition focus:border-stone-400"
            />
        </label>
    );
}

function Textarea({
    label,
    value,
    rows,
    onChange,
}: {
    label: string;
    value: string;
    rows: number;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-bold text-stone-500">{label}</span>
            <textarea
                value={value}
                rows={rows}
                onChange={(event) => onChange(event.target.value)}
                className="w-full resize-y rounded-md border border-stone-200 bg-white px-3 py-3 font-mono text-xs leading-6 text-stone-700 outline-none transition focus:border-stone-400"
            />
        </label>
    );
}
