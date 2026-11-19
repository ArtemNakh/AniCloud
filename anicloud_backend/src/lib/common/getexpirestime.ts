export function getExpirationDate(expiresIn: string | undefined, fallback = '7d'): Date {
  const raw = (expiresIn ?? fallback).trim();

  // Якщо в .env вказано просто число секунд, наприклад "604800"
  if (/^\d+$/.test(raw)) {
    return new Date(Date.now() + Number(raw) * 1000);
  }

  const match = raw.match(/^(\d+)\s*(s|m|h|d|w)$/i);
  if (!match) {
    throw new Error(`Invalid duration format: "${expiresIn}"`);
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  const unitToMs: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };

  return new Date(Date.now() + value * unitToMs[unit]);
}