'use client';

import { updateSubmitStatus } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

const statusOptions = [
    { value: 'pending', label: '접수', activeClass: 'border-amber-300 bg-amber-100 text-amber-800' },
    { value: 'contacted', label: '연락완료', activeClass: 'border-blue-300 bg-blue-100 text-blue-800' },
    { value: 'completed', label: '상담완료', activeClass: 'border-emerald-300 bg-emerald-100 text-emerald-800' },
    { value: 'cancelled', label: '취소', activeClass: 'border-red-300 bg-red-100 text-red-800' },
];

export default function SubmitStatusButtons({ id, status }: { id: number; status: string }) {
    const router = useRouter();
    const [currentStatus, setCurrentStatus] = useState(status);
    const [isPending, startTransition] = useTransition();

    function handleStatusChange(nextStatus: string) {
        if (nextStatus === currentStatus || isPending) return;

        const previousStatus = currentStatus;
        setCurrentStatus(nextStatus);

        startTransition(async () => {
            const result = await updateSubmitStatus(id, nextStatus);
            if (!result.success) {
                setCurrentStatus(previousStatus);
                alert(result.message);
                return;
            }

            router.refresh();
        });
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-semibold text-stone-400">진행</span>
            {statusOptions.map((option) => {
                const isActive = currentStatus === option.value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        disabled={isPending}
                        onClick={() => handleStatusChange(option.value)}
                        className={`h-9 rounded-full border px-3.5 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${
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
