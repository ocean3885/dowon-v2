import { redirect } from 'next/navigation';
import { getConsultations, type AdminSubmitApplication } from '@/lib/actions';
import SubmitApplicationList from '@/components/admin/SubmitApplicationList';

export default async function AdminPage() {
    let consultations: AdminSubmitApplication[] = [];
    try {
        consultations = await getConsultations();
    } catch {
        redirect('/login');
    }

    return (
        <>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-stone-700">상담 신청 목록</h2>
            </div>

            <SubmitApplicationList consultations={consultations} />
        </>
    );
}
