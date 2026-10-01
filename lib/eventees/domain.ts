export type Category = 'Alle' | 'Musik' | 'Sport' | 'Festivals' | 'Kultur';
export type EventRecord = {
  id: string; title: string; category: Exclude<Category, 'Alle'>; city: string;
  venue: string; date: string; image: string; tag: string; description: string;
};
export type Visibility = { discoverable: boolean; area: boolean; seat: boolean; city: boolean; interests: boolean; contactRequests: boolean };
export type FanProfile = {
  id: string; name: string; initials: string; color: string; city: string;
  area: string; row?: string; seat?: string; interests: string[]; visibility: Visibility;
};
export type FanFilter = 'all' | 'area' | 'city' | 'interests';
export type TicketStatus = 'not_submitted' | 'awaiting_provider' | 'provider_verified' | 'rejected';
export const DEFAULT_VISIBILITY: Visibility = { discoverable: false, area: false, seat: false, city: false, interests: false, contactRequests: false };
export function normalize(value: string): string { return value.trim().toLocaleLowerCase('de-DE'); }
export function visibleFan(fan: FanProfile): Partial<FanProfile> | null {
  if (!fan.visibility.discoverable) return null;
  return { id: fan.id, name: fan.name, initials: fan.initials, color: fan.color,
    ...(fan.visibility.area ? { area: fan.area } : {}),
    ...(fan.visibility.area && fan.visibility.seat ? { row: fan.row, seat: fan.seat } : {}),
    ...(fan.visibility.city ? { city: fan.city } : {}),
    ...(fan.visibility.interests ? { interests: fan.interests } : {}), visibility: fan.visibility };
}
export function fanMatches(fan: FanProfile, viewer: FanProfile, filter: FanFilter): boolean {
  if (fan.id === viewer.id || !fan.visibility.discoverable) return false;
  if (filter === 'area') return fan.visibility.area && !!normalize(viewer.area) && normalize(fan.area) === normalize(viewer.area);
  if (filter === 'city') return fan.visibility.city && !!normalize(viewer.city) && normalize(fan.city) === normalize(viewer.city);
  if (filter === 'interests') return fan.visibility.interests && fan.interests.some(i => viewer.interests.map(normalize).includes(normalize(i)));
  return true;
}
export function filterEvents(events: EventRecord[], query: string, category: Category, city: string): EventRecord[] {
  const q = normalize(query);
  return events.filter(e => (category === 'Alle' || e.category === category) && (city === 'Alle Orte' || e.city === city)
    && normalize([e.title, e.city, e.venue, e.category].join(' ')).includes(q));
}
export function validateTicketFile(file: { size: number; type: string }): string | null {
  if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) return 'Bitte wähle JPG, PNG, WebP oder PDF.';
  if (file.size === 0 || file.size > 10 * 1024 * 1024) return 'Die Datei muss zwischen 1 Byte und 10 MB groß sein.';
  return null;
}
