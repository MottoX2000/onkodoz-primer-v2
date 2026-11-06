# DESIGN.md — SE Primer: OnkoDoz-AI Kriz Simülasyonu Tasarım Sistemi

**Proje:** YZM301 SE Primer · OnkoDoz-AI Kemoterapi Servisi Kriz Simülasyonu  
**Format Standardı:** Google Stitch Open `DESIGN.md` Specification (`v1.0`)  
**Hedef Platform:** Mobil Öncelikli Web Uygulaması (`375x812px` referans görünüm, `max-width: 480px` duyarlı konteyner)  
**Bağlı Spesifikasyon:** `spec.md` (Durum Makinesi, 3 Karar Ağacı, Sokratik AI Tutor ve Cypress `data-cy` Sözleşmesi)

## 1. Görsel Yönelim ve Marka Karakteri (Visual Direction & Brand Essence)

**Tasarım Arketipi:** *Clinical Command & Socratic Primer* (Klinik Komuta Merkezi ve Etkileşimli Mühendislik Kitabı)

Uygulama, sabah **08:15**'te bir onkoloji hastanesinin kemoterapi dozaj mikroservisinde (`OnkoDoz-v2.4.0`) yaşanan yüksek stresli bir üretim krizini simüle eder. Görsel dil iki zıt duyguyu dengeler:

1. **Klinik Kriz Ciddiyeti (Operasyonel Katman):** Koyu arduvaz (*deep slate*) arka planlar, yüksek kontrastlı laboratuvar telemetri kutuları ve aciliyet hissi veren kehribar/mercan durum göstergeleri.
2. **Sokratik Bilgelik (Pedagojik Katman):** Neal Stephenson'ın *The Diamond Age* romanındaki *Illustrated Primer*'ı temsil eden Sokratik AI Tutor bileşeni; kriz renklerinden ayrışan sakinleştirici **İndigo / Siyan** tonlarıyla oyuncuyu paniğe kapılmadan analitik düşünmeye davet eder.

## 2. Renk Paleti ve Semantik Tokenlar (Color Palette & Semantic Roles)

Tüm metin ve arka plan eşleşmeleri WCAG 2.1 AA/AAA (`>= 4.5:1` gövde metni, `>= 7.0:1` kritik telemetri) kontrast standartlarını sağlar.

| Semantik Rol (Token Adı) | Hex Kodu | CSS Değişkeni | Kullanım Alanı ve Görsel Amacı |
| :--- | :--- | :--- | :--- |
| **Background Primary** | `#0B1120` | `--bg-primary` | Ana mobil uygulama arka planı (Gece nöbeti / Sistem terminali koyu laciverti) |
| **Surface Card** | `#111827` | `--surface-card` | Sahne anlatı kartları, giriş soru kutuları ve karar panelleri |
| **Surface Elevated / Drawer** | `#1E293B` | `--surface-elevated` | Seçim sonrası açılan **Ne Oldu / Neden Oldu** çekmecesi ve aktif seçim kartları |
| **Surface Telemetry (Code)** | `#090D16` | `--surface-telemetry` | Rol bazlı canlı log (`[REDIS-WARN]`, `[CI-PIPELINE]`, `[AUDIT-ALERT]`) kutusu arka planı |
| **Text Primary** | `#F8FAFC` | `--text-primary` | Ana başlıklar, kriz sahne metinleri ve karar buton yazıları |
| **Text Secondary / Muted** | `#94A3B8` | `--text-secondary` | Alt başlıklar, saat damgaları (`08:15`), soru açıklamaları |
| **Primary Interactive** | `#38BDF8` | `--accent-primary` | Seçili profil rozetleri, birincil ilerleme butonları (`Krize Müdahale Et`, `Sonraki Karara Geç`) |
| **Crisis Warning (Timer / Alert)** | `#F59E0B` | `--status-warning` | `Deneyimliyim` modundaki **60 sn geri sayım sayacı**, bekleyen 48 hasta uyarı rozeti |
| **Clinical Safe (Good Ending / A)** | `#10B981` | `--status-safe` | **SON A · İYİ** ekranı, başarılı mimari/test/KVKK doğrulama göstergeleri |
| **Critical Breach (Bad Ending / B)** | `#EF4444` | `--status-danger` | **SON B · KÖTÜ** ekranı, KVKK Madde 6/12 ihlali, Cache Stampede ve süre aşımı uyarıları |
| **Socratic Tutor Accent** | `#818CF8` | `--tutor-accent` | **Sokratik AI Tutor** kenarlığı, ikonları, soru balonu ve `"SAYAÇ DURAKLATILDI"` rozeti |
| **Border Subtle** | `#334155` | `--border-subtle` | Kart kenarlıkları (`1px solid`) ve bölüm ayırıcı çizgiler |

