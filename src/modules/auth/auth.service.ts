import bcrypt from "bcrypt";
import type { FastifyInstance } from "fastify";
import type { User } from "@prisma/client";
import { env } from "../../config/env.js";
import { BCRYPT_SALT_ROUNDS } from "../../constants/index.js";
import { addDurationToDate } from "../../utils/duration.js";
import {
  ForbiddenError,
  ConflictError,
  UnauthorizedError,
} from "../../utils/errors.js";
import { generateRefreshToken, hashToken } from "../../utils/token.js";
import type {
  AuthTokensDto,
  LogoutResponseDto,
  UserDto,
} from "./dto/auth.dto.js";
import { AuthRepository } from "./auth.repository.js";
import type {
  LoginInput,
  LogoutInput,
  RefreshTokenInput,
  RegisterInput,
} from "./validation/auth.validation.js";

export class AuthService {
  private readonly authRepository: AuthRepository;

  constructor(private readonly fastify: FastifyInstance) {
    this.authRepository = new AuthRepository(fastify.prisma);
  }

  async register(input: RegisterInput): Promise<AuthTokensDto> {
    const existing = await this.authRepository.findByEmail(input.email);

    if (existing) {
      throw new ConflictError("Email is already registered");
    }

    const password = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);
    const user = await this.authRepository.create({ ...input, password });

    return this.issueTokens(user);
  }

  async login(input: LoginInput): Promise<AuthTokensDto> {
    const user = await this.authRepository.findByEmail(input.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isValid = await bcrypt.compare(input.password, user.password);

    if (!isValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    return this.issueTokens(user);
  }

  async refresh(input: RefreshTokenInput): Promise<AuthTokensDto> {
    const tokenHash = hashToken(input.refreshToken);
    const storedToken =
      await this.authRepository.findValidRefreshToken(tokenHash);

    if (!storedToken || !storedToken.user.isActive) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    await this.authRepository.revokeRefreshToken(tokenHash);

    return this.issueTokens(storedToken.user);
  }

  async logout(input: LogoutInput): Promise<LogoutResponseDto> {
    const tokenHash = hashToken(input.refreshToken);
    const result = await this.authRepository.revokeRefreshToken(tokenHash);

    if (result.count === 0) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    return { message: "Logged out successfully" };
  }

  async getCurrentUser(userId: string): Promise<UserDto> {
    const user = await this.authRepository.findActiveById(userId);

    if (!user) {
      throw new UnauthorizedError("User not found or inactive");
    }

    return this.toUserDto(user);
  }

  async verifyActiveUser(userId: string): Promise<void> {
    const user = await this.authRepository.findActiveById(userId);

    if (!user) {
      throw new ForbiddenError("Account is inactive or not found");
    }
  }

  private async issueTokens(user: User): Promise<AuthTokensDto> {
    const accessToken = this.fastify.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken();
    const tokenHash = hashToken(refreshToken);

    await this.authRepository.createRefreshToken({
      tokenHash,
      userId: user.id,
      expiresAt: addDurationToDate(env.JWT_REFRESH_EXPIRES_IN),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      user: this.toUserDto(user),
    };
  }

  private toUserDto(user: User): UserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
