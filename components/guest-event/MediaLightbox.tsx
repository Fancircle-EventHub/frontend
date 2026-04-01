"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type MediaLightboxItem = {
  id: string;
  kind: "image" | "video";
  url: string;
  username?: string | null;
};

type Props = {
  open: boolean;
  items: MediaLightboxItem[];
  initialIndex: number;
  onClose: () => void;
};

export function MediaLightbox({ open, items, initialIndex, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => (i < items.length - 1 ? i + 1 : i));
  }, [items.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, goPrev, goNext]);

  if (typeof document === "undefined" || !open || items.length === 0) return null;

  const item = items[index];
  if (!item) return null;

  const showNav = items.length > 1;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/95 supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]"
      role="dialog"
      aria-modal="true"
      aria-label="Media viewer"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-14 items-center justify-end bg-gradient-to-b from-black/80 to-transparent px-3 pt-[max(0.5rem,env(safe-area-inset-top))] sm:h-16">
        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto flex size-11 items-center justify-center rounded-full text-3xl leading-none text-white/90 transition hover:bg-white/10"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-2 pb-6 pt-14 sm:px-6">
        {item.kind === "video" ? (
          <video
            key={item.id}
            src={item.url}
            controls
            playsInline
            className="max-h-[min(85dvh,900px)] w-full max-w-5xl rounded-lg bg-black"
            preload="metadata"
          />
        ) : (
          <div className="flex max-h-[min(85dvh,900px)] w-full max-w-5xl items-center justify-center overflow-auto">
            <img
              src={item.url}
              alt=""
              className="max-h-[min(85dvh,900px)] max-w-full object-contain"
              draggable={false}
            />
          </div>
        )}

        {item.username ? (
          <p className="mt-3 max-w-full truncate px-2 text-center text-sm text-white/80">@{item.username}</p>
        ) : null}
      </div>

      {showNav ? (
        <>
          <button
            type="button"
            onClick={goPrev}
            disabled={index <= 0}
            className="absolute left-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 sm:left-4 sm:size-12"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={index >= items.length - 1}
            className="absolute right-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 sm:right-4 sm:size-12"
            aria-label="Next"
          >
            ›
          </button>
          <p className="pointer-events-none absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white/70">
            {index + 1} / {items.length}
          </p>
        </>
      ) : null}
    </div>,
    document.body,
  );
}
