// This file previously handled Clerk webhooks for user.created / user.deleted.
// With Supabase Auth, user creation is handled via Supabase's built-in auth system.
// User records in the `users` table should be created via a Supabase database trigger
// or during the sign-up flow in the application.
//
// This route is kept as a placeholder. To sync Supabase Auth events to the `users`
// table, configure a Supabase Database Webhook or use a Postgres trigger on
// auth.users that inserts into public.users.

export async function POST() {
  return Response.json(
    { error: 'Clerk webhooks are no longer used. Auth is handled by Supabase.' },
    { status: 410 }
  )
}
