'use server';

import { getDb } from './db';
import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { sendSMS } from './aligo';

export async function submitLead(formData: FormData) {
    const name = formData.get('name') as string;
    const birthDate = formData.get('birthDate') as string;
    const gender = formData.get('gender') as string;
    const birthTime = formData.get('birthTime') as string;
    const contact = formData.get('contact') as string;
    const serviceType = formData.get('serviceType') as string;
    let notes = formData.get('notes') as string;

    // Append extra info to notes to avoid DB schema change
    let extraInfo = '';
    if (gender) extraInfo += `[성별: ${gender === 'male' ? '남성' : '여성'}] `;
    if (birthTime) extraInfo += `[태어난 시간: ${birthTime}] `;

    if (extraInfo) {
        notes = `${extraInfo}\n${notes}`;
    }

    if (!name || !contact || !serviceType) {
        return { success: false, message: '필수 항목을 입력해주세요.' };
    }

    // Get IP Address
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

    try {
        const db = await getDb();

        // 1. IP Rate Limiting Check (Max 3 per 10 mins)
        if (ip !== 'unknown') {
            const ipCount = await db.get(
                `SELECT COUNT(*) as count FROM consultations 
                 WHERE ipAddress = ? 
                 AND createdAt > datetime('now', '-10 minutes')`,
                ip
            );

            if (ipCount && ipCount.count >= 3) {
                return {
                    success: false,
                    message: '너무 많은 요청이 감지되었습니다. 잠시 후 다시 시도해주세요.'
                };
            }
        }

        // 2. Phone Rate Limiting Check
        // Check if there's a submission from the same contact within the last 5 minutes
        const existing = await db.get(
            `SELECT createdAt FROM consultations 
             WHERE contact = ? 
             AND createdAt > datetime('now', '-5 minutes')
             ORDER BY createdAt DESC LIMIT 1`,
            contact
        );

        if (existing) {
            return {
                success: false,
                message: '이미 상담 신청이 접수되었습니다. 추가 접수는 5분 뒤에 가능합니다.'
            };
        }

        // 3. Save to DB
        await db.run(
            'INSERT INTO consultations (name, birthDate, contact, serviceType, notes, ipAddress) VALUES (?, ?, ?, ?, ?, ?)',
            name,
            birthDate,
            contact,
            serviceType,
            notes,
            ip
        );

        // 4. Send SMS Notification
        // Translating serviceType for better readability in SMS
        const serviceTypeMap: Record<string, string> = {
            'saju': '사주 명리',
            'naming': '신생아 작명',
            'rename': '개명',
            'gunghap': '궁합',
            'date': '택일',
            'other': '기타 상담'
        };
        const serviceName = serviceTypeMap[serviceType] || serviceType;

        const smsContent = `[도원철학관 상담신청]
이름: ${name}
연락처: ${contact}
생년월일: ${birthDate}
성별/시간: ${extraInfo.trim() || '미입력'}
신청분야: ${serviceName}
내용: ${notes.replace(extraInfo + '\n', '').substring(0, 500)}${notes.length > 500 ? '...' : ''}`;

        // Fire and forget SMS or await? 
        // Awaiting ensures we know if it failed, but strictly speaking DB success is primary.
        // Let's await to log usage properly, but not fail the user request if SMS fails?
        // User requested: "문자전송도 같이 이루어 지게 코드를 추가해줘"
        // Let's just await it.
        await sendSMS(smsContent);

        revalidatePath('/admin');
        return { success: true, message: '상담 신청이 완료되었습니다. 곧 연락드리겠습니다.' };
    } catch (error) {
        console.error('Database error:', error);
        return { success: false, message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' };
    }
}

export async function deleteConsultation(id: number) {
    const session = (await cookies()).get('admin_session');
    if (!session || session.value !== 'true') {
        return { success: false, message: 'Unauthorized' };
    }

    try {
        const db = await getDb();
        await db.run('DELETE FROM consultations WHERE id = ?', id);
        revalidatePath('/admin');
        return { success: true, message: '삭제되었습니다.' };
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, message: '삭제 중 오류가 발생했습니다.' };
    }
}

