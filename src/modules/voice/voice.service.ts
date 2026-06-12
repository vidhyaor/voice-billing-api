import type { FastifyInstance } from "fastify";
import type { VoiceProcessResponseDto } from "./dto/voice.dto.js";
import { searchWithFuse } from "./utils/fuse-search.js";
import { parseVoiceText } from "./utils/text-normalizer.js";
import type { VoiceProcessInput } from "./validation/voice.validation.js";
import { VoiceRepository } from "./voice.repository.js";

export class VoiceService {
  private readonly voiceRepository: VoiceRepository;
  private catalogCache: {
    expiresAt: number;
    entries: Awaited<ReturnType<VoiceRepository["getSearchCatalog"]>>;
  } | null = null;

  private static readonly CATALOG_TTL_MS = 60_000;

  constructor(fastify: FastifyInstance) {
    this.voiceRepository = new VoiceRepository(fastify.prisma);
  }

  async process(input: VoiceProcessInput): Promise<VoiceProcessResponseDto> {
    const parsed = parseVoiceText(input.text);
    const catalog = await this.getCatalog();

    const fuseMatches = searchWithFuse(
      parsed.searchText,
      catalog,
      input.limit,
    );

    await this.recordLearning(fuseMatches, parsed.searchText);

    return {
      originalText: parsed.originalText,
      normalizedText: parsed.normalizedText,
      quantity: parsed.quantity,
      searchText: parsed.searchText,
      matches: fuseMatches.map(({ productId, productName, score }) => ({
        productId,
        productName,
        score,
      })),
    };
  }

  private async getCatalog() {
    const now = Date.now();

    if (this.catalogCache && this.catalogCache.expiresAt > now) {
      return this.catalogCache.entries;
    }

    const entries = await this.voiceRepository.getSearchCatalog();

    this.catalogCache = {
      entries,
      expiresAt: now + VoiceService.CATALOG_TTL_MS,
    };

    return entries;
  }

  private async recordLearning(
    matches: Array<{
      productId: string;
      score: number;
      source: "name" | "code" | "alias" | "learning";
      matchedText: string;
    }>,
    searchText: string,
  ): Promise<void> {
    const topMatch = matches[0];

    if (!topMatch) {
      return;
    }

    if (topMatch.source === "alias") {
      await this.voiceRepository.incrementAliasUsage(
        topMatch.productId,
        topMatch.matchedText,
      );
    }

    if (topMatch.score >= 80) {
      await this.voiceRepository.upsertVoiceLearning(
        topMatch.productId,
        searchText,
      );
    }
  }
}
