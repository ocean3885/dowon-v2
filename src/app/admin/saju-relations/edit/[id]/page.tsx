import SajuRelationReadingForm from '@/components/admin/SajuRelationReadingForm';
import {
    updateSajuRelationReading,
    type SajuRelationReading,
} from '@/lib/actions';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getSajuRelationReading(id: number) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('saju_relation_readings')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) return null;

    return data as SajuRelationReading;
}

export default async function EditSajuRelationReadingPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const readingId = Number(id);

    if (!Number.isFinite(readingId)) {
        notFound();
    }

    const reading = await getSajuRelationReading(readingId);
    if (!reading) {
        notFound();
    }

    const updateAction = updateSajuRelationReading.bind(null, reading.id);

    return (
        <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-stone-800">사주 관계 해설 수정</h2>
                    <p className="mt-1 text-sm text-stone-500">#{reading.id} · {reading.title}</p>
                </div>
                <Link
                    href="/admin/saju-relations"
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-stone-300 bg-white px-4 text-sm font-bold text-stone-600 hover:bg-stone-50"
                >
                    목록으로
                </Link>
            </div>

            <SajuRelationReadingForm mode="edit" reading={reading} action={updateAction} />
        </div>
    );
}
