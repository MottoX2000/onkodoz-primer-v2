// Veri Toplama Modu: her karar bir satır. KVKK: ad/e-posta/cihaz/konum YOK,
// oturum kimliği rastgele üretilir. Veriler yalnızca tarayıcının localStorage'ında
// tutulur; oyuncu isterse oyun sonunda CSV indirir ve gönüllü olarak paylaşır.
const KEY = 'primer_oturumlar_v2';

export const COLUMNS = [
  'oturum_id', 'kaynak', 'seviye', 'sahne_no', 'onceki_riskli_sayisi',
  'onceki_karar_suresi_sn', 'tutor_acma_sayisi', 'karar', 'karar_suresi_sn', 'riskli_karar',
] as const;

export type Row = Record<(typeof COLUMNS)[number], string | number>;

export function newSessionId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function appendRow(row: Row) {
  const rows: Row[] = JSON.parse(localStorage.getItem(KEY) || '[]');
  rows.push(row);
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export function rowCount(): number {
  return JSON.parse(localStorage.getItem(KEY) || '[]').length;
}

export function downloadCsv() {
  const rows: Row[] = JSON.parse(localStorage.getItem(KEY) || '[]');
  const csv = [COLUMNS.join(','), ...rows.map((r) => COLUMNS.map((c) => r[c]).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = 'oturumlar_gercek.csv';
  a.click();
}
