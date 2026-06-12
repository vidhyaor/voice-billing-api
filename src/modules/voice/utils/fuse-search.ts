import Fuse from "fuse.js";

export interface VoiceSearchEntry {
  productId: string;
  productName: string;
  searchText: string;
  source: "name" | "code" | "alias" | "learning";
}

export interface VoiceFuseMatch {
  productId: string;
  productName: string;
  score: number;
  matchedText: string;
  source: VoiceSearchEntry["source"];
}

const DEFAULT_LIMIT = 5;

export function searchWithFuse(
  query: string,
  catalog: VoiceSearchEntry[],
  limit = DEFAULT_LIMIT,
): VoiceFuseMatch[] {
  if (!query.trim() || catalog.length === 0) {
    return [];
  }

  const fuse = new Fuse(catalog, {
    keys: ["searchText", "productName"],
    includeScore: true,
    threshold: 0.45,
    ignoreLocation: true,
    minMatchCharLength: 2,
    distance: 100,
  });

  const results = fuse.search(query, { limit: limit * 3 });
  const bestByProduct = new Map<string, VoiceFuseMatch>();

  for (const result of results) {
    const item = result.item;
    const fuseScore = result.score ?? 1;
    const matchScore = Math.max(0, Math.min(100, Math.round((1 - fuseScore) * 100)));

    const existing = bestByProduct.get(item.productId);

    if (!existing || matchScore > existing.score) {
      bestByProduct.set(item.productId, {
        productId: item.productId,
        productName: item.productName,
        score: matchScore,
        matchedText: item.searchText,
        source: item.source,
      });
    }
  }

  return [...bestByProduct.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
