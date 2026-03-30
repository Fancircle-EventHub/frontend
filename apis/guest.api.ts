import { TAG_TYPES } from "@/constants/tagTypes";
import { baseApi } from "@/services/api/baseApi";
import type { ApiEnvelope } from "@/types/api.types";
import type { AuthTokenResponse, ForgotPasswordPayload, ResetPasswordPayload, VerifyOtpPayload } from "@/types/auth.types";
import type { GuestCommunityStats } from "@/types/guest-community.types";
import type { GuestEventMediaItem } from "@/types/guest-media.types";
import type { GuestMeetupItem } from "@/types/guest-meetup.types";
import type { GuestRidePostItem } from "@/types/guest-ride.types";
import type { GuestEventNotificationItem } from "@/types/event-notification.types";
import type { Guest, GuestEventOnboardingData, GuestLoginPayload, GuestRegisterPayload } from "@/types/guest.types";

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
    guestEventCommunity: builder.query<ApiEnvelope<GuestCommunityStats>, string>({
      query: (accessCode) => ({ url: `/guest/events/${accessCode}/community` }),
      providesTags: (_r, _e, accessCode) => [{ type: TAG_TYPES.GuestEventCommunity, id: accessCode }],
    }),
    guestEventOnboarding: builder.query<ApiEnvelope<GuestEventOnboardingData>, string>({
      query: (accessCode) => ({ url: `/guest/events/${accessCode}/onboarding` }),
      providesTags: (_r, _e, accessCode) => [{ type: TAG_TYPES.GuestEventOnboarding, id: accessCode }],
    }),
    completeGuestEventProfile: builder.mutation<
      ApiEnvelope<GuestEventOnboardingData>,
      { accessCode: string; body: { username: string; avatar_key: string } }
    >({
      query: ({ accessCode, body }) => ({
        url: `/guest/events/${accessCode}/complete-profile`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAG_TYPES.GuestEventOnboarding, id: arg.accessCode },
        { type: TAG_TYPES.GuestEventCommunity, id: arg.accessCode },
        TAG_TYPES.GuestSession,
      ],
    }),
    updateGuestEventProfile: builder.mutation<
      ApiEnvelope<GuestEventOnboardingData>,
      { accessCode: string; body: { avatar_key: string; username?: string } }
    >({
      query: ({ accessCode, body }) => ({
        url: `/guest/events/${accessCode}/profile`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAG_TYPES.GuestEventOnboarding, id: arg.accessCode },
        { type: TAG_TYPES.GuestEventCommunity, id: arg.accessCode },
        TAG_TYPES.GuestSession,
      ],
    }),
    guestEventGallery: builder.query<ApiEnvelope<GuestEventMediaItem[]>, { accessCode: string; kind?: "image" | "video" }>({
      query: ({ accessCode, kind }) => ({
        url: `/guest/events/${accessCode}/media`,
        params: kind ? { kind } : undefined,
      }),
      providesTags: (_r, _e, arg) => [{ type: TAG_TYPES.GuestEventMedia, id: arg.accessCode }],
    }),
    guestEventMediaMine: builder.query<ApiEnvelope<GuestEventMediaItem[]>, string>({
      query: (accessCode) => ({ url: `/guest/events/${accessCode}/media/mine` }),
      providesTags: (_r, _e, accessCode) => [{ type: TAG_TYPES.GuestEventMedia, id: `${accessCode}-mine` }],
    }),
    registerGuestEventMedia: builder.mutation<
      ApiEnvelope<GuestEventMediaItem>,
      { accessCode: string; body: { storage_key: string; mime_type: string } }
    >({
      query: ({ accessCode, body }) => ({
        url: `/guest/events/${accessCode}/media`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAG_TYPES.GuestEventMedia, id: arg.accessCode },
        { type: TAG_TYPES.GuestEventMedia, id: `${arg.accessCode}-mine` },
        { type: TAG_TYPES.GuestEventCommunity, id: arg.accessCode },
        TAG_TYPES.EventEntry,
      ],
    }),
    guestEventMeetups: builder.query<ApiEnvelope<{ meetups: GuestMeetupItem[] }>, string>({
      query: (accessCode) => ({ url: `/guest/events/${accessCode}/meetups` }),
      providesTags: (_r, _e, accessCode) => [{ type: TAG_TYPES.GuestEventMeetups, id: accessCode }],
    }),
    guestMeetupJoin: builder.mutation<ApiEnvelope<null>, { accessCode: string; meetupId: string }>({
      query: ({ accessCode, meetupId }) => ({
        url: `/guest/events/${accessCode}/meetups/${meetupId}/join`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, arg) => [{ type: TAG_TYPES.GuestEventMeetups, id: arg.accessCode }],
    }),
    guestMeetupLeave: builder.mutation<ApiEnvelope<null>, { accessCode: string; meetupId: string }>({
      query: ({ accessCode, meetupId }) => ({
        url: `/guest/events/${accessCode}/meetups/${meetupId}/leave`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, arg) => [{ type: TAG_TYPES.GuestEventMeetups, id: arg.accessCode }],
    }),
    guestMeetupCreate: builder.mutation<
      ApiEnvelope<{ meetup: GuestMeetupItem }>,
      {
        accessCode: string;
        body: {
          title: string;
          description?: string | null;
          meetup_at: string;
          location: string;
          max_capacity?: number | null;
          image_url?: string | null;
        };
      }
    >({
      query: ({ accessCode, body }) => ({
        url: `/guest/events/${accessCode}/meetups`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAG_TYPES.GuestEventMeetups, id: arg.accessCode },
        TAG_TYPES.EventEntry,
      ],
    }),
    guestEventRides: builder.query<
      ApiEnvelope<{ ride_posts: GuestRidePostItem[]; event_venue: string | null; event_city: string | null }>,
      string
    >({
      query: (accessCode) => ({ url: `/guest/events/${accessCode}/rides` }),
      providesTags: (_r, _e, accessCode) => [{ type: TAG_TYPES.GuestEventRides, id: accessCode }],
    }),
    guestRideCreate: builder.mutation<
      ApiEnvelope<{ ride_post: { id: string; type: string } }>,
      {
        accessCode: string;
        body: {
          type: "offer" | "request";
          origin_area: string;
          destination_area?: string | null;
          departure_at: string;
          seats_available?: number | null;
          note?: string | null;
        };
      }
    >({
      query: ({ accessCode, body }) => ({
        url: `/guest/events/${accessCode}/rides`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [{ type: TAG_TYPES.GuestEventRides, id: arg.accessCode }],
    }),
    guestRideDelete: builder.mutation<ApiEnvelope<null>, { accessCode: string; ridePostId: string }>({
      query: ({ accessCode, ridePostId }) => ({
        url: `/guest/events/${accessCode}/rides/${ridePostId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, arg) => [{ type: TAG_TYPES.GuestEventRides, id: arg.accessCode }],
    }),
    guestRideInterest: builder.mutation<ApiEnvelope<null>, { accessCode: string; ridePostId: string }>({
      query: ({ accessCode, ridePostId }) => ({
        url: `/guest/events/${accessCode}/rides/${ridePostId}/interest`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, arg) => [{ type: TAG_TYPES.GuestEventRides, id: arg.accessCode }],
    }),
    guestRideLeaveInterest: builder.mutation<ApiEnvelope<null>, { accessCode: string; ridePostId: string }>({
      query: ({ accessCode, ridePostId }) => ({
        url: `/guest/events/${accessCode}/rides/${ridePostId}/interest`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, arg) => [{ type: TAG_TYPES.GuestEventRides, id: arg.accessCode }],
    }),
    guestEventNotifications: builder.query<ApiEnvelope<{ notifications: GuestEventNotificationItem[] }>, string>({
      query: (accessCode) => ({ url: `/guest/events/${accessCode}/notifications` }),
      providesTags: (_r, _e, accessCode) => [{ type: TAG_TYPES.GuestEventNotifications, id: accessCode }],
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
  useGuestEventOnboardingQuery,
  useCompleteGuestEventProfileMutation,
  useUpdateGuestEventProfileMutation,
  useGuestEventCommunityQuery,
  useGuestEventGalleryQuery,
  useGuestEventMediaMineQuery,
  useRegisterGuestEventMediaMutation,
  useGuestEventMeetupsQuery,
  useGuestMeetupJoinMutation,
  useGuestMeetupLeaveMutation,
  useGuestMeetupCreateMutation,
  useGuestEventRidesQuery,
  useGuestRideCreateMutation,
  useGuestRideDeleteMutation,
  useGuestRideInterestMutation,
  useGuestRideLeaveInterestMutation,
  useGuestEventNotificationsQuery,
} = guestApi;
