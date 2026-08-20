# Glad Tidings Outreach

## Supabase connection

The app currently falls back to browser-local preview data until Supabase credentials are configured. To enable shared users, secure admin roles, published devotionals, and cross-device engagement:

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and add the project URL and anon key from Supabase Project Settings > API.
3. Run `supabase/schema.sql` in the Supabase SQL Editor.
4. Create a user in Supabase Authentication, then promote that user with the admin SQL comment at the bottom of the schema file.
5. Restart the Vite server.

For an existing project, run `supabase/realtime_devotionals.sql` once in the Supabase SQL Editor so devotional likes, completions, and encouragements update live for everyone.

## Password-recovery email delivery

The reset form requests an email from Supabase Auth. A successful request only means
that Supabase accepted it; for security, it does not reveal whether the email address
has an account. Before relying on the form in production, configure email delivery in
the Supabase Dashboard:

1. In **Authentication > URL Configuration**, set the Site URL to the deployed GTO
   URL and add `https://YOUR-DOMAIN/reset-password` to Redirect URLs (add the local
   Vite URL too when testing locally).
2. In **Authentication > Email Templates**, ensure the **Reset Password** template is
   enabled and still contains the confirmation URL variable.
3. In **Project Settings > Auth > SMTP Settings**, set up a production SMTP provider.
   The built-in sender is rate-limited and intended only for testing.
4. Confirm that the admin email exists under **Authentication > Users** and check the
   provider's delivery log plus the recipient's Spam/Junk folder.

For an existing project, run `supabase/media_posts.sql` once to enable admin publishing of announcements, uploaded videos/images, and hosted media URLs on the Media page.

Run `supabase/devotional_admin.sql` once so admins can edit and remove devotionals from the admin Content Library.

Run `supabase/devotional_progress.sql` once to sync member devotional reading
progress across devices. It is safe to run more than once.

Run `supabase/profile_media.sql` once for member profile photos. It adds the
`avatar_url` profile field and a public avatar bucket where each signed-in
member can upload or replace only their own avatar.

Run `supabase/engagement_notifications.sql` once for share points and website
notifications. Notifications appear in the member dashboard; no email delivery
is used by this feature. Run the base schema and content migrations first when
setting up a new project; this file safely skips triggers for tables that have
not been created yet. Rerun this file after pulling notification updates so the
database functions use the replying member's display name.

Run `supabase/community_comments.sql` once for replies on prayer requests and
testimonies. It adds member-only posting with public reading and owner/admin
moderation policies.

If Supabase reports that `public.community_support` is missing, run
`supabase/community_support.sql` once, then reload the app. For a new project,
run `supabase/media_posts.sql` before this repair and before
`supabase/engagement_notifications.sql`.

Never place the Supabase service-role key in this frontend. Only the anon key belongs in `.env.local`; row-level security protects the data.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
