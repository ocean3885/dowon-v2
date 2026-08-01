import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    let role: string | null = null;

    if (user?.id) {
        const { data: member } = await supabase
            .from('members')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        role = member?.role || null;
    }

    return NextResponse.json({
        authenticated: Boolean(user?.id),
        userId: user?.id || null,
        role,
        isAdmin: role === 'admin',
    });
}
