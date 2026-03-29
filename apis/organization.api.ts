import { TAG_TYPES } from "@/constants/tagTypes";
import { baseApi } from "@/services/api/baseApi";
import type { ApiEnvelope } from "@/types/api.types";
import type { AuthTokenResponse, ForgotPasswordPayload, ResetPasswordPayload, VerifyOtpPayload } from "@/types/auth.types";
import type {
  Organization,
  OrganizationLoginPayload,
  OrganizationRegisterPayload,
  UpdateOrganizationProfilePayload,
} from "@/types/organization.types";

export const organizationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registerOrganization: builder.mutation<ApiEnvelope<{ organization: Organization }>, OrganizationRegisterPayload>({
      query: (body) => ({ url: "/organization/auth/register", method: "POST", body }),
    }),
    verifyOrganizationOtp: builder.mutation<ApiEnvelope<AuthTokenResponse<Organization, "organization">>, VerifyOtpPayload>({
      query: (body) => ({ url: "/organization/auth/verify-otp", method: "POST", body }),
    }),
    resendOrganizationOtp: builder.mutation<ApiEnvelope<null>, { email: string; purpose: "email_verification" | "password_reset" }>({
      query: (body) => ({ url: "/organization/auth/resend-otp", method: "POST", body }),
    }),
    loginOrganization: builder.mutation<ApiEnvelope<AuthTokenResponse<Organization, "organization">>, OrganizationLoginPayload>({
      query: (body) => ({ url: "/organization/auth/login", method: "POST", body }),
    }),
    organizationSession: builder.query<ApiEnvelope<{ organization: Organization }>, void>({
      query: () => ({ url: "/organization/auth/session" }),
      providesTags: [TAG_TYPES.OrganizationSession],
    }),
    logoutOrganization: builder.mutation<ApiEnvelope<null>, void>({
      query: () => ({ url: "/organization/auth/logout", method: "POST" }),
      invalidatesTags: [TAG_TYPES.OrganizationSession],
    }),
    forgotOrganizationPassword: builder.mutation<ApiEnvelope<null>, ForgotPasswordPayload>({
      query: (body) => ({ url: "/organization/auth/forgot-password", method: "POST", body }),
    }),
    resetOrganizationPassword: builder.mutation<ApiEnvelope<null>, ResetPasswordPayload>({
      query: (body) => ({ url: "/organization/auth/reset-password", method: "POST", body }),
    }),
    updateOrganizationProfile: builder.mutation<ApiEnvelope<{ organization: Organization }>, UpdateOrganizationProfilePayload>({
      query: (body) => ({ url: "/organization/profile", method: "PATCH", body }),
      invalidatesTags: [TAG_TYPES.OrganizationSession],
    }),
  }),
});

export const {
  useRegisterOrganizationMutation,
  useVerifyOrganizationOtpMutation,
  useResendOrganizationOtpMutation,
  useLoginOrganizationMutation,
  useOrganizationSessionQuery,
  useLogoutOrganizationMutation,
  useForgotOrganizationPasswordMutation,
  useResetOrganizationPasswordMutation,
  useUpdateOrganizationProfileMutation,
} = organizationApi;
