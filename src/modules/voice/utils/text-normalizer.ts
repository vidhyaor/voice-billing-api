import { extractQuantity } from "../../../services/malayalam-number.service.js";

export interface ParsedVoiceText {
  originalText: string;
  normalizedText: string;
  quantity: number;
  searchText: string;
  quantitySource: "digit" | "malayalam" | "english" | "default";
}

export function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseVoiceText(text: string): ParsedVoiceText {
  const originalText = text.trim();
  const normalizedText = normalizeText(originalText);

  if (!normalizedText) {
    return {
      originalText,
      normalizedText,
      quantity: 1,
      searchText: "",
      quantitySource: "default",
    };
  }

  const { quantity, remainder, source } = extractQuantity(normalizedText);

  return {
    originalText,
    normalizedText,
    quantity,
    searchText: remainder,
    quantitySource: source,
  };
}
