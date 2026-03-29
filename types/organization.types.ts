export type Organization = {
  id: string;
  name: string;
  contact_person: string | null;
  website: string | null;
  logo_url?: string | null;
  logo_path?: string | null;
  email: string;
  email_verified_at: string | null;
  terms_accepted_at: string | null;
};

export type OrganizationRegisterPayload = {
  name: string;
  contact_person: string;
  website?: string | null;
  email: string;
  password: string;
  password_confirmation: string;
  terms_accepted: boolean;
};

export type OrganizationLoginPayload = {
  email: string;
  password: string;
  remember?: boolean;
};

export type UpdateOrganizationProfilePayload = {
  logo_url?: string | null;
};
