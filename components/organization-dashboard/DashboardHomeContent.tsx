"use client";

import Link from "next/link";
import { OrganizationLogoRow } from "@/components/organization-dashboard/OrganizationLogoRow";
import type { Event } from "@/types/event.types";
import type { Organization } from "@/types/organization.types";

function EngagementChart() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0e1012] p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Live performance</h3>
          <p className="text-sm text-eh-text-secondary">Fan engagement (last 30 days)</p>
        </div>
        <span className="rounded border border-eh-accent/40 bg-eh-accent/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-eh-accent">
          Engagement
        </span>
      </div>
      <div className="relative h-48 w-full">
        <svg className="h-full w-full" viewBox="0 0 800 160" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fddc53" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#fddc53" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,120 C80,100 120,130 200,90 C280,50 320,70 400,55 C480,40 520,60 600,35 C680,10 720,25 800,15 L800,160 L0,160 Z"
            fill="url(#chartFill)"
          />
          <path
            d="M0,120 C80,100 120,130 200,90 C280,50 320,70 400,55 C480,40 520,60 600,35 C680,10 720,25 800,15"
            fill="none"
            stroke="#fddc53"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <div className="mt-4 flex flex-wrap gap-8 border-t border-white/10 pt-4 text-sm">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-eh-text-tertiary">Avg. session</p>
          <p className="mt-1 font-semibold text-white">42:15 min</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-eh-text-tertiary">New sign-ups</p>
          <p className="mt-1 font-semibold text-eh-accent">+842,015</p>
        </div>
      </div>
    </div>
  );
}

type DashboardHomeContentProps = {
  organization: Organization;
  events: Event[];
};

function formatEventWhen(ev: Event): string | null {
  const parts: string[] = [];
  if (ev.event_date) {
    try {
      const d = new Date(ev.event_date + "T12:00:00");
      parts.push(d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }));
    } catch {
      parts.push(ev.event_date);
    }
  }
  if (ev.city?.trim()) parts.push(ev.city.trim());
  if (ev.venue?.trim()) parts.push(ev.venue.trim());
  return parts.length ? parts.join(" · ") : null;
}

export function DashboardHomeContent({ organization, events }: DashboardHomeContentProps) {
  const organizationName = organization.name;
  const nextEvent = events[0];
  const secondEvent = events[1];
  const thirdEvent = events[2];
  const nextWhenLine = nextEvent ? formatEventWhen(nextEvent) : null;
  const thirdWhenLine = thirdEvent ? formatEventWhen(thirdEvent) : null;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <OrganizationLogoRow organization={organization} />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-eh-accent">Welcome back</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-[2.5rem] lg:leading-tight">
            Your digital <span className="text-eh-accent">event hubs</span>.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-eh-text-secondary">
            {organizationName ? `${organizationName} — ` : null}
            Manage premium experiences, track engagement, and grow your community.
          </p>
          <Link
            href="/organization/events"
            className="mt-3 inline-flex text-sm font-semibold text-eh-accent hover:underline"
          >
            View all events →
          </Link>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-eh-text-tertiary">Event hubs</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-white md:text-4xl">{events.length}</p>
        </div>
      </div>

      <EngagementChart />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col rounded-xl border border-white/10 bg-[#0e1012] p-5">
          <div className="mb-4 aspect-[16/10] w-full rounded-lg bg-gradient-to-br from-eh-accent/20 to-white/5" />
          {nextEvent ? (
            <>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-eh-text-secondary">
                  Next
                </span>
                <span className="rounded border border-eh-accent/50 bg-eh-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase text-eh-accent">
                  Live
                </span>
              </div>
              <h3 className="font-semibold text-white">{nextEvent.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-eh-text-tertiary">{nextEvent.join_link}</p>
              {nextWhenLine ? <p className="mt-3 text-sm text-eh-text-secondary">{nextWhenLine}</p> : null}
            </>
          ) : (
            <>
              <h3 className="font-semibold text-white">Next event</h3>
              <p className="mt-2 text-sm text-eh-text-secondary">No events yet. Create your first event hub.</p>
              <Link
                href="/organization/events/new"
                className="mt-4 inline-flex text-sm font-medium text-eh-accent hover:underline"
              >
                Create event →
              </Link>
            </>
          )}
        </div>

        <div className="flex flex-col rounded-xl border border-white/10 bg-[#0e1012] p-5">
          <h3 className="font-semibold text-white">
            {secondEvent?.title ?? "Untitled exhibit"}
          </h3>
          <p className="mt-2 text-sm text-eh-text-secondary">
            {secondEvent ? "Continue editing your draft." : "Drafts appear here when you save work in progress."}
          </p>
          <div className="mt-4">
            <span className="rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-400">
              Draft
            </span>
          </div>
          <Link
            href={secondEvent ? `/organization/events/${secondEvent.id}/edit` : "/organization/events/new"}
            className="mt-4 text-sm font-medium text-eh-accent hover:underline"
          >
            Continue editing →
          </Link>
        </div>

        <div className="flex flex-col rounded-xl border border-white/10 bg-[#0e1012] p-5 md:col-span-2 lg:col-span-1">
          <div className="mb-4 aspect-[16/10] w-full rounded-lg bg-gradient-to-br from-slate-600/40 to-slate-900/80" />
          {thirdEvent ? (
            <>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="line-clamp-2 font-semibold text-white">{thirdEvent.title}</h3>
                <span className="shrink-0 rounded border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase text-eh-text-tertiary">
                  Spotlight
                </span>
              </div>
              <p className="line-clamp-2 text-sm text-eh-text-secondary">
                {thirdEvent.description?.trim() || "Open this hub or continue setup from your events list."}
              </p>
              {thirdWhenLine ? <p className="mt-2 text-xs text-eh-text-tertiary">{thirdWhenLine}</p> : null}
              <Link
                href="/organization/events"
                className="mt-4 inline-flex text-sm font-medium text-eh-accent hover:underline"
              >
                View in events →
              </Link>
            </>
          ) : (
            <>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-white">More hubs</h3>
                <span className="rounded border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase text-eh-text-tertiary">
                  —
                </span>
              </div>
              <p className="text-sm text-eh-text-secondary">
                When you have several events, another one will show here. Metrics like revenue and ratings will appear
                once connected.
              </p>
              <Link
                href="/organization/events"
                className="mt-4 inline-flex text-sm font-medium text-eh-accent hover:underline"
              >
                All events →
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
