-- Run once in Supabase SQL Editor when community_support is missing.
-- This repair is safe to run more than once.

create table if not exists public.community_support (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('praying', 'amen')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.community_support enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'community_support' and policyname = 'Community support is public') then
    create policy "Community support is public" on public.community_support for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'community_support' and policyname = 'Users can manage community support') then
    create policy "Users can manage community support" on public.community_support for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.community_support;
exception when duplicate_object then null;
end $$;
