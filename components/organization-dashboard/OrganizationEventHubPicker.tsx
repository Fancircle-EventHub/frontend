"use client";

import Link from "next/link";
import { useListOrganizationEventsQuery } from "@/apis/event.api";

type Props = {
  title: string;
  subtitle: string;
  actionLabel: string;
  hrefForEvent: (eventId: string) => string;
};

export function OrganizationEventHubPicker({ title, subtitle, actionLabel, hrefForEvent }: Props) {
  const { data, isLoading, isError, refetch } = useListOrganizationEventsQuery({ status: "all", sort: "title" });

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-eh-text-secondary">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-2 border-eh-accent/30 border-t-eh-accent" />
          <p className="text-sm">Loading events…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-center text-sm text-red-300">
        Could not load events.
        <button type="button" className="mt-3 block w-full text-eh-accent hover:underline" onClick={() => void refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const events = data?.data ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
      <p className="mt-2 text-sm text-eh-text-secondary">{subtitle}</p>

      {events.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-white/15 bg-[#16181c] p-8 text-center text-sm text-eh-text-secondary">
          No events yet. Create one from the dashboard.
        </p>
      ) : (
        <ul className="mt-8 space-y-2">
          {events.map((e) => (
            <li key={e.id}>
              <Link
                href={hrefForEvent(e.id)}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#16181c] px-4 py-4 transition hover:border-eh-accent/40"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-white">{e.title}</span>
                  <span className="mt-0.5 block text-xs text-eh-text-tertiary">
                    {[e.artist, e.event_date, e.status].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-eh-accent">{actionLabel}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
