'use client';

import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { deleteAccount } from '@/lib/actions';

export default function DeleteAccountButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState('');
    const [isPending, startTransition] = useTransition();
    const canDelete = confirmText.trim() === '탈퇴';

    const handleDelete = () => {
        if (!canDelete) return;

        setError('');
        startTransition(async () => {
            const result = await deleteAccount();

            if (result?.success === false) {
                setError(result.message || '회원 탈퇴 중 오류가 발생했습니다.');
            }
        });
    };

    if (!isOpen) {
        return (
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex h-11 w-full items-center justify-between rounded-md border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-100"
            >
                회원 탈퇴
                <Trash2 className="h-4 w-4" />
            </button>
        );
    }

    return (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
            <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="min-w-0">
                    <p className="text-sm font-semibold">계정을 삭제합니다.</p>
                    <p className="mt-2 text-xs leading-6 text-red-700">
                        탈퇴 후 로그인할 수 없으며 프로필 정보는 삭제됩니다. 진행하려면 아래에 탈퇴를 입력해주세요.
                    </p>
                </div>
            </div>

            <input
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                placeholder="탈퇴"
                autoComplete="off"
                disabled={isPending}
                className="mt-3 h-10 w-full rounded-md border border-red-200 bg-white px-3 text-sm text-red-950 outline-none transition-colors placeholder:text-red-300 focus:border-red-400 disabled:opacity-70"
            />

            {error && <p className="mt-2 text-xs font-medium text-red-700">{error}</p>}

            <div className="mt-3 flex gap-2">
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={!canDelete || isPending}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-red-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    탈퇴
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setIsOpen(false);
                        setConfirmText('');
                        setError('');
                    }}
                    disabled={isPending}
                    className="inline-flex h-10 items-center justify-center rounded-md border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60"
                >
                    취소
                </button>
            </div>
        </div>
    );
}
