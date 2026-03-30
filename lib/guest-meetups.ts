type MeetupWithHost = {
  created_by_guest_id: string | null;
  meetup_at: string;
};

function byMeetupTime<T extends MeetupWithHost>(a: T, b: T): number {
  return new Date(a.meetup_at).getTime() - new Date(b.meetup_at).getTime();
}

/** Organizer-created first, then guest-hosted; each group sorted by time. */
export function sortMeetupsOrganizerFirst<T extends MeetupWithHost>(meetups: T[]): T[] {
  const { organizer, guestHosts } = partitionMeetupsByHost(meetups);
  return [...organizer, ...guestHosts];
}

export function partitionMeetupsByHost<T extends MeetupWithHost>(meetups: T[]): {
  organizer: T[];
  guestHosts: T[];
} {
  const organizer: T[] = [];
  const guestHosts: T[] = [];
  for (const m of meetups) {
    if (m.created_by_guest_id == null) organizer.push(m);
    else guestHosts.push(m);
  }
  organizer.sort(byMeetupTime);
  guestHosts.sort(byMeetupTime);
  return { organizer, guestHosts };
}
