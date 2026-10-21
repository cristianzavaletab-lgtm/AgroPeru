create table if not exists public.app_state (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

drop policy if exists "app_state_select" on public.app_state;
create policy "app_state_select"
on public.app_state for select
to anon, authenticated
using (true);

drop policy if exists "app_state_insert" on public.app_state;
create policy "app_state_insert"
on public.app_state for insert
to anon, authenticated
with check (true);

drop policy if exists "app_state_update" on public.app_state;
create policy "app_state_update"
on public.app_state for update
to anon, authenticated
using (true)
with check (true);

grant select, insert, update on public.app_state to anon, authenticated;

do $$
begin
  alter publication supabase_realtime add table public.app_state;
exception
  when duplicate_object then null;
end $$;
