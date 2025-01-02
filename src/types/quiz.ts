export interface Question {
  question: string;
  options: string[];
  correct_answers: string[];
  explanation?: string;
}

export interface Quiz {
  title: string;
  description?: string;
  time_limit?: number | null;
  shuffle_questions: boolean;
  shuffle_answers: boolean;
  questions: Question[];
}