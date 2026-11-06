"""Bonus: kendi sunucumuzda çalışan üçüncü tüketici (FastAPI + onnxruntime).

Aynı model.onnx'i commit'e sabit Hugging Face URL'sinden indirir (yoksa repodaki
kopyaya düşer). Render.com ücretsiz katmanında çalışır.

    uvicorn server.app:app --port 8000
    POST /predict  {"x": [seviye, sahne_no, onceki_riskli_sayisi, onceki_karar_suresi_sn, tutor_acma_sayisi]}
"""
import json
import urllib.request
from pathlib import Path

import numpy as np
import onnxruntime as ort
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

KOK = Path(__file__).resolve().parent.parent
CONFIG = json.loads((KOK / "model" / "config.json").read_text(encoding="utf-8"))
HF_MODEL_URL = (
    "https://huggingface.co/MottoX2000/onkodoz-riskli-karar/resolve/"
    "d627efbd7242d3dfa9992aa567ed6d23a19eb0cf/model.onnx"
)


def yukle():
    try:
        with urllib.request.urlopen(HF_MODEL_URL, timeout=20) as r:
            return r.read(), HF_MODEL_URL
    except Exception:  # ağ yoksa repodaki aynı bayt dizisi
        return (KOK / "model" / "model.onnx").read_bytes(), "local:model/model.onnx"


MODEL_BAYT, KAYNAK = yukle()
SESS = ort.InferenceSession(MODEL_BAYT, providers=["CPUExecutionProvider"])

app = FastAPI(title="OnkoDoz Riskli Karar API", version=CONFIG["surum"])
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


class Girdi(BaseModel):
    x: list[float]


@app.get("/")
def saglik():
    return {"durum": "ok", "model_surum": CONFIG["surum"], "kaynak": KAYNAK, "ozellikler": CONFIG["ozellikler"]}


@app.post("/predict")
def tahmin(g: Girdi):
    if len(g.x) != len(CONFIG["ozellikler"]):
        raise HTTPException(422, f"{len(CONFIG['ozellikler'])} özellik bekleniyor: {CONFIG['ozellikler']}")
    p = float(SESS.run(None, {CONFIG["girdi_adi"]: np.array([g.x], dtype=np.float32)})[1][0, 1])
    return {"p": p, "karar": int(p >= CONFIG["karar_esigi"]), "model_surum": CONFIG["surum"], "kaynak": KAYNAK}
