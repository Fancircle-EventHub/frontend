import type { Event } from "./event.types";

export type Guest = {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
};

export type GuestEventProfileStatus = {
  is_complete: boolean;
  username: string | null;
  avatar_url: string | null;
  avatar_key: string | null;
};

export type GuestEventOnboardingData = {
  event: Event;
  profile: GuestEventProfileStatus;
};

export type GuestRegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type GuestLoginPayload = {
  email: string;
  password: string;
};
