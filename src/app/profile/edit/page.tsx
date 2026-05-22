import Image from 'next/image';
import { redirect } from 'next/navigation';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import { createAdminClient, createClient } from '@/utils/supabase/server';

type MemberRow = {
    email: string | null;
    name: string | null;
    phone: string | null;
    birth_date: string | null;
};

export default async function ProfileEditPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const adminSupabase = await createAdminClient();
    const { data } = await adminSupabase
        .from('members')
        .select('email, name, phone, birth_date')
        .eq('id', user.id)
        .maybeSingle();

    const member = data as MemberRow | null;

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#f8f2e9] px-5 pb-20 pt-28 text-[#211b16] sm:px-6 lg:px-10">
            <PageBackdrop />
            <section className="relative mx-auto max-w-3xl">
                <div className="mb-6">
                    <p className="font-serif text-lg text-[#a87943]">프로필</p>
                    <h1 className="mt-2 font-serif text-3xl font-light tracking-normal sm:text-4xl">내 정보 수정</h1>
                    <p className="mt-3 text-sm leading-7 text-[#6d6258]">
                        상담 신청 때 자주 사용하는 기본 정보를 관리합니다.
                    </p>
                </div>
                <ProfileEditForm
                    email={member?.email || user.email || ''}
                    initialName={member?.name || user.user_metadata?.full_name || ''}
                    initialPhone={member?.phone || user.user_metadata?.phone || ''}
                    initialBirthDate={member?.birth_date || ''}
                />
            </section>
        </main>
    );
}

function PageBackdrop() {
    return (
        <>
            <div className="pointer-events-none absolute right-0 top-64 h-72 w-[70vw] max-w-[700px] opacity-[0.18] mix-blend-multiply md:h-[420px]">
                <Image
                    src="/bg_source/bg_mount3.webp"
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 768px) 700px, 70vw"
                    className="object-contain object-right-top"
                />
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-[68vw] max-w-[640px] opacity-[0.16] mix-blend-multiply md:h-[360px]">
                <Image
                    src="/bg_source/bg_mount4.webp"
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 768px) 640px, 68vw"
                    className="object-contain object-left-bottom"
                />
            </div>
        </>
    );
}
