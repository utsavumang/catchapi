// route constants
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ENDPOINT_DETAIL: (urlId: string) => `/dashboard/${urlId}`,
  SETTINGS: '/settings',
} as const;

// Query Keys
export const queryKeys = {
  endpoints: {
    all: ['endpoints'] as const,
    list: () => [...queryKeys.endpoints.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.endpoints.all, 'detail', id] as const,
  },
  payloads: {
    all: ['payloads'] as const,
    byEndpoint: (endpointId: string, method?: string) =>
      [
        ...queryKeys.payloads.all,
        endpointId,
        ...(method ? [method] : []),
      ] as const,
  },
  auth: {
    me: ['auth', 'me'] as const,
  },
} as const;

// UI Constants
export const UI = {
  PAYLOAD_PAGE_SIZE: 50,
} as const;
