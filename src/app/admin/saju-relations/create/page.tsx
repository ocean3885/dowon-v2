import SajuRelationBatchGenerator from '@/components/admin/SajuRelationBatchGenerator';
import Link from 'next/link';

export default function CreateSajuRelationReadingPage() {
    return (
        <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-stone-800">사주 관계 해설 생성</h2>
                    <p className="mt-1 text-sm text-stone-500">관계 유형, 관계 키, 기준 일주를 선택해 생성 가능한 조합을 확인합니다.</p>
                </div>
                <Link
                    href="/admin/saju-relations"
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-stone-300 bg-white px-4 text-sm font-bold text-stone-600 hover:bg-stone-50"
                >
                    목록으로
                </Link>
            </div>

            <SajuRelationBatchGenerator />
        </div>
    );
}
