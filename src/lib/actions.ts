'use server';

import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { createClient, createAdminClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { sendSMS } from './aligo';
import { getPositionLabel, getPositionOptionsForChar, getTenStar, parseDayPillar } from './saju-relations';
import { claimGuestBaziConsultationsForUser } from './guest-bazi-claim';

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

export type UpdateProfileState = {
    success: boolean;
    message: string;
};

type ConsultationTarget = {
    name: string | null;
    occupation: string | null;
    birthDate: string;
    calendarType: string;
    gender: string;
    birthTimeAccuracy: string;
    birthTime: string | null;
};

type ServiceDetails = Record<string, string | null>;

export type GuestSubmitApplication = {
    id: number;
    applicant_name: string;
    applicant_phone: string;
    service_type: string;
    service_details: ServiceDetails | null;
    consultation_targets: ConsultationTarget[] | null;
    concern: string | null;
    status: string;
    created_at: string;
};

export type LookupGuestApplicationsState = {
    success: boolean;
    message: string;
    applications: GuestSubmitApplication[];
};

export type AdminSubmitApplication = {
    id: number;
    name: string;
    contact: string;
    email: string | null;
    birthDate: string | null;
    createdAt: string;
    notes: string | null;
    serviceType: string;
    serviceDetails: ServiceDetails | null;
    consultationTargets: ConsultationTarget[] | null;
    status: string;
};

export type SajuRelationReadingStatus = 'draft' | 'approved' | 'archived';
export type SajuRelationReadingSource = 'manual' | 'deepseek';

export type SajuRelationReadingFormState = {
    success: boolean;
    message: string;
};

export type SajuRelationReading = {
    id: number;
    relation_type: string;
    relation_key: string;
    day_pillar: string;
    day_stem: string;
    day_branch: string;
    actor_char: string;
    target_char: string;
    actor_ten_star: string | null;
    target_ten_star: string | null;
    ten_star_pair: string | null;
    actor_position: string;
    target_position: string;
    palace_pair: string | null;
    title: string;
    summary: string;
    detail: string;
    status: SajuRelationReadingStatus;
    source: SajuRelationReadingSource;
    prompt_version: string | null;
    model: string | null;
    generated_at: string | null;
    reviewed_at: string | null;
    reviewed_by: string | null;
    created_at: string;
    updated_at: string;
};

function hashApplicationPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');

    return `${salt}:${hash}`;
}

function verifyApplicationPassword(password: string, storedHash?: string | null) {
    if (!storedHash) return false;

    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;

    try {
        const expected = Buffer.from(hash, 'hex');
        const actual = scryptSync(password, salt, expected.length);

        return expected.length === actual.length && timingSafeEqual(expected, actual);
    } catch {
        return false;
    }
}

function normalizePhoneNumber(phone: string) {
    return phone.replace(/\D/g, '').slice(0, 11);
}

function getFormString(formData: FormData, name: string, fallback = '') {
    return String(formData.get(name) || fallback).trim();
}

function getOptionalFormString(formData: FormData, name: string) {
    const value = getFormString(formData, name);
    return value || null;
}

function buildSiteUrl(headersList: Headers) {
    const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (configuredUrl) return configuredUrl.replace(/\/$/, '');

    const host = headersList.get('x-forwarded-host') || headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 'https';

    return host ? `${protocol}://${host}` : 'http://localhost:3000';
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
    const occupation = getFormString(formData, `${prefix}Occupation`);
    const birthDate = getFormString(formData, `${prefix}BirthDate`);
    const calendarType = getFormString(formData, `${prefix}CalendarType`, index === 1 ? 'solar' : '');
    const gender = getFormString(formData, `${prefix}Gender`);
    const birthTimeAccuracy = getFormString(formData, `${prefix}BirthTimeAccuracy`, index === 1 ? 'exact' : '');
    const birthTime = buildBirthTime(formData, prefix);
    const hasAnyValue = Boolean(name || occupation || birthDate || calendarType || gender || birthTimeAccuracy || birthTime);

    if (!hasAnyValue) return null;

    return {
        name: name || null,
        occupation: occupation || null,
        birthDate,
        calendarType,
        gender,
        birthTimeAccuracy,
        birthTime: birthTime || null,
    };
}

