import type { Role } from "@prisma/client";

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: UserDto;
}

export interface LogoutResponseDto {
  message: string;
}
