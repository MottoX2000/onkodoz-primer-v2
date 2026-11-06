"""Python Test Kahini (Oracle): aynı model.onnx'i onnxruntime ile çalıştırır.

    python tests/parite.py            # tests/parite.json'u yeniden üretir
    python tests/parite.py --kontrol  # mevcut parite.json ile karşılaştırır (|fark| < 1e-4)
"""
import json
import sys
from pathlib import Path

import numpy as np
import onnxruntime as ort

sys.stdout.reconfigure(encoding="utf-8")
KOK = Path(__file__).resolve().parent.parent
CONFIG = json.loads((KOK / "model" / "config.json").read_text(encoding="utf-8"))
TOLERANS = CONFIG["kabul_esikleri"]["parite_toleransi"]

# 5 referans girdi — config.json'daki özellik sırasıyla:
# [seviye, sahne_no, onceki_riskli_sayisi, onceki_karar_suresi_sn, tutor_acma_sayisi]
GIRDILER = [
    {"ad": "aceleci_deneyimli_s2", "x": [1, 2, 1, 5.0, 0]},
    {"ad": "temkinli_yeni_s2", "x": [0, 2, 0, 40.0, 1]},
    {"ad": "iki_hata_s3", "x": [1, 3, 2, 8.5, 0]},
    {"ad": "tutor_kullanan_s3", "x": [0, 3, 0, 33.2, 3]},
    {"ad": "sinir_orta_s2", "x": [1, 2, 0, 22.0, 0]},
]


def olasiliklar(xs):
    sess = ort.InferenceSession(str(KOK / "model" / "model.onnx"), providers=["CPUExecutionProvider"])
    girdi = np.array(xs, dtype=np.float32)
    return sess.run(None, {CONFIG["girdi_adi"]: girdi})[1][:, 1].tolist()


def main():
    ps = olasiliklar([g["x"] for g in GIRDILER])
    yol = KOK / "tests" / "parite.json"
    if "--kontrol" in sys.argv:
        ref = json.loads(yol.read_text(encoding="utf-8"))
        farklar = [abs(r["p"] - p) for r, p in zip(ref["girdiler"], ps)]
        print("max |fark| =", max(farklar))
        sys.exit(0 if max(farklar) < TOLERANS else 1)
    cikti = {
        "aciklama": "Python Oracle (onnxruntime) olasılıkları; uygulama |fark| < tolerans olmalı",
        "model_surum": CONFIG["surum"],
        "ozellikler": CONFIG["ozellikler"],
        "tolerans": TOLERANS,
        "girdiler": [{**g, "p": round(p, 8)} for g, p in zip(GIRDILER, ps)],
    }
    yol.write_text(json.dumps(cikti, indent=2, ensure_ascii=False), encoding="utf-8")
    for g, p in zip(GIRDILER, ps):
        print(f"{g['ad']:24s} {g['x']} -> p={p:.6f}")


if __name__ == "__main__":
    main()
