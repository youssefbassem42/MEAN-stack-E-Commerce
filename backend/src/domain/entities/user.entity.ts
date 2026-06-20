export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role?: string;
  isEmailVerified: boolean;
  refreshTokenHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
