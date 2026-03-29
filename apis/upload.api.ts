import { baseApi } from "@/services/api/baseApi";
import type { ApiEnvelope } from "@/types/api.types";
import type { PresignDownloadData, PresignUploadData, PresignUploadPayload } from "@/types/upload.types";

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    presignUpload: builder.mutation<ApiEnvelope<PresignUploadData>, PresignUploadPayload>({
      query: (body) => ({ url: "/uploads/presign", method: "POST", body }),
    }),
    presignDownload: builder.mutation<ApiEnvelope<PresignDownloadData>, { key: string }>({
      query: (body) => ({ url: "/uploads/presign-download", method: "POST", body }),
    }),
  }),
});

export const { usePresignUploadMutation, usePresignDownloadMutation } = uploadApi;
