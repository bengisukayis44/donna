# Kombin Platformu — Proje Rehberi (v1: Web sitesi)

> Bu dosya Claude Code için proje bağlamıdır. Repo köküne `CLAUDE.md` olarak koyun; Claude Code her oturumda otomatik okur.

## 1. Proje özeti

Türkiye'ye özel, kullanıcıların kendi aldıkları kıyafetleri **üzerlerinde** paylaştığı bir platform. Her paylaşımda kişinin vücut ölçüleri ve aldığı beden görünür. Böylece online alışveriş yapan biri, **kendi ölçülerine yakın** insanların hangi bedeni aldığını ve kıyafetin onlarda nasıl durduğunu görerek karar verir.

Örnek akış: Kullanıcı Zara'dan bir kot pantolon alır, giyip fotoğrafını yükler, "Zara · Straight Fit Jean · 38 beden" bilgisini ekler, isterse "belde tam, boyu biraz uzun" gibi bir fit notu yazar. Profilinde boyu, kilosu ve ölçüleri kayıtlı olduğu için, ona benzer vücuttaki biri bu pantolonda kaç beden alması gerektiğini görür.

Slogan: **Kombini gör. Bedenini bil. Tek tıkla al.**

**Platform sırası:**
1. **Şimdi:** Web sitesi (mobil öncelikli, telefondan rahat kullanılır)
2. **Sonra:** Mobil uygulama (iOS + Android). Aynı backend'i kullanacak; bu yüzden iş mantığı web arayüzüne gömülmemeli (bkz. §5).

**Ekip:** 4 kişi, kod tarafında tek geliştirici (Bengisu). Ekibin kendi paylaşımları, normal kullanıcı hesaplarıyla yapılan ilk içerik olacak.

## 2. v1 kapsamı

### Var
- Karşılama sayfası, kayıt / giriş (e-posta + Google)
- Adım adım, atlanabilir profil oluşturma akışı (onboarding)
- **Profil:** kullanıcı adı, görünen ad, profil fotoğrafı, vücut ölçüleri, genelde giydiği bedenler
- **Paylaşım (post) yükleme:** 1–6 fotoğraf + üzerindeki ürünler + her ürün için alınan beden + opsiyonel fit / kumaş notu
- **Feed:** herkesin paylaşımları; "Bana yakın vücutlar" sekmesi
- **Arama:** marka, ürün adı/model, beden, kullanıcı; ölçüye göre filtre
- Paylaşım detay sayfası
- Beğenme ve kaydetme
- Şikayet (raporlama) + basit admin moderasyon ekranı
- Gizlilik ayarları ve hesap silme

### Yok (sonraki aşamalar — şimdi yapma, ama önünü kapatma)
- Mobil uygulama
- Takip etme / takipçi sistemi
- Yorumlar ve mesajlaşma
- Affiliate linkleri, fiyat/stok alarmı, premium
- Kişiye özel otomatik beden önerisi ("Bu pantolonda sana 38 olur")
- Ürün kataloğu / mağaza entegrasyonu

## 3. Sayfalar

