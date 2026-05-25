'use client';

import type {
    SajuRelationReading,
    SajuRelationReadingFormState,
} from '@/lib/actions';
import {
    dayPillars,
    getPositionLabel,
    getPositionOptionsForChar,
    getTenStar,
    parseDayPillar,
    positionOptions,
    relationKeyOptionsByType,
    relationTypes,
} from '@/lib/saju-relations';
import { Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';

type SajuRelationReadingFormProps = {
    mode: 'create' | 'edit';
    reading?: SajuRelationReading;
    action: (
        prevState: SajuRelationReadingFormState,
        formData: FormData
    ) => Promise<SajuRelationReadingFormState>;
};

const initialState: SajuRelationReadingFormState = {
    success: false,
    message: '',
};

function getSelectablePositions(char: string, dayStem: string, dayBranch: string) {
    const derivedOptions = getPositionOptionsForChar(char.trim(), dayStem, dayBranch);
    return derivedOptions.length > 0 ? derivedOptions : positionOptions;
}

function getValidPositionValue(currentValue: string, options: { value: string }[]) {
    return options.some((option) => option.value === currentValue) ? currentValue : options[0]?.value || '';
}

export default function SajuRelationReadingForm({
    mode,
    reading,
    action,
}: SajuRelationReadingFormProps) {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(action, initialState);
    const initialRelationType = reading?.relation_type || 'clash';
    const initialRelationKeyOptions = relationKeyOptionsByType[initialRelationType] || [];
    const initialRelationKey = reading?.relation_key || initialRelationKeyOptions[0]?.value || '';
    const hasInitialRelationKeyOption = initialRelationKeyOptions.some((option) => option.value === initialRelationKey);
    const [relationType, setRelationType] = useState(initialRelationType);
    const [relationKey, setRelationKey] = useState(hasInitialRelationKeyOption ? initialRelationKey : '__custom__');
    const [customRelationKey, setCustomRelationKey] = useState(hasInitialRelationKeyOption ? '' : initialRelationKey);
    const initialDayPillar = reading?.day_pillar || '甲子';
    const initialDayPillarParts = parseDayPillar(initialDayPillar) || { dayStem: '甲', dayBranch: '子' };
    const initialActorChar = reading?.actor_char || '';
    const initialTargetChar = reading?.target_char || '';
    const [dayPillar, setDayPillar] = useState(initialDayPillar);
    const [actorChar, setActorChar] = useState(initialActorChar);
    const [targetChar, setTargetChar] = useState(initialTargetChar);
    const [actorPosition, setActorPosition] = useState(
        getValidPositionValue(
            reading?.actor_position || 'day_branch',
            getSelectablePositions(initialActorChar, initialDayPillarParts.dayStem, initialDayPillarParts.dayBranch)
        )
    );
    const [targetPosition, setTargetPosition] = useState(
        getValidPositionValue(
            reading?.target_position || 'year_branch',
            getSelectablePositions(initialTargetChar, initialDayPillarParts.dayStem, initialDayPillarParts.dayBranch)
        )
    );
    const relationKeyOptions = relationKeyOptionsByType[relationType] || [];
    const isCustomRelationKey = relationKey === '__custom__';
    const dayPillarParts = parseDayPillar(dayPillar) || { dayStem: '甲', dayBranch: '子' };
    const { dayStem, dayBranch } = dayPillarParts;
    const actorTenStar = getTenStar(dayStem, actorChar.trim());
    const targetTenStar = getTenStar(dayStem, targetChar.trim());
    const tenStarPair = actorTenStar && targetTenStar ? `${actorTenStar}-${targetTenStar}` : null;
    const palacePair = `${getPositionLabel(actorPosition)}-${getPositionLabel(targetPosition)}`;
    const actorPositionOptions = getSelectablePositions(actorChar, dayStem, dayBranch);
    const targetPositionOptions = getSelectablePositions(targetChar, dayStem, dayBranch);

    function handleRelationTypeChange(nextRelationType: string) {
        const nextRelationKeyOptions = relationKeyOptionsByType[nextRelationType] || [];

        setRelationType(nextRelationType);
        setRelationKey(nextRelationKeyOptions[0]?.value || '__custom__');
        setCustomRelationKey('');
    }

    function handleDayPillarChange(nextDayPillar: string) {
        const nextDayPillarParts = parseDayPillar(nextDayPillar) || dayPillarParts;

        setDayPillar(nextDayPillar);
        setActorPosition(
            getValidPositionValue(
                actorPosition,
                getSelectablePositions(actorChar, nextDayPillarParts.dayStem, nextDayPillarParts.dayBranch)
            )
        );
        setTargetPosition(
            getValidPositionValue(
                targetPosition,
                getSelectablePositions(targetChar, nextDayPillarParts.dayStem, nextDayPillarParts.dayBranch)
            )
        );
    }

    function handleActorCharChange(nextActorChar: string) {
        setActorChar(nextActorChar);
        setActorPosition(getValidPositionValue(actorPosition, getSelectablePositions(nextActorChar, dayStem, dayBranch)));
    }

    function handleTargetCharChange(nextTargetChar: string) {
        setTargetChar(nextTargetChar);
        setTargetPosition(getValidPositionValue(targetPosition, getSelectablePositions(nextTargetChar, dayStem, dayBranch)));
    }

    useEffect(() => {
        if (!state.success) return;

        alert(state.message);
        router.push('/admin/saju-relations');
        router.refresh();
    }, [router, state]);

    return (
        <form action={formAction} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid gap-5 md:grid-cols-3">
                <label className="block">
                    <span className="mb-2 block text-sm font-bold text-stone-700">관계 유형</span>
                    <select
                        name="relation_type"
                        value={relationType}
                        onChange={(event) => handleRelationTypeChange(event.target.value)}
                        required
                        className="h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
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
                    <input
                        type="hidden"
                        name="relation_key"
                        value={isCustomRelationKey ? customRelationKey : relationKey}
                    />
                    <select
                        value={relationKey}
                        onChange={(event) => setRelationKey(event.target.value)}
                        required
                        className="h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    >
                        {relationKeyOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                        <option value="__custom__">직접 입력</option>
                    </select>
                    {isCustomRelationKey && (
                        <input
                            value={customRelationKey}
                            onChange={(event) => setCustomRelationKey(event.target.value)}
                            placeholder="예: 辰戌沖"
                            required
                            className="mt-2 h-11 w-full rounded-lg border border-stone-300 px-3 text-sm text-stone-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                        />
                    )}
                </label>
                <label className="block">
                    <span className="mb-2 block text-sm font-bold text-stone-700">기준 일주</span>
                    <select
                        name="day_pillar"
                        value={dayPillar}
                        onChange={(event) => handleDayPillarChange(event.target.value)}
                        required
                        className="h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    >
                        {dayPillars.map((pillar) => (
                            <option key={pillar} value={pillar}>
                                {pillar}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-4">
                <InputField
                    label="작용 글자"
                    name="actor_char"
                    value={actorChar}
                    onChange={handleActorCharChange}
                    placeholder="예: 辰"
                    required
                />
                <InputField
                    label="대상 글자"
                    name="target_char"
                    value={targetChar}
                    onChange={handleTargetCharChange}
                    placeholder="예: 戌"
                    required
                />
                <DerivedField
                    label="작용 십신"
                    value={actorTenStar}
                />
                <DerivedField
                    label="대상 십신"
                    value={targetTenStar}
                />
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-4">
                <DerivedField
                    label="십신 조합"
                    value={tenStarPair}
                />
                <ControlledSelectField
                    label="작용 위치"
                    name="actor_position"
                    value={actorPosition}
                    onChange={setActorPosition}
                    options={actorPositionOptions}
                    required
                />
                <ControlledSelectField
                    label="대상 위치"
                    name="target_position"
                    value={targetPosition}
                    onChange={setTargetPosition}
                    options={targetPositionOptions}
                    required
                />
                <DerivedField
                    label="궁위 조합"
                    value={palacePair}
                />
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
                <SelectField
                    label="상태"
                    name="status"
                    defaultValue={reading?.status || 'draft'}
                    options={[
                        { value: 'draft', label: '초안' },
                        { value: 'approved', label: '승인' },
                        { value: 'archived', label: '보관' },
                    ]}
                    required
                />
                <SelectField
                    label="출처"
                    name="source"
                    defaultValue={reading?.source || 'manual'}
                    options={[
                        { value: 'manual', label: '수동 작성' },
                        { value: 'deepseek', label: 'DeepSeek' },
                    ]}
                    required
                />
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
                <InputField
                    label="프롬프트 버전"
                    name="prompt_version"
                    defaultValue={reading?.prompt_version}
                    placeholder="예: relation-v1"
                />
                <InputField
                    label="모델"
                    name="model"
                    defaultValue={reading?.model}
                    placeholder="예: deepseek-chat"
                />
            </div>

            <div className="mt-5">
                <InputField
                    label="화면 제목"
                    name="title"
                    defaultValue={reading?.title}
                    placeholder="예: 甲子日柱의 일지-년지 子午沖"
                    required
                />
            </div>

            <div className="mt-5">
                <TextareaField
                    label="짧은 요약"
                    name="summary"
                    defaultValue={reading?.summary}
                    rows={3}
                    required
                />
            </div>

            <div className="mt-5">
                <TextareaField
                    label="상세 해설"
                    name="detail"
                    defaultValue={reading?.detail}
                    rows={8}
                    required
                />
            </div>

            {state.message && !state.success && (
                <p className="mt-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {state.message}
                </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Link
                    href="/admin/saju-relations"
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-stone-300 bg-white px-4 text-sm font-bold text-stone-600 transition-colors hover:bg-stone-50"
                >
                    취소
                </Link>
                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-stone-800 px-5 text-sm font-bold text-white transition-colors hover:bg-stone-700 disabled:cursor-wait disabled:opacity-60"
                >
                    <Save size={16} />
                    {isPending ? '저장 중' : mode === 'edit' ? '수정 저장' : '신규 등록'}
                </button>
            </div>
        </form>
    );
}

function InputField({
    label,
    name,
    defaultValue,
    value,
    onChange,
    placeholder,
    required = false,
}: {
    label: string;
    name: string;
    defaultValue?: string | null;
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    required?: boolean;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-bold text-stone-700">{label}</span>
            <input
                name={name}
                defaultValue={value === undefined ? defaultValue || '' : undefined}
                value={value}
                onChange={onChange ? (event) => onChange(event.target.value) : undefined}
                placeholder={placeholder}
                required={required}
                className="h-11 w-full rounded-lg border border-stone-300 px-3 text-sm text-stone-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
        </label>
    );
}

function DerivedField({
    label,
    value,
}: {
    label: string;
    value: string | null;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-bold text-stone-700">{label}</span>
            <input
                value={value || '자동 계산 불가'}
                readOnly
                className="h-11 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm text-stone-500 outline-none"
            />
        </label>
    );
}

function SelectField({
    label,
    name,
    defaultValue,
    options,
    required = false,
}: {
    label: string;
    name: string;
    defaultValue?: string;
    options: { value: string; label: string }[];
    required?: boolean;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-bold text-stone-700">{label}</span>
            <select
                name={name}
                defaultValue={defaultValue}
                required={required}
                className="h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function ControlledSelectField({
    label,
    name,
    value,
    onChange,
    options,
    required = false,
}: {
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    required?: boolean;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-bold text-stone-700">{label}</span>
            <select
                name={name}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                required={required}
                className="h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function TextareaField({
    label,
    name,
    defaultValue,
    rows,
    required = false,
}: {
    label: string;
    name: string;
    defaultValue?: string | null;
    rows: number;
    required?: boolean;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-bold text-stone-700">{label}</span>
            <textarea
                name={name}
                defaultValue={defaultValue || ''}
                rows={rows}
                required={required}
                className="w-full resize-y rounded-lg border border-stone-300 px-3 py-3 text-sm leading-7 text-stone-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
        </label>
    );
}
