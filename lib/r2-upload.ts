import type { PresignUploadData } from "@/types/upload.types";

export type DirectUploadResult = {
  key: string;
  publicUrl: string | null;
};

const UPLOAD_FAILED_HINT =
  "Upload failed. If the presign request succeeded, configure R2 bucket CORS for your frontend origin (GET, PUT, HEAD).";

export async function uploadFileToPresignedUrl(
  presign: PresignUploadData,
  file: File,
  onProgress?: (ratio: number) => void,
): Promise<DirectUploadResult> {
  const headers = new Headers();
  for (const [name, value] of Object.entries(presign.headers)) {
    if (value) headers.set(name, value);
  }
  if (!headers.has("Content-Type") && file.type) {
    headers.set("Content-Type", file.type);
  }

  if (onProgress && typeof XMLHttpRequest !== "undefined") {
    await xhrPutWithProgress(presign.upload_url, file, headers, onProgress);
  } else {
    const res = await fetch(presign.upload_url, {
      method: "PUT",
      headers,
      body: file,
      credentials: "omit",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Upload failed (${res.status}): ${text || res.statusText}`);
    }
  }

  return { key: presign.key, publicUrl: presign.public_url };
}

function xhrPutWithProgress(
  url: string,
  file: File,
  headers: Headers,
  onProgress: (ratio: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable && ev.total > 0) {
        onProgress(ev.loaded / ev.total);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      if (xhr.status === 0) {
        reject(new Error(UPLOAD_FAILED_HINT));
        return;
      }
      reject(new Error(`Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error(UPLOAD_FAILED_HINT));
    headers.forEach((value, name) => {
      xhr.setRequestHeader(name, value);
    });
    xhr.send(file);
  });
}
