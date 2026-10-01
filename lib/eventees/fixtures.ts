import { DEFAULT_VISIBILITY, type EventRecord, type FanProfile } from './domain';
export const DEMO_EVENTS: EventRecord[] = [
  { id: 'sommernacht', title: 'Sommernacht Live', category: 'Musik', city: 'Leipzig', venue: 'Open-Air Park', date: '2027-07-18T19:00:00+02:00', image: '/eventees/concert.jpg', tag: 'Ein Abend. Tausend Geschichten.', description: 'Wenn die Sonne untergeht, beginnt eure Geschichte. Live-Musik, offene Arme und Menschen, die denselben Moment lieben wie du.' },
  { id: 'stadion', title: '90 Minuten. Ein Wir.', category: 'Sport', city: 'Leipzig', venue: 'Stadion Leipzig', date: '2027-07-26T18:30:00+02:00', image: '/eventees/football.jpg', tag: 'Deine Farben. Deine Menschen.', description: 'Von der gemeinsamen Anreise bis zum letzten Jubel: Finde Fans in deinem Block und erlebe den Spieltag zusammen.' },
  { id: 'sonnenfeld', title: 'Sonnenfeld Festival', category: 'Festivals', city: 'Berlin', venue: 'Festivalgelände', date: '2027-08-08T14:00:00+02:00', image: '/eventees/festival.jpg', tag: 'Drei Tage. Unendlich viele Momente.', description: 'Neue Lieblingsmusik. Alte Freunde. Neue Gesichter. Dein Festival beginnt schon vor dem ersten Song.' },
  { id: 'lichtnacht', title: 'Nacht der Lichter', category: 'Kultur', city: 'Dresden', venue: 'Kulturquartier', date: '2027-08-21T20:00:00+02:00', image: '/eventees/friends.jpg', tag: 'Entdecke die Nacht gemeinsam.', description: 'Kunst, Begegnungen und eine Stadt voller Geschichten. Entdecke gemeinsam mit Menschen aus deiner Region.' },
];
export const DEMO_VIEWER: FanProfile = { id: 'me', name: 'Alex', initials: 'AL', color: '#ff603e', city: 'Halle', area: 'Block 12', row: '8', seat: '14', interests: ['Live-Musik', 'Fußball'], visibility: { ...DEFAULT_VISIBILITY } };
const publicVisibility = { discoverable: true, area: true, seat: false, city: true, interests: true, contactRequests: true };
export const DEMO_FANS: FanProfile[] = [
  { id: 'lena', name: 'Lena', initials: 'LE', color: '#b6bc9a', city: 'Halle', area: 'Block 12', row: '8', seat: '16', interests: ['Live-Musik', 'Festivals'], visibility: { ...publicVisibility } },
  { id: 'tom', name: 'Tom', initials: 'TO', color: '#9bb5c3', city: 'Leipzig', area: 'Block 12', row: '9', seat: '21', interests: ['Fußball', 'Live-Musik'], visibility: { ...publicVisibility } },
  { id: 'marie', name: 'Marie', initials: 'MA', color: '#c9a8b6', city: 'Halle', area: 'Innenraum', interests: ['Live-Musik', 'Kultur'], visibility: { ...publicVisibility, area: false } },
  { id: 'sam', name: 'Sam', initials: 'SA', color: '#d4bb8d', city: 'Jena', area: 'Innenraum', interests: ['Festivals', 'Fußball'], visibility: { ...publicVisibility, city: false, contactRequests: false } },
];
export const dateLabel = (date: string) => new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', timeZone: 'Europe/Berlin' }).format(new Date(date));
