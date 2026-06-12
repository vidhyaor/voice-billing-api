const MULTIPLIERS: Record<string, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

export function parseDurationToMs(duration: string): number {
  const match = duration.trim().match(/^(\d+)([smhd])$/i);

  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multiplier = MULTIPLIERS[unit];

  return value * multiplier;
}

export function addDurationToDate(duration: string, from = new Date()): Date {
  return new Date(from.getTime() + parseDurationToMs(duration));
}
