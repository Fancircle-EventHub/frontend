import { TAG_TYPES } from "@/constants/tagTypes";
import { baseApi } from "@/services/api/baseApi";
import type { ApiEnvelope } from "@/types/api.types";
import type { AuthTokenResponse, ForgotPasswordPayload, ResetPasswordPayload, VerifyOtpPayload } from "@/types/auth.types";
import type { Guest, GuestLoginPayload, GuestRegisterPayload } from "@/types/guest.types";

export const guestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registerGuest: builder.mutation<ApiEnvelope<{ guest: Guest }>, GuestRegisterPayload>({
      query: (body) => ({ url: "/guest/auth/register", method: "POST", body }),
    }),
    verifyGuestOtp: builder.mutation<ApiEnvelope<AuthTokenResponse<Guest, "guest">>, VerifyOtpPayload>({
      query: (body) => ({ url: "/guest/auth/verify-otp", method: "POST", body }),
    }),
    resendGuestOtp: builder.mutation<ApiEnvelope<null>, { email: string; purpose: "email_verification" | "password_reset" }>({
      query: (body) => ({ url: "/guest/auth/resend-otp", method: "POST", body }),
    }),
    loginGuest: builder.mutation<ApiEnvelope<AuthTokenResponse<Guest, "guest">>, GuestLoginPayload>({
      query: (body) => ({ url: "/guest/auth/login", method: "POST", body }),
    }),
    guestSession: builder.query<ApiEnvelope<{ guest: Guest }>, void>({
      query: () => ({ url: "/guest/auth/session" }),
      providesTags: [TAG_TYPES.GuestSession],
    }),
    logoutGuest: builder.mutation<ApiEnvelope<null>, void>({
      query: () => ({ url: "/guest/auth/logout", method: "POST" }),
      invalidatesTags: [TAG_TYPES.GuestSession],
    }),
    forgotGuestPassword: builder.mutation<ApiEnvelope<null>, ForgotPasswordPayload>({
      query: (body) => ({ url: "/guest/auth/forgot-password", method: "POST", body }),
    }),
    resetGuestPassword: builder.mutation<ApiEnvelope<null>, ResetPasswordPayload>({
      query: (body) => ({ url: "/guest/auth/reset-password", method: "POST", body }),
    }),
  }),
});

export const {
  useRegisterGuestMutation,
  useVerifyGuestOtpMutation,
  useResendGuestOtpMutation,
  useLoginGuestMutation,
  useGuestSessionQuery,
  useLogoutGuestMutation,
  useForgotGuestPasswordMutation,
  useResetGuestPasswordMutation,
} = guestApi;
