import crypto from "crypto";
import { FaceTemplate, User } from "@/src/db/models";
import { env } from "@/src/lib/env";

const MODEL_VERSION = 1;
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const ALGORITHM = "aes-256-gcm";

function getKeyBuffer(): Buffer {
  const hex = env.faceEmbeddingKey.replace(/[^0-9a-fA-F]/g, "");
  if (hex.length !== 64) {
    throw new Error("FACE_EMBEDDING_KEY must be 32-byte hex (64 chars). Generate: openssl rand -hex 32");
  }
  return Buffer.from(hex, "hex");
}

function encryptEmbedding(embedding: number[]): string {
  const key = getKeyBuffer();
  const iv = crypto.randomBytes(IV_LENGTH);
  const plain = Buffer.from(Float32Array.from(embedding).buffer);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

function decryptEmbedding(encryptedBase64: string): number[] {
  const key = getKeyBuffer();
  const buf = Buffer.from(encryptedBase64, "base64");
  if (buf.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error("Invalid encrypted embedding");
  }
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return Array.from(new Float32Array(plain.buffer, plain.byteOffset, plain.length / 4));
}

function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < len; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export async function updateProfilePicture(userId: string, imageBase64: string) {
  await User.findByIdAndUpdate(userId, {
    "profile.profilePictureBase64": imageBase64,
  });
}

type Pose = "front" | "left" | "right";

/** Enroll one pose embedding. Call 3 times (front, left, right) to complete enrollment. */
export async function enrollFace(userId: string, embedding: number[], pose: Pose, profileImageBase64?: string) {
  if (!Array.isArray(embedding) || embedding.length !== 512) {
    throw new Error("Embedding must be 512 floats");
  }
  const field = pose === "front" ? "embeddingFront" : pose === "left" ? "embeddingLeft" : "embeddingRight";
  const encrypted = encryptEmbedding(embedding);
  await FaceTemplate.findOneAndUpdate(
    { userId },
    { [field]: encrypted, modelVersion: MODEL_VERSION, status: "active" },
    { upsert: true, new: true },
  );
  if (profileImageBase64 && profileImageBase64.length > 20) {
    await updateProfilePicture(userId, profileImageBase64);
  }
}

/** Verify incoming embedding against stored poses. Returns best score across front/left/right. */
export async function verifyFace(userId: string, embedding: number[]) {
  if (!Array.isArray(embedding) || embedding.length !== 512) {
    return { score: 0, accepted: false, reason: "invalid_embedding" as const };
  }
  const template = await FaceTemplate.findOne({ userId }).lean();
  if (!template) {
    return { score: 0, accepted: false, reason: "no_template" as const };
  }

  const stored: number[][] = [];
  for (const field of ["embeddingFront", "embeddingLeft", "embeddingRight"] as const) {
    const enc = template[field];
    if (enc && typeof enc === "string") {
      try {
        stored.push(decryptEmbedding(enc));
      } catch {
        // skip invalid
      }
    }
  }

  // Legacy: single embeddingVector
  if (stored.length === 0 && template.embeddingVector?.length === 512) {
    stored.push(template.embeddingVector);
  }

  if (stored.length === 0) {
    return { score: 0, accepted: false, reason: "no_template" as const };
  }

  let bestScore = 0;
  for (const s of stored) {
    const score = cosineSimilarity(embedding, s);
    if (score > bestScore) bestScore = score;
  }

  const threshold = 0.32; // ArcFace cosine similarity; same person usually 0.4+
  const accepted = bestScore >= threshold;
  return {
    score: bestScore,
    accepted,
    reason: accepted ? ("matched" as const) : ("below_threshold" as const),
  };
}
