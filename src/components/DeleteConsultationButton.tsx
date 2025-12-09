'use client';

import { deleteConsultation } from '@/lib/actions';
import { Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';

export default function DeleteConsultationButton({ id }: { id: number }) {
    const [isPending, startTransition] = useTransition();
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = async () => {
        startTransition(async () => {
            const result = await deleteConsultation(id);
            if (!result.success) {
                alert(result.message);
            }
            setShowConfirm(false);
        });
    };

    if (showConfirm) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 font-medium">정말 삭제하시겠습니까?</span>
                <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                >
                    {isPending ? '삭제 중...' : '확인'}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    disabled={isPending}
                    className="text-xs bg-stone-200 text-stone-600 px-2 py-1 rounded hover:bg-stone-300"
                >
                    취소
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="text-stone-400 hover:text-red-500 transition-colors p-1"
            title="삭제"
        >
            <Trash2 size={16} />
        </button>
    );
}
