import type { Prisma, PrismaClient, VoiceLearning } from "@prisma/client";
import type {
  LearningSortField,
  SortOrder,
  UpdateVoiceLearningInput,
} from "./validation/voice-learning.validation.js";

const voiceLearningInclude = {
  product: {
    select: {
      id: true,
      productCode: true,
      name: true,
    },
  },
} satisfies Prisma.VoiceLearningInclude;

export type VoiceLearningWithProduct = Prisma.VoiceLearningGetPayload<{
  include: typeof voiceLearningInclude;
}>;

export interface VoiceLearningListFilters {
  productId?: string;
  q?: string;
}

export interface VoiceLearningListOptions {
  filters: VoiceLearningListFilters;
  skip: number;
  take: number;
  sortBy: LearningSortField;
  sortOrder: SortOrder;
}

export class VoiceLearningRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findById(id: string): Promise<VoiceLearningWithProduct | null> {
    return this.prisma.voiceLearning.findUnique({
      where: { id },
      include: voiceLearningInclude,
    });
  }

  findByPhrase(phrase: string): Promise<VoiceLearning | null> {
    return this.prisma.voiceLearning.findUnique({
      where: { phrase },
    });
  }

  productExists(productId: string): Promise<boolean> {
    return this.prisma.product
      .findUnique({
        where: { id: productId },
        select: { id: true },
      })
      .then((product) => product !== null);
  }

  update(
    id: string,
    data: UpdateVoiceLearningInput,
  ): Promise<VoiceLearningWithProduct> {
    return this.prisma.voiceLearning.update({
      where: { id },
      data: {
        ...(data.phrase !== undefined && { phrase: data.phrase }),
        ...(data.productId !== undefined && { productId: data.productId }),
      },
      include: voiceLearningInclude,
    });
  }

  delete(id: string): Promise<VoiceLearning> {
    return this.prisma.voiceLearning.delete({ where: { id } });
  }

  findMany(
    options: VoiceLearningListOptions,
  ): Promise<[VoiceLearningWithProduct[], number]> {
    const where = this.buildWhere(options.filters);
    const orderBy = {
      [options.sortBy]: options.sortOrder,
    } as Prisma.VoiceLearningOrderByWithRelationInput;

    return Promise.all([
      this.prisma.voiceLearning.findMany({
        where,
        skip: options.skip,
        take: options.take,
        include: voiceLearningInclude,
        orderBy,
      }),
      this.prisma.voiceLearning.count({ where }),
    ]);
  }

  private buildWhere(
    filters: VoiceLearningListFilters,
  ): Prisma.VoiceLearningWhereInput {
    const where: Prisma.VoiceLearningWhereInput = {};

    if (filters.productId) {
      where.productId = filters.productId;
    }

    if (filters.q) {
      where.phrase = { contains: filters.q };
    }

    return where;
  }
}
