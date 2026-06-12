import type { FastifyInstance } from "fastify";
import { UsersRepository } from "./users.repository.js";

export class UsersService {
  private readonly usersRepository: UsersRepository;

  constructor(fastify: FastifyInstance) {
    this.usersRepository = new UsersRepository(fastify.prisma);
  }

  list() {
    return this.usersRepository.findAll();
  }
}
