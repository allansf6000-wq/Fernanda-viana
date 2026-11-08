import React, { useRef, useEffect, useState, useCallback } from 'react';
import { sound } from '../utils/audio';
import { Sparkles, Compass, MessageSquare, BookOpen, Edit3, Award, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface SchoolCanvasProps {
  onInteractWithObject: (objectId: string) => void;
  playerRoom: 'classroom' | 'courtyard';
  onChangeRoom: (room: 'classroom' | 'courtyard') => void;
  xp: number;
  level: number;
  masteredCount: number;
}

interface Hotspot {
  id: string;
  name: string;
  actionLabel: string;
  x: number;
  y: number;
  radius: number;
  icon: string;
}

export const SchoolCanvas: React.FC<SchoolCanvasProps> = ({
  onInteractWithObject,
  playerRoom,
  onChangeRoom,
  xp,
  level,
  masteredCount,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active interaction near player
  const [nearbyHotspot, setNearbyHotspot] = useState<Hotspot | null>(null);

  // Position and movement state stored in refs to avoid re-rendering the 60fps canvas loop
  const playerRef = useRef({
    x: 400,
    y: 320,
    vx: 0,
    vy: 0,
    speed: 180, // pixels per second
    direction: 'down' as 'down' | 'up' | 'left' | 'right',
    animFrame: 0,
    stepTimer: 0,
    isMoving: false,
  });

  const keysHeld = useRef<{ [key: string]: boolean }>({});
  const targetPos = useRef<{ x: number; y: number } | null>(null);

  // Hotspots definitions per room
  const classroomHotspots: Hotspot[] = [
    {
      id: 'fernanda',
      name: 'Professora Fernanda',
      actionLabel: 'Conversar em Japonês',
      x: 390,
      y: 130,
      radius: 55,
      icon: '👩‍🏫',
    },
    {
      id: 'blackboard',
      name: 'Quadro Negro',
      actionLabel: 'Estudar Hiragana & Katakana',
      x: 400,
      y: 65,
      radius: 65,
      icon: '📋',
    },
    {
      id: 'writing_desk',
      name: 'Carteira de Caligrafia',
      actionLabel: 'Simulador de Ordem dos Traços',
      x: 230,
      y: 290,
      radius: 50,
      icon: '🖌️',
    },
    {
      id: 'bookshelf',
      name: 'Estante de Vocabulário',
      actionLabel: 'Consultar Palavras & Kanji',
      x: 690,
      y: 190,
      radius: 50,
      icon: '📚',
    },
    {
      id: 'courtyard_door',
      name: 'Porta do Pátio',
      actionLabel: 'Ir ao Pátio de Cerejeiras',
      x: 740,
      y: 450,
      radius: 45,
      icon: '🌸',
    },
    {
      id: 'challenges_board',
      name: 'Mural de Desafios',
      actionLabel: 'Abrir Quiz e Áudio',
      x: 100,
      y: 180,
      radius: 48,
      icon: '🎯',
    },
  ];

  const courtyardHotspots: Hotspot[] = [
    {
      id: 'fernanda',
      name: 'Professora Fernanda',
      actionLabel: 'Conversa sob as Cerejeiras',
      x: 420,
      y: 260,
      radius: 55,
      icon: '👩‍🏫',
    },
    {
      id: 'classroom_door',
      name: 'Porta da Sala de Aula',
      actionLabel: 'Voltar para a Sala 3-B',
      x: 80,
      y: 440,
      radius: 50,
      icon: '🏫',
    },
    {
      id: 'sakura_tree',
      name: 'Grande Cerejeira (桜)',
      actionLabel: 'Aprender Cultura e Palavras',
      x: 660,
      y: 210,
      radius: 60,
      icon: '🌸',
    },
    {
      id: 'torii_shrine',
      name: 'Portal Torii Tradicional',
      actionLabel: 'Desafio Espiritual de Kanji',
      x: 240,
      y: 150,
      radius: 55,
      icon: '⛩️',
    },
  ];

  const activeHotspots = playerRoom === 'classroom' ? classroomHotspots : courtyardHotspots;

  // Track keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysHeld.current[e.key.toLowerCase()] = true;

      // Space key triggers interaction with nearest hotspot
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (nearbyHotspot) {
          triggerInteraction(nearbyHotspot.id);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysHeld.current[e.key.toLowerCase()] = false;
    };

    const handleBlur = () => {
      keysHeld.current = {};
      targetPos.current = null;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [nearbyHotspot]);

  const triggerInteraction = (objectId: string) => {
    sound.playClick();
    if (objectId === 'courtyard_door') {
      onChangeRoom('courtyard');
      playerRef.current.x = 140;
      playerRef.current.y = 420;
    } else if (objectId === 'classroom_door') {
      onChangeRoom('classroom');
      playerRef.current.x = 690;
      playerRef.current.y = 430;
    } else {
      onInteractWithObject(objectId);
    }
  };

  // Main 60fps Game Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();
    let animationId: number;

    // Drifting petals particle buffer
    const petals: { x: number; y: number; speed: number; angle: number; rotSpeed: number }[] = [];
    for (let p = 0; p < 25; p++) {
      petals.push({
        x: Math.random() * 800,
        y: Math.random() * 500,
        speed: 20 + Math.random() * 35,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: 1 + Math.random() * 2,
      });
    }

    const gameLoop = (currentTime: number) => {
      const rawDt = (currentTime - lastTime) / 1000;
      const dt = Math.min(rawDt, 0.05); // Clamped dt for stable simulation
      lastTime = currentTime;

      const player = playerRef.current;

      // 1. Process Movement Inputs (WASD & Arrows)
      let moveX = 0;
      let moveY = 0;

      if (keysHeld.current['w'] || keysHeld.current['arrowup']) moveY -= 1;
      if (keysHeld.current['s'] || keysHeld.current['arrowdown']) moveY += 1;
      if (keysHeld.current['a'] || keysHeld.current['arrowleft']) moveX -= 1;
      if (keysHeld.current['d'] || keysHeld.current['arrowright']) moveX += 1;

      // Mouse/Tap to move destination
      if (targetPos.current) {
        const dx = targetPos.current.x - player.x;
        const dy = targetPos.current.y - player.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 8) {
          moveX = dx / dist;
          moveY = dy / dist;
        } else {
          targetPos.current = null;
        }
      }

      // Normalize diagonal vector
      const len = Math.hypot(moveX, moveY);
      if (len > 0) {
        moveX = (moveX / len) * player.speed * dt;
        moveY = (moveY / len) * player.speed * dt;

        player.x += moveX;
        player.y += moveY;
        player.isMoving = true;

        // Determine face direction
        if (Math.abs(moveX) > Math.abs(moveY)) {
          player.direction = moveX > 0 ? 'right' : 'left';
        } else {
          player.direction = moveY > 0 ? 'down' : 'up';
        }

        // Footsteps & walk animation cycle
        player.stepTimer += dt;
        if (player.stepTimer > 0.16) {
          player.stepTimer = 0;
          player.animFrame = (player.animFrame + 1) % 4;
          sound.playFootstep();
        }
      } else {
        player.isMoving = false;
        player.animFrame = 0;
      }

      // Constrain player within room boundary
      player.x = Math.max(40, Math.min(760, player.x));
      player.y = Math.max(90, Math.min(460, player.y));

      // 2. Check Proximity to Hotspots
      let closest: Hotspot | null = null;
      let minDistance = Infinity;

      activeHotspots.forEach((spot) => {
        const dist = Math.hypot(spot.x - player.x, spot.y - player.y);
        if (dist < spot.radius && dist < minDistance) {
          minDistance = dist;
          closest = spot;
        }
      });

      setNearbyHotspot(closest);

      // 3. Render Game Viewport
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (playerRoom === 'classroom') {
        // --- DRAW CLASSROOM ---
        // Warm wooden floorboards
        ctx.fillStyle = '#78350f';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#92400e';
        for (let y = 0; y < height; y += 32) {
          ctx.fillRect(0, y, width, 1);
        }

        // Back Wall
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(0, 0, width, 90);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(0, 85, width, 8);

        // Windows with sunlight beams
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(40, 10, 110, 65);
        ctx.fillRect(650, 10, 110, 65);

        // Warm Sunlight beam triangles
        ctx.fillStyle = 'rgba(254, 240, 138, 0.08)';
        ctx.beginPath();
        ctx.moveTo(150, 10);
        ctx.lineTo(320, height);
        ctx.lineTo(80, height);
        ctx.closePath();
        ctx.fill();

        // Chalkboard at front center
        ctx.fillStyle = '#064e3b'; // Traditional dark green chalkboard
        ctx.fillRect(260, 16, 280, 60);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 4;
        ctx.strokeRect(260, 16, 280, 60);

        // Chalk writing on board: Hiragana characters
        ctx.font = 'bold 16px "Zen Maru Gothic", sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.fillText('日本語教室 · ひらがな 46文字', 400, 40);
        ctx.font = '12px "Zen Maru Gothic", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('あ い う え お  /  か き く け こ', 400, 62);

        // Teacher's Podium / Desk
        ctx.fillStyle = '#573010';
        ctx.fillRect(350, 140, 80, 30);
        ctx.strokeStyle = '#381c06';
        ctx.strokeRect(350, 140, 80, 30);

        // Student Desks Grid
        const deskRows = [230, 330, 420];
        const deskCols = [190, 310, 470, 590];
        deskRows.forEach((r) => {
          deskCols.forEach((c) => {
            // Desk surface
            ctx.fillStyle = '#a16207';
            ctx.fillRect(c, r, 54, 32);
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(c, r, 54, 32);

            // Notebook on desk
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(c + 12, r + 6, 20, 18);
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(c + 12, r + 6, 4, 18);

            // Chair behind desk
            ctx.fillStyle = '#713f12';
            ctx.fillRect(c + 16, r + 34, 22, 10);
          });
        });

        // Bookshelf on right wall
        ctx.fillStyle = '#451a03';
        ctx.fillRect(680, 120, 70, 130);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(690, 135, 14, 26);
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(706, 135, 12, 26);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(720, 135, 16, 26);

        // Door to Courtyard
        ctx.fillStyle = '#b45309';
        ctx.fillRect(720, 410, 60, 70);
        ctx.fillStyle = '#fcd34d';
        ctx.fillRect(730, 420, 40, 50);
        ctx.font = '10px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#78350f';
        ctx.fillText('Pátio 桜 →', 750, 450);

        // Bulletin board on left
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(60, 130, 70, 90);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(70, 140, 22, 28);
        ctx.fillStyle = '#fbcfe8';
        ctx.fillRect(98, 140, 22, 28);
      } else {
        // --- DRAW SAKURA COURTYARD ---
        // Lush green lawn
        ctx.fillStyle = '#15803d';
        ctx.fillRect(0, 0, width, height);

        // Stone Paver Pathway curving
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.ellipse(380, 360, 320, 70, 0, 0, Math.PI * 2);
        ctx.fill();

        // Traditional Red Torii Gate
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(200, 100, 14, 80);
        ctx.fillRect(280, 100, 14, 80);
        ctx.fillRect(180, 90, 134, 16);
        ctx.fillRect(190, 115, 114, 10);

        // Classroom Doorway
        ctx.fillStyle = '#78350f';
        ctx.fillRect(40, 400, 60, 70);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(50, 410, 40, 50);
        ctx.font = '10px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#78350f';
        ctx.fillText('← Sala 3-B', 70, 440);

        // Blooming Sakura Cherry Blossom Tree
        const drawSakuraTree = (tx: number, ty: number) => {
          // Trunk
          ctx.fillStyle = '#451a03';
          ctx.fillRect(tx - 12, ty, 24, 70);
          // Pink Foliage
          ctx.fillStyle = 'rgba(251, 113, 133, 0.9)';
          ctx.beginPath();
          ctx.arc(tx, ty - 20, 75, 0, Math.PI * 2);
          ctx.arc(tx - 35, ty - 10, 55, 0, Math.PI * 2);
          ctx.arc(tx + 35, ty - 10, 55, 0, Math.PI * 2);
          ctx.fill();
        };

        drawSakuraTree(660, 150);
        drawSakuraTree(500, 80);

        // Wooden Benches
        ctx.fillStyle = '#92400e';
        ctx.fillRect(360, 240, 60, 18);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(365, 258, 6, 12);
        ctx.fillRect(409, 258, 6, 12);
      }

      // 4. Draw Drifting Sakura Petals
      ctx.fillStyle = 'rgba(254, 205, 211, 0.85)';
      petals.forEach((p) => {
        p.y += p.speed * dt;
        p.x += Math.sin(p.angle) * 15 * dt;
        p.angle += p.rotSpeed * dt;

        if (p.y > height + 10) {
          p.y = -10;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 5. Draw Hotspot Glowing Aura Rings
      activeHotspots.forEach((spot) => {
        const isNear = nearbyHotspot?.id === spot.id;
        ctx.save();
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, spot.radius * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = isNear ? 'rgba(245, 158, 11, 0.9)' : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = isNear ? 3 : 1.5;
        if (isNear) {
          ctx.setLineDash([4, 4]);
        }
        ctx.stroke();

        // Icon above hotspot
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(spot.icon, spot.x, spot.y - 12);
        ctx.restore();
      });

      // 6. Draw Teacher Fernanda as Photo Standee Totem
      const fernandaSpot = activeHotspots.find((s) => s.id === 'fernanda');
      if (fernandaSpot) {
        const fx = fernandaSpot.x;
        const fy = fernandaSpot.y;

        // Shadow disc under totem base
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(fx, fy + 22, 22, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mahogany pedestal base
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.roundRect(fx - 24, fy + 14, 48, 10, 4);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Brass support brackets
        ctx.fillStyle = '#d97706';
        ctx.fillRect(fx - 14, fy + 8, 28, 6);

        // Photo plate background (acrylic clear white)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(fx - 18, fy - 36, 36, 46, 6);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Photo portrait inner area
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(fx - 15, fy - 33, 30, 34);

        // Portrait of Fernanda with jet black hair
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(fx, fy - 22, 10, 0, Math.PI * 2);
        ctx.fill();
        // Hair sides
        ctx.beginPath();
        ctx.ellipse(fx - 8, fy - 18, 4, 10, 0.2, 0, Math.PI * 2);
        ctx.ellipse(fx + 8, fy - 18, 4, 10, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Face
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(fx, fy - 20, 7, 0, Math.PI * 2);
        ctx.fill();

        // Eyes & warm smile
        ctx.fillStyle = '#451a03';
        ctx.fillRect(fx - 3, fy - 22, 2, 2);
        ctx.fillRect(fx + 2, fy - 22, 2, 2);
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(fx, fy - 18, 3, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        // Navy blazer & white collar on photo
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.roundRect(fx - 13, fy - 10, 26, 11, [4, 4, 0, 0]);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(fx - 4, fy - 10);
        ctx.lineTo(fx, fy - 4);
        ctx.lineTo(fx + 4, fy - 10);
        ctx.fill();

        // Totem Base Plaque
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(fx - 18, fy + 3, 36, 8);
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 6px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TOTEM FERNANDA [OK]', fx, fy + 9);

        // Floating glowing name badge above totem
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(fx - 48, fy - 52, 96, 16, 8);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.fillText('Totem Fernanda [OK] ✨', fx, fy - 41);
      }

      // 7. Draw Player Character
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(player.x, player.y + 16, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body (School Uniform)
      ctx.fillStyle = '#0f172a'; // Dark uniform pants/skirt
      ctx.fillRect(player.x - 8, player.y + 8, 16, 9);

      // Shirt (White button down + school vest)
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(player.x - 10, player.y - 7, 20, 16);
      ctx.fillStyle = '#b91c1c'; // Red school tie
      ctx.fillRect(player.x - 2, player.y - 4, 4, 8);

      // Walking bounce
      const bounce = player.isMoving ? Math.sin(player.animFrame * Math.PI) * 2 : 0;

      // Head & Hair
      ctx.fillStyle = '#1c1917'; // Dark hair
      ctx.beginPath();
      ctx.arc(player.x, player.y - 16 + bounce, 11, 0, Math.PI * 2);
      ctx.fill();

      // Face
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(player.x, player.y - 14 + bounce, 8.5, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#0f172a';
      if (player.direction === 'left') {
        ctx.fillRect(player.x - 6, player.y - 15 + bounce, 2, 2.5);
      } else if (player.direction === 'right') {
        ctx.fillRect(player.x + 4, player.y - 15 + bounce, 2, 2.5);
      } else if (player.direction === 'down') {
        ctx.fillRect(player.x - 4, player.y - 15 + bounce, 2, 2.5);
        ctx.fillRect(player.x + 2, player.y - 15 + bounce, 2, 2.5);
      }

      // Player Label
      ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('Você', player.x, player.y - 32 + bounce);

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [playerRoom, activeHotspots, nearbyHotspot]);

  // Click-to-move handler on canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check if clicked directly on a hotspot
    const clickedHotspot = activeHotspots.find(
      (h) => Math.hypot(h.x - clickX, h.y - clickY) < h.radius
    );

    if (clickedHotspot) {
      triggerInteraction(clickedHotspot.id);
    } else {
      targetPos.current = { x: clickX, y: clickY };
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-stone-950 select-none">
      {/* HUD Bar conforming to Game Craft guidelines: Low-occlusion, tabular nums, perimeter */}
      <div className="absolute top-3 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left Status: Room and Level */}
        <div className="flex items-center gap-3 bg-stone-900/80 border border-stone-800/80 px-4 py-2 rounded-xl backdrop-blur-xs pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold text-stone-200">
              {playerRoom === 'classroom' ? '🏫 Sala de Aula 3-B' : '🌸 Pátio das Cerejeiras'}
            </span>
          </div>
          <span className="text-stone-600">|</span>
          <span className="text-xs font-mono tabular-nums text-amber-400 font-bold">
            Nv. {level} · {xp} XP
          </span>
        </div>

        {/* Right Status: Mastered Kanas */}
        <div className="flex items-center gap-2 bg-stone-900/80 border border-stone-800/80 px-3 py-2 rounded-xl backdrop-blur-xs pointer-events-auto">
          <span className="font-jp text-amber-300 font-bold text-sm">あ</span>
          <span className="text-xs text-stone-300">
            Kanas dominados: <strong className="font-mono tabular-nums text-amber-400">{masteredCount}</strong> / 46
          </span>
        </div>
      </div>

      {/* Main Game Simulation Canvas */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-stone-800 shadow-2xl bg-stone-950 max-w-full">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onClick={handleCanvasClick}
          className="block w-full max-w-[800px] h-auto cursor-pointer"
        />

        {/* Proximity Interaction Banner Overlay */}
        {nearbyHotspot && (
          <div className="absolute bottom-4 inset-x-6 z-20 flex justify-center animate-fade-in pointer-events-none">
            <button
              onClick={() => triggerInteraction(nearbyHotspot.id)}
              className="pointer-events-auto flex items-center gap-3 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm rounded-xl shadow-xl transition-all transform hover:scale-105 active:scale-95 border border-amber-300"
            >
              <span className="text-lg">{nearbyHotspot.icon}</span>
              <span>
                {nearbyHotspot.name}: {nearbyHotspot.actionLabel}
              </span>
              <span className="text-xs bg-stone-950 text-amber-300 px-2 py-0.5 rounded font-mono">
                [Espaço / Toque]
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Directional Cursor Controls + OK Button */}
      <div className="flex items-center justify-between w-full max-w-md px-4 mt-3 gap-3 bg-stone-900/90 border border-stone-800 p-2.5 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-mono font-bold text-amber-300 uppercase mb-1">Setas</span>
          <div className="grid grid-cols-3 gap-1.5 w-32">
            <div />
            <button
              title="Avançar / Cima (▲)"
              onMouseDown={() => (keysHeld.current['arrowup'] = true)}
              onMouseUp={() => (keysHeld.current['arrowup'] = false)}
              onMouseLeave={() => (keysHeld.current['arrowup'] = false)}
              onTouchStart={() => (keysHeld.current['arrowup'] = true)}
              onTouchEnd={() => (keysHeld.current['arrowup'] = false)}
              className="w-10 h-10 bg-stone-800 border border-stone-700 hover:bg-stone-700 rounded-xl flex items-center justify-center text-white active:bg-amber-500 active:text-stone-950 shadow-sm cursor-pointer"
            >
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div />
            <button
              title="Esquerda (◀)"
              onMouseDown={() => (keysHeld.current['arrowleft'] = true)}
              onMouseUp={() => (keysHeld.current['arrowleft'] = false)}
              onMouseLeave={() => (keysHeld.current['arrowleft'] = false)}
              onTouchStart={() => (keysHeld.current['arrowleft'] = true)}
              onTouchEnd={() => (keysHeld.current['arrowleft'] = false)}
              className="w-10 h-10 bg-stone-800 border border-stone-700 hover:bg-stone-700 rounded-xl flex items-center justify-center text-white active:bg-amber-500 active:text-stone-950 shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button
              title="Recuar / Baixo (▼)"
              onMouseDown={() => (keysHeld.current['arrowdown'] = true)}
              onMouseUp={() => (keysHeld.current['arrowdown'] = false)}
              onMouseLeave={() => (keysHeld.current['arrowdown'] = false)}
              onTouchStart={() => (keysHeld.current['arrowdown'] = true)}
              onTouchEnd={() => (keysHeld.current['arrowdown'] = false)}
              className="w-10 h-10 bg-stone-800 border border-stone-700 hover:bg-stone-700 rounded-xl flex items-center justify-center text-white active:bg-amber-500 active:text-stone-950 shadow-sm cursor-pointer"
            >
              <ArrowDown className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button
              title="Direita (▶)"
              onMouseDown={() => (keysHeld.current['arrowright'] = true)}
              onMouseUp={() => (keysHeld.current['arrowright'] = false)}
              onMouseLeave={() => (keysHeld.current['arrowright'] = false)}
              onTouchStart={() => (keysHeld.current['arrowright'] = true)}
              onTouchEnd={() => (keysHeld.current['arrowright'] = false)}
              className="w-10 h-10 bg-stone-800 border border-stone-700 hover:bg-stone-700 rounded-xl flex items-center justify-center text-white active:bg-amber-500 active:text-stone-950 shadow-sm cursor-pointer"
            >
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Action / OK Button */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => {
              if (nearbyHotspot) {
                triggerInteraction(nearbyHotspot.id);
              } else {
                triggerInteraction('fernanda');
              }
            }}
            title="Confirmar / Ação / Interagir [OK]"
            className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black cursor-pointer shadow-lg transition-transform active:scale-95 border-2 ${
              nearbyHotspot
                ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-stone-950 border-amber-200 animate-pulse'
                : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border-stone-600'
            }`}
          >
            <span className="text-2xl font-mono leading-none">OK</span>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wide mt-1">
              {nearbyHotspot ? 'Interagir' : 'Falar'}
            </span>
          </button>
          <span className="text-[10px] font-mono text-stone-400">[OK] / Espaço</span>
        </div>
      </div>

      {/* Flat Control Hints */}
      <div className="mt-2 text-stone-500 text-[11px] font-mono tracking-wide hidden sm:block">
        Mover: Setas na Tela / Teclado WASD · Ação: Botão [OK] / Espaço / Clique no Objeto
      </div>
    </div>
  );
};
