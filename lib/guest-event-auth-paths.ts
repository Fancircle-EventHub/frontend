/** Guest auth is always scoped to an event access code in the URL. */
export const guestEventAuthPaths = {
  login: (eventCode: string) => `/guest/event/${eventCode}/auth/login`,
  register: (eventCode: string) => `/guest/event/${eventCode}/auth/register`,
  verify: (eventCode: string) => `/guest/event/${eventCode}/auth/verify`,
  forgotPassword: (eventCode: string) => `/guest/event/${eventCode}/auth/forgot-password`,
  resetPassword: (eventCode: string) => `/guest/event/${eventCode}/auth/reset-password`,
} as const;

/** Navigate here when guest session is invalid and no event code is available (shows global 404 UI). */
export const GUEST_INVALID_SESSION_PATH = "/guest/invalid";
