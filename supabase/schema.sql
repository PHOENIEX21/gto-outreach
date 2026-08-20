-- Run this file in Supabase SQL Editor.

create type public.app_role as enum ('member', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  role public.app_role not null default 'member',
  created_at timestamptz not null default now()
);

create table public.devotionals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  reference text not null,
  scripture text not null,
  reflection text not null,
  prayer text not null,
  published_at timestamptz not null default now(),
  published_by uuid not null references public.profiles(id)
);

create table public.devotional_engagement (
  devotional_id uuid not null references public.devotionals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  liked boolean not null default false,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (devotional_id, user_id)
);

create table public.devotional_comments (
  id uuid primary key default gen_random_uuid(),
  devotional_id uuid not null references public.devotionals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create table public.devotional_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  devotional_id uuid not null references public.devotionals(id) on delete cascade,
  progress smallint not null default 0 check (progress between 0 and 100),
  scroll_ratio numeric(5,4) not null default 0 check (scroll_ratio between 0 and 1),
  updated_at timestamptz not null default now(),
  primary key (user_id, devotional_id)
);

create table public.media_posts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('announcement', 'video', 'image')),
  title text not null,
  body text not null,
  media_url text,
  published_at timestamptz not null default now(),
  published_by uuid not null references public.profiles(id),
  constraint media_url_required check ((kind = 'announcement' and media_url is null) or (kind in ('video', 'image') and media_url is not null))
);

create table public.media_comments (
  id uuid primary key default gen_random_uuid(),
  media_post_id uuid not null references public.media_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create table public.media_reactions (
  media_post_id uuid not null references public.media_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  liked boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (media_post_id, user_id)
);

create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('prayer', 'testimony')),
  title text not null,
  body text not null check (char_length(body) between 1 and 2000),
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.community_support (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('praying', 'amen')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

alter table public.profiles enable row level security;
alter table public.devotionals enable row level security;
alter table public.devotional_engagement enable row level security;
alter table public.devotional_comments enable row level security;
alter table public.devotional_progress enable row level security;
alter table public.media_posts enable row level security;
alter table public.media_comments enable row level security;
alter table public.media_reactions enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_support enable row level security;
alter table public.community_comments enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'); $$;

create policy "Profiles are visible to signed in users" on public.profiles for select to authenticated using (true);
create policy "Users can create their own profile" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "Users can update their own profile" on public.profiles for update to authenticated using (id = auth.uid());

create policy "Published devotionals are public" on public.devotionals for select using (true);
create policy "Admins can publish devotionals" on public.devotionals for insert to authenticated with check (public.is_admin() and published_by = auth.uid());
create policy "Admins can update devotionals" on public.devotionals for update to authenticated using (public.is_admin());
create policy "Admins can delete devotionals" on public.devotionals for delete to authenticated using (public.is_admin());
create policy "Users can view engagement" on public.devotional_engagement for select to authenticated using (true);
create policy "Users can manage their engagement" on public.devotional_engagement for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can view comments" on public.devotional_comments for select using (true);
create policy "Users can post comments" on public.devotional_comments for insert to authenticated with check (user_id = auth.uid());
create policy "Users can delete their comments" on public.devotional_comments for delete to authenticated using (user_id = auth.uid());
create policy "Members can view their devotional progress" on public.devotional_progress for select to authenticated using (user_id = auth.uid());
create policy "Members can manage their devotional progress" on public.devotional_progress for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Media posts are public" on public.media_posts for select using (true);
create policy "Admins can publish media posts" on public.media_posts for insert to authenticated with check (public.is_admin() and published_by = auth.uid());
create policy "Admins can update media posts" on public.media_posts for update to authenticated using (public.is_admin());
create policy "Admins can delete media posts" on public.media_posts for delete to authenticated using (public.is_admin());
create policy "Users can view media comments" on public.media_comments for select using (true);
create policy "Users can post media comments" on public.media_comments for insert to authenticated with check (user_id = auth.uid());
create policy "Users can delete their media comments" on public.media_comments for delete to authenticated using (user_id = auth.uid());
create policy "Admins can delete media comments" on public.media_comments for delete to authenticated using (public.is_admin());
create policy "Users can view media reactions" on public.media_reactions for select using (true);
create policy "Users can manage media reactions" on public.media_reactions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Community posts are public" on public.community_posts for select using (true);
create policy "Users can create community posts" on public.community_posts for insert to authenticated with check (user_id = auth.uid());
create policy "Users can update their community posts" on public.community_posts for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can delete their community posts" on public.community_posts for delete to authenticated using (user_id = auth.uid());
create policy "Admins can delete community posts" on public.community_posts for delete to authenticated using (public.is_admin());
create policy "Community support is public" on public.community_support for select using (true);
create policy "Users can manage community support" on public.community_support for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Community comments are public" on public.community_comments for select using (true);
create policy "Users can post community comments" on public.community_comments for insert to authenticated with check (user_id = auth.uid());
create policy "Users can delete their community comments" on public.community_comments for delete to authenticated using (user_id = auth.uid());
create policy "Admins can delete community comments" on public.community_comments for delete to authenticated using (public.is_admin());
create policy "Public can view media files" on storage.objects for select using (bucket_id = 'media');
create policy "Admins can upload media files" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "Admins can update media files" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin());
create policy "Admins can delete media files" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());

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
  alter publication supabase_realtime add table public.community_posts;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.community_support;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.devotional_engagement;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.devotional_comments;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.devotional_progress;
exception when duplicate_object then null;
end $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Member')); return new; end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- After creating your own account, promote it once with:
-- update public.profiles set role = 'admin' where id = 'YOUR_AUTH_USER_UUID';
