import crypto from "crypto";
import { FaceTemplate, User } from "@/src/db/models";

export async function updateProfilePicture(userId: string, imageBase64: string) {
  await User.findByIdAndUpdate(userId, {
    "profile.profilePictureBase64": imageBase64,
  });
}

function imageToEmbedding(imageBase64: string) {
  const digest = crypto.createHash("sha256").update(imageBase64).digest();
  return Array.from(digest).map((b) => b / 255);
}

function cosineSimilarity(a: number[], b: number[]) {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < len; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  if (magA === 0 || magB === 0) {
    return 0;
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export async function enrollFace(userId: string, imageBase64: string) {
  const embedding = imageToEmbedding(imageBase64);
  await FaceTemplate.findOneAndUpdate(
    { userId },
    { embeddingVector: embedding, status: "active" },
    { upsert: true, new: true },
  );
  await updateProfilePicture(userId, imageBase64);
}

export async function verifyFace(userId: string, imageBase64: string) {
  const template = await FaceTemplate.findOne({ userId }).lean();
  if (!template?.embeddingVector?.length) {
    return { score: 0, accepted: false, reason: "no_template" as const };
  }

  const incoming = imageToEmbedding(imageBase64);
  const score = cosineSimilarity(template.embeddingVector, incoming);
  const accepted = score >= 0.78;
  return { score, accepted, reason: accepted ? "matched" : ("below_threshold" as const) };
}
