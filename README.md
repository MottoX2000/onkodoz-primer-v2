# The Primer v2 — OnkoDoz-AI + Riskli Karar Öngörücü (Ödev 7)

Ödev 6'daki OnkoDoz kemoterapi dozaj krizi simülasyonunun yeni sürümü. v1'de uyum sabit kurallara dayanıyordu. v2'de **küçük, göreve özel bir model** (lojistik regresyon → ONNX) oyuncunun önceki davranışından (karar hızı, riskli karar geçmişi, Tutor kullanımı) **bu sahnede riskli karar verme olasılığını** tahmin eder. `p ≥ 0.50` olduğunda oyun bir "Primer Uyarısı" gösterir ve `Deneyimliyim` modunda süre baskısını 60 sn'den 90 sn'ye çıkarır.

| Teslim | Bağlantı / dosya |
|---|---|
| Canlı uygulama (GitHub Pages) | `CANLI_LINK` |
| Hugging Face modeli (commit'e sabit) | `HF_LINK` |
| Demo videosu | `VIDEO_LINK` (`cypress/videos/v2_model.cy.js.mp4`) |
| Spec (model gereksinimi, eşik, Kabul Örneği 6–8, karar kaydı) | [`spec.md`](spec.md) §9 |
| Veri + sözlük | [`data/oturumlar.csv`](data/oturumlar.csv), [`data/SOZLUK.md`](data/SOZLUK.md) |
| Eğitim + eval kapısı | [`train.py`](train.py) |
| Artefakt + model kartı | [`model/`](model/) (`model.onnx`, `config.json`, `README.md`) |
| Yayın, rollback, shadow/canary, ödünleşim matrisi | [`RELEASE.md`](RELEASE.md) |
| Python Oracle + referanslar | [`tests/parite.py`](tests/parite.py), [`tests/parite.json`](tests/parite.json) |
| Cypress (parite + regresyon) | [`cypress/e2e/v2_model.cy.js`](cypress/e2e/v2_model.cy.js), [`cypress/e2e/onkodoz.cy.js`](cypress/e2e/onkodoz.cy.js) |
| Vize sınav tasarımı | [`SINAV_TASARIMI.md`](SINAV_TASARIMI.md) |

## Kurulum (3 komut)
```bash
pip install scikit-learn skl2onnx onnxruntime pandas numpy && npm install
python scripts/sentetik_uret.py && python train.py && python tests/parite.py
npm run dev   # http://localhost:3000  (ikinci terminalde: npx cypress run)
```
`train.py` eşiğin altında kalırsa `exit(1)` ile durur ve `model/` klasörüne yazmaz. Kapının iki kez kapandığı gerçek çıktılar: `docs/eval_kapisi_*_KAPALI.txt`.

## Nasıl çalışıyor?
```
data/oturumlar.csv → train.py ──(AUC ≥ 0.70 ve doğruluk ≥ taban+0.03 ve ONNX farkı < 1e-4?)──► model/model.onnx + config.json
                                                                                         │
                                         Hugging Face (resolve/<commit>/model.onnx) ◄────┘
                                              │                               │
                    Tarayıcı: onnxruntime-web (src/model/primerModel.ts)   tests/parite.py (Python Oracle)
                                              └── Cypress: |p_web − p_py| < 1e-4 ──┘
```
* **Özellikler (sıra = sözleşme):** `seviye, sahne_no, onceki_riskli_sayisi, onceki_karar_suresi_sn, tutor_acma_sayisi`. Hepsi sahne **açıldığı an** bilinir. O sahnedeki karar süresi bilerek özellik yapılmadı (veri sızıntısı).
* **Model yalnızca sahne 2–3'te çalışır.** 1. sahnede geçmiş olmadığından model rastgeleye yakındı. Eşiği düşürmek yerine kullanım alanını daralttık (`spec.md` §9.4).
* **Fail-safe:** Model yüklenemezse oyun v1 kurallarıyla devam eder.
* **Veri Toplama Modu:** Oyun sonunda "oturum CSV'sini indir" düğmesi (`data-cy="download-csv"`). Rastgele oturum kimliği kullanılır; ad, e-posta, cihaz ve konum toplanmaz. Veri sunucuya gitmez.
* **Parite modu:** `/?parite=1&x=1,2,1,5,0` adresi aynı modeli çalıştırıp `[data-cy="p"]` gösterir.

## Sentetik veri (kural + tohum)
`scripts/sentetik_uret.py`, **tohum = 42**, 300 oturum × 3 sahne = 900 satır, hepsi `kaynak=sentetik`.
* Her sanal oyuncunun gizli bir acelecilik eğilimi vardır: `a ~ N(0.6·seviye − 0.3, 1)`.
* `karar_suresi_sn = clip(28 − 9a + N(0,4), 3, 60)`
* `tutor_bu_sahnede ~ Bernoulli(σ(−0.6 − 0.8a))`
* `P(riskli) = σ(−0.9 + 1.8a + 0.25(sahne_no−1) − 0.45·tutor_bu_sahnede)`

Model `a`'yı görmez; yalnızca `a`'nın geçmişteki izlerini (hız, riskli karar, Tutor kullanımı) görür.

**Dürüst beyan:** Teslim süresi içinde **gerçek oturum toplanamadı (0 / 15)**. Veri kaleminin yarısının alınacağını biliyoruz. Veri Toplama Modu hazırdır: indirilen CSV'ler `data/oturumlar.csv`'ye eklenip `python train.py` yeniden çalıştırılabilir.

## Sonuçlar
| | Değer |
|---|---|
| Test ROC-AUC (eşik ≥ 0.70) | **0.854** |
| Test doğruluğu / çoğunluk tabanı | 0.740 / 0.627 |
| ONNX ile sklearn max \|fark\| | 8.2e-08 |
| Python Oracle ile tarayıcı (5 girdi) | < 1e-8, Cypress'te geçti |
| v1 regresyon E2E (6 test) | **6 / 6 geçti**. İlk koşuda 1 test kırıldı: Vite onnxruntime-web paketini ilk ziyarette yeniden paketleyip sayfayı yeniledi ve oyun durumu sıfırlandı. Düzeltme vite.config.ts içinde optimizeDeps.include. Testlere dokunulmadı |
| v2 testleri (parite + Kabul 6 + Kabul 7) | 3 / 3 geçti |

Sınırlar ve kullanılmaması gereken durumlar: [`model/README.md`](model/README.md).

## Kaynaklar
Amershi vd. (2019); Shankar vd. (2022); Breck vd. (2017); Mitchell vd. (2019); Sommerville, *Software Engineering* 10. baskı (Bl. 8, 17, 18, 25); Hugging Face Hub `resolve/<revision>` belgeleri; ONNX Runtime Web; skl2onnx. Mimari tartışma ve atıflar `RELEASE.md` içinde.

## Yapay Zekâ Beyanı (dürüst)
* **Claude Code (Claude Opus 5.5)** bu ödevin neredeyse tamamını yaptı: spec §9, sentetik üretici, `train.py`, ONNX paketleme, `parite.py`, uygulamaya `onnxruntime-web` entegrasyonu, Cypress testleri, `RELEASE.md`, model kartı ve `SINAV_TASARIMI.md` taslağı.
* Öğrencinin rolü: ödev metnini verip önce ajandan ödevin ne istediğini kavramsal olarak açıklamasını istemek. Teslim gecesi yoğunluk ve iki gün sonraki sınavlar nedeniyle uygulamayı ajana bıraktı. Elle kod düzeltmesi **yapılmadı**.
* Ajanın kendi düzelttiği hatalar: Windows konsolunda UTF-8 çıktı hatası; eval kapısının iki kez kapanması üzerine kök neden analizi ve modelin kullanım alanının 2–3. sahnelere daraltılması (eşik değiştirilmedi).
* v1 (Ödev 6) de Claude Code + Google AI Studio + Stitch ile yapılmıştı (bkz. `docs/README_v1.md`).

---

*v1.0 (Ödev 6) README'si: [`docs/README_v1.md`](docs/README_v1.md)*
