import SubmitPageClient from './SubmitPageClient';
import { createAdminClient, createClient } from '@/utils/supabase/server';

export default async function SubmitPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let initialApplicant = {
        name: '',
        phone: '',
        email: '',
    };

    if (user) {
        const adminSupabase = await createAdminClient();
        const { data: member } = await adminSupabase
            .from('members')
            .select('name, phone, email')
            .eq('id', user.id)
            .maybeSingle();

        initialApplicant = {
            name: member?.name || user.user_metadata?.full_name || '',
            phone: member?.phone || user.user_metadata?.phone || '',
            email: member?.email || user.email || '',
        };
    }

    return <SubmitPageClient initialApplicant={initialApplicant} initialIsLoggedIn={Boolean(user)} />;
}
