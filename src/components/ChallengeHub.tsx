import React, { useState, useEffect } from 'react';
import { HIRAGANA_DATA, KATAKANA_DATA, VOCABULARY_LIST } from '../data/kanaData';
import { KanaItem, VocabularyWord } from '../types/game';
import { sound } from '../utils/audio';
import { Volume2, Award, CheckCircle2, XCircle, RotateCcw, Zap, Sparkles } from 'lucide-react';

interface ChallengeHubProps {
  onEarnXp: (amount: number, reason: string) => void;
  onUnlockBadge?: (badgeId: string) => void;
  unlockedKatakana: boolean;
}

type ChallengeType = 'RECOGNIZE_LETTERS' | 'LISTEN_SOUNDS' | 'REPEAT_WORDS' | 'CLASSROOM_QUESTIONS';

interface Question {
  prompt: string;
  subPrompt?: string;
  audioTarget?: string;
  options: { label: string; isCorrect: boolean }[];
  explanation: string;
  targetType: 'kana' | 'word' | 'trivia';
}

export const ChallengeHub: React.FC<ChallengeHubProps> = ({
  onEarnXp,
  onUnlockBadge,
  unlockedKatakana,
}) => {
  const [activeTab, setActiveTab] = useState<ChallengeType>('RECOGNIZE_LETTERS');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [isRoundFinished, setIsRoundFinished] = useState<boolean>(false);

  // Pool of available kanas based on player progress
  const kanaPool = unlockedKatakana ? [...HIRAGANA_DATA, ...KATAKANA_DATA] : HIRAGANA_DATA;

  // Generate Questions for the selected challenge type
  const generateQuestions = (type: ChallengeType) => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setCombo(0);
    setIsRoundFinished(false);

    if (type === 'RECOGNIZE_LETTERS') {
      const generated: Question[] = [];
      const shuffledKana = [...kanaPool].sort(() => Math.random() - 0.5).slice(0, 8);

      shuffledKana.forEach((targetKana) => {
        // Pick 3 wrong options
        const otherKanas = kanaPool
          .filter((k) => k.id !== targetKana.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        const options = [
          { label: targetKana.romaji, isCorrect: true },
          ...otherKanas.map((k) => ({ label: k.romaji, isCorrect: false })),
        ].sort(() => Math.random() - 0.5);

        generated.push({
          prompt: targetKana.char,
          subPrompt: `Qual é a leitura deste caractere ${targetKana.type === 'hiragana' ? 'Hiragana' : 'Katakana'}?`,
          audioTarget: targetKana.char,
          options,
          explanation: `${targetKana.char} lê-se "${targetKana.romaji}". Exemplo: ${targetKana.exampleWord.jp} (${targetKana.exampleWord.pt})`,
          targetType: 'kana',
        });
      });
      setQuestions(generated);
    } else if (type === 'LISTEN_SOUNDS') {
      const generated: Question[] = [];
      const shuffledKana = [...kanaPool].sort(() => Math.random() - 0.5).slice(0, 8);

      shuffledKana.forEach((targetKana) => {
        const otherKanas = kanaPool
          .filter((k) => k.id !== targetKana.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        const options = [
          { label: targetKana.char, isCorrect: true },
          ...otherKanas.map((k) => ({ label: k.char, isCorrect: false })),
        ].sort(() => Math.random() - 0.5);

        generated.push({
          prompt: 'Ouça o áudio com atenção',
          subPrompt: 'Toque para ouvir e escolha o caractere correspondente:',
          audioTarget: targetKana.char,
          options,
          explanation: `O som pronunciado foi "${targetKana.romaji}", representado por ${targetKana.char}.`,
          targetType: 'kana',
        });
      });
      setQuestions(generated);
    } else if (type === 'REPEAT_WORDS') {
      const generated: Question[] = [];
      const shuffledWords = [...VOCABULARY_LIST].sort(() => Math.random() - 0.5).slice(0, 6);

      shuffledWords.forEach((word) => {
        const otherWords = VOCABULARY_LIST.filter((w) => w.id !== word.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        const options = [
          { label: `${word.jp} (${word.romaji})`, isCorrect: true },
          ...otherWords.map((w) => ({ label: `${w.jp} (${w.romaji})`, isCorrect: false })),
        ].sort(() => Math.random() - 0.5);

        generated.push({
          prompt: `Significado: "${word.pt}"`,
          subPrompt: 'Como se diz e escreve esta palavra em japonês?',
          audioTarget: word.jp,
          options,
          explanation: `"${word.pt}" em japonês é ${word.jp} (${word.romaji}).`,
          targetType: 'word',
        });
      });
      setQuestions(generated);
    } else {
      // Classroom Questions / Trivia
      setQuestions([
        {
          prompt: 'Para que serve principalmente o alfabeto Katakana?',
          subPrompt: 'Pergunta da Professora Fernanda',
          options: [
            { label: 'Escrever palavras de origem estrangeira e nomes próprios', isCorrect: true },
            { label: 'Apenas para números e matemática', isCorrect: false },
            { label: 'Substituir os kanjis em livros sagrados', isCorrect: false },
            { label: 'Apenas para poesia antiga', isCorrect: false },
          ],
          explanation: 'O Katakana é empregado para palavras importadas de outros idiomas (ex: パン pan = pão, コーヒー kōhī = café) e onomatopeias.',
          targetType: 'trivia',
        },
        {
          prompt: 'Quantos caracteres básicos compõem o alfabeto Hiragana original?',
          subPrompt: 'Pergunta da Professora Fernanda',
          options: [
            { label: '46 caracteres', isCorrect: true },
            { label: '26 letras como no português', isCorrect: false },
            { label: '50 caracteres exatos', isCorrect: false },
            { label: 'Mais de 2.000', isCorrect: false },
          ],
          explanation: 'O Hiragana moderno possui 46 caracteres básicos organizados na tabela gojūon (5 vogais x consoantes).',
          targetType: 'trivia',
        },
        {
          prompt: 'Qual é a saudação matinal padrão usada na escola?',
          subPrompt: 'Pergunta da Professora Fernanda',
          audioTarget: 'おはようございます',
          options: [
            { label: 'おはようございます (Ohayou gozaimasu)', isCorrect: true },
            { label: 'こんばんは (Konbanwa)', isCorrect: false },
            { label: 'さようなら (Sayounara)', isCorrect: false },
            { label: 'いただきます (Itadakimasu)', isCorrect: false },
          ],
          explanation: '"Ohayou gozaimasu" é o "Bom dia" formal e respeitoso usado entre alunos e professores!',
          targetType: 'trivia',
        },
        {
          prompt: 'Por que a ordem dos traços (書き順 - Kakijun) é tão importante?',
          subPrompt: 'Pergunta da Professora Fernanda',
          options: [
            { label: 'Garante equilíbrio visual, legibilidade e velocidade na caligrafia', isCorrect: true },
            { label: 'Muda o som da letra se feita ao contrário', isCorrect: false },
            { label: 'É apenas uma tradição sem efeito prático', isCorrect: false },
            { label: 'Define se a palavra é masculina ou feminina', isCorrect: false },
          ],
          explanation: 'A ordem dos traços mantém as proporções harmônicas e facilita o reconhecimento de caracteres manuais e kanji.',
          targetType: 'trivia',
        },
      ]);
    }
  };

  useEffect(() => {
    generateQuestions(activeTab);
  }, [activeTab, unlockedKatakana]);

  const currentQ = questions[currentQuestionIndex];

  // Auto-play audio for listening questions
  useEffect(() => {
    if (currentQ?.audioTarget && activeTab === 'LISTEN_SOUNDS') {
      const timer = setTimeout(() => {
        sound.speakJapanese(currentQ.audioTarget!);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, currentQ, activeTab]);

  const handleSelectOption = (index: number) => {
    if (isAnswered || !currentQ) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = currentQ.options[index].isCorrect;

    if (isCorrect) {
      sound.playSuccess();
      const points = 15 + combo * 5;
      setScore((s) => s + points);
      setCombo((c) => c + 1);
      onEarnXp(points, 'Acerto no Desafio');

      if (combo >= 4 && onUnlockBadge) {
        onUnlockBadge('badge_sharp_ear');
      }
    } else {
      sound.playWrong();
      setCombo(0);
    }

    // Play target pronunciation
    if (currentQ.audioTarget) {
      setTimeout(() => {
        sound.speakJapanese(currentQ.audioTarget!);
      }, 500);
    }
  };

  const handleNextQuestion = () => {
    sound.playClick();
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsRoundFinished(true);
      sound.playFanfare();
    }
  };

  return (
    <div className="flex flex-col max-w-4xl mx-auto p-4 md:p-6 bg-stone-900/90 rounded-2xl border border-stone-800 shadow-2xl backdrop-blur-md">
      {/* Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-4 border-b border-stone-800">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('RECOGNIZE_LETTERS');
          }}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'RECOGNIZE_LETTERS'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          🔤 Reconhecer Letras
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('LISTEN_SOUNDS');
          }}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'LISTEN_SOUNDS'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          🎧 Ouvir Sons
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('REPEAT_WORDS');
          }}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'REPEAT_WORDS'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          🗣️ Repetir Palavras
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('CLASSROOM_QUESTIONS');
          }}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'CLASSROOM_QUESTIONS'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          ❓ Perguntas da Fernanda
        </button>
      </div>

      {/* Progress & Score Bar */}
      <div className="flex items-center justify-between py-3 text-xs text-stone-400">
        <div className="flex items-center gap-3">
          <span>
            Pergunta <strong className="text-stone-100">{currentQuestionIndex + 1}</strong> de{' '}
            {questions.length}
          </span>
          {combo > 1 && (
            <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-600/40">
              <Zap className="w-3.5 h-3.5 fill-amber-400" /> Combo x{combo}!
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="font-mono text-stone-200 font-semibold">{score} pts</span>
        </div>
      </div>

      {/* Main Question Card or Round Finish */}
      {!isRoundFinished && currentQ ? (
        <div className="flex flex-col items-center py-6 px-4 bg-stone-950/70 rounded-xl border border-stone-800/80 my-2">
          {/* Subprompt */}
          <span className="text-xs uppercase tracking-wider text-amber-400/90 font-medium mb-1">
            {currentQ.subPrompt}
          </span>

          {/* Main Prompt (Large Kana or Text) */}
          <div className="my-4 flex items-center justify-center gap-4">
            {currentQ.targetType === 'kana' && activeTab === 'RECOGNIZE_LETTERS' ? (
              <span className="font-jp text-7xl font-bold text-amber-300 drop-shadow-md">
                {currentQ.prompt}
              </span>
            ) : (
              <h3 className="text-xl md:text-2xl font-bold text-stone-100 text-center max-w-xl">
                {currentQ.prompt}
              </h3>
            )}

            {/* Audio Button */}
            {currentQ.audioTarget && (
              <button
                onClick={() => {
                  sound.playClick();
                  sound.speakJapanese(currentQ.audioTarget!);
                }}
                className="w-12 h-12 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center justify-center transition-all active:scale-90"
                title="Repetir áudio japonês"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Answer Options Grid */}
          <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              let btnClass = 'bg-stone-900 border-stone-800 text-stone-200 hover:border-amber-500/50 hover:bg-stone-800/50';

              if (isAnswered) {
                if (opt.isCorrect) {
                  btnClass = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 shadow-lg';
                } else if (isSelected && !opt.isCorrect) {
                  btnClass = 'bg-red-950/70 border-red-500 text-red-200';
                } else {
                  btnClass = 'opacity-40 border-stone-900 text-stone-500';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-xl border font-semibold text-center transition-all flex items-center justify-center gap-2 active:scale-95 ${btnClass}`}
                >
                  <span className="font-jp text-lg">{opt.label}</span>
                  {isAnswered && opt.isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {isAnswered && isSelected && !opt.isCorrect && (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation & Next Button */}
          {isAnswered && (
            <div className="w-full max-w-xl mt-5 p-3.5 bg-stone-900/90 rounded-xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
              <p className="text-xs text-stone-300">{currentQ.explanation}</p>
              <button
                onClick={handleNextQuestion}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs transition-transform active:scale-95 shadow-md shrink-0"
              >
                {currentQuestionIndex + 1 < questions.length ? 'Próxima Pergunta →' : 'Ver Resultado'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Round Finish Screen */
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center mb-4 text-3xl shadow-xl">
            🏆
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Desafio Concluído!</h3>
          <p className="text-sm text-stone-300 max-w-md mb-4">
            Você conquistou <strong className="text-amber-400">{score} pontos</strong> nesta rodada
            com a professora Fernanda!
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => generateQuestions(activeTab)}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm transition-transform active:scale-95 shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jogar Novamente</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
