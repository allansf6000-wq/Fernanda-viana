import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { sound } from '../utils/audio';
import {
  Eye,
  Compass,
  Volume2,
  Sparkles,
  Move,
  MousePointer,
  Maximize2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  RotateCw,
} from 'lucide-react';

interface School3DCanvasProps {
  onInteractWithObject: (objectId: string) => void;
  playerRoom: 'classroom' | 'courtyard';
  onChangeRoom: (room: 'classroom' | 'courtyard') => void;
  xp: number;
  level: number;
  masteredCount: number;
}

interface InteractiveSpot3D {
  id: string;
  name: string;
  action: string;
  position: THREE.Vector3;
  radius: number;
  icon: string;
  room: 'classroom' | 'courtyard';
}

export const School3DCanvas: React.FC<School3DCanvasProps> = ({
  onInteractWithObject,
  playerRoom,
  onChangeRoom,
  xp,
  level,
  masteredCount,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [nearbySpot, setNearbySpot] = useState<InteractiveSpot3D | null>(null);
  const nearbySpotRef = useRef<InteractiveSpot3D | null>(null);
  const handleOkButtonRef = useRef<() => void>(() => {});
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [controlsHintVisible, setControlsHintVisible] = useState(true);

  // References to keep mutable simulation state without React re-renders
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const fernandaMeshRef = useRef<THREE.Group | null>(null);
  const petalsRef = useRef<THREE.Points | null>(null);

  // First-person state
  const fpState = useRef({
    yaw: 0,
    pitch: 0,
    position: new THREE.Vector3(0, 1.65, 3), // eye height ~1.65m
    velocity: new THREE.Vector3(),
    speed: 5.5,
    isMoving: false,
    stepTimer: 0,
    headBobTimer: 0,
    currentRoom: playerRoom,
  });

  const keysHeld = useRef<{ [key: string]: boolean }>({});
  const isDraggingMouse = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });

  // 3D Hotspots definitions
  const hotspots3D: InteractiveSpot3D[] = [
    {
      id: 'fernanda',
      name: 'Professora Fernanda',
      action: 'Conversar com a Professora',
      position: new THREE.Vector3(-0.6, 0, -4.5),
      radius: 3.2,
      icon: '👩‍🏫',
      room: 'classroom',
    },
    {
      id: 'courses_podium',
      name: 'Academia de Cursos',
      action: 'Acessar Aulas & Certificados',
      position: new THREE.Vector3(1.0, 0.8, -4.6),
      radius: 3.0,
      icon: '🎓',
      room: 'classroom',
    },
    {
      id: 'blackboard',
      name: 'Quadro Negro',
      action: 'Aprender Hiragana & Katakana',
      position: new THREE.Vector3(0, 1.8, -6.8),
      radius: 4.0,
      icon: '📋',
      room: 'classroom',
    },
    {
      id: 'writing_desk',
      name: 'Mesa de Caligrafia',
      action: 'Simulador de Ordem dos Traços',
      position: new THREE.Vector3(-2.8, 0.8, -1.0),
      radius: 2.8,
      icon: '🖌️',
      room: 'classroom',
    },
    {
      id: 'bookshelf',
      name: 'Estante de Vocabulário',
      action: 'Consultar Palavras & Kanji',
      position: new THREE.Vector3(4.5, 1.5, 0),
      radius: 3.0,
      icon: '📚',
      room: 'classroom',
    },
    {
      id: 'challenges_board',
      name: 'Mural de Avisos',
      action: 'Abrir Quiz e Áudio',
      position: new THREE.Vector3(-4.8, 1.5, 1.5),
      radius: 3.0,
      icon: '🎯',
      room: 'classroom',
    },
    {
      id: 'courtyard_door',
      name: 'Porta para o Pátio',
      action: 'Ir ao Pátio das Cerejeiras (桜)',
      position: new THREE.Vector3(4.8, 1.0, 4.5),
      radius: 2.6,
      icon: '🌸',
      room: 'classroom',
    },
    // Courtyard Hotspots
    {
      id: 'fernanda',
      name: 'Professora Fernanda',
      action: 'Conversa sob as Cerejeiras',
      position: new THREE.Vector3(0, 0, -2.5),
      radius: 3.2,
      icon: '👩‍🏫',
      room: 'courtyard',
    },
    {
      id: 'classroom_door',
      name: 'Porta da Escola',
      action: 'Voltar para a Sala de Aula 3-B',
      position: new THREE.Vector3(0, 1.0, 7.5),
      radius: 3.0,
      icon: '🏫',
      room: 'courtyard',
    },
    {
      id: 'sakura_tree',
      name: 'Grande Cerejeira (桜)',
      action: 'Admirar as Flores de Sakura',
      position: new THREE.Vector3(5.5, 0, -2.0),
      radius: 4.5,
      icon: '🌸',
      room: 'courtyard',
    },
    {
      id: 'torii_shrine',
      name: 'Portal Torii Tradicional',
      action: 'Meditação e Kanji',
      position: new THREE.Vector3(-5.0, 0, -4.0),
      radius: 4.0,
      icon: '⛩️',
      room: 'courtyard',
    },
  ];

  // Helper to trigger interaction
  const triggerCurrentInteraction = useCallback(
    (spotId: string) => {
      sound.playClick();
      if (spotId === 'courtyard_door') {
        onChangeRoom('courtyard');
        fpState.current.currentRoom = 'courtyard';
        fpState.current.position.set(0, 1.65, 5.5);
        fpState.current.yaw = Math.PI;
      } else if (spotId === 'classroom_door') {
        onChangeRoom('classroom');
        fpState.current.currentRoom = 'classroom';
        fpState.current.position.set(3.5, 1.65, 3.5);
        fpState.current.yaw = -Math.PI / 2;
      } else {
        onInteractWithObject(spotId);
      }
    },
    [onChangeRoom, onInteractWithObject]
  );

  const handleOkButton = useCallback(() => {
    sound.playClick();
    const currentSpot = nearbySpotRef.current || nearbySpot;
    if (currentSpot) {
      triggerCurrentInteraction(currentSpot.id);
    } else {
      let closest: InteractiveSpot3D | null = null;
      let minDistance = Infinity;
      hotspots3D.forEach((spot) => {
        if (spot.room === fpState.current.currentRoom) {
          const dist = spot.position.distanceTo(fpState.current.position);
          if (dist < minDistance) {
            minDistance = dist;
            closest = spot;
          }
        }
      });
      if (closest && minDistance < 5.0) {
        triggerCurrentInteraction((closest as InteractiveSpot3D).id);
      } else {
        triggerCurrentInteraction('fernanda');
      }
    }
  }, [nearbySpot, triggerCurrentInteraction, hotspots3D]);

  useEffect(() => {
    handleOkButtonRef.current = handleOkButton;
  }, [handleOkButton]);

  // Sync room changes
  useEffect(() => {
    fpState.current.currentRoom = playerRoom;
  }, [playerRoom]);

  // Main Three.js Scene Setup & Render Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Renderer Setup (PBR, sRGB, ToneMapping)
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Style the canvas
    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.innerHTML = '';
    container.appendChild(canvas);
    rendererRef.current = renderer;

    // 2. Camera Setup (First-person FOV 75)
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    cameraRef.current = camera;

    // 3. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#0c121e');
    scene.fog = new THREE.FogExp2('#0c121e', 0.035);

    // Studio Environment map using RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Lighting Rig (Key Warm Sunlight, Cool Hemisphere Fill)
    const hemiLight = new THREE.HemisphereLight('#fef08a', '#1e293b', 0.85);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight('#fffbeb', 1.8);
    sunLight.position.set(12, 18, 8);
    if (!isSoftwareGl) {
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 40;
      sunLight.shadow.camera.left = -12;
      sunLight.shadow.camera.right = 12;
      sunLight.shadow.camera.top = 12;
      sunLight.shadow.camera.bottom = -12;
      sunLight.shadow.bias = -0.0005;
    }
    scene.add(sunLight);

    // Interior Warm Ceiling Lights
    const interiorLight1 = new THREE.PointLight('#fed7aa', 1.2, 15);
    interiorLight1.position.set(0, 3.8, -2);
    scene.add(interiorLight1);

    const interiorLight2 = new THREE.PointLight('#fed7aa', 1.0, 15);
    interiorLight2.position.set(0, 3.8, 3);
    scene.add(interiorLight2);

    // --- PROCEDURAL TEXTURES ---
    // Wood Floor Texture
    const createWoodTexture = () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(0, 0, 512, 512);

      // Draw wood planks
      for (let y = 0; y < 512; y += 64) {
        ctx.fillStyle = y % 128 === 0 ? '#713f12' : '#9a3412';
        ctx.fillRect(0, y, 512, 60);
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, y + 62);
        ctx.lineTo(512, y + 62);
        ctx.stroke();

        // Staggered vertical seams
        for (let x = (y % 128 === 0 ? 0 : 128); x < 512; x += 256) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + 60);
          ctx.stroke();
        }
      }
      const texture = new THREE.CanvasTexture(c);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 4);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    // Blackboard Texture with Chalk writing
    const createBlackboardTexture = () => {
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 512;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#064e3b'; // dark green board
      ctx.fillRect(0, 0, 1024, 512);

      // Subtle chalk smudges
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 1024, Math.random() * 512, 20 + Math.random() * 40, 0, Math.PI * 2);
        ctx.fill();
      }

      // Chalk Text in Japanese
      ctx.font = 'bold 44px "Zen Maru Gothic", sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.fillText('日本語学園 3年B組', 512, 90);

      ctx.font = 'bold 32px "Zen Maru Gothic", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('本日の授業: ひらがな 46文字とカタカナ', 512, 160);

      ctx.font = 'bold 50px "Zen Maru Gothic", sans-serif';
      ctx.fillStyle = '#fed7aa';
      ctx.fillText('あ い う え お  /  か き く け こ', 512, 260);
      ctx.fillText('さ し す せ そ  /  た ち つ て と', 512, 340);

      ctx.font = '24px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('[Toque E para abrir a Tabela Completa de Kanas e Áudio]', 512, 440);

      const texture = new THREE.CanvasTexture(c);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    // Tatami / Poster Texture
    const createPosterTexture = (title: string, sub: string) => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, 500, 500);

      ctx.font = 'bold 46px "Zen Maru Gothic", sans-serif';
      ctx.fillStyle = '#9a3412';
      ctx.textAlign = 'center';
      ctx.fillText(title, 256, 120);

      ctx.font = 'bold 36px "Zen Maru Gothic", sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(sub, 256, 260);

      ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#b45309';
      ctx.fillText('日本語教室 · Nihongo Gakuen', 256, 420);

      const texture = new THREE.CanvasTexture(c);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    const woodTexture = createWoodTexture();
    const blackboardTexture = createBlackboardTexture();
    const posterTexture = createPosterTexture('学習目標', '毎日楽しく話そう！');

    // --- BUILD 3D ROOMS IN SCENE ---
    const classroomGroup = new THREE.Group();
    const courtyardGroup = new THREE.Group();
    scene.add(classroomGroup);
    scene.add(courtyardGroup);

    // ==========================================
    // 1. CLASSROOM ARCHITECTURE (Room A)
    // ==========================================
    // Floor
    const floorGeo = new THREE.PlaneGeometry(11, 15);
    const floorMat = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.45,
      metalness: 0.1,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = !isSoftwareGl;
    classroomGroup.add(floorMesh);

    // Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(11, 15);
    const ceilingMat = new THREE.MeshStandardMaterial({ color: '#fef3c7', roughness: 0.9 });
    const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceilingMesh.position.y = 4.2;
    ceilingMesh.rotation.x = Math.PI / 2;
    classroomGroup.add(ceilingMesh);

    // Front Wall (Blackboard Wall)
    const wallMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.85 });
    const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(11, 4.2), wallMat);
    frontWall.position.set(0, 2.1, -7.5);
    classroomGroup.add(frontWall);

    // Back Wall
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(11, 4.2), wallMat);
    backWall.position.set(0, 2.1, 7.5);
    backWall.rotation.y = Math.PI;
    classroomGroup.add(backWall);

    // Left Wall (Bulletin boards and windows)
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(15, 4.2), wallMat);
    leftWall.position.set(-5.5, 2.1, 0);
    leftWall.rotation.y = Math.PI / 2;
    classroomGroup.add(leftWall);

    // Right Wall (Corridor & Glass Windows)
    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(15, 4.2), wallMat);
    rightWall.position.set(5.5, 2.1, 0);
    rightWall.rotation.y = -Math.PI / 2;
    classroomGroup.add(rightWall);

    // --- Blackboard Mesh ---
    const boardGroup = new THREE.Group();
    const boardFrame = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 2.4, 0.12),
      new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.6 })
    );
    const boardFace = new THREE.Mesh(
      new THREE.PlaneGeometry(6.2, 2.2),
      new THREE.MeshStandardMaterial({ map: blackboardTexture, roughness: 0.5 })
    );
    boardFace.position.z = 0.07;
    boardGroup.add(boardFrame, boardFace);
    boardGroup.position.set(0, 2.2, -7.4);
    classroomGroup.add(boardGroup);

    // Teacher Podium Desk
    const podiumGroup = new THREE.Group();
    const podiumDesk = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 1.0, 0.9),
      new THREE.MeshStandardMaterial({ color: '#573010', roughness: 0.4 })
    );
    podiumDesk.position.y = 0.5;
    podiumDesk.castShadow = !isSoftwareGl;
    podiumGroup.add(podiumDesk);

    // Laptop / Tablet on Teacher desk
    const tablet = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.03, 0.3),
      new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.8, roughness: 0.2 })
    );
    tablet.position.set(0.3, 1.02, 0);
    podiumGroup.add(tablet);

    podiumGroup.position.set(0, 0, -4.8);
    classroomGroup.add(podiumGroup);

    // --- STUDENT DESKS & CHAIRS (Multi-part Composite Models) ---
    const deskRows = [-2.2, 0.2, 2.6];
    const deskCols = [-3.0, -1.0, 1.0, 3.0];

    deskRows.forEach((z) => {
      deskCols.forEach((x) => {
        const deskGroup = new THREE.Group();
        // Wooden top
        const deskTop = new THREE.Mesh(
          new THREE.BoxGeometry(1.1, 0.06, 0.7),
          new THREE.MeshStandardMaterial({ color: '#a16207', roughness: 0.35 })
        );
        deskTop.position.y = 0.75;
        deskTop.castShadow = !isSoftwareGl;

        // Metal frame legs
        const metalMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.6, roughness: 0.4 });
        const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.75), metalMat);
        leg1.position.set(0.48, 0.375, 0.28);
        const leg2 = leg1.clone();
        leg2.position.set(-0.48, 0.375, 0.28);
        const leg3 = leg1.clone();
        leg3.position.set(0.48, 0.375, -0.28);
        const leg4 = leg1.clone();
        leg4.position.set(-0.48, 0.375, -0.28);

        // Chair
        const chairGroup = new THREE.Group();
        const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.5), deskTop.material);
        chairSeat.position.y = 0.45;
        const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.04), deskTop.material);
        chairBack.position.set(0, 0.75, 0.22);
        const chairLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.45), metalMat);
        chairLeg.position.set(0.2, 0.225, 0.2);
        chairGroup.add(chairSeat, chairBack, chairLeg);
        chairGroup.position.set(0, 0, 0.6);

        // Japanese notebook on desk
        const notebook = new THREE.Mesh(
          new THREE.BoxGeometry(0.28, 0.02, 0.35),
          new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.7 })
        );
        notebook.position.set(-0.15, 0.79, 0);

        deskGroup.add(deskTop, leg1, leg2, leg3, leg4, chairGroup, notebook);
        deskGroup.position.set(x, 0, z);
        classroomGroup.add(deskGroup);
      });
    });

    // --- Bookshelf on Right Wall ---
    const shelfGroup = new THREE.Group();
    const shelfBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 3.0, 3.4),
      new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.7 })
    );
    shelfBody.position.y = 1.5;
    shelfGroup.add(shelfBody);

    // Colorful Book spines
    const bookColors = ['#f59e0b', '#ec4899', '#38bdf8', '#10b981', '#f43f5e'];
    for (let row = 0.6; row <= 2.4; row += 0.6) {
      for (let b = -1.4; b <= 1.4; b += 0.2) {
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(0.45, 0.42, 0.15),
          new THREE.MeshStandardMaterial({
            color: bookColors[Math.floor(Math.random() * bookColors.length)],
            roughness: 0.4,
          })
        );
        book.position.set(-0.18, row, b);
        shelfGroup.add(book);
      }
    }
    shelfGroup.position.set(5.0, 0, 0);
    classroomGroup.add(shelfGroup);

    // Bulletin Board on Left Wall
    const noticeBoard = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 1.8, 3.2),
      new THREE.MeshStandardMaterial({ map: posterTexture, roughness: 0.8 })
    );
    noticeBoard.position.set(-5.4, 2.0, 1.5);
    classroomGroup.add(noticeBoard);

    // ==========================================
    // 2. TEACHER FERNANDA - TOTEM DE FOTO EM TAMANHO REAL
    // ==========================================
    const createFernandaTotem = () => {
      const totem = new THREE.Group();

      // Shadow grounding disc
      const shadowDisc = new THREE.Mesh(
        new THREE.CircleGeometry(0.65, 24),
        new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.4 })
      );
      shadowDisc.rotation.x = -Math.PI / 2;
      shadowDisc.position.y = 0.005;
      totem.add(shadowDisc);

      // Heavy Mahogany Pedestal Stand Base
      const standBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.58, 0.65, 0.1, 32),
        new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.35, metalness: 0.15 })
      );
      standBase.position.y = 0.05;
      standBase.receiveShadow = !isSoftwareGl;
      totem.add(standBase);

      // Gold Brass Trim Ring on Base
      const goldRim = new THREE.Mesh(
        new THREE.TorusGeometry(0.59, 0.02, 16, 32),
        new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.85, roughness: 0.2 })
      );
      goldRim.rotation.x = Math.PI / 2;
      goldRim.position.y = 0.08;
      totem.add(goldRim);

      // Base Mounting Bracket Slot
      const slot = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.08, 0.18),
        new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.8, roughness: 0.25 })
      );
      slot.position.y = 0.11;
      totem.add(slot);

      // Realistic Photo Texture of Fernanda with black hair
      const photoLoader = new THREE.TextureLoader();
      const fernandaPhotoTex = photoLoader.load(
        '/src/assets/images/fernanda_black_hair_photo_1794012261628.jpg'
      );
      fernandaPhotoTex.colorSpace = THREE.SRGBColorSpace;

      // Double-sided Photo Cutout Plate of Fernanda
      const photoMat = new THREE.MeshStandardMaterial({
        map: fernandaPhotoTex,
        roughness: 0.2,
        metalness: 0.05,
        side: THREE.DoubleSide,
      });

      const photoPlate = new THREE.Mesh(
        new THREE.PlaneGeometry(1.1, 1.8),
        photoMat
      );
      photoPlate.position.set(0, 1.02, 0);
      photoPlate.castShadow = !isSoftwareGl;
      totem.add(photoPlate);

      // Acrylic Protective Backing with subtle transparency
      const acrylicBack = new THREE.Mesh(
        new THREE.BoxGeometry(1.16, 1.86, 0.025),
        new THREE.MeshStandardMaterial({
          color: '#ffffff',
          transparent: true,
          opacity: 0.2,
          roughness: 0.1,
          metalness: 0.1,
        })
      );
      acrylicBack.position.set(0, 1.02, -0.012);
      totem.add(acrylicBack);

      // Polished Brass Edge Bezel
      const frameBezel = new THREE.Mesh(
        new THREE.BoxGeometry(1.18, 1.88, 0.02),
        new THREE.MeshStandardMaterial({
          color: '#d97706',
          metalness: 0.85,
          roughness: 0.25,
          wireframe: true,
        })
      );
      frameBezel.position.set(0, 1.02, 0);
      totem.add(frameBezel);

      // Plaque on the Base
      const plaqueCanvas = document.createElement('canvas');
      plaqueCanvas.width = 512;
      plaqueCanvas.height = 140;
      const pctx = plaqueCanvas.getContext('2d')!;
      pctx.fillStyle = '#0f172a';
      pctx.roundRect(10, 10, 492, 120, 16);
      pctx.fill();
      pctx.strokeStyle = '#f59e0b';
      pctx.lineWidth = 6;
      pctx.stroke();

      pctx.font = 'bold 36px "Zen Maru Gothic", sans-serif';
      pctx.fillStyle = '#fef08a';
      pctx.textAlign = 'center';
      pctx.fillText('フェルナンダ先生 (Fernanda)', 256, 60);

      pctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
      pctx.fillStyle = '#e2e8f0';
      pctx.fillText('Totem Oficial · Toque [OK] para Falar', 256, 105);

      const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
      const plaqueMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.7, 0.2),
        new THREE.MeshBasicMaterial({ map: plaqueTex, transparent: true })
      );
      plaqueMesh.position.set(0, 0.18, 0.11);
      plaqueMesh.rotation.x = -0.25;
      totem.add(plaqueMesh);

      // Glowing 3D Interaction Beacon above Totem
      const tagCanvas = document.createElement('canvas');
      tagCanvas.width = 256;
      tagCanvas.height = 80;
      const tctx = tagCanvas.getContext('2d')!;
      tctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      tctx.roundRect(10, 10, 236, 60, 16);
      tctx.fill();
      tctx.strokeStyle = '#f59e0b';
      tctx.lineWidth = 4;
      tctx.stroke();
      tctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
      tctx.fillStyle = '#fef08a';
      tctx.textAlign = 'center';
      tctx.fillText('Fernanda Sensei [OK]', 128, 50);

      const tagTex = new THREE.CanvasTexture(tagCanvas);
      const tagSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: tagTex, transparent: true })
      );
      tagSprite.scale.set(1.4, 0.45, 1);
      tagSprite.position.set(0, 2.15, 0);
      totem.add(tagSprite);

      return totem;
    };

    const fernanda = createFernandaTotem();
    fernanda.position.set(0, 0, -4.5);
    classroomGroup.add(fernanda);
    fernandaMeshRef.current = fernanda;

    // Also add a matching Totem in Courtyard
    const courtyardFernanda = createFernandaTotem();
    courtyardFernanda.position.set(0, 0, -2.5);
    courtyardGroup.add(courtyardFernanda);

    // ==========================================
    // 3. COURTYARD ARCHITECTURE (Room B - Pátio Sakura)
    // ==========================================
    // Lawn Terrain
    const lawnGeo = new THREE.PlaneGeometry(36, 36);
    const lawnMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.85 });
    const lawnMesh = new THREE.Mesh(lawnGeo, lawnMat);
    lawnMesh.rotation.x = -Math.PI / 2;
    lawnMesh.receiveShadow = !isSoftwareGl;
    courtyardGroup.add(lawnMesh);

    // Stone pathway curving
    const pathGeo = new THREE.PlaneGeometry(3.5, 24);
    const pathMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.7 });
    const pathMesh = new THREE.Mesh(pathGeo, pathMat);
    pathMesh.rotation.x = -Math.PI / 2;
    pathMesh.position.set(0, 0.02, 0);
    courtyardGroup.add(pathMesh);

    // Traditional Torii Gate (Multi-part model)
    const toriiGroup = new THREE.Group();
    const toriiMat = new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.5 });
    const postGeo = new THREE.CylinderGeometry(0.25, 0.28, 5.0, 16);
    const leftPost = new THREE.Mesh(postGeo, toriiMat);
    leftPost.position.set(-2.0, 2.5, 0);
    const rightPost = new THREE.Mesh(postGeo, toriiMat);
    rightPost.position.set(2.0, 2.5, 0);

    // Top horizontal crossbeams
    const topBeam1 = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.4, 0.5), toriiMat);
    topBeam1.position.set(0, 5.0, 0);
    const topBeam2 = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.3, 0.35), toriiMat);
    topBeam2.position.set(0, 4.2, 0);

    toriiGroup.add(leftPost, rightPost, topBeam1, topBeam2);
    toriiGroup.position.set(-5.0, 0, -4.0);
    courtyardGroup.add(toriiGroup);

    // --- 3D Sakura Cherry Blossom Trees ---
    const createSakuraTree = (x: number, z: number, scale = 1.0) => {
      const tree = new THREE.Group();
      // Trunk
      const trunkMat = new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.85 });
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * scale, 0.5 * scale, 3.8 * scale, 12), trunkMat);
      trunk.position.y = 1.9 * scale;
      tree.add(trunk);

      // Pink Foliage clusters (Multi-part spheres)
      const foliageMat = new THREE.MeshStandardMaterial({
        color: '#f472b6',
        roughness: 0.75,
        emissive: '#be185d',
        emissiveIntensity: 0.08,
      });

      const cluster1 = new THREE.Mesh(new THREE.SphereGeometry(1.9 * scale, 12, 12), foliageMat);
      cluster1.position.set(0, 4.4 * scale, 0);
      const cluster2 = new THREE.Mesh(new THREE.SphereGeometry(1.4 * scale, 10, 10), foliageMat);
      cluster2.position.set(1.2 * scale, 4.0 * scale, 0.8 * scale);
      const cluster3 = new THREE.Mesh(new THREE.SphereGeometry(1.5 * scale, 10, 10), foliageMat);
      cluster3.position.set(-1.1 * scale, 4.2 * scale, -0.6 * scale);

      tree.add(cluster1, cluster2, cluster3);
      tree.position.set(x, 0, z);
      return tree;
    };

    courtyardGroup.add(createSakuraTree(5.5, -2.0, 1.2));
    courtyardGroup.add(createSakuraTree(-6.5, 4.0, 1.1));
    courtyardGroup.add(createSakuraTree(8.0, 6.0, 1.3));

    // Wooden park benches
    const benchGroup = new THREE.Group();
    const benchMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.6 });
    const benchPlank = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 0.6), benchMat);
    benchPlank.position.y = 0.5;
    const benchBack = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.45, 0.1), benchMat);
    benchBack.position.set(0, 0.8, -0.28);
    benchGroup.add(benchPlank, benchBack);
    benchGroup.position.set(2.5, 0, -1.0);
    courtyardGroup.add(benchGroup);

    // --- Drifting Sakura Petals Particle System ---
    const petalCount = 300;
    const petalGeo = new THREE.BufferGeometry();
    const petalPositions = new Float32Array(petalCount * 3);
    const petalVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < petalCount; i++) {
      petalPositions[i * 3] = (Math.random() - 0.5) * 30;
      petalPositions[i * 3 + 1] = Math.random() * 8 + 0.5;
      petalPositions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      petalVelocities.push({
        x: (Math.random() - 0.5) * 0.4,
        y: -0.4 - Math.random() * 0.6,
        z: (Math.random() - 0.5) * 0.4,
      });
    }

    petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPositions, 3));
    const petalMat = new THREE.PointsMaterial({
      color: '#fbcfe8',
      size: 0.15,
      transparent: true,
      opacity: 0.85,
    });
    const petalParticles = new THREE.Points(petalGeo, petalMat);
    scene.add(petalParticles);
    petalsRef.current = petalParticles;

    // 5. Input Handlers (Keyboard WASD, Arrow keys, Mouse Look / Drag / PointerLock)
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysHeld.current[k] = true;

      // Prevent scroll on arrows or space
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) {
        e.preventDefault();
      }

      // Interaction trigger: E, Space, Enter (OK)
      if (k === 'e' || k === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleOkButtonRef.current();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysHeld.current[e.key.toLowerCase()] = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === canvas) {
        // Pointer locked mode
        fpState.current.yaw -= e.movementX * 0.0022;
        fpState.current.pitch -= e.movementY * 0.0022;
        // Clamp vertical look angle
        fpState.current.pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, fpState.current.pitch));
      } else if (isDraggingMouse.current) {
        // Drag to look fallback
        const dx = e.clientX - previousMouse.current.x;
        const dy = e.clientY - previousMouse.current.y;
        previousMouse.current = { x: e.clientX, y: e.clientY };

        fpState.current.yaw -= dx * 0.004;
        fpState.current.pitch -= dy * 0.004;
        fpState.current.pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, fpState.current.pitch));
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      isDraggingMouse.current = true;
      previousMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingMouse.current = false;
    };

    const onPointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === canvas);
    };

    const onResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    window.addEventListener('resize', onResize);

    // 6. Game Animation Loop
    let lastTime = performance.now();
    let frameId = 0;

    const clock = new THREE.Clock();

    const tick = () => {
      const dt = Math.min(clock.getDelta(), 0.05);

      // Visibility based on room
      classroomGroup.visible = fpState.current.currentRoom === 'classroom';
      courtyardGroup.visible = fpState.current.currentRoom === 'courtyard';

      // Fernanda Idle Animation (subtle breathing & bob)
      if (fernandaMeshRef.current) {
        const time = performance.now() * 0.002;
        fernandaMeshRef.current.position.y = Math.sin(time) * 0.02;
      }

      // Update Falling Sakura Petals
      if (petalsRef.current) {
        const positions = petalsRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < petalCount; i++) {
          positions[i * 3 + 1] += petalVelocities[i].y * dt;
          positions[i * 3] += Math.sin(positions[i * 3 + 1] + i) * 0.8 * dt;

          if (positions[i * 3 + 1] < 0) {
            positions[i * 3 + 1] = 8.0;
            positions[i * 3] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
          }
        }
        petalsRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Camera Yaw Rotation via on-screen buttons or arrow keys
      if (keysHeld.current['btn_turn_left'] || keysHeld.current['arrowleft']) {
        fpState.current.yaw += 2.2 * dt;
      }
      if (keysHeld.current['btn_turn_right'] || keysHeld.current['arrowright']) {
        fpState.current.yaw -= 2.2 * dt;
      }

      // Movement Calculations (First Person)
      let moveForward = 0;
      let moveRight = 0;

      if (keysHeld.current['w'] || keysHeld.current['arrowup'] || keysHeld.current['btn_up']) moveForward += 1;
      if (keysHeld.current['s'] || keysHeld.current['arrowdown'] || keysHeld.current['btn_down']) moveForward -= 1;
      if (keysHeld.current['a'] || keysHeld.current['btn_left']) moveRight -= 1;
      if (keysHeld.current['d'] || keysHeld.current['btn_right']) moveRight += 1;

      const isMoving = moveForward !== 0 || moveRight !== 0;
      fpState.current.isMoving = isMoving;

      if (isMoving) {
        // Calculate forward and right vectors based on yaw
        const forward = new THREE.Vector3(-Math.sin(fpState.current.yaw), 0, -Math.cos(fpState.current.yaw));
        const right = new THREE.Vector3(Math.cos(fpState.current.yaw), 0, -Math.sin(fpState.current.yaw));

        const moveDir = new THREE.Vector3()
          .addScaledVector(forward, moveForward)
          .addScaledVector(right, moveRight)
          .normalize();

        fpState.current.position.addScaledVector(moveDir, fpState.current.speed * dt);

        // Footstep sound & Head bobbing
        fpState.current.stepTimer += dt;
        fpState.current.headBobTimer += dt * 10;
        if (fpState.current.stepTimer > 0.38) {
          fpState.current.stepTimer = 0;
          sound.playFootstep();
        }
      } else {
        fpState.current.headBobTimer = 0;
      }

      // Room Boundaries
      if (fpState.current.currentRoom === 'classroom') {
        fpState.current.position.x = Math.max(-5.0, Math.min(5.0, fpState.current.position.x));
        fpState.current.position.z = Math.max(-6.8, Math.min(6.8, fpState.current.position.z));
      } else {
        fpState.current.position.x = Math.max(-14.0, Math.min(14.0, fpState.current.position.x));
        fpState.current.position.z = Math.max(-14.0, Math.min(14.0, fpState.current.position.z));
      }

      // Head bobbing offset
      const headBobY = isMoving ? Math.sin(fpState.current.headBobTimer) * 0.05 : 0;
      camera.position.set(
        fpState.current.position.x,
        1.65 + headBobY,
        fpState.current.position.z
      );

      // Camera rotation based on yaw & pitch
      camera.rotation.order = 'YXZ';
      camera.rotation.y = fpState.current.yaw;
      camera.rotation.x = fpState.current.pitch;

      // Check proximity to 3D hotspots
      let closest: InteractiveSpot3D | null = null;
      let minDistance = Infinity;

      hotspots3D.forEach((spot) => {
        if (spot.room === fpState.current.currentRoom) {
          const dist = spot.position.distanceTo(fpState.current.position);
          if (dist < spot.radius && dist < minDistance) {
            minDistance = dist;
            closest = spot;
          }
        }
      });

      nearbySpotRef.current = closest;
      setNearbySpot(closest);

      // Render 3D Scene
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  // Request pointer lock on canvas click
  const handleCanvasClick = () => {
    const canvas = rendererRef.current?.domElement;
    if (canvas && !isPointerLocked) {
      canvas.requestPointerLock?.();
    }
    // Also trigger nearby hotspot if looking at it
    if (nearbySpot) {
      triggerCurrentInteraction(nearbySpot.id);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-stone-950 select-none">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-crosshair"
      />

      {/* First-Person Reticle / Crosshair */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div
          className={`w-3.5 h-3.5 rounded-full border-2 transition-transform duration-200 ${
            nearbySpot
              ? 'border-amber-400 bg-amber-400/40 scale-150'
              : 'border-white/50 bg-white/20'
          }`}
        />
      </div>

      {/* Low-Occlusion Top Status Cluster */}
      <div className="absolute top-3 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 bg-stone-900/90 border border-stone-800 px-4 py-2 rounded-xl backdrop-blur-xs pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold text-stone-200">
              {playerRoom === 'classroom'
                ? '🏫 3D: Sala de Aula 3-B (1ª Pessoa)'
                : '🌸 3D: Pátio Sakura (1ª Pessoa)'}
            </span>
          </div>
          <span className="text-stone-600">|</span>
          <span className="text-xs font-mono tabular-nums text-amber-400 font-bold">
            Nv. {level} · {xp} XP
          </span>
        </div>

        <div className="flex items-center gap-2 bg-stone-900/90 border border-stone-800 px-3 py-2 rounded-xl backdrop-blur-xs pointer-events-auto">
          <span className="font-jp text-amber-300 font-bold text-sm">あ</span>
          <span className="text-xs text-stone-300">
            Kanas dominados: <strong className="font-mono tabular-nums text-amber-400">{masteredCount}</strong> / 46
          </span>
        </div>
      </div>

      {/* On-Screen Touch / Mouse Controls HUD (Arrow Cursors + OK Button) */}
      <div className="absolute bottom-3 inset-x-3 z-30 pointer-events-none flex items-end justify-between gap-2 sm:gap-4">
        {/* Left: Directional Arrow Cursor Pad (Setas Direcionais) */}
        <div className="pointer-events-auto bg-stone-900/90 border border-stone-700/80 p-2 sm:p-2.5 rounded-2xl shadow-2xl backdrop-blur-xs select-none">
          <div className="text-[10px] uppercase font-mono tracking-wider text-amber-300/90 mb-1.5 text-center font-bold">
            Setas Direcionais
          </div>
          <div className="grid grid-cols-3 gap-1 sm:gap-1.5 w-32 sm:w-36">
            {/* Top Row: Turn Left, Forward (Up), Turn Right */}
            <button
              title="Girar Olhar para a Esquerda (⟲)"
              onMouseDown={() => (keysHeld.current['btn_turn_left'] = true)}
              onMouseUp={() => (keysHeld.current['btn_turn_left'] = false)}
              onMouseLeave={() => (keysHeld.current['btn_turn_left'] = false)}
              onTouchStart={(e) => { e.stopPropagation(); keysHeld.current['btn_turn_left'] = true; }}
              onTouchEnd={(e) => { e.stopPropagation(); keysHeld.current['btn_turn_left'] = false; }}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-stone-800/90 hover:bg-stone-700 active:bg-amber-500 active:text-stone-950 border border-stone-600/60 rounded-xl flex items-center justify-center text-amber-300 font-bold transition-colors shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              title="Avançar (▲)"
              onMouseDown={() => (keysHeld.current['btn_up'] = true)}
              onMouseUp={() => (keysHeld.current['btn_up'] = false)}
              onMouseLeave={() => (keysHeld.current['btn_up'] = false)}
              onTouchStart={(e) => { e.stopPropagation(); keysHeld.current['btn_up'] = true; }}
              onTouchEnd={(e) => { e.stopPropagation(); keysHeld.current['btn_up'] = false; }}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-stone-800/90 hover:bg-stone-700 active:bg-amber-500 active:text-stone-950 border border-stone-600/60 rounded-xl flex items-center justify-center text-white active:text-stone-950 font-bold transition-colors shadow-sm cursor-pointer"
            >
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              title="Girar Olhar para a Direita (⟳)"
              onMouseDown={() => (keysHeld.current['btn_turn_right'] = true)}
              onMouseUp={() => (keysHeld.current['btn_turn_right'] = false)}
              onMouseLeave={() => (keysHeld.current['btn_turn_right'] = false)}
              onTouchStart={(e) => { e.stopPropagation(); keysHeld.current['btn_turn_right'] = true; }}
              onTouchEnd={(e) => { e.stopPropagation(); keysHeld.current['btn_turn_right'] = false; }}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-stone-800/90 hover:bg-stone-700 active:bg-amber-500 active:text-stone-950 border border-stone-600/60 rounded-xl flex items-center justify-center text-amber-300 font-bold transition-colors shadow-sm cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Bottom Row: Strafe Left, Backward (Down), Strafe Right */}
            <button
              title="Passo Esquerda (◀)"
              onMouseDown={() => (keysHeld.current['btn_left'] = true)}
              onMouseUp={() => (keysHeld.current['btn_left'] = false)}
              onMouseLeave={() => (keysHeld.current['btn_left'] = false)}
              onTouchStart={(e) => { e.stopPropagation(); keysHeld.current['btn_left'] = true; }}
              onTouchEnd={(e) => { e.stopPropagation(); keysHeld.current['btn_left'] = false; }}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-stone-800/90 hover:bg-stone-700 active:bg-amber-500 active:text-stone-950 border border-stone-600/60 rounded-xl flex items-center justify-center text-white active:text-stone-950 font-bold transition-colors shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              title="Recuar (▼)"
              onMouseDown={() => (keysHeld.current['btn_down'] = true)}
              onMouseUp={() => (keysHeld.current['btn_down'] = false)}
              onMouseLeave={() => (keysHeld.current['btn_down'] = false)}
              onTouchStart={(e) => { e.stopPropagation(); keysHeld.current['btn_down'] = true; }}
              onTouchEnd={(e) => { e.stopPropagation(); keysHeld.current['btn_down'] = false; }}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-stone-800/90 hover:bg-stone-700 active:bg-amber-500 active:text-stone-950 border border-stone-600/60 rounded-xl flex items-center justify-center text-white active:text-stone-950 font-bold transition-colors shadow-sm cursor-pointer"
            >
              <ArrowDown className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              title="Passo Direita (▶)"
              onMouseDown={() => (keysHeld.current['btn_right'] = true)}
              onMouseUp={() => (keysHeld.current['btn_right'] = false)}
              onMouseLeave={() => (keysHeld.current['btn_right'] = false)}
              onTouchStart={(e) => { e.stopPropagation(); keysHeld.current['btn_right'] = true; }}
              onTouchEnd={(e) => { e.stopPropagation(); keysHeld.current['btn_right'] = false; }}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-stone-800/90 hover:bg-stone-700 active:bg-amber-500 active:text-stone-950 border border-stone-600/60 rounded-xl flex items-center justify-center text-white active:text-stone-950 font-bold transition-colors shadow-sm cursor-pointer"
            >
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Center: Dynamic Proximity Look-At Banner / Help Toggle */}
        <div className="flex flex-col items-center gap-2 pb-1 max-w-xs text-center">
          {nearbySpot && (
            <button
              onClick={handleOkButton}
              className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-xl border-2 border-amber-200 transform hover:scale-105 active:scale-95 transition-all cursor-pointer animate-bounce"
            >
              <span className="text-lg">{nearbySpot.icon}</span>
              <span className="truncate">{nearbySpot.name}: {nearbySpot.action}</span>
              <span className="text-[10px] bg-stone-950 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                [OK]
              </span>
            </button>
          )}

          {controlsHintVisible ? (
            <div className="pointer-events-auto flex items-center gap-2.5 bg-stone-950/85 border border-stone-800/90 px-3.5 py-1 rounded-full text-[10px] font-mono text-stone-300 shadow-lg">
              <span>Setas / WASD Mover</span>
              <span className="text-stone-600">·</span>
              <span>Mouse / Arrastar Olhar</span>
              <span className="text-stone-600">·</span>
              <button
                onClick={() => setControlsHintVisible(false)}
                className="text-stone-500 hover:text-stone-300 underline cursor-pointer"
              >
                ocultar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setControlsHintVisible(true)}
              className="pointer-events-auto bg-stone-950/80 border border-stone-800 px-3 py-1 rounded-full text-[10px] text-stone-400 hover:text-stone-200 cursor-pointer"
            >
              Mostrar Ajuda ▴
            </button>
          )}
        </div>

        {/* Right: The Prominent [ OK ] Action Button */}
        <div className="pointer-events-auto flex flex-col items-center gap-1">
          <button
            onClick={handleOkButton}
            title="Ação / Interagir / Confirmar [OK]"
            className={`relative group flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl font-black transition-all transform hover:scale-105 active:scale-95 shadow-2xl border-3 cursor-pointer select-none ${
              nearbySpot
                ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-stone-950 border-amber-200 shadow-amber-500/50 ring-4 ring-amber-400/40 animate-pulse'
                : 'bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 border-amber-300/80 shadow-stone-950/80 hover:brightness-110'
            }`}
          >
            <span className="text-2xl sm:text-3xl font-mono tracking-tight font-black leading-none">
              OK
            </span>
            <span className="text-[10px] sm:text-[11px] font-sans font-extrabold uppercase tracking-wider text-stone-950/90 mt-1 px-2 py-0.5 rounded-md bg-stone-950/15">
              {nearbySpot ? 'Interagir' : 'Ação'}
            </span>
            {nearbySpot && (
              <span className="text-sm absolute -top-2 -right-2 bg-stone-900 border border-amber-400 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                {nearbySpot.icon}
              </span>
            )}
          </button>
          <span className="text-[10px] font-mono font-bold text-stone-400 tracking-wider">
            [OK] / Enter
          </span>
        </div>
      </div>
    </div>
  );
};
