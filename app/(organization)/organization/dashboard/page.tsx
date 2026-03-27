"use client";

import Link from "next/link";
import { useListOrganizationEventsQuery } from "@/apis/event.api";
import { useLogoutOrganizationMutation, useOrganizationSessionQuery } from "@/apis/organization.api";
import { useAuthGuard } from "@/lib/auth-guard";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearSession } from "@/slices/session.slice";
import { baseApi } from "@/services/api/baseApi";
import { useAppDispatch } from "@/store/hooks";

export default function OrganizationDashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logout, { isLoading: logoutLoading }] = useLogoutOrganizationMutation();
  useAuthGuard("organization", "/organization/auth/login");
  const { isLoading: sessionLoading, isError: sessionError } = useOrganizationSessionQuery();
  const { data } = useListOrganizationEventsQuery();
  const events = data?.data ?? [];

  async function handleLogout() {
    try {
      await logout().unwrap();
    } catch {}
    dispatch(clearSession());
    dispatch(baseApi.util.resetApiState());
    router.replace("/organization/auth/login");
  }

  useEffect(() => {
    if (sessionError) router.replace("/organization/auth/login");
  }, [router, sessionError]);

  if (sessionLoading) {
    return <div className="mx-auto w-full max-w-4xl p-6 text-zinc-300">Checking session...</div>;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Organization Dashboard</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={logoutLoading}
            className="rounded border border-zinc-600 px-4 py-2 text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
          >
            {logoutLoading ? "Logging out…" : "Log out"}
          </button>
          <Link className="rounded bg-blue-600 px-4 py-2" href="/organization/events/new">Add Event</Link>
        </div>
      </div>
      {events.length === 0 ? (
        <div className="rounded border border-zinc-700 p-6 text-zinc-300">No events yet. Start by clicking Add Event.</div>
      ) : (
        <div className="grid gap-3">
          {events.map((event) => (
            <div key={event.id} className="rounded border border-zinc-700 p-4">
              <div className="font-medium">{event.title}</div>
              <div className="text-sm text-zinc-400">{event.join_link}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