## 3. Tipografi Sistemi (Typography Scale & Font Families)

Okunabilirliği en üst düzeye çıkarmak için arayüz metinlerinde geometrik sans-serif, sistem logları ve geri sayım sayacında ise monospace yazı tipi kullanılır.

* **Birincil Arayüz ve Anlatı Fontu (`--font-sans`):** `'Inter'`, `'Plus Jakarta Sans'`, `-apple-system`, `sans-serif`
* **Telemetri, Log ve Sayaç Fontu (`--font-mono`):** `'JetBrains Mono'`, `'Fira Code'`, `monospace`

| Tipografik Eleman | Font Ailesi | Boyut (`px`/`rem`) | Ağırlık (`Weight`) | Satır Yüksekliği | Harf Aralığı |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Ekran Başlığı (Screen Title)** | `--font-sans` | `22px` (`1.375rem`) | `700 (Bold)` | `1.3` | `-0.02em` |
| **Sahne Kriz Başlığı (Stage Header)** | `--font-sans` | `18px` (`1.125rem`) | `600 (SemiBold)` | `1.35` | `-0.01em` |
| **Hikâye / Sahne Gövde Metni** | `--font-sans` | `15px` (`0.9375rem`) | `400 (Regular)` | `1.6` | `0em` |
| **Karar Butonu Metni (Seçenek A/B)** | `--font-sans` | `15px` (`0.9375rem`) | `600 (SemiBold)` | `1.4` | `0em` |
| **Ne Oldu / Neden Oldu Açıklaması** | `--font-sans` | `14px` (`0.875rem`) | `400 (Regular)` | `1.55` | `0em` |
| **Canlı Telemetri / Sistem Logu** | `--font-mono` | `12px` (`0.75rem`) | `500 (Medium)` | `1.5` | `0.01em` |
| **60 Sn Geri Sayım Sayacı** | `--font-mono` | `16px` (`1.0rem`) | `700 (Bold)` | `1.0` | `0.04em` |

## 4. Bileşen Spesifikasyonları (Component Specifications)

Google Stitch ve Google AI Studio tarafından üretilecek 3 temel ekran aşağıdaki bileşen kurallarına birebir uymalıdır.

### 4.1. Mobil Konteyner ve Üst Durum Çubuğu (Mobile Shell & Status Header)

* **Genişlik ve Hizalama:** Masaüstünde açıldığında ekranın ortasında yer alan `max-width: 440px`, `min-height: 100dvh` boyutlarında mobil çerçeve; telefonda açıldığında `100%` tam ekran.
* **Üst Durum Çubuğu (`Sticky Top Bar`):**
  * Sol: Kriz saati (`08:15` → `08:23` → `08:32`) ve aktif adım göstergesi (`Karar 1/3 · MİMARİ`).
  * Sağ: `Deneyimliyim` seçildiyse `data-cy="timer-display"` (`00:60` kehribar rozet); Tutor açıkken `data-cy="timer-paused-badge"` (`DURAKLATILDI` indigo rozet).

### 4.2. Giriş Profil Seçici Kartları (Ekran 1 — 3 Soru)

* **Seçim Butonları (Pill / Segmented Cards):** Her soru (`Seviye`, `Rol`, `Hedef`) için yatay veya 2'li ızgara düzeninde, minimum `48px` dokunma yüksekliğine sahip seçim kartları.
* **Aktif Durum:** Seçilen kartta `2px solid #38BDF8` kenarlık, `rgba(56, 189, 248, 0.12)` dolgusu ve sağ üst köşede onay ikonu.
* **Birincil CTA Butonu (`data-cy="start-game-btn"`):** 3 soru yanıtlanmadan `disabled` (`opacity: 0.45`); tamamlandığında `#38BDF8` arka plan ve `#0B1120` koyu metin ile tam genişlikte (`width: 100%`, `height: 52px`, `border-radius: 12px`).

