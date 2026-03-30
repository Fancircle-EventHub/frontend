"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { useGetOrganizationEventQuery, useUpdateOrganizationEventMutation } from "@/apis/event.api";
import { EVENT_MODULE_LIST, LIVE_MODULE_TOTAL, MODULE_IMPLEMENTATION } from "@/constants/eventModules";
import type { EventModuleId } from "@/constants/eventModules";
import {
  countLiveActiveModules,
  defaultModulesState,
  isModuleLiveImplementation,
  mergeModulesFromApi,
  sanitizeModulesForSave,
} from "@/lib/event-modules";
import { extractApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";

function ModuleToggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-eh-accent/50 disabled:cursor-not-allowed disabled:opacity-40 ${
        checked ? "bg-eh-accent" : "bg-white/15"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function ModuleGoldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 9h6v6H9z" />
    </svg>
  );
}

function ModuleCardFooter({ modId, eventId }: { modId: EventModuleId; eventId: string }) {
  switch (modId) {
    case "tour_promotion":
      return (
        <Link
          href={`/organization/events/${eventId}/related`}
          className="inline-flex text-[10px] font-bold uppercase tracking-wider text-eh-accent transition hover:underline"
        >
          Manage related shows →
        </Link>
      );
    case "meetups":
      return (
        <Link
          href={`/organization/events/${eventId}/meetups`}
          className="inline-flex text-[10px] font-bold uppercase tracking-wider text-eh-accent transition hover:underline"
        >
          Manage meetups →
        </Link>
      );
    case "community":
      return <p className="text-[10px] leading-relaxed text-eh-text-tertiary">Fan count & top uploaders on the guest Community tab.</p>;
    case "carpooling":
      return <p className="text-[10px] leading-relaxed text-eh-text-tertiary">Guests post offers and requests from the Carpool screen.</p>;
    case "fan_gallery":
      return <p className="text-[10px] leading-relaxed text-eh-text-tertiary">Upload & gallery routes in the guest hub.</p>;
    case "event_info":
      return (
        <p className="text-[10px] leading-relaxed text-eh-text-tertiary">
          Uses event details from your event setup (edit event). Guests see an Event info screen when enabled.
        </p>
      );
    case "notifications":
      return (
        <Link
          href={`/organization/events/${eventId}/notifications`}
          className="inline-flex text-[10px] font-bold uppercase tracking-wider text-eh-accent transition hover:underline"
        >
          Manage announcements →
        </Link>
      );
    default:
      return null;
  }
}

type EventModulesScreenProps = {
  eventId: string;
  standalone?: boolean;
};

