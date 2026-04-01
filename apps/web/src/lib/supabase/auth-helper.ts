import { createClient } from './server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Get the authenticated user from either:
 * 1. Supabase session cookies (web app)
 * 2. Bearer token in Authorization header (Chrome extension)
 */
export async function getAuthUser(req: Request) {
  // First try cookie-based auth (web app)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) return user;

  // Fallback: Bearer token (extension)
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const supabaseWithToken = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      },
    );
    const { data: { user: tokenUser } } = await supabaseWithToken.auth.getUser(token);
    return tokenUser;
  }

  return null;
}
