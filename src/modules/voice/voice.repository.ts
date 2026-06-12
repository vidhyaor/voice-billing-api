import type { PrismaClient } from "@prisma/client";
import type { VoiceSearchEntry } from "./utils/fuse-search.js";

export class VoiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getSearchCatalog(): Promise<VoiceSearchEntry[]> {
    const products = await this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        productCode: true,
        aliases: {
          select: { alias: true },
        },
        voiceLearnings: {
          select: { phrase: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const catalog: VoiceSearchEntry[] = [];

    for (const product of products) {
      catalog.push({
        productId: product.id,
        productName: product.name,
        searchText: product.name,
        source: "name",
      });

      catalog.push({
        productId: product.id,
        productName: product.name,
        searchText: product.productCode,
        source: "code",
      });

      for (const { alias } of product.aliases) {
        catalog.push({
          productId: product.id,
          productName: product.name,
          searchText: alias,
          source: "alias",
        });
      }

      for (const { phrase } of product.voiceLearnings) {
        catalog.push({
          productId: product.id,
          productName: product.name,
          searchText: phrase,
          source: "learning",
        });
      }
    }

    return catalog;
  }

  async incrementAliasUsage(productId: string, matchedText: string): Promise<void> {
    await this.prisma.productAlias.updateMany({
      where: {
        productId,
        alias: matchedText,
      },
      data: {
        usageCount: { increment: 1 },
      },
    });
  }

  async upsertVoiceLearning(productId: string, phrase: string): Promise<void> {
    await this.prisma.voiceLearning.upsert({
      where: { phrase },
      create: {
        phrase,
        productId,
        usageCount: 1,
        lastUsedAt: new Date(),
      },
      update: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
  }
}
