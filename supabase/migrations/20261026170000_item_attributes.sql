-- Ürün için "gelişmiş detaylar": renk, kumaş, kol boyu, paça, bel... Hepsi opsiyonel.
-- Tanımlar tabloda: hangi özellik hangi kategoride sorulur, seçenekleri neler.
-- post_items.attributes = {"color": ["siyah"], "fabric": ["keten", "pamuk"], "sleeve": ["uzun"]}

create table public.item_attributes (
  key text primary key,
  label text not null,
  multi boolean not null default false,   -- birden fazla seçilebilir mi
  max_select int not null default 1,
  categories text[],                      -- null = tüm kategoriler
  position int not null default 0
);

create table public.attribute_options (
  attr_key text not null references public.item_attributes on delete cascade on update cascade,
  value text not null,
  label text not null,
  swatch text,                            -- renkler için CSS rengi
  position int not null default 0,
  primary key (attr_key, value)
);

alter table public.item_attributes enable row level security;
alter table public.attribute_options enable row level security;
create policy "özellikler okunur" on public.item_attributes for select using (true);
create policy "seçenekler okunur" on public.attribute_options for select using (true);
grant select on public.item_attributes, public.attribute_options to anon, authenticated;

alter table public.post_items add column attributes jsonb not null default '{}';

-- Kategori grupları (tekrar yazmamak için)
-- üst:  tisort, gomlek, bluz, kazak, sweatshirt, ceket, mont
-- alt:  jean, pantolon, etek, sort
insert into public.item_attributes (key, label, multi, max_select, categories, position) values
  ('color',      'Renk',            true,  3, null, 1),
  ('fabric',     'Kumaş',           true,  3, null, 2),
  ('stretch',    'Esneklik',        false, 1, '{jean,pantolon,etek,sort,elbise,tulum,takim,tisort,gomlek,bluz,kazak,sweatshirt,ceket,mont,ic-giyim,mayo}', 3),
  ('thickness',  'Kalınlık',        false, 1, '{jean,pantolon,etek,sort,elbise,tulum,takim,tisort,gomlek,bluz,kazak,sweatshirt,ceket,mont}', 4),
  ('sheerness',  'Şeffaflık',       false, 1, '{pantolon,etek,elbise,tulum,tisort,gomlek,bluz,kazak,mayo}', 5),
  ('cut',        'Kesim',           false, 1, '{jean,pantolon,tisort,gomlek,bluz,kazak,sweatshirt,ceket,mont,takim,elbise}', 6),
  ('sleeve',     'Kol boyu',        false, 1, '{tisort,gomlek,bluz,kazak,sweatshirt,ceket,mont,elbise,tulum}', 7),
  ('neckline',   'Yaka',            false, 1, '{tisort,gomlek,bluz,kazak,sweatshirt,elbise,tulum,mayo}', 8),
  ('top_length', 'Üst boyu',        false, 1, '{tisort,gomlek,bluz,kazak,sweatshirt,ceket,mont}', 9),
  ('rise',       'Bel yüksekliği',  false, 1, '{jean,pantolon,etek,sort}', 10),
  ('leg',        'Paça',            false, 1, '{jean,pantolon,tulum}', 11),
  ('length',     'Boy',             false, 1, '{elbise,etek,jean,pantolon,mont}', 12),
  ('heel',       'Topuk',           false, 1, '{ayakkabi}', 13),
  ('shoe_runs',  'Numara kalıbı',   false, 1, '{ayakkabi}', 14),
  ('pattern',    'Desen',           false, 1, null, 15);

