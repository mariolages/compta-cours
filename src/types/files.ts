export interface File {
  id: string;
  title: string;
  file_path: string;
  subject_id: number;
  category_id: number;
  user_id: string;
  created_at: string;
  subject: {
    id: number;
    name: string;
    code: string;
  };
  category: {
    id: number;
    name: string;
  };
}