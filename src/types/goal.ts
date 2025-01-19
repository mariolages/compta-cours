export interface Goal {
  id: string;
  title: string;
  completed: boolean;
  target_date: string;
  user_id: string;
  subject_id?: number;
  created_at?: string;
}