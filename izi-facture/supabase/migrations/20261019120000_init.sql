-- =====================================================================
-- IZI FACTURE — Schéma initial
-- 1 compte = 1 entreprise (table company_members prête pour l'équipe plus tard)
-- Montants en FCFA stockés en entiers (bigint), sans décimales.
-- Sécurité : RLS sur toutes les tables, chaque utilisateur ne voit que son entreprise.
-- =====================================================================

-- ---------- Types ----------
create type public.invoice_status as enum ('brouillon', 'envoyee', 'payee', 'annulee', 'en_retard');
create type public.currency_code as enum ('XOF', 'XAF', 'EUR', 'USD');
create type public.member_role as enum ('owner', 'admin', 'member');

-- ---------- Mise à jour automatique de updated_at ----------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Entreprises (= Paramètres) ----------
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  company_name text not null default 'Mon entreprise' check (length(trim(company_name)) > 0),
  registration_number text,
  address_line1 text not null default '',
  city text not null default '',
  country text not null default '',
  phone text,
  email text,
  currency public.currency_code not null default 'XOF',
  tax_rate numeric(5, 2) not null default 18 check (tax_rate between 0 and 100),
  invoice_prefix text not null default 'FACT' check (invoice_prefix ~ '^[A-Z0-9]{1,10}$'),
  payment_terms_days integer not null default 30 check (payment_terms_days between 0 and 365),
  default_notes text default 'Paiement exigible sous 30 jours nets. Merci pour votre confiance.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger companies_updated_at before update on public.companies
  for each row execute function public.set_updated_at();

-- ---------- Membres d'une entreprise ----------
create table public.company_members (
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.member_role not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create index company_members_user_id_idx on public.company_members (user_id);

-- ---------- Clients ----------
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  email text,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_company_id_idx on public.clients (company_id);

create trigger clients_updated_at before update on public.clients
  for each row execute function public.set_updated_at();

-- ---------- Factures ----------
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  invoice_number text not null check (length(trim(invoice_number)) > 0),
  -- Copie des coordonnées du client au moment de la facture (la facture reste valable si le client change)
  client_name text not null,
  client_email text,
  client_phone text,
  status public.invoice_status not null default 'brouillon',
  issue_date date not null,
  due_date date not null,
  currency public.currency_code not null default 'XOF',
  tax_rate numeric(5, 2) not null default 18 check (tax_rate between 0 and 100),
  discount_rate numeric(5, 2) not null default 0 check (discount_rate between 0 and 100),
  subtotal bigint not null default 0 check (subtotal >= 0),
  discount_amount bigint not null default 0 check (discount_amount >= 0),
  taxable_amount bigint not null default 0 check (taxable_amount >= 0),
  tax_amount bigint not null default 0 check (tax_amount >= 0),
  total bigint not null default 0 check (total >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Un numéro de facture n'existe qu'une fois par entreprise
  unique (company_id, invoice_number)
);

create index invoices_company_id_idx on public.invoices (company_id);
create index invoices_client_id_idx on public.invoices (client_id);

create trigger invoices_updated_at before update on public.invoices
  for each row execute function public.set_updated_at();

-- ---------- Lignes de facture ----------
create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  position integer not null default 0,
  description text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price bigint not null default 0 check (unit_price >= 0),
  line_total bigint not null default 0 check (line_total >= 0)
);

create index invoice_items_invoice_id_idx on public.invoice_items (invoice_id);
create index invoice_items_company_id_idx on public.invoice_items (company_id);

-- ---------- Vue : factures + retard calculé automatiquement ----------
-- En retard = statut "en_retard" OU facture envoyée dont l'échéance est dépassée
create view public.invoices_with_status
with (security_invoker = true) as
select
  i.*,
  (i.status = 'en_retard' or (i.status = 'envoyee' and i.due_date < current_date)) as is_late
from public.invoices i;

-- =====================================================================
-- Sécurité (RLS)
-- =====================================================================

-- L'utilisateur connecté est-il membre de cette entreprise ?
create function public.is_company_member(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.company_members
    where company_id = p_company_id and user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_company_member(uuid) from public, anon;
grant execute on function public.is_company_member(uuid) to authenticated;

alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.clients enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

-- Entreprise : lecture et modification par ses membres (création/suppression par le système uniquement)
create policy "Membres : lire leur entreprise" on public.companies
  for select to authenticated using (public.is_company_member(id));
create policy "Membres : modifier leur entreprise" on public.companies
  for update to authenticated using (public.is_company_member(id)) with check (public.is_company_member(id));

-- Membres : chacun voit ses propres appartenances
create policy "Voir ses appartenances" on public.company_members
  for select to authenticated using (user_id = (select auth.uid()));

-- Clients, factures, lignes : accès complet limité à l'entreprise de l'utilisateur
create policy "Membres : clients" on public.clients
  for all to authenticated
  using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));
