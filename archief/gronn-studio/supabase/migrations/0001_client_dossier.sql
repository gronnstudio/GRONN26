-- The client dossier: who, which garden, and what runs on it.
--
-- Row Level Security is the point of putting this in Postgres rather
-- than in another JSON blob. Every isolation guarantee in the panel so
-- far rests on a single `if` in application code with nothing underneath
-- it; here the database refuses to return another client's row even if
-- the route asks for it. That second line of defence is what makes it
-- defensible to show a client their own garden at all.
--
-- Posture, fixed in docs/deel-5-website-implementatie.md before any of
-- this was written: RLS on and DENY by default on every table, reads for
-- the owning client only, and every write from a server route holding
-- the service role. The anon key can select its own rows and nothing
-- else; it can insert nothing.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────── clients

create table if not exists public.clients (
  id           uuid primary key default gen_random_uuid(),
  -- Supabase Auth's user, once the person has actually signed up. Null
  -- for a dossier the studio created from a phone call, which is the
  -- normal state for most of them.
  auth_user_id uuid unique references auth.users (id) on delete set null,
  name         text not null,
  -- Lowercased on write. This is what a new account is matched against,
  -- so one inconsistent normalisation is a second dossier for the same
  -- household.
  email        text unique,
  phone        text,
  note         text,
  created_at   timestamptz not null default now(),
  invited_at   timestamptz,
  activated_at timestamptz
);

create index if not exists clients_email_idx on public.clients (lower(email));

-- ────────────────────────────────────────────────────────── projects

create table if not exists public.projects (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references public.clients (id) on delete cascade,
  name       text not null,
  address    text,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists projects_client_idx on public.projects (client_id);

-- ───────────────────────────────────────────────────── subscriptions

-- The one statement in this file that had no `if not exists`, because
-- Postgres does not offer it for a type. Without the guard a second run
-- aborts here with `type "subscription_status" already exists` — and
-- since a migration runs as one transaction, everything AFTER this line
-- is rolled back. Someone re-running the file to be sure would end up
-- with the two tables above and nothing else, while the editor reported
-- an error about a type they already had.
do $$
begin
  create type public.subscription_status as enum ('active', 'paused', 'ended');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.subscriptions (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients (id) on delete cascade,
  project_id   uuid references public.projects (id) on delete set null,
  -- Points into src/lib/data/services.ts rather than copying a price.
  -- The catalogue is the source of truth for what a service costs, and a
  -- subscription carrying its own stale copy is how a client ends up
  -- billed last year's rate.
  service_slug text not null,
  status       public.subscription_status not null default 'active',
  started_at   date not null default current_date,
  renews_at    date,
  ended_at     date
);

create index if not exists subscriptions_client_idx on public.subscriptions (client_id);

-- ───────────────────────────────────────────────────────────── hours

-- The owner's own time, entered by the owner.
--
-- HOURS_MANIFEST.md forbids this project from estimating, inventing or
-- stating hours. That rule is about generated numbers; a register the
-- owner types into is exactly what the document's blank fields describe.
-- Nothing computes a duration here — it stores what he wrote.
create table if not exists public.hours (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects (id) on delete set null,
  client_id  uuid references public.clients (id) on delete set null,
  worked_on  date not null,
  minutes    integer not null check (minutes > 0 and minutes <= 24 * 60),
  note       text,
  created_at timestamptz not null default now()
);

create index if not exists hours_project_idx on public.hours (project_id, worked_on);

-- ────────────────────────────────────────────────────────────── RLS

alter table public.clients       enable row level security;
alter table public.projects      enable row level security;
alter table public.subscriptions enable row level security;
alter table public.hours         enable row level security;

-- No policy is a closed door: with RLS on and nothing granted, every
-- role but the service role sees zero rows. The policies below open
-- exactly one crack each, and only for reading.

create policy "clients read themselves"
  on public.clients for select
  using (auth_user_id = auth.uid());

create policy "projects read by their client"
  on public.projects for select
  using (
    exists (
      select 1 from public.clients c
      where c.id = projects.client_id and c.auth_user_id = auth.uid()
    )
  );

create policy "subscriptions read by their client"
  on public.subscriptions for select
  using (
    exists (
      select 1 from public.clients c
      where c.id = subscriptions.client_id and c.auth_user_id = auth.uid()
    )
  );

-- Deliberately no policy on `hours`. It is the studio's own register and
-- a client has no business reading how long their garden took; the owner
-- reaches it through the service role like every other write.
