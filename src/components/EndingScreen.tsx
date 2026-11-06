import React from 'react';
import {
  ArrowLeft,
  User,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  RotateCcw,
  Download,
  XCircle,
  Quote,
} from 'lucide-react';
import {
  DecisionChoice,
  GOAL_DEBIEFS,
  PATH_OUTCOMES,
  PlayerProfile,
  STAGES,
} from '../data/simulationData';
import {
  RetroChevronBanner,
  RetroFooterOrnaments,
} from './RetroChevronBanner';

interface EndingScreenProps {
  profile: PlayerProfile;
  decisions: [DecisionChoice, DecisionChoice, DecisionChoice];
  onRestart: () => void;
}

export const EndingScreen: React.FC<EndingScreenProps> = ({
  profile,
  decisions,
  onRestart,
}) => {
  const pathKey = decisions.join('-');
  const outcome = PATH_OUTCOMES[pathKey] || PATH_OUTCOMES['B-B-B'];
  const isGoodEnding = outcome.isGoodEnding;
  const goalDebrief = GOAL_DEBIEFS[profile.goal];

  const approvedCount = decisions.filter((d) => d === 'A').length;

  const stageAudits = [
    {
      step: 1,
      stageLabel: 'AŞAMA 1 · MİMARİ MÜDAHALE',
      choice: decisions[0],
      data:
        decisions[0] === 'A'
          ? STAGES.S1_Karar1_Mimari.optionA
          : STAGES.S1_Karar1_Mimari.optionB,
    },
    {
      step: 2,
      stageLabel: 'AŞAMA 2 · DOĞRULAMA & TEST',
      choice: decisions[1],
      data:
        decisions[1] === 'A'
          ? STAGES.S2_Karar2_Test.optionA
          : STAGES.S2_Karar2_Test.optionB,
    },
    {
      step: 3,
      stageLabel: 'AŞAMA 3 · KVKK & GİZLİLİK',
      choice: decisions[2],
      data:
        decisions[2] === 'A'
          ? STAGES.S3_Karar3_KVKK.optionA
          : STAGES.S3_Karar3_KVKK.optionB,
    },
  ];

  const handleDownloadMarkdown = () => {
    const mdContent = `# YZM301 SE Primer · Mühendislik Denetim Karnesi
- **Kurum:** Kuzey Yıldızı Onkoloji Hastanesi (OnkoDoz-AI v2.4.0)
- **Oyuncu Profili:** Seviye: ${profile.level} | Rol: ${profile.role} | Hedef: ${profile.goal}
- **Karar Yolu:** ${outcome.arrowPath} (Yol ${outcome.roadNumber} · ${outcome.pathKey})
- **Ulaşılan Son:** ${outcome.endingCode}
- **Teknik Otopsi:** ${outcome.headline}

## Karar Yolu Denetimi (${approvedCount}/3 Onaylandı)
1. **Karar 1 (Mimari):** Seçim ${decisions[0]} — ${stageAudits[0].data.auditTitle}: ${stageAudits[0].data.auditDetail}
2. **Karar 2 (Test):** Seçim ${decisions[1]} — ${stageAudits[1].data.auditTitle}: ${stageAudits[1].data.auditDetail}
3. **Karar 3 (KVKK):** Seçim ${decisions[2]} — ${stageAudits[2].data.auditTitle}: ${stageAudits[2].data.auditDetail}

## Hedef Analizi (${profile.goal})
${isGoodEnding ? goalDebrief.goodAnalysis : goalDebrief.badAnalysis}
`;
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OnkoDoz_Denetim_Karnesi_${outcome.pathKey}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#FFF9E9]">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 bg-[#FFF9E9]/95 backdrop-blur-xs border-b-2 border-[#2B1829] px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onRestart}
            title="Baştan Oyna"
            className="w-8 h-8 rounded-full border-2 border-[#2B1829] bg-[#FFF9E6] flex items-center justify-center hover:bg-[#F5A623] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#2B1829]" />
          </button>

          <div className="flex items-center gap-1.5">
            <span className="bg-[#ECE3B6] border border-[#857462] rounded-full px-2.5 py-0.5 font-mono text-[12px] font-bold text-[#2B1829]">
              08:40
            </span>
            <span className="bg-[#FDB827] border-2 border-[#2B1829] rounded-full px-3 py-0.5 font-mono text-[12px] font-bold text-[#2B1829]">
              ⏱ {outcome.slaDowntime}
            </span>
          </div>

          <div
            title={`${profile.level} · ${profile.role}`}
            className="w-8 h-8 rounded-full bg-[#644000] text-[#FFF9E6] border-2 border-[#2B1829] flex items-center justify-center shrink-0"
          >
            <User className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <h1 className="font-display text-[18px] font-bold text-[#2B1829]">
            Post Mortem Review
          </h1>
          <span
            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
              isGoodEnding
                ? 'bg-[#D1FAE5] border-[#2E8B57] text-[#065F46]'
                : 'bg-[#F7C1BB] border-[#C04332] text-[#8A1C10]'
            }`}
          >
            {isGoodEnding ? 'KRİZ ÇÖZÜLDÜ' : 'ACİL DURUM'}
          </span>
        </div>
      </header>

      <div className="px-4 pt-3 pb-6 space-y-4">
        {/* Top Chevron Report Header Card */}
        <div className="retro-card rounded-2xl overflow-hidden bg-[#FFF9E6]">
          <RetroChevronBanner variant="report">
            <div className="inline-flex items-center gap-1.5 bg-[#ECE3B6] border border-[#857462] rounded-full px-3 py-0.5 font-mono text-[10.5px] font-bold uppercase text-[#2B1829] mb-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isGoodEnding ? 'bg-[#2E8B57]' : 'bg-[#D73A49]'
                }`}
              />
              <span>YZM301 · SİMÜLASYON RAPORU</span>
            </div>
            <h2 className="font-display text-[21px] font-bold leading-snug text-[#2B1829] mb-1">
              Kriz Sonuç Raporu & Mühendislik Karnesi
            </h2>
            <p className="font-mono text-[11.5px] text-[#524534]">
              08:40 · Vardiya Sonu Kıdemli Konsol Değerlendirmesi
            </p>
          </RetroChevronBanner>
        </div>

        {/* Status Indicator Pill Row */}
        <div className="rounded-full p-1 bg-[#ECE3B6] border-2 border-[#2B1829] grid grid-cols-2 gap-1">
          <div
            className={`rounded-full py-1.5 px-2 text-center font-mono text-[11px] font-bold flex items-center justify-center gap-1 ${
              isGoodEnding
                ? 'bg-[#F5A623] text-[#2B1829] border-2 border-[#2B1829] shadow-[2px_2px_0px_#2B1829]'
                : 'text-[#524534] opacity-70'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>SON A · İYİ SONUÇ</span>
          </div>
          <div
            className={`rounded-full py-1.5 px-2 text-center font-mono text-[11px] font-bold flex items-center justify-center gap-1 ${
              !isGoodEnding
                ? 'bg-[#E05A47] text-white border-2 border-[#2B1829] shadow-[2px_2px_0px_#2B1829]'
                : 'text-[#524534] opacity-70'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>SON B · KRİTİK İHLAL</span>
          </div>
        </div>

        {/* Outcome Hero Card — Strictly renders ending-good OR ending-bad */}
        {isGoodEnding ? (
          <section
            data-cy="ending-good"
            className="retro-card rounded-2xl p-4 bg-[#FFF9E6] space-y-3.5"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="bg-[#2E8B57] text-white border-2 border-[#2B1829] rounded-lg px-3 py-1 font-mono text-[11px] font-bold uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#2B1829]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>MİSYON BAŞARILI · SON A · İYİ</span>
              </span>
              <span className="bg-[#F8EFC1] border border-[#857462] text-[#2E8B57] rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold uppercase">
                48/48 HASTA GÜVENDE
              </span>
            </div>

            <h3 className="font-display text-[20px] font-bold leading-snug text-[#2B1829]">
              08:40 — Sistem Ayakta, 48 Hasta ve Veriler Güvende (08:40 Sistem
              Ayakta, Veri Güvende)
            </h3>

            <p className="text-[13.5px] leading-relaxed text-[#3D243B]">
              {outcome.summary}
            </p>

            {/* 3 KPI Metrics Box */}
            <div className="rounded-xl p-3 bg-[#F8EFC1] border-2 border-[#2B1829] grid grid-cols-3 divide-x divide-[#D7C3AE] text-center">
              <div className="px-1">
                <div className="text-[10.5px] font-medium text-[#524534]">
                  SLA Duruşu
                </div>
                <div className="font-mono text-[16px] font-bold text-[#2B1829]">
                  {outcome.slaDowntime}
                </div>
                <div className="font-mono text-[9.5px] font-bold text-[#2E8B57]">
                  {outcome.slaStatus}
                </div>
              </div>
              <div className="px-1">
                <div className="text-[10.5px] font-medium text-[#524534]">
                  Dozaj Hata
                </div>
                <div className="font-mono text-[16px] font-bold text-[#2E8B57]">
                  {outcome.dosingErrorRate}
                </div>
                <div className="font-mono text-[9.5px] font-bold text-[#2E8B57]">
                  {outcome.dosingStatus}
                </div>
              </div>
              <div className="px-1">
                <div className="text-[10.5px] font-medium text-[#524534]">
                  KVKK Uyumu
                </div>
                <div className="font-mono text-[16px] font-bold text-[#2B1829]">
                  {outcome.kvkkCompliance}
                </div>
                <div className="font-mono text-[9.5px] font-bold text-[#2E8B57]">
                  {outcome.kvkkStatus}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section
            data-cy="ending-bad"
            className="retro-card rounded-2xl p-4 bg-[#FFF9E6] space-y-3.5"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="bg-[#D73A49] text-white border-2 border-[#2B1829] rounded-lg px-3 py-1 font-mono text-[11px] font-bold uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#2B1829]">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>KRİTİK İHLAL · SON B · KÖTÜ</span>
              </span>
              <span className="bg-[#FFDAD6] border border-[#C04332] text-[#93000A] rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold uppercase">
                YOL #{outcome.roadNumber} · OTOPSİ RAPORU
              </span>
            </div>

            <h3 className="font-display text-[19px] font-bold leading-snug text-[#93000A]">
              {outcome.headline}
            </h3>

            <p className="text-[13.5px] leading-relaxed text-[#3D243B]">
              {outcome.summary}
            </p>

            {/* 3 KPI Metrics Box */}
            <div className="rounded-xl p-3 bg-[#F8EFC1] border-2 border-[#2B1829] grid grid-cols-3 divide-x divide-[#D7C3AE] text-center">
              <div className="px-1">
                <div className="text-[10.5px] font-medium text-[#524534]">
                  SLA Duruşu
                </div>
                <div className="font-mono text-[16px] font-bold text-[#C04332]">
                  {outcome.slaDowntime}
                </div>
                <div className="font-mono text-[9.5px] font-bold text-[#C04332]">
                  {outcome.slaStatus}
                </div>
              </div>
              <div className="px-1">
                <div className="text-[10.5px] font-medium text-[#524534]">
                  Dozaj Hata
                </div>
                <div className="font-mono text-[16px] font-bold text-[#2B1829]">
                  {outcome.dosingErrorRate}
                </div>
                <div className="font-mono text-[9.5px] font-bold text-[#C04332]">
                  {outcome.dosingStatus}
                </div>
              </div>
              <div className="px-1">
                <div className="text-[10.5px] font-medium text-[#524534]">
                  KVKK Uyumu
                </div>
                <div className="font-mono text-[16px] font-bold text-[#2B1829]">
                  {outcome.kvkkCompliance}
                </div>
                <div className="font-mono text-[9.5px] font-bold text-[#C04332]">
                  {outcome.kvkkStatus}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Decision Path Audit Section */}
        <section data-cy="path-summary" className="space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-[17px] font-bold text-[#2B1829]">
                Karar Yolu Denetimi
              </h3>
              <span className="bg-[#FDB827] border border-[#2B1829] rounded px-2 py-0.5 font-mono text-[11.5px] font-bold text-[#2B1829]">
                {outcome.arrowPath} ({outcome.pathKey})
              </span>
            </div>
            <span className="font-mono text-[11.5px] font-bold text-[#524534]">
              {approvedCount} / 3 Onaylandı
            </span>
          </div>

          <div className="text-[12px] font-mono font-bold text-[#524534] bg-[#F8EFC1] border border-[#857462] rounded-lg px-3 py-1.5">
            Yol {outcome.roadNumber}: {outcome.headline}
          </div>

          <div className="space-y-2.5">
            {stageAudits.map((item) => {
              const isApproved = item.choice === 'A';
              return (
                <div
                  key={item.step}
                  className="retro-card rounded-xl p-3.5 bg-[#FFF9E6] flex items-start gap-3"
                >
                  <span
                    className={`w-7 h-7 rounded-full border-2 border-[#2B1829] font-display text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isApproved
                        ? 'bg-[#F5A623] text-[#2B1829]'
                        : 'bg-[#E05A47] text-white'
                    }`}
                  >
                    {item.step}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#AB3425]">
                      {item.stageLabel} (Seçim: {item.choice})
                    </div>
                    <div className="font-display text-[14.5px] font-bold text-[#2B1829] mb-0.5">
                      {item.data.auditTitle}
                    </div>
                    <p className="text-[12px] leading-snug text-[#524534]">
                      {item.data.auditDetail}
                    </p>
                  </div>
                  {isApproved ? (
                    <CheckCircle2 className="w-5 h-5 text-[#2E8B57] shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-[#D73A49] shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Personalized Goal Analysis Card */}
        <section className="socratic-drawer rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-[#5E548E] font-mono text-[11px] font-bold uppercase tracking-wider">
            <BrainCircuit className="w-4 h-4 shrink-0" />
            <span>SOKRATİK DEĞERLENDİRME ({profile.role})</span>
          </div>

          <h3 className="font-display text-[18px] font-bold leading-snug text-[#2B1829]">
            {goalDebrief.title}
          </h3>

          <p className="text-[13px] leading-relaxed text-[#3D243B]">
            {isGoodEnding ? goalDebrief.goodAnalysis : goalDebrief.badAnalysis}
          </p>

          <div className="bg-white rounded-xl p-3.5 border-2 border-[#2B1829] shadow-[3px_3px_0px_#5E548E] flex items-start gap-2.5">
            <Quote className="w-4 h-4 text-[#4D7796] shrink-0 mt-0.5" />
            <p className="text-[12px] italic leading-relaxed text-[#2B1829]">
              {goalDebrief.quote}
            </p>
          </div>
        </section>

        {/* Retro 70s Ornaments */}
        <RetroFooterOrnaments variant="report" />

        {/* Restart CTA & Download Report */}
        <div className="space-y-2.5">
          <button
            type="button"
            data-cy="restart-btn"
            onClick={onRestart}
            className="w-full h-[54px] rounded-xl bg-[#F5A623] text-[#2B1829] font-display text-[16px] font-bold retro-btn flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>Farklı Bir Karar Yoluyla Baştan Oyna ↻</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="w-full h-[42px] rounded-xl bg-[#FFF9E6] text-[#2B1829] font-mono text-[12px] font-bold retro-card-sm flex items-center justify-center gap-2 hover:bg-[#F8EFC1] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Mühendislik Denetim Karnesini İndir (.MD)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