### Karşılama / Giriş (`/giris`)
- Logo, slogan ve arka planda yavaşça kayan birkaç paylaşım fotoğrafı (sitenin ne olduğu ilk bakışta anlaşılsın)
- İki ana buton: **Kayıt ol** · **Giriş yap**
- "Google ile devam et" + e-posta/şifre
- Şifremi unuttum akışı
- Altta küçük link: "Önce bir göz at" → giriş yapmadan feed'e gider
- **Giriş yapmadan gezinme serbest** (TikTok'tan gelen biri hemen içeriği görsün). Beğenme, kaydetme, paylaşma ve "Bana yakın" sekmesi girişte kayıt ekranını açar.

### Profil oluşturma (onboarding) (`/hosgeldin`)
Kayıttan hemen sonra açılan, **her ekranda tek soru** soran, sıcak ve kısa bir akış.

**Genel kurallar:**
- Üstte ilerleme çubuğu, her ekranda geri butonu
- Zorunlu olmayan her adımda belirgin bir **"Şimdilik atla"** butonu; atlamak hiçbir şeyi engellemez
- Her adımın cevabı anında kaydedilir; kullanıcı yarıda çıkarsa kaldığı yerden devam eder
- Büyük dokunma alanları; sayılar için kaydırmalı seçici (picker) veya kocaman sayı girişi, birim yanında (cm, kg)
- Ton samimi ve yargısız; her adımda bu bilginin **neye yarayacağı** tek cümleyle anlatılır
- Ekran geçişlerinde yumuşak animasyon; son ekranda küçük bir kutlama anı

**Adımlar:**

| # | Ekran | Zorunlu mu | Not |
|---|---|---|---|
| 1 | Hesap: e-posta/şifre veya Google, doğum yılı, KVKK aydınlatma onayı | Evet | Yaş sınırı burada kontrol edilir |
| 2 | "Sana ne diyelim?" — kullanıcı adı + görünen ad | Evet | Kullanıcı adı müsait mi, yazarken kontrol edilir |
| 3 | Profil fotoğrafı | Hayır | |
| 4 | "Ölçülerin neden önemli?" — kısa açıklama + ölçü verisi için **açık rıza** onayı | Hayır | Onay verilmezse 5–8 atlanır, ölçüsüz devam edilir |
| 5 | Boy ve kilo | Hayır | "Sana benzeyen insanları bulmak için en önemli iki bilgi" |
| 6 | Göğüs, bel, kalça, bacak iç boyu | Hayır | Her alanın yanında basit bir çizimle "nasıl ölçülür"; tek tek de atlanabilir |
| 7 | Genelde giydiğin bedenler: üst, alt, ayakkabı | Hayır | Hazır seçenekler (XS–XXL, 34–46, 35–42) |
| 8 | Gizlilik: ölçülerin nasıl görünsün? | Hayır | Varsayılan **"Aralık olarak göster"**; tek dokunuşla hepsi değiştirilebilir, alan bazında ayar sonra profil ayarlarında |
| 9 | Bitti 🎉 | — | İki seçenek: **"İlk kombinini paylaş"** veya **"Keşfetmeye başla"** |

**Sonrası:**
- Ölçü adımlarını atlayan kullanıcıya profilinde nazik bir **"Profilin %40 tamam"** kartı; dokununca eksik adımlara geri götürür
- "Bana yakın" sekmesi ölçü yoksa aynı akışın ölçü adımlarını açar
- Bu hatırlatmalar ısrarcı olmaz: kapatılabilir, kapatılınca bir süre tekrar gösterilmez

### Ana sayfa / Feed (`/`)
- İki sekme: **Keşfet** (en yeni) ve **Bana yakın** (giriş yapmış ve ölçü girmiş kullanıcıya, ölçüleri en yakın kişilerin paylaşımları)
- 2 sütunlu grid, dikey fotoğraflar (~3:4)
- Kart üzerinde: fotoğraf, ana ürünün markası, kişinin boyu (ör. "1.65 · M"), giriş yapılmışsa yakınlık rozeti ("Sana çok yakın")
- Sonsuz kaydırma (sayfalama ile)
- Ölçü girmemiş kullanıcıya "Bana yakın" sekmesinde: "Ölçülerini ekle, sana benzeyenleri görelim" çağrısı

### Paylaşım detayı (`/p/[id]`)
- Fotoğraf galerisi (kaydırmalı)
- Paylaşan kişi: kullanıcı adı, profil fotoğrafı ve **paylaşım anındaki** ölçüleri (kişinin gizlilik ayarına göre)
- Yakınlık göstergesi (izleyen kişinin ölçüleriyle karşılaştırma)
- Ürün listesi; her ürün için:
  - Marka · ürün adı · kategori
  - **Aldığı beden** (en belirgin bilgi)
  - Fit değerlendirmesi: Dar / Tam / Bol; boy: Kısa / Tam / Uzun
  - Fit notu ve kumaş notu (varsa)
  - Ürün linki (varsa, yeni sekmede açılır)
- Marka veya ürüne dokununca → o markadaki/üründeki diğer paylaşımlar (arama sonucu)
- Beğen, kaydet, şikayet et

### Profil (`/u/[username]`)
- Profil fotoğrafı, görünen ad, kullanıcı adı, kısa bio
- Ölçü kartı (gizlilik ayarına göre)
- Genelde giydiği bedenler (üst / alt / ayakkabı)
- Paylaşımları (grid)
- Kendi profilinde ek sekme: Kaydettiklerim

### Profil düzenleme (`/ayarlar/profil`)
- Kimlik: ad, kullanıcı adı, fotoğraf, bio
- **Ölçüler** (hepsi opsiyonel, her biri ayrı girilir):
  - Boy (cm), kilo (kg)
  - Göğüs, bel, kalça (cm)
  - Bacak iç boyu (cm)
  - Ayakkabı numarası
  - Genelde giydiği beden: üst (XS–XXL), alt (34–46 / XS–XXL), ayakkabı
  - Vücut tipi (opsiyonel, seçmeli)
- Her ölçü alanının yanında kısa "nasıl ölçülür" ipucu
- **Gizlilik:** her ölçü için görünürlük — "Herkese açık" / "Aralık olarak göster" (ör. 60–65 kg) / "Gizli (sadece eşleştirmede kullanılsın)"

### Paylaşım yükleme (`/yeni`)
Adım adım, telefonda kolay doldurulacak bir form:
1. **Fotoğraflar:** 1–6 adet; sıralanabilir. Önerilen pozlar ipucu olarak gösterilir: önden, yandan, otururken.
2. **Ürünler:** en az 1, en çok 8. Her ürün için:
   - Marka (otomatik tamamlamalı; yoksa yeni eklenebilir)
   - Ürün adı / model (serbest metin, ör. "Straight Fit Jean")
   - Kategori (pantolon, etek, elbise, gömlek, tişört, ceket, ayakkabı, …)
   - **Aldığı beden** (zorunlu)
   - Fit: Dar / Tam / Bol (opsiyonel); Boy: Kısa / Tam / Uzun (opsiyonel)
   - Fit notu, kumaş notu (opsiyonel, serbest metin)
   - Ürün linki (opsiyonel)
3. **Açıklama** (opsiyonel) ve önizleme → Paylaş

Paylaşırken kullanıcının o anki ölçüleri paylaşıma **kopyalanır** (snapshot). İnsanların ölçüleri zamanla değişir; eski bir paylaşım, o kıyafeti giydiği zamanki ölçülerle anlamlı.

### Arama (`/ara`)
- Tek arama kutusu; sonuçlar sekmelerde: **Paylaşımlar** · **Markalar** · **Kullanıcılar**
- Paylaşım filtreleri:
  - Marka, kategori, beden
  - Boy aralığı, kilo aralığı
  - "Ölçülerime yakın olanlar" anahtarı (giriş yapmış kullanıcı için)
  - Sıralama: en yeni / en yakın vücut / en çok kaydedilen
- Türkçe karakter duyarsız arama: "kot" = "Kot", "gomlek" = "gömlek"

### Ayarlar
- Hesap, gizlilik, bildirimler (v1'de sadece e-posta), **hesabı ve tüm verileri sil**

### Admin (`/admin`, sadece ekip)
- Şikayet edilen paylaşımlar listesi; gizle / sil / kullanıcıyı uyar
- Marka listesini düzenleme (yazım birleştirme: "zara", "ZARA", "Zara Home" ayrımı vb.)

## 4. Vücut yakınlığı (projenin kalbi)

İki kişinin ölçüleri arasındaki benzerlik puanı (0–100). İlk sürüm basit ve açıklanabilir olsun:

- Karşılaştırılan alanlar ve ağırlıklar (başlangıç): boy 0.25, kilo 0.15, bel 0.2, kalça 0.2, göğüs 0.15, bacak iç boyu 0.05
- Her alan için fark, o alanın tolerans değerine bölünür (ör. boy 8 cm, kilo 8 kg, çevre ölçüleri 8 cm), 0–1 arasına kırpılır
- Sadece **iki tarafta da dolu olan** alanlar hesaba katılır; ağırlıklar bu alanlara göre yeniden normalize edilir
- En az 2 ortak alan yoksa puan hesaplanmaz
- Kategoriye göre ağırlık değişebilmeli (pantolonda bel/kalça/bacak; üstte göğüs/omuz önemli) → ağırlıkları kodda sabit değil, bir yapılandırma dosyasında tut
- Arayüzde ham sayı değil etiket: **Çok yakın** (≥85), **Yakın** (70–84), gösterme (<70)
- Hesaplama veritabanında (Postgres fonksiyonu) yapılsın ki web ve ileride mobil app aynı sonucu alsın
- "Aralık olarak göster" veya "gizli" seçilmiş ölçüler de eşleştirmede kullanılır, ama hiçbir yerde ham değer olarak dönmez

## 5. Teknik tercihler

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend:** **Supabase** — Postgres, Auth (e-posta + Google), Storage (fotoğraflar), Row Level Security
  - Neden: ileride mobil app (Expo / React Native) aynı Supabase projesine doğrudan bağlanabilir; ayrı bir API sunucusu yazmak gerekmez
- **İş mantığı yeri:** yakınlık hesabı, arama, gizlilik filtresi gibi kurallar veritabanında (SQL fonksiyonları, view'lar, RLS) veya paylaşılan bir TS paketinde olmalı — React bileşenlerinin içinde değil
- **Arama:** Postgres full-text + `unaccent` + `pg_trgm` (Türkçe karakter ve yazım hatası toleransı). Ayrı bir arama servisi gerekmez.
- **Fotoğraflar:**
  - Yüklemeden önce tarayıcıda küçült (en uzun kenar ~1600px, WebP/JPEG)
  - **EXIF verisini (özellikle konum) temizle**
  - Supabase Storage + Next.js görsel optimizasyonu
- **Deploy:** Vercel (frontend) + Supabase (backend). `main` branch'e push = otomatik yayın
- **PWA:** v1'de manifest + ikon ekle; kullanıcı mobil app gelene kadar ana ekranına ekleyebilsin
- Yeni bağımlılık eklemeden önce sor; sade tut.

## 6. Veri modeli (Supabase / Postgres)

```sql
-- Kullanıcı profili (auth.users ile 1-1)
profiles (
  id uuid pk references auth.users,
  username text unique not null,      -- küçük harf, a-z0-9_.
  display_name text,
  avatar_url text,
  bio text,
  birth_year int,                     -- yaş sınırı kontrolü için
  created_at timestamptz
)

-- Güncel ölçüler (ayrı tablo: daha sıkı erişim kuralı)
body_measurements (
  user_id uuid pk references profiles,
  height_cm numeric, weight_kg numeric,
  bust_cm numeric, waist_cm numeric, hip_cm numeric,
  inseam_cm numeric, shoe_size numeric,
  usual_top_size text, usual_bottom_size text,
  body_type text,
  visibility jsonb,                   -- {"weight_kg": "range", "bust_cm": "hidden", ...}
  updated_at timestamptz
)

brands (
  id uuid pk,
  name text unique,                   -- "Zara"
  slug text unique,
  aliases text[]                      -- ["zara", "ZARA"]
)

posts (
  id uuid pk,
  user_id uuid references profiles,
  caption text,
  measurements_snapshot jsonb,        -- paylaşım anındaki ölçüler + görünürlük
  status text default 'published',    -- published | hidden | removed
  created_at timestamptz
)

post_photos (
  id uuid pk, post_id uuid references posts,
  storage_path text, position int,
  pose text                           -- front | side | sitting | other
)

post_items (
  id uuid pk, post_id uuid references posts,
  brand_id uuid references brands,
  product_name text,                  -- "Straight Fit Jean"
  category text,
  size_bought text not null,          -- "38", "M"
  fit_rating text,                    -- tight | true | loose
  length_rating text,                 -- short | true | long
  fit_note text, fabric_note text,
  product_url text,
  position int
)

likes  (user_id, post_id, created_at, pk(user_id, post_id))
saves  (user_id, post_id, created_at, pk(user_id, post_id))
reports (id, post_id, reporter_id, reason, created_at, resolved_at)
```

**Erişim kuralları (RLS):**
- `body_measurements` ham haliyle **sadece sahibine** okunabilir. Başkalarına ölçüler, görünürlük ayarına göre maskeleyen bir view / fonksiyon üzerinden döner.
- `measurements_snapshot` için de aynı maskeleme geçerli.
- Kullanıcı sadece kendi post, fotoğraf, item kayıtlarını ekler/düzenler/siler.
- `status != 'published'` paylaşımlar sadece sahibine ve admine görünür.

İleride ürün kataloğu gelirse `post_items` → `products` tablosuna bağlanacak; şimdilik serbest metin + marka yeterli, ama bu geçişe uygun tasarla.

## 7. Gizlilik, güvenlik, KVKK

Vücut ölçüleri ve vücut fotoğrafları hassas veridir; baştan doğru kurulmalı.

- Kayıtta **KVKK aydınlatma metni** ve ölçü verisi için **açık rıza** onay kutusu (ön seçili değil)
- **Yaş sınırı:** kayıtta doğum yılı sorulur; sınırın altındakiler kayıt olamaz. (Ekip kesin yaşı belirlemeli; vücut ölçüsü + fotoğraf paylaşımı nedeniyle 18 öneriliyor.)
- Tüm ölçüler opsiyonel; girmeyen kullanıcı da paylaşım yapabilir ve feed'i görebilir
- Hesap silme: profil, ölçüler, paylaşımlar ve Storage'daki tüm fotoğraflar gerçekten silinir
- Fotoğraflarda EXIF/konum temizliği (bkz. §5)
- Şikayet sistemi + admin moderasyonu; topluluk kuralları sayfası (uygunsuz içerik, başkasının fotoğrafı, taciz yok)
- Başkasının ölçülerine göre filtreleme/sıralama yapılabilir ama **ölçü değerleriyle kullanıcı listeleme yapılamaz** (ör. "kilosu 50'nin altındaki kullanıcılar" araması yok); arama sonuçları her zaman paylaşım odaklı
- Yorum yok (v1), dolayısıyla vücut hakkında yorum yapma alanı yok — bilinçli tercih

## 8. Ürün kuralları

- **Dürüstlük:** fit notları kullanıcının kendi değerlendirmesi; düzenlenmez, sansürlenmez (topluluk kurallarına aykırı değilse).
- **Ton:** arayüz metinleri vücut hakkında yargılayıcı olmaz. "İnce/kalın" yerine nötr ifadeler; "ideal kilo" gibi kavramlar hiç kullanılmaz.
- **Şeffaflık (ileride affiliate gelince):** affiliate linkleri etiketlenir; komisyon yüzünden ürün öne çıkarılmaz.

## 9. Tasarım dili

**Renkler**

| Token | Hex | Kullanım |
|---|---|---|
| `ink` | `#1F1B18` | Ana metin, koyu bölümler |
| `cream` | `#F5F0EA` | Sayfa arka planı |
| `sand` | `#ECE4D8` | İkincil arka plan |
| `card` | `#FFFBF6` | Kart arka planı |
| `terracotta` | `#A8432C` | Vurgu, butonlar, etiketler |
| `peach` | `#E8A48A` | Koyu zemin üzerinde vurgu |
| `muted` | `#7A6F66` | İkincil metin |
| `placeholder` | `#D9C7B4` | Görsel yüklenirken |

**Tipografi**
- Başlıklar: **Playfair Display** (serif, vurgu için italik)
- Gövde ve arayüz: **DM Sans**
- Küçük etiketler: DM Sans, büyük harf, geniş harf aralığı, terracotta

**Genel**
- Mobil öncelikli: 375–430px ana hedef; alt sekme çubuğu (Feed · Ara · Yükle · Profil)
- Yumuşak köşeler (12–16px radius), ince bej kenarlıklar
- Sakin, editoryal his; fotoğraflar ön planda
- **Aldığı beden** bilgisi her kartta ve detayda en göze çarpan veri
- Tüm arayüz metni **Türkçe**; büyük harf dönüşümlerinde `toLocaleUpperCase('tr-TR')`

## 10. Kabul kriterleri (v1 bitti sayılır, eğer)

- [ ] Kayıt sonrası profil oluşturma akışı telefonda 1–2 dakikada bitiyor; ölçü adımlarının hepsi atlanabiliyor
- [ ] Kullanıcı kayıt olup ölçülerini girebiliyor, her ölçünün görünürlüğünü ayrı ayarlayabiliyor
- [ ] Telefondan 2 dakikadan kısa sürede fotoğraf + ürün + beden ile paylaşım yapılabiliyor
- [ ] Feed'de "Bana yakın" sekmesi ölçüleri yakın kişilerin paylaşımlarını doğru sırayla gösteriyor
- [ ] "Zara", "zara", "pantolon 38", "kot" gibi aramalar beklenen sonuçları veriyor; Türkçe karakter olmadan yazılınca da çalışıyor
- [ ] Gizli işaretlenen bir ölçü hiçbir API yanıtında ham değer olarak dönmüyor (test ile doğrulanmış)
- [ ] Hesap silinince tüm veri ve fotoğraflar siliniyor
- [ ] Şikayet edilen paylaşım admin ekranında görünüyor ve gizlenebiliyor
- [ ] iOS Safari ve Android Chrome'da düzgün çalışıyor; Lighthouse mobil performans 85+
- [ ] Vercel'de canlı, TikTok bio'suna konabilecek bir link var

## 11. Yapım sırası

1. Proje kurulumu: Next.js, Tailwind, renk/font token'ları, Supabase projesi
2. Veritabanı şeması + RLS kuralları + ölçü maskeleme view'ı (migration dosyaları olarak)
3. Karşılama/giriş sayfası + auth (kayıt, giriş, Google, şifre sıfırlama)
4. Profil oluşturma akışı (onboarding): adım adım, atlanabilir, yarıda bırakılınca kaldığı yerden devam
5. Profil sayfası + profil/ölçü düzenleme + gizlilik ayarları + "profilin %X tamam" kartı
6. Paylaşım yükleme akışı (fotoğraf küçültme + EXIF temizliği dahil)
7. Paylaşım detay sayfası
8. Feed: Keşfet sekmesi
9. Yakınlık fonksiyonu + "Bana yakın" sekmesi + yakınlık rozetleri
10. Arama + filtreler
11. Beğen / kaydet
12. Şikayet + admin ekranı
13. Hesap silme, topluluk kuralları ve KVKK sayfaları
14. PWA manifest, deploy, ekip hesaplarıyla ilk içeriklerin yüklenmesi

Her adım sonunda çalışan, deploy edilebilir bir durum olsun.

## 12. Sonraki aşamalar (şimdi kodlama, sadece yolu açık tut)

- **Mobil uygulama:** Expo / React Native, aynı Supabase backend'i. Paylaşılan tipler ve yakınlık mantığı ortak kalsın.
- **Kişisel beden önerisi:** "Sana en yakın 10 kişi bu pantolonda 38 almış, 8'i tam demiş" → `post_items` verisinden hesaplanacak.
- **Ürün kataloğu:** aynı ürünün farklı paylaşımlarını tek ürün sayfasında toplamak.
- **Affiliate linkleri, fiyat/stok alarmı, premium.**
- **Markalara fit verisi** (anonim, toplu): iade oranlarını düşürmek için.
- **Takip sistemi ve yorumlar** (moderasyon kapasitesi hazır olunca).

Asıl değer, "bu ürün, bu vücut, bu beden" kayıtlarıdır. Veri modelini bozacak kısayollardan kaçın.

---

@AGENTS.md
