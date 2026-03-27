import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithEnvelope } from "./baseQueryWithEnvelope";
import { TAG_TYPES } from "@/constants/tagTypes";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithEnvelope,
  tagTypes: [...Object.values(TAG_TYPES)],
  endpoints: () => ({}),
});
