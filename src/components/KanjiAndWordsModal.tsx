import React, { useState } from 'react';
import { VOCABULARY_LIST, KANJI_LIST } from '../data/kanaData';
import { VocabularyWord, KanjiItem } from '../types/game';
import { sound } from '../utils/audio';
import { Volume2, BookOpen, Sparkles, Filter } from 'lucide-react';

interface KanjiAndWordsModalProps {
  onClose: () => void;
  unlockedWords: boolean;
  unlockedKanji: boolean;
  playerXp: number;
}

export const KanjiAndWordsModal: React.FC<KanjiAndWordsModalProps> = ({
  onClose,
  unlockedWords,
  unlockedKanji,
  playerXp,
}) => {
  const [activeTab, setActiveTab] = useState<'words' | 'kanji'>('words');
  const [selectedWordCategory, setSelectedWordCategory] = useState<string>('all');

  const filteredWords = VOCABULARY_LIST.filter((w) => {
    if (selectedWordCategory === 'all') return true;
    return w.category === selectedWordCategory;
  });

  const handleWordSpeak = (word: VocabularyWord) => {
    sound.speakJapanese(word.jp);
  };

  const handleKanjiSpeak = (kanji: KanjiItem) => {
    sound.speakJapanese(kanji.char);
  };

  return (
    <div className="flex flex-col max-w-4xl mx-auto p-4 md:p-6 bg-stone-900/95 rounded-2xl border border-stone-800 shadow-2xl backdrop-blur-md">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-bold text-stone-100">Fase Avançada: Palavras & Kanji</h3>
          </div>
          <p className="text-xs text-stone-400">
            Aprofunde seu vocabulário escolar e domine os primeiros ideogramas clássicos.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-stone-950 rounded-xl border border-stone-800">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('words');
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'words'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Vocabulário Escolar
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('kanji');
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'kanji'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Ideogramas Kanji
          </button>
        </div>
      </div>

      {/* Words View */}
      {activeTab === 'words' && (
        <div className="my-4">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 pb-3 overflow-x-auto no-scrollbar">
            {['all', 'escola', 'saudacoes', 'alimentos', 'dia-a-dia'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  sound.playClick();
                  setSelectedWordCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  selectedWordCategory === cat
                    ? 'bg-stone-800 text-amber-400 border border-amber-500/40'
                    : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-300'
                }`}
              >
                {cat === 'all' ? 'Todas' : cat}
              </button>
            ))}
          </div>

          {/* Words Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto p-1">
            {filteredWords.map((word) => (
              <div
                key={word.id}
                onClick={() => handleWordSpeak(word)}
                className="group p-3.5 bg-stone-950/80 rounded-xl border border-stone-800 hover:border-amber-500/50 hover:bg-stone-800/40 cursor-pointer transition-all active:scale-[0.98] flex items-center justify-between"
              >
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-jp text-xl font-bold text-amber-300 group-hover:text-amber-400">
                      {word.jp}
                    </span>
                    {word.hiraganaReading && word.hiraganaReading !== word.jp && (
                      <span className="font-jp text-xs text-stone-400">
                        ({word.hiraganaReading})
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-stone-400 block mt-0.5">
                    {word.romaji}
                  </span>
                  <span className="text-xs text-stone-200 font-medium block mt-1">
                    {word.pt}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-stone-900 border border-stone-800 group-hover:border-amber-500/40 flex items-center justify-center text-stone-400 group-hover:text-amber-400 transition-colors shrink-0">
                  <Volume2 className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kanji View */}
      {activeTab === 'kanji' && (
        <div className="my-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[55vh] overflow-y-auto p-1">
            {KANJI_LIST.map((kanji) => (
              <div
                key={kanji.id}
                className="p-4 bg-stone-950/80 rounded-xl border border-stone-800 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => handleKanjiSpeak(kanji)}
                      className="w-16 h-16 rounded-xl bg-stone-900 border-2 border-amber-500/50 hover:border-amber-400 flex items-center justify-center cursor-pointer transition-all active:scale-95 group shadow-inner"
                      title="Toque para ouvir a pronúncia deste Kanji"
                    >
                      <span className="font-jp text-4xl font-bold text-amber-400 group-hover:scale-110 transition-transform">
                        {kanji.char}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-stone-100 capitalize">
                        {kanji.meaningPt}
                      </h4>
                      <span className="text-xs text-stone-400">
                        {kanji.strokeCount} traços
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleKanjiSpeak(kanji)}
                    className="p-2 text-stone-400 hover:text-amber-400 bg-stone-900 rounded-lg border border-stone-800 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Readings */}
                <div className="mt-3 pt-3 border-t border-stone-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-stone-400 block font-semibold">Kunyomi (Japonesa):</span>
                    <span className="font-jp text-stone-200">{kanji.kunyomi}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block font-semibold">Onyomi (Chinesa):</span>
                    <span className="font-jp text-stone-200">{kanji.onyomi}</span>
                  </div>
                </div>

                {/* Compound Examples */}
                <div className="mt-3 bg-stone-900/60 p-2.5 rounded-lg border border-stone-800/60">
                  <span className="text-[11px] font-semibold text-amber-400/90 block mb-1">
                    Exemplos em Palavras:
                  </span>
                  <div className="flex flex-col gap-1">
                    {kanji.examples.map((ex, i) => (
                      <div
                        key={i}
                        onClick={() => sound.speakJapanese(ex.word)}
                        className="flex items-center justify-between text-xs cursor-pointer hover:text-amber-300 py-0.5"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-jp font-bold text-stone-200">{ex.word}</span>
                          <span className="text-stone-400">({ex.reading})</span>
                        </div>
                        <span className="text-stone-300 italic text-[11px]">{ex.meaningPt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
