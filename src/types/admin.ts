export interface UserProfile {
  id: string;
  full_name: string | null;
  is_admin: boolean;
  is_validated: boolean;
  email?: string;
}