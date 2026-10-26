-- Paylaşım düzenleme: açıklama, fotoğraflar ve ürünler güncellenir.
-- Ölçü snapshot'ı değişmez (paylaşım anındaki ölçüler anlamlı olan); durum (status) da değişmez.
create or replace function public.update_post(p_id uuid, p_caption text, p_photos jsonb, p_items jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid(); ph jsonb; it jsonb; idx int;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from public.posts where id = p_id and user_id = v_uid) then raise exception 'forbidden'; end if;
  if jsonb_array_length(coalesce(p_photos, '[]')) not between 1 and 6 then raise exception 'photos_count'; end if;
  if jsonb_array_length(coalesce(p_items, '[]')) not between 1 and 8 then raise exception 'items_count'; end if;

  update public.posts set caption = nullif(trim(p_caption), '') where id = p_id;

  delete from public.post_photos where post_id = p_id;
  idx := 0;
  for ph in select * from jsonb_array_elements(p_photos) loop
    if split_part(ph->>'path', '/', 1) <> v_uid::text then raise exception 'photo_path'; end if;
    insert into public.post_photos (post_id, storage_path, position, pose)
    values (p_id, ph->>'path', idx, nullif(ph->>'pose', ''));
    idx := idx + 1;
  end loop;

  delete from public.post_items where post_id = p_id;
  idx := 0;
  for it in select * from jsonb_array_elements(p_items) loop
    if coalesce(trim(it->>'size_bought'), '') = '' then raise exception 'size_required'; end if;
    insert into public.post_items (post_id, brand_id, product_name, category, size_bought,
      fit_rating, length_rating, fit_note, fabric_note, product_url, position)
    values (p_id, public.resolve_brand(it->>'brand'), nullif(trim(it->>'product_name'), ''),
      nullif(it->>'category', ''), upper(trim(it->>'size_bought')),
      nullif(it->>'fit_rating', ''), nullif(it->>'length_rating', ''),
      nullif(trim(it->>'fit_note'), ''), nullif(trim(it->>'fabric_note'), ''),
      nullif(trim(it->>'product_url'), ''), idx);
    idx := idx + 1;
  end loop;
end $$;