function buildServiceDetails(formData: FormData, serviceType: string): ServiceDetails | null {
    const details: ServiceDetails = {
        consultationMethod: getFormString(formData, 'consultationMethod') || null,
        preferredConsultationDate: getFormString(formData, 'preferredConsultationDate') || null,
    };

    if (serviceType !== 'naming') {
        return Object.values(details).some(Boolean) ? details : null;
    }

    return {
        ...details,
        familyName: getFormString(formData, 'namingFamilyName'),
        generationNameUsage: getFormString(formData, 'namingGenerationNameUsage', 'none'),
        generationName: getFormString(formData, 'namingGenerationName') || null,
        preferredNames: getFormString(formData, 'namingPreferredNames') || null,
        hanjaUsage: getFormString(formData, 'namingHanjaUsage', 'optional'),
        avoidedNames: getFormString(formData, 'namingAvoidedNames') || null,
        additionalRequests: getFormString(formData, 'namingAdditionalRequests') || null,
    };
}

export async function submitApplication(
    _prevState: SubmitApplicationState,
    formData: FormData
): Promise<SubmitApplicationState> {
    const applicantName = getFormString(formData, 'applicantName');
    const applicantPhone = normalizePhoneNumber(getFormString(formData, 'applicantPhone'));
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

    if (applicantPhone.length < 10 || applicantPhone.length > 11) {
        return { success: false, message: '전화번호는 숫자 10~11자리로 입력해주세요.' };
    }

    if (!user && !applicationPassword) {
        return { success: false, message: '신청서 확인 비밀번호를 입력해주세요.' };
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

    if (!serviceDetails?.consultationMethod) {
        return { success: false, message: '상담 방법을 선택해주세요.' };
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
    const siteUrl = buildSiteUrl(headersList);

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

        const adminViewToken = randomBytes(24).toString('hex');
        const { data: insertedApplication, error: insertError } = await adminSupabase
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
                admin_view_token: adminViewToken,
            })
            .select('id, admin_view_token')
            .single();

        if (insertError) throw insertError;

        const detailUrl = `${siteUrl}/submit/applications/${insertedApplication?.admin_view_token || adminViewToken}`;

        await sendSMS(`[도원 상담신청]
상세확인
${detailUrl}`);

        revalidatePath('/submit');
        revalidatePath('/my/applications');
        revalidatePath('/admin');
    } catch (error) {
        console.error('Submit application error:', error);
        return { success: false, message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' };
    }

    redirect(`/submit/complete?service=${encodeURIComponent(serviceType)}`);
}

type GuestSubmitApplicationRow = GuestSubmitApplication & {
    application_password_hash: string | null;
};

