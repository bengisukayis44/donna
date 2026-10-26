# donna

Kombini gör. Bedenini bil. Tek tıkla al.

Kullanıcıların kendi aldıkları kıyafetleri üzerlerinde, aldıkları beden ve vücut ölçüleriyle paylaştığı platform. Proje rehberi: [CLAUDE.md](CLAUDE.md).

## Yığın

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Supabase: Postgres, Auth, Storage, RLS — iş mantığı (maskeleme, yakınlık, arama) `supabase/migrations` içindeki SQL fonksiyonlarında
- Vercel: `main`'e push = otomatik yayın

## Geliştirme

```bash
npm install
cp .env.example .env.local   # değerleri doldur
npm run dev
```

## Veritabanı

Şema değişiklikleri `supabase/migrations/` altına yeni bir dosya olarak eklenir ve şöyle uygulanır:

```bash
supabase db push
```

Gizlilik testi (gizli ölçülerin hiçbir API yanıtında ham değer olarak dönmediğini doğrular):

```bash
npm run test:privacy
```
