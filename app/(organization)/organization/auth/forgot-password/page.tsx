"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { OrganizationForgotPasswordScreen } from "@/components/organization-auth/OrganizationForgotPasswordScreen";

function ForgotPasswordFallback() {
  return <div className="min-h-screen bg-eh-default" aria-hidden />;
}

function ForgotPasswordWithKey() {
  const searchParams = useSearchParams();
  const key = useMemo(() => searchParams.get("email") ?? "__", [searchParams]);
  return <OrganizationForgotPasswordScreen key={key} />;
}

export default function OrganizationForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordFallback />}>
      <ForgotPasswordWithKey />
    </Suspense>
  );
}
