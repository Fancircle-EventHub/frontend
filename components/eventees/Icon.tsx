import type { CSSProperties } from 'react';
export type IconName = 'search' | 'ticket' | 'users' | 'user' | 'arrow' | 'heart' | 'pin' | 'calendar' | 'car' | 'chat' | 'image' | 'check' | 'close' | 'shield' | 'upload' | 'camera' | 'bell' | 'plus' | 'back' | 'settings' | 'send' | 'spark' | 'globe';
const paths: Record<IconName, string> = {
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0', ticket: 'M4 5h16v5a2 2 0 0 0 0 4v5H4v-5a2 2 0 0 0 0-4V5m11 0v14',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M15 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  user: 'M20 21v-2a7 7 0 0 0-14 0v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0', arrow: 'M5 12h14m-6-6 6 6-6 6', heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0m-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0', calendar: 'M4 5h16v16H4V5m3-3v6m10-6v6M4 10h16',
  car: 'M5 7l2-4h10l2 4m-16 0h18v11H3V7m2 11v3m14-3v3M6 12h2m8 0h2', chat: 'M21 11a9 9 0 0 1-9 9H4l-3 3V11a10 10 0 0 1 20 0M6 10h12m-12 4h8', image: 'M3 3h18v18H3V3m0 13 6-6 5 5 3-3 4 4M16 7h.01',
  check: 'M5 12l4 4L19 6', close: 'M6 6l12 12M6 18 18 6', shield: 'M12 2l9 4v6c0 6-9 10-9 10S3 18 3 12V6l9-4m-5 10 3 3 7-7', upload: 'M12 16V3m-5 5 5-5 5 5M3 15v6h18v-6', camera: 'M3 6h4l2-3h6l2 3h4v15H3V6m13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  bell: 'M18 8a6 6 0 0 0-12 0c0 8-3 8-3 10h18c0-2-3-2-3-10m-9 13h6', plus: 'M12 5v14M5 12h14', back: 'M19 12H5m6-6-6 6 6 6', settings: 'M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  send: 'M22 2 9 15m13-13-7 20-6-7-7-6 20-7', spark: 'M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7', globe: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18',
};
export function Icon({ name, size = 20, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d={paths[name]} /></svg>;
}
