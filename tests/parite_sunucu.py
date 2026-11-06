"""Diferansiyel test: Python Oracle (tests/parite.json) ile sunucu (/predict) karşılaştırması.

    python tests/parite_sunucu.py https://<servis>.onrender.com
"""
import json
import sys
import urllib.request
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
url = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000").rstrip("/")
ref = json.loads((Path(__file__).parent / "parite.json").read_text(encoding="utf-8"))
en_kotu = 0.0
for g in ref["girdiler"]:
    istek = urllib.request.Request(url + "/predict", data=json.dumps({"x": g["x"]}).encode(),
                                   headers={"Content-Type": "application/json"})
    p = json.loads(urllib.request.urlopen(istek, timeout=90).read())["p"]
    fark = abs(p - g["p"])
    en_kotu = max(en_kotu, fark)
    print(f"{g['ad']:24s} sunucu={p:.8f} oracle={g['p']:.8f} |fark|={fark:.2e}")
print("max |fark| =", en_kotu, "→", "GEÇTİ" if en_kotu < ref["tolerans"] else "KALDI")
sys.exit(0 if en_kotu < ref["tolerans"] else 1)
