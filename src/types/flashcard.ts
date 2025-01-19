export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: number;
  user_id: string;
  subject_id?: number;
  next_review?: string;
  created_at?: string;
}