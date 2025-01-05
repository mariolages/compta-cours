export interface Profile {
  id: string;
  full_name: string | null;
  is_admin: boolean;
  is_validated: boolean;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
  email?: string;
}

export interface UserProfile extends Profile {
  email: string;
}