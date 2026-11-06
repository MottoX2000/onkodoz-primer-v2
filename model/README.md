---
license: mit
library_name: onnx
tags:
  - tabular-classification
  - sklearn
  - onnx
  - education
---

# Model Kartı — `onkodoz-riskli-karar` v2.0.0

*(Mitchell vd., 2019, "Model Cards for Model Reporting" şablonuna göre)*

## Amaç
The Primer v2 / OnkoDoz-AI kriz simülasyonunda, oyuncunun **şu an açılan karar sahnesinde riskli kararı (B veya süre aşımı) verme olasılığını** tahmin eder. `p ≥ 0.50` olduğunda oyun bir "Primer Uyarısı" gösterir ve `Deneyimliyim` modunda sayaca +30 sn ekler. Amaç cezalandırmak değil, oyuncuyu yavaşlatıp düşündürmektir.

## Girdi / Çıktı (sözleşme: `config.json`)
* Girdi `input`: `float32[N, 5]`. Sıra: `seviye, sahne_no, onceki_riskli_sayisi, onceki_karar_suresi_sn, tutor_acma_sayisi`
* Çıktı `probabilities[:, 1]` = P(riskli). (`label` çıktısı da var, uygulama kullanmaz.)
* Model: `sklearn.linear_model.LogisticRegression` (random_state=42) → `skl2onnx` (opset 15, zipmap kapalı).

## Veri
* `data/oturumlar.csv`: **900 satır, tamamı sentetik** (300 oturum × 3 sahne, tohum 42). Üretici: `scripts/sentetik_uret.py`.
* Eğitimde yalnızca sahne 2–3 kullanılır: 600 satır (%75 eğitim, %25 test, tabakalı).
* Gerçek oyuncu verisi: **0 satır**.

## Metrikler (test kümesi, n = 150)
| Metrik | Değer | Kabul eşiği (spec §9.2) |
|---|---|---|
| ROC-AUC | **0.8545** | ≥ 0.70 ✅ |
| Doğruluk (eşik 0.5) | **0.7400** | ≥ taban + 0.03 = 0.6567 ✅ |
| Çoğunluk tabanı | 0.6267 | — |
| ONNX ile sklearn max \|fark\| | 8.2e-08 | < 1e-4 ✅ |
| Tarayıcı ile Python Oracle max \|fark\| | < 1e-8 (Cypress) | < 1e-4 ✅ |

Önceki iki eğitim denemesi eval kapısında **durduruldu** (AUC 0.580 ve 0.668). Ayrıntılar: `spec.md` §9.4, `docs/`.

## Sınırlar
* **Sentetik veri:** Metrikler, `sentetik_uret.py` içindeki varsayımın (gizli "acelecilik" eğilimi) öğrenilebilirliğini ölçer. Gerçek oyuncular üzerinde performans **bilinmiyor**.
* **1. sahnede çalışmaz:** O anda geçmiş davranış yoktur ve model rastgeleye yakın kalır, bu yüzden bilerek devre dışı bırakıldı.
* Katsayılar (`config.json`): en güçlü sinyaller önceki karar süresi (−0.132 / sn) ve Tutor kullanımı (−0.297). Model, "hızlı karar = riskli" korelasyonunu öğrenir. Hızlı ama bilgili bir oyuncuyu yanlış işaretleyebilir (yanlış pozitif).
* Özellik aralıkları `config.json → ozellik_semasi` ile sınırlıdır. Aralık dışı girdilerde davranış tanımsızdır.

## Kullanılmaması gereken durumlar
* Gerçek bir öğrencinin notlandırılması, sınıflandırılması ya da etiketlenmesi.
* Gerçek klinik veya üretim ortamında mühendis performansının değerlendirilmesi.
* Bu simülasyon dışındaki herhangi bir oyun veya eğitim akışı (özellik anlamları bu senaryoya özgüdür).

## Etik / KVKK
Kişisel veri yoktur. Oturum kimlikleri rastgeledir, çıkarım tamamen tarayıcıda yapılır ve oyuncu verisi cihazdan çıkmaz.
