-- Kombin platformu v1 şeması
-- Not: iş mantığı (maskeleme, yakınlık, arama) veritabanında; web ve ileride mobil aynı sonucu alır.

create extension if not exists unaccent with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- ─────────────────────────────────────────────────────────────
-- Yardımcılar
-- ─────────────────────────────────────────────────────────────

-- Türkçe karakter duyarsız normalleştirme: "Gömlek" → "gomlek", "İPEK" → "ipek"
create or replace function public.norm(t text) returns text
language sql immutable parallel safe set search_path = '' as $$
  select lower(extensions.unaccent('extensions.unaccent'::regdictionary,
    translate(coalesce(t, ''), 'İIıĞÜŞÖÇ', 'iiigusoc')))
$$;

create or replace function public.slugify(t text) returns text
language sql immutable parallel safe set search_path = '' as $$
  select trim(both '-' from regexp_replace(public.norm(t), '[^a-z0-9]+', '-', 'g'))
$$;

-- ─────────────────────────────────────────────────────────────
-- Kullanıcılar
-- ─────────────────────────────────────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_.]{3,30}$'),
  display_name text check (char_length(display_name) <= 50),
  avatar_url text,
  bio text check (char_length(bio) <= 300),
  created_at timestamptz not null default now()
);

-- Herkese açık olmaması gereken profil bilgileri (doğum yılı, rızalar, onboarding durumu)
create table public.profile_private (
  user_id uuid primary key references public.profiles on delete cascade,
  birth_year int check (birth_year between 1900 and 2100),
  kvkk_accepted_at timestamptz,
  measurement_consent_at timestamptz,
  onboarding_step int not null default 1,
  onboarding_done boolean not null default false,
  completion_card_hidden_until timestamptz
);

create table public.admins (
  user_id uuid primary key references public.profiles on delete cascade
);

-- Bu e-postalarla kayıt olan kişi otomatik admin olur
create table public.admin_emails (
  email text primary key
);

create table public.app_settings (
  key text primary key,
  value jsonb not null
);
insert into public.app_settings values ('min_age', '18');

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

create or replace function public.min_age() returns int
language sql stable security definer set search_path = '' as $$
  select coalesce((select (value)::text::int from public.app_settings where key = 'min_age'), 18)
$$;

-- Güncel ölçüler: ham değerler sadece sahibine açık
create table public.body_measurements (
  user_id uuid primary key references public.profiles on delete cascade,
  height_cm numeric check (height_cm between 100 and 230),
  weight_kg numeric check (weight_kg between 30 and 250),
  bust_cm numeric check (bust_cm between 50 and 200),
  waist_cm numeric check (waist_cm between 40 and 200),
  hip_cm numeric check (hip_cm between 50 and 200),
  inseam_cm numeric check (inseam_cm between 40 and 120),
  shoe_size numeric check (shoe_size between 30 and 50),
  usual_top_size text check (char_length(usual_top_size) <= 10),
  usual_bottom_size text check (char_length(usual_bottom_size) <= 10),
  body_type text check (char_length(body_type) <= 30),
  -- {"weight_kg": "public" | "range" | "hidden", ...}; eksik alan = "range"
  visibility jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Katalog
-- ─────────────────────────────────────────────────────────────

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text unique not null check (char_length(name) between 1 and 60),
  slug text unique not null,
  aliases text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Kategoriler + yakınlık grubu + arama eş anlamlıları
create table public.categories (
  slug text primary key,
  label text not null,
  group_key text not null default 'default',
  search_terms text[] not null default '{}',
  position int not null default 0
);

-- Yakınlık ağırlıkları ve toleransları (koda gömülü değil; buradan ayarlanır)
create table public.proximity_config (
  group_key text primary key,
  weights jsonb not null,
  tolerances jsonb not null
);

-- ─────────────────────────────────────────────────────────────
-- Paylaşımlar
-- ─────────────────────────────────────────────────────────────

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  caption text check (char_length(caption) <= 1000),
  status text not null default 'published' check (status in ('published', 'hidden', 'removed')),
  created_at timestamptz not null default now()
);
create index posts_created_idx on public.posts (created_at desc);
create index posts_user_idx on public.posts (user_id, created_at desc);

