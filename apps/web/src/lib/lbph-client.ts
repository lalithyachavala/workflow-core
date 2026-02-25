import { env } from "@/src/lib/env";

export type LBPHPredictResponse = {
  recognized: boolean;
  person_id?: number;
  nama?: string;
  nim_nip?: string;
  confidence?: number;
  message?: string;
};

export type LBPHRegisteredIdsResponse = {
  ids: string[];
  persons: { nim_nip: string; nama: string }[];
};

const baseUrl = env.lbphServiceUrl.replace(/\/$/, "");

export async function lbphPredict(imageBase64: string): Promise<LBPHPredictResponse> {
  const res = await fetch(`${baseUrl}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_base64: imageBase64 }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LBPH predict failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<LBPHPredictResponse>;
}

export async function lbphGetRegisteredIds(): Promise<LBPHRegisteredIdsResponse> {
  const res = await fetch(`${baseUrl}/registered-ids`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LBPH registered-ids failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<LBPHRegisteredIdsResponse>;
}

export type LBPHRegisterResponse = {
  ok: boolean;
  person_id?: number;
  message?: string;
};

export async function lbphRegister(
  nim_nip: string,
  nama: string,
  images_base64: string[]
): Promise<LBPHRegisterResponse> {
  const res = await fetch(`${baseUrl}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nim_nip, nama, images_base64 }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LBPH register failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<LBPHRegisterResponse>;
}
