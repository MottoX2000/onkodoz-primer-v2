import React, { useState, useEffect } from 'react';
import {
  DecisionChoice,
  GameStateId,
  GoalType,
  LevelType,
  PlayerProfile,
  RoleType,
  STAGES,
} from './data/simulationData';
import { OnboardingScreen } from './components/OnboardingScreen';
import { CrisisStageScreen } from './components/CrisisStageScreen';
import { EndingScreen } from './components/EndingScreen';
import { EvalModal } from './components/EvalModal';
import { ParityScreen } from './components/ParityScreen';
import { DECISION_THRESHOLD, FeatureVector, predictRisk } from './model/primerModel';
import { appendRow, downloadCsv, newSessionId } from './model/telemetry';

const IS_PARITY = new URLSearchParams(window.location.search).get('parite') === '1';
const STAGE_NO: Record<string, number> = { S1_Karar1_Mimari: 1, S2_Karar2_Test: 2, S3_Karar3_KVKK: 3 };

export default function App() {
  if (IS_PARITY) return <ParityScreen />;
  return <Game />;
}

function Game() {
  const [gameState, setGameState] = useState<GameStateId>('S0_Giris_Profil');

  const [profile, setProfile] = useState<PlayerProfile>({
    level: 'Deneyimliyim',
    role: 'Backend',
    goal: 'Mimari Dayanıklılık',
  });

  const [decisions, setDecisions] = useState<DecisionChoice[]>([]);
  const [selectedOption, setSelectedOption] = useState<DecisionChoice | null>(
    null
  );
  const [timedOut, setTimedOut] = useState(false);
  const [timer, setTimer] = useState<number>(60);
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState<boolean>(false);

  // v2.0 model telemetrisi (spec 9.1)
  const [sessionId, setSessionId] = useState(newSessionId());
  const [tutorOpenCount, setTutorOpenCount] = useState(0);
  const [prevDecisionSec, setPrevDecisionSec] = useState(0);
  const [stageStart, setStageStart] = useState(Date.now());
  const [decisionSec, setDecisionSec] = useState<number | null>(null);
  const [stageFeatures, setStageFeatures] = useState<FeatureVector | null>(null);
  const [riskP, setRiskP] = useState<number | null>(null);

  const isDecisionStage =
    gameState === 'S1_Karar1_Mimari' ||
    gameState === 'S2_Karar2_Test' ||
    gameState === 'S3_Karar3_KVKK';

  // 60s Countdown Timer for 'Deneyimliyim' mode (pauses when Tutor is open or decision is made)
  useEffect(() => {
    if (!isDecisionStage) return;
    if (profile.level !== 'Deneyimliyim') return;
    if (selectedOption !== null) return;
    if (isTutorOpen) return;

    if (timer <= 0) {
      // Spec 4.1: TIMEOUT -> Automatically selects B (risky/faulty choice)
      setTimedOut(true);
      setSelectedOption('B');
      setDecisionSec(Math.round((Date.now() - stageStart) / 100) / 10);
      return;
    }

    const intervalId = window.setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isDecisionStage, profile.level, selectedOption, isTutorOpen, timer]);

  // Sahne acildiginda: ozellikleri sabitle ve (sahne 2-3'te) modeli calistir.
  useEffect(() => {
    if (!isDecisionStage) return;
    const sahne = STAGE_NO[gameState];
    const x: FeatureVector = [
      profile.level === 'Deneyimliyim' ? 1 : 0,
      sahne,
      decisions.filter((d) => d === 'B').length,
      sahne === 1 ? 0 : prevDecisionSec,
      tutorOpenCount,
    ];
    setStageFeatures(x);
    setStageStart(Date.now());
    setDecisionSec(null);
    setRiskP(null);
    if (sahne === 1) return; // spec 9.1: 1. sahnede model devre disi
    let cancelled = false;
    predictRisk(x)
      .then(({ p }) => {
        if (cancelled) return;
        setRiskP(p);
        if (p >= DECISION_THRESHOLD && profile.level === 'Deneyimliyim') {
          setTimer((t) => t + 30); // sure baskisini hafiflet
        }
      })
      .catch((e) => console.warn('Model calistirilamadi, v1 davranisi suruyor', e));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  const openTutorCounted = (next: boolean) => {
    if (next && !isTutorOpen) setTutorOpenCount((c) => c + 1);
    setIsTutorOpen(next);
  };

  const handleStartGame = () => {
    setSessionId(newSessionId());
    setTutorOpenCount(0);
    setPrevDecisionSec(0);
    setDecisions([]);
    setSelectedOption(null);
    setTimedOut(false);
    setTimer(60);
    setIsTutorOpen(false);
    setGameState('S1_Karar1_Mimari');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleSelectOption = (choice: DecisionChoice) => {
    if (selectedOption !== null) return;
    setTimedOut(false);
    setSelectedOption(choice);
    setDecisionSec(Math.round((Date.now() - stageStart) / 100) / 10);
  };

  const handleNextStage = () => {
    const choiceToRecord: DecisionChoice = selectedOption ?? 'B';
    const nextDecisions = [...decisions, choiceToRecord];
    const sec = decisionSec ?? Math.round((Date.now() - stageStart) / 100) / 10;
    if (stageFeatures) {
      appendRow({
        oturum_id: sessionId,
        kaynak: 'gercek',
        seviye: stageFeatures[0],
        sahne_no: stageFeatures[1],
        onceki_riskli_sayisi: stageFeatures[2],
        onceki_karar_suresi_sn: stageFeatures[3],
        tutor_acma_sayisi: stageFeatures[4],
        karar: timedOut ? 'SURE_ASIMI' : choiceToRecord,
        karar_suresi_sn: sec,
        riskli_karar: choiceToRecord === 'B' ? 1 : 0,
      });
    }
    setPrevDecisionSec(sec);
    setDecisions(nextDecisions);
    setSelectedOption(null);
    setTimedOut(false);
    setTimer(60);
    setIsTutorOpen(false);

    if (gameState === 'S1_Karar1_Mimari') {
      setGameState('S2_Karar2_Test');
    } else if (gameState === 'S2_Karar2_Test') {
      setGameState('S3_Karar3_KVKK');
    } else if (gameState === 'S3_Karar3_KVKK') {
      const isAllA =
        nextDecisions.length === 3 &&
        nextDecisions.every((d) => d === 'A');
      setGameState(isAllA ? 'SON_A_IYI' : 'SON_B_KOTU');
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleRestartGame = () => {
    setDecisions([]);
    setSelectedOption(null);
    setTimedOut(false);
    setTimer(60);
    setIsTutorOpen(false);
    setGameState('S0_Giris_Profil');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleChangeLevel = (level: LevelType) => {
    setProfile((prev) => ({ ...prev, level }));
  };

  const handleChangeRole = (role: RoleType) => {
    setProfile((prev) => ({ ...prev, role }));
  };

  const handleChangeGoal = (goal: GoalType) => {
    setProfile((prev) => ({ ...prev, goal }));
  };

  const finalDecisionsTuple: [DecisionChoice, DecisionChoice, DecisionChoice] = [
    decisions[0] || 'A',
    decisions[1] || 'A',
    decisions[2] || 'A',
  ];

  return (
    <div className="min-h-dvh w-full bg-[#E3DBAE] flex justify-center items-start md:py-6">
      {/* Mobile-First Retro 70s Clinical Command Console Container */}
      <main className="w-full max-w-[440px] min-h-dvh md:min-h-[840px] bg-[#FFF9E9] md:rounded-[20px] md:border-[3px] md:border-[#2B1829] md:shadow-[8px_8px_0px_#2B1829] overflow-hidden flex flex-col">
        {gameState === 'S0_Giris_Profil' && (
          <OnboardingScreen
            profile={profile}
            onChangeLevel={handleChangeLevel}
            onChangeRole={handleChangeRole}
            onChangeGoal={handleChangeGoal}
            onStartGame={handleStartGame}
            onOpenEvalModal={() => setIsEvalModalOpen(true)}
          />
        )}

        {(gameState === 'S1_Karar1_Mimari' ||
          gameState === 'S2_Karar2_Test' ||
          gameState === 'S3_Karar3_KVKK') && (
          <CrisisStageScreen
            stage={STAGES[gameState]}
            profile={profile}
            previousChoice={
              decisions.length > 0 ? decisions[decisions.length - 1] : null
            }
            selectedOption={selectedOption}
            timedOut={timedOut}
            timer={timer}
            isTutorOpen={isTutorOpen}
            onToggleTutor={() => openTutorCounted(!isTutorOpen)}
            onForceOpenTutor={() => openTutorCounted(true)}
            riskP={riskP}
            modelActive={STAGE_NO[gameState] !== 1}
            onSelectOption={handleSelectOption}
            onNextStage={handleNextStage}
            onRestart={handleRestartGame}
          />
        )}

        {(gameState === 'SON_A_IYI' || gameState === 'SON_B_KOTU') && (
          <EndingScreen
            profile={profile}
            decisions={finalDecisionsTuple}
            onRestart={handleRestartGame}
          />
        )}

        {(gameState === 'SON_A_IYI' || gameState === 'SON_B_KOTU') && (
          <div className="px-4 pb-6">
            <button
              type="button"
              data-cy="download-csv"
              onClick={downloadCsv}
              className="w-full rounded-xl border-2 border-[#2B1829] bg-[#ECE3B6] py-2 font-mono text-[12px] font-bold text-[#2B1829]"
            >
              ⬇ Veri Toplama Modu: oturum CSV'sini indir (anonim)
            </button>
          </div>
        )}
      </main>

      <EvalModal
        isOpen={isEvalModalOpen}
        profile={profile}
        onClose={() => setIsEvalModalOpen(false)}
      />
    </div>
  );
}