-- Paylaşım anındaki ölçüler (snapshot). Ayrı tablo: ham hali sadece sahibine açık,
-- herkese maskelenmiş hali RPC'lerle döner.
create table public.post_measurements (
  post_id uuid primary key references public.posts on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  snapshot jsonb not null,
  visibility jsonb not null default '{}'
);

create table public.post_photos (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts on delete cascade,
  storage_path text not null,
  position int not null default 0,
  pose text check (pose in ('front', 'side', 'sitting', 'other'))
);
create index post_photos_post_idx on public.post_photos (post_id, position);

-- İleride ürün kataloğu gelince product_id eklenecek; şimdilik marka + serbest metin
create table public.post_items (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts on delete cascade,
  brand_id uuid references public.brands on delete set null,
  product_name text check (char_length(product_name) <= 120),
  category text references public.categories on update cascade,
  size_bought text not null check (char_length(size_bought) between 1 and 12),
  fit_rating text check (fit_rating in ('tight', 'true', 'loose')),
  length_rating text check (length_rating in ('short', 'true', 'long')),
  fit_note text check (char_length(fit_note) <= 500),
  fabric_note text check (char_length(fabric_note) <= 500),
  product_url text check (product_url ~ '^https?://' and char_length(product_url) <= 1000),
  position int not null default 0
);
create index post_items_post_idx on public.post_items (post_id, position);
create index post_items_brand_idx on public.post_items (brand_id);

create table public.likes (
  user_id uuid not null references public.profiles on delete cascade,
  post_id uuid not null references public.posts on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);
create index likes_post_idx on public.likes (post_id);

create table public.saves (
  user_id uuid not null references public.profiles on delete cascade,
  post_id uuid not null references public.posts on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);
create index saves_post_idx on public.saves (post_id);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts on delete cascade,
  reporter_id uuid references public.profiles on delete set null default auth.uid(),
  reason text not null check (char_length(reason) between 1 and 500),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.user_warnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  message text not null,
  created_at timestamptz not null default now(),
  seen_at timestamptz
);

-- ─────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.profile_private enable row level security;
alter table public.admins enable row level security;
alter table public.admin_emails enable row level security;
alter table public.app_settings enable row level security;
alter table public.body_measurements enable row level security;
alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.proximity_config enable row level security;
alter table public.posts enable row level security;
alter table public.post_measurements enable row level security;
alter table public.post_photos enable row level security;
alter table public.post_items enable row level security;
alter table public.likes enable row level security;
alter table public.saves enable row level security;
alter table public.reports enable row level security;
alter table public.user_warnings enable row level security;

create policy "profiles okunur" on public.profiles for select using (true);
create policy "kendi profilini günceller" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

create policy "kendi gizli profilini okur" on public.profile_private for select using (user_id = auth.uid());
-- Güncelleme sadece belirli kolonlarda (aşağıdaki grant'lere bakın)
create policy "kendi gizli profilini günceller" on public.profile_private for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "admin listesi admine açık" on public.admins for select using (public.is_admin());
create policy "ayarlar okunur" on public.app_settings for select using (true);

create policy "ölçüleri sadece sahibi okur" on public.body_measurements for select using (user_id = auth.uid());
create policy "rızası olan ölçü ekler" on public.body_measurements for insert with check (
  user_id = auth.uid() and exists (
    select 1 from public.profile_private pp
    where pp.user_id = auth.uid() and pp.measurement_consent_at is not null));
create policy "rızası olan ölçü günceller" on public.body_measurements for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and exists (
    select 1 from public.profile_private pp
    where pp.user_id = auth.uid() and pp.measurement_consent_at is not null));
create policy "kendi ölçülerini siler" on public.body_measurements for delete using (user_id = auth.uid());

create policy "markalar okunur" on public.brands for select using (true);
create policy "kategoriler okunur" on public.categories for select using (true);
create policy "yakınlık ayarı okunur" on public.proximity_config for select using (true);

create policy "yayındaki paylaşımlar okunur" on public.posts for select
  using (status = 'published' or user_id = auth.uid() or public.is_admin());
