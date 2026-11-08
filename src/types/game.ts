export type GameMode =
  | 'TITLE'
  | 'EXPLORE_SCHOOL'
  | 'COURSES'
  | 'KANA_CHART'
  | 'STROKE_WRITING'
  | 'CHALLENGE_QUIZ'
  | 'AUDIO_CHALLENGE'
  | 'CONVERSATION'
  | 'WORDS_KANJI'
  | 'MEDALS';

export type KanaType = 'hiragana' | 'katakana';

export interface StrokePoint {
  x: number;
  y: number;
}

export interface StrokeGuide {
  index: number;
  points: StrokePoint[];
  directionHint: string;
}

export interface KanaItem {
  id: string;
  char: string;
  romaji: string;
  type: KanaType;
  row: string; // 'a', 'ka', 'sa', 'ta', 'na', 'ha', 'ma', 'ya', 'ra', 'wa', 'n'
  strokeCount: number;
  strokes: StrokeGuide[];
  mnemonicPt: string;
  exampleWord: {
    jp: string;
    romaji: string;
    pt: string;
  };
}

export interface VocabularyWord {
  id: string;
  jp: string;
  romaji: string;
  pt: string;
  category: 'escola' | 'saudacoes' | 'dia-a-dia' | 'alimentos';
  difficulty: 1 | 2 | 3;
  hiraganaReading?: string;
}

export interface KanjiItem {
  id: string;
  char: string;
  meaningPt: string;
  kunyomi: string;
  onyomi: string;
  strokeCount: number;
  radicals?: string;
  examples: {
    word: string;
    reading: string;
    meaningPt: string;
  }[];
}

export interface DialogueOption {
  textPt: string;
  textJp: string;
  romaji: string;
  isBestResponse: boolean;
  replyFernanda: string;
  replyRomaji: string;
  replyPt: string;
  xpReward: number;
}

export interface DialogueStep {
  fernandaJp: string;
  fernandaRomaji: string;
  fernandaPt: string;
  options: DialogueOption[];
}

export interface DialogueScenario {
  id: string;
  title: string;
  context: string;
  location: string;
  steps: DialogueStep[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export interface PlayerProgress {
  xp: number;
  level: number;
  sakuraCoins: number;
  masteredChars: string[];
  completedQuizzes: number;
  perfectStrokes: number;
  unlockedKatakana: boolean;
  unlockedWords: boolean;
  unlockedKanji: boolean;
  unlockedConversations: boolean;
  currentRoom: 'classroom' | 'courtyard';
  completedLessons: string[];
}

export interface CourseLesson {
  id: string;
  courseId: string;
  title: string;
  durationMinutes: number;
  overview: string;
  fernandaTeaching: string;
  examples: {
    jp: string;
    reading: string;
    meaningPt: string;
  }[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  xpReward: number;
}

export interface Course {
  id: string;
  title: string;
  japaneseTitle: string;
  description: string;
  levelBadge: string;
  icon: string;
  tagColor: string;
  totalXp: number;
  certificateName: string;
  lessons: CourseLesson[];
}
