import { TAG_TYPES } from "@/constants/tagTypes";
import { baseApi } from "@/services/api/baseApi";
import type { ApiEnvelope } from "@/types/api.types";
import type { OrganizationGuestMediaPayload } from "@/types/guest-media.types";
import type { OrganizationMeetupItem } from "@/types/guest-meetup.types";
import type { OrganizationEventNotificationItem } from "@/types/event-notification.types";
import type { CreateEventPayload, Event, EventExternalPromoItem, HubSummaryEmailResult, UpdateEventPayload } from "@/types/event.types";

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
    createOrganizationEventExternalPromoItem: builder.mutation<
      ApiEnvelope<{ item: EventExternalPromoItem & { image_path?: string | null } }>,
      {
        eventId: string;
        body: {
          title: string;
          subtitle?: string | null;
          image_url: string;
          external_url: string;
          is_active?: boolean;
          button_label?: string | null;
          open_in_new_tab?: boolean;
        };
      }
    >({
      query: ({ eventId, body }) => ({
        url: `/organization/events/${eventId}/external-promo-items`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAG_TYPES.OrganizationEvent, id: arg.eventId },
        TAG_TYPES.EventEntry,
      ],
    }),
    updateOrganizationEventExternalPromoItem: builder.mutation<
      ApiEnvelope<{ item: EventExternalPromoItem & { image_path?: string | null } }>,
      {
        eventId: string;
        itemId: string;
        body: {
          title?: string;
          subtitle?: string | null;
          image_url?: string;
          external_url?: string;
          is_active?: boolean;
          button_label?: string | null;
          open_in_new_tab?: boolean;
        };
      }
    >({
      query: ({ eventId, itemId, body }) => ({
        url: `/organization/events/${eventId}/external-promo-items/${itemId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAG_TYPES.OrganizationEvent, id: arg.eventId },
        TAG_TYPES.EventEntry,
      ],
    }),
    deleteOrganizationEventExternalPromoItem: builder.mutation<ApiEnvelope<null>, { eventId: string; itemId: string }>({
      query: ({ eventId, itemId }) => ({
        url: `/organization/events/${eventId}/external-promo-items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: TAG_TYPES.OrganizationEvent, id: arg.eventId },
        TAG_TYPES.EventEntry,
      ],
    }),
    reorderOrganizationEventExternalPromoItems: builder.mutation<
      ApiEnvelope<null>,
      { eventId: string; body: { item_ids: string[] } }
    >({
      query: ({ eventId, body }) => ({
        url: `/organization/events/${eventId}/external-promo-items/reorder`,
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
          image_url?: string | null;
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
          image_url?: string | null;
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
  useCreateOrganizationEventExternalPromoItemMutation,
  useUpdateOrganizationEventExternalPromoItemMutation,
  useDeleteOrganizationEventExternalPromoItemMutation,
  useReorderOrganizationEventExternalPromoItemsMutation,
  useOrganizationEventMeetupsQuery,
  useCreateOrganizationEventMeetupMutation,
  useUpdateOrganizationEventMeetupMutation,
  useDeleteOrganizationEventMeetupMutation,
  useOrganizationEventNotificationsQuery,
  useCreateOrganizationEventNotificationMutation,
  useUpdateOrganizationEventNotificationMutation,
  useDeleteOrganizationEventNotificationMutation,
} = eventApi;
