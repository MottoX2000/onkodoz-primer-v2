# Sizinle Uyumlanan Vize Sorusu — Tasarım (1 sayfa)

> Not: Bu düşünce egzersizinin taslağı Claude Code ile yazıldı (bkz. README → Yapay Zekâ Beyanı).

## Tasarım fikri
Ezberi ölçen soru "Diferansiyel test nedir?" diye sorar. Kavramın özünü ölçen soru ise öğrenciye **bozuk bir durum** verir ve kararını **gerekçelendirmesini** ister. "Uyumlanma" sorunun içinde yapılır: aynı senaryonun 3 basamağı vardır ve öğrenci basamak seçer (C: 60 puan tavan, B: 80, A: 100). Bu, The Primer'daki seviye seçiminin sınavdaki karşılığıdır.

## Soru (klasik, kapalı kitap, 40 dk)
Bir ekip, hastane triyaj uygulaması için küçük bir lojistik regresyon modelini ONNX'e çevirip **hem** Android uygulamasında **hem** Python servisinde çalıştırıyor. 300 hasta kaydından oluşan bir referans setiyle iki sistemi karşılaştırıyorlar. Sonuç: 297 girdide fark < 1e-6, **3 girdide** fark 0.31.

1. *(Tüm basamaklar)* Bu karşılaştırma bir **doğrulama** mı, **geçerleme** mi? Python servisini "test kahini" saymak hangi varsayıma dayanır ve bu varsayım ne zaman çöker?
2. *(C)* Tolerans olarak `1e-4` mü, `0.05` mi seçerdiniz? Neden `0` seçilmez?
3. *(B)* 3 aykırı girdinin hepsinde `yas` alanı boş. Hata modelde mi, sözleşmede mi (özellik sırası, eksik değer, tip)? Hangi testi **önce** yazardınız: karakterizasyon testi mi, regresyon testi mi? Gerekçelendirin.
4. *(A)* Ekip "297/300 = %99 uyum, yayınlayalım" diyor. Bir triyaj sisteminde neden ortalama uyum yerine **en kötü durum farkı** raporlanmalıdır? Bu sürümü Shadow → Canary ile devreye alırken hangi metriği hangi eşikle izlerdiniz ve rollback'i ne tetikler?

## Beklenen temel kavramlar
* Doğrulama ("ürünü doğru mu yaptık?", iki uygulama birbirine uyuyor mu) ile geçerleme ("doğru ürünü mü yaptık?", triyaj gerçekten doğru mu) ayrımı. Parite testi **doğrulamadır**; iki sistem aynı yanlışı yapıyorsa yakalayamaz.
* Test kahininin de hatalı olabileceği (oracle problemi).
* Kayan nokta farkı nedeniyle tolerans gerekir: `1e-4` olasılık farkı karar eşiğini neredeyse hiç çevirmez, `0.05` çevirebilir.
* Sözleşme (`config.json`): özellik sırası, NaN / boş değer politikası, float32 ile float64 farkı.
* Karakterizasyon testi: mevcut davranışı önce dondurur, sonra değiştirir. Regresyon testi: düzeltmeden sonra eski hatanın geri gelmesini engeller.
* Ortalamanın kuyruktaki felaketi gizlemesi; blast radius; canary metriği ve rollback tetikleyicisi.

## Çeldiriciler (bilerek konuldu)
* "%99 uyum" ifadesi yüksek görünür, ama yanlış kararın maliyeti asimetriktir.
* "Python referans olduğuna göre Android yanlıştır" varsayımı: hata Python tarafındaki eksik değer doldurmasında da olabilir.
* "Toleransı büyütelim, test geçsin." Testi geçirmek ile sistemi düzeltmek aynı şey değildir.

## Puanlama anahtarı (kısa)
Her alt soruda puanın yarısı doğru kavramdan, yarısı **gerekçeden** gelir. Gerekçesiz doğru cevap yarım puan alır. Tutarlı gerekçeyle savunulmuş farklı bir tolerans seçimi tam puan alabilir.
