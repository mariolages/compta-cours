export interface Subject {
  id: number;
  code: string;
  name: string;
  created_at: string;
}

export interface File {
  id: string;
  title: string;
  created_at: string;
  file_path: string;
  subject: {
    id: number;
    code: string;
    name: string;
  };
  category: {
    id: number;
    name: string;
  };
}