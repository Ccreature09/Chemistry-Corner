export interface Answer {
  answer: string;
  [key: string]: any;
}

export interface Question {
  questionTitle: string;
  questionTime: number;
  questionPoints: number;
  answers: Answer[];
  correctAnswer: number;
  [key: string]: any;
}

export interface Quiz {
  quizName: string;
  questionIntermission: number;
  quizCode: number;
  hasBonusPoints: boolean;
  maxBonusPoints: number;
  questions: Question[];
  [key: string]: any;
}
