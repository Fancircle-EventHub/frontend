import { TAG_TYPES } from "@/constants/tagTypes";
import { baseApi } from "@/services/api/baseApi";
import type { ApiEnvelope } from "@/types/api.types";
import type { OrganizationGuestMediaPayload } from "@/types/guest-media.types";
import type { OrganizationMeetupItem } from "@/types/guest-meetup.types";
import type { OrganizationEventNotificationItem } from "@/types/event-notification.types";
import type { CreateEventPayload, Event, HubSummaryEmailResult, RelatedEventSummary, UpdateEventPayload } from "@/types/event.types";

export type ListOrganizationEventsQueryParams = {
  status?: "all" | "draft" | "live";
  sort?: "updated" | "title";
};

export const eventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listOrganizationEvents: builder.query<ApiEnvelope<Event[]>, ListOrganizationEventsQueryParams | void>({
      query: (params) => ({
        url: "/organization/events",
        params: params ?? { status: "all", sort: "updated" },
      }),
      providesTags: [TAG_TYPES.OrganizationEvent],
    }),
    createOrganizationEvent: builder.mutation<ApiEnvelope<Event>, CreateEventPayload>({
      query: (body) => ({ url: "/organization/events", method: "POST", body }),
      invalidatesTags: [TAG_TYPES.OrganizationEvent],
    }),
    getOrganizationEvent: builder.query<ApiEnvelope<Event>, string>({
      query: (eventId) => ({ url: `/organization/events/${eventId}` }),
      providesTags: (_r, _e, eventId) => [{ type: TAG_TYPES.OrganizationEvent, id: eventId }],
    }),
    updateOrganizationEvent: builder.mutation<ApiEnvelope<Event>, { eventId: string; body: UpdateEventPayload }>({
      query: ({ eventId, body }) => ({
        url: `/organization/events/${eventId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { eventId }) => [
        TAG_TYPES.OrganizationEvent,
        TAG_TYPES.EventEntry,
        { type: TAG_TYPES.OrganizationEvent, id: eventId },
      ],
    }),
    sendOrganizationEventHubSummaryEmail: builder.mutation<ApiEnvelope<HubSummaryEmailResult>, string>({
      query: (eventId) => ({
        url: `/organization/events/${eventId}/hub-summary-email`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, eventId) => [
        TAG_TYPES.OrganizationEvent,
        { type: TAG_TYPES.OrganizationEvent, id: eventId },
      ],
    }),
    eventEntryByCode: builder.query<ApiEnvelope<Event>, string>({
      query: (code) => ({ url: `/events/${code}/entry` }),
      providesTags: [TAG_TYPES.EventEntry],
    }),
    organizationEventGuestMedia: builder.query<ApiEnvelope<OrganizationGuestMediaPayload>, string>({
      query: (eventId) => ({ url: `/organization/events/${eventId}/guest-media` }),
      providesTags: (_r, _e, eventId) => [
        TAG_TYPES.OrganizationEvent,
        { type: TAG_TYPES.OrganizationEvent, id: eventId },
      ],
    }),
    syncOrganizationEventRelated: builder.mutation<
      ApiEnvelope<{ related_events: RelatedEventSummary[] }>,
      { eventId: string; body: { related_event_ids: string[] } }
    >({
      query: ({ eventId, body }) => ({
        url: `/organization/events/${eventId}/related-events`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAG_TYPES.OrganizationEvent, id: arg.eventId },
        TAG_TYPES.EventEntry,
      ],
    }),
    organizationEventMeetups: builder.query<ApiEnvelope<{ meetups: OrganizationMeetupItem[] }>, string>({
      query: (eventId) => ({ url: `/organization/events/${eventId}/meetups` }),
      providesTags: (_r, _e, eventId) => [
        { type: TAG_TYPES.OrganizationEventMeetups, id: eventId },
        { type: TAG_TYPES.OrganizationEvent, id: eventId },
      ],
    }),
    createOrganizationEventMeetup: builder.mutation<
      ApiEnvelope<{ meetup: OrganizationMeetupItem & { id: string } }>,
      {
        eventId: string;
        body: {
          title: string;
          description?: string | null;
          meetup_at: string;
          location: string;
          max_capacity?: number | null;
        };
      }
    >({
      query: ({ eventId, body }) => ({
        url: `/organization/events/${eventId}/meetups`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAG_TYPES.OrganizationEventMeetups, id: arg.eventId },
        TAG_TYPES.EventEntry,
      ],
    }),
    updateOrganizationEventMeetup: builder.mutation<
      ApiEnvelope<{ meetup: OrganizationMeetupItem & { id: string } }>,
      {
        eventId: string;
        meetupId: string;
        body: {
          title?: string;
          description?: string | null;
          meetup_at?: string;
          location?: string;
          max_capacity?: number | null;
        };
      }
    >({
      query: ({ eventId, meetupId, body }) => ({
        url: `/organization/events/${eventId}/meetups/${meetupId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAG_TYPES.OrganizationEventMeetups, id: arg.eventId },
        TAG_TYPES.EventEntry,
      ],
    }),
    deleteOrganizationEventMeetup: builder.mutation<ApiEnvelope<null>, { eventId: string; meetupId: string }>({
      query: ({ eventId, meetupId }) => ({
        url: `/organization/events/${eventId}/meetups/${meetupId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAG_TYPES.OrganizationEventMeetups, id: arg.eventId },
        TAG_TYPES.EventEntry,
      ],
    }),
    organizationEventNotifications: builder.query<
      ApiEnvelope<{ notifications: OrganizationEventNotificationItem[] }>,
      string
    >({
      query: (eventId) => ({ url: `/organization/events/${eventId}/notifications` }),
      providesTags: (_r, _e, eventId) => [
        { type: TAG_TYPES.OrganizationEventNotifications, id: eventId },
        { type: TAG_TYPES.OrganizationEvent, id: eventId },
      ],
    }),
    createOrganizationEventNotification: builder.mutation<
      ApiEnvelope<{ notification: OrganizationEventNotificationItem }>,
      {
        eventId: string;
        body: { title: string; body: string; category?: string | null; color?: string | null };
      }
    >({
      query: ({ eventId, body }) => ({
        url: `/organization/events/${eventId}/notifications`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAG_TYPES.OrganizationEventNotifications, id: arg.eventId },
        TAG_TYPES.EventEntry,
        TAG_TYPES.GuestEventNotifications,
      ],
    }),
    updateOrganizationEventNotification: builder.mutation<
      ApiEnvelope<{ notification: OrganizationEventNotificationItem }>,
      {
        eventId: string;
        notificationId: string;
        body: { title: string; body: string; category?: string | null; color?: string | null };
      }
    >({
      query: ({ eventId, notificationId, body }) => ({
        url: `/organization/events/${eventId}/notifications/${notificationId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAG_TYPES.OrganizationEventNotifications, id: arg.eventId },
        TAG_TYPES.EventEntry,
        TAG_TYPES.GuestEventNotifications,
      ],
    }),
    deleteOrganizationEventNotification: builder.mutation<
      ApiEnvelope<null>,
      { eventId: string; notificationId: string }
    >({
      query: ({ eventId, notificationId }) => ({
        url: `/organization/events/${eventId}/notifications/${notificationId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAG_TYPES.OrganizationEventNotifications, id: arg.eventId },
        TAG_TYPES.EventEntry,
        TAG_TYPES.GuestEventNotifications,
      ],
    }),
  }),
});

export const {
  useListOrganizationEventsQuery,
  useCreateOrganizationEventMutation,
  useGetOrganizationEventQuery,
  useUpdateOrganizationEventMutation,
  useSendOrganizationEventHubSummaryEmailMutation,
  useEventEntryByCodeQuery,
  useOrganizationEventGuestMediaQuery,
  useSyncOrganizationEventRelatedMutation,
  useOrganizationEventMeetupsQuery,
  useCreateOrganizationEventMeetupMutation,
  useUpdateOrganizationEventMeetupMutation,
  useDeleteOrganizationEventMeetupMutation,
  useOrganizationEventNotificationsQuery,
  useCreateOrganizationEventNotificationMutation,
  useUpdateOrganizationEventNotificationMutation,
  useDeleteOrganizationEventNotificationMutation,
} = eventApi;
