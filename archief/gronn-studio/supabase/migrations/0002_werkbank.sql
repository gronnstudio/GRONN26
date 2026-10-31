-- The Werkbank: what a project IS, beyond who owns it.
--
-- `0001` answered "which household, which garden, what runs on it". It
-- could not answer the question the studio actually asks every morning:
-- what do I do today, and which of these is going to become work. A
-- project had a name and an address and nothing that moves.
--
-- What moves is here. A phase, a chance, a value — enough to weigh a
-- pipeline. One next action, because a list of seven next actions is a
-- list of none. And four child tables for the parts of a project a
-- client is entitled to see: what was agreed, what is planned, what we
-- need from them, and what it costs.
--
-- The posture from `0001` is unchanged and deliberate: RLS on, deny by
-- default, reads for the owning client only, and every write from a
-- server route holding the service role. There is no insert, update or
-- delete policy in this file either. That is not an omission — the anon
-- key must never be able to write a phase or a price.
--
-- Re-runnable, like `0001`, and for the same reason: a migration runs as
-- one transaction, so one unguarded statement rolls back everything
-- after it and leaves somebody with half a schema and an error about a
-- type they already had. Every `create type` is wrapped; every column
-- addition uses `if not exists`.

-- ────────────────────────────────────────────────────────────── types

