/**
 * Centralized environment configuration
 */

export const env = {
  // Base URL for the main API backend
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://11tkrk1f2zwo.share.zrok.io',

  // Frontend URL for redirects to external application parts (e.g. login, pricing)
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'https://link-gps-frontend.vercel.app',

  // OSM Local API Endpoint
  OSM_REVERSE_API: import.meta.env.VITE_OSM_REVERSE_API || 'http://127.0.0.1:8000/api/v1/osm/reverse',

  // Main marketing/landing site
  MAIN_SITE_URL: import.meta.env.VITE_MAIN_SITE_URL || 'https://linkgps.com',
};
