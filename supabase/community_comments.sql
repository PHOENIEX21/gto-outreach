-- Run once in Supabase SQL Editor for existing projects.

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

alter table public.community_comments enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'community_comments' and policyname = 'Community comments are public') then
    create policy "Community comments are public" on public.community_comments for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'community_comments' and policyname = 'Users can post community comments') then
    create policy "Users can post community comments" on public.community_comments for insert to authenticated with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'community_comments' and policyname = 'Users can delete their community comments') then
    create policy "Users can delete their community comments" on public.community_comments for delete to authenticated using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'community_comments' and policyname = 'Admins can delete community comments') then
    create policy "Admins can delete community comments" on public.community_comments for delete to authenticated using (public.is_admin());
  end if;
end $$;

create or replace function public.notify_community_comment()
returns trigger language plpgsql security definer set search_path = public
as $$ declare owner_id uuid; actor_name text; post_title text; begin
  select user_id, title into owner_id, post_title from public.community_posts where id = new.post_id;
  select coalesce(full_name, 'Member') into actor_name from public.profiles where id = new.user_id;
  perform public.create_gto_notification(owner_id, 'reply', actor_name, 'replied to "' || post_title || '".', '/community-wall#community-' || new.post_id);
  return new;
end; $$;

drop trigger if exists on_community_comment_notification on public.community_comments;
create trigger on_community_comment_notification after insert on public.community_comments for each row execute procedure public.notify_community_comment();

do $$ begin
  alter publication supabase_realtime add table public.community_comments;
exception when duplicate_object then null;
end $$;
