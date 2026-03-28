"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { OrganizationVerifyScreen } from "@/components/organization-auth/OrganizationVerifyScreen";

function VerifyFallback() {
  return <div className="min-h-screen bg-eh-default" aria-hidden />;
}

function VerifyWithKey() {
  const searchParams = useSearchParams();
  const key = useMemo(() => searchParams.get("email") ?? "__", [searchParams]);
  return <OrganizationVerifyScreen key={key} />;
}

export default function OrganizationVerifyPage() {
  return (
    <Suspense fallback={<VerifyFallback />}>
      <VerifyWithKey />
    </Suspense>
  );
}
