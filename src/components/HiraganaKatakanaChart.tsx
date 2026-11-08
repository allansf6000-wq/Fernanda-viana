import React, { useState } from 'react';
import { KanaItem, KanaType } from '../types/game';
import { HIRAGANA_DATA, KATAKANA_DATA } from '../data/kanaData';
import { sound } from '../utils/audio';
import { Volume2, Edit3, Sparkles, CheckCircle2 } from 'lucide-react';

interface HiraganaKatakanaChartProps {
  onSelectKanaForWriting: (kana: KanaItem) => void;
  masteredChars: string[];
  initialType?: KanaType;
}

export const HiraganaKatakanaChart: React.FC<HiraganaKatakanaChartProps> = ({
  onSelectKanaForWriting,
  masteredChars,
  initialType = 'hiragana',
}) => {
  const [activeType, setActiveType] = useState<KanaType>(initialType);
  const [selectedRow, setSelectedRow] = useState<string>('all');
  const [selectedKanaDetail, setSelectedKanaDetail] = useState<KanaItem | null>(null);

  const currentDataset = activeType === 'hiragana' ? HIRAGANA_DATA : KATAKANA_DATA;

  const rows = [
    { id: 'all', label: 'Todos (46)' },
    { id: 'a', label: 'Vogais (A-I-U-E-O)' },
    { id: 'ka', label: 'Linha KA' },
    { id: 'sa', label: 'Linha SA' },
    { id: 'ta', label: 'Linha TA' },
    { id: 'na', label: 'Linha NA' },
    { id: 'ha', label: 'Linha HA' },
    { id: 'ma', label: 'Linha MA' },
    { id: 'ya', label: 'Linha YA' },
    { id: 'ra', label: 'Linha RA' },
    { id: 'wa', label: 'Linha WA / N' },
  ];

  const filteredKanas = currentDataset.filter((item) => {
    if (selectedRow === 'all') return true;
    if (selectedRow === 'wa') return item.row === 'wa' || item.row === 'n';
    return item.row === selectedRow;
  });

  const handleCardClick = (item: KanaItem) => {
    sound.speakJapanese(item.char);
    setSelectedKanaDetail(item);
  };

  const handlePlayRow = () => {
    sound.playClick();
    filteredKanas.forEach((k, index) => {
      setTimeout(() => {
        sound.speakJapanese(k.char);
      }, index * 800);
    });
  };

  const totalMasteredInView = currentDataset.filter((k) =>
    masteredChars.includes(k.id)
  ).length;

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-4 md:p-6 bg-stone-900/90 rounded-2xl border border-stone-800 shadow-2xl backdrop-blur-md">
      {/* Top Bar with Alphabet Switch and Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-stone-100 flex items-center gap-2">
              <span className="font-jp text-amber-400">
                {activeType === 'hiragana' ? 'ひらがな' : 'カタカナ'}
              </span>
              <span>
                {activeType === 'hiragana' ? 'Alfabeto Hiragana' : 'Alfabeto Katakana'}
              </span>
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            {activeType === 'hiragana'
              ? '46 caracteres fundamentais para palavras nativas e gramática japonesa.'
              : '46 caracteres usados para palavras de origem estrangeira e ênfase.'}
          </p>
        </div>

        {/* Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-stone-950 rounded-xl border border-stone-800">
          <button
            onClick={() => {
              setActiveType('hiragana');
              sound.playClick();
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeType === 'hiragana'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Hiragana (46)
          </button>
          <button
            onClick={() => {
              setActiveType('katakana');
              sound.playClick();
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeType === 'katakana'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Katakana (46)
          </button>
        </div>
      </div>

      {/* Row Filter Pills & Action */}
      <div className="flex items-center justify-between gap-2 py-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0">
          {rows.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setSelectedRow(r.id);
                sound.playClick();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedRow === r.id
                  ? 'bg-stone-800 text-amber-400 border border-amber-500/40 shadow-xs'
                  : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <button
          onClick={handlePlayRow}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg text-xs font-medium shrink-0 border border-stone-700 transition-colors"
          title="Ouvir pronúncia sequencial desta fileira"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Ouvir Sequência</span>
        </button>
      </div>

      {/* Progress Metric Bar */}
      <div className="flex items-center justify-between text-xs text-stone-400 pb-2 px-1">
        <span>
          Progresso dominado: <strong className="text-amber-400">{totalMasteredInView}</strong> / 46
        </span>
        <div className="w-48 bg-stone-800 rounded-full h-2 overflow-hidden border border-stone-700">
          <div
            className="bg-amber-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${(totalMasteredInView / 46) * 100}%` }}
          />
        </div>
      </div>

      {/* Kana Cards Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5 overflow-y-auto max-h-[52vh] p-1">
        {filteredKanas.map((item) => {
          const isMastered = masteredChars.includes(item.id);
          const isSelected = selectedKanaDetail?.id === item.id;

          return (
            <div
              key={item.id}
              onClick={() => handleCardClick(item)}
              className={`group relative flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all active:scale-95 ${
                isSelected
                  ? 'bg-amber-950/40 border-amber-500 text-amber-300 shadow-lg ring-2 ring-amber-500/30'
                  : isMastered
                  ? 'bg-stone-900/80 border-emerald-500/50 hover:border-emerald-400 text-stone-100'
                  : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 hover:bg-stone-800/50 text-stone-200'
              }`}
            >
              {/* Mastered Indicator */}
              {isMastered && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 absolute top-1.5 right-1.5" />
              )}

              {/* Japanese Character */}
              <span className="font-jp text-3xl font-bold mb-1 transition-transform group-hover:scale-110">
                {item.char}
              </span>

              {/* Romaji */}
              <span className="text-xs font-mono font-medium text-stone-400 group-hover:text-amber-400">
                {item.romaji}
              </span>

              {/* Stroke Count Subtext */}
              <span className="text-[10px] text-stone-500 mt-0.5">
                {item.strokeCount} {item.strokeCount === 1 ? 'traço' : 'traços'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detail Footer for Selected Kana */}
      {selectedKanaDetail && (
        <div className="mt-4 p-3 bg-stone-950 rounded-xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-stone-900 border border-amber-500/40 flex items-center justify-center">
              <span className="font-jp text-3xl font-bold text-amber-400">
                {selectedKanaDetail.char}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">
                  {selectedKanaDetail.romaji.toUpperCase()}
                </span>
                <span className="text-xs text-stone-400">
                  ({selectedKanaDetail.strokeCount} traços)
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Exemplo:{' '}
                <strong className="font-jp text-stone-200">
                  {selectedKanaDetail.exampleWord.jp}
                </strong>{' '}
                ({selectedKanaDetail.exampleWord.romaji} ={' '}
                {selectedKanaDetail.exampleWord.pt})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => sound.speakJapanese(selectedKanaDetail.char)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold transition-colors border border-stone-700"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Ouvir Som</span>
            </button>
            <button
              onClick={() => onSelectKanaForWriting(selectedKanaDetail)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-xs font-bold transition-transform active:scale-95 shadow-md"
            >
              <Edit3 className="w-4 h-4" />
              <span>Treinar Traçado</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
