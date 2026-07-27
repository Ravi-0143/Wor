export interface WordEntry {
  id: string;
  word: string;
  stars: number; // 2 to 5
  meaning: string;
  hindiMeaning?: string;
  coreSynonyms: string[];
  advancedSynonyms: string[];
  antonyms: string[];
  wordFamily?: string;
  examAnswers: string[];
  traps?: string;
  crossReference?: string; // e.g. "Abdurate -> See Obdurate"
  category: string; // e.g., "A Words", "N Words", "O Words"
}

export interface LegendItem {
  symbol: string;
  meaning: string;
}

export interface RevisionGuideData {
  title: string;
  subtitle: string;
  legend: LegendItem[];
  tips: string[];
  words: WordEntry[];
  categories: string[];
  rawMarkdown: string;
  sourceUrl?: string;
  loadedAt: string;
}

export interface AtlasScene {
  id: string;
  name: 'Arrival' | 'Orientation' | 'Observation' | 'Interaction' | 'Experiment' | 'Challenge' | 'Reflection';
  title: string;
  subtitle: string;
  iconName: string;
}

export interface AtlasExperience {
  id: string;
  title: string;
  subject: 'Lexicon & Language' | 'Wave Physics & Light' | 'Cellular Machinery' | 'Orbital Mechanics';
  concept: string;
  difficulty: 'Intuitive' | 'Foundational' | 'Intermediate' | 'Advanced' | 'Research-Grade';
  wonderLevel: number;
  durationMinutes: number;
  description: string;
  tags: string[];
}

export interface QuizQuestion {
  id: string;
  word: WordEntry;
  type: 'synonym' | 'antonym' | 'meaning' | 'trap' | 'exam_answer';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizResult {
  score: number;
  total: number;
  answers: {
    questionId: string;
    selected: string;
    isCorrect: boolean;
  }[];
}

