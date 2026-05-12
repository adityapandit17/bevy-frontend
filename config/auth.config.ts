/**
 * Authentication Configuration
 * Centralized configuration for authentication system
 */

export const AUTH_CONFIG = {
  // API endpoints (strip trailing slash to avoid double slashes in URLs)
  API_BASE_URL: (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  ENDPOINTS: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    ME: '/api/v1/auth/me',
    VERIFY_TOKEN: '/api/v1/auth/validate',
  },
  
  // Local storage keys
  tokenKey: 'hrms_auth_token',
  userKey: 'hrms_auth_user',
  /** Active tenant/workspace for API requests (X-Company-Id) */
  companyIdKey: 'hrms_current_company_id',
  
  // Token settings
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  
  // Cross-tab sync events
  STORAGE_EVENTS: {
    LOGIN: 'hrms_auth_login',
    LOGOUT: 'hrms_auth_logout',
    TOKEN_UPDATE: 'hrms_auth_token_update',
  },
} as const;

export const API_ENDPOINTS = {
  LOGIN: `${AUTH_CONFIG.API_BASE_URL}${AUTH_CONFIG.ENDPOINTS.LOGIN}`,
  LOGOUT: `${AUTH_CONFIG.API_BASE_URL}${AUTH_CONFIG.ENDPOINTS.LOGOUT}`,
  ME: `${AUTH_CONFIG.API_BASE_URL}${AUTH_CONFIG.ENDPOINTS.ME}`,
  VERIFY_TOKEN: `${AUTH_CONFIG.API_BASE_URL}${AUTH_CONFIG.ENDPOINTS.VERIFY_TOKEN}`,
} as const;