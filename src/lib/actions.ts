'use server';

import { randomBytes, scryptSync } from 'crypto';
import { createClient, createAdminClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { sendSMS } from './aligo';

type RecentPostRow = {
    id: number;
    title: string;
    content: string | null;
    category_id: number | null;
    categories?: { name?: string | null } | null;
    image_url: string | null;
    published_at: string | null;
    thumbnail_url: string | null;
    updated_at: string | null;
    view_count: number | null;
};

type SubmitApplicationState = {
    success: boolean;
    message: string;
};

type ConsultationTarget = {
    name: string | null;
    birthDate: string;
    calendarType: string;
    gender: string;
    birthTimeAccuracy: string;
    birthTime: string | null;
};

type ServiceDetails = Record<string, string | null>;

const submitServiceLabels: Record<string, string> = {
    saju: '사주 종합 상담',
    love: '연애 · 결혼 상담',
    career: '진로 · 직업 상담',
    wealth: '사업 · 재물 상담',
    naming: '작명 · 개명 상담',
    moving: '이사 · 택일 상담',
};

const calendarTypeLabels: Record<string, string> = {
    solar: '양력',
    lunar: '음력',
    leap_lunar: '음력윤달',
};

const birthTimeAccuracyLabels: Record<string, string> = {
    exact: '알고 있음',
    approximate: '대략 앎',
    unknown: '모름',
};

function hashApplicationPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');

    return `${salt}:${hash}`;
}

function getFormString(formData: FormData, name: string, fallback = '') {
    return String(formData.get(name) || fallback).trim();
}

function buildBirthTime(formData: FormData, prefix: string) {
    const period = getFormString(formData, `${prefix}BirthTimePeriod`);
    const hour = getFormString(formData, `${prefix}BirthTimeHour`);
    const minute = getFormString(formData, `${prefix}BirthTimeMinute`, '00');

    if (!period || !hour) return '';

    return `${hour}시 ${minute}분`;
}

function buildConsultationTarget(formData: FormData, index: 1 | 2): ConsultationTarget | null {
    const prefix = `target${index}`;
    const name = getFormString(formData, `${prefix}Name`);
    const birthDate = getFormString(formData, `${prefix}BirthDate`);
    const calendarType = getFormString(formData, `${prefix}CalendarType`, index === 1 ? 'solar' : '');
    const gender = getFormString(formData, `${prefix}Gender`);
    const birthTimeAccuracy = getFormString(formData, `${prefix}BirthTimeAccuracy`, index === 1 ? 'exact' : '');
    const birthTime = buildBirthTime(formData, prefix);
    const hasAnyValue = Boolean(name || birthDate || calendarType || gender || birthTimeAccuracy || birthTime);

    if (!hasAnyValue) return null;

    return {
        name: name || null,
        birthDate,
        calendarType,
        gender,
        birthTimeAccuracy,
        birthTime: birthTime || null,
    };
}

function buildServiceDetails(formData: FormData, serviceType: string): ServiceDetails | null {
    if (serviceType !== 'naming') return null;

    return {
        familyName: getFormString(formData, 'namingFamilyName'),
        generationNameUsage: getFormString(formData, 'namingGenerationNameUsage', 'use'),
        generationName: getFormString(formData, 'namingGenerationName') || null,
        preferredNames: getFormString(formData, 'namingPreferredNames') || null,
        hanjaUsage: getFormString(formData, 'namingHanjaUsage', 'optional'),
        avoidedNames: getFormString(formData, 'namingAvoidedNames') || null,
        additionalRequests: getFormString(formData, 'namingAdditionalRequests') || null,
    };
}

function formatServiceDetailsForSms(details: ServiceDetails | null) {
    if (!details) return '';

    const generationNameUsage = details.generationNameUsage === 'none' ? '없음' : '사용';
    const hanjaUsageLabels: Record<string, string> = {
        required: '필수',
        optional: '상관없음',
        hangul: '한글 이름',
    };

    return `
작명/개명 세부:
성: ${details.familyName || '미입력'}
돌림자: ${generationNameUsage}${details.generationName ? ` (${details.generationName})` : ''}
선호 이름: ${details.preferredNames || '미입력'}
한자 사용: ${details.hanjaUsage ? hanjaUsageLabels[details.hanjaUsage] || details.hanjaUsage : '미입력'}
피하고 싶은 이름/한자: ${details.avoidedNames || '미입력'}
추가 요청: ${details.additionalRequests || '미입력'}`;
}

