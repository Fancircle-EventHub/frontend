"use client";

import { useParams, useRouter } from "next/navigation";
import { useEventEntryByCodeQuery } from "@/apis/event.api";
import { useGuestSessionQuery, useLogoutGuestMutation } from "@/apis/guest.api";
import { useAuthGuard } from "@/lib/auth-guard";
import { useEffect } from "react";
import { clearSession, setEventContext } from "@/slices/session.slice";
import { baseApi } from "@/services/api/baseApi";
import { useAppDispatch } from "@/store/hooks";

export default function GuestEventAccessPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logout, { isLoading: logoutLoading }] = useLogoutGuestMutation();
  useAuthGuard("guest", "/guest/auth/login");
  const { isLoading: sessionLoading, isError: sessionError } = useGuestSessionQuery();
  const params = useParams<{ code: string }>();
  const { data } = useEventEntryByCodeQuery(params.code);

  async function handleLogout() {
    try {
      await logout().unwrap();
    } catch {}
    dispatch(setEventContext(null));
    dispatch(clearSession());
    dispatch(baseApi.util.resetApiState());
    router.replace("/guest/auth/login");
  }

  useEffect(() => {
    if (sessionError) router.replace("/guest/auth/login");
  }, [router, sessionError]);

  if (sessionLoading) {
    return <div className="mx-auto w-full max-w-xl p-6 text-zinc-300">Checking session...</div>;
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-3 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold">Event Access Success</h1>
        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={logoutLoading}
          className="rounded border border-zinc-600 px-4 py-2 text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
        >
          {logoutLoading ? "Logging out…" : "Log out"}
        </button>
      </div>
      <p className="text-zinc-300">You are authenticated and entered the intended event flow.</p>
      <div className="rounded border border-zinc-700 p-4">
        <p>Event title: {data?.data.title}</p>
        <p>Access code: {params.code}</p>
      </div>
    </div>
  );
}
