-- Marka seçicide boş aramada tüm liste gezilebilsin diye üst sınır 500
create or replace function public.search_brands(p_q text default '', p_limit int default 10)
returns table (id uuid, name text, slug text, post_count int)
language sql stable security definer set search_path = '' as $$
  select b.id, b.name, b.slug,
    (select count(distinct i.post_id) from public.post_items i join public.posts p on p.id = i.post_id
      where i.brand_id = b.id and p.status = 'published')::int as post_count
  from public.brands b
  where coalesce(trim(p_q), '') = ''
     or public.norm(b.name) like '%' || public.norm(p_q) || '%'
     or exists (select 1 from unnest(b.aliases) a where public.norm(a) like '%' || public.norm(p_q) || '%')
     or extensions.similarity(public.norm(b.name), public.norm(p_q)) > 0.35
  order by (public.norm(b.name) like public.norm(p_q) || '%') desc, post_count desc, public.norm(b.name)
  limit least(p_limit, 500)
$$;