### 4.3. Rol Bazlı Canlı Telemetri Kutusu (`data-cy="role-telemetry"`)

* **Görünüm:** `#090D16` zemin üzerinde sol kenarında `3px solid #F59E0B` şerit bulunan terminal kutusu (`padding: 12px`, `border-radius: 8px`, `--font-mono`).
* **Dinamik İçerik:** Oyuncunun girişte seçtiği role göre (`Backend`, `QA / Test`, `DevSecOps`) `spec.md` Bölüm 3.2'deki log satırını gösterir.

### 4.4. Karar Seçenek Kartları (`data-cy="option-a-btn"`, `data-cy="option-b-btn"`)

* **Yapı:** Alt alta dizilmiş iki büyük dokunmatik kart (`width: 100%`, `min-height: 64px`, `padding: 14px 16px`, `border-radius: 12px`, `background: #1E293B`, `border: 1px solid #334155`).
* **Sol Rozet:** Şık harfini gösteren `28x28px` yuvarlak rozet (`A` ve `B`). Seçim yapılmadan önce her iki şık da **aynı nötr renkte** olmalıdır (renk ipucuyla doğru cevabı belli etmek kesinlikle yasaktır).

### 4.5. Nedensel Geri Bildirim Kartı (`data-cy="feedback-what"`, `data-cy="feedback-why"`)

* **Tetiklenme:** Oyuncu `A` veya `B` şıkkına dokunduğunda karar butonlarının hemen altında yumuşak bir geçişle açılır.
* **İçerik Bölümleri:**
  1. **Ne Oldu? (`data-cy="feedback-what"`):** Operasyonel sonucu anlatan kalın başlıklı ilk blok.
  2. **Neden Oldu? (`data-cy="feedback-why"`):** Mühendislik prensibini (*Strong Consistency*, *Boundary Value Analysis*, *6698 Sayılı KVKK Madde 6/12*) açıklayan ikinci blok.
  3. **İlerleme Butonu (`data-cy="next-stage-btn"`):** `"Sonraki Karara Geç →"` (Karar 3 sonunda `"Kriz Raporunu Gör →"`).

### 4.6. Sokratik AI Tutor Çekmecesi (`data-cy="tutor-input"`, `data-cy="tutor-response"`)

* **Konum:** Ekranın altında sabit veya açılır-kapanır (`Collapsible Panel`) `#1E1B4B` / `#1E293B` indigo vurgulu panel (`border: 1px solid #818CF8`, `border-radius: 14px`).
* **Bileşenler:**
  * Başlık: `"Sokratik AI Tutor · Cevabı Söylemez, Düşündürür"`
  * Yanıt Balonu (`data-cy="tutor-response"`): Tutor'un Sokratik sorusunu gösteren metin alanı.
  * Hızlı Soru Çipleri + Metin Girişi (`data-cy="tutor-input"`) ve Gönder Butonu (`data-cy="tutor-send-btn"`).

## 5. Boşluk, Izgara ve Köşe Yuvarlatma Sistemi (Spacing, Grid & Radius)

* **Temel Izgara Birimi:** `8px` (`4px` mikro boşluk, `8px` iç eleman aralığı, `16px` kart içi dolgu, `20px` bölümler arası boşluk).
* **Köşe Yuvarlatma (`Border Radius`):**
  * Küçük rozetler ve telemetri kutusu: `8px`
  * Karar kartları ve butonlar: `12px`
  * Ana sahne kartları ve Tutor çekmecesi: `16px`
* **Mobil Dokunma Hedefi:** Tüm etkileşimli butonlar (`A`, `B`, `Gönder`, `İlerle`) en az `48px` yüksekliğinde olmalıdır.

## 6. Derinlik ve Gölge Kuralları (Elevation & Shadows)

