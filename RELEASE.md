# RELEASE — The Primer v2.0 (OnkoDoz-AI + Riskli Karar Öngörücü)

## v2.0'da ne değişti?
| Alan | v1.0 (Ödev 6) | v2.0 (Ödev 7) |
|---|---|---|
| Uyum | Sabit kurallar (seviye → ipucu kartı / 60 sn sayaç) | Kurallar **+** öğrenen model: sahne 2–3'te `p(riskli) ≥ 0.50` ise Primer Uyarısı ve `Deneyimliyim` modunda +30 sn |
| Model | Yok | `LogisticRegression` → `model.onnx` (5 özellik, `config.json` sözleşmesi) |
| Çıkarım | — | Tarayıcıda `onnxruntime-web` 1.31.1 (WASM) |
| Veri | — | Veri Toplama Modu (anonim, `localStorage`, CSV indirme) |
| Test | 6 E2E | 6 E2E (regresyon, değişmedi) + parite (diferansiyel) testi + Kabul Örneği 6 & 7 |

## Sabitlenmiş sürüm (pinning)
* Hugging Face model reposu: `https://huggingface.co/MottoX2000/onkodoz-riskli-karar`
* **v2.0 commit:** `d627efbd7242d3dfa9992aa567ed6d23a19eb0cf`
* Tüketicinin indirdiği URL (asla `main` değil):
  `https://huggingface.co/MottoX2000/onkodoz-riskli-karar/resolve/d627efbd7242d3dfa9992aa567ed6d23a19eb0cf/model.onnx`
* Uygulamada tek bir sabit: `src/model/primerModel.ts → HF_MODEL_URL`. HF erişilemezse uygulama paketle gelen yerel kopyaya (`public/model/model.onnx`, aynı bayt dizisi) düşer. Model hiç yüklenemezse oyun v1 davranışıyla devam eder (**fail-safe**).

## Rollback (geri alma)
1. **Uygulama tarafı (saniyeler):** `HF_MODEL_URL` değerini bir önceki commit hash'ine çevir → `npm run build` → GitHub Pages'e yeniden yayınla. HF'deki dosyalar silinmediği için eski commit URL'si sonsuza kadar aynı baytı döndürür (Sommerville Bl. 25, *Konfigürasyon Yönetimi*: sürüm = değişmez temel çizgi).
2. **Modeli tamamen kapatma (kill switch):** `HF_MODEL_URL = ''` yapıp yerel kopyayı da kaldırmak, `predictRisk` hatasını tetikler ve oyun v1 kurallarına döner. v1'in 6 E2E testi bu durumu zaten kapsar.
3. v1.0'da model yoktu. Bu yüzden "v1'e dönüş" = model yüklemeyen derleme (git tag `v1.0`).

## Yeni sürümü güvenle devreye alma
1. **Shadow (gölge) — 1 hafta:** v2.1 adayı, v2.0 ile **aynı sahne açılışında sessizce** çalışır. Tahmini ekrana yansımaz; yalnızca Veri Toplama Modu CSV'sine `p_shadow` sütunu olarak yazılır. Ölçülen: iki modelin uyuşma oranı ve gerçekleşen `riskli_karar`'a göre AUC. Gerçek veriyle AUC ≥ 0.70 değilse aday reddedilir.
2. **Canary (%5):** `hash(oturum_id) % 100 < 5` olan oturumlarda v2.1 gerçekten karar verir. İzlenen: uyarı gösterilme oranı (v2.0'a göre ±10 puan dışına çıkmamalı), oturumu yarıda bırakma oranı, süre aşımı oranı.
3. **Progressive rollout:** %25 → %50 → %100. Her adım en az 30 oturum. Herhangi bir adımda metrik bozulursa yukarıdaki rollback uygulanır. Oturum kimliği rastgele olduğundan bölme kullanıcıyı tanımadan yapılır (KVKK).

## Mimari dağıtım kararı: **Tarayıcı (`onnxruntime-web`)**
| Soru | Tarayıcı (seçilen) | Cihaz içi mobil (Expo + `onnxruntime-react-native`) | Kendi sunucum (Render / FastAPI) |
|---|---|---|---|
| **1. İnternet zorunlu mu, gecikme?** | İlk açılışta model (≈1 KB) + WASM çalışma zamanı (≈10 MB, CDN önbellekli) indirilir. Sonraki her tahmin < 1 ms ve ağsız | Uygulama kurulduktan sonra tamamen internetsiz, tahmin < 1 ms. Kurulum sürtünmesi (APK / Expo Go) var | Her tahminde ağ turu (50–300 ms). Ücretsiz katmanda uyku sonrası soğuk başlangıç 30 sn+ sürebilir: zamana karşı oynanan bir oyunda kabul edilemez |
| **2. Veri cihazdan çıkar mı?** | **Hayır.** Özellikler tarayıcıda hesaplanır ve tarayıcıda kalır | Hayır | **Evet**, her istek davranış verisini sunucuya taşır. KVKK açısından aydınlatma, saklama ve log politikası gerekir |
| **3. Model gizli kalır mı?** | **Hayır.** `model.onnx` herkese açık, katsayılar okunabilir. Bu projede kabul edilebilir, çünkü model bir sır değil ve kart zaten katsayıları yayınlıyor | Hayır, APK açılıp çıkarılabilir | Evet, dosya inmez. Ancak istek-yanıt üzerinden çok sayıda sorgu ile model taklit edilebilir (model extraction / tersine mühendislik riski). Rate-limit gerekir |
| Maliyet / işletim | 0 TL, statik GitHub Pages | 0 TL, ama mağaza / derleme hattı | 0 TL ücretsiz katman, ama izleme ve uyku sorunu |

**Gerekçe:** Oyun 60 sn baskı altında oynanıyor (gecikme kritik), davranış verisi kişisel sayılabilir (cihazdan çıkmamalı) ve modelin gizliliği önemsiz. Üç sorunun ikisinde tarayıcı kazanıyor, üçüncüsünde bedeli sıfıra yakın. Ödev 6 spec'i native mobili zaten kapsam dışı bırakmıştı. Sunucu tüketicisi (bonus) bu teslimde **yapılmadı**.

## Kaynaklar
* Amershi vd. (2019), *Software Engineering for Machine Learning: A Case Study*, ICSE-SEIP. ML yaşam döngüsünün gözlemden veri toplamaya geri döndüğü döngü; bizde Veri Toplama Modu → yeniden eğitim.
* Shankar vd. (2022), *Operationalizing Machine Learning: An Interview Study*. 3V: **Velocity** (tek komut `train.py`), **Validation** (eval kapısı + parite), **Versioning** (commit'e sabit URL).
* Breck vd. (2017), *The ML Test Score*. "Model spec'i kod olarak test edilir", "eğitim ve sunum (serving) arasında çarpıklık yok". Bizdeki karşılığı parite testi.
* Mitchell vd. (2019), *Model Cards for Model Reporting*. `model/README.md`.
* Sommerville, *Software Engineering* 10. baskı: Bl. 8 (V&V), Bl. 17–18 (dağıtık ve servis mimarisi, istemci/sunucu ödünleşimi), Bl. 25 (konfigürasyon yönetimi).
* Hugging Face Hub belgeleri: `resolve/<revision>` URL'leri. ONNX Runtime Web belgeleri.
