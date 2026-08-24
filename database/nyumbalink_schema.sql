-- NyumbaLink — Student Apartment & Rental Management System
-- Full platform schema (Phase 1 MVP + Phase 2 entities).
-- HOW TO RUN: open your Supabase project → SQL Editor → paste this file → Run.
-- Every public table gets explicit GRANTs (PostgREST does not grant by default).

-- ============ ROLES ============
create type public.app_role as enum (
  'super_admin', 'landlord', 'property_manager', 'caretaker',
  'accountant', 'maintenance_staff', 'security', 'cleaner',
  'tenant', 'service_provider'
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can read their own roles"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'super_admin'));

-- ============ PROPERTY HIERARCHY ============
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid references auth.users(id) on delete set null,
  name text not null,
  code text not null,
  type text not null default 'apartment',
  address text default '',
  county text default '',
  town text default '',
  nearby_school text default '',
  gps_lat numeric,
  gps_lng numeric,
  construction_year int,
  manager_name text default '',
  caretaker_name text default '',
  phone text default '',
  amenities text[] default '{}',
  description text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  code text not null,
  floors int not null default 1,
  created_at timestamptz not null default now()
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  building_id uuid references public.buildings(id) on delete set null,
  label text not null,                 -- e.g. "B-204"
  floor text default '',
  type text not null default 'bedsitter',
  rent numeric not null default 0,
  deposit numeric not null default 0,
  status text not null default 'vacant'
    check (status in ('occupied','vacant','reserved','notice','maintenance','cleaning','unavailable')),
  max_occupants int not null default 1,
  furnished boolean not null default false,
  internet boolean not null default false,
  water_meter text default '',
  electricity_meter text default '',
  status_changed_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.beds (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  label text not null,                 -- e.g. "Bed A"
  rent numeric not null default 0,
  status text not null default 'vacant'
    check (status in ('occupied','vacant','reserved','maintenance')),
  created_at timestamptz not null default now()
);

-- ============ TENANTS & LEASES ============
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  unit_id uuid references public.units(id) on delete set null,
  bed_id uuid references public.beds(id) on delete set null,
  name text not null,
  national_id text default '',
  phone text default '',
  email text default '',
  is_student boolean not null default false,
  school text default '',
  course text default '',
  reg_number text default '',
  year_of_study int,
  emergency_contact_name text default '',
  emergency_contact_phone text default '',
  move_in_date date,
  move_out_date date,
  status text not null default 'active' check (status in ('active','notice','moved_out')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  rent numeric not null,
  deposit numeric not null default 0,
  payment_frequency text not null default 'monthly',
  status text not null default 'active' check (status in ('active','expired','terminated','renewed')),
  document_url text,
  signed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============ RENT / BILLING ============
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,
  period text not null,                -- "2026-08"
  amount numeric not null,
  penalty_amount numeric not null default 0,
  due_date date not null,
  waived boolean not null default false,
  disputed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (tenant_id, period)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  unit_id uuid references public.units(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  amount numeric not null,
  paid_at timestamptz not null default now(),
  method text not null default 'mpesa' check (method in ('mpesa','bank','cash','card','other')),
  reference text default '',
  receipt_no text not null unique,
  received_by text default '',
  note text default '',
  created_at timestamptz not null default now()
);

create table public.deposits (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  unit_id uuid references public.units(id) on delete set null,
  amount numeric not null,
  date_paid date,
  reference text default '',
  refunded_amount numeric not null default 0,
  refund_date date,
  status text not null default 'held'
    check (status in ('held','partially_refunded','refunded','forfeited')),
  created_at timestamptz not null default now()
);

create table public.deposit_deductions (
  id uuid primary key default gen_random_uuid(),
  deposit_id uuid not null references public.deposits(id) on delete cascade,
  amount numeric not null,
  reason text not null,
  deducted_at date not null default current_date
);

-- ============ FINANCE ============
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  building_id uuid references public.buildings(id) on delete set null,
  category text not null,
  description text default '',
  amount numeric not null,
  incurred_on date not null default current_date,
  payee text default '',
  created_at timestamptz not null default now()
);

create table public.meter_readings (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  type text not null check (type in ('water','electricity')),
  previous_reading numeric not null default 0,
  current_reading numeric not null default 0,
  cost numeric not null default 0,
  read_on date not null default current_date,
  created_at timestamptz not null default now()
);

-- ============ MAINTENANCE & INSPECTIONS ============
create table public.maintenance_tickets (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,         -- MNT-00034
  property_id uuid references public.properties(id) on delete cascade,
  unit_id uuid references public.units(id) on delete set null,
  tenant_id uuid references public.tenants(id) on delete set null,
  title text not null,
  category text not null default 'Other',
  priority text not null default 'normal'
    check (priority in ('low','normal','high','urgent','emergency')),
  description text default '',
  status text not null default 'new'
    check (status in ('new','assigned','in_progress','waiting_parts','completed','rejected','cancelled')),
  assigned_to text default '',
  estimated_cost numeric,
  actual_cost numeric,
  photo_urls text[] default '{}',
  reported_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.inspections (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  type text not null default 'routine'
    check (type in ('move_in','move_out','routine','emergency','safety','maintenance')),
  inspected_on date not null default current_date,
  inspector text default '',
  condition text not null default 'good' check (condition in ('excellent','good','fair','poor')),
  checklist jsonb not null default '{}',
  notes text default '',
  photo_urls text[] default '{}',
  created_at timestamptz not null default now()
);

-- ============ COMMUNICATION ============
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  title text not null,
  message text not null,
  audience text not null default 'all' check (audience in ('all','property','building','unit')),
  target_id uuid,
  priority text not null default 'normal' check (priority in ('normal','urgent','emergency')),
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  title text not null,
  message text default '',
  kind text not null default 'general',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  category text not null default 'Other',
  description text default '',
  status text not null default 'open' check (status in ('open','investigating','resolved')),
  resolution text default '',
  created_at timestamptz not null default now()
);

create table public.visitors (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  phone text default '',
  id_ref text default '',
  vehicle_reg text default '',
  entry_time timestamptz not null default now(),
  exit_time timestamptz
);

-- ============ STAFF / DOCUMENTS / AUDIT ============
create table public.staff (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  phone text default '',
  role text not null default 'caretaker',
  salary numeric not null default 0,
  schedule text default '',
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  unit_id uuid references public.units(id) on delete set null,
  name text not null,
  kind text not null default 'other',  -- lease, id, receipt, inspection, insurance...
  file_url text not null,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_label text not null default 'system',
  action text not null,
  entity text default '',
  entity_id uuid,
  detail text default '',
  created_at timestamptz not null default now()
);

-- ============ GRANTS ============
-- MVP posture: authenticated users get full CRUD (the app currently uses
-- shared access codes rather than per-landlord accounts). Tighten these
-- policies to landlord-scoped rows (landlord_id = auth.uid()) when account
-- linking ships.
grant select, insert, update, delete on public.properties,
  public.buildings, public.units, public.beds, public.tenants, public.leases,
  public.invoices, public.payments, public.deposits, public.deposit_deductions,
  public.expenses, public.meter_readings, public.maintenance_tickets,
  public.inspections, public.announcements, public.notifications,
  public.complaints, public.visitors, public.staff, public.documents,
  public.audit_logs
to authenticated;
grant all on all tables in schema public to service_role;

-- ============ RLS ============
alter table public.properties enable row level security;
alter table public.buildings enable row level security;
alter table public.units enable row level security;
alter table public.beds enable row level security;
alter table public.tenants enable row level security;
alter table public.leases enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.deposits enable row level security;
alter table public.deposit_deductions enable row level security;
alter table public.expenses enable row level security;
alter table public.meter_readings enable row level security;
alter table public.maintenance_tickets enable row level security;
alter table public.inspections enable row level security;
alter table public.announcements enable row level security;
alter table public.notifications enable row level security;
alter table public.complaints enable row level security;
alter table public.visitors enable row level security;
alter table public.staff enable row level security;
alter table public.documents enable row level security;
alter table public.audit_logs enable row level security;

-- MVP: any signed-in user may read/write operational data.
create policy "mvp_authenticated_all" on public.properties for all to authenticated using (true) with check (true);
create policy "mvp_authenticated_all" on public.buildings for all to authenticated using (true) with check (true);
create policy "mvp_authenticated_all" on public.units for all to authenticated using (true) with check (true);
create policy "mvp_authenticated_all" on public.beds for all to authenticated using (true) with check (true);
create policy "mvp_authenticated_all" on public.tenants for all to authenticated using (true) with check (true);
create policy "mvp_authenticated_all" on public.leases for all to authenticated using (true) with check (true);
create policy "mvp_authenticated_all" on public.invoices for all to authenticated using (true) with check (true);
create policy "mvp_authenticated_all" on public.payments for all to authenticated using (true) with check (true);
create policy "mvp_authenticated_all" on public.deposits for all to authenticated using (true) with check (true);
create policy "mvp_authenticated_all" on public.expenses for all to authenticated using (true) with check (true);
create policy "mvp_authenticated_all" on public.meter_readings for all to authenticated using (true) with check (true);
create policy "mvp_authenticated_all" on public.maintenance_tickets for all to authenticated using (true) with check (true);
create policy "mvp_authenticated_all" on public.inspections for all to authenticated using (true) with check (true);
create policy "mvp_authenticated_all" on public.announcements for all to authenticated using (true) with check (true);
create policy "mvp_authenticated_all" on public.notifications for all to authenticated using (true) with check (true);
create policy "mvp_authenticated_all" on public.complaints for all to authenticated using (true) with check (true);
create policy "mvp_authenticated_all" on public.visitors for all to authenticated using (true) with check (true);
create policy "mvp_authenticated_all" on public.staff for all to authenticated using (true) with check (true);
create policy "mvp_authenticated_all" on public.documents for all to authenticated using (true) with check (true);
create policy "mvp_authenticated_all" on public.audit_logs for all to authenticated using (true) with check (true);

-- ============ updated_at trigger ============
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger properties_touch before update on public.properties
  for each row execute function public.touch_updated_at();
create trigger tenants_touch before update on public.tenants
  for each row execute function public.touch_updated_at();

-- ============ INDEXES ============
create index idx_buildings_property on public.buildings(property_id);
create index idx_units_property on public.units(property_id);
create index idx_units_building on public.units(building_id);
create index idx_tenants_unit on public.tenants(unit_id);
create index idx_tenants_property on public.tenants(property_id);
create index idx_invoices_tenant on public.invoices(tenant_id);
create index idx_payments_tenant on public.payments(tenant_id);
create index idx_payments_paid_at on public.payments(paid_at);
create index idx_expenses_property on public.expenses(property_id);
create index idx_tickets_unit on public.maintenance_tickets(unit_id);
create index idx_notifications_user on public.notifications(user_id);

-- ============ DEMO SEED DATA ============
-- One sample portfolio so dashboards are not empty on first run.
insert into public.properties (id, name, code, type, address, county, town, nearby_school, construction_year, manager_name, caretaker_name, phone, amenities, description)
values
  ('11111111-1111-1111-1111-111111111111', 'Amani Apartments', 'AMN', 'apartment', 'Moi Avenue, off University Way', 'Nairobi', 'Nairobi', 'University of Nairobi', 2018, 'Peter Njoroge', 'James Mwangi', '0712345000', array['Wi-Fi','CCTV','Security','Borehole','Parking'], 'Modern mid-rise apartments popular with UoN students.'),
  ('22222222-2222-2222-2222-222222222222', 'SEKU Student Residences', 'SEKU', 'student_hostel', 'Kwa Vonza, Kitui Road', 'Machakos', 'Machakos', 'South Eastern Kenya University', 2021, 'Peter Njoroge', 'Susan Kaluki', '0722334455', array['Wi-Fi','Study Room','Water','Security','Laundry'], 'Purpose-built student accommodation 1.2 km from the SEKU main gate.');

insert into public.buildings (id, property_id, name, code, floors)
values
  ('aaaaaaaa-0000-0000-0000-00000000000a', '11111111-1111-1111-1111-111111111111', 'A', 'AMN-A', 3),
  ('aaaaaaaa-0000-0000-0000-00000000000b', '11111111-1111-1111-1111-111111111111', 'B', 'AMN-B', 2),
  ('bbbbbbbb-0000-0000-0000-00000000000a', '22222222-2222-2222-2222-222222222222', 'A', 'SEKU-A', 2),
  ('bbbbbbbb-0000-0000-0000-00000000000b', '22222222-2222-2222-2222-222222222222', 'B', 'SEKU-B', 2);

-- 4 units per floor for each building
insert into public.units (property_id, building_id, label, floor, type, rent, deposit, status, max_occupants, internet)
select
  b.property_id,
  b.id,
  b.name || '-' || f || lpad(u::text, 1, '0'),
  case f when 0 then 'Ground Floor' when 1 then '1st Floor' when 2 then '2nd Floor' else '3rd Floor' end,
  case when b.property_id = '11111111-1111-1111-1111-111111111111'
       then (array['bedsitter','one_bedroom','one_bedroom','two_bedroom'])[u]
       else (array['bedsitter','bedsitter','bedsitter','shared_room'])[u] end,
  case when b.property_id = '11111111-1111-1111-1111-111111111111'
       then (array[12000,16000,16000,20000])[u]
       else (array[6500,7500,7500,8500])[u] end,
  case when b.property_id = '11111111-1111-1111-1111-111111111111'
       then (array[12000,16000,16000,20000])[u]
       else (array[6500,7500,7500,8500])[u] end,
  'vacant',
  1,
  true
from public.buildings b
cross join generate_series(0, 2) as f
cross join generate_series(1, 4) as u
where f < b.floors;
