"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { useGetOrganizationEventQuery, useUpdateOrganizationEventMutation } from "@/apis/event.api";
import { EVENT_MODULE_LIST, EVENT_MODULE_TOTAL } from "@/constants/eventModules";
import type { EventModuleId } from "@/constants/eventModules";
import { countActiveModules, defaultModulesState, mergeModulesFromApi } from "@/lib/event-modules";
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
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-eh-accent/50 disabled:opacity-50 ${
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

type EventModulesScreenProps = {
  eventId: string;
};

export function EventModulesScreen({ eventId }: EventModulesScreenProps) {
  const router = useRouter();
  const { data, isLoading, isError } = useGetOrganizationEventQuery(eventId, { skip: !eventId });
  const [updateEvent, { isLoading: saving }] = useUpdateOrganizationEventMutation();

  const [modules, setModules] = useState<Record<EventModuleId, boolean>>(defaultModulesState);
  const [baseline, setBaseline] = useState<Record<EventModuleId, boolean>>(defaultModulesState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const ev = data?.data;
    if (!ev) return;
    const next = mergeModulesFromApi(ev.modules);
    startTransition(() => {
      setModules(next);
      setBaseline(next);
      setErrorMessage(null);
    });
  }, [data]);

  function patch(id: EventModuleId, value: boolean) {
    setModules((m) => ({ ...m, [id]: value }));
    setErrorMessage(null);
  }

  function discard() {
    setModules({ ...baseline });
    setErrorMessage(null);
  }

  async function saveAndContinue() {
    const ev = data?.data;
    if (!ev) return;
    setErrorMessage(null);
    try {
      await updateEvent({
        eventId,
        body: {
          title: ev.title,
          modules: { ...modules },
        },
      }).unwrap();
      setBaseline({ ...modules });
      router.push(`/organization/events/${eventId}/publish`);
    } catch (e) {
      setErrorMessage(extractApiErrorMessage(e));
    }
  }

  const activeCount = countActiveModules(modules);

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
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-eh-accent">Configuration</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">Event modules</h1>
          <p className="mt-2 max-w-2xl text-sm text-eh-text-secondary">
            Turn on interaction layers for your event hub—guests only see what you enable.
          </p>
        </div>
        <div className="shrink-0 rounded-lg border border-eh-accent/40 bg-eh-accent/10 px-4 py-2 text-center">
          <p className="text-[9px] font-bold uppercase tracking-wider text-eh-text-tertiary">Active modules</p>
          <p className="text-lg font-bold tabular-nums text-eh-accent">
            {String(activeCount).padStart(2, "0")} / {EVENT_MODULE_TOTAL}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EVENT_MODULE_LIST.map((mod) => (
          <div
            key={mod.id}
            className="flex flex-col rounded-xl border border-white/10 bg-[#16181c] p-5 shadow-sm transition hover:border-white/15"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <ModuleGoldIcon className="shrink-0 text-eh-accent" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-white">{mod.title}</h2>
              </div>
              <ModuleToggle checked={modules[mod.id]} onChange={(v) => patch(mod.id, v)} disabled={saving} />
            </div>
            <p className="mb-4 flex-1 text-xs leading-relaxed text-eh-text-secondary">{mod.description}</p>
            <button
              type="button"
              className="text-left text-[10px] font-bold uppercase tracking-wider text-eh-accent/90 transition hover:text-eh-accent"
            >
              Configure <span aria-hidden>→</span>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-eh-accent/20 bg-eh-accent/5 p-6">
        <p className="text-[10px] font-bold uppercase tracking-wider text-eh-accent">+42% engagement lift</p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-eh-text-secondary">
          Smart module activation helps guests discover the right touchpoints at the right time—without overwhelming the
          experience.
        </p>
      </div>

      <div className="mt-10 flex flex-col-reverse gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={discard}
          className="text-sm font-medium text-eh-text-tertiary transition hover:text-eh-text-secondary"
        >
          ✕ Discard draft
        </button>
        <Button
          type="button"
          variant="primary"
          loading={saving}
          className="w-full min-w-0 px-8 sm:w-auto sm:min-w-[240px]"
          onClick={() => void saveAndContinue()}
        >
          Continue <span aria-hidden>→</span>
        </Button>
      </div>

      {errorMessage ? <p className="mt-4 text-center text-sm text-red-400">{errorMessage}</p> : null}
    </div>
  );
}
