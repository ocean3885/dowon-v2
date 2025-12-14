'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud } from 'lucide-react';

export default function BulkImportButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleImport = async () => {
        if (!confirm('일주론 데이터 60개를 일괄 등록하시겠습니까?\n이 작업은 시간이 조금 걸릴 수 있습니다.')) return;

        setLoading(true);
        try {
            const res = await fetch('/api/admin/imports/iljuron', { method: 'POST' });
            const data = await res.json();

            if (res.ok) {
                alert(`${data.count}건의 데이터가 성공적으로 등록드었습니다.`);
                router.refresh();
            } else {
                alert('등록 실패: ' + (data.error || '알 수 없는 오류'));
            }
        } catch (e) {
            console.error(e);
            alert('오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleImport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-amber-100 border border-amber-200 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors text-sm font-bold disabled:opacity-50"
        >
            <UploadCloud size={16} />
            {loading ? '처리 중...' : '일주론 일괄 등록'}
        </button>
    );
}
