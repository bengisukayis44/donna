// Gizlilik + arama + yakınlık testi. Gerçek Supabase projesine karşı çalışır;
// geçici iki kullanıcı oluşturur, iş bitince siler.
//   npm run test:privacy
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SECRET = process.env.SUPABASE_SECRET_KEY;
assert.ok(URL && ANON && SECRET, ".env.local içindeki Supabase değişkenleri gerekli");

const admin = createClient(URL, SECRET, { auth: { persistSession: false } });
const anon = () => createClient(URL, ANON, { auth: { persistSession: false } });
const run = Date.now().toString(36);
const password = `Test-${run}-pw!`;
const year = new Date().getFullYear() - 25;

// Gizli değerler: benzersiz ondalıklar, böylece yanıtta geçip geçmediği kesin anlaşılır
const SECRET_VALUES = { height_cm: 171.3, weight_kg: 63.7, waist_cm: 69.1, hip_cm: 97.3 };
const RANGE_VALUES = { bust_cm: 88.4 }; // aralık olarak gösterilmeli: 85–90

const users = {};
let postId;

async function makeUser(key, measurements, visibility) {
  const email = `test-${key}-${run}@example.com`;
  const { data, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { birth_year: String(year), kvkk: "true" },
  });
  if (error) throw error;
  const client = anon();
  const { error: e2 } = await client.auth.signInWithPassword({ email, password });
  if (e2) throw e2;
  const id = data.user.id;
  await client.from("profiles").update({ username: `t_${key}_${run}`, display_name: `Test ${key}` }).eq("id", id);
  await client.rpc("set_measurement_consent", { p_consent: true });
  const { error: e3 } = await client.from("body_measurements").upsert({ user_id: id, ...measurements, visibility });
  if (e3) throw e3;
  users[key] = { id, client, username: `t_${key}_${run}` };
}

before(async () => {
  await makeUser(
    "a",
    { ...SECRET_VALUES, ...RANGE_VALUES, usual_top_size: "M" },
    { height_cm: "hidden", weight_kg: "hidden", waist_cm: "hidden", hip_cm: "hidden", bust_cm: "range" },
  );
  await makeUser("b", { height_cm: 170, weight_kg: 62, waist_cm: 70, hip_cm: 96, bust_cm: 87 }, {});

  const a = users.a;
  const path = `${a.id}/test-${run}.jpg`;
  const { error: upErr } = await a.client.storage.from("post-photos").upload(path, new Uint8Array([0xff, 0xd8, 0xff, 0xd9]), { contentType: "image/jpeg" });
  if (upErr) throw upErr;
  const { data, error } = await a.client.rpc("create_post", {
    p_caption: `test ${run}`,
    p_photos: [{ path, pose: "front" }],
    p_items: [{ brand: "zara", product_name: "Straight Fit Jean", category: "jean", size_bought: "38", fit_rating: "true" }],
  });
  if (error) throw error;
  postId = data;
});

after(async () => {
  for (const u of Object.values(users)) {
    const { data } = await admin.storage.from("post-photos").list(u.id);
    if (data?.length) await admin.storage.from("post-photos").remove(data.map((f) => `${u.id}/${f.name}`));
    await admin.auth.admin.deleteUser(u.id);
  }
});

function assertNoRaw(label, payload) {
  const s = JSON.stringify(payload ?? null);
  for (const [k, v] of Object.entries({ ...SECRET_VALUES, ...RANGE_VALUES })) {
    assert.ok(!s.includes(String(v)), `${label}: ${k} ham değeri (${v}) yanıtta görünüyor`);
  }
}

