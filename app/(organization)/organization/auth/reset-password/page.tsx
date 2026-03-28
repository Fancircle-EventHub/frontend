"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { OrganizationResetPasswordScreen } from "@/components/organization-auth/OrganizationResetPasswordScreen";

function ResetPasswordFallback() {
  return <div className="min-h-screen bg-eh-default" aria-hidden />;
}

function ResetPasswordWithKey() {
  const searchParams = useSearchParams();
  const key = useMemo(() => searchParams.get("email") ?? "__", [searchParams]);
  return <OrganizationResetPasswordScreen key={key} />;
}

export default function OrganizationResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordWithKey />
    </Suspense>
  );
}
