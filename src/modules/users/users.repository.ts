import type { PrismaClient } from "@prisma/client";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

export class UsersRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll() {
    return this.prisma.user.findMany({
      select: userSelect,
      orderBy: { createdAt: "desc" },
    });
  }
}
