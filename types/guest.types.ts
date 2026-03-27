export type Guest = {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
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
