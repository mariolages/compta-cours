export interface File {
  id: string;
  title: string;
  category: {
    id: number;
    name: string;
  };
  subject: {
    id: number;
    code: string;
    name: string;
  };
  created_at: string;
  file_path: string;
}