insert into public.attribute_options (attr_key, value, label, swatch, position) values
  ('color', 'siyah',      'Siyah',       '#1F1B18', 1),
  ('color', 'beyaz',      'Beyaz',       '#FFFFFF', 2),
  ('color', 'krem',       'Krem',        '#F3EBDD', 3),
  ('color', 'bej',        'Bej',         '#D8C3A5', 4),
  ('color', 'gri',        'Gri',         '#9A9A9A', 5),
  ('color', 'lacivert',   'Lacivert',    '#1F2A44', 6),
  ('color', 'mavi',       'Mavi',        '#3B6FB6', 7),
  ('color', 'acik-mavi',  'Açık mavi',   '#A9C8E8', 8),
  ('color', 'kahverengi', 'Kahverengi',  '#6B4A33', 9),
  ('color', 'haki',       'Haki',        '#7A7A4E', 10),
  ('color', 'yesil',      'Yeşil',       '#3F7D4E', 11),
  ('color', 'kirmizi',    'Kırmızı',     '#C0392B', 12),
  ('color', 'bordo',      'Bordo',       '#6D1A2A', 13),
  ('color', 'pembe',      'Pembe',       '#F2A7BB', 14),
  ('color', 'mor',        'Mor',         '#7D5BA6', 15),
  ('color', 'sari',       'Sarı',        '#F2C94C', 16),
  ('color', 'turuncu',    'Turuncu',     '#E67E22', 17),
  ('color', 'gumus',      'Gümüş',       '#C0C0C0', 18),
  ('color', 'altin',      'Altın',       '#C9A227', 19),
  ('color', 'cok-renkli', 'Çok renkli',  'conic-gradient(#C0392B,#F2C94C,#3F7D4E,#3B6FB6,#7D5BA6,#C0392B)', 20),

  ('fabric', 'pamuk',     'Pamuk',       null, 1),
  ('fabric', 'keten',     'Keten',       null, 2),
  ('fabric', 'denim',     'Denim',       null, 3),
  ('fabric', 'triko',     'Triko / örme', null, 4),
  ('fabric', 'yun',       'Yün',         null, 5),
  ('fabric', 'kasmir',    'Kaşmir',      null, 6),
  ('fabric', 'ipek',      'İpek',        null, 7),
  ('fabric', 'saten',     'Saten',       null, 8),
  ('fabric', 'viskon',    'Viskon',      null, 9),
  ('fabric', 'polyester', 'Polyester',   null, 10),
  ('fabric', 'sifon',     'Şifon',       null, 11),
  ('fabric', 'kadife',    'Kadife',      null, 12),
  ('fabric', 'kase',      'Kaşe',        null, 13),
  ('fabric', 'deri',      'Deri',        null, 14),
  ('fabric', 'suni-deri', 'Suni deri',   null, 15),
  ('fabric', 'suet',      'Süet',        null, 16),
  ('fabric', 'kanvas',    'Kanvas',      null, 17),
  ('fabric', 'tul',       'Tül / dantel', null, 18),
  ('fabric', 'likra',     'Likralı / elastan', null, 19),

  ('stretch', 'yok',   'Esnemez',   null, 1),
  ('stretch', 'az',    'Az esner',  null, 2),
  ('stretch', 'cok',   'Çok esner', null, 3),

  ('thickness', 'ince',  'İnce',  null, 1),
  ('thickness', 'orta',  'Orta',  null, 2),
  ('thickness', 'kalin', 'Kalın', null, 3),

  ('sheerness', 'yok',   'Göstermez',     null, 1),
  ('sheerness', 'hafif', 'Hafif gösterir', null, 2),
  ('sheerness', 'seffaf','Şeffaf',        null, 3),

  ('cut', 'slim',     'Dar kesim',   null, 1),
  ('cut', 'regular',  'Normal kesim', null, 2),
  ('cut', 'relaxed',  'Rahat kesim', null, 3),
  ('cut', 'oversize', 'Oversize',    null, 4),

  ('sleeve', 'kolsuz', 'Kolsuz',      null, 1),
  ('sleeve', 'askili', 'Askılı',      null, 2),
  ('sleeve', 'kisa',   'Kısa kol',    null, 3),
  ('sleeve', 'dirsek', 'Dirsek boyu', null, 4),
  ('sleeve', 'uc-ceyrek', '3/4 kol',  null, 5),
  ('sleeve', 'uzun',   'Uzun kol',    null, 6),

  ('neckline', 'bisiklet', 'Bisiklet yaka', null, 1),
  ('neckline', 'v',        'V yaka',        null, 2),
  ('neckline', 'gomlek',   'Gömlek yaka',   null, 3),
  ('neckline', 'polo',     'Polo yaka',     null, 4),
  ('neckline', 'balikci',  'Balıkçı yaka',  null, 5),
  ('neckline', 'kayik',    'Kayık yaka',    null, 6),
  ('neckline', 'kare',     'Kare yaka',     null, 7),
  ('neckline', 'halter',   'Halter yaka',   null, 8),
  ('neckline', 'straplez', 'Straplez',      null, 9),
  ('neckline', 'kapusonlu','Kapüşonlu',     null, 10),

  ('top_length', 'crop',   'Crop',          null, 1),
  ('top_length', 'normal', 'Normal',        null, 2),
  ('top_length', 'uzun',   'Uzun / tunik',  null, 3),

  ('rise', 'dusuk',  'Düşük bel',  null, 1),
  ('rise', 'normal', 'Normal bel', null, 2),
  ('rise', 'yuksek', 'Yüksek bel', null, 3),

  ('leg', 'skinny',   'Skinny',          null, 1),
  ('leg', 'slim',     'Slim',            null, 2),
  ('leg', 'duz',      'Düz paça',        null, 3),
  ('leg', 'mom',      'Mom / tapered',   null, 4),
  ('leg', 'bol',      'Bol / wide leg',  null, 5),
  ('leg', 'ispanyol', 'İspanyol / flare', null, 6),
  ('leg', 'bootcut',  'Bootcut',         null, 7),
  ('leg', 'jogger',   'Jogger',          null, 8),

  ('length', 'mini',  'Mini / kısa',   null, 1),
  ('length', 'diz',   'Diz boyu',      null, 2),
  ('length', 'midi',  'Midi',          null, 3),
  ('length', 'bilek', 'Bilek boyu',    null, 4),
  ('length', 'maxi',  'Maxi / uzun',   null, 5),

  ('heel', 'duz',    'Düz',            null, 1),
  ('heel', 'alcak',  'Alçak topuk',    null, 2),
  ('heel', 'orta',   'Orta topuk',     null, 3),
  ('heel', 'yuksek', 'Yüksek topuk',   null, 4),
  ('heel', 'dolgu',  'Dolgu / platform', null, 5),

  ('shoe_runs', 'kucuk', 'Küçük kalıp — bir büyük al', null, 1),
  ('shoe_runs', 'tam',   'Tam kalıp',                  null, 2),
  ('shoe_runs', 'buyuk', 'Büyük kalıp — bir küçük al', null, 3),

  ('pattern', 'duz',     'Düz',        null, 1),
  ('pattern', 'cizgili', 'Çizgili',    null, 2),
  ('pattern', 'ekose',   'Ekose',      null, 3),
  ('pattern', 'cicekli', 'Çiçekli',    null, 4),
  ('pattern', 'puantiye','Puantiyeli', null, 5),
  ('pattern', 'hayvan',  'Hayvan desenli', null, 6),
  ('pattern', 'baskili', 'Baskılı / yazılı', null, 7);

