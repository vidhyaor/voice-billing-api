import type { FastifyReply, FastifyRequest } from "fastify";
import { successResponse } from "../../utils/response.js";
import type { AuthService } from "./auth.service.js";
import type {
  LoginInput,
  LogoutInput,
  RefreshTokenInput,
  RegisterInput,
} from "./validation/auth.validation.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (
    request: FastifyRequest<{ Body: RegisterInput }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const result = await this.authService.register(request.body);
    reply.status(201).send(successResponse(result));
  };

  login = async (
    request: FastifyRequest<{ Body: LoginInput }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const result = await this.authService.login(request.body);
    reply.send(successResponse(result));
  };

  refresh = async (
    request: FastifyRequest<{ Body: RefreshTokenInput }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const result = await this.authService.refresh(request.body);
    reply.send(successResponse(result));
  };

  logout = async (
    request: FastifyRequest<{ Body: LogoutInput }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const result = await this.authService.logout(request.body);
    reply.send(successResponse(result));
  };

  me = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const profile = await this.authService.getCurrentUser(request.user.sub);
    reply.send(successResponse(profile));
  };
}
