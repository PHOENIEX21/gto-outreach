-- Run once in Supabase SQL Editor for engagement points and in-app notifications.
-- Requires the base profiles table. Content triggers are installed only when
-- their related content tables already exist, so this migration is order-safe.

create table if not exists public.content_shares (
  user_id uuid not null references public.profiles(id) on delete cascade,
  content_type text not null check (content_type in ('devotional', 'media', 'community')),
  content_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, content_type, content_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.content_shares enable row level security;
alter table public.notifications enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'content_shares' and policyname = 'Members can view their shares') then
    create policy "Members can view their shares" on public.content_shares for select to authenticated using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'content_shares' and policyname = 'Members can record their shares') then
    create policy "Members can record their shares" on public.content_shares for insert to authenticated with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'notifications' and policyname = 'Members can view their notifications') then
    create policy "Members can view their notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'notifications' and policyname = 'Members can mark their notifications') then
    create policy "Members can mark their notifications" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

create or replace function public.create_gto_notification(target_user uuid, notification_type text, notification_title text, notification_body text, notification_link text default null)
returns void language plpgsql security definer set search_path = public
as $$ begin
  if target_user is not null and target_user <> auth.uid() then
    insert into public.notifications (user_id, type, title, body, link)
    values (target_user, notification_type, notification_title, notification_body, notification_link);
  end if;
end; $$;

create or replace function public.notify_community_support()
returns trigger language plpgsql security definer set search_path = public
as $$ declare owner_id uuid; actor_name text; post_kind text; begin
  select user_id, kind into owner_id, post_kind from public.community_posts where id = new.post_id;
  select coalesce(full_name, 'Member') into actor_name from public.profiles where id = new.user_id;
  perform public.create_gto_notification(owner_id, 'support', actor_name, case when post_kind = 'prayer' then 'is praying with you.' else 'said Amen to your testimony.' end, '/community-wall#community-' || new.post_id);
  return new;
end; $$;

create or replace function public.notify_media_reaction()
returns trigger language plpgsql security definer set search_path = public
as $$ declare owner_id uuid; actor_name text; post_title text; begin
  if new.liked then
    select published_by, title into owner_id, post_title from public.media_posts where id = new.media_post_id;
    select coalesce(full_name, 'Member') into actor_name from public.profiles where id = new.user_id;
    perform public.create_gto_notification(owner_id, 'like', actor_name, 'liked "' || post_title || '".', '/media#media-' || new.media_post_id);
  end if;
  return new;
end; $$;

create or replace function public.notify_media_comment()
returns trigger language plpgsql security definer set search_path = public
as $$ declare owner_id uuid; actor_name text; post_title text; begin
  select published_by, title into owner_id, post_title from public.media_posts where id = new.media_post_id;
  select coalesce(full_name, 'Member') into actor_name from public.profiles where id = new.user_id;
  perform public.create_gto_notification(owner_id, 'reply', actor_name, 'replied to "' || post_title || '".', '/media#media-' || new.media_post_id);
  return new;
end; $$;

create or replace function public.notify_new_media_post()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.notifications (user_id, type, title, body, link)
  select id, 'update', 'New from GTO', new.title, '/media#media-' || new.id
  from public.profiles where id <> new.published_by;
  return new;
end; $$;

create or replace function public.notify_devotional_engagement()
returns trigger language plpgsql security definer set search_path = public
as $$ declare actor_name text; devotional_title text; commenter uuid; begin
  if new.liked and (tg_op = 'INSERT' or not coalesce(old.liked, false)) then
    select title into devotional_title from public.devotionals where id = new.devotional_id;
    select coalesce(full_name, 'Member') into actor_name from public.profiles where id = new.user_id;
    for commenter in select distinct user_id from public.devotional_comments where devotional_id = new.devotional_id and user_id <> new.user_id loop
      perform public.create_gto_notification(commenter, 'like', actor_name, 'liked the conversation around "' || devotional_title || '".', '/devotional?id=' || new.devotional_id);
    end loop;
  end if;
  return new;
end; $$;

create or replace function public.notify_devotional_comment()
returns trigger language plpgsql security definer set search_path = public
as $$ declare actor_name text; devotional_title text; commenter uuid; begin
  select title into devotional_title from public.devotionals where id = new.devotional_id;
  select coalesce(full_name, 'Member') into actor_name from public.profiles where id = new.user_id;
  for commenter in select distinct user_id from public.devotional_comments where devotional_id = new.devotional_id and user_id <> new.user_id loop
    perform public.create_gto_notification(commenter, 'reply', actor_name, 'replied in the conversation around "' || devotional_title || '".', '/devotional?id=' || new.devotional_id);
  end loop;
  return new;
end; $$;

create or replace function public.notify_community_comment()
returns trigger language plpgsql security definer set search_path = public
as $$ declare owner_id uuid; actor_name text; post_title text; begin
  select user_id, title into owner_id, post_title from public.community_posts where id = new.post_id;
  select coalesce(full_name, 'Member') into actor_name from public.profiles where id = new.user_id;
  perform public.create_gto_notification(owner_id, 'reply', actor_name, 'replied to "' || post_title || '".', '/community-wall#community-' || new.post_id);
  return new;
end; $$;

do $$ begin
  if to_regclass('public.community_support') is not null then
    drop trigger if exists on_community_support_notification on public.community_support;
    create trigger on_community_support_notification after insert on public.community_support for each row execute procedure public.notify_community_support();
  end if;
  if to_regclass('public.media_reactions') is not null then
    drop trigger if exists on_media_reaction_notification on public.media_reactions;
    create trigger on_media_reaction_notification after insert or update on public.media_reactions for each row execute procedure public.notify_media_reaction();
  end if;
  if to_regclass('public.media_comments') is not null then
    drop trigger if exists on_media_comment_notification on public.media_comments;
    create trigger on_media_comment_notification after insert on public.media_comments for each row execute procedure public.notify_media_comment();
  end if;
  if to_regclass('public.media_posts') is not null then
    drop trigger if exists on_new_media_post_notification on public.media_posts;
    create trigger on_new_media_post_notification after insert on public.media_posts for each row execute procedure public.notify_new_media_post();
  end if;
  if to_regclass('public.devotional_engagement') is not null then
    drop trigger if exists on_devotional_engagement_notification on public.devotional_engagement;
    create trigger on_devotional_engagement_notification after insert or update on public.devotional_engagement for each row execute procedure public.notify_devotional_engagement();
  end if;
  if to_regclass('public.devotional_comments') is not null then
    drop trigger if exists on_devotional_comment_notification on public.devotional_comments;
    create trigger on_devotional_comment_notification after insert on public.devotional_comments for each row execute procedure public.notify_devotional_comment();
  end if;
  if to_regclass('public.community_comments') is not null then
    drop trigger if exists on_community_comment_notification on public.community_comments;
    create trigger on_community_comment_notification after insert on public.community_comments for each row execute procedure public.notify_community_comment();
  end if;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null;
end $$;