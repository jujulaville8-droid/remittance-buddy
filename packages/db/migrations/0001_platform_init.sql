-- ============================================================
-- Remittance Buddy platform tables (Supabase Postgres)
-- Single source of truth; mirrors apps/web/src/lib/local-db.ts
-- RLS everywhere; users only see their own rows
-- ============================================================

create extension if not exists pgcrypto;

-- Enums
do $$ begin
  create type rb_payout_method as enum ('gcash','maya','bank','cash_pickup');
exception when duplicate_object then null; end $$;

do $$ begin
  create type rb_transfer_status as enum (
    'quote','awaiting_payment','payment_received','processing',
    'delivered','failed','cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type rb_affiliate_context as enum ('popup','hero','compare','sidepanel');
exception when duplicate_object then null; end $$;

-- Recipients
create table public.recipients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  relationship text,
  country text not null,
  payout_method rb_payout_method not null,
  gcash_number text,
  maya_number text,
  bank_code text,
  bank_account_number text,
  avatar_color text not null default 'bg-coral-500',
  send_count int not null default 0,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);
create index recipients_user_idx on public.recipients(user_id, created_at desc);

-- Transfers
create table public.transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid references public.recipients(id) on delete set null,
  recipient_name text not null,
  source_amount numeric(18,2) not null,
  source_currency text not null,
  target_amount numeric(18,2) not null,
  target_currency text not null,
  exchange_rate numeric(18,6) not null,
  provider_fee numeric(18,2) not null default 0,
  buddy_fee numeric(18,2) not null default 0,
  total_cost numeric(18,2) not null,
  provider text not null,
  provider_slug text not null,
  provider_transfer_id text,
  status rb_transfer_status not null default 'quote',
  status_history jsonb not null default '[]'::jsonb,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index transfers_user_idx on public.transfers(user_id, created_at desc);
create index transfers_status_idx on public.transfers(status);

-- Rate alerts
create table public.rate_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  corridor text not null,
  source_currency text not null,
  target_currency text not null,
  target_rate numeric(18,6) not null,
  payout_method rb_payout_method not null,
  active boolean not null default true,
  last_triggered_at timestamptz,
  created_at timestamptz not null default now()
);
create index rate_alerts_active_idx on public.rate_alerts(active, corridor) where active;

-- Affiliate clicks
create table public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  provider text not null,
  amount numeric(18,2) not null,
  affiliate_url text not null,
  context rb_affiliate_context not null,
  clicked_at timestamptz not null default now()
);
create index affiliate_clicks_user_idx on public.affiliate_clicks(user_id, clicked_at desc);

-- Family groups + join tables
create table public.family_groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  goal_label text,
  goal_target_amount numeric(18,2),
  goal_currency text,
  created_at timestamptz not null default now()
);
create index family_groups_owner_idx on public.family_groups(owner_id);

create table public.family_group_members (
  group_id uuid not null references public.family_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  added_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table public.family_group_recipients (
  group_id uuid not null references public.family_groups(id) on delete cascade,
  recipient_id uuid not null references public.recipients(id) on delete cascade,
  primary key (group_id, recipient_id)
);

-- Audit log
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_user_idx on public.audit_log(user_id, created_at desc);
create index audit_log_entity_idx on public.audit_log(entity_type, entity_id);

-- Buddy Plus state (one row per user)
create table public.buddy_plus_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default false,
  checkout_session_id text,
  subscription_id text,
  period_end timestamptz,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- RLS
-- ============================================================
alter table public.recipients enable row level security;
alter table public.transfers enable row level security;
alter table public.rate_alerts enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.family_groups enable row level security;
alter table public.family_group_members enable row level security;
alter table public.family_group_recipients enable row level security;
alter table public.audit_log enable row level security;
alter table public.buddy_plus_state enable row level security;

create policy recipients_owner_all on public.recipients for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy transfers_owner_all on public.transfers for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy rate_alerts_owner_all on public.rate_alerts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy affiliate_clicks_insert on public.affiliate_clicks for insert
  with check (auth.uid() = user_id or user_id is null);
create policy affiliate_clicks_select_own on public.affiliate_clicks for select
  using (auth.uid() = user_id);

create policy family_groups_select on public.family_groups for select
  using (
    auth.uid() = owner_id or exists (
      select 1 from public.family_group_members m
      where m.group_id = id and m.user_id = auth.uid()
    )
  );
create policy family_groups_write on public.family_groups for all
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy family_group_members_select on public.family_group_members for select
  using (auth.uid() = user_id or exists (
    select 1 from public.family_groups g where g.id = group_id and g.owner_id = auth.uid()
  ));
create policy family_group_members_owner_write on public.family_group_members for all
  using (exists (select 1 from public.family_groups g where g.id = group_id and g.owner_id = auth.uid()))
  with check (exists (select 1 from public.family_groups g where g.id = group_id and g.owner_id = auth.uid()));

create policy family_group_recipients_owner_all on public.family_group_recipients for all
  using (exists (select 1 from public.family_groups g where g.id = group_id and g.owner_id = auth.uid()))
  with check (exists (select 1 from public.family_groups g where g.id = group_id and g.owner_id = auth.uid()));

create policy audit_log_read_own on public.audit_log for select
  using (auth.uid() = user_id);

create policy buddy_plus_owner_all on public.buddy_plus_state for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- updated_at triggers
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger touch_transfers before update on public.transfers
  for each row execute function public.touch_updated_at();
create trigger touch_buddy_plus before update on public.buddy_plus_state
  for each row execute function public.touch_updated_at();