export async function submitApplication(
    _prevState: SubmitApplicationState,
    formData: FormData
): Promise<SubmitApplicationState> {
    const applicantName = getFormString(formData, 'applicantName');
    const applicantPhone = getFormString(formData, 'applicantPhone');
    const applicantEmail = getFormString(formData, 'applicantEmail');
    const applicationPassword = getFormString(formData, 'applicationPassword');
    const consultationTargets = [buildConsultationTarget(formData, 1), buildConsultationTarget(formData, 2)].filter(
        (target): target is ConsultationTarget => Boolean(target)
    );
    const serviceType = getFormString(formData, 'serviceType');
    const serviceDetails = buildServiceDetails(formData, serviceType);
    const concern = getFormString(formData, 'concern');
    const privacyAgreed = formData.get('privacyAgreed') === 'on';

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!applicantName || !applicantPhone) {
        return { success: false, message: '필수 항목을 입력해주세요.' };
    }

    if (!user && !applicationPassword) {
        return { success: false, message: '비회원 신청서 확인 비밀번호를 입력해주세요.' };
    }

    if (applicationPassword && applicationPassword.length < 4) {
        return { success: false, message: '신청서 확인 비밀번호는 4자 이상 입력해주세요.' };
    }

    if (consultationTargets.length === 0) {
        return { success: false, message: '상담대상 정보를 입력해주세요.' };
    }

    const hasInvalidTarget = consultationTargets.some(
        (target) =>
            !target.birthDate ||
            !target.calendarType ||
            !target.gender ||
            !target.birthTimeAccuracy ||
            (target.birthTimeAccuracy !== 'unknown' && !target.birthTime)
    );

    if (hasInvalidTarget) {
        return { success: false, message: '상담대상의 생년월일, 성별, 출생 시간 정보를 입력해주세요.' };
    }

    if (!serviceType) {
        return { success: false, message: '상담 종류를 선택해주세요.' };
    }

    if (serviceType === 'naming' && !serviceDetails?.familyName) {
        return { success: false, message: '작명 · 개명 상담은 성(姓)을 입력해주세요.' };
    }

    if (!privacyAgreed) {
        return { success: false, message: '개인정보 수집 및 이용에 동의해주세요.' };
    }

    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
    const userAgent = headersList.get('user-agent') || null;

    try {
        const adminSupabase = await createAdminClient();

        if (ip !== 'unknown') {
            const { count: ipCount, error: ipCountError } = await adminSupabase
                .from('submits')
                .select('*', { count: 'exact', head: true })
                .eq('ip_address', ip)
                .gt('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString());

            if (ipCountError) throw ipCountError;

            if (ipCount && ipCount >= 3) {
                return {
                    success: false,
                    message: '너무 많은 요청이 감지되었습니다. 잠시 후 다시 시도해주세요.',
                };
            }
        }

        const { data: recentPhone, error: recentPhoneError } = await adminSupabase
            .from('submits')
            .select('created_at')
            .eq('applicant_phone', applicantPhone)
            .gt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (recentPhoneError) throw recentPhoneError;

        if (recentPhone) {
            return {
                success: false,
                message: '이미 상담 신청이 접수되었습니다. 추가 접수는 5분 뒤에 가능합니다.',
            };
        }

        const { error: insertError } = await adminSupabase
            .from('submits')
            .insert({
                applicant_name: applicantName,
                applicant_phone: applicantPhone,
                applicant_email: applicantEmail || null,
                user_id: user?.id || null,
                application_password_hash: applicationPassword ? hashApplicationPassword(applicationPassword) : null,
                consultation_targets: consultationTargets,
                service_type: serviceType,
                service_details: serviceDetails,
                concern: concern || null,
                privacy_agreed: privacyAgreed,
                ip_address: ip,
                user_agent: userAgent,
            });

        if (insertError) throw insertError;

        const serviceName = submitServiceLabels[serviceType] || serviceType;
        const serviceDetailSummary = formatServiceDetailsForSms(serviceDetails);
        const targetSummary = consultationTargets
            .map((target, index) => {
                const targetName = target.name || '이름 미입력';
                const calendarTypeName = calendarTypeLabels[target.calendarType] || target.calendarType;
                const genderName = target.gender === 'male' ? '남성' : '여성';
                const timeAccuracyName = birthTimeAccuracyLabels[target.birthTimeAccuracy] || target.birthTimeAccuracy;

                return `${index + 1}. ${targetName} / ${target.birthDate}(${calendarTypeName}) / ${genderName} / ${timeAccuracyName}${target.birthTime ? ` ${target.birthTime}` : ''}`;
            })
            .join('\n');

        await sendSMS(`[도원 상담신청]
신청인: ${applicantName}
연락처: ${applicantPhone}
이메일: ${applicantEmail || '미입력'}
상담대상:
${targetSummary}
상담종류: ${serviceName}
${serviceDetailSummary}
내용: ${concern.substring(0, 500)}${concern.length > 500 ? '...' : ''}`);

        revalidatePath('/submit');
        revalidatePath('/my/applications');
        revalidatePath('/admin');
    } catch (error) {
        console.error('Submit application error:', error);
        return { success: false, message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' };
    }

    redirect('/submit/complete');
}

export async function submitLead(formData: FormData) {
    const name = formData.get('name') as string;
    const birthDate = formData.get('birthDate') as string;
    const gender = formData.get('gender') as string;
    const birthTime = formData.get('birthTime') as string;
    const calendarType = formData.get('calendarType') as string; // 'solar', 'lunar', or 'leap_lunar'
    const contact = formData.get('contact') as string;
    const serviceType = formData.get('serviceType') as string;
    const notes = formData.get('notes') as string;

    if (!name || !contact || !serviceType) {
        return { success: false, message: '필수 항목을 입력해주세요.' };
    }

    // Get IP Address
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

    try {
        const supabase = await createClient();

        // 1. IP Rate Limiting Check (Max 3 per 10 mins)
        if (ip !== 'unknown') {
            const { count: ipCount } = await supabase
                .from('consultations')
                .select('*', { count: 'exact', head: true })
                .eq('ip_address', ip)
                .gt('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString());

            if (ipCount && ipCount >= 3) {
                return {
                    success: false,
                    message: '너무 많은 요청이 감지되었습니다. 잠시 후 다시 시도해주세요.'
                };
            }
        }

        // 2. Phone Rate Limiting Check
        const { data: existing } = await supabase
            .from('consultations')
            .select('created_at')
            .eq('contact', contact)
            .gt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (existing) {
            return {
                success: false,
                message: '이미 상담 신청이 접수되었습니다. 추가 접수는 5분 뒤에 가능합니다.'
            };
        }

        // 3. Save to DB
        // Use admin client to bypass RLS for public submissions through server actions
        const adminSupabase = await createAdminClient();
        const { error: insertError } = await adminSupabase
            .from('consultations')
            .insert({
                name,
                gender,
                birth_date: birthDate,
                birth_time: birthTime,
                calendar_type: calendarType,
                contact,
                service_type: serviceType,
                notes,
                ip_address: ip
            });

        if (insertError) throw insertError;

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
성별/시간: ${gender === 'male' ? '남성' : '여성'}/${birthTime || '미입력'}
신청분야: ${serviceName}
내용: ${notes?.substring(0, 500)}${notes?.length > 500 ? '...' : ''}`;

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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: 'Unauthorized' };
    }

    try {
        const { error } = await supabase
            .from('consultations')
            .delete()
            .eq('id', id);
        
        if (error) throw error;

        revalidatePath('/admin');
        return { success: true, message: '삭제되었습니다.' };
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, message: '삭제 중 오류가 발생했습니다.' };
    }
}

export async function deleteSubmitApplication(id: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: '로그인이 필요합니다.' };
    }

    try {
        const adminSupabase = await createAdminClient();
        const { error } = await adminSupabase
            .from('submits')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;

        revalidatePath('/my/applications');
        return { success: true, message: '삭제되었습니다.' };
    } catch (error) {
        console.error('Submit application delete error:', error);
        return { success: false, message: '삭제 중 오류가 발생했습니다.' };
    }
}

export async function checkEmailDuplicate(email: string) {
    if (!email) return { success: false, message: '이메일을 입력해주세요.' };
    
    try {
        const adminSupabase = await createAdminClient();
        const { data, error } = await adminSupabase
            .from('members')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (error) throw error;

        if (data) {
            return { success: false, message: '이미 사용 중인 이메일입니다.', isDuplicate: true };
        } else {
            return { success: true, message: '사용 가능한 이메일입니다.', isDuplicate: false };
        }
    } catch (error) {
        console.error('Email check error:', error);
        return { success: false, message: '중복 확인 중 오류가 발생했습니다.' };
    }
}

export async function signup(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const birthDate = formData.get('birthDate') as string;
    
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();

    // 1. Auth Signup
    const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
            data: {
                full_name: name,
                phone: phone,
            }
        },
    });

    if (signUpError) {
        return { success: false, message: signUpError.message };
    }

    // 2. Add to dowon.members Whitelist
    if (data.user) {
        // Check if this is the first user
        const { count } = await adminSupabase
            .from('members')
            .select('*', { count: 'exact', head: true });

        const isFirstUser = count === 0;

        const { error: memberError } = await adminSupabase
            .from('members')
            .insert({
                id: data.user.id,
                email: email,
                name: name || email.split('@')[0],
                phone: phone,
                birth_date: birthDate,
                role: isFirstUser ? 'admin' : 'user'
            });

        if (memberError) {
            console.error('Failed to add to members whitelist:', memberError);
            // We don't necessarily want to fail the whole signup if auth succeeded, 
            // but for this project's logic, we should.
            return { success: false, message: '회원 목록 등록에 실패했습니다.' };
        }
    }

    return { success: true, message: '회원가입 확인 메일을 확인해주세요.' };
}

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = await createClient();

    // 1. Sign in
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (signInError) {
        return { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' };
    }

    // 2. Auto-onboarding & Role Check
    const adminSupabase = await createAdminClient();
    let { data: member } = await adminSupabase
        .from('members')
        .select('role')
        .eq('id', data.user.id)
        .single();

    if (!member) {
        // Check if this is the first member of Dowon
        const { count } = await adminSupabase
            .from('members')
            .select('*', { count: 'exact', head: true });

        const isFirstUser = count === 0;
        const defaultRole = isFirstUser ? 'admin' : 'user';

        const { error: insertError } = await adminSupabase
            .from('members')
            .insert({
                id: data.user.id,
                email: data.user.email!,
                name: data.user.email?.split('@')[0],
                role: defaultRole
            });

        if (insertError) {
            console.error('Failed to auto-onboard user:', insertError);
            await supabase.auth.signOut();
            return { success: false, message: '도원 프로젝트 멤버 등록 중 오류가 발생했습니다.' };
        }
        member = { role: defaultRole };
    }

    revalidatePath('/', 'layout');

    // 3. Smart Redirect
    if (member?.role === 'admin') {
        redirect('/admin');
    } else {
        redirect('/');
    }
}
export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/');
}

export async function getConsultations() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

// Blog Actions

export async function createBlogPost(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

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
        const { error } = await supabase
            .from('blog_posts')
            .insert({
                title,
                summary,
                content_url: contentUrl,
                thumbnail_url: thumbnailUrl,
                category,
                published_date: publishedDate
            });

        if (error) throw error;

        revalidatePath('/admin/blog');
        revalidatePath('/');
        return { success: true, message: '게시물이 등록되었습니다.' };
    } catch (error) {
        console.error('Blog create error:', error);
        return { success: false, message: '등록 실패' };
    }
}

export async function updateBlogPost(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

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
        const { error } = await supabase
            .from('blog_posts')
            .update({
                title,
                summary,
                content_url: contentUrl,
                thumbnail_url: thumbnailUrl,
                category,
                published_date: publishedDate
            })
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/admin/blog');
        revalidatePath('/');
        return { success: true, message: '게시물이 수정되었습니다.' };
    } catch (error) {
        console.error('Blog update error:', error);
        return { success: false, message: '수정 실패' };
    }
}

export async function getBlogPosts() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_date', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function getSelectedBlogPosts() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_selected', true)
        .order('published_date', { ascending: false })
        .limit(4);

    if (error) throw error;
    return data;
}

export async function getRecentPosts() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            categories (name)
        `)
        .order('published_at', { ascending: false })
        .limit(4);

    if (error) throw error;
    
    // Map categories.name to categoryName for compatibility
    return (data as RecentPostRow[]).map((post) => ({
        ...post,
        categoryId: post.category_id,
        categoryName: post.categories?.name,
        imageUrl: post.image_url,
        publishedAt: post.published_at,
        thumbnailUrl: post.thumbnail_url,
        updatedAt: post.updated_at,
        viewCount: post.view_count,
    }));
}

export async function toggleBlogPostSelection(id: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    try {
        const { data: post, error: getError } = await supabase
            .from('blog_posts')
            .select('is_selected')
            .eq('id', id)
            .single();

        if (getError) throw getError;

        const newState = !post.is_selected;

        const { error: updateError } = await supabase
            .from('blog_posts')
            .update({ is_selected: newState })
            .eq('id', id);

        if (updateError) throw updateError;

        revalidatePath('/admin/blog');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function deleteBlogPost(id: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    try {
        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/admin/blog');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function deleteBoardPost(id: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: 'Unauthorized' };
    }

    try {
        const { data: post, error: getError } = await supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .single();
        
        if (getError || !post) {
            return { success: false, message: '게시글이 존재하지 않습니다.' };
        }

        // Delete from DB
        const { error: deleteError } = await supabase
            .from('posts')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        // Note: Image deletion logic remains the same (assuming local uploads)
        // However, if images are in Supabase Storage, we should use supabase.storage
        // For now, I'll keep the local file deletion logic but we might need to migrate storage too.

        // Delete image files using fs
        try {
            const { unlink } = await import('fs/promises');
            const path = await import('path');
            const urlsToDelete = new Set<string>();

            if (post.imageUrl) urlsToDelete.add(post.imageUrl);
            if (post.thumbnailUrl) urlsToDelete.add(post.thumbnailUrl);

            if (post.content) {
                const imgRegex = /<img[^>]+src="([^">]+)"/g;
                let match;
                while ((match = imgRegex.exec(post.content)) !== null) {
                    if (match[1]) urlsToDelete.add(match[1]);
                }
            }

            const publicDir = path.join(process.cwd(), 'public');

            for (const rawUrl of Array.from(urlsToDelete)) {
                let parsedUrl = rawUrl;
                try {
                    if (rawUrl.startsWith('http')) {
                        const u = new URL(rawUrl);
                        parsedUrl = u.pathname;
                    }
                } catch (e) {}

                const url = decodeURIComponent(parsedUrl);

                // Ensure we are only deleting local upload files
                if (url.startsWith('/uploads/')) {
                    const filePath = path.join(publicDir, url);
                    try {
                        await unlink(filePath);
                    } catch (e: unknown) {
                        const message = e instanceof Error ? e.message : String(e);
                        console.error('Failed to delete image file:', filePath, message);
                    }
                    
                    // Cleanup automatically generated thumbnails for this image as well
                    try {
                        const parsed = path.posix.parse(url);
                        const directory = parsed.dir === '/' ? '' : parsed.dir;
                        const thumbUrl = `${directory}/${parsed.name}_thumb.jpg`;
                        const thumbPath = path.join(publicDir, thumbUrl);
                        await unlink(thumbPath);
                    } catch (e) {
                        // Ignore errors for thumbnails not found
                    }
                }
            }
        } catch (err) {
            console.error('Error running image deletion logic:', err);
        }

        revalidatePath('/');
        revalidatePath('/admin/board');
        revalidatePath('/board');
        revalidatePath(`/board/post/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Board delete error:', error);
        return { success: false, message: '삭제 중 오류가 발생했습니다.' };
    }
}
