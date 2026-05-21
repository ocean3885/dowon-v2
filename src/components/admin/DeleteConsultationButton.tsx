'use client';

import { deleteConsultation } from '@/lib/actions';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export default function DeleteConsultationButton({ id }: { id: number }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = async () => {
        startTransition(async () => {
            const result = await deleteConsultation(id);
            if (!result.success) {
                alert(result.message);
                return;
            }
            setShowConfirm(false);
            router.refresh();
        });
    };

    if (showConfirm) {
        return (
            <div className="flex items-center gap-1 rounded-full border border-red-100 bg-red-50 p-0.5">
                <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="h-8 rounded-full bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                    {isPending ? '삭제 중' : '삭제'}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    disabled={isPending}
                    className="h-8 rounded-full px-3 text-sm font-semibold text-stone-500 hover:bg-white disabled:opacity-50"
                >
                    취소
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 text-stone-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
            title="삭제"
        >
            <Trash2 size={16} />
        </button>
    );
}
