"use client";

import { useRouter, useParams } from "next/navigation";
import { useLogoutOrganizationMutation, useOrganizationSessionQuery } from "@/apis/organization.api";
import { useAuthGuard, useRedirectWhenOrganizationSessionFails } from "@/lib/auth-guard";
import { clearSession } from "@/slices/session.slice";
import { baseApi } from "@/services/api/baseApi";
import { useAppDispatch } from "@/store/hooks";
import { EventPublishScreen } from "@/components/organization-dashboard/EventPublishScreen";
import { OrganizationDashboardShell } from "@/components/organization-dashboard/OrganizationDashboardShell";

export default function EventPublishPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useParams();
  const eventId = typeof params.eventId === "string" ? params.eventId : "";
  const [logout, { isLoading: logoutLoading }] = useLogoutOrganizationMutation();
  useAuthGuard("organization", "/organization/auth/login");
  const { data: sessionData, isLoading: sessionLoading, isError: isSessionError } = useOrganizationSessionQuery();
  useRedirectWhenOrganizationSessionFails(isSessionError);
  const organization = sessionData?.data.organization;

  async function handleLogout() {
    try {
      await logout().unwrap();
    } catch {
      void 0;
    }
    dispatch(clearSession());
    dispatch(baseApi.util.resetApiState());
    router.replace("/organization/auth/login");
  }

  if (sessionLoading || !organization) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121417] text-eh-text-secondary">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-2 border-eh-accent/30 border-t-eh-accent" />
          <p className="text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <OrganizationDashboardShell
      organizationName={organization.name}
      userEmail={organization.email}
      onLogout={() => void handleLogout()}
      logoutLoading={logoutLoading}
    >
      <EventPublishScreen eventId={eventId} />
    </OrganizationDashboardShell>
  );
}
