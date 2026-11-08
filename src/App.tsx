import React, { useState, useEffect } from 'react';
import { GameMode, KanaItem, PlayerProgress, Badge } from './types/game';
import { HIRAGANA_DATA, INITIAL_BADGES } from './data/kanaData';
import { sound } from './utils/audio';
import { TitleScreen } from './components/TitleScreen';
import { SchoolCanvas } from './components/SchoolCanvas';
import { School3DCanvas } from './components/School3DCanvas';
import { HiraganaKatakanaChart } from './components/HiraganaKatakanaChart';
import { StrokeOrderCanvas } from './components/StrokeOrderCanvas';
import { ChallengeHub } from './components/ChallengeHub';
import { ConversationModal } from './components/ConversationModal';
import { KanjiAndWordsModal } from './components/KanjiAndWordsModal';
import { CourseHub } from './components/CourseHub';
import { BadgeModal } from './components/BadgeModal';
import {
  Compass,
  BookOpen,
  Edit3,
  Award,
  MessageSquare,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  ChevronLeft,
  Eye,
  GraduationCap,
} from 'lucide-react';

const INITIAL_PROGRESS: PlayerProgress = {
  xp: 0,
  level: 1,
  sakuraCoins: 50,
  masteredChars: [],
  completedQuizzes: 0,
  perfectStrokes: 0,
  unlockedKatakana: true, // available from early game
  unlockedWords: true,
  unlockedKanji: false,
  unlockedConversations: true,
  currentRoom: 'classroom',
  completedLessons: [],
};

