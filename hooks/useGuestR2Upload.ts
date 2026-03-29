"use client";

import { useCallback, useState } from "react";
import { usePresignGuestUploadMutation } from "@/apis/guestUpload.api";
import { uploadFileToPresignedUrl } from "@/lib/r2-upload";
import type { UploadType } from "@/types/upload.types";

export type GuestR2UploadStatus = "idle" | "presigning" | "uploading" | "success" | "error";

const GUEST_AVATAR_TYPE: UploadType = "guest_profile_avatar";

export function useGuestR2Upload(eventId: string) {
  const [presignGuestUpload] = usePresignGuestUploadMutation();
  const [status, setStatus] = useState<GuestR2UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [lastPublicUrl, setLastPublicUrl] = useState<string | null>(null);

  const revokePreview = useCallback(() => {
    setPreviewObjectUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      setProgress(0);
      revokePreview();
      const blobPreview = URL.createObjectURL(file);
      setPreviewObjectUrl(blobPreview);

      try {
        setStatus("presigning");
        const envelope = await presignGuestUpload({
          type: GUEST_AVATAR_TYPE,
          filename: file.name,
          content_type: file.type || "image/jpeg",
          event_id: eventId,
          byte_size: file.size,
        }).unwrap();

        const presign = envelope.data;
        setStatus("uploading");
        const result = await uploadFileToPresignedUrl(presign, file, (r) => setProgress(r));
        setLastKey(result.key);
        setLastPublicUrl(result.publicUrl);
        setStatus("success");
        return { key: result.key, publicUrl: result.publicUrl };
      } catch (e) {
        setStatus("error");
        const msg = e instanceof Error ? e.message : "Upload failed";
        setError(msg);
        throw e;
      }
    },
    [eventId, presignGuestUpload, revokePreview],
  );

  const reset = useCallback(() => {
    revokePreview();
    setStatus("idle");
    setError(null);
    setProgress(0);
    setLastKey(null);
    setLastPublicUrl(null);
  }, [revokePreview]);

  return {
    status,
    error,
    progress,
    previewObjectUrl,
    lastKey,
    lastPublicUrl,
    uploadFile,
    reset,
    revokePreview,
  };
}
