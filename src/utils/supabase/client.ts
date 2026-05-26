import { createBrowserClient } from '@supabase/ssr'

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (typeof window === 'undefined') {
    // On the server side (SSR), always return a fresh instance to avoid state pollution between requests
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        db: {
          schema: 'public',
        },
      }
    )
  }

  // In the browser, reuse the same client instance to keep session state warm and synchronized
  if (!clientInstance) {
    clientInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        db: {
          schema: 'public',
        },
      }
    )
  }

  return clientInstance;
}

export function getStoredAuthStatus(): 'member' | 'guest' {
  if (typeof window === 'undefined') return 'guest';
  try {
    const keys = Object.keys(localStorage);
    const authKey = keys.find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
    if (authKey) {
      const tokenStr = localStorage.getItem(authKey);
      if (tokenStr) {
        const token = JSON.parse(tokenStr);
        if (token?.user) {
          return 'member';
        }
      }
    }
  } catch (e) {
    console.error('Error reading stored auth status:', e);
  }
  return 'guest';
}
export function getStoredUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const keys = Object.keys(localStorage);
    const authKey = keys.find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
    if (authKey) {
      const tokenStr = localStorage.getItem(authKey);
      if (tokenStr) {
        const token = JSON.parse(tokenStr);
        return token?.user?.id || null;
      }
    }
  } catch (e) {
    console.error('Error reading stored user ID:', e);
  }
  return null;
}