export async function lookupGuestApplications(
    _prevState: LookupGuestApplicationsState,
    formData: FormData
): Promise<LookupGuestApplicationsState> {
    const applicantPhone = normalizePhoneNumber(getFormString(formData, 'applicantPhone'));
    const applicationPassword = getFormString(formData, 'applicationPassword');

    if (!applicantPhone || !applicationPassword) {
        return { success: false, message: '전화번호와 비밀번호를 입력해주세요.', applications: [] };
    }

    if (applicantPhone.length < 10 || applicantPhone.length > 11) {
        return { success: false, message: '전화번호는 숫자 10~11자리로 입력해주세요.', applications: [] };
    }

    if (applicationPassword.length < 4) {
        return { success: false, message: '비밀번호는 4자 이상 입력해주세요.', applications: [] };
    }

    try {
        const adminSupabase = await createAdminClient();
        const { data, error } = await adminSupabase
            .from('submits')
            .select('id, applicant_name, applicant_phone, service_type, service_details, consultation_targets, concern, status, created_at, application_password_hash')
            .eq('applicant_phone', applicantPhone)
            .is('user_id', null)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        const matchedApplications = ((data || []) as GuestSubmitApplicationRow[])
            .filter((application) => verifyApplicationPassword(applicationPassword, application.application_password_hash))
            .map((application) => ({
                id: application.id,
                applicant_name: application.applicant_name,
                applicant_phone: application.applicant_phone,
                service_type: application.service_type,
                service_details: application.service_details,
                consultation_targets: application.consultation_targets,
                concern: application.concern,
                status: application.status,
                created_at: application.created_at,
            }));

        if (matchedApplications.length === 0) {
            return {
                success: false,
                message: '일치하는 신청서를 찾지 못했습니다. 신청 시 입력한 전화번호와 비밀번호를 확인해주세요.',
                applications: [],
            };
        }

        return {
            success: true,
            message: '고객님의 신청서를 찾았습니다.',
            applications: matchedApplications,
        };
    } catch (error) {
        console.error('Lookup guest applications error:', error);
        return { success: false, message: '신청서 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', applications: [] };
    }
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
            .from('submits')
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

export async function updateSubmitStatus(id: number, status: string) {
    const allowedStatuses = ['pending', 'paid', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
        return { success: false, message: '올바르지 않은 진행 상태입니다.' };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: 'Unauthorized' };
    }

    try {
        const { error } = await supabase
            .from('submits')
            .update({
                status,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/admin');
        revalidatePath('/my/applications');
        revalidatePath('/submit/lookup');
        return { success: true, message: '진행 상태가 변경되었습니다.' };
    } catch (error) {
        console.error('Status update error:', error);
        return { success: false, message: '진행 상태 변경 중 오류가 발생했습니다.' };
    }
}

function buildSajuRelationReadingPayload(formData: FormData) {
    const relationType = getFormString(formData, 'relation_type');
    const relationKey = getFormString(formData, 'relation_key');
    const dayPillar = getFormString(formData, 'day_pillar');
    const actorChar = getFormString(formData, 'actor_char');
    const targetChar = getFormString(formData, 'target_char');
    const actorPosition = getFormString(formData, 'actor_position');
    const targetPosition = getFormString(formData, 'target_position');
    const title = getFormString(formData, 'title');
    const summary = getFormString(formData, 'summary');
    const detail = getFormString(formData, 'detail');
    const status = getFormString(formData, 'status', 'draft') as SajuRelationReadingStatus;
    const source = getFormString(formData, 'source', 'manual') as SajuRelationReadingSource;

    const allowedStatuses: SajuRelationReadingStatus[] = ['draft', 'approved', 'archived'];
    const allowedSources: SajuRelationReadingSource[] = ['manual', 'deepseek'];

    if (
        !relationType ||
        !relationKey ||
        !dayPillar ||
        !actorChar ||
        !targetChar ||
        !actorPosition ||
        !targetPosition ||
        !title ||
        !summary ||
        !detail
    ) {
        return { error: '필수 항목을 입력해주세요.' };
    }

    const parsedDayPillar = parseDayPillar(dayPillar);
    if (!parsedDayPillar) {
        return { error: '올바르지 않은 기준 일주입니다.' };
    }

    if (!allowedStatuses.includes(status)) {
        return { error: '올바르지 않은 상태값입니다.' };
    }

    if (!allowedSources.includes(source)) {
        return { error: '올바르지 않은 생성 출처입니다.' };
    }

    const { dayStem, dayBranch } = parsedDayPillar;
    const actorPositionOptions = getPositionOptionsForChar(actorChar, dayStem, dayBranch);
    const targetPositionOptions = getPositionOptionsForChar(targetChar, dayStem, dayBranch);

    if (!actorPositionOptions.some((option) => option.value === actorPosition)) {
        return { error: '작용 글자에 맞는 작용 위치를 선택해주세요.' };
    }

    if (!targetPositionOptions.some((option) => option.value === targetPosition)) {
        return { error: '대상 글자에 맞는 대상 위치를 선택해주세요.' };
    }

    const actorTenStar = getTenStar(dayStem, actorChar);
    const targetTenStar = getTenStar(dayStem, targetChar);
    const tenStarPair = actorTenStar && targetTenStar ? `${actorTenStar}-${targetTenStar}` : null;
    const palacePair = `${getPositionLabel(actorPosition)}-${getPositionLabel(targetPosition)}`;

    return {
        payload: {
            relation_type: relationType,
            relation_key: relationKey,
            day_pillar: dayPillar,
            day_stem: dayStem,
            day_branch: dayBranch,
            actor_char: actorChar,
            target_char: targetChar,
            actor_ten_star: actorTenStar,
            target_ten_star: targetTenStar,
            ten_star_pair: tenStarPair,
            actor_position: actorPosition,
            target_position: targetPosition,
            palace_pair: palacePair,
            title,
            summary,
            detail,
            status,
            source,
            prompt_version: getOptionalFormString(formData, 'prompt_version'),
            model: getOptionalFormString(formData, 'model'),
            reviewed_at: status === 'approved' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
        },
    };
}

export async function createSajuRelationReading(
    _prevState: SajuRelationReadingFormState,
    formData: FormData
): Promise<SajuRelationReadingFormState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: '로그인이 필요합니다.' };
    }

    const result = buildSajuRelationReadingPayload(formData);
    if (result.error || !result.payload) {
        return { success: false, message: result.error || '입력값을 확인해주세요.' };
    }

    try {
        const { error } = await supabase
            .from('saju_relation_readings')
            .insert({
                ...result.payload,
                reviewed_by: result.payload.status === 'approved' ? user.id : null,
            });

        if (error) throw error;

        revalidatePath('/admin/saju-relations');
        return { success: true, message: '사주 관계 해설이 등록되었습니다.' };
    } catch (error) {
        console.error('Create saju relation reading error:', error);
        return { success: false, message: '등록 중 오류가 발생했습니다. 중복 조합이 있는지 확인해주세요.' };
    }
}

