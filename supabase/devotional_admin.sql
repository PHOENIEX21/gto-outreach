-- Run this once in the Supabase SQL Editor for existing projects.
-- It allows admins to edit and remove devotionals from the Content Library.

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'devotionals' and policyname = 'Admins can delete devotionals') then
    create policy "Admins can delete devotionals" on public.devotionals for delete to authenticated using (public.is_admin());
  end if;
end $$;