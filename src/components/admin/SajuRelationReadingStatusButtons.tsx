'use client';

import { updateSajuRelationReadingStatus } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

const statusOptions = [
    { value: 'draft', label: '초안', activeClass: 'border-amber-300 bg-amber-100 text-amber-800' },
    { value: 'approved', label: '승인', activeClass: 'border-emerald-300 bg-emerald-100 text-emerald-800' },
    { value: 'archived', label: '보관', activeClass: 'border-stone-300 bg-stone-100 text-stone-700' },
];

export default function SajuRelationReadingStatusButtons({
    id,
    status,
}: {
    id: number;
    status: string;
}) {
    const router = useRouter();
    const [currentStatus, setCurrentStatus] = useState(status);
    const [isPending, startTransition] = useTransition();

    function handleStatusChange(nextStatus: string) {
        if (nextStatus === currentStatus || isPending) return;

        const previousStatus = currentStatus;
        setCurrentStatus(nextStatus);

        startTransition(async () => {
            const result = await updateSajuRelationReadingStatus(id, nextStatus);
            if (!result.success) {
                setCurrentStatus(previousStatus);
                alert(result.message);
                return;
            }

            router.refresh();
        });
    }

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {statusOptions.map((option) => {
                const isActive = currentStatus === option.value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        disabled={isPending}
                        onClick={() => handleStatusChange(option.value)}
                        className={`h-8 rounded-full border px-3 text-xs font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${
                            isActive
                                ? option.activeClass
                                : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:bg-stone-50 hover:text-stone-700'
                        }`}
                        aria-pressed={isActive}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
