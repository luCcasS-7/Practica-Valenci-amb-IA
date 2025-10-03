
export type Level = 'B1' | 'B2' | 'C1' | 'C2';

export type Skill = 'Comprensió' | 'Estructures Lingüístiques' | 'Expressió Escrita' | 'Expressió Oral';

export type View = 'menu' | 'skill_selection' | 'exercise' | 'exam' | 'test_nivel' | 'history';

export interface ExerciseData {
  sentence: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ExamQuestion extends ExerciseData {}

export interface HistoryItem {
  level: Level;
  exercise: ExerciseData;
  selectedAnswer: string;
  isCorrect: boolean;
  timestamp: number;
}

export interface ExamSettings {
  numQuestions: number;
  timePerQuestion: number;
}
