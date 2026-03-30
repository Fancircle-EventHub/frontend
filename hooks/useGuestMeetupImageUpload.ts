"use client";

import { useCallback, useState } from "react";
import { usePresignGuestUploadMutation } from "@/apis/guestUpload.api";
import { uploadFileToPresignedUrl } from "@/lib/r2-upload";

export type GuestMeetupImageUploadStatus = "idle" | "presigning" | "uploading" | "success" | "error";

const TYPE = "guest_meetup_image" as const;

export function useGuestMeetupImageUpload(eventId: string) {
  const [presignGuestUpload] = usePresignGuestUploadMutation();
  const [status, setStatus] = useState<GuestMeetupImageUploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
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
          type: TYPE,
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
    uploadFile,
    status,
    error,
    progress,
    previewObjectUrl,
    lastKey,
    lastPublicUrl,
    reset,
  };
}
