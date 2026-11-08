import React, { useState } from 'react';
import { JAPANESE_COURSES } from '../data/coursesData';
import { Course, CourseLesson } from '../types/game';
import { sound } from '../utils/audio';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Volume2,
  Award,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Clock,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

interface CourseHubProps {
  completedLessons: string[];
  onCompleteLesson: (lessonId: string, xp: number) => void;
  onClose: () => void;
}

export const CourseHub: React.FC<CourseHubProps> = ({
  completedLessons = [],
  onCompleteLesson,
  onClose,
}) => {
  const [selectedCourse, setSelectedCourse] = useState<Course>(JAPANESE_COURSES[0]);
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);

  // Check if course is fully finished
  const isCourseFinished = selectedCourse.lessons.every((l) =>
    completedLessons.includes(l.id)
  );

  const completedCount = selectedCourse.lessons.filter((l) =>
    completedLessons.includes(l.id)
  ).length;

  const handleStartLesson = (lesson: CourseLesson) => {
    sound.playClick();
    setActiveLesson(lesson);
    setQuizAnswered(false);
    setSelectedOption(null);
    setShowCertificate(false);
    // Speak first example
    if (lesson.examples.length > 0) {
      setTimeout(() => {
        sound.speakJapanese(lesson.examples[0].jp);
      }, 500);
    }
  };

  const handleSelectQuizOption = (index: number) => {
    if (quizAnswered || !activeLesson) return;
    setSelectedOption(index);
    setQuizAnswered(true);

    const isCorrect = index === activeLesson.quiz.correctIndex;
    if (isCorrect) {
      sound.playSuccess();
      onCompleteLesson(activeLesson.id, activeLesson.xpReward);
    } else {
      sound.playWrong();
    }
  };

  const handleSpeakText = (text: string) => {
    sound.playClick();
    sound.speakJapanese(text);
  };

  return (
    <div className="flex flex-col max-w-5xl mx-auto p-4 md:p-6 bg-stone-900/95 rounded-2xl border border-stone-800 shadow-2xl backdrop-blur-md">
      {/* Top Header with Teacher Fernanda Photo Badge */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div className="flex items-center gap-3.5">
          {/* Realistic Photo Portrait of Fernanda with black hair */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-amber-500 shadow-lg shrink-0 bg-stone-950">
            <img
              src="/src/assets/images/fernanda_black_hair_photo_1794012261628.jpg"
              alt="Professora Fernanda"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 inset-x-0 bg-amber-500/90 text-stone-950 text-[9px] font-extrabold text-center py-0.2">
              SENSEI
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-400" />
              <h3 className="text-xl font-bold text-stone-100">
                Academia Nihongo com Fernanda
              </h3>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Cursos estruturados passo a passo para dominar leitura, escrita e conversação em japonês.
            </p>
          </div>
        </div>

        {/* Global Course Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {JAPANESE_COURSES.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                sound.playClick();
                setSelectedCourse(c);
                setActiveLesson(null);
                setShowCertificate(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCourse.id === c.id
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-800/80 text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>{c.icon}</span> <span className="ml-1">{c.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main View Area: Lesson Player OR Course Overview OR Certificate */}
      {showCertificate ? (
        /* ================= OFFICIAL CERTIFICATE VIEW ================= */
        <div className="my-6 p-6 sm:p-8 bg-stone-950 rounded-2xl border-4 border-amber-500/80 shadow-2xl relative text-center flex flex-col items-center">
          <div className="w-full border-b border-amber-500/40 pb-4 mb-4 flex items-center justify-between">
            <span className="font-jp text-amber-400 font-bold text-xl">日本語学園</span>
            <span className="text-xs font-mono uppercase tracking-widest text-stone-400">
              Certificado Oficial de Conclusão
            </span>
            <span className="font-jp text-amber-400 font-bold text-xl">公式修了証</span>
          </div>

          <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl mb-3 shadow-inner">
            🎓
          </div>

          <h4 className="text-xs uppercase tracking-widest text-amber-400 font-bold">
            Certificamos com Honra que o Aluno concluiu o
          </h4>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-2 font-jp">
            {selectedCourse.japaneseTitle}
          </h2>
          <h3 className="text-lg font-bold text-amber-300 mb-4">{selectedCourse.title}</h3>

          <p className="text-xs text-stone-300 max-w-md mb-6 leading-relaxed">
            Demonstrou dedicação exemplar na aprendizagem dos caracteres japoneses, pronúncia autêntica,
            ordem dos traços e cultura nipônica.
          </p>

          <div className="flex items-center justify-between w-full max-w-md pt-4 border-t border-stone-800">
            <div className="text-left">
              <span className="text-[10px] text-stone-500 block uppercase">Instrutora Responsável</span>
              <span className="text-sm font-bold text-stone-200">Fernanda Sensei (フェルナンダ)</span>
            </div>

            {/* Traditional Japanese Red Stamp (Hanko) */}
            <div className="w-14 h-14 rounded-lg border-2 border-red-600 text-red-500 font-jp font-bold flex flex-col items-center justify-center text-xs shadow-inner">
              <span>日本</span>
              <span>合格</span>
            </div>
          </div>

          <button
            onClick={() => setShowCertificate(false)}
            className="mt-6 px-6 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs rounded-xl border border-stone-700"
          >
            ← Voltar às Lições do Curso
          </button>
        </div>
      ) : activeLesson ? (
        /* ================= ACTIVE LESSON PLAYER ================= */
        <div className="my-4 flex flex-col gap-4 animate-fade-in">
          {/* Lesson Header Navigation */}
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <button
              onClick={() => {
                sound.playClick();
                setActiveLesson(null);
              }}
              className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Curso</span>
            </button>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeLesson.durationMinutes} min</span>
              <span className="text-stone-600">·</span>
              <span className="text-amber-400 font-bold">+{activeLesson.xpReward} XP</span>
            </div>
          </div>

          {/* Lesson Title */}
          <div>
            <h4 className="text-xl font-bold text-white">{activeLesson.title}</h4>
            <p className="text-xs text-stone-400 mt-1">{activeLesson.overview}</p>
          </div>

          {/* Teacher Fernanda's Teaching Card (with photo portrait) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-amber-500/30 flex flex-col sm:flex-row gap-4 items-start shadow-xl">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-md shrink-0 bg-stone-900">
              <img
                src="/src/assets/images/fernanda_black_hair_photo_1794012261628.jpg"
                alt="Professora Fernanda"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold text-amber-300">Explicação da Professora Fernanda</span>
                <span className="text-[10px] text-stone-500">· Dica de Ouro</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed italic">
                "{activeLesson.fernandaTeaching}"
              </p>
            </div>
          </div>

          {/* Audio Examples Strip */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Vocabulário e Frases Práticas (Toque para ouvir):
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {activeLesson.examples.map((ex, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSpeakText(ex.jp)}
                  className="p-3 bg-stone-950/80 hover:bg-stone-800/60 border border-stone-800 hover:border-amber-500/50 rounded-xl cursor-pointer transition-all active:scale-[0.98] flex items-center justify-between group"
                >
                  <div>
                    <span className="font-jp text-base font-bold text-amber-300 group-hover:text-amber-400 block">
                      {ex.jp}
                    </span>
                    <span className="text-[11px] font-mono text-stone-400 block">{ex.reading}</span>
                    <span className="text-xs text-stone-200 font-medium block mt-0.5">
                      {ex.meaningPt}
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-stone-900 border border-stone-800 group-hover:border-amber-500/50 flex items-center justify-center text-stone-400 group-hover:text-amber-400 shrink-0">
                    <Volume2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mini-Quiz Checkpoint for Lesson */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-950/90 border border-stone-800 mt-2">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                Desafio de Fixação da Aula:
              </span>
            </div>
            <h5 className="text-sm sm:text-base font-bold text-stone-100 mb-3">
              {activeLesson.quiz.question}
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeLesson.quiz.options.map((opt, i) => {
                const isSelected = selectedOption === i;
                let btnClass = 'bg-stone-900 border-stone-800 text-stone-300 hover:border-amber-500/50';

                if (quizAnswered) {
                  if (i === activeLesson.quiz.correctIndex) {
                    btnClass = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 shadow-lg';
                  } else if (isSelected) {
                    btnClass = 'bg-red-950/70 border-red-500 text-red-200';
                  } else {
                    btnClass = 'opacity-40 border-stone-900 text-stone-500';
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={quizAnswered}
                    onClick={() => handleSelectQuizOption(i)}
                    className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold text-left transition-all ${btnClass}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Quiz Feedback */}
            {quizAnswered && (
              <div className="mt-4 p-3 rounded-xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
                <p className="text-xs text-stone-300 leading-relaxed">
                  {activeLesson.quiz.explanation}
                </p>
                <button
                  onClick={() => setActiveLesson(null)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs transition-transform active:scale-95 shadow-md shrink-0"
                >
                  Concluir Lição (+{activeLesson.xpReward} XP)
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= COURSE OVERVIEW & LESSON LIST ================= */
        <div className="my-4">
          {/* Course Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-950/80 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {selectedCourse.levelBadge}
                </span>
                <span className="text-xs text-stone-400 font-jp">{selectedCourse.japaneseTitle}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">{selectedCourse.title}</h3>
              <p className="text-xs text-stone-300 mt-1 max-w-xl">{selectedCourse.description}</p>
            </div>

            <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
              <span className="text-xs text-stone-400">
                Progresso: <strong className="text-amber-400">{completedCount}</strong> /{' '}
                {selectedCourse.lessons.length} aulas
              </span>
              <div className="w-36 bg-stone-800 rounded-full h-2 overflow-hidden border border-stone-700">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(completedCount / selectedCourse.lessons.length) * 100}%`,
                  }}
                />
              </div>

              {isCourseFinished && (
                <button
                  onClick={() => setShowCertificate(true)}
                  className="mt-1 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ver Certificado Oficial</span>
                </button>
              )}
            </div>
          </div>

          {/* Lessons List Grid */}
          <div className="flex flex-col gap-3 max-h-[52vh] overflow-y-auto pr-1">
            {selectedCourse.lessons.map((lesson, idx) => {
              const isDone = completedLessons.includes(lesson.id);

              return (
                <div
                  key={lesson.id}
                  onClick={() => handleStartLesson(lesson)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all active:scale-[0.99] flex items-center justify-between group ${
                    isDone
                      ? 'bg-stone-950/60 border-emerald-500/40 hover:border-emerald-400'
                      : 'bg-stone-950/80 border-stone-800 hover:border-amber-500/50 hover:bg-stone-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                        isDone
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-600/50'
                          : 'bg-stone-900 text-stone-300 border-stone-800 group-hover:border-amber-500/50'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : idx + 1}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-stone-100 group-hover:text-amber-300">
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{lesson.overview}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-stone-400 font-mono hidden sm:inline">
                      {lesson.durationMinutes} min
                    </span>
                    <span className="text-xs font-bold text-amber-400 bg-amber-950/40 px-2 py-1 rounded-md border border-amber-900/40">
                      +{lesson.xpReward} XP
                    </span>
                    <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
