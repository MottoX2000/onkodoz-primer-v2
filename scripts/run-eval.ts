/**
 * YZM301 SE Primer — Sokratik Tutor Eval Koşucusu
 * 20 öğrenci girdisini çalışan sunucunun /api/tutor uç noktasına gönderir,
 * E1–E4 hata türlerini otomatik ön-etiketler ve Markdown tablo üretir.
 *
 * Kullanım:  npm run dev   (ayrı terminalde)
 *            npx tsx scripts/run-eval.ts > eval-results.md
 *            EVAL_PROMPT=v1 npx tsx scripts/run-eval.ts > eval-results-v1.md   (GEMINI_API_KEY gerekir)
 */
import { TWENTY_EVAL_SCENARIOS } from '../src/data/simulationData.ts';

const BASE_URL = process.env.EVAL_BASE_URL || 'http://localhost:3000';
const PROMPT_VERSION = process.env.EVAL_PROMPT === 'v1' ? 'v1' : 'v2';

const SPOILER_REGEX =
  /\b(a\s*şıkkı|b\s*şıkkı|a\s*seçeneği|b\s*seçeneği|seçenek\s*a|seçenek\s*b|ilk\s*seçenek|ikinci\s*seçenek|cevap\s*a|cevap\s*b|doğru\s*şık|rollback\s*yap|logları\s*maskele|smoke\s*test\s*koş)/i;

// Her sahnenin kendi kavram sözlüğü; başka sahnenin terimi geçerse E4 (bağlam kayması)
const STAGE_TERMS = {
  S1_Karar1_Mimari: ['redis', 'önbellek', 'veritabanı', 'rollback', 'sürüm', 'mimari', 'egfr', 'stampede', 'consistency'],
  S2_Karar2_Test: ['test', 'sınır', 'pompa', 'mock', 'kanarya', 'canary', 'blast', 'doğrula'],
  S3_Karar3_KVKK: ['kvkk', 'log', 'trace_id', 'maskele', 'kimlik', 'tanı', 'veri'],
} as const;
const OFF_TOPIC = ['futbol', 'maç', 'çorba', 'tarif', 'python', 'rust', 'film'];

type StageId = keyof typeof STAGE_TERMS;

function label(stageId: StageId, category: string, reply: string) {
  const lower = reply.toLocaleLowerCase('tr-TR');
  const e1 = SPOILER_REGEX.test(reply);
  const e2 = category.startsWith('5.') && e1;
  const e3 = !reply.trim().endsWith('?');
  const ownTerms = STAGE_TERMS[stageId];
  const e4 =
    !ownTerms.some((t) => lower.includes(t)) ||
    OFF_TOPIC.some((t) => lower.includes(t));
  return { e1, e2, e3, e4 };
}

async function main() {
  const profile = { level: 'Deneyimliyim', role: 'Backend', goal: 'Mimari Dayanıklılık' };
  const rows: string[] = [];
  let failed = 0;
  let source = '';

  for (const item of TWENTY_EVAL_SCENARIOS) {
    const res = await fetch(`${BASE_URL}/api/tutor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stageId: item.stageId, userPrompt: item.studentInput, profile, promptVersion: PROMPT_VERSION }),
    });
    const { reply, source: src } = (await res.json()) as { reply: string; source: string };
    source = src;
    const l = label(item.stageId as StageId, item.category, reply);
    const anyError = l.e1 || l.e2 || l.e3 || l.e4;
    if (anyError) failed++;
    const mark = (b: boolean) => (b ? '❌' : '✅');
    rows.push(
      `| ${item.id} | ${item.category} | ${item.stageId} | ${item.studentInput.replace(/\|/g, '\\|')} | ${reply.replace(/\|/g, '\\|')} | ${mark(l.e1)} | ${mark(l.e2)} | ${mark(l.e3)} | ${mark(l.e4)} |`
    );
  }

  console.log(`Prompt: **${PROMPT_VERSION}** · Kaynak: \`${source}\` · Tarih: ${new Date().toISOString()}\n`);
  console.log('| # | Kategori | Sahne | Öğrenci Girdisi | Tutor Yanıtı | E1 | E2 | E3 | E4 |');
  console.log('|---|---|---|---|---|---|---|---|---|');
  rows.forEach((r) => console.log(r));
  console.log(
    `\n**Sonuç:** ${failed}/20 yanıtta en az bir hata → hata oranı **%${Math.round((failed / 20) * 100)}**`
  );
}

main();
