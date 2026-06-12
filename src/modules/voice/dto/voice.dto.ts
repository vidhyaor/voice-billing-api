export interface VoiceMatchDto {
  productId: string;
  productName: string;
  score: number;
  matchedText?: string;
  source?: "name" | "code" | "alias" | "learning";
}

export interface VoiceProcessResponseDto {
  originalText: string;
  normalizedText: string;
  quantity: number;
  searchText: string;
  matches: VoiceMatchDto[];
}
