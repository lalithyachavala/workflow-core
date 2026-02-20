const attempts = new Map<string, { count: number; firstAttemptAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export function checkRateLimit(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry) {
    attempts.set(key, { count: 1, firstAttemptAt: now });
    return { allowed: true };
  }

  if (now - entry.firstAttemptAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttemptAt: now });
    return { allowed: true };
  }

  entry.count += 1;
  attempts.set(key, entry);
  return { allowed: entry.count <= MAX_ATTEMPTS };
}
