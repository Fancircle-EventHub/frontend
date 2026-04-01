"use client";

import { useGetOrganizationEventQuery, useOrganizationEventGuestMediaQuery, useUpdateOrganizationEventMutation } from "@/apis/event.api";
import type { GuestEventMediaItem } from "@/types/guest-media.types";
import { Button } from "@/components/ui/button";

type Props = {
  eventId: string;
};

export function OrganizationEventGalleryContent({ eventId }: Props) {
  const { data: eventEnvelope } = useGetOrganizationEventQuery(eventId);
  const { data, isLoading, refetch } = useOrganizationEventGuestMediaQuery(eventId);
  const [updateEvent, { isLoading: saving }] = useUpdateOrganizationEventMutation();

  const media = data?.data?.media ?? [];
  const shotId = data?.data?.shot_of_the_night_media_id ?? null;
  const eventTitle = eventEnvelope?.data?.title ?? "Event";

  async function onSelectShot(item: GuestEventMediaItem) {
    const next = shotId === item.id ? null : item.id;
    try {
      await updateEvent({ eventId, body: { shot_of_the_night_media_id: next } }).unwrap();
      await refetch();
    } catch {}
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Fan gallery · <span className="text-eh-accent">{eventTitle}</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-eh-text-secondary">
          All guest uploads for this hub. Pick one <strong className="text-eh-text-primary">shot of the night</strong> — it
          appears on the guest event home as the featured fan moment.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-eh-text-secondary">Loading uploads…</p>
      ) : media.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#0e1012] p-8 text-center text-sm text-eh-text-secondary">
          No guest uploads yet. Fans can add media from the guest app after they join the event.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((item) => {
            const isShot = shotId === item.id;
            return (
              <li
                key={item.id}
                className={`overflow-hidden rounded-xl border bg-[#0e1012] ${isShot ? "border-eh-accent ring-1 ring-eh-accent/50" : "border-white/10"}`}
              >
                <div className="relative aspect-square bg-zinc-900">
                  {item.kind === "video" ? (
                    <video src={item.url} className="size-full object-cover" controls playsInline preload="metadata" />
                  ) : (
                    <img src={item.url} alt="" className="size-full object-cover" />
                  )}
                </div>
                <div className="flex flex-col gap-2 p-3">
                  <p className="truncate text-xs text-eh-text-tertiary">{item.username ? `@${item.username}` : "Guest"}</p>
                  <Button
                    type="button"
                    variant={isShot ? "primary" : "secondary"}
                    fullWidth
                    loading={saving}
                    disabled={saving}
                    onClick={() => void onSelectShot(item)}
                  >
                    {isShot ? "Shot of the night" : "Set as shot of the night"}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