* **Seviye 1 (Sahne Kartları):** `0 4px 12px rgba(0, 0, 0, 0.35)`
* **Seviye 2 (Ne Oldu / Neden Oldu Geri Bildirim Kartı):** `0 8px 24px rgba(0, 0, 0, 0.50)`
* **Seviye 3 (Sokratik AI Tutor Paneli):** `0 -4px 20px rgba(129, 140, 248, 0.18)` (hafif indigo parıltı)

## 7. Tasarım Kuralları: Yapılacaklar ve Yapılmayacaklar (Do's & Don'ts)

* **DO (Yap):** Seçim yapılmadan önce `Seçenek A` ve `Seçenek B` butonlarını birebir aynı görsel ağırlıkta ve nötr renkte (`#1E293B`) tut.
* **DON'T (Yapma):** Seçim öncesinde `A` butonunu yeşil, `B` butonunu kırmızı yaparak doğru cevabı görsel olarak ele verme.
* **DO (Yap):** Her sahnede tüm içeriğin (`Üst Bar + Kriz Anlatısı + Telemetri + A/B Butonları + AI Tutor Barı`) mobil ekranda rahatça okunmasını sağla.
* **DON'T (Yapma):** Giriş ekranına e-posta/şifre alanı, üye girişi veya ikinci bölüm menüsü ekleme (`spec.md` Kapsam Dışı kuralları).
* **DO (Yap):** Tüm etkileşimli elemanlara `spec.md` Bölüm 8'deki `data-cy` özniteliklerini eksiksiz yerleştir.

## 8. Google Stitch İçin Hazır Ekran Üretim Promptları (Agent Prompt Guide)

Google Stitch (`stitch.withgoogle.com`) üzerinde **3 mobil ekranı** üretmek için aşağıdaki 3 prompt'u sırasıyla kullanabilirsin.

### Prompt 1 — Ekran 1: Giriş ve 3 Soruluk Kişiselleştirme Ekranı (`S0_Giris_Profil`)

```text
Design a mobile-first dark-mode web app onboarding screen (375x812px) for "SE Primer: OnkoDoz-AI Kriz Simülasyonu" using a Clinical Command Center aesthetic (#0B1120 background, #111827 cards, #F8FAFC text, #38BDF8 primary accent, #F59E0B crisis warning badge, Inter and JetBrains Mono fonts).

Top Header:
- Badge: "YZM301 · SE PRIMER" and an amber live crisis alert pill: "08:15 · KUZEY YILDIZI ONKOLOJİ HASTANESİ".
- Title: "Kemoterapi Dozaj Servisi Çöktü. Nöbetçi Mühendis Sensin."
- Subtitle: "Kişiye uyum sağlayan mühendislik simülasyonu: Kararların sistemin ve 48 hastanın kaderini belirleyecek."

Main Content (3 Personalization Questions inside clean dark cards):
1. Question 1 ("1. Deneyim Seviyen"): Two selectable pill cards side-by-side:
   - "Yeni Başladım" (Subtext: "Her kararda kavram ipucu açık")
   - "Deneyimliyim" (Subtext: "İpucu gizli, 60 sn süre baskısı" - shown as selected with #38BDF8 border)
2. Question 2 ("2. Mühendislik Rolün"): Three selectable chips:
   - "Backend" (selected), "QA / Test", "DevSecOps"
3. Question 3 ("3. Öğrenme Hedefin"): Three selectable rows:
   - "Mimari Dayanıklılık", "Güvenli Sürüm (Test)", "KVKK ve Veri Gizliliği"

Bottom Sticky CTA:
- Full-width primary button (#38BDF8 fill, #0B1120 bold text, 52px height, 12px radius): "Krize Müdahale Et →"
- Footer note: "Sentetik eğitim verisi · Kullanıcı hesabı gerektirmez"
```

### Prompt 2 — Ekran 2: Kriz Sahnesi, Karar, Ne Oldu/Neden Oldu ve AI Tutor (`S1-S3 Sahne`)