export default function App() {
  const [mode, setMode] = useState<GameMode>('TITLE');
  const [activeModal, setActiveModal] = useState<GameMode | null>(null);
  const [selectedKanaForWriting, setSelectedKanaForWriting] = useState<KanaItem>(
    HIRAGANA_DATA[0]
  );
  const [viewPerspective, setViewPerspective] = useState<'3d' | '2d'>('3d');
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nihongo_gakuen_progress');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_PROGRESS;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nihongo_gakuen_badges');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_BADGES;
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Save progress changes
  useEffect(() => {
    localStorage.setItem('nihongo_gakuen_progress', JSON.stringify(playerProgress));
  }, [playerProgress]);

  useEffect(() => {
    localStorage.setItem('nihongo_gakuen_badges', JSON.stringify(badges));
  }, [badges]);

  // Show floating XP / badge notification
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  // Add XP and handle level up
  const addXp = (amount: number, reason: string) => {
    setPlayerProgress((prev) => {
      const newXp = prev.xp + amount;
      const newLevel = Math.floor(newXp / 100) + 1;
      const leveledUp = newLevel > prev.level;

      if (leveledUp) {
        sound.playFanfare();
        showToast(`🎉 Parabéns! Você subiu para o Nível ${newLevel}! Novas lições desbloqueadas!`);
      } else {
        showToast(`+${amount} XP (${reason})`);
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        unlockedKanji: newLevel >= 2 ? true : prev.unlockedKanji,
      };
    });
  };

  // Unlock a badge
  const unlockBadge = (badgeId: string) => {
    setBadges((prev) =>
      prev.map((b) => {
        if (b.id === badgeId && !b.unlocked) {
          sound.playFanfare();
          showToast(`🏅 Nova Medalha Conquistada: "${b.title}"!`);
          return { ...b, unlocked: true };
        }
        return b;
      })
    );
  };

  // Stroke order completion callback
  const handleStrokeCompleted = (kana: KanaItem) => {
    addXp(25, `Traçado de ${kana.char}`);
    setPlayerProgress((prev) => {
      const updatedMastered = prev.masteredChars.includes(kana.id)
        ? prev.masteredChars
        : [...prev.masteredChars, kana.id];

      // Check vowels badge
      const vowels = ['h_a', 'h_i', 'h_u', 'h_e', 'h_o'];
      const hasAllVowels = vowels.every((v) => updatedMastered.includes(v));
      if (hasAllVowels) {
        unlockBadge('badge_vowels_master');
      }

      return {
        ...prev,
        masteredChars: updatedMastered,
        perfectStrokes: prev.perfectStrokes + 1,
      };
    });

    unlockBadge('badge_calligrapher');
    unlockBadge('badge_first_step');
  };

  // Object interactions from SchoolCanvas
  const handleInteractWithObject = (objectId: string) => {
    unlockBadge('badge_school_explorer');

    switch (objectId) {
      case 'fernanda':
        setActiveModal('CONVERSATION');
        break;
      case 'courses_podium':
        setActiveModal('COURSES');
        break;
      case 'blackboard':
        setActiveModal('KANA_CHART');
        break;
      case 'writing_desk':
        setActiveModal('STROKE_WRITING');
        break;
      case 'bookshelf':
        setActiveModal('WORDS_KANJI');
        break;
      case 'challenges_board':
        setActiveModal('CHALLENGE_QUIZ');
        break;
      case 'sakura_tree':
        sound.speakJapanese('さくらの木がきれいです');
        showToast('🌸 "Sakura no ki ga kirei desu" (A cerejeira está linda!)');
        break;
      case 'torii_shrine':
        sound.speakJapanese('鳥居');
        showToast('⛩️ "Torii" - Portal sagrado tradicional japonês!');
        break;
      default:
        break;
    }
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Global Esc key closes modal or returns to title
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeModal) {
          setActiveModal(null);
        } else if (mode === 'EXPLORE_SCHOOL') {
          setMode('TITLE');
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [activeModal, mode]);

  // Next/Prev Kana for stroke trainer
  const handleNextKana = () => {
    const currentList = selectedKanaForWriting.type === 'hiragana' ? HIRAGANA_DATA : HIRAGANA_DATA;
    const currentIndex = currentList.findIndex((k) => k.id === selectedKanaForWriting.id);
    const nextIndex = (currentIndex + 1) % currentList.length;
    setSelectedKanaForWriting(currentList[nextIndex]);
  };

  const handlePrevKana = () => {
    const currentList = selectedKanaForWriting.type === 'hiragana' ? HIRAGANA_DATA : HIRAGANA_DATA;
    const currentIndex = currentList.findIndex((k) => k.id === selectedKanaForWriting.id);
    const prevIndex = (currentIndex - 1 + currentList.length) % currentList.length;
    setSelectedKanaForWriting(currentList[prevIndex]);
  };

  const handleCompleteLesson = (lessonId: string, xpReward: number) => {
    addXp(xpReward, 'Lição Concluída');
    setPlayerProgress((prev) => {
      const alreadyDone = prev.completedLessons?.includes(lessonId);
      if (alreadyDone) return prev;
      return {
        ...prev,
        completedLessons: [...(prev.completedLessons || []), lessonId],
      };
    });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 font-sans text-stone-100 flex flex-col">
      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-stone-900/95 border border-amber-500/60 text-amber-300 px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md text-xs sm:text-sm font-bold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Mode View */}
      {mode === 'TITLE' ? (
        <TitleScreen
          onStartGame={() => setMode('EXPLORE_SCHOOL')}
          onOpenCourses={() => {
            setMode('EXPLORE_SCHOOL');
            setActiveModal('COURSES');
          }}
          onOpenHiragana={() => {
            setMode('EXPLORE_SCHOOL');
            setActiveModal('KANA_CHART');
          }}
          onOpenWriting={() => {
            setMode('EXPLORE_SCHOOL');
            setActiveModal('STROKE_WRITING');
          }}
          onOpenChallenges={() => {
            setMode('EXPLORE_SCHOOL');
            setActiveModal('CHALLENGE_QUIZ');
          }}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      ) : (
        /* Playing / School Exploration Mode */
        <div className="relative w-full h-full flex flex-col justify-between">
          {/* Top In-Game Bar (World-matched, Low-occlusion) */}
          <div className="relative z-30 w-full px-4 py-2.5 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between text-xs backdrop-blur-xs">
            {/* Left Brand & Exit to Title */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setMode('TITLE');
                }}
                className="flex items-center gap-1 text-stone-400 hover:text-amber-400 font-medium py-1 px-2 rounded-lg bg-stone-950/60 border border-stone-800 transition-colors"
                title="Voltar à tela inicial (Esc)"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Menu Principal</span>
              </button>
              <span className="text-stone-300 font-bold hidden md:inline">
                Nihongo Gakuen
              </span>
            </div>

            {/* Quick Action Navigation Hub */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveModal('COURSES');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeModal === 'COURSES'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'bg-stone-800 text-stone-300 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Cursos</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveModal('KANA_CHART');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeModal === 'KANA_CHART'
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-stone-800 text-stone-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Kanas (46)</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveModal('STROKE_WRITING');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeModal === 'STROKE_WRITING'
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-stone-800 text-stone-300 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 text-pink-400" />
                <span className="hidden sm:inline">Traçados</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveModal('CHALLENGE_QUIZ');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeModal === 'CHALLENGE_QUIZ'
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-stone-800 text-stone-300 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Desafios</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveModal('CONVERSATION');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeModal === 'CONVERSATION'
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-stone-800 text-stone-300 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Fernanda</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveModal('WORDS_KANJI');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeModal === 'WORDS_KANJI'
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-stone-800 text-stone-300 hover:text-white'
                }`}
              >
                <span className="font-jp text-amber-300 font-bold">字</span>
                <span className="hidden sm:inline">Kanji</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveModal('MEDALS');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeModal === 'MEDALS'
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-stone-800 text-stone-300 hover:text-white'
                }`}
              >
                <span>🏅</span>
                <span className="hidden sm:inline">Medalhas</span>
              </button>
            </div>

            {/* Right Controls: View Perspective & Mute Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setViewPerspective((v) => (v === '3d' ? '2d' : '3d'));
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-stone-950 border-stone-800 text-stone-300 hover:text-amber-400 active:scale-95"
                title="Alternar entre Gráficos 3D em 1ª Pessoa e Visão 2D"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">
                  {viewPerspective === '3d' ? '3D 1ª Pessoa' : 'Visão 2D'}
                </span>
              </button>

              <button
                onClick={handleToggleMute}
                className="p-1.5 text-stone-400 hover:text-stone-200 bg-stone-950 rounded-lg border border-stone-800"
                title="Mudo / Som [M]"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-amber-400" />
                )}
              </button>
            </div>
          </div>

          {/* School Exploration Canvas Viewport (3D First Person / 2D) */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-0">
            {viewPerspective === '3d' ? (
              <School3DCanvas
                onInteractWithObject={handleInteractWithObject}
                playerRoom={playerProgress.currentRoom}
                onChangeRoom={(room) =>
                  setPlayerProgress((p) => ({ ...p, currentRoom: room }))
                }
                xp={playerProgress.xp}
                level={playerProgress.level}
                masteredCount={playerProgress.masteredChars.length}
              />
            ) : (
              <SchoolCanvas
                onInteractWithObject={handleInteractWithObject}
                playerRoom={playerProgress.currentRoom}
                onChangeRoom={(room) =>
                  setPlayerProgress((p) => ({ ...p, currentRoom: room }))
                }
                xp={playerProgress.xp}
                level={playerProgress.level}
                masteredCount={playerProgress.masteredChars.length}
              />
            )}
          </div>
        </div>
      )}

      {/* MODAL OVERLAYS */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-5xl my-auto">
            {/* Close Button */}
            <button
              onClick={() => {
                sound.playClick();
                setActiveModal(null);
              }}
              className="absolute -top-3 -right-3 z-50 p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 shadow-xl transition-all active:scale-95"
              title="Fechar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content Switcher */}
            {activeModal === 'COURSES' && (
              <CourseHub
                completedLessons={playerProgress.completedLessons || []}
                onCompleteLesson={handleCompleteLesson}
                onClose={() => setActiveModal(null)}
              />
            )}

            {activeModal === 'KANA_CHART' && (
              <HiraganaKatakanaChart
                onSelectKanaForWriting={(kana) => {
                  setSelectedKanaForWriting(kana);
                  setActiveModal('STROKE_WRITING');
                }}
                masteredChars={playerProgress.masteredChars}
              />
            )}

            {activeModal === 'STROKE_WRITING' && (
              <StrokeOrderCanvas
                kana={selectedKanaForWriting}
                onComplete={handleStrokeCompleted}
                onNextKana={handleNextKana}
                onPrevKana={handlePrevKana}
              />
            )}

            {activeModal === 'CHALLENGE_QUIZ' && (
              <ChallengeHub
                onEarnXp={addXp}
                onUnlockBadge={unlockBadge}
                unlockedKatakana={playerProgress.unlockedKatakana}
              />
            )}

            {activeModal === 'CONVERSATION' && (
              <ConversationModal
                onClose={() => setActiveModal(null)}
                onEarnXp={addXp}
                onUnlockBadge={unlockBadge}
              />
            )}

            {activeModal === 'WORDS_KANJI' && (
              <KanjiAndWordsModal
                onClose={() => setActiveModal(null)}
                unlockedWords={playerProgress.unlockedWords}
                unlockedKanji={playerProgress.unlockedKanji}
                playerXp={playerProgress.xp}
              />
            )}

            {activeModal === 'MEDALS' && (
              <BadgeModal
                badges={badges}
                progress={playerProgress}
                onClose={() => setActiveModal(null)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
