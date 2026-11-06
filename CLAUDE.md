CLAUDE.md — YZM301 "SE Primer: OnkoDoz-AI" Project Context & Handoff Guide

Bu doküman, projeye Claude Code ile devam ederken hem proje kök dizininde CLAUDE.md olarak tutulması hem de ilk başlangıç komutu (prompt) olarak verilmesi için hazırlanmıştır.

1. Ödevin Amacı ve Hoca Puanlama Kriterleri (100 Puan + Slayt Konuşmacı Notları)

Ders: YZM301 Yazılım Mühendisliği · 1 Haftalık Ödev ("SE Primer")

Konsept: Neal Stephenson'ın The Diamond Age romanındaki kişiye uyum sağlayan kitap (Illustrated Primer) fikrinin yazılım mühendisliği kriz yönetimine uyarlanması (Black Mirror: Bandersnatch tarzı seçimli hastane bilişimi krizi).

Hocanın Kritik Notu: "Kod kalitesini ayrı puanlamıyoruz; kod AI’ın, spec, eval ve ürün kararı öğrencinin. En yüksek puan eval’de, çünkü 'tutor cevabı vermez' iddiası ancak ölçülerek savunulur."

Teslim Kalemi

Puan

Zorunlu İçerik ve Doğrulama Kriteri

1. spec.md

20

Problem tanımı, Kapsam Dışı listesi (Kullanıcı hesabı/giriş, İkinci bölüm, Gerçek hasta verisi, Native mobil uygulama kelimesi kelimesine yer almalı), 5 kabul örneği (5. örnek arkadaş testinde keşfedilen görünmez varsayım: Deneyimli modda Tutor açıkken 60sn sayacın duraklatılması), Sommerville Bölüm 5 Durum Makinesi (Mermaid stateDiagram-v2) ve 2³ = 8 karar yolu matrisi.

2. Tasarım (DESIGN.md + Stitch)

15

Google Stitch ile üretilmiş 3 mobil ekran (Giriş, Sahne, Son) + Retro 70s Clinical Command temalı DESIGN.md dosyası.

3. Çalışan Uygulama

20

Google AI Studio uygulama linki; mobil görünümde (375x812px) baştan sona oynanabilir olmalı.

4. Tutor Eval (EVAL.md)

25

Sokratik AI Tutor'a 5 kategoride (Doğru düşünen, Yanlış düşünen, Yarım bilen, Alakasız konuşan, "Cevabı söyle" diye ısrar eden/Adversarial) toplam 20 öğrenci cevabı verilmesi, hata türlerinin (E1_DIRECT_SPOILER, E2_PROMPT_INJECTION, E3_NO_QUESTION, E4_CONTEXT_DRIFT) elle etiketlenmesi ve prompt iyileştirmesi öncesi/sonrası hata oranının (%35 → %0) raporlanması.

5. Cypress E2E + Video

10

Tüm karar yollarının (A-A-A İyi Son, A-A-B KVKK İhlali, A-B-A Test İhlali, B-A-A Cache Stampede, B-B-B Tam Çöküş) ve 5 kabul kriterinin E2E test edilmesi (cypress/e2e/onkodoz.cy.js) + koşudan alınan 60 saniyelik demo video (.mp4).

6. Ürün Kararı (README.md)

10

README.md içinde bilerek yapılmayan 3 özellik ve her biri için tek cümlelik mühendislik gerekçesi.

2. Senaryo ve Durum Makinesi Özeti ("OnkoDoz-AI Kemoterapi Servisi Krizi")

Senaryo: Kurgusal Kuzey Yıldızı Onkoloji Hastanesi'nde gece çıkılan OnkoDoz-v2.4.0 sürümü, sabah 08:15'te laboratuvar gecikmesinde Redis önbelleğindeki 72 saatlik eski eGFR böbrek verisini kullanmaya başlar. 48 kemoterapi hastası beklemektedir.

Girişte 3 Kişiselleştirme Sorusu (S0_Giris_Profil):

Deneyim Seviyesi: Yeni Başladım (Kavram ipucu kartı [data-cy="beginner-hint-card"] açık, sayaç yok) vs. Deneyimliyim (İpucu gizli, 60 sn geri sayım sayacı [data-cy="timer-display"] aktif; Tutor açılınca [data-cy="timer-paused-badge"] ile duraklatılır).

Mühendislik Rolü: Backend, QA / Test, DevSecOps — her sahnede CRT telemetri kutusu ([data-cy="role-telemetry"]) seçilen role özgü log satırları gösterir.

Öğrenme Hedefi: Mimari Dayanıklılık, Güvenli Sürüm (Test), KVKK ve Veri Gizliliği — oyun sonundaki karnede bu hedefe özel analiz gösterilir.

3 Mühendislik Kararı ve 2 Son:

Karar 1 (S1_Karar1_Mimari - 08:15): A (Kararlı v2.3.9 sürümüne Rollback + Read-Replica Strong Consistency) vs. B (Canlıda Redis FLUSHALL → Cache Stampede / Thundering Herd nedeniyle DB bağlantı havuzu çöker).