create policy "kendi paylaşımını siler" on public.posts for delete using (user_id = auth.uid());

create policy "snapshot sadece sahibine" on public.post_measurements for select using (user_id = auth.uid());

create policy "görünür paylaşımın fotoğrafları" on public.post_photos for select
  using (exists (select 1 from public.posts p where p.id = post_id));
create policy "görünür paylaşımın ürünleri" on public.post_items for select
  using (exists (select 1 from public.posts p where p.id = post_id));

create policy "kendi beğenilerini okur" on public.likes for select using (user_id = auth.uid());
create policy "beğenir" on public.likes for insert with check (user_id = auth.uid());
create policy "beğeniyi geri alır" on public.likes for delete using (user_id = auth.uid());

create policy "kendi kaydettiklerini okur" on public.saves for select using (user_id = auth.uid());
create policy "kaydeder" on public.saves for insert with check (user_id = auth.uid());
create policy "kaydı geri alır" on public.saves for delete using (user_id = auth.uid());

create policy "şikayet eder" on public.reports for insert with check (reporter_id = auth.uid());
create policy "admin şikayetleri okur" on public.reports for select using (public.is_admin());

create policy "kendi uyarılarını okur" on public.user_warnings for select using (user_id = auth.uid());
create policy "uyarıyı okundu yapar" on public.user_warnings for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Grant'ler (Data API'nin neye erişebildiği açıkça belli olsun)
revoke all on all tables in schema public from anon, authenticated;
grant select on public.profiles, public.brands, public.categories, public.proximity_config,
  public.posts, public.post_photos, public.post_items, public.app_settings to anon, authenticated;
grant update (username, display_name, avatar_url, bio) on public.profiles to authenticated;
grant select on public.profile_private, public.admins, public.body_measurements,
  public.post_measurements, public.likes, public.saves, public.reports, public.user_warnings to authenticated;
grant update (onboarding_step, onboarding_done, completion_card_hidden_until) on public.profile_private to authenticated;
grant insert, update, delete on public.body_measurements to authenticated;
grant delete on public.posts to authenticated;
grant insert, delete on public.likes, public.saves to authenticated;
grant insert on public.reports to authenticated;
grant update (seen_at) on public.user_warnings to authenticated;

-- ─────────────────────────────────────────────────────────────
-- Kayıt
-- ─────────────────────────────────────────────────────────────

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_birth int;
  v_kvkk boolean := coalesce(new.raw_user_meta_data->>'kvkk', '') = 'true';
  v_name text := nullif(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), '');
begin
  if (new.raw_user_meta_data->>'birth_year') ~ '^\d{4}$' then
    v_birth := (new.raw_user_meta_data->>'birth_year')::int;
    if extract(year from now())::int - v_birth < public.min_age() then
      raise exception 'underage' using errcode = 'P0001';
    end if;
  end if;

  insert into public.profiles (id, username, display_name)
  values (new.id, 'u_' || substr(replace(new.id::text, '-', ''), 1, 10), left(v_name, 50));

  insert into public.profile_private (user_id, birth_year, kvkk_accepted_at, onboarding_step)
  values (new.id, v_birth, case when v_kvkk then now() end,
          case when v_birth is not null and v_kvkk then 2 else 1 end);

  if exists (select 1 from public.admin_emails where lower(email) = lower(new.email)) then
    insert into public.admins (user_id) values (new.id);
  end if;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Google ile gelenler için adım 1: doğum yılı + KVKK
