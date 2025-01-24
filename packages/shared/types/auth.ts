export interface Profile {
  id: string;
  updated_at: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  preferences: Record<string, any>;
  role: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: {
    can_view_dashboard?: boolean;
    can_manage_users?: boolean;
    [key: string]: boolean | undefined;
  };
}

export interface UserRole {
  user_id: string;
  role_id: string;
}

export type ProfileUpdateRequest = Partial<Omit<Profile, 'id' | 'updated_at'>>;

export interface AuthState {
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: Role[];
}
