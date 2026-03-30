"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useListOrganizationEventsQuery } from "@/apis/event.api";
import type { EventStatus } from "@/types/event.types";

export type EventFilterTab = "all" | "live" | "draft";

function statusLabel(s: EventStatus): string {
  switch (s) {
    case "live":
      return "Live";
    case "draft":
      return "Draft";
    default:
      return "";
  }
}

function statusBadgeClass(s: EventStatus): string {
  switch (s) {
    case "live":
      return "bg-red-500/90 text-white";
    case "draft":
      return "bg-white/15 text-eh-text-secondary";
    default:
      return "bg-white/10 text-eh-text-secondary";
  }
}

const PAGE_SIZE = 5;

export function OrganizationEventsPageContent() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<EventFilterTab>("all");
  const [sort, setSort] = useState<"updated" | "title">("updated");
  const [page, setPage] = useState(1);

  const listParams = useMemo(
    () => ({
      status: tab,
      sort,
    }),
    [tab, sort],
  );

  const { data, isLoading, isFetching } = useListOrganizationEventsQuery(listParams);

  const events = useMemo(() => data?.data ?? [], [data?.data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(q) ||
        (event.description?.toLowerCase().includes(q) ?? false) ||
        (event.artist?.toLowerCase().includes(q) ?? false) ||
        (event.city?.toLowerCase().includes(q) ?? false) ||
        event.access_code.toLowerCase().includes(q),
    );
  }, [events, query]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const slice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const activeCount = events.length;
  const loading = isLoading || isFetching;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-[2.5rem] lg:leading-tight">
            Your digital <span className="text-eh-accent">event hubs</span>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-eh-text-secondary">
            Browse, launch, and refine every experience—filter by status, open the hub, or continue a draft.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-eh-text-tertiary">
            {activeCount} {activeCount === 1 ? "event" : "events"}
            {tab !== "all" ? " (in view)" : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search title, city, code…"
          className="w-full max-w-md rounded-lg border border-white/10 bg-[#0e1012] px-3 py-2 text-base text-eh-text-primary placeholder:text-eh-text-tertiary focus:border-eh-accent/40 focus:outline-none focus:ring-1 focus:ring-eh-accent/30 md:text-sm lg:order-last lg:max-w-xs"
          aria-label="Search events"
        />
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Event status">
          {(
            [
              ["all", "All"],
              ["live", "Live"],
              ["draft", "Draft"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => {
                setTab(id);
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                tab === id
                  ? "bg-eh-accent text-[#0a0a0a]"
                  : "border border-white/10 bg-[#0e1012] text-eh-text-secondary hover:border-white/20 hover:text-eh-text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-eh-text-tertiary">Sort by</label>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as "updated" | "title");
              setPage(1);
            }}
            className="rounded-lg border border-white/10 bg-[#0e1012] px-3 py-2 text-base font-medium text-eh-accent focus:border-eh-accent/50 focus:outline-none focus:ring-1 focus:ring-eh-accent/30 md:text-sm"
          >
            <option value="updated">Last updated</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center text-eh-text-secondary">
          <div className="flex flex-col items-center gap-3">
            <div className="size-10 animate-spin rounded-full border-2 border-eh-accent/30 border-t-eh-accent" />
            <p className="text-sm">Loading events…</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/organization/events/new"
            className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-transparent p-6 text-center transition hover:border-eh-accent/50 hover:bg-white/[0.02]"
          >
            <span className="flex size-14 items-center justify-center rounded-full border border-white/20 text-3xl text-eh-text-tertiary">
              +
            </span>
            <span className="mt-4 text-sm font-semibold text-eh-text-secondary">Create new event hub</span>
          </Link>

          {slice.map((event) => {
            const status: EventStatus = event.status ?? "draft";
            return (
              <article
                key={event.id}
                className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0e1012]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-zinc-700/50 to-zinc-900/90">
                  {event.hero_image_url ? (
                    <img
                      src={event.hero_image_url}
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" aria-hidden />
                  <span
                    className={`absolute left-3 top-3 flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusBadgeClass(status)}`}
                  >
                    {status === "live" ? <span className="size-1.5 animate-pulse rounded-full bg-white" aria-hidden /> : null}
                    {statusLabel(status)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="line-clamp-2 text-lg font-semibold text-white">{event.title}</h2>
                  <p className="mt-1 line-clamp-2 text-xs text-eh-text-tertiary">
                    {event.description || `Code ${event.access_code}`}
                  </p>
                  {status === "live" ? (
                    <Link
                      href={`/organization/events/${event.id}/publish?share=1`}
                      className="mt-2 block truncate text-[11px] font-medium text-eh-accent underline-offset-2 transition hover:underline"
                    >
                      View hub link & QR
                    </Link>
                  ) : (
                    <p className="mt-2 truncate text-[11px] text-eh-text-tertiary">{event.join_link}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {status === "draft" ? (
                      <div className="flex w-full flex-col gap-2">
                        <Link
                          href={`/organization/events/${event.id}/edit`}
                          className="flex w-full items-center justify-center rounded-lg bg-eh-accent py-2.5 text-center text-xs font-bold uppercase tracking-wider text-[#0a0a0a] transition hover:brightness-95"
                        >
                          Continue setup
                        </Link>
                        <Link
                          href={`/organization/events/${event.id}/gallery`}
                          className="flex w-full items-center justify-center rounded-lg border border-white/15 py-2.5 text-center text-xs font-semibold text-eh-text-secondary transition hover:bg-white/5"
                        >
                          Fan gallery
                        </Link>
                      </div>
                    ) : (
                      <>
                        <Link
                          href={`/organization/events/${event.id}/gallery`}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-eh-text-primary transition hover:bg-white/10"
                        >
                          Gallery
                        </Link>
                        <Link
                          href={`/organization/events/${event.id}/edit`}
                          className="inline-flex flex-1 items-center justify-center rounded-lg bg-eh-accent px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#0a0a0a] transition hover:brightness-95"
                        >
                          Edit
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && events.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-[#0e1012] p-8 text-center text-sm text-eh-text-secondary">
          {tab === "all" ? (
            <>
              You have no event hubs yet. Create one using the card above or{" "}
              <Link href="/organization/events/new" className="font-medium text-eh-accent hover:underline">
                open the editor
              </Link>
              .
            </>
          ) : (
            <>
              No events with this status.{" "}
              <button type="button" onClick={() => { setTab("all"); setPage(1); }} className="text-eh-accent underline">
                Show all
              </button>
            </>
          )}
        </p>
      ) : null}

      {!loading && events.length > 0 && total === 0 ? (
        <p className="rounded-xl border border-white/10 bg-[#0e1012] p-8 text-center text-sm text-eh-text-secondary">
          No events match your search.{" "}
          <button type="button" onClick={() => setQuery("")} className="text-eh-accent underline">
            Clear search
          </button>
        </p>
      ) : null}

      {!loading && events.length > 0 && total > 0 ? (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-[11px] font-medium uppercase tracking-wide text-eh-text-tertiary">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–{(safePage - 1) * PAGE_SIZE + slice.length} of {total}{" "}
            {total === 1 ? "event" : "events"}
            {query.trim() ? " (filtered)" : ""}
          </p>
          {pageCount > 1 ? (
            <nav className="flex items-center gap-2" aria-label="Pagination">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-eh-text-secondary transition hover:bg-white/5 disabled:opacity-40"
              >
                ←
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`min-w-[2.25rem] rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    safePage === n ? "bg-eh-accent text-[#0a0a0a]" : "border border-white/10 text-eh-text-secondary hover:bg-white/5"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                disabled={safePage >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-eh-text-secondary transition hover:bg-white/5 disabled:opacity-40"
              >
                →
              </button>
            </nav>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
