export const metadata = { title: "KVKK aydınlatma metni" };

// TASLAK: Yayından önce bir hukukçu tarafından gözden geçirilmeli; veri sorumlusu bilgileri eklenmeli.
export default function KvkkPage() {
  return (
    <>
      <h1>KVKK aydınlatma metni</h1>
      <p className="rounded-xl bg-sand p-3 text-sm">Bu metin taslaktır ve yayına alınmadan önce hukuki olarak gözden geçirilecektir.</p>
      <p>6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında, Donna olarak kişisel verilerini nasıl işlediğimizi aşağıda açıklıyoruz.</p>

      <h2>Hangi verileri işliyoruz?</h2>
      <ul>
        <li><b>Hesap bilgileri:</b> e-posta adresi, kullanıcı adı, görünen ad, doğum yılı, profil fotoğrafı.</li>
        <li><b>Vücut ölçüleri (açık rızaya bağlı):</b> boy, kilo, göğüs, bel, kalça, bacak iç boyu, ayakkabı numarası, genelde giydiğin bedenler, vücut tipi.</li>
        <li><b>Paylaşımlar:</b> yüklediğin fotoğraflar, ürün, beden ve fit bilgileri, açıklamalar.</li>
        <li><b>Kullanım verileri:</b> beğeni, kaydetme ve şikayet kayıtları.</li>
      </ul>

      <h2>Hangi amaçla?</h2>
      <ul>
        <li>Hesabını oluşturmak ve hizmeti sunmak.</li>
        <li>Sana vücut ölçüleri yakın kullanıcıların paylaşımlarını göstermek (yakınlık eşleştirmesi).</li>
        <li>Yaş sınırını kontrol etmek, topluluğu güvenli tutmak ve şikayetleri incelemek.</li>
      </ul>

      <h2>Hukuki sebep</h2>
      <p>Hesap ve paylaşım verilerini, sözleşmenin kurulması ve ifası (KVKK m.5/2-c) kapsamında işliyoruz. Vücut ölçüleri ve vücut fotoğrafları özel nitelikli kişisel veri sayılabileceğinden, bu veriler yalnızca <b id="acik-riza">açık rızana</b> dayanarak (KVKK m.6) işlenir.</p>

      <h2>Açık rıza metni</h2>
      <p>&quot;Vücut ölçülerimin, bana benzeyen kullanıcıları eşleştirmek amacıyla işlenmesine açık rıza veriyorum.&quot; Bu rızayı vermek zorunda değilsin; vermezsen Donna&apos;yı ölçüsüz kullanmaya devam edebilirsin. Rızanı istediğin zaman Ayarlar → Gizlilik bölümünden geri çekebilirsin; bu durumda kayıtlı ölçülerin ve paylaşımlarındaki ölçü bilgileri silinir.</p>

      <h2>Görünürlük</h2>
      <p>Her ölçünün başkalarına nasıl görüneceğini sen seçersin: herkese açık, aralık olarak (ör. 60–65 kg) ya da gizli. Gizli ölçüler yalnızca eşleştirmede kullanılır, hiçbir yerde ham değer olarak gösterilmez. Ölçü değerlerine göre kullanıcı listelenemez.</p>

      <h2>Fotoğraflar</h2>
      <p>Fotoğrafların yüklenmeden önce cihazında küçültülür ve konum dahil gizli bilgileri (EXIF) silinir.</p>

      <h2>Aktarım ve saklama</h2>
      <p>Veriler, hizmet sağlayıcılarımız Supabase (veritabanı ve dosya depolama, AB/Frankfurt) ve Vercel (barındırma) altyapısında saklanır. Verilerin, hesabın açık olduğu sürece saklanır; hesabını sildiğinde profilin, ölçülerin, paylaşımların ve fotoğrafların kalıcı olarak silinir.</p>

      <h2>Hakların</h2>
      <p>KVKK m.11 kapsamında verilerine erişme, düzeltme, silme ve işlemeye itiraz etme hakların vardır. Hesabını ve tüm verilerini Ayarlar → &quot;Hesabımı ve tüm verilerimi sil&quot; ile kendin silebilirsin. Diğer talepler için bize ulaşabilirsin.</p>
    </>
  );
}
