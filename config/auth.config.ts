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
    ACCEPT_INVITATION: '/api/v1/auth/accept_invitation',
    FORGOT_PASSWORD: '/api/v1/auth/forgot_password',
    RESET_PASSWORD: '/api/v1/auth/reset_password',
  },
  
  // Local storage keys
  tokenKey: 'hrms_auth_token',
  userKey: 'hrms_auth_user',
  companyKey: 'hrms_auth_company',
  
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
  ACCEPT_INVITATION: `${AUTH_CONFIG.API_BASE_URL}${AUTH_CONFIG.ENDPOINTS.ACCEPT_INVITATION}`,
  FORGOT_PASSWORD: `${AUTH_CONFIG.API_BASE_URL}${AUTH_CONFIG.ENDPOINTS.FORGOT_PASSWORD}`,
  RESET_PASSWORD: `${AUTH_CONFIG.API_BASE_URL}${AUTH_CONFIG.ENDPOINTS.RESET_PASSWORD}`,
} as const;