export type Organization = {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
};

export type OrganizationRegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type OrganizationLoginPayload = {
  email: string;
  password: string;
  remember?: boolean;
};
