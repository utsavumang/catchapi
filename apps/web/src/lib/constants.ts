// ─── Route Paths ─────────────────────────────────────────────────────────────
// Centralised route constants
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ENDPOINT_DETAIL: (urlId: string) => `/dashboard/${urlId}`,
} as const;

// ─── Query Keys ───────────────────────────────────────────────────────────────
// Using a factory pattern ensures consistency and prevents typos.
export const queryKeys = {
  endpoints: {
    all: ['endpoints'] as const,
    list: () => [...queryKeys.endpoints.all, 'list'] as const,
  },
  payloads: {
    all: ['payloads'] as const,
    byEndpoint: (endpointId: string) =>
      [...queryKeys.payloads.all, endpointId] as const,
  },
  auth: {
    me: ['auth', 'me'] as const,
  },
} as const;

// ─── UI Constants ─────────────────────────────────────────────────────────────
export const UI = {
  PAYLOAD_PAGE_SIZE: 50,
} as const;
