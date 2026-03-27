import { TAG_TYPES } from "@/constants/tagTypes";
import { baseApi } from "@/services/api/baseApi";
import type { ApiEnvelope } from "@/types/api.types";
import type { CreateEventPayload, Event } from "@/types/event.types";

export const eventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listOrganizationEvents: builder.query<ApiEnvelope<Event[]>, void>({
      query: () => ({ url: "/organization/events" }),
      providesTags: [TAG_TYPES.OrganizationEvent],
    }),
    createOrganizationEvent: builder.mutation<ApiEnvelope<Event>, CreateEventPayload>({
      query: (body) => ({ url: "/organization/events", method: "POST", body }),
      invalidatesTags: [TAG_TYPES.OrganizationEvent],
    }),
    eventEntryByCode: builder.query<ApiEnvelope<Event>, string>({
      query: (code) => ({ url: `/events/${code}/entry` }),
      providesTags: [TAG_TYPES.EventEntry],
    }),
  }),
});

export const {
  useListOrganizationEventsQuery,
  useCreateOrganizationEventMutation,
  useEventEntryByCodeQuery,
} = eventApi;
