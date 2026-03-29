import { baseApi } from "@/services/api/baseApi";
import type { ApiEnvelope } from "@/types/api.types";
import type { PresignUploadData, PresignUploadPayload } from "@/types/upload.types";

export const guestUploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    presignGuestUpload: builder.mutation<ApiEnvelope<PresignUploadData>, PresignUploadPayload>({
      query: (body) => ({ url: "/guest/uploads/presign", method: "POST", body }),
    }),
  }),
});

export const { usePresignGuestUploadMutation } = guestUploadApi;
