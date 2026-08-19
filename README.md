# Glad Tidings Outreach

## Supabase connection

The app currently falls back to browser-local preview data until Supabase credentials are configured. To enable shared users, secure admin roles, published devotionals, and cross-device engagement:

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and add the project URL and anon key from Supabase Project Settings > API.
3. Run `supabase/schema.sql` in the Supabase SQL Editor.
4. Create a user in Supabase Authentication, then promote that user with the admin SQL comment at the bottom of the schema file.
5. Restart the Vite server.

For an existing project, run `supabase/media_posts.sql` once to enable admin publishing of announcements, uploaded videos/images, and hosted media URLs on the Media page.

Never place the Supabase service-role key in this frontend. Only the anon key belongs in `.env.local`; row-level security protects the data.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
