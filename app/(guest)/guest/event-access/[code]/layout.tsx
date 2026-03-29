import type { ReactNode } from "react";
import { GuestEventAccessLayout } from "@/components/guest-event/GuestEventAccessLayout";

export default function GuestEventAccessSegmentLayout({ children }: { children: ReactNode }) {
  return <GuestEventAccessLayout>{children}</GuestEventAccessLayout>;
}
