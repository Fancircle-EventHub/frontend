"use client";

import { useUpdateOrganizationProfileMutation } from "@/apis/organization.api";
import { ImageUploadField } from "@/components/organization-dashboard/ImageUploadField";
import { rawStorageFromEvent } from "@/lib/storage-path";
import type { Organization } from "@/types/organization.types";

type OrganizationLogoRowProps = {
  organization: Organization;
};

export function OrganizationLogoRow({ organization }: OrganizationLogoRowProps) {
  const [updateProfile] = useUpdateOrganizationProfileMutation();
  const value = rawStorageFromEvent(organization.logo_path, organization.logo_url);

  return (
    <section className="rounded-xl border border-white/10 bg-[#0e1012] p-5">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-eh-accent">Organization</p>
      <p className="mb-4 text-sm text-eh-text-secondary">Logo for your organizer workspace (saved immediately).</p>
      <ImageUploadField
        label="Organization logo"
        value={value}
        onChange={(key) => void updateProfile({ logo_url: key || null }).unwrap()}
        uploadType="organization_logo"
        variant="logo"
      />
    </section>
  );
}
