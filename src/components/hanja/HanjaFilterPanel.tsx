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

export default function HanjaFilterPanel({
    search,
    soundValue,
    elementValue,
    strokes: activeStrokes,
    soundGroups,
    elementGroups,
}: HanjaFilterPanelProps) {
    const router = useRouter();
    const [strokes, setStrokes] = useState(activeStrokes ?? MAX_STROKES);

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
        router.push(serialized ? `/hanja?${serialized}` : '/hanja');
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

                <div className="grid gap-4 border-t border-[#f0e7dc] pt-4 lg:grid-cols-[minmax(0,1fr)_360px]">
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

                    <FilterRow label="획수">
                        <div className="grid w-full gap-2">
                            <div className="flex items-center justify-between gap-3 text-xs font-semibold text-[#65584a]">
                                <span>1획</span>
                                <div className="flex items-center gap-2">
                                    <span>{activeStrokes === null ? '전체' : `${strokes}획`}</span>
                                    {activeStrokes !== null && (
                                        <button
                                            type="button"
                                            onClick={() => applyFilter({ strokes: null })}
                                            className="rounded-full border border-[#dfd0be] px-2 py-0.5 text-[#7d6650] transition-colors hover:bg-[#f7efe4]"
                                        >
                                            해제
                                        </button>
                                    )}
                                </div>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max={MAX_STROKES}
                                value={strokes}
                                onChange={(event) => setStrokes(Number(event.target.value))}
                                onPointerUp={(event) => applyFilter({ strokes: Number(event.currentTarget.value) })}
                                onKeyUp={(event) => applyFilter({ strokes: Number(event.currentTarget.value) })}
                                className="h-2 w-full cursor-pointer accent-[#ad7b42]"
                            />
                        </div>
                    </FilterRow>
                </div>
            </div>
        </form>
    );
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="grid gap-3 md:grid-cols-[72px_minmax(0,1fr)] md:items-center">
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
