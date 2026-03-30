"use client";

import { useState } from "react";
import { useGuestEventGalleryQuery } from "@/apis/guest.api";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";
import { guestHub } from "@/lib/guest-event-branding";

type Filter = "all" | "image" | "video";

type Props = {
  accessCode: string;
};

export function GuestEventGalleryContent({ accessCode }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const { data, isLoading, isFetching } = useGuestEventGalleryQuery({
    accessCode,
    kind: filter === "all" ? undefined : filter,
  });

  const items = data?.data ?? [];
  const loading = isLoading || isFetching;

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
        <p className={`text-sm ${guestHub.fgMuted}`}>No media yet. Be the first to upload from the Upload tab.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-xl border border-white/10 bg-[#252830]">
              {item.kind === "video" ? (
                <video src={item.url} className="aspect-square w-full object-cover" controls playsInline preload="metadata" />
              ) : (
                <img src={item.url} alt="" className="aspect-square w-full object-cover" />
              )}
              {item.username ? (
                <p className="truncate px-2 py-1.5 text-[11px] text-eh-text-tertiary">@{item.username}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
