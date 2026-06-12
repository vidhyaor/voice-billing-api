export type QuantitySource = "digit" | "malayalam" | "english" | "default";

export interface QuantityExtractionResult {
  quantity: number;
  remainder: string;
  source: QuantitySource;
}

const MALAYALAM_ONES: Record<string, number> = {
  ഒന്ന്: 1,
  രണ്ട്: 2,
  മൂന്ന്: 3,
  നാല്: 4,
  അഞ്ച്: 5,
  ആറ്: 6,
  ഏഴ്: 7,
  എട്ട്: 8,
  ഒൻപത്: 9,
  പത്ത്: 10,
  പതിനൊന്ന്: 11,
  പന്ത്രണ്ട്: 12,
};

const MALAYALAM_TENS: Record<string, number> = {
  ഇരുപത്: 20,
  ഇരുപത്ത്: 20,
  മുപ്പത്: 30,
  മുപ്പത്ത്: 30,
  നാൽപത്: 40,
  നാൽപത്ത്: 40,
  അമ്പത്: 50,
  അമ്പത്ത്: 50,
  നൂറ്: 100,
};

const ENGLISH_WORD_NUMBERS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  hundred: 100,
};

const MALAYALAM_PHRASES = buildMalayalamPhraseMap();

function buildMalayalamPhraseMap(): Map<string, number> {
  const phrases = new Map<string, number>();

  for (const [word, value] of Object.entries(MALAYALAM_ONES)) {
    phrases.set(word, value);
  }

  for (const [word, value] of Object.entries(MALAYALAM_TENS)) {
    phrases.set(word, value);
  }

  for (const [tensWord, tensValue] of Object.entries(MALAYALAM_TENS)) {
    if (tensValue === 100) {
      continue;
    }

    const tensStem = tensWord.endsWith("്") ? tensWord : `${tensWord}്`;

    for (const [onesWord, onesValue] of Object.entries(MALAYALAM_ONES)) {
      if (onesValue >= 10) {
        continue;
      }

      phrases.set(`${tensStem} ${onesWord}`, tensValue + onesValue);
      phrases.set(`${tensWord} ${onesWord}`, tensValue + onesValue);
    }
  }

  return phrases;
}

function normalizeInput(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

function getMalayalamPhrasesByLength(): Array<[string, number]> {
  return [...MALAYALAM_PHRASES.entries()].sort(
    (a, b) => b[0].length - a[0].length,
  );
}

export function parseMalayalamNumber(text: string): number | null {
  const normalized = normalizeInput(text);

  if (!normalized) {
    return null;
  }

  const direct = MALAYALAM_PHRASES.get(normalized);

  if (direct !== undefined) {
    return direct;
  }

  return null;
}

function matchLeadingMalayalamPhrase(text: string): {
  value: number;
  matchedText: string;
} | null {
  const normalized = normalizeInput(text);

  for (const [phrase, value] of getMalayalamPhrasesByLength()) {
    if (normalized === phrase) {
      return { value, matchedText: phrase };
    }

    if (normalized.startsWith(`${phrase} `)) {
      return { value, matchedText: phrase };
    }
  }

  return null;
}

export function extractQuantity(text: string): QuantityExtractionResult {
  const trimmed = text.trim();

  if (!trimmed) {
    return {
      quantity: 1,
      remainder: "",
      source: "default",
    };
  }

  const numericMatch = trimmed.match(/^(\d+(?:\.\d+)?)(?:\s+([\s\S]+))?$/u);

  if (numericMatch) {
    return {
      quantity: Number(numericMatch[1]),
      remainder: (numericMatch[2] ?? "").trim(),
      source: "digit",
    };
  }

  const malayalamMatch = matchLeadingMalayalamPhrase(trimmed);

  if (malayalamMatch) {
    const remainder = trimmed.slice(malayalamMatch.matchedText.length).trim();

    return {
      quantity: malayalamMatch.value,
      remainder,
      source: "malayalam",
    };
  }

  const firstToken = trimmed.split(/\s+/u)[0] ?? "";
  const englishQuantity = ENGLISH_WORD_NUMBERS[firstToken.toLowerCase()];

  if (englishQuantity !== undefined) {
    const remainder = trimmed.slice(firstToken.length).trim();

    return {
      quantity: englishQuantity,
      remainder,
      source: "english",
    };
  }

  return {
    quantity: 1,
    remainder: trimmed,
    source: "default",
  };
}
