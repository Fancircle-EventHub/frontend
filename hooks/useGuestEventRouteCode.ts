"use client";

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setEventContext } from "@/slices/session.slice";

export function useGuestEventRouteCode(): string {
  const params = useParams<{ code: string }>();
  const code = typeof params?.code === "string" ? params.code : "";
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!code || code === "no-context") return;
    dispatch(setEventContext(code));
  }, [code, dispatch]);

  if (!code || code === "no-context") {
    notFound();
  }

  return code;
}
