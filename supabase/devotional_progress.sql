-- Run once in Supabase SQL Editor for cross-device devotional progress.
-- This migration is safe to run more than once.

create table if not exists public.devotional_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  devotional_id uuid not null references public.devotionals(id) on delete cascade,
  progress smallint not null default 0 check (progress between 0 and 100),
  scroll_ratio numeric(5,4) not null default 0 check (scroll_ratio between 0 and 1),
  updated_at timestamptz not null default now(),
  primary key (user_id, devotional_id)
);

alter table public.devotional_progress enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'devotional_progress' and policyname = 'Members can view their devotional progress') then
    create policy "Members can view their devotional progress" on public.devotional_progress for select to authenticated using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'devotional_progress' and policyname = 'Members can manage their devotional progress') then
    create policy "Members can manage their devotional progress" on public.devotional_progress for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.devotional_progress;
exception when duplicate_object then null;
end $$;
