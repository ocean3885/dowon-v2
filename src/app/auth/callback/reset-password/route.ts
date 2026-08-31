import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

function getRedirectOrigin(request: Request, fallbackOrigin: string) {
  if (process.env.NODE_ENV === 'development') return fallbackOrigin;

  const forwardedHost = request.headers.get('x-forwarded-host');
  return forwardedHost ? `https://${forwardedHost}` : fallbackOrigin;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirectOrigin = getRedirectOrigin(request, origin);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${redirectOrigin}/reset-password`);
    }
  }

  return NextResponse.redirect(`${redirectOrigin}/auth/auth-code-error`);
}
