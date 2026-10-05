export const env = {
   /** Base URL of the backend API. The auth module appends `/auth/...`. */
   apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
   /** When true the built-in fake auth backend is used (no server required). */
   authMock: process.env.NEXT_PUBLIC_AUTH_MOCK === 'true',
} as const;
