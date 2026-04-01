"use client";

import { useMemo, useState } from "react";
import { useGuestEventGalleryQuery } from "@/apis/guest.api";
import { usePublicEventGalleryQuery } from "@/apis/event.api";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";
import { guestHub } from "@/lib/guest-event-branding";
import type { GuestEventMediaItem } from "@/types/guest-media.types";
import { MediaLightbox, type MediaLightboxItem } from "@/components/guest-event/MediaLightbox";

type Filter = "all" | "image" | "video";

type Props = {
  accessCode: string;
  mode?: "guest" | "public";
};

function toLightboxItems(items: GuestEventMediaItem[]): MediaLightboxItem[] {
  return items.map((item) => ({
    id: item.id,
    kind: item.kind,
    url: item.url,
    username: item.username,
  }));
}

export function GuestEventGalleryContent({ accessCode, mode = "guest" }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const guestQuery = useGuestEventGalleryQuery(
    {
      accessCode,
      kind: filter === "all" ? undefined : filter,
    },
    { skip: !accessCode || mode !== "guest" },
  );

  const publicQuery = usePublicEventGalleryQuery(
    {
      code: accessCode,
      kind: filter === "all" ? undefined : filter,
      limit: 80,
    },
    { skip: !accessCode || mode !== "public" },
  );

  const { data, isLoading, isFetching } = mode === "guest" ? guestQuery : publicQuery;
  const items = data?.data ?? [];
  const loading = isLoading || isFetching;

  const lightboxItems = useMemo(() => toLightboxItems(data?.data ?? []), [data?.data]);

  const openAt = (i: number) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Media type">
        {(
          [
            ["all", "All"],
            ["image", "Photos"],
            ["video", "Videos"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={filter === id}
            onClick={() => setFilter(id)}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              filter === id
                ? `${guestHub.accentBg} text-[#0a0a0a]`
                : `border border-white/10 hover:border-white/20 ${guestHub.surface} ${guestHub.fgMuted}`
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <PageCenterSpinner />
      ) : items.length === 0 ? (
        <p className={`text-sm ${guestHub.fgMuted}`}>
          {mode === "guest"
            ? "No media yet. Be the first to upload from the Upload tab."
            : "No public gallery items yet."}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, i) => (
            <li key={item.id} className="overflow-hidden rounded-xl border border-white/10 bg-[#252830]">
              <button
                type="button"
                onClick={() => openAt(i)}
                className="relative block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-eh-accent"
              >
                <div className="relative aspect-square w-full bg-black">
                  {item.kind === "video" ? (
                    <>
                      <video
                        src={item.url}
                        className="pointer-events-none size-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                        tabIndex={-1}
                        aria-hidden
                      />
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-black/35"
                        aria-hidden
                      >
                        <span className="flex size-14 items-center justify-center rounded-full bg-black/55 text-3xl text-white shadow-lg">
                          ▶
                        </span>
                      </div>
                    </>
                  ) : (
                    <img src={item.url} alt="" className="size-full object-cover" />
                  )}
                </div>
              </button>
              {item.username ? (
                <p className={`px-2 py-1.5 text-[11px] text-eh-text-tertiary ${guestHub.wrap} line-clamp-2`}>
                  @{item.username}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <MediaLightbox
        key={lightboxOpen ? `glb-${lightboxIndex}` : "glb-closed"}
        open={lightboxOpen}
        items={lightboxItems}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
