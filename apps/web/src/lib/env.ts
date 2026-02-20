export const env = {
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/workforce",
  accessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-me",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me",
  accessTokenTtlMinutes: Number(process.env.ACCESS_TOKEN_TTL_MINUTES || "15"),
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS || "30"),
  geoFallbackCountry: process.env.GEOIP_FALLBACK_COUNTRY || "Unknown",
};