-- Gelen özellikleri tanımlara göre temizler: bilinmeyen anahtar/değer atılır, tekli alanlarda ilk değer kalır
create or replace function public.clean_attributes(p jsonb) returns jsonb
language sql stable set search_path = '' as $$
  select coalesce(jsonb_object_agg(a.key, v.vals), '{}')
    from public.item_attributes a
    cross join lateral (
      select jsonb_agg(o.value order by o.position) as vals
        from (
          select distinct o.value, o.position
            from jsonb_array_elements_text(
                   case jsonb_typeof(p->a.key) when 'array' then p->a.key
                        when 'string' then jsonb_build_array(p->a.key) else '[]' end) x(val)
            join public.attribute_options o on o.attr_key = a.key and o.value = x.val
           order by o.position
           limit a.max_select
        ) o
    ) v
   where v.vals is not null
$$;

-- Ürün özelliklerini etiketleriyle döndürür: [{"key":"color","label":"Renk","values":[{"value":"siyah","label":"Siyah","swatch":"#1F1B18"}]}]
create or replace function public.attribute_labels(p jsonb) returns jsonb
language sql stable set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('key', a.key, 'label', a.label, 'values', v.vals) order by a.position), '[]')
    from public.item_attributes a
    cross join lateral (
      select jsonb_agg(jsonb_build_object('value', o.value, 'label', o.label, 'swatch', o.swatch) order by o.position) as vals
        from public.attribute_options o
       where o.attr_key = a.key and coalesce(p->a.key, '[]') ? o.value
    ) v
   where v.vals is not null
$$;

-- Arama metnine eklenecek etiketler ("siyah keten uzun kol")
create or replace function public.attribute_search_text(p jsonb) returns text
language sql stable set search_path = '' as $$
  select coalesce(string_agg(o.label, ' '), '')
    from public.attribute_options o
   where coalesce(p->o.attr_key, '[]') ? o.value
