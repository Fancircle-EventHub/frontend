"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useGetOrganizationEventQuery, useSendOrganizationEventHubSummaryEmailMutation } from "@/apis/event.api";
import { Button } from "@/components/ui/button";
import { extractApiErrorMessage } from "@/lib/api-error";

function formatEventDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return iso;
  }
}

function venueLine(venue: string | null, city: string | null, address: string | null): string {
  const parts = [venue?.trim(), address?.trim(), city?.trim()].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

type EventPublishScreenProps = {
  eventId: string;
};

export function EventPublishScreen({ eventId }: EventPublishScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shareOnly = searchParams.get("share") === "1";
  const { data, isLoading, isError } = useGetOrganizationEventQuery(eventId, { skip: !eventId });
  const [sendHubSummaryEmail, { isLoading: isSendingHubEmail }] = useSendOrganizationEventHubSummaryEmailMutation();
  const [doneError, setDoneError] = useState<string | null>(null);
  const qrWrapRef = useRef<HTMLDivElement>(null);

  const event = data?.data;
  const publishUrl = event?.join_link?.trim() ? event.join_link.trim() : "";

  const downloadQrSvg = useCallback(() => {
    const svg = qrWrapRef.current?.querySelector("svg");
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `event-qr-${event?.access_code ?? "hub"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [event?.access_code]);

  async function copyUrl() {
    if (!publishUrl || typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(publishUrl);
    } catch {}
  }

  async function handleDone() {
    setDoneError(null);
    try {
      await sendHubSummaryEmail(eventId).unwrap();
    } catch (err) {
      setDoneError(extractApiErrorMessage(err));
      return;
    }
    router.push("/organization/events");
  }

  if (!eventId) {
    return <p className="text-sm text-eh-text-secondary">Invalid event.</p>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-eh-text-secondary">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-2 border-eh-accent/30 border-t-eh-accent" />
          <p className="text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-white/10 bg-[#0e1012] p-8 text-center">
        <p className="text-sm text-eh-text-secondary">Could not load this event.</p>
        <Link href="/organization/events" className="mt-4 inline-block text-sm font-medium text-eh-accent hover:underline">
          Back to events
        </Link>
      </div>
    );
  }

  const idLabel = `FCL-${event.access_code.slice(0, 8).toUpperCase()}`;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-eh-accent">
          {shareOnly ? "Hub" : "Configuration"}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
          {shareOnly ? "Guest link & QR" : "Publish event hub"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-eh-text-secondary">
          {shareOnly
            ? "Copy the guest link or download the QR code for tickets, posters, and on-site signage."
            : "Share the guest link and add this QR code to tickets or posters."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <div className="flex flex-col rounded-xl border border-white/10 bg-[#16181c] p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-eh-text-secondary">
            <span className="inline-flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              {venueLine(event.venue, event.city, event.address ?? null)}
            </span>
            <span className="inline-flex items-center gap-2 text-eh-accent">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {formatEventDate(event.event_date)}
            </span>
          </div>
          <h2 className="text-2xl font-bold leading-tight text-white">{event.title}</h2>
          <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-eh-text-tertiary">
            {event.artist?.trim() || "—"}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-eh-text-secondary">
            <span>ID: {idLabel}</span>
            <span className="rounded border border-eh-accent/40 bg-eh-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-eh-accent">
              Ready for ticket integration
            </span>
          </div>

          <label className="mt-8 block text-[10px] font-bold uppercase tracking-wider text-eh-text-tertiary">Event link</label>
          <div className="mt-2 flex rounded-lg border border-white/10 bg-[#0e1012] focus-within:border-eh-accent/40">
            <input
              readOnly
              value={publishUrl}
              className="min-w-0 flex-1 truncate bg-transparent py-3 pl-3 pr-2 text-xs text-eh-text-primary outline-none"
            />
            <button
              type="button"
              onClick={() => void copyUrl()}
              className="shrink-0 px-3 text-eh-accent transition hover:brightness-110"
              aria-label="Copy link"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={publishUrl || "#"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-eh-accent px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0a0a0a] transition hover:brightness-95"
            >
              Open live hub <span aria-hidden className="ml-1">→</span>
            </a>
            <Link href={`/organization/events/${eventId}/edit`} className="text-sm font-medium text-eh-text-secondary underline-offset-4 hover:text-eh-text-primary hover:underline">
              Edit event
            </Link>
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-white/10 bg-[#16181c] p-6 shadow-sm">
          <div
            ref={qrWrapRef}
            className="flex flex-1 flex-col items-center justify-center rounded-lg border border-white/10 bg-white p-8"
          >
            {publishUrl ? (
              <QRCodeSVG value={publishUrl} size={200} level="M" includeMargin bgColor="#ffffff" fgColor="#0a0a0a" />
            ) : (
              <p className="text-center text-sm text-eh-text-secondary">No link available yet.</p>
            )}
          </div>
          <h3 className="mt-6 text-center text-sm font-bold text-white">Direct access</h3>
          <p className="mt-2 text-center text-xs leading-relaxed text-eh-text-secondary">
            Download the QR code and embed it in ticket artwork or on-site signage.
          </p>
          <button
            type="button"
            onClick={downloadQrSvg}
            disabled={!publishUrl}
            className="mt-4 text-center text-xs font-bold uppercase tracking-wider text-eh-accent underline-offset-4 transition hover:underline disabled:opacity-40"
          >
            Download QR code ↓
          </button>
        </div>
      </div>

      <div className="mt-10 space-y-4 border-t border-white/10 pt-8">
        {shareOnly ? (
          <Link
            href="/organization/events"
            className="inline-flex text-sm font-medium text-eh-text-tertiary transition hover:text-eh-text-secondary"
          >
            ← Back to events
          </Link>
        ) : (
          <>
            {doneError ? (
              <p className="text-sm text-red-400" role="alert">
                {doneError}
              </p>
            ) : null}
            <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => router.push(`/organization/events/${eventId}/modules`)}
                className="text-sm font-medium text-eh-text-tertiary transition hover:text-eh-text-secondary"
              >
                ← Back to modules
              </button>
              <Button
                type="button"
                variant="primary"
                className="w-full min-w-0 px-8 sm:w-auto sm:min-w-[240px]"
                loading={isSendingHubEmail}
                onClick={() => void handleDone()}
              >
                Done <span aria-hidden>→</span>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