create policy "Membres : factures" on public.invoices
  for all to authenticated
  using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));
create policy "Membres : lignes de facture" on public.invoice_items
  for all to authenticated
  using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));

-- Aucun accès pour les visiteurs non connectés
revoke all on public.companies, public.company_members, public.clients,
  public.invoices, public.invoice_items, public.invoices_with_status from anon;

-- =====================================================================
-- Inscription : création automatique de l'entreprise
-- =====================================================================
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company_id uuid;
begin
  insert into public.companies (company_name, email)
  values (
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'company_name'), ''), 'Mon entreprise'),
    new.email
  )
  returning id into v_company_id;

  insert into public.company_members (company_id, user_id, role)
  values (v_company_id, new.id, 'owner');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Enregistrement d'une facture + ses lignes en une seule opération
-- (si une étape échoue, rien n'est enregistré). Respecte la RLS (security invoker).
-- =====================================================================
create function public.save_invoice(p_invoice jsonb, p_items jsonb, p_invoice_id uuid default null)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
  v_company_id uuid := (p_invoice ->> 'company_id')::uuid;
begin
  if not public.is_company_member(v_company_id) then
    raise exception 'Accès refusé à cette entreprise';
  end if;

  if p_invoice_id is null then
    insert into public.invoices (
      company_id, client_id, invoice_number, client_name, client_email, client_phone, status,
      issue_date, due_date, currency, tax_rate, discount_rate, subtotal, discount_amount,
      taxable_amount, tax_amount, total, notes
    ) values (
      v_company_id,
      nullif(p_invoice ->> 'client_id', '')::uuid,
      p_invoice ->> 'invoice_number',
      p_invoice ->> 'client_name',
      p_invoice ->> 'client_email',
      p_invoice ->> 'client_phone',
      coalesce((p_invoice ->> 'status')::public.invoice_status, 'brouillon'),
      (p_invoice ->> 'issue_date')::date,
      (p_invoice ->> 'due_date')::date,
      coalesce((p_invoice ->> 'currency')::public.currency_code, 'XOF'),
      coalesce((p_invoice ->> 'tax_rate')::numeric, 18),
      coalesce((p_invoice ->> 'discount_rate')::numeric, 0),
      coalesce((p_invoice ->> 'subtotal')::bigint, 0),
      coalesce((p_invoice ->> 'discount_amount')::bigint, 0),
      coalesce((p_invoice ->> 'taxable_amount')::bigint, 0),
      coalesce((p_invoice ->> 'tax_amount')::bigint, 0),
      coalesce((p_invoice ->> 'total')::bigint, 0),
      p_invoice ->> 'notes'
    )
    returning id into v_id;
  else
    update public.invoices set
      client_id = nullif(p_invoice ->> 'client_id', '')::uuid,
      invoice_number = p_invoice ->> 'invoice_number',
      client_name = p_invoice ->> 'client_name',
      client_email = p_invoice ->> 'client_email',
      client_phone = p_invoice ->> 'client_phone',
      status = coalesce((p_invoice ->> 'status')::public.invoice_status, status),
      issue_date = (p_invoice ->> 'issue_date')::date,
      due_date = (p_invoice ->> 'due_date')::date,
      currency = coalesce((p_invoice ->> 'currency')::public.currency_code, currency),
      tax_rate = coalesce((p_invoice ->> 'tax_rate')::numeric, tax_rate),
      discount_rate = coalesce((p_invoice ->> 'discount_rate')::numeric, 0),
      subtotal = coalesce((p_invoice ->> 'subtotal')::bigint, 0),
      discount_amount = coalesce((p_invoice ->> 'discount_amount')::bigint, 0),
      taxable_amount = coalesce((p_invoice ->> 'taxable_amount')::bigint, 0),
      tax_amount = coalesce((p_invoice ->> 'tax_amount')::bigint, 0),
      total = coalesce((p_invoice ->> 'total')::bigint, 0),
      notes = p_invoice ->> 'notes'
    where id = p_invoice_id and company_id = v_company_id
    returning id into v_id;

    if v_id is null then
      raise exception 'Facture introuvable';
    end if;

    delete from public.invoice_items where invoice_id = v_id;
  end if;

  insert into public.invoice_items (invoice_id, company_id, position, description, quantity, unit_price, line_total)
  select
    v_id,
    v_company_id,
    (item.ordinality - 1)::integer,
    item.value ->> 'description',
    coalesce((item.value ->> 'quantity')::integer, 1),
    coalesce((item.value ->> 'unit_price')::bigint, 0),
    coalesce((item.value ->> 'line_total')::bigint, 0)
  from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) with ordinality as item(value, ordinality);

  return v_id;
end;
$$;

revoke all on function public.save_invoice(jsonb, jsonb, uuid) from public, anon;
grant execute on function public.save_invoice(jsonb, jsonb, uuid) to authenticated;
