# Veri Sözlüğü — `data/oturumlar.csv`

Her satır **bir karar** (bir oturumda 3 satır: sahne 1, 2, 3).

| Sütun | Tip | Birim / Değerler | Açıklama | Model özelliği mi? |
|---|---|---|---|---|
| `oturum_id` | string | 12 hex karakter | Rastgele üretilmiş oturum kimliği (`crypto.getRandomValues`). Kişiyle ilişkilendirilemez. | Hayır |
| `kaynak` | enum | `gercek` \| `sentetik` | Satır gerçek bir oyuncudan mı, `scripts/sentetik_uret.py`'den mi geldi | Hayır |
| `seviye` | int | 0 = Yeni Başladım, 1 = Deneyimliyim | Girişte seçilen seviye | **Evet (1)** |
| `sahne_no` | int | 1, 2, 3 | Karar sahnesi (Mimari, Test, KVKK) | **Evet (2)** |
| `onceki_riskli_sayisi` | int | 0–2 | Bu oturumda bu sahneden önce verilen riskli karar (B / süre aşımı) sayısı | **Evet (3)** |
| `onceki_karar_suresi_sn` | float | saniye, 0–60 (1. sahnede 0) | Bir önceki sahnede, sahne açılışından seçime kadar geçen süre | **Evet (4)** |
| `tutor_acma_sayisi` | int | adet | Bu sahne açılana kadar Tutor panelinin kaç kez açıldığı (kümülatif) | **Evet (5)** |
| `karar` | enum | `A` \| `B` \| `SURE_ASIMI` | Bu sahnede verilen karar | Hayır (etiketin kaynağı) |
| `karar_suresi_sn` | float | saniye | Bu sahnedeki karar süresi. **Sızıntı riski:** tahmin anında bilinmez, bu yüzden özellik değildir; yalnızca bir sonraki satırın `onceki_karar_suresi_sn` değerini üretir | Hayır |
| `riskli_karar` | int | 0 / 1 | **Etiket.** 1 = `B` veya süre aşımı | Etiket |

## KVKK / Gizlilik
* Ad, e-posta, cihaz kimliği, IP, konum, tarayıcı parmak izi **toplanmaz**.
* Uygulamadaki "Veri Toplama Modu" verileri yalnızca oyuncunun tarayıcısında (`localStorage`) tutar. Oyuncu oyun sonunda `oturumlar_gercek.csv` dosyasını kendi isteğiyle indirip paylaşır; sunucuya hiçbir şey gönderilmez.

## Mevcut durum (dürüst beyan)
* **Gerçek satır: 0. Sentetik satır: 900** (300 oturum × 3 sahne). Teslim süresi içinde gerçek oturum toplanamadı. Bu nedenle Veri kaleminin yarısı alınabilir.
* Gerçek veri eklemek için arkadaşların indirdiği CSV'ler bu dosyanın sonuna eklenir (başlık satırı aynıdır) ve `python train.py` yeniden çalıştırılır.
* Üretici kuralı ve tohum: `README.md` → "Sentetik veri".
