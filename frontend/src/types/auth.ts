export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  permissions: string[];
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}
