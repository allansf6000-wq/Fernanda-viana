import React, { useEffect } from 'react';
import { sound } from '../utils/audio';
import { Volume2, VolumeX, Sparkles, BookOpen, Compass, Award, GraduationCap } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenCourses: () => void;
  onOpenHiragana: () => void;
  onOpenWriting: () => void;
  onOpenChallenges: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenCourses,
  onOpenHiragana,
  onOpenWriting,
  onOpenChallenges,
  isMuted,
  onToggleMute,
}) => {
  // Listen for Enter or Space key to start game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        sound.playClick();
        onStartGame();
      } else if (e.key.toLowerCase() === 'm') {
        onToggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame, onToggleMute]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-stone-950 flex flex-col justify-between select-none">
      {/* Background Image with Scrim */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/src/assets/images/japanese_school_courtyard_1794010964094.jpg"
          alt="Pátio da Escola Japonesa"
          className="w-full h-full object-cover opacity-60 scale-105 transform animate-pulse duration-10000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/40" />
      </div>

      {/* Floating Cherry Blossom Petals Particle Animation in pure CSS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-4 bg-pink-300/60 rounded-full blur-[0.5px] pointer-events-none"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(${i * 25}deg)`,
              animation: `floatPetal ${6 + (i % 5) * 2}s linear infinite`,
              animationDelay: `${(i % 7) * 0.8}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes floatPetal {
          0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(105vh) translateX(60px) rotate(360deg); opacity: 0; }
        }
      `}</style>

      {/* Top Bar Status */}
      <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-xs uppercase tracking-widest text-stone-300 font-semibold font-mono">
            Nihongo Gakuen · Aventura com Fernanda
          </span>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onToggleMute();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-medium transition-colors backdrop-blur-xs"
          title="Ativar/Desativar Sons (M)"
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4 text-rose-400" />
              <span>Mudo</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Som Ativo</span>
            </>
          )}
        </button>
      </header>

      {/* Centerpiece Hero with Bespoke Inline SVG Title Lockup */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
        {/* Inline SVG Title Lockup with Japanese Calligraphy */}
        <div className="w-full max-w-md sm:max-w-lg mb-4 drop-shadow-2xl">
          <svg viewBox="0 0 540 140" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feComposite in="SourceGraphic" in2="glow" operator="over" />
              </filter>
            </defs>

            {/* Kanji Top Kicker */}
            <text
              x="270"
              y="38"
              textAnchor="middle"
              className="font-jp"
              fontSize="28"
              fontWeight="900"
              fill="#fbbf24"
              letterSpacing="12"
              filter="url(#glow)"
            >
              日本語学園
            </text>

            {/* Main Roman Title */}
            <text
              x="270"
              y="95"
              textAnchor="middle"
              fontFamily="Plus Jakarta Sans, sans-serif"
              fontSize="44"
              fontWeight="800"
              fill="url(#goldGradient)"
              letterSpacing="2"
            >
              NIHONGO GAKUEN
            </text>

            {/* Sub-line */}
            <text
              x="270"
              y="126"
              textAnchor="middle"
              fontFamily="Plus Jakarta Sans, sans-serif"
              fontSize="14"
              fontWeight="600"
              fill="#e7e5e4"
              letterSpacing="4"
            >
              A JORNADA JAPONESA COM FERNANDA
            </text>
          </svg>
        </div>

        {/* Short Subtitle */}
        <p className="text-stone-300 text-sm sm:text-base max-w-xl mb-8 font-medium leading-relaxed drop-shadow">
          Aprenda o alfabeto <strong className="text-amber-400">Hiragana</strong> (46 caracteres), o{' '}
          <strong className="text-amber-400">Katakana</strong>, explore a escola, converse com Fernanda e treine
          a ordem correta dos traços com áudio autêntico.
        </p>

        {/* Primary Start CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-6">
          <button
            onClick={() => {
              sound.playClick();
              onStartGame();
            }}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-base rounded-2xl shadow-xl shadow-amber-900/40 hover:shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center justify-center gap-2"
          >
            <Compass className="w-5 h-5" />
            <span>Explorar a Escola</span>
            <span className="text-xs bg-amber-950/30 text-amber-950 font-bold px-2 py-0.5 rounded ml-1">
              [Enter / Espaço]
            </span>
          </button>
        </div>

        {/* Quick Mode Direct Links */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onOpenCourses();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/40 backdrop-blur-xs transition-colors shadow-sm"
          >
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>Cursos da Fernanda</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenHiragana();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-900/80 hover:bg-stone-800 text-stone-200 rounded-xl text-xs font-semibold border border-stone-800 backdrop-blur-xs transition-colors"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Tabela Hiragana (46)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenWriting();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-900/80 hover:bg-stone-800 text-stone-200 rounded-xl text-xs font-semibold border border-stone-800 backdrop-blur-xs transition-colors"
          >
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>Simulador de Traços</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenChallenges();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-900/80 hover:bg-stone-800 text-stone-200 rounded-xl text-xs font-semibold border border-stone-800 backdrop-blur-xs transition-colors"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Desafios & Quiz</span>
          </button>
        </div>
      </main>

      {/* Control Hint Line Required by Game Guidelines */}
      <footer className="relative z-10 w-full py-4 text-center border-t border-stone-900/80 bg-stone-950/70 backdrop-blur-xs">
        <p className="text-xs text-stone-400 tracking-wide font-mono">
          WASD / Setas para Mover · Espaço / Clique para Interagir · Mudo [M] · Esc Voltar
        </p>
      </footer>
    </div>
  );
};
