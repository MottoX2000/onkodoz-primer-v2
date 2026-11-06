"""Tek komutla tekrarlanabilir eğitim + eval kapısı + ONNX paketleme.

    python train.py

Kapılar (spec.md §9.2 — eğitimden önce yazıldı):
  * test ROC-AUC >= 0.70
  * test doğruluğu >= çoğunluk tabanı + 0.03
  * ONNX vs sklearn max |fark| < 1e-4
Herhangi biri geçilmezse betik exit(1) ile durur ve model/ klasörüne yazmaz.
"""
import json
import sys
from pathlib import Path

import numpy as np
import sys
sys.stdout.reconfigure(encoding="utf-8"); sys.stderr.reconfigure(encoding="utf-8")
import pandas as pd
import onnxruntime as ort
import sklearn
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, roc_auc_score
from sklearn.model_selection import train_test_split

TOHUM = 42
OZELLIKLER = ["seviye", "sahne_no", "onceki_riskli_sayisi", "onceki_karar_suresi_sn", "tutor_acma_sayisi"]
ETIKET = "riskli_karar"
ESIK_AUC = 0.70
ESIK_TABAN_FARKI = 0.03
TOLERANS = 1e-4
KARAR_ESIGI = 0.50
SURUM = "2.0.0"


def onnx_aktar(model, X_ornek):
    """sklearn → ONNX, ardından olasılık farkını kontrol eder (başlangıç reposundaki fikir)."""
    onx = convert_sklearn(
        model,
        initial_types=[("input", FloatTensorType([None, X_ornek.shape[1]]))],
        options={id(model): {"zipmap": False}},
        target_opset=15,
    )
    bayt = onx.SerializeToString()
    sess = ort.InferenceSession(bayt, providers=["CPUExecutionProvider"])
    p_onnx = sess.run(None, {"input": X_ornek.astype(np.float32)})[1][:, 1]
    p_skl = model.predict_proba(X_ornek)[:, 1]
    fark = float(np.max(np.abs(p_onnx - p_skl)))
    return bayt, fark


def main():
    df = pd.read_csv("data/oturumlar.csv")
    # Karar (spec §9.1): 1. sahnede geçmiş yok → model yalnızca sahne 2–3 için eğitilir ve çalışır.
    df = df[df["sahne_no"] >= 2].reset_index(drop=True)
    X = df[OZELLIKLER].to_numpy(dtype=np.float32)
    y = df[ETIKET].to_numpy()
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, stratify=y, random_state=TOHUM)

    model = LogisticRegression(max_iter=1000, random_state=TOHUM)
    model.fit(X_tr, y_tr)

    p_te = model.predict_proba(X_te)[:, 1]
    auc = float(roc_auc_score(y_te, p_te))
    acc = float(accuracy_score(y_te, (p_te >= KARAR_ESIGI).astype(int)))
    taban = float(max(y_te.mean(), 1 - y_te.mean()))
    bayt, onnx_fark = onnx_aktar(model, X_te)

    metrikler = {
        "test_roc_auc": round(auc, 4),
        "test_dogruluk": round(acc, 4),
        "cogunluk_tabani": round(taban, 4),
        "onnx_sklearn_max_fark": onnx_fark,
        "n_egitim": int(len(y_tr)),
        "n_test": int(len(y_te)),
        "n_gercek": int((df["kaynak"] == "gercek").sum()),
        "n_sentetik": int((df["kaynak"] == "sentetik").sum()),
    }
    print(json.dumps(metrikler, indent=2, ensure_ascii=False))

    hatalar = []
    if auc < ESIK_AUC:
        hatalar.append(f"ROC-AUC {auc:.4f} < {ESIK_AUC}")
    if acc < taban + ESIK_TABAN_FARKI:
        hatalar.append(f"doğruluk {acc:.4f} < taban {taban:.4f} + {ESIK_TABAN_FARKI}")
    if onnx_fark >= TOLERANS:
        hatalar.append(f"ONNX farkı {onnx_fark:.2e} >= {TOLERANS}")
    if hatalar:
        print("EVAL KAPISI KAPALI — model yayınlanmaz:\n  - " + "\n  - ".join(hatalar), file=sys.stderr)
        sys.exit(1)

    out = Path("model")
    out.mkdir(exist_ok=True)
    (out / "model.onnx").write_bytes(bayt)
    config = {
        "model_adi": "onkodoz-riskli-karar",
        "surum": SURUM,
        "gorev": "ikili sınıflandırma: bu sahnede riskli karar (B/süre aşımı) olasılığı",
        "girdi_adi": "input",
        "girdi_tipi": "float32[N,5]",
        "ozellikler": OZELLIKLER,
        "ozellik_semasi": {
            "seviye": {"tip": "int", "aralik": [0, 1], "aciklama": "0=Yeni Başladım, 1=Deneyimliyim"},
            "sahne_no": {"tip": "int", "aralik": [1, 3]},
            "onceki_riskli_sayisi": {"tip": "int", "aralik": [0, 2]},
            "onceki_karar_suresi_sn": {"tip": "float", "aralik": [0, 60], "birim": "saniye"},
            "tutor_acma_sayisi": {"tip": "int", "aralik": [0, 10]},
        },
        "cikti": {"isim": "probabilities", "indeks": 1, "aciklama": "P(riskli_karar=1)"},
        "siniflar": {"0": "guvenli_karar_A", "1": "riskli_karar_B_veya_sure_asimi"},
        "karar_esigi": KARAR_ESIGI,
        "kabul_esikleri": {"test_roc_auc_min": ESIK_AUC, "taban_ustu_dogruluk_min": ESIK_TABAN_FARKI, "parite_toleransi": TOLERANS},
        "metrikler": metrikler,
        "egitim": {"tohum": TOHUM, "algoritma": "LogisticRegression", "sklearn": sklearn.__version__, "test_orani": 0.25},
        "katsayilar": dict(zip(OZELLIKLER, [round(float(c), 4) for c in model.coef_[0]])),
        "kesisim": round(float(model.intercept_[0]), 4),
    }
    (out / "config.json").write_text(json.dumps(config, indent=2, ensure_ascii=False), encoding="utf-8")
    print("EVAL KAPISI AÇIK — model/model.onnx ve model/config.json yazıldı.")


if __name__ == "__main__":
    main()