```text
Design a mobile-first dark-mode crisis decision screen (375x812px) for "SE Primer: OnkoDoz-AI" (#0B1120 background, #111827 surface cards, Inter & JetBrains Mono fonts).

1. Sticky Status Top Bar:
   - Left: "KARAR 1/3 · MİMARİ" badge and clock "08:15".
   - Right: Amber countdown timer pill in JetBrains Mono: "⏱ 00:48" (with a subtle indicator for "DURAKLATILDI" state when Tutor is active).

2. Scenario & Role Telemetry Card:
   - Headline: "OnkoDoz-v2.4 Önbellek Senkronizasyon Krizi"
   - Narrative text: "Gece çıkan sürüm laboratuvar gecikmesinde Redis'teki 72 saatlik eski eGFR böbrek verisini kullanıyor. 48 kemoterapi hastası bekliyor."
   - Monospace Telemetry Box (#090D16 background, 3px amber left border): "[REDIS-WARN] key=egfr:pt_8821 ttl=-1 stale_read=true | db_pool=94/100"

3. Two Neutral Decision Buttons (stacked, #1E293B background, #334155 border, 12px radius):
   - Option A: "A) Eski kararlı sürüme (v2.3.9) geri dön ve Read-Replica doğrulamasına geç"
   - Option B: "B) Canlı ortamda (Production) Redis önbelleğini sıfırlayan (FLUSHALL) yama uygula"

4. Causal Feedback Card ("Ne Oldu & Neden Oldu" - expanded state preview):
   - Elevated card (#1E293B) with emerald left border (#10B981):
   - "NE OLDU?": "Sistem 90 saniyede v2.3.9 sürümüne döndü; 48 pompa güncel veriyle güvenli hesaplamaya geçti."
   - "NEDEN OLDU?": "Kritik tıbbi dozajda Eventual Consistency yerine Strong Consistency tercih edilmelidir."
   - Button: "Sonraki Karara Geç →"

5. Bottom Socratic AI Tutor Drawer (#1E1B4B indigo surface, #818CF8 border):
   - Header: "💬 Sokratik AI Tutor (Cevabı söylemez, sorar)"
   - Tutor message bubble: "Geri dönmeden önce veritabanı şemasının değişip değişmediğini ve önbelleği silersen veritabanına kaç isteğin çarpacağını nasıl anlarsın?"
   - Input row: text input "Tutor'a düşünceni yaz..." and send button.
```

### Prompt 3 — Ekran 3: Sonuç ve Mühendislik Karnesi Ekranı (`SON A · İYİ` & `SON B · KÖTÜ`)

```text
Design a mobile-first dark-mode outcome comparison / ending screen (375x812px) for "SE Primer: OnkoDoz-AI" showing the final engineering debrief (#0B1120 background, #111827 cards, Inter & JetBrains Mono fonts).

Top Outcome Banner (Split or toggleable preview of the 2 Endings):
- Primary Hero Card (SON A · İYİ - Emerald #10B981 accent):
  - Badge: "SON A · İYİ SONUÇ"
  - Title: "08:40 — Sistem Ayakta, 48 Hasta ve Veriler Güvende"
  - Summary: "Kararlı sürüme dönüldü, sınır değer duman testiyle yuvarlama hatası yakalandı ve loglar 6698 sayılı KVKK Madde 6/12'ye uygun maskelendi."
- Secondary Alert Preview Card (SON B · KÖTÜ - Crimson #EF4444 accent):
  - Badge: "SON B · KRİTİK İHLAL (Alternatif Son Durumu)"
  - Title: "Sistem Ayakta Ama 6698 Sayılı KVKK / Mimari İhlali Oluştu"

Decision Path Audit List (3 rows showing path A → A → A):
- Row 1: "Karar 1 · Mimari: Rollback + Strong Consistency (Doğrulandı)"
- Row 2: "Karar 2 · Test: eGFR Sınır Değer Smoke Test + Canary (Doğrulandı)"
- Row 3: "Karar 3 · KVKK: PII/PHI Maskeleme & trace_id Paylaşımı (Doğrulandı)"

Personalized Goal Feedback Box (#1E293B):
- Title: "Hedef Analizi: Mimari Dayanıklılık"
- Text: "Kriz anında Cache Stampede riskini öngörerek Read-Replica izolasyonunu doğru uyguladın."

Bottom CTA:
- Full-width button (#38BDF8): "Farklı Bir Karar Yoluyla Baştan Oyna ↻"
```
