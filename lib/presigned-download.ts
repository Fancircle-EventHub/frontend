import type { PresignDownloadData } from "@/types/upload.types";

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

export async function fetchPresignedDownloadUrl(
  key: string,
  getToken: () => string | null,
): Promise<PresignDownloadData> {
  const token = getToken();
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/uploads/presign-download`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ key }),
  });
  const body = (await res.json()) as { success?: boolean; data?: PresignDownloadData; message?: string };
  if (!res.ok || !body.success || !body.data) {
    throw new Error(body.message ?? "Could not resolve download URL");
  }
  return body.data;
}
