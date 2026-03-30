"use client";

import { useParams } from "next/navigation";
import { useGuestEventNotificationsQuery } from "@/apis/guest.api";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";
import { guestHub } from "@/lib/guest-event-branding";
import { notificationCardBorderClass } from "@/lib/notification-accent";
import { useGuestModuleRedirect } from "@/hooks/useGuestModuleRedirect";

export default function GuestEventNotificationsPage() {
  const params = useParams<{ code: string }>();
  const code = params.code ?? "";
  const gate = useGuestModuleRedirect(code, "notifications");
  const { data, isLoading, isError } = useGuestEventNotificationsQuery(code, { skip: !code || gate !== "ok" });

  const list = data?.data?.notifications ?? [];

  if (gate !== "ok") {
    return <PageCenterSpinner fixed />;
  }

  if (isLoading) {
    return <PageCenterSpinner fixed />;
  }

  if (isError) {
    return (
      <div className="px-4 pb-8 pt-6 sm:px-6">
        <p className={`text-sm ${guestHub.fgMuted}`}>Couldn&apos;t load updates.</p>
      </div>
    );
  }

  return (
    <div className="min-w-0 px-4 pb-8 pt-6 sm:px-6 lg:mx-auto lg:max-w-xl">
      <h1 className={`text-2xl font-bold ${guestHub.fg} ${guestHub.wrap}`}>Updates</h1>
      <p className={`mt-1 text-sm ${guestHub.fgMuted} ${guestHub.wrap}`}>Announcements from the organizer.</p>

      {list.length === 0 ? (
        <p className={`mt-8 text-sm ${guestHub.fgMuted}`}>No announcements yet.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {list.map((n) => (
            <li
              key={n.id}
              className={`min-w-0 rounded-2xl p-5 ${guestHub.surface} ${notificationCardBorderClass(n.color)}`}
            >
              <p className={`text-[10px] font-bold uppercase tracking-wider ${guestHub.fgMuted} ${guestHub.wrap}`}>
                {n.created_at ? new Date(n.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : ""}
                {n.category ? ` · ${n.category}` : ""}
              </p>
              <h2 className={`mt-2 text-lg font-semibold ${guestHub.fg} ${guestHub.wrap}`}>{n.title}</h2>
              <p className={`mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed [overflow-wrap:anywhere] ${guestHub.fgMuted}`}>
                {n.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
