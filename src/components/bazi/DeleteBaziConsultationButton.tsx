'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteFreeBaziConsultation } from '@/lib/actions';

export function DeleteBaziConsultationButton({ id }: { id: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteFreeBaziConsultation(id);

            if (!result.success) {
                alert(result.message || '삭제 실패');
                return;
            }

            setShowConfirm(false);
            router.refresh();
        });
    };

    if (showConfirm) {
        return (
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-[#8a7d70]">삭제할까요?</span>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isPending}
                    className="rounded bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
                >
                    {isPending ? '삭제 중' : '확인'}
                </button>
                <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    disabled={isPending}
                    className="rounded bg-[#eee2d3] px-2.5 py-1.5 text-xs font-semibold text-[#5f554c] transition-colors hover:bg-[#e2d2bd] disabled:opacity-60"
                >
                    취소
                </button>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-100"
            aria-label="무료 사주 원국 해설 삭제"
        >
            <Trash2 className="h-3.5 w-3.5" />
            삭제
        </button>
    );
}
