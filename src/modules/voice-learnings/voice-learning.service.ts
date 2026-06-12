import type { FastifyInstance } from "fastify";
import { ConflictError, NotFoundError } from "../../utils/errors.js";
import { handlePrismaError } from "../../utils/prisma-error.js";
import {
  buildPaginationMeta,
  getPaginationParams,
} from "../../utils/pagination.js";
import type {
  PaginatedVoiceLearningsDto,
  VoiceLearningDto,
} from "./dto/voice-learning.dto.js";
import {
  VoiceLearningRepository,
  type VoiceLearningWithProduct,
} from "./voice-learning.repository.js";
import type {
  UpdateVoiceLearningInput,
  VoiceLearningListQuery,
} from "./validation/voice-learning.validation.js";

export class VoiceLearningService {
  private readonly voiceLearningRepository: VoiceLearningRepository;

  constructor(fastify: FastifyInstance) {
    this.voiceLearningRepository = new VoiceLearningRepository(fastify.prisma);
  }

  async list(
    query: VoiceLearningListQuery,
  ): Promise<PaginatedVoiceLearningsDto> {
    const { page, limit, productId, q, sortBy, sortOrder } = query;
    const { skip, take } = getPaginationParams(page, limit);

    const [items, total] = await this.voiceLearningRepository.findMany({
      filters: { productId, q },
      skip,
      take,
      sortBy,
      sortOrder,
    });

    return {
      items: items.map((item) => this.toDto(item)),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async update(
    id: string,
    input: UpdateVoiceLearningInput,
  ): Promise<VoiceLearningDto> {
    const existing = await this.voiceLearningRepository.findById(id);

    if (!existing) {
      throw new NotFoundError("Voice learning mapping not found");
    }

    if (input.productId) {
      const productExists = await this.voiceLearningRepository.productExists(
        input.productId,
      );

      if (!productExists) {
        throw new NotFoundError("Product not found");
      }
    }

    if (input.phrase && input.phrase !== existing.phrase) {
      const duplicate = await this.voiceLearningRepository.findByPhrase(
        input.phrase,
      );

      if (duplicate) {
        throw new ConflictError("Phrase is already mapped to a product");
      }
    }

    try {
      const learning = await this.voiceLearningRepository.update(id, input);
      return this.toDto(learning);
    } catch (error) {
      handlePrismaError(error, {
        P2002: "Phrase is already mapped to a product",
        P2003: "Product not found",
        P2025: "Voice learning mapping not found",
      });
    }
  }

  async delete(id: string): Promise<void> {
    const existing = await this.voiceLearningRepository.findById(id);

    if (!existing) {
      throw new NotFoundError("Voice learning mapping not found");
    }

    try {
      await this.voiceLearningRepository.delete(id);
    } catch (error) {
      handlePrismaError(error, { P2025: "Voice learning mapping not found" });
    }
  }

  private toDto(learning: VoiceLearningWithProduct): VoiceLearningDto {
    return {
      id: learning.id,
      phrase: learning.phrase,
      usageCount: learning.usageCount,
      lastUsedAt: learning.lastUsedAt,
      productId: learning.productId,
      product: learning.product,
    };
  }
}
