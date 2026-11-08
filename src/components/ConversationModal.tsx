import React, { useState, useEffect } from 'react';
import { DIALOGUE_SCENARIOS } from '../data/kanaData';
import { DialogueScenario, DialogueOption } from '../types/game';
import { sound } from '../utils/audio';
import { Volume2, MessageSquare, Award, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ConversationModalProps {
  onClose: () => void;
  onEarnXp: (amount: number, reason: string) => void;
  onUnlockBadge?: (badgeId: string) => void;
  initialScenarioId?: string;
}

export const ConversationModal: React.FC<ConversationModalProps> = ({
  onClose,
  onEarnXp,
  onUnlockBadge,
  initialScenarioId = 'scene_welcome',
}) => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [chosenOption, setChosenOption] = useState<DialogueOption | null>(null);
  const [showReply, setShowReply] = useState<boolean>(false);
  const [scenarioCompleted, setScenarioCompleted] = useState<boolean>(false);

  const scenario: DialogueScenario =
    DIALOGUE_SCENARIOS[selectedScenarioIndex] || DIALOGUE_SCENARIOS[0];
  const currentStep = scenario.steps[currentStepIndex];

  // Auto-speak Fernanda's line when step changes
  useEffect(() => {
    if (currentStep) {
      sound.speakJapanese(currentStep.fernandaJp);
      setChosenOption(null);
      setShowReply(false);
    }
  }, [selectedScenarioIndex, currentStepIndex]);

  const handleSelectOption = (option: DialogueOption) => {
    sound.playClick();
    setChosenOption(option);
    setShowReply(true);

    // Speak user's chosen Japanese phrase first, then Fernanda's reply
    sound.speakJapanese(option.textJp);
    setTimeout(() => {
      sound.speakJapanese(option.replyFernanda);
      sound.playSuccess();
      onEarnXp(option.xpReward, 'Conversação com Fernanda');
      if (onUnlockBadge) {
        onUnlockBadge('badge_fernanda_friend');
      }
    }, 1600);
  };

  const handleNextStep = () => {
    sound.playClick();
    if (currentStepIndex + 1 < scenario.steps.length) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setScenarioCompleted(true);
      sound.playFanfare();
    }
  };

  const handleSwitchScenario = (index: number) => {
    sound.playClick();
    setSelectedScenarioIndex(index);
    setCurrentStepIndex(0);
    setScenarioCompleted(false);
  };

  return (
    <div className="flex flex-col max-w-4xl mx-auto p-4 md:p-6 bg-stone-900/95 rounded-2xl border border-stone-800 shadow-2xl backdrop-blur-md">
      {/* Top Header & Scenario Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-bold text-stone-100">Conversação com Fernanda Sensei</h3>
          </div>
          <p className="text-xs text-stone-400">{scenario.context}</p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {DIALOGUE_SCENARIOS.map((sc, idx) => (
            <button
              key={sc.id}
              onClick={() => handleSwitchScenario(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedScenarioIndex === idx
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-stone-800/80 text-stone-400 hover:text-stone-200'
              }`}
            >
              {sc.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dialogue Stage */}
      {!scenarioCompleted ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-4 items-center">
          {/* Fernanda's Portrait */}
          <div className="md:col-span-4 flex flex-col items-center">
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-xl bg-stone-950">
              <img
                src="/src/assets/images/fernanda_black_hair_photo_1794012261628.jpg"
                alt="Professora Fernanda"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 inset-x-0 bg-stone-950/85 backdrop-blur-xs py-1 text-center">
                <span className="text-xs font-bold text-amber-300">Fernanda Sensei (フェルナンダ)</span>
              </div>
            </div>
            <button
              onClick={() => sound.speakJapanese(currentStep.fernandaJp)}
              className="mt-2 flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium py-1 px-3 rounded-lg bg-stone-800/60 border border-stone-700 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Ouvir Fernanda</span>
            </button>
          </div>

          {/* Dialogue Box */}
          <div className="md:col-span-8 flex flex-col gap-4">
            {/* Fernanda's Speech Bubble */}
            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 relative">
              <span className="font-jp text-lg sm:text-xl font-bold text-amber-300 block mb-1">
                {currentStep.fernandaJp}
              </span>
              <span className="text-xs text-stone-400 font-mono block mb-1">
                {currentStep.fernandaRomaji}
              </span>
              <p className="text-sm text-stone-200 italic border-t border-stone-800/80 pt-2">
                "{currentStep.fernandaPt}"
              </p>
            </div>

            {/* Response Options or Fernanda's Answer */}
            {!showReply ? (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Escolha como responder em japonês:
                </span>
                {currentStep.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(opt)}
                    className="p-3 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/80 hover:border-amber-500/60 text-left transition-all active:scale-[0.98] group"
                  >
                    <span className="font-jp text-sm sm:text-base font-bold text-stone-100 group-hover:text-amber-400 block">
                      {opt.textJp}
                    </span>
                    <span className="text-xs font-mono text-stone-400 block">{opt.romaji}</span>
                    <span className="text-xs text-stone-300 italic mt-1 block">"{opt.textPt}"</span>
                  </button>
                ))}
              </div>
            ) : (
              /* Fernanda's Reactive Answer */
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/40 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300 uppercase">
                    Resposta da Professora Fernanda:
                  </span>
                </div>
                <span className="font-jp text-base sm:text-lg font-bold text-emerald-100 block mb-1">
                  {chosenOption?.replyFernanda}
                </span>
                <span className="text-xs font-mono text-emerald-400/80 block mb-1">
                  {chosenOption?.replyRomaji}
                </span>
                <p className="text-xs text-stone-200 italic mb-3">"{chosenOption?.replyPt}"</p>

                <div className="flex items-center justify-between border-t border-emerald-900/40 pt-2">
                  <span className="text-xs text-amber-400 font-semibold">
                    +{chosenOption?.xpReward} XP ganhos!
                  </span>
                  <button
                    onClick={handleNextStep}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-transform active:scale-95 shadow-md"
                  >
                    <span>Continuar Diálogo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Scenario Completed Celebration */
        <div className="py-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-3xl mb-3">
            ✨
          </div>
          <h4 className="text-2xl font-bold text-white mb-2">Conversa Concluída com Sucesso!</h4>
          <p className="text-sm text-stone-300 max-w-md mb-6">
            Você praticou fala e compreensão com a professora Fernanda na Nihongo Gakuen!
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                setCurrentStepIndex(0);
                setScenarioCompleted(false);
              }}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs rounded-lg border border-stone-700"
            >
              Revisar Diálogo
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg shadow-md"
            >
              Voltar à Escola
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
