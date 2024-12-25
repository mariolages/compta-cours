export interface Subject {
  id: number;
  code: string;
  name: string;
}

export interface File {
  id: string;
  title: string;
  subject: Subject;
  category: {
    name: string;
  };
  created_at: string;
}