-- The phases, in the order a project passes through them. The order is
-- load-bearing: the pipeline columns and the client's progress track
-- both read it, and an enum keeps a typo out of the database rather than
-- discovering it in a filter that silently matches nothing.
do $$
begin
  create type public.project_phase as enum (
    'aanvraag',
    'intake',
    'offerte',
    'akkoord',
    'uitvoering',
    'opgeleverd',
    'onderhoud'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.step_status as enum ('open', 'bezig', 'klaar');
exception
  when duplicate_object then null;
end $$;

-- An instalment is not paid or unpaid. It is planned, then invoiced,
-- then settled — and the middle state is the one worth having, because
-- "invoiced 34 days ago and still open" is the sentence the panel needs
-- to be able to say.
do $$
begin
  create type public.term_status as enum ('open', 'gefactureerd', 'betaald');
exception
  when duplicate_object then null;
end $$;

-- ─────────────────────────────────────────────────────────── projects

-- MONEY IS CENTS, AS AN INTEGER, EVERYWHERE IN THIS FILE.
--
-- Not `numeric`, and emphatically not a float. A quote of € 14.500 that
-- comes back out of a sum as 14499.999999 is a bug the studio would find
-- by reading it to a client down the phone. `bigint` cents cannot drift,
-- sorts correctly, and adds without a rounding rule.
alter table public.projects
  add column if not exists phase public.project_phase not null default 'aanvraag';

alter table public.projects
  add column if not exists chance integer;

-- A percentage or nothing. Named so the constraint says what it is when
-- it fires, and added separately because `add column if not exists` will
-- not re-add a check to a column that already exists.
do $$
begin
  alter table public.projects
    add constraint projects_chance_range check (chance is null or (chance >= 0 and chance <= 100));
exception
  when duplicate_object then null;
end $$;

alter table public.projects
  add column if not exists value_cents bigint;

alter table public.projects
  add column if not exists next_action text;

alter table public.projects
  add column if not exists next_action_on date;

-- The enquiry this project came out of, by its archive reference.
--
-- Deliberately a bare text column and NOT a foreign key: intakes live in
-- Vercel Blob, not in Postgres, so there is nothing here to point at. A
-- reference that no longer resolves is a dangling label, which is the
-- honest failure — better than a constraint this database cannot check.
alter table public.projects
  add column if not exists intake_ref text;

create index if not exists projects_phase_idx on public.projects (phase);

-- ────────────────────────────────────────────────── the four children
--
-- Each hangs off a project and dies with it (`on delete cascade`), and
-- each carries a `position` because these are ordered lists a person
-- arranges by hand — the order is part of the content, not a detail of
-- how they were typed.

-- What was agreed, in the client's own terms. Three lines on the sheet
-- the client reads; the thing to point at when a design drifts.
create table if not exists public.project_points (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  position   integer not null default 0,
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists project_points_project_idx
  on public.project_points (project_id, position);

-- The planning. `due_on` is nullable on purpose: "beplanting oeverzone,
-- somewhere after the folie" is a real state, and forcing a date on it
-- would make the panel show a deadline nobody agreed to.
create table if not exists public.project_steps (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  position   integer not null default 0,
  label      text not null,
  due_on     date,
  status     public.step_status not null default 'open',
  created_at timestamptz not null default now()
);
create index if not exists project_steps_project_idx
  on public.project_steps (project_id, position);

-- What the studio is waiting on from the client. `received_at` rather
-- than a boolean, because when it arrived is the part that matters when
-- a project has been standing still for three weeks.
create table if not exists public.project_asks (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  position    integer not null default 0,
  label       text not null,
  received_at timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists project_asks_project_idx
  on public.project_asks (project_id, position);

-- The instalments. `document_id` points at a StudioDocument in Blob once
-- one exists — same reasoning as `intake_ref`: a text label, not a
-- foreign key, because the target is not in this database.
create table if not exists public.project_terms (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  position     integer not null default 0,
  label        text not null,
  amount_cents bigint not null default 0,
  status       public.term_status not null default 'open',
  due_on       date,
  document_id  text,
  created_at   timestamptz not null default now()
);
create index if not exists project_terms_project_idx
  on public.project_terms (project_id, position);

-- ────────────────────────────────────────────────────── subscriptions

-- "The maintenance visit is overdue" was a guess derived from
-- `renews_at`, which is when the CONTRACT renews, not when somebody last
-- stood in the garden. Two different facts; the panel needs the second.
alter table public.subscriptions
  add column if not exists last_visit_on date;

alter table public.subscriptions
  add column if not exists next_visit_on date;

-- ────────────────────────────────────────────────────────────── RLS
--
-- Same shape as `0001`: enable, then grant SELECT to the owning client
-- and nothing else. Each child reaches its client through its project,
-- so the chain is child → project → client → auth.uid().
--
-- `create policy` has no `if not exists` in the Postgres versions this
-- targets, so each is guarded the same way the types are. A second run
-- must be a no-op, not a rollback.

alter table public.project_points enable row level security;
alter table public.project_steps  enable row level security;
alter table public.project_asks   enable row level security;
alter table public.project_terms  enable row level security;

do $$
begin
  create policy "project points read by their client"
    on public.project_points for select
    using (
      exists (
        select 1
        from public.projects p
        join public.clients c on c.id = p.client_id
        where p.id = project_points.project_id and c.auth_user_id = auth.uid()
      )
    );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create policy "project steps read by their client"
    on public.project_steps for select
    using (
      exists (
        select 1
        from public.projects p
        join public.clients c on c.id = p.client_id
        where p.id = project_steps.project_id and c.auth_user_id = auth.uid()
      )
    );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create policy "project asks read by their client"
    on public.project_asks for select
    using (
      exists (
        select 1
        from public.projects p
        join public.clients c on c.id = p.client_id
        where p.id = project_asks.project_id and c.auth_user_id = auth.uid()
      )
    );
exception
  when duplicate_object then null;
end $$;

-- Amounts included, deliberately. A client may see what their own
-- garden costs — that is the whole point of the instalment list on their
-- sheet. What they may not see is anybody else's, and the policy above
-- is what enforces that rather than a filter in a route.
do $$
begin
  create policy "project terms read by their client"
    on public.project_terms for select
    using (
      exists (
        select 1
        from public.projects p
        join public.clients c on c.id = p.client_id
        where p.id = project_terms.project_id and c.auth_user_id = auth.uid()
      )
    );
exception
  when duplicate_object then null;
end $$;