export async function updateSajuRelationReading(
    id: number,
    _prevState: SajuRelationReadingFormState,
    formData: FormData
): Promise<SajuRelationReadingFormState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: '로그인이 필요합니다.' };
    }

    const result = buildSajuRelationReadingPayload(formData);
    if (result.error || !result.payload) {
        return { success: false, message: result.error || '입력값을 확인해주세요.' };
    }

    try {
        const { error } = await supabase
            .from('saju_relation_readings')
            .update({
                ...result.payload,
                reviewed_by: result.payload.status === 'approved' ? user.id : null,
            })
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/admin/saju-relations');
        revalidatePath(`/admin/saju-relations/edit/${id}`);
        return { success: true, message: '사주 관계 해설이 수정되었습니다.' };
    } catch (error) {
        console.error('Update saju relation reading error:', error);
        return { success: false, message: '수정 중 오류가 발생했습니다. 중복 조합이 있는지 확인해주세요.' };
    }
}

export async function updateSajuRelationReadingStatus(id: number, status: string) {
    const allowedStatuses: SajuRelationReadingStatus[] = ['draft', 'approved', 'archived'];
    if (!allowedStatuses.includes(status as SajuRelationReadingStatus)) {
        return { success: false, message: '올바르지 않은 상태값입니다.' };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: '로그인이 필요합니다.' };
    }

    try {
        const { error } = await supabase
            .from('saju_relation_readings')
            .update({
                status,
                reviewed_at: status === 'approved' ? new Date().toISOString() : null,
                reviewed_by: status === 'approved' ? user.id : null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/admin/saju-relations');
        return { success: true, message: '상태가 변경되었습니다.' };
    } catch (error) {
        console.error('Update saju relation reading status error:', error);
        return { success: false, message: '상태 변경 중 오류가 발생했습니다.' };
    }
}

export async function deleteSajuRelationReading(id: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: '로그인이 필요합니다.' };
    }

    try {
        const { error } = await supabase
            .from('saju_relation_readings')
            .delete()
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/admin/saju-relations');
        return { success: true, message: '삭제되었습니다.' };
    } catch (error) {
        console.error('Delete saju relation reading error:', error);
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

export async function deleteFreeBaziConsultation(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: '로그인이 필요합니다.' };
    }

    try {
        const adminSupabase = await createAdminClient();
        const { error } = await adminSupabase
            .from('free_bazi_consultations')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;

        revalidatePath('/my/bazi-consultations');
        revalidatePath('/profile');
        return { success: true, message: '삭제되었습니다.' };
    } catch (error) {
        console.error('Free bazi consultation delete error:', error);
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
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?claimGuestBazi=1`,
            data: {
                full_name: name,
                phone: phone,
            }
        },
    });

    if (signUpError) {
        return { success: false, message: signUpError.message };
    }

    // 2. Add to members whitelist
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

        await claimGuestBaziConsultationsForUser(data.user.id);
        revalidatePath('/my/bazi-consultations');
    }

    return { success: true, message: '회원가입 확인 메일을 확인해주세요.' };
}

export async function updateProfile(
    _prevState: UpdateProfileState,
    formData: FormData
): Promise<UpdateProfileState> {
    const name = getFormString(formData, 'name');
    const phone = normalizePhoneNumber(getFormString(formData, 'phone'));
    const birthDate = getFormString(formData, 'birthDate');

    if (!name) {
        return { success: false, message: '이름을 입력해주세요.' };
    }

    if (phone && (phone.length < 10 || phone.length > 11)) {
        return { success: false, message: '휴대폰 번호는 숫자 10~11자리로 입력해주세요.' };
    }

    if (birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
        return { success: false, message: '생년월일 형식을 확인해주세요.' };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: '로그인이 필요합니다.' };
    }

    const adminSupabase = await createAdminClient();
    const { error } = await adminSupabase
        .from('members')
        .update({
            name,
            phone: phone || null,
            birth_date: birthDate || null,
        })
        .eq('id', user.id);

    if (error) {
        console.error('Profile update error:', error);
        return { success: false, message: '프로필 저장 중 오류가 발생했습니다.' };
    }

    const { error: authError } = await supabase.auth.updateUser({
        data: {
            full_name: name,
            phone: phone || null,
        },
    });

    if (authError) {
        console.error('Profile auth metadata update error:', authError);
    }

    revalidatePath('/profile');
    revalidatePath('/profile/edit');
    revalidatePath('/submit');

    return { success: true, message: '프로필을 저장했습니다.' };
}

export async function deleteAccount() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: '로그인이 필요합니다.' };
    }

    const adminSupabase = await createAdminClient();
    const { error } = await adminSupabase.auth.admin.deleteUser(user.id);

    if (error) {
        console.error('Account delete error:', error);
        return { success: false, message: '회원 탈퇴 중 오류가 발생했습니다.' };
    }

    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/');
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
        .from('submits')
        .select('id, applicant_name, applicant_phone, applicant_email, service_type, service_details, consultation_targets, concern, status, created_at')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return ((data || []) as Array<{
        id: number;
        applicant_name: string;
        applicant_phone: string;
        applicant_email: string | null;
        service_type: string;
        service_details: ServiceDetails | null;
        consultation_targets: ConsultationTarget[] | null;
        concern: string | null;
        status: string;
        created_at: string;
    }>).map((application): AdminSubmitApplication => ({
        id: application.id,
        name: application.applicant_name,
        contact: application.applicant_phone,
        email: application.applicant_email,
        birthDate: application.consultation_targets?.[0]?.birthDate || null,
        createdAt: application.created_at,
        notes: application.concern,
        serviceType: application.service_type,
        serviceDetails: application.service_details,
        consultationTargets: application.consultation_targets,
        status: application.status,
    }));
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

            if (post.image_url) urlsToDelete.add(post.image_url);
            if (post.thumbnail_url) urlsToDelete.add(post.thumbnail_url);

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
