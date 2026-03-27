import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthFromStorage } from "@/lib/auth-storage";

export const baseQueryWithEnvelope = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api",
  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      const { token } = getAuthFromStorage();
      if (token) headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Accept", "application/json");
    return headers;
  },
});
