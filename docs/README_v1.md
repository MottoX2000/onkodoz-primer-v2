# SE Primer: OnkoDoz-AI Kriz Simülasyonu

YZM301 Yazılım Mühendisliği · "SE Primer" ödevi. *The Diamond Age*'deki Illustrated Primer fikrinden yola çıkan, kişiye uyum sağlayan bir hastane bilişimi kriz simülasyonu: oyuncu kurgusal Kuzey Yıldızı Onkoloji Hastanesi'nde 08:15'te çöken kemoterapi dozaj servisinde nöbetçi mühendistir ve 3 karar verir (Mimari → Test → KVKK). Sokratik AI Tutor ipucu verir ama cevabı söylemez.

| Teslim | Dosya |
| :--- | :--- |
| Spesifikasyon (problem, kapsam dışı, 5 kabul örneği, durum makinesi, 8 yol matrisi) | [`spec.md`](spec.md) |
| Tasarım sistemi + 3 Stitch ekranı | [`DESIGN.md`](DESIGN.md) |
| Tutor Eval (20 girdi, E1–E4, öncesi/sonrası) | [`EVAL.md`](EVAL.md) |
| Cypress E2E testleri | [`cypress/e2e/onkodoz.cy.js`](cypress/e2e/onkodoz.cy.js) |
| Demo videosu (Cypress koşusu, ~60 sn) | `cypress/videos/onkodoz.cy.js.mp4` |
| Çalışan uygulama (Google AI Studio) | _AI Studio linkini buraya ekleyin_ |

## Ürün Kararı: Bilerek Yapılmayan 3 Özellik

1. **Kullanıcı hesabı / giriş yok** — Tek oturumluk, 5 dakikalık bir pedagojik deneyimde kimlik doğrulama hiçbir öğrenme hedefine hizmet etmez; üstelik kişisel veri toplamaya başlamak, KVKK'yı öğreten bir uygulamanın kendisini KVKK yükümlülüğü altına sokması demektir.
2. **İkinci bölüm / ek senaryo yok** — 3 karar × 2 seçenek = 8 yolun tamamı deterministik olarak tanımlı ve Cypress ile test edilebilir durumdayken, ikinci bir bölüm test edilmesi gereken yol sayısını katlayıp tek senaryonun derinliğini (Ne Oldu / Neden Oldu, rol telemetrisi, hedefe özel karne) sulandırırdı.
3. **Native mobil uygulama yok** — Hocanın ve arkadaşların tek bir linkle telefonda açabilmesi hedefi, mobil web (375×812) ile mağaza onayı, iki ayrı derleme hattı ve kurulum sürtünmesi olmadan karşılanıyor.

(Ek olarak: **gerçek hasta verisi kullanılmaz** — tüm hasta, TCKN ve tanı kodları sentetiktir.)

## Çalıştırma

Gereksinim: Node 24+.

```bash
npm install
npm run dev            # http://localhost:3000
```

`GEMINI_API_KEY` tanımlı değilse Tutor, sahneye bağlı deterministik Sokratik motorla (`src/data/simulationData.ts`) çalışır; anahtar `.env` dosyasına konursa Gemini 2.5 Flash kullanılır ve çıktısı yine sunucu tarafı guardrail'den geçer.

## Testler

```bash
npm run dev            # terminal 1
npm run cypress:run    # terminal 2 → 6 test, video: cypress/videos/onkodoz.cy.js.mp4 (Chrome, headed)
npx tsx scripts/run-eval.ts   # 20 girdilik Tutor eval (EVAL.md)
```

Cypress kapsamı: 5 kabul örneğinin tamamı + karar yolları A-A-A (İyi Son), A-A-B (KVKK ihlali), A-B-A (Test ihlali), B-A-A (Cache Stampede), B-B-B (Tam çöküş). Başka bir ortamı test etmek için: `npx cypress run --config baseUrl=<url>`.

## Teknoloji

React 19 · TypeScript · Vite · Tailwind CSS · Express (`server.ts`, Gemini REST çağrısı Node yerleşik `fetch` ile) · Cypress.

> **Video notu:** Varsayılan Electron tarayıcısı (Cypress 16'da deprecated) ve headless Chrome bu makinede videoyu "Your tests are loading..." karesinde donduruyor; testler geçse de kayıt boş kalıyor. Bu yüzden kayıt `--browser chrome --headed` ile alınır (koşu sırasında Chrome penceresi açılır, kapatmayın).
