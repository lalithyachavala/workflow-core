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

const faceVerifyAttempts = new Map<string, { count: number; firstAttemptAt: number }>();
const FACE_VERIFY_WINDOW_MS = 2 * 60 * 1000; // 2 min
const FACE_VERIFY_MAX = 30;

export function checkFaceVerifyRateLimit(userId: string) {
  const now = Date.now();
  const key = `face:${userId}`;
  const entry = faceVerifyAttempts.get(key);
  if (!entry) {
    faceVerifyAttempts.set(key, { count: 1, firstAttemptAt: now });
    return { allowed: true };
  }
  if (now - entry.firstAttemptAt > FACE_VERIFY_WINDOW_MS) {
    faceVerifyAttempts.set(key, { count: 1, firstAttemptAt: now });
    return { allowed: true };
  }
  entry.count += 1;
  faceVerifyAttempts.set(key, entry);
  return { allowed: entry.count <= FACE_VERIFY_MAX };
}
