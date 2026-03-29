"use client";

import { useParams } from "next/navigation";
import { GuestEventCommunityContent } from "@/components/guest-event/GuestEventCommunityContent";

export default function GuestEventCommunityPage() {
  const params = useParams<{ code: string }>();
  const code = params.code ?? "";

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:mx-auto lg:max-w-lg">
      <h1 className="text-2xl font-bold text-white">Community</h1>
      <p className="mt-1 text-sm text-eh-text-secondary">Who&apos;s here and who&apos;s sharing the most moments.</p>
      <div className="mt-8">
        {code ? <GuestEventCommunityContent accessCode={code} /> : null}
      </div>
    </div>
  );
}
