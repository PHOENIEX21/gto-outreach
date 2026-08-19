-- Run this once in the Supabase SQL Editor for existing projects.
-- It allows likes, completions, and encouragements to refresh live for every user.

do $$ begin
  alter publication supabase_realtime add table public.devotional_engagement;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.devotional_comments;
exception when duplicate_object then null;
end $$;