Karar 2 (S2_Karar2_Test - 08:23): A (eGFR = 29.9 / 30.0 Sınır Değer Duman Testi + 2 pompada Canary Yayını) vs. B (Mock birim testlerine güvenip doğrudan 48 pompaya yayına alma → "29,5" virgüllü string NaN hatasıyla 12 pompayı kilitler).

Karar 3 (S3_Karar3_KVKK - 08:32): A (crash_dump.log içindeki TCKN ve ICD-10 tanı kodlarını maskeleyip yalnızca trace_id ile paylaşma) vs. B (Ham logu olduğu gibi dış Slack kanalına atma → 6698 sayılı KVKK Madde 6 ve 12 özel nitelikli sağlık verisi ihlali).

Sonlar: Yalnızca A → A → A yolu SON A · İYİ ([data-cy="ending-good"]) ekranına çıkar; en az bir B içeren diğer 7 yol SON B · KÖTÜ ([data-cy="ending-bad"]) ekranına ve yola özgü otopsi raporuna ([data-cy="path-summary"]) çıkar.

3. Mevcut Repo Mimarisinde Bilinmesi Gereken Teknik Detaylar ve Düzeltmeler

Proje Google AI Studio tarafından React 19 + TypeScript + Vite + Express (server.ts) + Tailwind CSS olarak üretilmiştir. Windows (Node v24.14.1 / npm v11.11.0) ortamında çalıştırırken şu 4 teknik kurala dikkat edilmelidir:

package.json ve server.ts (@google/genai ETARGET Sorunu):

AI Studio'nun ilk ürettiği package.json dosyasında npm kayıt defterinde bulunmayan sürüm numaraları (@google/genai: ^2.4.0, vite: ^8.3.0, typescript: ^7.0.2, @vitejs/plugin-react: ^6.1.1) yer alıyordu.

Çözüm: @google/genai paketi package.json'dan tamamen kaldırılmalı ve server.ts içinde Gemini REST API çağrısı doğrudan Node v24 yerleşik fetch() fonksiyonuyla yapılmalıdır (GEMINI_API_KEY yoksa veya hata verirse src/data/simulationData.ts içindeki generateDeterministicSocraticReply devreye girer). Diğer paketlerde "latest" veya gerçek npm sürümleri (vite: ^6.2.0, typescript: ^5.7.3, tsx: ^4.19.2, cypress: ^14.0.0) kullanılmalıdır.

ES Module ("type": "module") ve cypress.config.js:

package.json içinde "type": "module" bulunduğu için cypress.config.js dosyasında require("cypress") yerine mutlaka import { defineConfig } from "cypress"; export default defineConfig({ ... }) kullanılmalıdır.

src/components/CrisisStageScreen.tsx İçinde Eksik data-cy="stage-title":

CrisisStageScreen.tsx içindeki sahne başlığı (<h2 className="font-display text-[20px] ...">{stage.title}</h2>) elemanında data-cy="stage-title" özniteliği mutlaka bulunmalıdır.

React Koşullu Render (&&) ve Cypress Seçicileri (cypress/e2e/onkodoz.cy.js):

React bileşenlerinde beginner-hint-card, timer-display, ending-good ve ending-bad koşullu olarak DOM'a eklendiği için Cypress testinde gizli oldukları durumlar .should('not.be.visible') yerine .should('not.exist') ile doğrulanmalıdır.

Giriş ekranındaki rol seçim butonları data-cy="select-role-backend", data-cy="select-role-qa" ve data-cy="select-role-devsecops" seçicilerini kullanır.

4. Claude Code İçin İlk Görev Listesi (Kopyala-Yapıştır Komutu)

Claude Code'u proje klasöründe başlattığında aşağıdaki komutu doğrudan verebilirsin:

CLAUDE.md dosyasını oku. Projede şu adımları sırasıyla tamamla ve doğrula:

1. package.json içindeki paket sürümlerini kontrol et (@google/genai bağımlılığını kaldırıp server.ts içinde yerleşik fetch kullanıldığından emin ol) ve `npm install` komutunu çalıştır.
2. src/components/CrisisStageScreen.tsx içinde stage.title'ı gösteren <h2> etiketinde `data-cy="stage-title"` bulunduğunu ve cypress.config.js dosyasının ES Module (`export default defineConfig`) formatında olduğunu doğrula.
3. Kök dizinde spec.md, DESIGN.md, EVAL.md ve README.md dosyalarının eksiksiz bulunduğunu kontrol et.
4. Arka planda `npm run dev` ile sunucuyu http://localhost:3000 üzerinde başlat, ardından `npx cypress run` komutunu çalıştırarak tüm E2E testlerinin yeşil geçtiğini ve `cypress/videos/onkodoz.cy.js.mp4` demo videosunun oluştuğunu doğrula.

5. Cypress 16 Notu (2026-10-29)

package.json'daki "cypress": "latest" Cypress 16.2.1'e çözülüyor. Cypress 16'da Cypress.env() kaldırıldı; bu yüzden onkodoz.cy.js içinde cy.visit('/') kullanılır ve hedef URL cypress.config.js baseUrl'inden gelir (farklı ortam için: npx cypress run --config baseUrl=<url>).
Video kaydı: Electron ve headless Chrome videoyu ilk karede donduruyor. Demo videosu için `npm run cypress:run` (= cypress run --browser chrome --headed) kullanılmalı.
