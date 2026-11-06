// v2.0 — Riskli Karar Öngörücü: onnxruntime-web ile tarayıcıda çıkarım.
// Sözleşme: model/config.json (özellik adları + sırası + karar eşiği).
import * as ort from 'onnxruntime-web';

export const ORT_VERSION = '1.31.1';
ort.env.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;
ort.env.wasm.numThreads = 1;

// Commit'e sabitlenmiş Hugging Face URL'si (RELEASE.md). Boşsa yerel kopya kullanılır.
export const HF_MODEL_URL =
  'https://huggingface.co/MottoX2000/onkodoz-riskli-karar/resolve/d627efbd7242d3dfa9992aa567ed6d23a19eb0cf/model.onnx';
export const LOCAL_MODEL_URL = `${import.meta.env.BASE_URL}model/model.onnx`;

export const FEATURES = [
  'seviye',
  'sahne_no',
  'onceki_riskli_sayisi',
  'onceki_karar_suresi_sn',
  'tutor_acma_sayisi',
] as const;
export const DECISION_THRESHOLD = 0.5;

export type FeatureVector = [number, number, number, number, number];

let sessionPromise: Promise<{ session: ort.InferenceSession; source: string }> | null = null;

async function loadFrom(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  const session = await ort.InferenceSession.create(buf, { executionProviders: ['wasm'] });
  return { session, source: url };
}

export function loadModel() {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      if (HF_MODEL_URL) {
        try {
          return await loadFrom(HF_MODEL_URL);
        } catch (e) {
          console.warn('HF modeli indirilemedi, yerel kopyaya düşülüyor', e);
        }
      }
      return loadFrom(LOCAL_MODEL_URL);
    })();
  }
  return sessionPromise;
}

export async function predictRisk(x: FeatureVector): Promise<{ p: number; source: string }> {
  const { session, source } = await loadModel();
  const input = new ort.Tensor('float32', Float32Array.from(x), [1, x.length]);
  const out = await session.run({ input });
  const probs = out['probabilities'].data as Float32Array;
  return { p: probs[1], source };
}
