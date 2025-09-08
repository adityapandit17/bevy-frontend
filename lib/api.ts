/**
 * API Configuration Utility
 * Centralized configuration for API endpoints
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

/**
 * Get the full API URL for a given endpoint
 * @param endpoint - The API endpoint (e.g., '/employees', '/departments')
 * @returns The complete API URL
 */
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

/**
 * Common API endpoints
 */
export const API_ENDPOINTS = {
  // Dashboard
  DASHBOARD_STATS: '/dashboard_stats',
  
  // Employees
  EMPLOYEES: '/employees',
  EMPLOYEE_PROFILES: '/employee_profiles',
  
  // Departments
  DEPARTMENTS: '/departments',
  
  // Job Openings
  JOB_OPENINGS: '/job_openings',
  
  // Interviews
  INTERVIEWS: '/interviews',
  INTERVIEWS_STATS: '/interviews/stats',
  
  // Attendance & Leave
  ATTENDANCE_RECORDS: '/attendance_records',
  LEAVE_REQUESTS: '/leave_requests',
  
  // Payroll
  PAYROLLS: '/payrolls',
  SALARY_STRUCTURES: '/salary_structures',
  
  // Company
  COMPANY: '/company',
  
  // Onboarding
  ONBOARDING_EMPLOYEES: '/onboarding_employees',
  ONBOARDING_TASKS: '/onboarding_tasks',
  
  // ATS
  CANDIDATES: '/candidates',
  
  // Assets
  ASSETS: '/assets',
} as const;

/**
 * Get API URL for a specific endpoint
 * @param endpoint - The endpoint key from API_ENDPOINTS
 * @returns The complete API URL
 */
export const getEndpointUrl = (endpoint: keyof typeof API_ENDPOINTS): string => {
  return getApiUrl(API_ENDPOINTS[endpoint]);
};

export default {
  getApiUrl,
  getEndpointUrl,
  API_ENDPOINTS,
  API_BASE_URL,
};
