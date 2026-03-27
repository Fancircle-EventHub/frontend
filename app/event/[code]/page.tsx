"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useEventEntryByCodeQuery } from "@/apis/event.api";
import { useAppDispatch } from "@/store/hooks";
import { setEventContext } from "@/slices/session.slice";

export default function EventEntryPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const dispatch = useAppDispatch();
  const { data } = useEventEntryByCodeQuery(code);

  useEffect(() => {
    dispatch(setEventContext(code));
  }, [code, dispatch]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Event Entry</h1>
      <p className="text-zinc-300">Event: {data?.data.title ?? "Loading..."}</p>
      <div className="flex gap-3">
        <Link className="rounded bg-blue-600 px-4 py-2" href="/guest/auth/login">Guest Login</Link>
        <Link className="rounded bg-zinc-700 px-4 py-2" href="/guest/auth/register">Guest Register</Link>
      </div>
    </div>
  );
}
