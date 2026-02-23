import { lbphPredict } from "./lbph-client";

export type FaceVerifyResult =
  | { ok: true; nim_nip: string; confidence?: number }
  | { ok: false; message: string; confidence?: number };

/**
 * Shared face verification used by login (verify-face), clock-in, and clock-out.
 * Calls LBPH predict and checks recognized + nim_nip === employeeCode.
 */
export async function verifyFaceForUser(
  imageBase64: string,
  employeeCode: string
): Promise<FaceVerifyResult> {
  let lbphResult;
  try {
    lbphResult = await lbphPredict(imageBase64);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Face service error.";
    return { ok: false, message: msg };
  }

  if (!lbphResult.recognized || lbphResult.nim_nip === undefined) {
    return {
      ok: false,
      message: lbphResult.message || "Face not recognized.",
      confidence: lbphResult.confidence,
    };
  }

  if (lbphResult.nim_nip !== employeeCode) {
    return {
      ok: false,
      message: "Face does not match this account.",
      confidence: lbphResult.confidence,
    };
  }

  return {
    ok: true,
    nim_nip: lbphResult.nim_nip,
    confidence: lbphResult.confidence,
  };
}
