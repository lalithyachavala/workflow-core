export const env = {
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/workforce",
  accessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-me",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me",
  accessTokenTtlMinutes: Number(process.env.ACCESS_TOKEN_TTL_MINUTES || "15"),
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS || "30"),
  geoFallbackCountry: process.env.GEOIP_FALLBACK_COUNTRY || "Unknown",
  /** 32-byte hex key for AES-GCM embedding encryption. Generate: openssl rand -hex 32 */
  faceEmbeddingKey: process.env.FACE_EMBEDDING_KEY || "0000000000000000000000000000000000000000000000000000000000000000",
  /** LBPH face service URL (e.g. http://localhost:8000) for face verification. */
  lbphServiceUrl: process.env.LBPH_FACE_SERVICE_URL || "http://localhost:8000",
};
