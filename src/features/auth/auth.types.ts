import type { UserRole } from '@/features/users/users.types';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
};

export type Credentials = {
  email: string;
  password: string;
};

export type Session = {
  token: string;
  user: AuthUser;
};
