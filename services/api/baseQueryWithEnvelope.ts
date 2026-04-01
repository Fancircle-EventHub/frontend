import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthFromStorage } from "@/lib/auth-storage";

const ENDPOINTS_WITHOUT_AUTH_HEADER = new Set([
  "loginGuest",
  "registerGuest",
  "verifyGuestOtp",
  "resendGuestOtp",
  "forgotGuestPassword",
  "resetGuestPassword",
  "loginOrganization",
  "registerOrganization",
  "verifyOrganizationOtp",
  "resendOrganizationOtp",
  "forgotOrganizationPassword",
  "resetOrganizationPassword",
  "eventEntryByCode",
]);

export const baseQueryWithEnvelope = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api",
  prepareHeaders: (headers, api) => {
    const endpoint = typeof api.endpoint === "string" ? api.endpoint : "";
    const skipAuth = ENDPOINTS_WITHOUT_AUTH_HEADER.has(endpoint);

    if (typeof window !== "undefined" && !skipAuth) {
      const { token } = getAuthFromStorage();
      if (token) headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Accept", "application/json");
    return headers;
  },
});
