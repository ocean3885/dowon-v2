'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type ReactNode, useState } from 'react';

type FilterGroup = {
    label: string;
    value: string;
    dot?: string;
};

type HanjaFilterPanelProps = {
    search: string;
    soundValue: string;
    elementValue: string;
    strokes: number | null;
    soundGroups: readonly FilterGroup[];
    elementGroups: readonly FilterGroup[];
};

const MAX_STROKES = 30;
const strokeOptions = Array.from({ length: MAX_STROKES }, (_, index) => index + 1);
const strokeGroups = [
    { label: '1-5획', min: 1, max: 5 },
    { label: '6-10획', min: 6, max: 10 },
    { label: '11-15획', min: 11, max: 15 },
    { label: '16-20획', min: 16, max: 20 },
    { label: '21-30획', min: 21, max: MAX_STROKES },
] as const;

type StrokeGroup = (typeof strokeGroups)[number];

export default function HanjaFilterPanel({
    search,
    soundValue,
    elementValue,
    strokes: activeStrokes,
    soundGroups,
    elementGroups,
}: HanjaFilterPanelProps) {
    const router = useRouter();
    const [openStrokeGroup, setOpenStrokeGroup] = useState<StrokeGroup | null>(() => getStrokeGroup(activeStrokes));
    const activeStrokeGroup = getStrokeGroup(activeStrokes);

    const applyFilter = (next: { sound?: string; element?: string; strokes?: number | null }) => {
        const query = new URLSearchParams();
        const nextSound = next.sound ?? soundValue;
        const nextElement = next.element ?? elementValue;
        const nextStrokes = next.strokes === undefined ? activeStrokes : next.strokes;

        if (search) query.set('search', search);
        if (nextSound !== 'all') query.set('sound', nextSound);
        if (nextElement !== 'all') query.set('element', nextElement);
        if (nextStrokes !== null) query.set('strokes', String(nextStrokes));

        const serialized = query.toString();
        router.push(serialized ? `/hanja?${serialized}` : '/hanja', { scroll: false });
    };

    return (
        <form action="/hanja" className="rounded-lg border border-[#ddd1c2] bg-white/90 p-4 shadow-[0_22px_60px_rgba(66,50,33,0.1)] backdrop-blur sm:p-6">
            {activeStrokes !== null && <input type="hidden" name="strokes" value={activeStrokes} />}

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_170px]">
                <label className="relative block">
                    <span className="sr-only">한자 검색</span>
                    <input
                        name="search"
                        defaultValue={search}
                        placeholder="한자 / 음 / 뜻으로 검색하세요"
                        className="h-14 w-full rounded-md border border-[#e5dbcf] bg-white px-5 pr-14 text-sm text-[#241c15] shadow-inner outline-none transition-colors placeholder:text-[#b0a396] focus:border-[#ae7d45]"
                    />
                    <Search className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#473a2d]" />
                </label>
                <button className="inline-flex h-14 items-center justify-center gap-2 rounded-md border border-[#cdb99c] bg-[#fcfaf6] px-5 text-sm font-semibold text-[#554638] transition-colors hover:bg-[#f5eadb]">
                    <SlidersHorizontal className="h-4 w-4" />
                    검색 적용
                </button>
            </div>

            <div className="mt-5 grid gap-4 border-t border-[#eee4d8] pt-5">
                <FilterRow label="음(독음)">
                    <div className="flex flex-wrap gap-2">
                        {soundGroups.map((group) => (
                            <FilterChoice
                                key={group.value}
                                name="sound"
                                value={group.value}
                                label={group.label}
                                checked={soundValue === group.value}
                                onChange={() => applyFilter({ sound: group.value })}
                            />
                        ))}
                    </div>
                </FilterRow>

                <div className="grid gap-4 border-t border-[#f0e7dc] pt-4">
                    <FilterRow label="오행">
                        <div className="flex flex-wrap gap-2">
                            {elementGroups.map((group) => (
                                <FilterChoice
                                    key={group.value}
                                    name="element"
                                    value={group.value}
                                    label={group.label}
                                    dot={group.dot}
                                    checked={elementValue === group.value}
                                    onChange={() => applyFilter({ element: group.value })}
                                />
                            ))}
                        </div>
                    </FilterRow>

                    <FilterRow label="획수" separated>
                        <div className="grid w-full gap-3">
                            <div className="flex flex-wrap gap-2">
                                <StrokeChoice
                                    label="전체"
                                    selected={activeStrokes === null}
                                    onClick={() => {
                                        setOpenStrokeGroup(null);
                                        applyFilter({ strokes: null });
                                    }}
                                />
                                {strokeGroups.map((group) => (
                                    <StrokeChoice
                                        key={group.label}
                                        label={group.label}
                                        selected={activeStrokeGroup?.label === group.label}
                                        expanded={openStrokeGroup?.label === group.label}
                                        onClick={() => setOpenStrokeGroup(group)}
                                    />
                                ))}
                            </div>

                            {openStrokeGroup && (
                                <div className="rounded-md border border-[#eee3d8] bg-[#fcfaf6] p-2.5">
                                    <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                                        {getStrokeOptions(openStrokeGroup).map((stroke) => (
                                            <StrokeChoice
                                                key={stroke}
                                                label={`${stroke}획`}
                                                selected={activeStrokes === stroke}
                                                onClick={() => applyFilter({ strokes: stroke })}
                                                compact
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </FilterRow>
                </div>
            </div>
        </form>
    );
}

function StrokeChoice({
    label,
    selected,
    onClick,
    compact = false,
    expanded = false,
}: {
    label: string;
    selected: boolean;
    onClick: () => void;
    compact?: boolean;
    expanded?: boolean;
}) {
    return (
        <button
            type="button"
            aria-pressed={selected}
            aria-expanded={expanded || undefined}
            onClick={onClick}
            className={`${compact ? 'h-9 px-1 text-xs' : 'h-9 px-3 text-sm'} rounded-md border transition-colors ${
                selected
                    ? 'border-[#b68853] bg-[#f7efe4] font-semibold text-[#48392b]'
                    : expanded
                        ? 'border-[#c9a06f] bg-[#fff7ec] text-[#5f4935]'
                    : 'border-[#eadfd3] bg-[#fffdf9] text-[#786b5e] hover:bg-[#f7efe4]'
            }`}
        >
            {label}
        </button>
    );
}

function getStrokeGroup(strokes: number | null) {
    if (strokes === null) return null;
    return strokeGroups.find((group) => strokes >= group.min && strokes <= group.max) || null;
}

function getStrokeOptions(group: StrokeGroup) {
    return strokeOptions.filter((stroke) => stroke >= group.min && stroke <= group.max);
}

function FilterRow({ label, children, separated = false }: { label: string; children: ReactNode; separated?: boolean }) {
    return (
        <div className={`${separated ? 'border-t border-[#f0e7dc] pt-4' : ''} grid gap-3 md:grid-cols-[72px_minmax(0,1fr)] md:items-center`}>
            <p className="text-sm font-semibold text-[#534538]">{label}</p>
            {children}
        </div>
    );
}

function FilterChoice({
    name,
    value,
    label,
    checked,
    dot,
    onChange,
}: {
    name: string;
    value: string;
    label: string;
    checked: boolean;
    dot?: string;
    onChange: () => void;
}) {
    return (
        <label className="cursor-pointer">
            <input
                name={name}
                value={value}
                type="radio"
                checked={checked}
                onChange={onChange}
                className="peer sr-only"
            />
            <span className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-[#eadfd3] bg-[#fffdf9] px-4 text-sm text-[#786b5e] transition-colors peer-checked:border-[#b68853] peer-checked:bg-[#f7efe4] peer-checked:font-semibold peer-checked:text-[#48392b]">
                {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
                {label}
            </span>
        </label>
    );
}
