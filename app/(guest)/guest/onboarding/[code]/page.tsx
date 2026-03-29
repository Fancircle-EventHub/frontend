"use client";

import { notFound, useParams } from "next/navigation";
import { GuestOnboardingScreen } from "@/components/guest-auth/GuestOnboardingScreen";

export default function GuestOnboardingPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  if (!code || code === "no-context") {
    notFound();
  }
  return <GuestOnboardingScreen accessCode={code} />;
}
