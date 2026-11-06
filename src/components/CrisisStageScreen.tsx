import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Send,
  BookOpen,
  PauseCircle,
  Clock,
  GitBranch,
} from 'lucide-react';
import {
  DecisionChoice,
  enforceSocraticGuardrails,
  generateDeterministicSocraticReply,
  PlayerProfile,
  StageConfig,
} from '../data/simulationData';
import {
  RetroChevronBanner,
  RetroFooterOrnaments,
} from './RetroChevronBanner';

interface CrisisStageScreenProps {
  stage: StageConfig;
  profile: PlayerProfile;
  previousChoice: DecisionChoice | null;
  selectedOption: DecisionChoice | null;
  timedOut: boolean;
  timer: number;
  isTutorOpen: boolean;
  onToggleTutor: () => void;
  onForceOpenTutor: () => void;
  onSelectOption: (choice: DecisionChoice) => void;
  onNextStage: () => void;
  onRestart: () => void;
  riskP?: number | null;
  modelActive?: boolean;
}

export const CrisisStageScreen: React.FC<CrisisStageScreenProps> = ({
  stage,
  profile,
  previousChoice,
  selectedOption,
  timedOut,
  timer,
  isTutorOpen,
  onToggleTutor,
  onForceOpenTutor,
  onSelectOption,
  onNextStage,
  onRestart,
  riskP = null,
  modelActive = false,
}) => {
  const [tutorInput, setTutorInput] = useState('');
  const [tutorResponse, setTutorResponse] = useState(
    stage.initialTutorQuestion
  );
  const [isSendingTutor, setIsSendingTutor] = useState(false);

  // Reset tutor prompt and response when stage changes
  useEffect(() => {
    setTutorInput('');
    setTutorResponse(stage.initialTutorQuestion);
    setIsSendingTutor(false);
  }, [stage.id, stage.initialTutorQuestion]);

  const telemetry = stage.telemetryByRole[profile.role];

  // Determine narrative text based on previous choice (Spec Section 5.2)
  const narrativeText =
    stage.id === 'S2_Karar2_Test'
      ? previousChoice === 'A'
        ? stage.narrativeAfterA || stage.baseNarrative
        : previousChoice === 'B'
        ? stage.narrativeAfterB || stage.baseNarrative
        : stage.baseNarrative
      : stage.baseNarrative;

  const activeFeedbackOption =
    selectedOption === 'A'
      ? stage.optionA
      : selectedOption === 'B'
      ? stage.optionB
      : null;

  const askSocraticTutor = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed) return;

    // Ensure Tutor is marked open so timer pauses in Senior mode
    onForceOpenTutor();

    // Immediately set deterministic Socratic response first so E2E tests
    // never face async race conditions, then refine with server if available
    const immediateSafeReply = generateDeterministicSocraticReply(
      stage.id,
      trimmed,
      profile
    );
    setTutorResponse(immediateSafeReply);
    setIsSendingTutor(true);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stageId: stage.id,
          userPrompt: trimmed,
          profile,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data?.reply) {
          const verified = enforceSocraticGuardrails(
            data.reply,
            stage.id,
            trimmed,
            profile
          );
          setTutorResponse(verified);
        }
      }
    } catch {
      // Fallback already displayed
    } finally {
      setIsSendingTutor(false);
    }
  };

  const handleTutorFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorInput.trim()) return;
    const currentPrompt = tutorInput;
    setTutorInput('');
    askSocraticTutor(currentPrompt);
  };

  const formattedTimer =
    timer > 60
      ? `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`
      : `00:${String(timer).padStart(2, '0')}`;
  const showNudge = riskP !== null && riskP >= 0.5;

  return (
    <div className="flex flex-col min-h-full bg-[#FFF9E9]">
      {/* Sticky Top Header Bar */}
      <header className="sticky top-0 z-30 bg-[#FFF9E9]/95 backdrop-blur-xs border-b-2 border-[#2B1829] px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onRestart}
            title="Giriş Ekranına Dön"
            className="w-8 h-8 rounded-full border-2 border-[#2B1829] bg-[#FFF9E6] flex items-center justify-center hover:bg-[#F5A623] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#2B1829]" />
          </button>

          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <span className="bg-[#ECE3B6] border border-[#857462] rounded-full px-2.5 py-0.5 font-mono text-[12px] font-bold text-[#2B1829]">
              {stage.clock}
            </span>

            {profile.level === 'Deneyimliyim' && (
              <span
                data-cy="timer-display"
                className={`rounded-full px-3 py-0.5 font-mono text-[12px] font-bold border-2 border-[#2B1829] flex items-center gap-1 ${
                  timer <= 10
                    ? 'bg-[#E05A47] text-white'
                    : 'bg-[#FDB827] text-[#2B1829]'
                }`}
              >
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>⏱ {formattedTimer}</span>
              </span>
            )}

            {profile.level === 'Deneyimliyim' && isTutorOpen && (
              <span
                data-cy="timer-paused-badge"
                className="rounded-full px-2.5 py-0.5 font-mono text-[10.5px] font-bold bg-[#5E548E] text-[#FFF9E6] border-2 border-[#2B1829] flex items-center gap-1"
              >
                <PauseCircle className="w-3 h-3 shrink-0" />
                <span>⏸ SAYAÇ DURAKLATILDI (Tutor Aktif)</span>
              </span>
            )}
          </div>

          <div
            title={`${profile.level} · ${profile.role}`}
            className="w-8 h-8 rounded-full bg-[#644000] text-[#FFF9E6] border-2 border-[#2B1829] flex items-center justify-center shrink-0"
          >
            <User className="w-4 h-4" />
          </div>
        </div>

        {/* Stage Title Row */}
        <div className="flex items-center justify-between mt-2">
          <h1 className="font-display text-[18px] font-bold text-[#2B1829]">
            {stage.headerTitle}
          </h1>
          <span className="bg-[#F7C1BB] border border-[#C04332] text-[#8A1C10] font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase">
            ACİL DURUM
          </span>
        </div>
      </header>

      {/* 1970s Horizontal Stripe Banner */}
      <RetroChevronBanner variant="stage" />

      {/* Sub-Status Strip */}
      <div className="px-4 py-2 bg-[#F8EFC1] border-b-2 border-[#2B1829] flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="bg-[#2B1829] text-[#FDB827] font-mono text-[10.5px] font-bold px-2 py-0.5 rounded uppercase">
            {stage.stepBadge}
          </span>
          <span className="bg-[#ECE3B6] border border-[#857462] text-[#2B1829] font-mono text-[10.5px] font-bold px-2 py-0.5 rounded">
            {stage.clock}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10.5px] font-bold text-[#8A1C10]">
          <span className="w-2 h-2 rounded-full bg-[#D73A49]" />
          <span>48 HASTA KRİTİK</span>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="px-4 pt-3.5 pb-6 space-y-4">
        {/* Hospital Unit Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#2B1829] text-[#FDB827] flex items-center justify-center font-bold text-xs border border-[#2B1829]">
              ✚
            </span>
            <span className="font-mono text-[11.5px] font-bold tracking-wider text-[#2B1829]">
              YZM301 · ONKODOZ-AI
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#ECE3B6] border border-[#2B1829] text-[#2B1829]">
            Rol: {profile.role}
          </span>
        </div>

        {/* v2.0 Primer Model (onnxruntime-web) */}
        <div
          data-cy="model-chip"
          className="flex items-center justify-between rounded-lg border border-[#857462] bg-[#ECE3B6] px-2.5 py-1 font-mono text-[10.5px] font-bold text-[#2B1829]"
        >
          <span>PRIMER MODEL v2.0 · riskli karar olasılığı</span>
          {modelActive ? (
            riskP !== null ? (
              <span data-cy="p">{riskP.toFixed(4)}</span>
            ) : (
              <span>hesaplanıyor…</span>
            )
          ) : (
            <span data-cy="model-off">1. sahnede kapalı</span>
          )}
        </div>

        {showNudge && (
          <div
            data-cy="model-nudge"
            className="retro-card rounded-2xl p-3.5 bg-[#F7C1BB] border-[#2B1829]"
          >
            <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#8A1C10] mb-1">
              ⚠ Primer Uyarısı (model: p ≥ 0.50)
            </div>
            <p className="text-[12.5px] leading-relaxed text-[#2B1829]">
              Önceki kararlarındaki hız ve risk örüntüsü bu sahnede acele etme ihtimalini yükseltiyor.
              {profile.level === 'Deneyimliyim' ? ' Sayacına +30 sn eklendi.' : ''} Seçmeden önce kendine sor:
              bu kararın patlama yarıçapı (blast radius) ne kadar ve geri alınabilir mi?
            </p>
          </div>
        )}

        {/* Beginner Hint Card — ONLY in DOM when level === 'Yeni Başladım' */}
        {profile.level === 'Yeni Başladım' && (
          <div
            data-cy="beginner-hint-card"
            className="retro-card rounded-2xl p-3.5 bg-[#FDF4C6] border-[#2B1829]"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <BookOpen className="w-4 h-4 text-[#835500] shrink-0" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#644000]">
                {stage.beginnerHintTitle}
              </span>
            </div>
            <p className="text-[12.5px] leading-relaxed text-[#2B1829] mb-2.5">
              {stage.beginnerHintText}
            </p>
            <div className="flex items-center justify-between gap-1 bg-[#FFF9E6] border border-[#857462] rounded-lg px-2.5 py-1.5 font-mono text-[10.5px] font-bold text-[#2B1829]">
              <GitBranch className="w-3.5 h-3.5 text-[#C04332] shrink-0" />
              {stage.beginnerDiagramSteps.map((step, idx) => (
                <React.Fragment key={step}>
                  <span className="truncate">{step}</span>
                  {idx < stage.beginnerDiagramSteps.length - 1 && (
                    <span className="text-[#C04332]">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Crisis Scenario & Role Telemetry Card */}
        <div className="retro-card rounded-2xl p-4 bg-[#FFF9E6] relative overflow-hidden">
          {/* Corner Terracotta Warning Ribbon */}
          <div
            aria-hidden="true"
            className="absolute -top-6 -right-6 w-14 h-14 rotate-45 bg-[#E05A47] border-b-2 border-[#2B1829] flex items-end justify-center pb-1"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-white -rotate-45" />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#F7C1BB] text-[#8A1C10] font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              KRİZ SENARYOSU
            </span>
            <span className="font-mono text-[11px] font-bold text-[#524534]">
              {stage.stageCode}
            </span>
          </div>

          <h2 data-cy="stage-title" className="font-display text-[20px] font-bold leading-snug text-[#2B1829] mb-2">
            {stage.title}
          </h2>

          <p className="text-[13.5px] leading-[1.55] text-[#3D243B] mb-3.5">
            {narrativeText.split(stage.highlightPhrase).map((part, index, arr) =>
              index < arr.length - 1 ? (
                <React.Fragment key={index}>
                  {part}
                  <strong className="text-[#AB3425] underline decoration-[#E05A47] decoration-2 underline-offset-2 font-bold">
                    {stage.highlightPhrase}
                  </strong>
                </React.Fragment>
              ) : (
                part
              )
            )}
          </p>

          {/* Recessed CRT Console: Role Telemetry */}
          <div
            data-cy="role-telemetry"
            className="telemetry-crt rounded-xl p-3 font-mono text-[11.5px] leading-relaxed"
          >
            <div className="flex items-center justify-between text-[10px] mb-1.5 pb-1 border-b border-[#3D243B]">
              <span className="text-[#F5A623] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E05A47]" />
                CONSOLE: LIVE TELEMETRY ({profile.role})
              </span>
              <span className="text-[#D7C3AE]">{telemetry.busId}</span>
            </div>
            <div className="text-[#F7C1BB] font-semibold break-words mb-1">
              {telemetry.primaryLine}
            </div>
            <div className="flex items-center justify-between gap-2 text-[#FDB827] font-bold">
              <span className="break-words">{telemetry.secondaryLine}</span>
              <span className="bg-[#3D243B] border border-[#5E548E] text-[#F7C1BB] text-[10px] px-1.5 py-0.5 rounded shrink-0">
                {telemetry.badge}
              </span>
            </div>
          </div>
        </div>

        {/* Decision Buttons Section */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#2B1829]">
            <HelpCircle className="w-4 h-4 text-[#C04332]" />
            <span>KARAR VERİN ({stage.stepBadge})</span>
          </div>

          {/* Option A Button — Identical neutral palette before choice */}
          <button
            type="button"
            data-cy="option-a-btn"
            disabled={selectedOption !== null}
            onClick={() => onSelectOption('A')}
            className={`w-full text-left rounded-xl p-3.5 retro-btn flex items-start gap-3 cursor-pointer ${
              selectedOption === 'A'
                ? 'bg-[#F8E5B8] ring-2 ring-[#2B1829]'
                : 'bg-[#FFF9E6]'
            } ${selectedOption !== null && selectedOption !== 'A' ? 'opacity-65' : ''}`}
          >
            <span className="w-8 h-8 rounded-full bg-[#2B1829] text-[#FFF9E6] font-display text-[15px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              A
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#524534] mb-0.5">
                {stage.optionA.categoryLabel}
              </div>
              <div className="font-display text-[14px] font-bold leading-snug text-[#2B1829]">
                {stage.optionA.text}
              </div>
            </div>
            <CheckCircle2
              className={`w-4 h-4 shrink-0 mt-1 ${
                selectedOption === 'A' ? 'text-[#2E8B57]' : 'text-[#D7C3AE]'
              }`}
            />
          </button>

          {/* Option B Button — Identical neutral palette before choice */}
          <button
            type="button"
            data-cy="option-b-btn"
            disabled={selectedOption !== null}
            onClick={() => onSelectOption('B')}
            className={`w-full text-left rounded-xl p-3.5 retro-btn flex items-start gap-3 cursor-pointer ${
              selectedOption === 'B'
                ? 'bg-[#F8E5B8] ring-2 ring-[#2B1829]'
                : 'bg-[#FFF9E6]'
            } ${selectedOption !== null && selectedOption !== 'B' ? 'opacity-65' : ''}`}
          >
            <span className="w-8 h-8 rounded-full bg-[#2B1829] text-[#FFF9E6] font-display text-[15px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              B
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#524534] mb-0.5">
                {stage.optionB.categoryLabel}
              </div>
              <div className="font-display text-[14px] font-bold leading-snug text-[#2B1829]">
                {stage.optionB.text}
              </div>
            </div>
            <CheckCircle2
              className={`w-4 h-4 shrink-0 mt-1 ${
                selectedOption === 'B' ? 'text-[#C04332]' : 'text-[#D7C3AE]'
              }`}
            />
          </button>
        </section>

        {/* Causal Feedback Card ("Ne Oldu?" & "Neden Oldu?") */}
        {activeFeedbackOption && (
          <section className="retro-card rounded-2xl overflow-hidden bg-[#FFF9E6]">
            {/* Top Bar */}
            <div className="px-4 py-2.5 bg-[#F8EFC1] border-b-2 border-[#2B1829] flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#2B1829]">
                NEDENSEL ANALİZ & ETKİ
              </span>
              <span
                className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-[#2B1829] ${
                  selectedOption === 'A'
                    ? 'bg-[#FDB827] text-[#2B1829]'
                    : 'bg-[#E05A47] text-white'
                }`}
              >
                {timedOut
                  ? 'SÜRE AŞIMI → B UYGULANDI'
                  : `KARAR ${selectedOption} UYGULANDI`}
              </span>
            </div>

            {timedOut && (
              <div className="px-4 py-2 bg-[#FFDAD6] border-b-2 border-[#2B1829] text-[#93000A] font-mono text-[11px] font-bold">
                ⏰ 60 saniyelik karar süresi dolduğu için panikle riskli seçenek (B)
                devreye girdi!
              </div>
            )}

            {/* Deck 1: NE OLDU? */}
            <div data-cy="feedback-what" className="p-4 bg-[#FFF9E6]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-[#F7C1BB] border border-[#2B1829] text-[#2B1829] font-mono text-[10.5px] font-bold px-2 py-0.5 rounded">
                  NE OLDU?
                </span>
                <span className="font-mono text-[10.5px] font-bold uppercase text-[#524534]">
                  OPERASYONEL SONUÇ
                </span>
              </div>
              <p className="text-[13.5px] leading-relaxed text-[#2B1829]">
                {activeFeedbackOption.whatHappened}
              </p>
            </div>

            {/* Double-Decker Divider */}
            <div className="h-1.5 w-full bg-[#ECE3B6] border-y border-[#857462]" />

            {/* Deck 2: NEDEN OLDU? */}
            <div data-cy="feedback-why" className="p-4 bg-[#FDF4C6]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-[#FDB827] border border-[#2B1829] text-[#2B1829] font-mono text-[10.5px] font-bold px-2 py-0.5 rounded">
                  NEDEN OLDU?
                </span>
                <span className="font-mono text-[10.5px] font-bold uppercase text-[#524534]">
                  MÜHENDİSLİK PRENSİBİ
                </span>
              </div>
              <p className="text-[13.5px] leading-relaxed text-[#2B1829]">
                {activeFeedbackOption.whyHappened}
              </p>
            </div>

            {/* Next Stage Action */}
            <div className="p-4 bg-[#FFF9E6] border-t-2 border-[#2B1829]">
              <button
                type="button"
                data-cy="next-stage-btn"
                onClick={onNextStage}
                className="w-full h-[50px] rounded-xl bg-[#F5A623] text-[#2B1829] font-display text-[16px] font-bold retro-btn flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {stage.stepNumber < 3
                    ? 'Sonraki Karara Geç'
                    : 'Sonraki Karara Geç · Kriz Raporunu Gör'}
                </span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </section>
        )}

        {/* Lab Protocol Note Card */}
        <div className="rounded-2xl p-3.5 bg-[#ECE8F4] border-2 border-[#D7C3AE] flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#FDB827] border-2 border-[#2B1829] flex items-center justify-center shrink-0 overflow-hidden">
            <span className="font-display text-lg font-bold text-[#2B1829]">
              Rx
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#5E548E]">
              LABORATUVAR PROTOKOLÜ
            </div>
            <div className="font-display text-[15px] font-bold text-[#2B1829] truncate">
              {stage.labNoteTitle}
            </div>
            <div className="font-mono text-[11px] text-[#524534] truncate">
              {stage.labNoteSubtitle}
            </div>
          </div>
        </div>

        {/* Socratic AI Tutor Panel */}
        <section className="socratic-drawer rounded-2xl p-4 space-y-3">
          {/* Header with Toggle Button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#5E548E] text-white flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display text-[15px] font-bold text-[#2B1829] leading-tight">
                  Sokratik AI Tutor
                </h3>
                <p className="text-[11px] text-[#524534]">
                  Cevabı söylemez, düşündürür
                </p>
              </div>
            </div>

            <button
              type="button"
              data-cy="tutor-toggle-btn"
              onClick={onToggleTutor}
              className={`px-2.5 py-1 rounded-full font-mono text-[10.5px] font-bold border-2 border-[#2B1829] retro-chip cursor-pointer ${
                isTutorOpen
                  ? 'bg-[#5E548E] text-white'
                  : 'bg-[#FFF9E6] text-[#2B1829]'
              }`}
            >
              {isTutorOpen ? '⏸ Tutor Aktif (Kapat)' : '💬 Tutor Aç / Duraklat'}
            </button>
          </div>

          {/* Speech Bubble with Socratic Question */}
          <div className="relative bg-white rounded-xl p-3.5 border-2 border-[#2B1829] shadow-[3px_3px_0px_#2B1829]">
            <div className="flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-[#5E548E] shrink-0 mt-0.5" />
              <p
                data-cy="tutor-response"
                className="text-[13px] leading-relaxed text-[#2B1829] font-medium"
              >
                {tutorResponse}
              </p>
            </div>
          </div>

          {/* Quick Question Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {stage.quickChips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => askSocraticTutor(chip.prompt)}
                className="bg-[#FFF9E6] text-[#2B1829] font-mono text-[11px] font-bold px-3 py-1.5 rounded-full retro-chip flex items-center gap-1.5 cursor-pointer"
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Input Row */}
          <form onSubmit={handleTutorFormSubmit} className="flex gap-2">
            <input
              type="text"
              data-cy="tutor-input"
              value={tutorInput}
              onFocus={() => onForceOpenTutor()}
              onChange={(e) => {
                if (!isTutorOpen) onForceOpenTutor();
                setTutorInput(e.target.value);
              }}
              placeholder="Tutor'a hipotezini sor..."
              className="flex-1 min-w-0 h-[44px] rounded-xl bg-[#FFF9E6] border-2 border-[#2B1829] px-3 text-[13px] text-[#2B1829] placeholder:text-[#857462] focus:outline-none focus:ring-2 focus:ring-[#5E548E]"
            />
            <button
              type="submit"
              data-cy="tutor-send-btn"
              disabled={isSendingTutor}
              onClick={() => {
                if (!tutorInput.trim()) {
                  askSocraticTutor('Bu kararda hangi mühendislik riskini düşünmeliyim?');
                }
              }}
              className="h-[44px] px-4 rounded-xl bg-[#5E548E] text-white font-display text-[13px] font-bold retro-btn flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>Gönder</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </section>

        {/* Retro 70s Ornaments */}
        <RetroFooterOrnaments variant="stage" />
      </div>
    </div>
  );
};
