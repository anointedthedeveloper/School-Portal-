/** Only browser-safe configuration. Secrets never belong in the frontend. */
export const env = {
  apiUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5000/api',
} as const;
