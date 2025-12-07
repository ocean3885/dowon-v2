'use server';

import { getDb } from './db';
import { revalidatePath } from 'next/cache';

export async function submitLead(formData: FormData) {
    const name = formData.get('name') as string;
    const birthDate = formData.get('birthDate') as string;
    const contact = formData.get('contact') as string;
    const serviceType = formData.get('serviceType') as string;
    const notes = formData.get('notes') as string;

    if (!name || !contact || !serviceType) {
        return { success: false, message: '필수 항목을 입력해주세요.' };
    }

    try {
        const db = await getDb();
        await db.run(
            'INSERT INTO consultations (name, birthDate, contact, serviceType, notes) VALUES (?, ?, ?, ?, ?)',
            name,
            birthDate,
            contact,
            serviceType,
            notes
        );

        revalidatePath('/admin'); // If we had an admin page
        return { success: true, message: '상담 신청이 완료되었습니다. 곧 연락드리겠습니다.' };
    } catch (error) {
        console.error('Database error:', error);
        return { success: false, message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' };
    }
}
