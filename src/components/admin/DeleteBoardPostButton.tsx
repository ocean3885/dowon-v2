'use client';

import { deleteBoardPost } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export default function DeleteBoardPostButton({ id }: { id: number }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteBoardPost(id);

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
            <div className="flex items-center justify-end gap-2">
                <span className="text-xs text-stone-500">삭제할까요?</span>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isPending}
                    className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                    {isPending ? '삭제 중...' : '확인'}
                </button>
                <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    disabled={isPending}
                    className="rounded bg-stone-200 px-2 py-1 text-xs font-medium text-stone-700 hover:bg-stone-300 disabled:opacity-50"
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
            className="text-red-500 hover:text-red-700 text-sm font-medium"
        >
            삭제
        </button>
    );
}