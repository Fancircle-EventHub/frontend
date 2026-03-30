"use client";

import Link from "next/link";
import { useState } from "react";
import {
  useGetOrganizationEventQuery,
  useListOrganizationEventsQuery,
  useSyncOrganizationEventRelatedMutation,
} from "@/apis/event.api";
import { extractApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import type { Event } from "@/types/event.types";

type Props = {
  eventId: string;
};

type RelatedFormProps = {
  eventId: string;
  others: Event[];
  initialRelatedIds: string[];
};

function OrganizationEventRelatedForm({ eventId, others, initialRelatedIds }: RelatedFormProps) {
  const [sync, { isLoading: saving }] = useSyncOrganizationEventRelatedMutation();
  const [selected, setSelected] = useState(() => new Set(initialRelatedIds));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setErrorMessage(null);
  }

  async function onSave() {
    setErrorMessage(null);
    try {
      await sync({
        eventId,
        body: { related_event_ids: Array.from(selected) },
      }).unwrap();
    } catch (e) {
      setErrorMessage(extractApiErrorMessage(e));
    }
  }

  return (
    <>
      {others.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-white/15 bg-[#16181c] p-8 text-center text-sm text-eh-text-secondary">
          Create another event in your organization to link it here.
        </p>
      ) : (
        <ul className="mt-8 space-y-2">
          {others.map((e) => (
            <li key={e.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-[#16181c] p-4 transition hover:border-white/20">
                <input
                  type="checkbox"
                  className="mt-1 size-4 rounded border-white/20 bg-black/40 text-eh-accent focus:ring-eh-accent/40"
                  checked={selected.has(e.id)}
                  onChange={() => toggle(e.id)}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-white">{e.title}</span>
                  <span className="mt-0.5 block text-xs text-eh-text-tertiary">
                    {[e.artist, e.event_date, e.city].filter(Boolean).join(" · ") || "—"}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button type="button" variant="primary" loading={saving} className="px-8" onClick={() => void onSave()}>
          Save related events
        </Button>
      </div>
      {errorMessage ? <p className="mt-4 text-sm text-red-400">{errorMessage}</p> : null}
    </>
  );
}

export function OrganizationEventRelatedScreen({ eventId }: Props) {
  const { data: eventEnvelope, isLoading: evLoading } = useGetOrganizationEventQuery(eventId, { skip: !eventId });
  const { data: listEnvelope, isLoading: listLoading } = useListOrganizationEventsQuery(
    { status: "all", sort: "title" },
    { skip: !eventId },
  );

  const rel = eventEnvelope?.data?.related_events;
  const relatedIds = rel?.map((r) => r.id) ?? [];
  const formKey = `${eventId}:${relatedIds.length ? [...relatedIds].sort().join("\0") : "empty"}`;

  const others = (listEnvelope?.data ?? []).filter((e) => e.id !== eventId);

  if (!eventId) {
    return <p className="text-sm text-eh-text-secondary">Invalid event.</p>;
  }

  if (evLoading || listLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-eh-text-secondary">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-2 border-eh-accent/30 border-t-eh-accent" />
          <p className="text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  const title = eventEnvelope?.data?.title ?? "Event";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link href={`/organization/events/${eventId}/modules`} className="text-sm font-medium text-eh-accent hover:underline">
          ← Back to modules
        </Link>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-eh-accent">Tour promotion</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Related events</h1>
      <p className="mt-2 text-sm text-eh-text-secondary">
        Choose other hubs from your organization to show under &quot;You might also like&quot; for{" "}
        <span className="text-white">{title}</span>. Guests only see this when the tour promotion module is on.
      </p>

      <OrganizationEventRelatedForm key={formKey} eventId={eventId} others={others} initialRelatedIds={relatedIds} />
    </div>
  );
}
