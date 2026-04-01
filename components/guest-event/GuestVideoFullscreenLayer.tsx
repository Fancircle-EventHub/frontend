"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { safeExitFullscreen } from "@/lib/fullscreen-exit";

type Props = {
  open: boolean;
  src: string | null;
  onClose: () => void;
};

function isDocumentFullscreen(): boolean {
  const doc = document as Document & { webkitFullscreenElement?: Element | null };
  return Boolean(document.fullscreenElement || doc.webkitFullscreenElement);
}

/**
 * Gallery videos open here only — grid shows a static thumbnail. Attempts browser fullscreen on the player.
 */
export function GuestVideoFullscreenLayer({ open, src, onClose }: Props) {
  const titleId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sawFullscreenRef = useRef(false);

  const handleClose = useCallback(() => {
    sawFullscreenRef.current = false;
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      safeExitFullscreen();
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !src || !containerRef.current || !videoRef.current) return;

    const container = containerRef.current;
    const video = videoRef.current;

    void video.play().catch(() => {});

    const req =
      container.requestFullscreen?.() ??
      (container as unknown as { webkitRequestFullscreen?: () => Promise<void> | void }).webkitRequestFullscreen?.();

    void Promise.resolve(req).then(() => {
      if (isDocumentFullscreen()) {
        sawFullscreenRef.current = true;
      }
    });
  }, [open, src]);

  useEffect(() => {
    if (!open) return;

    const onFs = () => {
      if (isDocumentFullscreen()) {
        sawFullscreenRef.current = true;
        return;
      }
      if (sawFullscreenRef.current) {
        sawFullscreenRef.current = false;
        onClose();
      }
    };

    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("webkitfullscreenchange", onFs);

    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("webkitfullscreenchange", onFs);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  if (typeof document === "undefined" || !open || !src) return null;

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] flex max-h-[100dvh] flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <p id={titleId} className="sr-only">
        Video player
      </p>
      <div className="flex shrink-0 items-center justify-end border-b border-white/10 px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={handleClose}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Close"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="relative min-h-0 flex-1 bg-black">
        <video ref={videoRef} src={src} className="size-full object-contain" controls playsInline controlsList="nodownload" />
      </div>
    </div>,
    document.body,
  );
}
