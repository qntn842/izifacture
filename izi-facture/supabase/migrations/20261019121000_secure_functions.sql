-- =====================================================================
-- Correctifs de sécurité (analyseur Supabase) :
-- - handle_new_user : fonction de déclencheur, ne doit pas être appelable via l'API
-- - is_company_member : déplacée dans un schéma privé (non exposé par l'API REST)
--   Les règles RLS suivent automatiquement la fonction déplacée.
-- =====================================================================

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create schema if not exists private;
grant usage on schema private to authenticated;

alter function public.is_company_member(uuid) set schema private;
revoke all on function private.is_company_member(uuid) from public, anon;
grant execute on function private.is_company_member(uuid) to authenticated;

-- save_invoice appelait la fonction par son ancien nom : on la recrée avec le nouveau
create or replace function public.save_invoice(p_invoice jsonb, p_items jsonb, p_invoice_id uuid default null)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
  v_company_id uuid := (p_invoice ->> 'company_id')::uuid;
begin
  if not private.is_company_member(v_company_id) then
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