test("gizli ve aralıklı ölçüler hiçbir API yanıtında ham dönmüyor", async () => {
  for (const [who, client] of [["anonim", anon()], ["başka kullanıcı", users.b.client]]) {
    const responses = {
      search_posts: await client.rpc("search_posts", {}),
      search_posts_user: await client.rpc("search_posts", { p_username: users.a.username }),
      search_posts_near: await client.rpc("search_posts", { p_near_me: true, p_min_score: 0, p_sort: "near" }),
      get_post: await client.rpc("get_post", { p_id: postId }),
      get_profile: await client.rpc("get_profile", { p_username: users.a.username }),
      search_users: await client.rpc("search_users", { p_q: users.a.username }),
      body_measurements: await client.from("body_measurements").select("*").eq("user_id", users.a.id),
      post_measurements: await client.from("post_measurements").select("*"),
      profile_private: await client.from("profile_private").select("*").eq("user_id", users.a.id),
      profiles: await client.from("profiles").select("*").eq("id", users.a.id),
      viewer_measurements: await client.rpc("viewer_measurements"),
    };
    for (const [name, res] of Object.entries(responses)) assertNoRaw(`${who} / ${name}`, res.data);
    assert.deepEqual(responses.body_measurements.data ?? [], [], `${who}: body_measurements okunabiliyor`);
    assert.deepEqual(
      (responses.post_measurements.data ?? []).filter((r) => r.user_id === users.a.id), [],
      `${who}: post_measurements okunabiliyor`,
    );
    assert.deepEqual(responses.profile_private.data ?? [], [], `${who}: profile_private okunabiliyor`);
  }
});

test("maskeleme: gizli alanlar hiç dönmez, aralıklı alan aralık olarak döner", async () => {
  const { data } = await users.b.client.rpc("get_post", { p_id: postId });
  assert.equal(data.measurements.height_cm, undefined);
  assert.equal(data.measurements.weight_kg, undefined);
  assert.deepEqual(data.measurements.bust_cm, { min: 85, max: 90 });
});

test("gizli ölçüler filtrelemede kullanılmaz (dolaylı sızıntı yok)", async () => {
  const { data } = await anon().rpc("search_posts", { p_height_min: 171, p_height_max: 172 });
  assert.ok(!data.some((p) => p.id === postId), "gizli boy ile filtrelenebiliyor");
});

test("sahibi kendi ham ölçülerini okuyabiliyor", async () => {
  const { data } = await users.a.client.from("body_measurements").select("height_cm").eq("user_id", users.a.id).single();
  assert.equal(Number(data.height_cm), SECRET_VALUES.height_cm);
});

test("yakınlık: benzer vücut 'çok yakın' çıkıyor, gizli ölçüler eşleştirmede kullanılıyor", async () => {
  const { data } = await users.b.client.rpc("get_post", { p_id: postId });
  assert.ok(data.proximity >= 85, `beklenen ≥85, gelen ${data.proximity}`);
  const { data: anonPost } = await anon().rpc("get_post", { p_id: postId });
  assert.equal(anonPost.proximity, null);
});

test("arama: büyük/küçük harf, Türkçe karakter ve eş anlamlılar", async () => {
  const find = async (q) => (await anon().rpc("search_posts", { p_q: q, p_limit: 50 })).data.some((p) => p.id === postId);
  for (const q of ["zara", "ZARA", "Zara", "kot", "pantolon 38", "jean 38", "straight", `test ${run}`]) {
    assert.ok(await find(q), `"${q}" araması paylaşımı bulmalı`);
  }
  assert.ok(!(await find("gömlek")), `"gömlek" araması bu paylaşımı bulmamalı`);
  const { data: brands } = await anon().rpc("search_brands", { p_q: "ZAR" });
  assert.ok(brands.some((b) => b.slug === "zara"));
});

test("başkasının paylaşımı silinemez, gizlenen paylaşım herkese görünmez", async () => {
  await users.b.client.from("posts").delete().eq("id", postId);
  const { data } = await anon().rpc("get_post", { p_id: postId });
  assert.ok(data, "başka kullanıcı paylaşımı silebildi");

  const { error } = await users.b.client.rpc("admin_set_post_status", { p_post: postId, p_status: "hidden" });
  assert.ok(error, "admin olmayan kullanıcı paylaşımı gizleyebildi");
});
