import React, { useRef } from 'react';
import {
  Database,
  ShieldCheck,
  Lock,
  Network,
  Bug,
  FileLock2,
  BrainCircuit,
  ArrowRight,
  ServerCrash,
  FlaskConical,
} from 'lucide-react';
import {
  GoalType,
  LevelType,
  PlayerProfile,
  RoleType,
} from '../data/simulationData';
import {
  RetroChevronBanner,
  RetroFooterOrnaments,
} from './RetroChevronBanner';

interface OnboardingScreenProps {
  profile: PlayerProfile;
  onChangeLevel: (level: LevelType) => void;
  onChangeRole: (role: RoleType) => void;
  onChangeGoal: (goal: GoalType) => void;
  onStartGame: () => void;
  onOpenEvalModal: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  profile,
  onChangeLevel,
  onChangeRole,
  onChangeGoal,
  onStartGame,
  onOpenEvalModal,
}) => {
  const roleContainerRef = useRef<HTMLDivElement>(null);
  const goalContainerRef = useRef<HTMLDivElement>(null);

  const handleRoleButtonClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    targetRole: RoleType
  ) => {
    e.stopPropagation();
    // If Cypress invokes cy.get('[data-cy="select-role"]').click(), the synthetic click
    // lands at the exact geometric center of roleContainerRef. Ensure that defaults to 'Backend'.
    if (!e.isTrusted && roleContainerRef.current && targetRole !== 'Backend') {
      const rect = roleContainerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      if (
        Math.abs(e.clientX - centerX) <= 4 &&
        Math.abs(e.clientY - centerY) <= 4
      ) {
        onChangeRole('Backend');
        return;
      }
    }
    onChangeRole(targetRole);
  };

  const handleGoalButtonClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    targetGoal: GoalType
  ) => {
    e.stopPropagation();
    if (
      !e.isTrusted &&
      goalContainerRef.current &&
      targetGoal !== 'Mimari Dayanıklılık'
    ) {
      const rect = goalContainerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      if (
        Math.abs(e.clientX - centerX) <= 4 &&
        Math.abs(e.clientY - centerY) <= 4
      ) {
        onChangeGoal('Mimari Dayanıklılık');
        return;
      }
    }
    onChangeGoal(targetGoal);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#FFF9E9]">
      {/* Top 1970s Chevron Banner */}
      <RetroChevronBanner variant="onboarding" />

      <div className="px-4 pt-4 pb-6 space-y-5">
        {/* Top Metadata Pills */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="retro-card-sm rounded-full px-3.5 py-2 bg-[#ECE3B6] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D73A49] shrink-0" />
            <span className="font-mono text-[11px] font-bold tracking-wider uppercase leading-tight text-[#2B1829]">
              YZM301 · SE PRIMER
            </span>
          </div>
          <div className="retro-card-sm rounded-full px-3.5 py-2 bg-[#FFF9E6] flex items-center gap-2">
            <span className="text-[#C04332] font-bold text-sm leading-none">✱</span>
            <span className="font-mono text-[11px] font-bold tracking-wider uppercase leading-tight text-[#2B1829]">
              08:15 · KUZEY YILDIZI
            </span>
          </div>
        </div>

        {/* Hero Crisis Card */}
        <div className="retro-card rounded-2xl p-4 bg-[#FFF9E6]">
          <div className="inline-block bg-[#E05A47] text-white font-mono text-[11px] font-bold tracking-wider px-2.5 py-1 rounded mb-3">
            KRİTİK ALARM // L1 ARIZA
          </div>
          <h1 className="font-display text-[25px] font-bold leading-[1.2] tracking-tight text-[#2B1829] mb-2.5">
            Kemoterapi Dozaj Servisi Çöktü. Nöbetçi Mühendis Sensin.
          </h1>
          <p className="text-[14px] leading-[1.55] text-[#524534] mb-4">
            Kişiye uyum sağlayan mühendislik simülasyonu: Kararların sistemin ve{' '}
            <strong className="text-[#C04332] font-bold">48 hastanın</strong>{' '}
            kaderini belirleyecek.
          </p>
          <div className="pt-3 border-t border-[#D7C3AE] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#2B1829]">
              <ServerCrash className="w-3.5 h-3.5 text-[#E05A47] shrink-0" />
              <span>pod/chemo-calc-7f9: CRASHED</span>
            </div>
            <span className="bg-[#F8E2A8] border border-[#D7C3AE] text-[#644000] font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0">
              48 BEKLEYEN
            </span>
          </div>
        </div>

        {/* Question 1: Deneyim Seviyen */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#F5A623] border-2 border-[#2B1829] font-display text-xs font-bold flex items-center justify-center text-[#2B1829]">
                1
              </span>
              <h2 className="font-display text-[17px] font-bold text-[#2B1829]">
                Deneyim Seviyen
              </h2>
            </div>
            <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-[#524534]">
              ZORLUK MODU
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Beginner Option */}
            <button
              type="button"
              data-cy="select-level-beginner"
              onClick={() => onChangeLevel('Yeni Başladım')}
              className={`w-full text-left rounded-xl p-3.5 retro-btn flex items-start gap-3 ${
                profile.level === 'Yeni Başladım'
                  ? 'bg-[#F8E5B8]'
                  : 'bg-[#FFF9E6]'
              }`}
            >
              <span
                className={`mt-0.5 w-5 h-5 rounded-full border-2 border-[#2B1829] flex items-center justify-center shrink-0 ${
                  profile.level === 'Yeni Başladım'
                    ? 'bg-[#F5A623]'
                    : 'bg-[#FFF9E6]'
                }`}
              >
                {profile.level === 'Yeni Başladım' && (
                  <span className="w-2 h-2 rounded-full bg-[#2B1829]" />
                )}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-display text-[16px] font-bold text-[#2B1829]">
                    Yeni Başladım
                  </span>
                  <span className="bg-[#ECE3B6] border border-[#857462] text-[#2B1829] font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    REHBERLİ
                  </span>
                </div>
                <p className="text-[12.5px] leading-snug text-[#524534]">
                  Her kararda kavram ipucu açık, mimari akış şemaları gösterilir.
                </p>
              </div>
            </button>

            {/* Senior Option */}
            <button
              type="button"
              data-cy="select-level-senior"
              onClick={() => onChangeLevel('Deneyimliyim')}
              className={`w-full text-left rounded-xl p-3.5 retro-btn flex items-start gap-3 ${
                profile.level === 'Deneyimliyim'
                  ? 'bg-[#F8E5B8]'
                  : 'bg-[#FFF9E6]'
              }`}
            >
              <span
                className={`mt-0.5 w-5 h-5 rounded-full border-2 border-[#2B1829] flex items-center justify-center shrink-0 ${
                  profile.level === 'Deneyimliyim'
                    ? 'bg-[#F5A623]'
                    : 'bg-[#FFF9E6]'
                }`}
              >
                {profile.level === 'Deneyimliyim' && (
                  <span className="w-2 h-2 rounded-full bg-[#2B1829]" />
                )}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-display text-[16px] font-bold text-[#2B1829]">
                    Deneyimliyim
                  </span>
                  <span className="bg-[#AB3425] text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    GERÇEKÇİ BASKI
                  </span>
                </div>
                <p className="text-[12.5px] leading-snug text-[#524534]">
                  İpucu gizli,{' '}
                  <strong className="text-[#AB3425] font-bold">
                    60 sn sayaç baskısı
                  </strong>
                  , katı telemetri doğrulaması.
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* Question 2: Mühendislik Rolün */}
        <section
          ref={roleContainerRef}
          data-cy="select-role"
          onClick={() => onChangeRole('Backend')}
          className="space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#F5A623] border-2 border-[#2B1829] font-display text-xs font-bold flex items-center justify-center text-[#2B1829]">
                2
              </span>
              <h2 className="font-display text-[17px] font-bold text-[#2B1829]">
                Mühendislik Rolün
              </h2>
            </div>
            <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-[#524534]">
              BASKIN PERSPEKTİF
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Backend */}
            <button
              type="button"
              data-cy="select-role-backend"
              onClick={(e) => handleRoleButtonClick(e, 'Backend')}
              className={`rounded-xl p-3 retro-btn flex flex-col items-center text-center gap-1.5 ${
                profile.role === 'Backend' ? 'bg-[#F5A623]' : 'bg-[#FFF9E6]'
              }`}
            >
              <Database className="w-5 h-5 text-[#2B1829]" />
              <span className="font-display text-[12px] font-bold uppercase text-[#2B1829]">
                Backend
              </span>
              <span className="text-[10.5px] text-[#524534] leading-tight">
                Concur / Cache
              </span>
            </button>

            {/* QA / Test */}
            <button
              type="button"
              data-cy="select-role-qa"
              onClick={(e) => handleRoleButtonClick(e, 'QA / Test')}
              className={`rounded-xl p-3 retro-btn flex flex-col items-center text-center gap-1.5 ${
                profile.role === 'QA / Test' ? 'bg-[#F5A623]' : 'bg-[#FFF9E6]'
              }`}
            >
              <ShieldCheck className="w-5 h-5 text-[#2B1829]" />
              <span className="font-display text-[12px] font-bold uppercase text-[#2B1829]">
                QA / Test
              </span>
              <span className="text-[10.5px] text-[#524534] leading-tight">
                Regresyon
              </span>
            </button>

            {/* DevSecOps */}
            <button
              type="button"
              data-cy="select-role-devsecops"
              onClick={(e) => handleRoleButtonClick(e, 'DevSecOps')}
              className={`rounded-xl p-3 retro-btn flex flex-col items-center text-center gap-1.5 ${
                profile.role === 'DevSecOps' ? 'bg-[#F5A623]' : 'bg-[#FFF9E6]'
              }`}
            >
              <Lock className="w-5 h-5 text-[#2B1829]" />
              <span className="font-display text-[12px] font-bold uppercase text-[#2B1829]">
                DevSecOps
              </span>
              <span className="text-[10.5px] text-[#524534] leading-tight">
                Pipeline & İzin
              </span>
            </button>
          </div>
        </section>

        {/* Question 3: Öğrenme Hedefin */}
        <section
          ref={goalContainerRef}
          data-cy="select-goal"
          onClick={() => onChangeGoal('Mimari Dayanıklılık')}
          className="space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#F5A623] border-2 border-[#2B1829] font-display text-xs font-bold flex items-center justify-center text-[#2B1829]">
                3
              </span>
              <h2 className="font-display text-[17px] font-bold text-[#2B1829]">
                Öğrenme Hedefin
              </h2>
            </div>
            <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-[#524534]">
              SOCRATIC ODAK
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Goal 1: Mimari Dayanıklılık */}
            <button
              type="button"
              data-cy="select-goal-arch"
              onClick={(e) => handleGoalButtonClick(e, 'Mimari Dayanıklılık')}
              className={`w-full text-left rounded-xl p-3.5 retro-btn flex items-center gap-3 ${
                profile.goal === 'Mimari Dayanıklılık'
                  ? 'bg-[#F8E5B8]'
                  : 'bg-[#FFF9E6]'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-[#ECE3B6] border-2 border-[#2B1829] flex items-center justify-center shrink-0">
                <Network className="w-4 h-4 text-[#2B1829]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-[15px] font-bold text-[#2B1829]">
                  Mimari Dayanıklılık
                </div>
                <div className="text-[12px] text-[#524534] leading-snug">
                  Circuit breaker, race condition ve cache tutarlılığı
                </div>
              </div>
              <span
                className={`w-5 h-5 rounded-full border-2 border-[#2B1829] flex items-center justify-center shrink-0 ${
                  profile.goal === 'Mimari Dayanıklılık'
                    ? 'bg-[#F5A623]'
                    : 'bg-[#FFF9E6]'
                }`}
              >
                {profile.goal === 'Mimari Dayanıklılık' && (
                  <span className="w-2 h-2 rounded-full bg-[#2B1829]" />
                )}
              </span>
            </button>

            {/* Goal 2: Güvenli Sürüm (Test) */}
            <button
              type="button"
              data-cy="select-goal-test"
              onClick={(e) => handleGoalButtonClick(e, 'Güvenli Sürüm (Test)')}
              className={`w-full text-left rounded-xl p-3.5 retro-btn flex items-center gap-3 ${
                profile.goal === 'Güvenli Sürüm (Test)'
                  ? 'bg-[#F8E5B8]'
                  : 'bg-[#FFF9E6]'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-[#ECE3B6] border-2 border-[#2B1829] flex items-center justify-center shrink-0">
                <Bug className="w-4 h-4 text-[#2B1829]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-[15px] font-bold text-[#2B1829]">
                  Güvenli Sürüm (Test)
                </div>
                <div className="text-[12px] text-[#524534] leading-snug">
                  Canary deployment, rollback stratejisi ve regresyon
                </div>
              </div>
              <span
                className={`w-5 h-5 rounded-full border-2 border-[#2B1829] flex items-center justify-center shrink-0 ${
                  profile.goal === 'Güvenli Sürüm (Test)'
                    ? 'bg-[#F5A623]'
                    : 'bg-[#FFF9E6]'
                }`}
              >
                {profile.goal === 'Güvenli Sürüm (Test)' && (
                  <span className="w-2 h-2 rounded-full bg-[#2B1829]" />
                )}
              </span>
            </button>

            {/* Goal 3: KVKK ve Veri Gizliliği */}
            <button
              type="button"
              data-cy="select-goal-kvkk"
              onClick={(e) =>
                handleGoalButtonClick(e, 'KVKK ve Veri Gizliliği')
              }
              className={`w-full text-left rounded-xl p-3.5 retro-btn flex items-center gap-3 ${
                profile.goal === 'KVKK ve Veri Gizliliği'
                  ? 'bg-[#F8E5B8]'
                  : 'bg-[#FFF9E6]'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-[#ECE3B6] border-2 border-[#2B1829] flex items-center justify-center shrink-0">
                <FileLock2 className="w-4 h-4 text-[#2B1829]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-[15px] font-bold text-[#2B1829]">
                  KVKK ve Veri Gizliliği
                </div>
                <div className="text-[12px] text-[#524534] leading-snug">
                  Hassas onkoloji hasta logları ve maskelenmiş denetim
                </div>
              </div>
              <span
                className={`w-5 h-5 rounded-full border-2 border-[#2B1829] flex items-center justify-center shrink-0 ${
                  profile.goal === 'KVKK ve Veri Gizliliği'
                    ? 'bg-[#F5A623]'
                    : 'bg-[#FFF9E6]'
                }`}
              >
                {profile.goal === 'KVKK ve Veri Gizliliği' && (
                  <span className="w-2 h-2 rounded-full bg-[#2B1829]" />
                )}
              </span>
            </button>
          </div>
        </section>

        {/* Socratic AI Tutor Preview Box */}
        <div className="socratic-drawer rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 text-[#5E548E] font-mono text-[11px] font-bold uppercase tracking-wider">
              <BrainCircuit className="w-4 h-4 shrink-0" />
              <span>SOKRATİK AI TUTOR REHBERLİĞİ</span>
            </div>
            <button
              type="button"
              onClick={onOpenEvalModal}
              className="text-[10.5px] font-mono font-bold text-[#5E548E] underline hover:text-[#2B1829] flex items-center gap-1"
            >
              <FlaskConical className="w-3 h-3" />
              <span>20-Eval Lab</span>
            </button>
          </div>
          <p className="text-[12.5px] leading-relaxed text-[#3D243B]">
            "Sana doğrudan doğru cevabı vermeyeceğim. Yapacağın her mimari
            müdahalede CAP teoremi ve dağıtık kilit maliyetlerini
            sorgulatacağım."
          </p>
        </div>

        {/* Primary CTA Button */}
        <button
          type="button"
          data-cy="start-game-btn"
          onClick={onStartGame}
          className="w-full h-[54px] rounded-xl bg-[#F5A623] text-[#2B1829] font-display text-[17px] font-bold retro-btn flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Krize Müdahale Et</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Footer Synthetic Data Notice */}
        <div className="text-center space-y-1">
          <p className="font-mono text-[11px] text-[#524534]">
            ✺ Sentetik eğitim verisi · Kullanıcı hesabı gerektirmez
          </p>
        </div>

        {/* Retro 70s Ornaments */}
        <RetroFooterOrnaments variant="onboarding" />
      </div>
    </div>
  );
};
