import React, { useEffect, useState } from 'react';
import { FeatureVector, predictRisk } from '../model/primerModel';

// Diferansiyel test hedefi: ?parite=1&x=1,2,1,5,0 → [data-cy="p"]
export const ParityScreen: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const x = (params.get('x') || '0,2,0,0,0').split(',').map(Number) as FeatureVector;
  const [p, setP] = useState<number | null>(null);
  const [source, setSource] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    predictRisk(x)
      .then((r) => {
        setP(r.p);
        setSource(r.source);
      })
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <div className="p-6 font-mono text-[13px] text-[#2B1829] space-y-2">
      <h1 className="font-bold text-[16px]">Parite Modu — onnxruntime-web</h1>
      <div>girdi: <span data-cy="x">{JSON.stringify(x)}</span></div>
      {p !== null && (
        <div>
          p = <span data-cy="p">{p.toFixed(8)}</span>
        </div>
      )}
      {source && <div data-cy="model-source">kaynak: {source}</div>}
      {error && <div data-cy="parity-error" className="text-red-700">{error}</div>}
    </div>
  );
};
