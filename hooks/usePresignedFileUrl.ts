"use client";

import { useEffect, useMemo, useState } from "react";
import { usePresignDownloadMutation } from "@/apis/upload.api";

type Resolved = {
  key: string;
  url: string | null;
  expiresAt: string | null;
  error: string | null;
};

export function usePresignedFileUrl(storageRef: string | null | undefined) {
  const [presignDownload] = usePresignDownloadMutation();
  const [serverResult, setServerResult] = useState<Resolved | null>(null);

  const isHttp = useMemo(
    () =>
      !!storageRef &&
      (storageRef.startsWith("http://") || storageRef.startsWith("https://")),
    [storageRef],
  );

  const match = useMemo(() => {
    if (!storageRef || isHttp) return null;
    if (!serverResult || serverResult.key !== storageRef) return null;
    return serverResult;
  }, [storageRef, isHttp, serverResult]);

  const url = useMemo(() => {
    if (!storageRef) return null;
    if (isHttp) return storageRef;
    return match?.url ?? null;
  }, [storageRef, isHttp, match]);

  const loading = useMemo(() => {
    if (!storageRef || isHttp) return false;
    return !serverResult || serverResult.key !== storageRef;
  }, [storageRef, isHttp, serverResult]);

  const error = !storageRef || isHttp ? null : (match?.error ?? null);
  const expiresAt = !storageRef || isHttp ? null : (match?.expiresAt ?? null);

  useEffect(() => {
    if (!storageRef || isHttp) {
      return;
    }

    let cancelled = false;

    presignDownload({ key: storageRef })
      .unwrap()
      .then((envelope) => {
        if (cancelled) return;
        setServerResult({
          key: storageRef,
          url: envelope.data.download_url,
          expiresAt: envelope.data.expires_at,
          error: null,
        });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setServerResult({
          key: storageRef,
          url: null,
          expiresAt: null,
          error: e instanceof Error ? e.message : "Could not load file URL",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [storageRef, isHttp, presignDownload]);

  return { url, loading, error, expiresAt, isLegacyUrl: isHttp };
}
