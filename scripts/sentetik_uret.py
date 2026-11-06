"""Sentetik oturum üretici (tohum = 42).

Kural (README'de de yazılı):
  a ~ N(0.6*seviye - 0.3, 1): deneyimlilerde ortalama +0.6 kayar (aşırı güven).
  Her sahnede:
    karar_suresi_sn = clip(28 - 9*a + N(0, 4), 3, 60)
    logit(riskli)   = -0.9 + 1.8*a + 0.25*(sahne_no-1) - 0.45*tutor_bu_sahnede
    tutor_bu_sahnede ~ Bernoulli(sigmoid(-0.6 - 0.8*a))   # aceleciler Tutor'u daha az açar
  Model gizli a'yı görmez; yalnızca sahne başında bilinen özellikleri görür
  (önceki riskli karar sayısı, önceki karar süresi, Tutor açma sayısı). Bu yüzden
  1. sahnede model zayıftır — model kartında "sınırlar" altında yazılıdır.
"""
import csv
import uuid
import numpy as np
import sys
sys.stdout.reconfigure(encoding="utf-8"); sys.stderr.reconfigure(encoding="utf-8")

TOHUM = 42
N_OTURUM = 300
rng = np.random.default_rng(TOHUM)


def sig(z):
    return 1 / (1 + np.exp(-z))


def main(yol="data/oturumlar.csv"):
    satirlar = []
    for _ in range(N_OTURUM):
        oturum_id = uuid.UUID(int=int(rng.integers(0, 2**63)) << 64 | int(rng.integers(0, 2**63))).hex[:12]
        seviye = int(rng.integers(0, 2))
        a = rng.normal(0.6 * seviye - 0.3, 1.0)
        onceki_riskli, onceki_sure, tutor_sayisi = 0, 0.0, 0
        for sahne in (1, 2, 3):
            tutor_bu = int(rng.random() < sig(-0.6 - 0.8 * a))
            sure = float(np.clip(28 - 9 * a + rng.normal(0, 4), 3, 60))
            p = sig(-0.9 + 1.8 * a + 0.25 * (sahne - 1) - 0.45 * tutor_bu)
            riskli = int(rng.random() < p)
            satirlar.append({
                "oturum_id": oturum_id,
                "kaynak": "sentetik",
                "seviye": seviye,
                "sahne_no": sahne,
                "onceki_riskli_sayisi": onceki_riskli,
                "onceki_karar_suresi_sn": round(onceki_sure, 1),
                "tutor_acma_sayisi": tutor_sayisi,
                "karar": "B" if riskli else "A",
                "karar_suresi_sn": round(sure, 1),
                "riskli_karar": riskli,
            })
            onceki_riskli += riskli
            onceki_sure = sure
            tutor_sayisi += tutor_bu
    with open(yol, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(satirlar[0].keys()))
        w.writeheader()
        w.writerows(satirlar)
    print(f"{len(satirlar)} satır yazıldı → {yol}")


if __name__ == "__main__":
    main()