export function EventModulesScreen({ eventId, standalone = false }: EventModulesScreenProps) {
  const router = useRouter();
  const { data, isLoading, isError } = useGetOrganizationEventQuery(eventId, { skip: !eventId });
  const [updateEvent, { isLoading: saving }] = useUpdateOrganizationEventMutation();

  const [modules, setModules] = useState<Record<EventModuleId, boolean>>(defaultModulesState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const ev = data?.data;
    if (!ev) return;
    const next = mergeModulesFromApi(ev.modules);
    startTransition(() => {
      setModules(next);
      setErrorMessage(null);
    });
  }, [data]);

  async function patchAndSave(id: EventModuleId, value: boolean) {
    if (!isModuleLiveImplementation(id)) return;
    const ev = data?.data;
    if (!ev) return;

    const next = { ...modules, [id]: value };
    const safe = sanitizeModulesForSave(next);
    const previous = { ...modules };

    setModules(next);
    setErrorMessage(null);
    try {
      await updateEvent({
        eventId,
        body: {
          title: ev.title,
          modules: { ...safe },
        },
      }).unwrap();
    } catch (e) {
      setErrorMessage(extractApiErrorMessage(e));
      setModules(previous);
    }
  }

  function continueAfterModules() {
    router.push(standalone ? "/organization/modules" : `/organization/events/${eventId}/publish`);
  }

  const activeLiveCount = countLiveActiveModules(modules);

  if (!eventId) {
    return <p className="text-sm text-eh-text-secondary">Invalid event.</p>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-eh-text-secondary">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-2 border-eh-accent/30 border-t-eh-accent" />
          <p className="text-sm">Loading modules…</p>
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-white/10 bg-[#0e1012] p-8 text-center">
        <p className="text-sm text-eh-text-secondary">Could not load this event.</p>
        <Link href="/organization/events" className="mt-4 inline-block text-sm font-medium text-eh-accent hover:underline">
          Back to events
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      {standalone ? (
        <div className="mb-6">
          <Link
            href="/organization/modules"
            className="text-sm font-medium text-eh-accent transition hover:underline"
          >
            ← Back to event list
          </Link>
        </div>
      ) : null}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-eh-accent">Configuration</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">Event modules</h1>
          <p className="mt-2 max-w-2xl text-sm text-eh-text-secondary">
            Turn on features that are live in the guest hub — each switch saves immediately. Other tiles are preview-only
            until we ship them.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-wide">
            <Link href={`/organization/events/${eventId}/related`} className="text-eh-accent hover:underline">
              Tour promotion
            </Link>
            <Link href={`/organization/events/${eventId}/meetups`} className="text-eh-accent hover:underline">
              Meetups
            </Link>
            <Link href={`/organization/events/${eventId}/notifications`} className="text-eh-accent hover:underline">
              Announcements
            </Link>
          </div>
        </div>
        <div className="shrink-0 rounded-lg border border-eh-accent/40 bg-eh-accent/10 px-4 py-2 text-center">
          <p className="text-[9px] font-bold uppercase tracking-wider text-eh-text-tertiary">Live features on</p>
          <p className="text-lg font-bold tabular-nums text-eh-accent">
            {String(activeLiveCount).padStart(2, "0")} / {String(LIVE_MODULE_TOTAL).padStart(2, "0")}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EVENT_MODULE_LIST.map((mod) => {
          const isLive = MODULE_IMPLEMENTATION[mod.id] === "live";
          return (
            <div
              key={mod.id}
              className={`relative flex flex-col overflow-hidden rounded-xl border bg-[#16181c] shadow-sm transition ${
                isLive ? "border-white/10 hover:border-white/15" : "border-white/[0.06]"
              }`}
            >
              {!isLive ? (
                <div className="shrink-0 border-b border-amber-400/25 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent px-4 py-2.5">
                  <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100/95">
                    Coming soon
                  </p>
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <ModuleGoldIcon className={`shrink-0 ${isLive ? "text-eh-accent" : "text-eh-text-tertiary/50"}`} />
                    <h2 className="text-sm font-bold uppercase tracking-wide text-white">{mod.title}</h2>
                  </div>
                  <ModuleToggle
                    checked={modules[mod.id]}
                    onChange={(v) => void patchAndSave(mod.id, v)}
                    disabled={saving || !isLive}
                  />
                </div>
                <p className="mb-4 flex-1 text-xs leading-relaxed text-eh-text-secondary">{mod.description}</p>
                <div className="mt-auto min-h-[2.5rem] border-t border-white/5 pt-3">
                  {isLive ? (
                    <ModuleCardFooter modId={mod.id} eventId={eventId} />
                  ) : (
                    <p className="text-[10px] leading-relaxed text-eh-text-tertiary/90">
                      Toggle unlocks when this experience ships.
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-xl border border-white/10 bg-[#14161a] p-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-eh-text-tertiary">Note</p>
        <p className="mt-1 text-xs leading-relaxed text-eh-text-secondary">
          Only modules marked as live above change what guests see. Coming soon modules stay off until released. Toggles
          are saved as soon as you flip them.
        </p>
      </div>

      <div className="mt-10 flex justify-end border-t border-white/10 pt-8">
        <Button
          type="button"
          variant="primary"
          className="w-full min-w-0 px-8 sm:w-auto sm:min-w-[240px]"
          onClick={continueAfterModules}
        >
          {standalone ? (
            "Done"
          ) : (
            <>
              Continue <span aria-hidden>→</span>
            </>
          )}
        </Button>
      </div>

      {errorMessage ? <p className="mt-4 text-center text-sm text-red-400">{errorMessage}</p> : null}
    </div>
  );
}
