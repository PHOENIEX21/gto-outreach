-- Run once in the Supabase SQL Editor for an existing project.

create table if not exists public.media_posts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('announcement', 'video', 'image')),
  title text not null,
  body text not null,
  media_url text,
  published_at timestamptz not null default now(),
  published_by uuid not null references public.profiles(id),
  constraint media_url_required check ((kind = 'announcement' and media_url is null) or (kind in ('video', 'image') and media_url is not null))
);

create table if not exists public.media_comments (
  id uuid primary key default gen_random_uuid(),
  media_post_id uuid not null references public.media_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create table if not exists public.media_reactions (
  media_post_id uuid not null references public.media_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  liked boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (media_post_id, user_id)
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('prayer', 'testimony')),
  title text not null,
  body text not null check (char_length(body) between 1 and 2000),
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.community_support (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('praying', 'amen')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.media_posts enable row level security;
alter table public.media_comments enable row level security;
alter table public.media_reactions enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_support enable row level security;

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'media_posts' and policyname = 'Media posts are public') then
    create policy "Media posts are public" on public.media_posts for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'media_posts' and policyname = 'Admins can publish media posts') then
    create policy "Admins can publish media posts" on public.media_posts for insert to authenticated with check (public.is_admin() and published_by = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'media_posts' and policyname = 'Admins can update media posts') then
    create policy "Admins can update media posts" on public.media_posts for update to authenticated using (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'media_posts' and policyname = 'Admins can delete media posts') then
    create policy "Admins can delete media posts" on public.media_posts for delete to authenticated using (public.is_admin());
  end if;
end $$;

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

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'community_posts' and policyname = 'Community posts are public') then
    create policy "Community posts are public" on public.community_posts for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'community_posts' and policyname = 'Users can create community posts') then
    create policy "Users can create community posts" on public.community_posts for insert to authenticated with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'community_posts' and policyname = 'Users can update their community posts') then
    create policy "Users can update their community posts" on public.community_posts for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'community_posts' and policyname = 'Users can delete their community posts') then
    create policy "Users can delete their community posts" on public.community_posts for delete to authenticated using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'community_posts' and policyname = 'Admins can delete community posts') then
    create policy "Admins can delete community posts" on public.community_posts for delete to authenticated using (public.is_admin());
  end if;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.community_posts;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.media_posts;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.media_comments;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.media_reactions;
exception when duplicate_object then null;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'media_reactions' and policyname = 'Users can view media reactions') then
    create policy "Users can view media reactions" on public.media_reactions for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'media_reactions' and policyname = 'Users can manage media reactions') then
    create policy "Users can manage media reactions" on public.media_reactions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'media_comments' and policyname = 'Users can view media comments') then
    create policy "Users can view media comments" on public.media_comments for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'media_comments' and policyname = 'Users can post media comments') then
    create policy "Users can post media comments" on public.media_comments for insert to authenticated with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'media_comments' and policyname = 'Users can delete their media comments') then
    create policy "Users can delete their media comments" on public.media_comments for delete to authenticated using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'media_comments' and policyname = 'Admins can delete media comments') then
    create policy "Admins can delete media comments" on public.media_comments for delete to authenticated using (public.is_admin());
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public can view media files') then
    create policy "Public can view media files" on storage.objects for select using (bucket_id = 'media');
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can upload media files') then
    create policy "Admins can upload media files" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can update media files') then
    create policy "Admins can update media files" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can delete media files') then
    create policy "Admins can delete media files" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());
  end if;
end $$;