create or replace function public.accept_terms(p_birth_year int, p_kvkk boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if not p_kvkk then raise exception 'kvkk_required'; end if;
  if p_birth_year is null or p_birth_year < 1900 or extract(year from now())::int - p_birth_year < public.min_age() then
    raise exception 'underage';
  end if;
  update public.profile_private
     set birth_year = p_birth_year, kvkk_accepted_at = now(), onboarding_step = greatest(onboarding_step, 2)
   where user_id = auth.uid();
end $$;

-- Ölçü verisi için açık rıza ver / geri çek. Geri çekilince ölçüler ve snapshot'lar silinir.
create or replace function public.set_measurement_consent(p_consent boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if p_consent then
    update public.profile_private set measurement_consent_at = coalesce(measurement_consent_at, now())
     where user_id = auth.uid();
  else
    update public.profile_private set measurement_consent_at = null where user_id = auth.uid();
    delete from public.body_measurements where user_id = auth.uid();
    delete from public.post_measurements where user_id = auth.uid();
  end if;
end $$;

create or replace function public.username_available(p_username text) returns boolean
language sql stable security definer set search_path = '' as $$
  select lower(p_username) ~ '^[a-z0-9_.]{3,30}$'
     and not exists (select 1 from public.profiles where username = lower(p_username) and id <> coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'))
$$;

-- ─────────────────────────────────────────────────────────────
-- Maskeleme ve yakınlık (projenin kalbi)
-- ─────────────────────────────────────────────────────────────

-- Ham ölçüleri görünürlük ayarına göre maskeler.
-- public → {"value": 165}; range → {"min": 160, "max": 165}; hidden → hiç dönmez.
create or replace function public.mask_measurements(m jsonb, vis jsonb) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare
  k text; v numeric; mode text; step numeric; lo numeric;
  result jsonb := '{}';
begin
  if m is null then return null; end if;
  foreach k in array array['height_cm', 'weight_kg', 'bust_cm', 'waist_cm', 'hip_cm', 'inseam_cm', 'shoe_size'] loop
    v := (m->>k)::numeric;
    continue when v is null;
    mode := coalesce(vis->>k, 'range');
    if mode = 'public' then
      result := result || jsonb_build_object(k, jsonb_build_object('value', v));
    elsif mode = 'range' then
      step := case k when 'shoe_size' then 2 else 5 end;
      lo := floor(v / step) * step;
      result := result || jsonb_build_object(k, jsonb_build_object('min', lo, 'max', lo + step));
    end if;
  end loop;
  if m->>'body_type' is not null and vis->>'body_type' = 'public' then
    result := result || jsonb_build_object('body_type', jsonb_build_object('value', m->'body_type'));
  end if;
  return result;
end $$;

-- İki ölçü seti arasındaki benzerlik (0–100). En az 2 ortak alan yoksa null.
create or replace function public.proximity_score(a jsonb, b jsonb, p_category text default null) returns int
language plpgsql stable set search_path = '' as $$
declare
  v_weights jsonb; v_tol jsonb;
  k text; w numeric; tol numeric; av numeric; bv numeric;
  sum_w numeric := 0; sum_d numeric := 0; n int := 0;
begin
  if a is null or b is null then return null; end if;
  select pc.weights, pc.tolerances into v_weights, v_tol
    from public.proximity_config pc
   where pc.group_key = coalesce((select c.group_key from public.categories c where c.slug = p_category), 'default');
  if v_weights is null then
    select pc.weights, pc.tolerances into v_weights, v_tol from public.proximity_config pc where pc.group_key = 'default';
  end if;
  for k, w in select key, value::numeric from jsonb_each_text(v_weights) loop
    av := (a->>k)::numeric;
    bv := (b->>k)::numeric;
    continue when av is null or bv is null or w <= 0;
    tol := coalesce((v_tol->>k)::numeric, 8);
    sum_d := sum_d + w * least(1, abs(av - bv) / tol);
    sum_w := sum_w + w;
    n := n + 1;
  end loop;
  if n < 2 or sum_w = 0 then return null; end if;
  return round(100 * (1 - sum_d / sum_w));
end $$;

create or replace function public.viewer_measurements() returns jsonb
language sql stable security definer set search_path = '' as $$
  select to_jsonb(bm) - 'user_id' - 'visibility' - 'updated_at'
    from public.body_measurements bm where bm.user_id = auth.uid()
$$;

-- ─────────────────────────────────────────────────────────────
-- Paylaşım oluşturma
-- ─────────────────────────────────────────────────────────────

create or replace function public.resolve_brand(p_name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid; v_name text := left(trim(regexp_replace(p_name, '\s+', ' ', 'g')), 60); v_slug text; i int := 1;
begin
  if v_name is null or v_name = '' then return null; end if;
  select b.id into v_id from public.brands b
   where public.norm(b.name) = public.norm(v_name)
      or public.norm(v_name) = any (select public.norm(x) from unnest(b.aliases) x)
   limit 1;
  if v_id is not null then return v_id; end if;
  v_slug := nullif(public.slugify(v_name), '');
  if v_slug is null then v_slug := 'marka'; end if;
  while exists (select 1 from public.brands where slug = v_slug || case when i = 1 then '' else '-' || i end) loop
    i := i + 1;
  end loop;
  insert into public.brands (name, slug) values (v_name, v_slug || case when i = 1 then '' else '-' || i end)
  returning id into v_id;
  return v_id;
end $$;
revoke execute on function public.resolve_brand(text) from public, anon, authenticated;

-- photos: [{"path": "<uid>/<file>.webp", "pose": "front"}]
-- items:  [{"brand": "Zara", "product_name": "...", "category": "jean", "size_bought": "38",
--           "fit_rating": "true", "length_rating": "long", "fit_note": "...", "fabric_note": "...", "product_url": "..."}]
create or replace function public.create_post(p_caption text, p_photos jsonb, p_items jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid(); v_post uuid; ph jsonb; it jsonb; idx int;
  v_snapshot jsonb; v_vis jsonb;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if jsonb_array_length(coalesce(p_photos, '[]')) not between 1 and 6 then raise exception 'photos_count'; end if;
  if jsonb_array_length(coalesce(p_items, '[]')) not between 1 and 8 then raise exception 'items_count'; end if;

  insert into public.posts (user_id, caption) values (v_uid, nullif(trim(p_caption), '')) returning id into v_post;

  idx := 0;
  for ph in select * from jsonb_array_elements(p_photos) loop
    if split_part(ph->>'path', '/', 1) <> v_uid::text then raise exception 'photo_path'; end if;
    insert into public.post_photos (post_id, storage_path, position, pose)
    values (v_post, ph->>'path', idx, nullif(ph->>'pose', ''));
    idx := idx + 1;
  end loop;

  idx := 0;
  for it in select * from jsonb_array_elements(p_items) loop
    if coalesce(trim(it->>'size_bought'), '') = '' then raise exception 'size_required'; end if;
    insert into public.post_items (post_id, brand_id, product_name, category, size_bought,
      fit_rating, length_rating, fit_note, fabric_note, product_url, position)
    values (v_post, public.resolve_brand(it->>'brand'), nullif(trim(it->>'product_name'), ''),
      nullif(it->>'category', ''), upper(trim(it->>'size_bought')),
      nullif(it->>'fit_rating', ''), nullif(it->>'length_rating', ''),
      nullif(trim(it->>'fit_note'), ''), nullif(trim(it->>'fabric_note'), ''),
      nullif(trim(it->>'product_url'), ''), idx);
    idx := idx + 1;
  end loop;

  -- Paylaşım anındaki ölçüler kopyalanır (rıza varsa)
  select to_jsonb(bm) - 'user_id' - 'visibility' - 'updated_at', bm.visibility
    into v_snapshot, v_vis
    from public.body_measurements bm
    join public.profile_private pp on pp.user_id = bm.user_id and pp.measurement_consent_at is not null
   where bm.user_id = v_uid;
  if v_snapshot is not null then
    insert into public.post_measurements (post_id, user_id, snapshot, visibility)
    values (v_post, v_uid, jsonb_strip_nulls(v_snapshot), v_vis);
  end if;

  return v_post;
end $$;

-- ─────────────────────────────────────────────────────────────
-- Okuma RPC'leri (maskelenmiş)
-- ─────────────────────────────────────────────────────────────

create or replace function public.search_posts(
  p_q text default null,
  p_brand text default null,          -- marka slug
  p_category text default null,
  p_size text default null,
  p_height_min numeric default null,
  p_height_max numeric default null,
  p_weight_min numeric default null,
  p_weight_max numeric default null,
  p_near_me boolean default false,
  p_min_score int default 70,
  p_sort text default 'new',          -- new | near | popular
  p_username text default null,
  p_saved boolean default false,
  p_limit int default 20,
  p_offset int default 0
) returns table (
  id uuid, created_at timestamptz,
  author_username text, author_avatar text,
  cover_path text, photo_count int,
  main_brand text, main_size text, main_category text,
  height jsonb, proximity int,
  like_count int, save_count int, liked boolean, saved boolean
)
language sql stable security definer set search_path = '' as $$
  with viewer as (select public.viewer_measurements() as m),
  toks as (
    select coalesce(array_agg(public.norm(t)), '{}') as arr
      from regexp_split_to_table(trim(coalesce(p_q, '')), '\s+') t where t <> ''
  ),
  base as (
    select p.id, p.created_at, p.user_id, pr.username, pr.avatar_url, pm.snapshot, pm.visibility,
      mi.brand_name, mi.size_bought, mi.category,
      (select count(*) from public.saves s where s.post_id = p.id)::int as save_count,
      case when p.user_id = auth.uid() then null
           else public.proximity_score((select m from viewer), pm.snapshot, mi.category) end as score
    from public.posts p
    join public.profiles pr on pr.id = p.user_id
    left join public.post_measurements pm on pm.post_id = p.id
    left join lateral (
      select b.name as brand_name, i.size_bought, i.category
        from public.post_items i left join public.brands b on b.id = i.brand_id
       where i.post_id = p.id order by i.position limit 1) mi on true
    left join lateral (
      select public.norm(coalesce(p.caption, '') || ' ' || pr.username || ' ' || coalesce(pr.display_name, '') || ' ' ||
        string_agg(coalesce(b.name, '') || ' ' || array_to_string(b.aliases, ' ') || ' ' ||
          coalesce(i.product_name, '') || ' ' || coalesce(c.label, '') || ' ' ||
          array_to_string(c.search_terms, ' ') || ' ' || i.size_bought, ' ')) as d
        from public.post_items i
        left join public.brands b on b.id = i.brand_id
        left join public.categories c on c.slug = i.category
       where i.post_id = p.id) doc on true
    where p.status = 'published'
      and (p_username is null or pr.username = lower(p_username))
      and (not p_saved or exists (select 1 from public.saves s where s.post_id = p.id and s.user_id = auth.uid()))
      and (p_brand is null or exists (
            select 1 from public.post_items i join public.brands b on b.id = i.brand_id
             where i.post_id = p.id and b.slug = p_brand))
      and (p_category is null or exists (select 1 from public.post_items i where i.post_id = p.id and i.category = p_category))
      and (p_size is null or exists (select 1 from public.post_items i where i.post_id = p.id and public.norm(i.size_bought) = public.norm(p_size)))
      -- Gizli ölçüler filtrelemede kullanılmaz (aksi halde ham değer dolaylı olarak sızar)
      and (p_height_min is null or (coalesce(pm.visibility->>'height_cm', 'range') <> 'hidden' and (pm.snapshot->>'height_cm')::numeric >= p_height_min))
      and (p_height_max is null or (coalesce(pm.visibility->>'height_cm', 'range') <> 'hidden' and (pm.snapshot->>'height_cm')::numeric <= p_height_max))
      and (p_weight_min is null or (coalesce(pm.visibility->>'weight_kg', 'range') <> 'hidden' and (pm.snapshot->>'weight_kg')::numeric >= p_weight_min))
      and (p_weight_max is null or (coalesce(pm.visibility->>'weight_kg', 'range') <> 'hidden' and (pm.snapshot->>'weight_kg')::numeric <= p_weight_max))
      and not exists (
        select 1 from unnest((select arr from toks)) tok
         where not (doc.d like '%' || tok || '%'
                    or (char_length(tok) >= 4 and extensions.word_similarity(tok, doc.d) >= 0.6)))
  )
  select b.id, b.created_at, b.username, b.avatar_url,
    (select ph.storage_path from public.post_photos ph where ph.post_id = b.id order by ph.position limit 1),
    (select count(*) from public.post_photos ph where ph.post_id = b.id)::int,
    b.brand_name, b.size_bought, b.category,
    public.mask_measurements(b.snapshot, b.visibility)->'height_cm',
    b.score,
    (select count(*) from public.likes l where l.post_id = b.id)::int,
    b.save_count,
    exists (select 1 from public.likes l where l.post_id = b.id and l.user_id = auth.uid()),
    exists (select 1 from public.saves s where s.post_id = b.id and s.user_id = auth.uid())
  from base b
  where (not p_near_me or (b.score is not null and b.score >= p_min_score))
  order by
    case when p_sort = 'near' then b.score end desc nulls last,
    case when p_sort = 'popular' then b.save_count end desc,
    b.created_at desc
  limit least(p_limit, 50) offset greatest(p_offset, 0)
$$;

create or replace function public.get_post(p_id uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'id', p.id,
    'caption', p.caption,
    'status', p.status,
    'created_at', p.created_at,
    'is_owner', p.user_id = auth.uid(),
    'author', jsonb_build_object('id', pr.id, 'username', pr.username, 'display_name', pr.display_name, 'avatar_url', pr.avatar_url),
    'measurements', public.mask_measurements(pm.snapshot, pm.visibility),
    'usual_sizes', jsonb_strip_nulls(jsonb_build_object('top', pm.snapshot->'usual_top_size', 'bottom', pm.snapshot->'usual_bottom_size')),
    'proximity', case when p.user_id = auth.uid() then null else public.proximity_score(public.viewer_measurements(), pm.snapshot,
                   (select i.category from public.post_items i where i.post_id = p.id order by i.position limit 1)) end,
    'photos', coalesce((select jsonb_agg(jsonb_build_object('path', ph.storage_path, 'pose', ph.pose) order by ph.position)
                          from public.post_photos ph where ph.post_id = p.id), '[]'),
    'items', coalesce((select jsonb_agg(jsonb_build_object(
                  'id', i.id, 'brand', b.name, 'brand_slug', b.slug, 'product_name', i.product_name,
                  'category', i.category, 'category_label', c.label, 'size_bought', i.size_bought,
                  'fit_rating', i.fit_rating, 'length_rating', i.length_rating,
                  'fit_note', i.fit_note, 'fabric_note', i.fabric_note, 'product_url', i.product_url) order by i.position)
                from public.post_items i
                left join public.brands b on b.id = i.brand_id
                left join public.categories c on c.slug = i.category
               where i.post_id = p.id), '[]'),
    'like_count', (select count(*) from public.likes l where l.post_id = p.id),
    'save_count', (select count(*) from public.saves s where s.post_id = p.id),
    'liked', exists (select 1 from public.likes l where l.post_id = p.id and l.user_id = auth.uid()),
    'saved', exists (select 1 from public.saves s where s.post_id = p.id and s.user_id = auth.uid())
  )
  from public.posts p
  join public.profiles pr on pr.id = p.user_id
  left join public.post_measurements pm on pm.post_id = p.id
  where p.id = p_id and (p.status = 'published' or p.user_id = auth.uid() or public.is_admin())
$$;

create or replace function public.get_profile(p_username text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'id', pr.id,
    'username', pr.username,
    'display_name', pr.display_name,
    'avatar_url', pr.avatar_url,
    'bio', pr.bio,
    'created_at', pr.created_at,
    'is_me', pr.id = auth.uid(),
    'measurements', public.mask_measurements(to_jsonb(bm), bm.visibility),
    'usual_sizes', jsonb_strip_nulls(jsonb_build_object('top', bm.usual_top_size, 'bottom', bm.usual_bottom_size,
                     'shoe', case when coalesce(bm.visibility->>'shoe_size', 'range') = 'hidden' then null else bm.shoe_size end)),
    'proximity', case when pr.id = auth.uid() then null
                      else public.proximity_score(public.viewer_measurements(), to_jsonb(bm) - 'visibility') end,
    'post_count', (select count(*) from public.posts p where p.user_id = pr.id and p.status = 'published')
  )
  from public.profiles pr
  left join public.body_measurements bm on bm.user_id = pr.id
  where pr.username = lower(p_username)
$$;

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
  order by (public.norm(b.name) like public.norm(p_q) || '%') desc, post_count desc, b.name
  limit least(p_limit, 50)
$$;

-- Kullanıcı araması sadece isim/kullanıcı adı ile; ölçüye göre kullanıcı listelenemez
create or replace function public.search_users(p_q text, p_limit int default 20)
returns table (username text, display_name text, avatar_url text)
language sql stable security definer set search_path = '' as $$
  select pr.username, pr.display_name, pr.avatar_url
    from public.profiles pr
   where coalesce(trim(p_q), '') <> ''
     and (pr.username like '%' || public.norm(p_q) || '%'
          or public.norm(pr.display_name) like '%' || public.norm(p_q) || '%')
   order by (pr.username like public.norm(p_q) || '%') desc, pr.username
   limit least(p_limit, 50)
$$;

-- ─────────────────────────────────────────────────────────────
-- Admin
-- ─────────────────────────────────────────────────────────────

create or replace function public.admin_reports() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  return coalesce((
    select jsonb_agg(x order by x->>'last_report_at' desc) from (
      select jsonb_build_object(
        'post_id', p.id, 'status', p.status, 'caption', p.caption,
        'author_id', pr.id, 'author_username', pr.username,
        'cover_path', (select ph.storage_path from public.post_photos ph where ph.post_id = p.id order by ph.position limit 1),
        'open_count', count(*) filter (where r.resolved_at is null),
        'last_report_at', max(r.created_at),
        'reasons', jsonb_agg(jsonb_build_object('id', r.id, 'reason', r.reason, 'created_at', r.created_at,
                     'resolved', r.resolved_at is not null) order by r.created_at desc)
      ) as x
      from public.reports r
      join public.posts p on p.id = r.post_id
      join public.profiles pr on pr.id = p.user_id
      group by p.id, pr.id
    ) t), '[]');
end $$;

create or replace function public.admin_set_post_status(p_post uuid, p_status text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  update public.posts set status = p_status where id = p_post;
  update public.reports set resolved_at = now() where post_id = p_post and resolved_at is null;
end $$;

create or replace function public.admin_dismiss_reports(p_post uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  update public.reports set resolved_at = now() where post_id = p_post and resolved_at is null;
end $$;

create or replace function public.admin_warn_user(p_user uuid, p_message text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  insert into public.user_warnings (user_id, message) values (p_user, p_message);
end $$;

create or replace function public.admin_update_brand(p_id uuid, p_name text, p_aliases text[]) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  update public.brands set name = trim(p_name), aliases = coalesce(p_aliases, '{}') where id = p_id;
end $$;

-- source markayı target'a birleştirir: ürünler taşınır, eski ad alias olur
create or replace function public.admin_merge_brands(p_source uuid, p_target uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_src public.brands;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  if p_source = p_target then return; end if;
  select * into v_src from public.brands where id = p_source;
  if v_src.id is null then return; end if;
  update public.post_items set brand_id = p_target where brand_id = p_source;
  update public.brands
     set aliases = (select array_agg(distinct a) from unnest(aliases || v_src.aliases || array[v_src.name]) a)
   where id = p_target;
  delete from public.brands where id = p_source;
end $$;

-- ─────────────────────────────────────────────────────────────
-- Storage
-- ─────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('post-photos', 'post-photos', true, 5242880, array['image/webp', 'image/jpeg']),
       ('avatars', 'avatars', true, 2097152, array['image/webp', 'image/jpeg'])
on conflict (id) do nothing;

-- Dosya yolu her zaman "<kullanıcı id>/..." ile başlar
create policy "kendi klasörüne yükler" on storage.objects for insert to authenticated
  with check (bucket_id in ('post-photos', 'avatars') and (storage.foldername(name))[1] = auth.uid()::text);
create policy "kendi dosyasını günceller" on storage.objects for update to authenticated
  using (bucket_id in ('post-photos', 'avatars') and (storage.foldername(name))[1] = auth.uid()::text);
create policy "kendi dosyasını siler" on storage.objects for delete to authenticated
  using (bucket_id in ('post-photos', 'avatars') and (storage.foldername(name))[1] = auth.uid()::text);
