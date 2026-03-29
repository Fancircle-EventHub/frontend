"use client";

import { useCallback, useState } from "react";
import { usePresignGuestUploadMutation } from "@/apis/guestUpload.api";
import { useRegisterGuestEventMediaMutation } from "@/apis/guest.api";
import { uploadFileToPresignedUrl } from "@/lib/r2-upload";
import type { UploadType } from "@/types/upload.types";

export type GuestGalleryUploadStatus = "idle" | "presigning" | "uploading" | "registering" | "success" | "error";

const GALLERY_TYPE: UploadType = "guest_event_gallery";

export function useGuestEventGalleryUpload(eventId: string, accessCode: string) {
  const [presignGuestUpload] = usePresignGuestUploadMutation();
  const [registerMedia] = useRegisterGuestEventMediaMutation();
  const [status, setStatus] = useState<GuestGalleryUploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      setProgress(0);
      const contentType = file.type || (file.name.toLowerCase().endsWith(".mp4") ? "video/mp4" : "image/jpeg");

      try {
        setStatus("presigning");
        const envelope = await presignGuestUpload({
          type: GALLERY_TYPE,
          filename: file.name,
          content_type: contentType,
          event_id: eventId,
          byte_size: file.size,
        }).unwrap();

        const presign = envelope.data;
        setStatus("uploading");
        const result = await uploadFileToPresignedUrl(presign, file, (r) => setProgress(r));
        setStatus("registering");
        await registerMedia({
          accessCode,
          body: { storage_key: result.key, mime_type: contentType },
        }).unwrap();
        setStatus("success");
        return result.key;
      } catch (e) {
        setStatus("error");
        const msg = e instanceof Error ? e.message : "Upload failed";
        setError(msg);
        throw e;
      }
    },
    [accessCode, eventId, presignGuestUpload, registerMedia],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setProgress(0);
  }, []);

  return { uploadFile, status, error, progress, reset };
}
