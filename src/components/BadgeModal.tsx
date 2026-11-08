import React from 'react';
import { Badge, PlayerProgress } from '../types/game';
import { Award, CheckCircle2, Lock, Sparkles } from 'lucide-react';

interface BadgeModalProps {
  badges: Badge[];
  progress: PlayerProgress;
  onClose: () => void;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({ badges, progress, onClose }) => {
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="flex flex-col max-w-3xl mx-auto p-4 md:p-6 bg-stone-900/95 rounded-2xl border border-stone-800 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-bold text-stone-100">Quadro de Medalhas & Conquistas</h3>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            Conquistas desbloqueadas durante seus estudos na Nihongo Gakuen.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800">
          <span className="text-xs text-stone-400">Desbloqueadas:</span>
          <strong className="text-amber-400 text-sm font-bold">
            {unlockedCount} / {badges.length}
          </strong>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5 max-h-[60vh] overflow-y-auto p-1">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`p-3.5 rounded-xl border flex items-start gap-3.5 transition-all ${
              badge.unlocked
                ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                : 'bg-stone-950/50 border-stone-800 opacity-60'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border ${
                badge.unlocked
                  ? 'bg-amber-500/20 border-amber-500/50 shadow-inner'
                  : 'bg-stone-900 border-stone-800 text-stone-600'
              }`}
            >
              {badge.unlocked ? badge.icon : <Lock className="w-5 h-5 text-stone-600" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4
                  className={`text-sm font-bold ${
                    badge.unlocked ? 'text-amber-300' : 'text-stone-400'
                  }`}
                >
                  {badge.title}
                </h4>
                {badge.unlocked && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </div>
              <p className="text-xs text-stone-400 mt-1">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
