export interface User {
  id: string;
  email: string;
  organizationId: string;
  roleId: string;
  createdAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  organizationId: string;
  roleId: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: Omit<User, 'password'>;
}
