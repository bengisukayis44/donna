-- Genişletilmiş marka listesi: Türkiye'de sık alışveriş yapılan yerli ve yabancı markalar.
-- Listede olmayanları kullanıcılar paylaşırken ekleyebilir; yazım farkları admin panelinden birleştirilir.
-- Zaten var olan markalar (ad veya takma ad eşleşmesi) atlanır.

with incoming (name, aliases) as (values
  -- Yerli giyim
  ('Mavi', '{}'::text[]), ('Koton', '{koton jeans}'), ('LC Waikiki', '{lcw}'), ('DeFacto', '{de facto}'),
  ('Colin''s', '{colins}'), ('Loft', '{}'), ('Twist', '{}'), ('İpekyol', '{ipekyol}'), ('Machka', '{}'),
  ('Network', '{}'), ('Vakko', '{}'), ('Vakkorama', '{}'), ('Beymen', '{}'), ('Beymen Club', '{}'),
  ('Beymen Collection', '{}'), ('Boyner', '{}'), ('Yargıcı', '{yargici}'), ('Roman', '{}'), ('Mudo', '{mudo concept}'),
  ('Gizia', '{}'), ('Exquise', '{}'), ('Seçil', '{secil store}'), ('Ekol', '{}'), ('Faik Sönmez', '{faik sonmez}'),
  ('Adl', '{}'), ('Fabrika', '{people by fabrika}'), ('Cotton Bar', '{}'), ('Quzu', '{}'), ('Bigdart', '{}'),
  ('Batik', '{}'), ('Journey', '{}'), ('Perspective', '{}'), ('Ltb', '{ltb jeans}'), ('Xint', '{}'),
  ('Tudors', '{}'), ('Cabani', '{}'), ('Lufian', '{}'), ('Jakamen', '{}'), ('Avva', '{}'), ('Kiğılı', '{kigili}'),
  ('Ramsey', '{}'), ('Damat', '{d''s damat}'), ('Tween', '{damat tween}'), ('Altınyıldız Classics', '{altinyildiz}'),
  ('Sarar', '{}'), ('Hatemoğlu', '{hatemoglu}'), ('Süvari', '{suvari}'), ('Les Benjamins', '{}'), ('Nocturne', '{}'),
  ('Raisa Vanessa', '{}'), ('Dice Kayek', '{}'), ('Lug Von Siga', '{}'), ('Penti', '{}'),
  ('Suwen', '{}'), ('Kom', '{}'), ('Blackspade', '{}'), ('Dagi', '{}'), ('Kip', '{}'), ('Mizalle', '{}'),
  ('Trendyol Modest', '{trendyol tesettur}'), ('TrendyolMilla', '{trendyol milla,milla}'), ('Trendyol Man', '{}'),
  ('Modanisa', '{}'), ('Armine', '{}'), ('Kayra', '{}'), ('Aker', '{}'), ('Setrms', '{}'), ('Vavist', '{}'),
  ('Sefamerve', '{}'), ('Alvina', '{}'), ('Jument', '{}'), ('Pierre Cardin', '{}'),
  -- Yerli ayakkabı ve çanta
  ('Hotiç', '{hotic}'), ('Derimod', '{}'), ('Desa', '{}'), ('Divarese', '{}'), ('Elle Shoes', '{elle}'),
  ('FLO', '{flo ayakkabi}'), ('Polaris', '{}'), ('Kinetix', '{}'), ('Lumberjack', '{}'), ('Greyder', '{}'),
  ('Butigo', '{}'), ('Marjin', '{}'), ('In Street', '{instreet}'), ('Lescon', '{}'),
  ('Pegia', '{}'), ('Matraş', '{matras}'), ('Kemal Tanca', '{}'),
  -- Hızlı moda / zincir
  ('Zara', '{}'), ('Mango', '{}'), ('H&M', '{hm,h and m}'), ('Pull&Bear', '{pull and bear,pullbear}'),
  ('Stradivarius', '{stradi}'), ('Massimo Dutti', '{massimo}'), ('Oysho', '{}'), ('Lefties', '{}'),
  ('Uniqlo', '{}'), ('COS', '{}'), ('& Other Stories', '{other stories}'), ('Arket', '{}'), ('Weekday', '{}'),
  ('Monki', '{}'), ('Primark', '{}'), ('Reserved', '{}'), ('Mohito', '{}'), ('Sinsay', '{}'), ('House', '{}'),
  ('Cropp', '{}'), ('New Look', '{}'), ('River Island', '{}'), ('Topshop', '{}'), ('Shein', '{}'), ('ASOS', '{asos design}'),
  ('Boohoo', '{}'), ('PrettyLittleThing', '{plt,pretty little thing}'), ('Urban Outfitters', '{uo}'),
  ('Bershka', '{}'), ('Marks & Spencer', '{m&s,marks and spencer}'), ('Next', '{}'), ('Gap', '{}'),
  ('Banana Republic', '{}'), ('United Colors of Benetton', '{benetton}'), ('Sisley', '{}'), ('Superdry', '{}'),
  ('Esprit', '{}'), ('s.Oliver', '{s oliver}'), ('Tom Tailor', '{}'), ('Desigual', '{}'), ('Only', '{}'),
  ('Vero Moda', '{}'), ('Jack & Jones', '{jack and jones}'), ('Pieces', '{}'), ('Noisy May', '{}'),
  ('Selected', '{selected femme,selected homme}'), ('Object', '{}'), ('JJXX', '{}'),
  -- Denim
  ('Levi''s', '{levis,levi}'), ('Lee', '{}'), ('Wrangler', '{}'), ('Lee Cooper', '{}'), ('Diesel', '{}'),
  ('Pepe Jeans', '{}'), ('Guess', '{}'), ('G-Star Raw', '{g-star,gstar}'), ('Calvin Klein Jeans', '{ck jeans}'),
  -- Premium / marka
  ('Tommy Hilfiger', '{tommy}'), ('Calvin Klein', '{ck}'), ('Lacoste', '{}'), ('Gant', '{}'),
  ('U.S. Polo Assn.', '{us polo,uspa}'), ('Nautica', '{}'), ('Polo Ralph Lauren', '{ralph lauren}'),
  ('BOSS', '{hugo boss}'), ('HUGO', '{}'), ('Armani Exchange', '{a|x,ax}'), ('Emporio Armani', '{}'),
  ('Michael Kors', '{mk}'), ('Coach', '{}'), ('Kate Spade', '{}'), ('Tory Burch', '{}'), ('Marc Jacobs', '{}'),
  ('Maje', '{}'), ('Sandro', '{}'), ('Claudie Pierlot', '{}'), ('The Kooples', '{}'), ('Zadig & Voltaire', '{zadig}'),
  ('Ganni', '{}'), ('Acne Studios', '{acne}'), ('Max Mara', '{}'), ('Weekend Max Mara', '{}'), ('Sézane', '{sezane}'),
  ('Reformation', '{}'), ('Rouje', '{}'), ('Jacquemus', '{}'), ('Isabel Marant', '{}'), ('Kenzo', '{}'),
  ('Love Moschino', '{}'), ('Moschino', '{}'), ('Moncler', '{}'), ('Karl Lagerfeld', '{}'),
  -- Lüks
  ('Gucci', '{}'), ('Prada', '{}'), ('Miu Miu', '{}'), ('Louis Vuitton', '{lv}'), ('Dior', '{christian dior}'),
  ('Chanel', '{}'), ('Saint Laurent', '{ysl}'), ('Balenciaga', '{}'), ('Bottega Veneta', '{}'), ('Celine', '{}'),
  ('Loewe', '{}'), ('Fendi', '{}'), ('Versace', '{}'), ('Valentino', '{}'), ('Givenchy', '{}'), ('Burberry', '{}'),
  ('Alexander McQueen', '{mcqueen}'), ('Dolce & Gabbana', '{d&g,dolce gabbana}'), ('Off-White', '{off white}'),
  ('Giorgio Armani', '{}'), ('Hermès', '{hermes}'), ('Jimmy Choo', '{}'), ('Christian Louboutin', '{louboutin}'),
  -- Spor ve ayakkabı
  ('Nike', '{}'), ('Adidas', '{}'), ('New Balance', '{nb}'), ('Puma', '{}'), ('Reebok', '{}'), ('Asics', '{}'),
  ('Converse', '{}'), ('Vans', '{}'), ('Under Armour', '{}'), ('The North Face', '{tnf,north face}'),
  ('Columbia', '{}'), ('Skechers', '{}'), ('Fila', '{}'), ('Kappa', '{}'), ('Champion', '{}'), ('Hummel', '{}'),
  ('Slazenger', '{}'), ('Lululemon', '{}'), ('Alo Yoga', '{alo}'), ('Gymshark', '{}'), ('Salomon', '{}'),
  ('On', '{on running}'), ('Hoka', '{hoka one one}'), ('Jordan', '{air jordan}'), ('Timberland', '{}'),
  ('Dr. Martens', '{dr martens,docs}'), ('UGG', '{}'), ('Crocs', '{}'), ('Birkenstock', '{}'), ('Clarks', '{}'),
  ('Geox', '{}'), ('Ecco', '{}'), ('Camper', '{}'), ('Steve Madden', '{}'), ('Aldo', '{}'), ('Nine West', '{}'),
  ('Veja', '{}'), ('Onitsuka Tiger', '{}'), ('Mizuno', '{}'), ('Saucony', '{}'), ('Merrell', '{}'),
  ('Jack Wolfskin', '{}'), ('Quiksilver', '{}'), ('Roxy', '{}'), ('Mammut', '{}'), ('Patagonia', '{}'),
  ('Decathlon', '{kalenji,domyos,quechua}'),
  -- İç giyim / mayo
  ('Victoria''s Secret', '{victorias secret,vs}'), ('Intimissimi', '{}'), ('Calzedonia', '{}'), ('Tezenis', '{}'),
  ('Women''secret', '{womensecret,women secret}'), ('Hunkemöller', '{hunkemoller}'), ('Skims', '{}'),
  -- Çanta / aksesuar
  ('Accessorize', '{}'), ('Swarovski', '{}'), ('Pandora', '{}'), ('Fossil', '{}'), ('Longchamp', '{}')
)
insert into public.brands (name, slug, aliases)
select i.name, public.slugify(i.name), i.aliases
  from incoming i
 where not exists (
   select 1 from public.brands b
    where public.norm(b.name) = public.norm(i.name)
       or public.norm(i.name) = any (select public.norm(x) from unnest(b.aliases) x))
on conflict do nothing;

-- Trendyol'un kendi markaları için arama kolaylığı
update public.brands set aliases = array(select distinct unnest(aliases || '{trendyol}'::text[]))
 where slug = 'trendyol-collection';
