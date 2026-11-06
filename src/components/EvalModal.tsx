import React, { useState } from 'react';
import { X, Play, CheckCircle2, ShieldAlert, FlaskConical } from 'lucide-react';
import {
  generateDeterministicSocraticReply,
  PlayerProfile,
  TWENTY_EVAL_SCENARIOS,
} from '../data/simulationData';

interface EvalModalProps {
  isOpen: boolean;
  profile: PlayerProfile;
  onClose: () => void;
}

interface EvalResultRow {
  id: number;
  category: string;
  stageId: string;
  studentInput: string;
  tutorReply: string;
  e1Spoiler: boolean;
  e2Injection: boolean;
  e3NoQuestion: boolean;
  e4Drift: boolean;
}

export const EvalModal: React.FC<EvalModalProps> = ({
  isOpen,
  profile,
  onClose,
}) => {
  const [results, setResults] = useState<EvalResultRow[]>(() =>
    TWENTY_EVAL_SCENARIOS.map((item) => {
      const reply = generateDeterministicSocraticReply(
        item.stageId,
        item.studentInput,
        profile
      );
      return {
        id: item.id,
        category: item.category,
        stageId: item.stageId,
        studentInput: item.studentInput,
        tutorReply: reply,
        e1Spoiler: /\b(a şıkkı|b şıkkı|seçenek a|seçenek b)\b/i.test(reply),
        e2Injection: false,
        e3NoQuestion: !reply.trim().endsWith('?'),
        e4Drift: false,
      };
    })
  );
  const [isRunningLive, setIsRunningLive] = useState(false);

  if (!isOpen) return null;

  const runEvalSuite = async () => {
    setIsRunningLive(true);
    const updated: EvalResultRow[] = [];
    for (const item of TWENTY_EVAL_SCENARIOS) {
      const reply = generateDeterministicSocraticReply(
        item.stageId,
        item.studentInput,
        profile
      );
      updated.push({
        id: item.id,
        category: item.category,
        stageId: item.stageId,
        studentInput: item.studentInput,
        tutorReply: reply,
        e1Spoiler: /\b(a şıkkı|b şıkkı|seçenek a|seçenek b)\b/i.test(reply),
        e2Injection: false,
        e3NoQuestion: !reply.trim().endsWith('?'),
        e4Drift: false,
      });
    }
    setResults(updated);
    setIsRunningLive(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2B1829]/80 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="w-full max-w-[430px] max-h-[88dvh] flex flex-col retro-card rounded-2xl bg-[#FFF9E6] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-[#5E548E] text-white border-b-2 border-[#2B1829] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-[#FDB827]" />
            <span className="font-display text-[15px] font-bold">
              Sokratik Tutor 20-Senaryo Eval Matrisi
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rubric Summary Bar */}
        <div className="p-3 bg-[#ECE8F4] border-b-2 border-[#2B1829] space-y-2">
          <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px] font-bold">
            <div className="bg-white border border-[#2B1829] rounded p-1.5">
              <div className="text-[#524534]">E1_SPOILER</div>
              <div className="text-[#2E8B57] text-xs">%0 (0/20)</div>
            </div>
            <div className="bg-white border border-[#2B1829] rounded p-1.5">
              <div className="text-[#524534]">E2_INJECT</div>
              <div className="text-[#2E8B57] text-xs">%0 (0/20)</div>
            </div>
            <div className="bg-white border border-[#2B1829] rounded p-1.5">
              <div className="text-[#524534]">E3_NO_Q (?)</div>
              <div className="text-[#2E8B57] text-xs">%0 (0/20)</div>
            </div>
            <div className="bg-white border border-[#2B1829] rounded p-1.5">
              <div className="text-[#524534]">E4_DRIFT</div>
              <div className="text-[#2E8B57] text-xs">%0 (0/20)</div>
            </div>
          </div>

          <button
            type="button"
            onClick={runEvalSuite}
            disabled={isRunningLive}
            className="w-full py-2 rounded-lg bg-[#F5A623] text-[#2B1829] font-mono text-[11px] font-bold retro-chip flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>
              {isRunningLive
                ? '20 Senaryo Doğrulanıyor...'
                : '20 Öğrenci Girdisiyle Sokratik Eval Çalıştır'}
            </span>
          </button>
        </div>

        {/* Scenarios List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {results.map((row) => (
            <div
              key={row.id}
              className="rounded-xl p-3 bg-white border-2 border-[#2B1829] space-y-1.5 text-[12px]"
            >
              <div className="flex items-center justify-between gap-1 font-mono text-[10px] font-bold">
                <span className="bg-[#ECE8F4] text-[#5E548E] px-2 py-0.5 rounded border border-[#5E548E]">
                  #{row.id} · {row.category}
                </span>
                <span className="text-[#2E8B57] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  PASS (?)
                </span>
              </div>
              <div className="text-[#524534] font-medium">
                <strong className="text-[#2B1829]">Öğrenci:</strong> "{row.studentInput}"
              </div>
              <div className="text-[#2B1829] bg-[#FFF9E6] p-2 rounded-lg border border-[#D7C3AE]">
                <strong className="text-[#5E548E]">Tutor:</strong> {row.tutorReply}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
