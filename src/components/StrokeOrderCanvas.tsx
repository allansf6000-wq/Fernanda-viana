import React, { useRef, useState, useEffect } from 'react';
import { KanaItem } from '../types/game';
import { sound } from '../utils/audio';
import { Volume2, Play, RotateCcw, Check, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

interface StrokeOrderCanvasProps {
  kana: KanaItem;
  onComplete?: (kana: KanaItem) => void;
  onNextKana?: () => void;
  onPrevKana?: () => void;
}

export const StrokeOrderCanvas: React.FC<StrokeOrderCanvasProps> = ({
  kana,
  onComplete,
  onNextKana,
  onPrevKana,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [userStrokes, setUserStrokes] = useState<{ x: number; y: number }[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);
  const [animatingStroke, setAnimatingStroke] = useState<number | null>(null);
  const [evaluationMessage, setEvaluationMessage] = useState<string>('Desenhe seguindo a ordem indicada');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showGuideGhost, setShowGuideGhost] = useState<boolean>(true);

  // Play audio when kana changes
  useEffect(() => {
    setUserStrokes([]);
    setCurrentStroke([]);
    setIsCompleted(false);
    setEvaluationMessage(`Ordem correta: ${kana.strokeCount} ${kana.strokeCount === 1 ? 'traço' : 'traços'}`);
    sound.speakJapanese(kana.char);
  }, [kana]);

  // Redraw canvas whenever user strokes or animations update
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Japanese Calligraphy Grid (Grid box with dashed crosshairs)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.strokeRect(10, 10, width - 20, height - 20);

    ctx.strokeStyle = '#cbd5e1';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(width / 2, 10);
    ctx.lineTo(width / 2, height - 10);
    ctx.moveTo(10, height / 2);
    ctx.lineTo(width - 10, height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Optional Ghost Character Template
    if (showGuideGhost) {
      ctx.save();
      ctx.font = 'bold 200px "Zen Maru Gothic", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(226, 232, 240, 0.7)';
      ctx.fillText(kana.char, width / 2, height / 2 + 10);
      ctx.restore();
    }

    // 3. Draw Stroke Guide Vector Lines & Numbers
    kana.strokes.forEach((stroke, i) => {
      if (stroke.points.length < 2) return;
      const isCurrentAnimating = animatingStroke === stroke.index;

      ctx.save();
      ctx.beginPath();
      const p0 = stroke.points[0];
      const startX = (p0.x / 100) * width;
      const startY = (p0.y / 100) * height;
      ctx.moveTo(startX, startY);

      for (let j = 1; j < stroke.points.length; j++) {
        const pj = stroke.points[j];
        ctx.lineTo((pj.x / 100) * width, (pj.y / 100) * height);
      }

      ctx.strokeStyle = isCurrentAnimating ? '#ec4899' : 'rgba(244, 63, 94, 0.45)';
      ctx.lineWidth = isCurrentAnimating ? 8 : 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Draw numbered circle at start of stroke
      ctx.fillStyle = isCurrentAnimating ? '#be185d' : '#e11d48';
      ctx.beginPath();
      ctx.arc(startX, startY, 13, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(stroke.index), startX, startY);

      // Draw directional arrow hint at the end
      if (stroke.points.length >= 2) {
        const lastP = stroke.points[stroke.points.length - 1];
        const prevP = stroke.points[stroke.points.length - 2];
        const endX = (lastP.x / 100) * width;
        const endY = (lastP.y / 100) * height;
        const dx = endX - (prevP.x / 100) * width;
        const dy = endY - (prevP.y / 100) * height;
        const angle = Math.atan2(dy, dx);

        ctx.fillStyle = isCurrentAnimating ? '#be185d' : '#e11d48';
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - 10 * Math.cos(angle - Math.PI / 6), endY - 10 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(endX - 10 * Math.cos(angle + Math.PI / 6), endY - 10 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    });

    // 4. Draw User's Completed and Active Ink Strokes
    const allStrokes = [...userStrokes, currentStroke];
    allStrokes.forEach((pts) => {
      if (pts.length < 2) return;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let k = 1; k < pts.length; k++) {
        ctx.lineTo(pts[k].x, pts[k].y);
      }
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();
    });
  }, [kana, userStrokes, currentStroke, animatingStroke, showGuideGhost]);

  // Animate the stroke demonstration
  const handleDemonstrate = () => {
    sound.playClick();
    let currentIdx = 1;
    setAnimatingStroke(1);
    setEvaluationMessage(`Demonstrando traço 1: ${kana.strokes[0]?.directionHint || ''}`);

    const interval = setInterval(() => {
      currentIdx++;
      if (currentIdx <= kana.strokeCount) {
        setAnimatingStroke(currentIdx);
        setEvaluationMessage(
          `Traço ${currentIdx}: ${kana.strokes[currentIdx - 1]?.directionHint || ''}`
        );
        sound.playStroke();
      } else {
        clearInterval(interval);
        setAnimatingStroke(null);
        setEvaluationMessage('Agora é sua vez de treinar!');
      }
    }, 1100);
  };

  // Drawing event handlers
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleStartDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isCompleted) return;
    const coords = getCoordinates(e);
    setIsDrawing(true);
    setCurrentStroke([coords]);
    sound.playStroke();
  };

  const handleMoveDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    setCurrentStroke((prev) => [...prev, coords]);
  };

  const handleEndDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length > 2) {
      const updated = [...userStrokes, currentStroke];
      setUserStrokes(updated);
      setCurrentStroke([]);

      const strokeNum = updated.length;
      if (strokeNum < kana.strokeCount) {
        sound.playStroke();
        setEvaluationMessage(`Traço ${strokeNum} traçado! Próximo: traço ${strokeNum + 1}`);
      } else if (strokeNum === kana.strokeCount) {
        // Completed required strokes!
        sound.playSuccess();
        setIsCompleted(true);
        setEvaluationMessage(`Parabéns! Você completou ${kana.char} com os ${kana.strokeCount} traços corretos!`);
        if (onComplete) onComplete(kana);
      } else {
        setEvaluationMessage('Muitos traços! Tente seguir a contagem exata.');
      }
    }
  };

  const handleReset = () => {
    sound.playClick();
    setUserStrokes([]);
    setCurrentStroke([]);
    setIsCompleted(false);
    setEvaluationMessage(`Pronto! Pratique os ${kana.strokeCount} traços de ${kana.char}`);
  };

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto p-4 bg-stone-900/90 rounded-2xl border border-amber-900/40 shadow-2xl backdrop-blur-md">
      {/* Top Header Card */}
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onPrevKana}
            disabled={!onPrevKana}
            className="p-2 text-stone-400 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-stone-400 transition-colors"
            title="Caractere anterior"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-baseline gap-2">
            <span className="font-jp text-4xl font-bold text-amber-400 drop-shadow">{kana.char}</span>
            <span className="text-xl font-semibold text-stone-200">[{kana.romaji}]</span>
            <span className="text-xs px-2 py-0.5 rounded bg-stone-800 text-amber-300 uppercase font-mono">
              {kana.type} · {kana.strokeCount} {kana.strokeCount === 1 ? 'traço' : 'traços'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => sound.speakJapanese(kana.char)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-sm font-medium transition-colors border border-amber-500/30 active:scale-95"
            title="Ouvir pronúncia autêntica em japonês"
          >
            <Volume2 className="w-4 h-4" />
            <span>Ouvir</span>
          </button>
          <button
            onClick={onNextKana}
            disabled={!onNextKana}
            className="p-2 text-stone-400 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-stone-400 transition-colors"
            title="Próximo caractere"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mnemonic Hint */}
      <div className="w-full text-xs text-stone-400 mb-3 text-center bg-stone-800/60 py-1.5 px-3 rounded-lg border border-stone-700/50">
        <span className="text-amber-400 font-semibold">Dica de memória: </span>
        {kana.mnemonicPt} · Ex: <span className="font-jp font-bold text-stone-200">{kana.exampleWord.jp}</span> ({kana.exampleWord.romaji} = {kana.exampleWord.pt})
      </div>

      {/* Canvas Practice Box */}
      <div className="relative rounded-xl overflow-hidden shadow-inner border-2 border-stone-700 bg-white cursor-crosshair touch-none">
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="block"
          onMouseDown={handleStartDraw}
          onMouseMove={handleMoveDraw}
          onMouseUp={handleEndDraw}
          onMouseLeave={handleEndDraw}
          onTouchStart={handleStartDraw}
          onTouchMove={handleMoveDraw}
          onTouchEnd={handleEndDraw}
        />

        {/* Completion badge overlay */}
        {isCompleted && (
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center animate-fade-in pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg mb-2">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h4 className="text-xl font-bold text-white drop-shadow">Excelente!</h4>
            <p className="text-xs text-emerald-200 mt-1 font-medium">+20 XP conquistados</p>
          </div>
        )}
      </div>

      {/* Live Status Feedback */}
      <div className="w-full mt-3 py-2 px-3 bg-stone-800/80 rounded-lg text-center text-sm font-medium text-stone-300 border border-stone-700/60">
        {evaluationMessage}
      </div>

      {/* Action Controls */}
      <div className="w-full grid grid-cols-3 gap-2 mt-3">
        <button
          onClick={handleDemonstrate}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-pink-600/30 hover:bg-pink-600/40 text-pink-300 border border-pink-500/30 text-xs font-semibold transition-all active:scale-95"
        >
          <Play className="w-4 h-4 fill-pink-300" />
          <span>Demonstrar</span>
        </button>

        <button
          onClick={() => setShowGuideGhost(!showGuideGhost)}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-semibold transition-all active:scale-95 ${
            showGuideGhost
              ? 'bg-amber-600/30 text-amber-300 border-amber-500/40'
              : 'bg-stone-800 text-stone-400 border-stone-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{showGuideGhost ? 'Guia Visível' : 'Guia Oculto'}</span>
        </button>

        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs font-semibold transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Limpar</span>
        </button>
      </div>

      {/* Stroke Step List */}
      <div className="w-full mt-3 border-t border-stone-800 pt-3">
        <div className="text-xs font-semibold text-stone-400 mb-1.5 flex items-center justify-between">
          <span>Passo a Passo dos Traços</span>
          <span className="text-stone-500">
            Traços feitos: {userStrokes.length} / {kana.strokeCount}
          </span>
        </div>
        <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
          {kana.strokes.map((s) => (
            <div
              key={s.index}
              className={`flex items-center gap-2 p-1.5 rounded text-xs transition-colors ${
                userStrokes.length >= s.index
                  ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-900/30'
                  : 'bg-stone-800/40 text-stone-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-stone-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                {s.index}
              </span>
              <span className="truncate">{s.directionHint}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
