export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type CoachPersona = 'warm_encouraging' | 'rigorous_interviewer' | 'native_casual' | 'ielts_examiner';

export interface GrammarCorrection {
  original: string;
  corrected: string;
  explanation: string;
  rule: string;
}

export interface VocabularyUpgrade {
  originalWord: string;
  betterAlternatives: string[];
  contextExplanation: string;
}

export interface PronunciationTip {
  word: string;
  phoneticIpa: string;
  tip: string;
  stressNote: string;
}

export interface LanguageFeedback {
  cefrRating: string;
  overallEncouragement: string;
  fluencyAdvice: string;
  grammarCorrections: GrammarCorrection[];
  vocabularyUpgrades: VocabularyUpgrade[];
  pronunciationTips: PronunciationTip[];
  suggestedResponses: string[];
}

export interface Message {
  id: string;
  role: 'coach' | 'user';
  text: string;
  timestamp: number;
  feedback?: LanguageFeedback;
  audioBase64?: string;
  isPlaying?: boolean;
}

export interface Scenario {
  id: string;
  title: string;
  category: 'interview' | 'workplace' | 'travel' | 'social' | 'ielts' | 'custom';
  role: string;
  userRole: string;
  level: CefrLevel;
  description: string;
  objective: string;
  initialCoachMessage: string;
  suggestedPrompts: string[];
  icon: string;
}

export interface PronunciationDrill {
  id: string;
  title: string;
  category: 'minimal_pairs' | 'tricky_clusters' | 'connected_speech' | 'tongue_twisters';
  focusSound: string;
  targetPhrase: string;
  phoneticIpa: string;
  instruction: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface PronunciationEvaluation {
  matchScore: number;
  phoneticBreakdown: string;
  trickyPhonemes: string[];
  mouthAndTongueTip: string;
  audioDrillWords: string[];
  encouragement: string;
}

export interface SavedVocabularyItem {
  id: string;
  term: string;
  category: 'grammar' | 'vocabulary' | 'pronunciation';
  context: string;
  correctionOrAlternative: string;
  notes: string;
  addedAt: number;
  timesPracticed: number;
  mastered: boolean;
}

export interface SessionDiagnostic {
  overallCefrScore: string;
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
  pronunciationScore: number;
  keyStrengths: string[];
  growthAreas: string[];
  recommendedVocabularyList: Array<{
    term: string;
    definition: string;
    example: string;
  }>;
  personalizedActionPlan: string[];
}
