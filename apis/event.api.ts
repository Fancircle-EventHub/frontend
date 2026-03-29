import { TAG_TYPES } from "@/constants/tagTypes";
import { baseApi } from "@/services/api/baseApi";
import type { ApiEnvelope } from "@/types/api.types";
import type { OrganizationGuestMediaPayload } from "@/types/guest-media.types";
import type { CreateEventPayload, Event, HubSummaryEmailResult, UpdateEventPayload } from "@/types/event.types";

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
} = eventApi;
