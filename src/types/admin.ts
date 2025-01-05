export interface Profile {
  id: string;
  full_name: string | null;
  is_admin: boolean;
  is_validated: boolean;
  is_banned: boolean | null;
  email?: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  is_admin: boolean;
  is_validated: boolean;
  is_banned: boolean | null;
  email?: string;
}