export async function login(password: string) {
    if (password === 'dowon1234!') {
        (await cookies()).set('admin_session', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });
        return { success: true };
    }
    return { success: false, message: '비밀번호가 올바르지 않습니다.' };
}

export async function logout() {
    (await cookies()).delete('admin_session');
    redirect('/login');
}

export async function getConsultations() {
    const session = (await cookies()).get('admin_session');
    if (!session || session.value !== 'true') {
        throw new Error('Unauthorized');
    }

    const db = await getDb();
    return db.all('SELECT * FROM consultations ORDER BY createdAt DESC');
}

// Blog Actions

export async function createBlogPost(formData: FormData) {
    const session = (await cookies()).get('admin_session');
    if (!session || session.value !== 'true') return { success: false, message: 'Unauthorized' };

    const title = formData.get('title') as string;
    const summary = formData.get('summary') as string;
    const contentUrl = formData.get('contentUrl') as string;
    const thumbnailUrl = formData.get('thumbnailUrl') as string;
    const category = formData.get('category') as string;
    const publishedDate = formData.get('publishedDate') as string;

    if (!title || !contentUrl) {
        return { success: false, message: '제목과 링크는 필수입니다.' };
    }

    try {
        const db = await getDb();
        await db.run(
            'INSERT INTO blog_posts (title, summary, contentUrl, thumbnailUrl, category, publishedDate) VALUES (?, ?, ?, ?, ?, ?)',
            title, summary, contentUrl, thumbnailUrl, category, publishedDate
        );
        revalidatePath('/admin/blog');
        revalidatePath('/');
        return { success: true, message: '게시물이 등록되었습니다.' };
    } catch (error) {
        console.error('Blog create error:', error);
        return { success: false, message: '등록 실패' };
    }
}

export async function updateBlogPost(formData: FormData) {
    const session = (await cookies()).get('admin_session');
    if (!session || session.value !== 'true') return { success: false, message: 'Unauthorized' };

    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const summary = formData.get('summary') as string;
    const contentUrl = formData.get('contentUrl') as string;
    const thumbnailUrl = formData.get('thumbnailUrl') as string;
    const category = formData.get('category') as string;
    const publishedDate = formData.get('publishedDate') as string;

    if (!id || !title || !contentUrl) {
        return { success: false, message: '필수 항목을 입력해주세요.' };
    }

    try {
        const db = await getDb();
        await db.run(
            'UPDATE blog_posts SET title = ?, summary = ?, contentUrl = ?, thumbnailUrl = ?, category = ?, publishedDate = ? WHERE id = ?',
            title, summary, contentUrl, thumbnailUrl, category, publishedDate, id
        );
        revalidatePath('/admin/blog');
        revalidatePath('/');
        return { success: true, message: '게시물이 수정되었습니다.' };
    } catch (error) {
        console.error('Blog update error:', error);
        return { success: false, message: '수정 실패' };
    }
}

export async function getBlogPosts() {
    // Admin view - get all
    const session = (await cookies()).get('admin_session');
    if (!session || session.value !== 'true') throw new Error('Unauthorized');

    const db = await getDb();
    return db.all('SELECT * FROM blog_posts ORDER BY publishedDate DESC, createdAt DESC');
}

export async function getSelectedBlogPosts() {
    // Public view - get only selected (limit 4)
    const db = await getDb();
    return db.all('SELECT * FROM blog_posts WHERE isSelected = 1 ORDER BY publishedDate DESC LIMIT 4');
}

export async function toggleBlogPostSelection(id: number) {
    const session = (await cookies()).get('admin_session');
    if (!session || session.value !== 'true') return { success: false };

    try {
        const db = await getDb();
        // Check current state
        const post = await db.get('SELECT isSelected FROM blog_posts WHERE id = ?', id);
        const newState = post.isSelected ? 0 : 1;

        await db.run('UPDATE blog_posts SET isSelected = ? WHERE id = ?', newState, id);
        revalidatePath('/admin/blog');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function deleteBlogPost(id: number) {
    const session = (await cookies()).get('admin_session');
    if (!session || session.value !== 'true') return { success: false };

    try {
        const db = await getDb();
        await db.run('DELETE FROM blog_posts WHERE id = ?', id);
        revalidatePath('/admin/blog');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}