$$;

-- create_post / update_post: attributes alanını da kaydet
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
  perform public.write_post_children(v_post, v_uid, p_photos, p_items);

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

create or replace function public.update_post(p_id uuid, p_caption text, p_photos jsonb, p_items jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from public.posts where id = p_id and user_id = v_uid) then raise exception 'forbidden'; end if;
  if jsonb_array_length(coalesce(p_photos, '[]')) not between 1 and 6 then raise exception 'photos_count'; end if;
  if jsonb_array_length(coalesce(p_items, '[]')) not between 1 and 8 then raise exception 'items_count'; end if;

  update public.posts set caption = nullif(trim(p_caption), '') where id = p_id;
  delete from public.post_photos where post_id = p_id;
  delete from public.post_items where post_id = p_id;
  perform public.write_post_children(p_id, v_uid, p_photos, p_items);
end $$;

-- Fotoğraf ve ürün satırlarını yazar (create_post ve update_post ortak kullanır)
create or replace function public.write_post_children(p_post uuid, p_uid uuid, p_photos jsonb, p_items jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare ph jsonb; it jsonb; idx int := 0;
begin
  for ph in select * from jsonb_array_elements(p_photos) loop
    if split_part(ph->>'path', '/', 1) <> p_uid::text then raise exception 'photo_path'; end if;
    insert into public.post_photos (post_id, storage_path, position, pose)
    values (p_post, ph->>'path', idx, nullif(ph->>'pose', ''));
    idx := idx + 1;
  end loop;

  idx := 0;
  for it in select * from jsonb_array_elements(p_items) loop
    if coalesce(trim(it->>'size_bought'), '') = '' then raise exception 'size_required'; end if;
    insert into public.post_items (post_id, brand_id, product_name, category, size_bought,
      fit_rating, length_rating, fit_note, fabric_note, product_url, attributes, position)
    values (p_post, public.resolve_brand(it->>'brand'), nullif(trim(it->>'product_name'), ''),
      nullif(it->>'category', ''), upper(trim(it->>'size_bought')),
      nullif(it->>'fit_rating', ''), nullif(it->>'length_rating', ''),
      nullif(trim(it->>'fit_note'), ''), nullif(trim(it->>'fabric_note'), ''),
      nullif(trim(it->>'product_url'), ''), public.clean_attributes(it->'attributes'), idx);
    idx := idx + 1;
  end loop;
end $$;
revoke execute on function public.write_post_children(uuid, uuid, jsonb, jsonb) from public, anon, authenticated;

-- get_post: ürünlere özellikler (etiketli) ve ham değerler eklendi
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
                  'fit_note', i.fit_note, 'fabric_note', i.fabric_note, 'product_url', i.product_url,
                  'attributes', i.attributes, 'attribute_labels', public.attribute_labels(i.attributes)) order by i.position)
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

-- search_posts: özellik etiketleri arama metnine girer ("siyah keten"), renk vb. ile filtre (p_attrs)
drop function public.search_posts(text, text, text, text, numeric, numeric, numeric, numeric, boolean, int, text, text, boolean, int, int);

create function public.search_posts(
  p_q text default null,
  p_brand text default null,
  p_category text default null,
  p_size text default null,
  p_height_min numeric default null,
  p_height_max numeric default null,
  p_weight_min numeric default null,
  p_weight_max numeric default null,
  p_near_me boolean default false,
  p_min_score int default 70,
  p_sort text default 'new',
  p_username text default null,
  p_saved boolean default false,
  p_limit int default 20,
  p_offset int default 0,
  p_attrs jsonb default null          -- {"color": "siyah", "sleeve": "uzun"}
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
          array_to_string(c.search_terms, ' ') || ' ' || i.size_bought || ' ' ||
          public.attribute_search_text(i.attributes), ' ')) as d
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
      -- Tüm istenen özellikler aynı üründe olmalı
      and (p_attrs is null or p_attrs = '{}' or exists (
            select 1 from public.post_items i
             where i.post_id = p.id
               and not exists (select 1 from jsonb_each_text(p_attrs) f
                                where not coalesce(i.attributes->f.key, '[]') ? f.value)))
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
