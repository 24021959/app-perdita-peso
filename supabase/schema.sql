-- Schema per la sincronizzazione online dell'app (Supabase / Postgres).
-- Applicato il 30 ottobre 2026 sul progetto "assistente-locanda" (ref btknuzypyvcmjwmrktto).
-- Per passare a un altro database: eseguire questo file nel nuovo progetto, cambiare SUPABASE_URL e
-- SUPABASE_KEY in src/lib/config.ts, aggiungere l'URL dell'app tra i "Redirect URLs" di Authentication,
-- accedere dall'app (il primo accesso rivendica il ruolo di proprietario) e premere "Sincronizza ora".
-- Nel nuovo database cambiare anche l'email del proprietario in peso_claim_owner, se diversa.

-- ---- proprietario: l'unico utente che può leggere e scrivere i dati dell'app
create table if not exists public.peso_owner (
  singleton boolean primary key default true check (singleton),
  user_id uuid not null unique references auth.users (id),
  created_at timestamptz not null default now()
);
alter table public.peso_owner enable row level security;

drop policy if exists "owner legge se stesso" on public.peso_owner;
create policy "owner legge se stesso" on public.peso_owner
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.peso_is_owner()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.peso_owner o where o.user_id = (select auth.uid())); $$;

-- Rivendica il ruolo di proprietario: solo per l'email confermata indicata qui sotto.
create or replace function public.peso_claim_owner()
returns boolean language plpgsql security definer set search_path = ''
as $$
declare
  v_email text;
  v_confirmed timestamptz;
begin
  select email, email_confirmed_at into v_email, v_confirmed
  from auth.users where id = (select auth.uid());
  if v_email is null or v_confirmed is null then return false; end if;
  if lower(v_email) <> 'antonellobordoni@gmail.com' then return false; end if;
  insert into public.peso_owner (user_id) values ((select auth.uid())) on conflict do nothing;
  return public.peso_is_owner();
end;
$$;

revoke execute on function public.peso_is_owner() from public, anon;
revoke execute on function public.peso_claim_owner() from public, anon;
grant execute on function public.peso_is_owner() to authenticated;
grant execute on function public.peso_claim_owner() to authenticated;

-- ---- dati sincronizzati: specchio di ciò che l'app salva nel dispositivo
create table if not exists public.peso_sync_entries (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  giorno date not null,
  dati jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, giorno),
  constraint peso_sync_entries_dati_size check (octet_length(dati::text) < 20000)
);

create table if not exists public.peso_sync_kv (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  chiave text not null,
  valore jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, chiave),
  constraint peso_sync_kv_chiave_check check (length(chiave) <= 100 and chiave !~ '^sync:'),
  constraint peso_sync_kv_valore_size check (octet_length(valore::text) < 200000)
);

alter table public.peso_sync_entries enable row level security;
alter table public.peso_sync_kv enable row level security;

drop policy if exists "solo proprietario" on public.peso_sync_entries;
create policy "solo proprietario" on public.peso_sync_entries
  for all to authenticated
  using ((select public.peso_is_owner()) and user_id = (select auth.uid()))
  with check ((select public.peso_is_owner()) and user_id = (select auth.uid()));

drop policy if exists "solo proprietario" on public.peso_sync_kv;
create policy "solo proprietario" on public.peso_sync_kv
  for all to authenticated
  using ((select public.peso_is_owner()) and user_id = (select auth.uid()))
  with check ((select public.peso_is_owner()) and user_id = (select auth.uid()));

revoke all on table public.peso_sync_entries from anon;
revoke all on table public.peso_sync_kv from anon;
grant select, insert, update, delete on table public.peso_sync_entries to authenticated;
grant select, insert, update, delete on table public.peso_sync_kv to authenticated;
