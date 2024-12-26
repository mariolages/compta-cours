export interface File {
  id: string;
  title: string;
  subject: {
    id: number;
    code: string;
    name: string;
  };
  category: {
    id: number;
    name: string;
  };
  created_at: string;
  file_path: string;
}

export type { Subject } from './subject';