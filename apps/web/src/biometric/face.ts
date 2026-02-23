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

/** L2-normalize embedding to unit length. */
function l2Normalize(vec: number[]): number[] {
  let na = 0;
  for (let i = 0; i < vec.length; i += 1) {
    na += vec[i] * vec[i];
  }
  const norm = Math.sqrt(na);
  if (norm < 1e-12) return vec.map(() => 0);
  return vec.map((v) => v / norm);
}

/** Cosine similarity per spec. Assumes L2-normalized vectors for dot = similarity. */
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
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
  const normalized = l2Normalize(embedding);
  const field = pose === "front" ? "embeddingFront" : pose === "left" ? "embeddingLeft" : "embeddingRight";
  const encrypted = encryptEmbedding(normalized);
  await FaceTemplate.findOneAndUpdate(
    { userId },
    { [field]: encrypted, modelVersion: MODEL_VERSION, status: "active" },
    { upsert: true, new: true },
  );
  if (profileImageBase64 && profileImageBase64.length > 20) {
    await updateProfilePicture(userId, profileImageBase64);
  }
}

export type VerifyFaceParams = {
  userId: string;
  embedding: number[];
  livenessPassed: boolean;
};

/** Verify incoming embedding against stored poses. Uses strict threshold 0.80. */
export async function verifyFace(params: VerifyFaceParams) {
  const { userId, embedding, livenessPassed } = params;
  if (!Array.isArray(embedding) || embedding.length !== 512) {
    return { score: 0, accepted: false, reason: "invalid_embedding" as const };
  }
  if (!livenessPassed) {
    return { score: 0, accepted: false, reason: "liveness_failed" as const };
  }
  const normalized = l2Normalize(embedding);
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

  const scores = stored.map((s) => cosineSimilarity(normalized, s));
  const bestScore = Math.max(...scores);

  // Strict threshold per spec: same person 0.80–0.95, different person <0.55
  const THRESHOLD = 0.8;
  const accepted = bestScore >= THRESHOLD;

  return {
    score: bestScore,
    accepted,
    reason: accepted ? ("matched" as const) : ("below_threshold" as const),
  };
}
