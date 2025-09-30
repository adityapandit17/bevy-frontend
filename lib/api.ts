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
  // Handle undefined or null endpoint
  if (!endpoint) {
    console.error('getApiUrl called with undefined or null endpoint');
    return API_BASE_URL;
  }
  
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
  ATTENDANCE_TODAY: '/attendance_records/today',
  ATTENDANCE_STATS: '/attendance_records/stats',
  ATTENDANCE_CALENDAR: '/attendance_records/calendar',
  ATTENDANCE_CHECK_IN: '/attendance_records/{id}/check_in',
  ATTENDANCE_CHECK_OUT: '/attendance_records/{id}/check_out',
  LEAVE_REQUESTS: '/leave_requests',
  LEAVE_BALANCE: '/leave_requests/balance',
  LEAVE_CALENDAR: '/leave_requests/calendar',
  LEAVE_STATS: '/leave_requests/stats',
  LEAVE_APPROVE: '/leave_requests/{id}/approve',
  LEAVE_REJECT: '/leave_requests/{id}/reject',
  LEAVE_CANCEL: '/leave_requests/{id}/cancel',
  
  // Payroll
  PAYROLLS: '/payrolls',
  SALARY_STRUCTURES: '/salary_structures',
  
  // Company
  COMPANY: '/company',
  
  // Onboarding
  ONBOARDING_EMPLOYEES: '/onboarding_employees',
  ONBOARDING_EMPLOYEES_STATS: '/onboarding_employees/stats',
  ONBOARDING_EMPLOYEES_CHECK: '/onboarding_employees/check_employee',
  ONBOARDING_TASKS: '/onboarding_tasks',
  ONBOARDING_TASK_TOGGLE: '/onboarding_tasks/{id}/toggle',
  
  // Offboarding
  OFFBOARDING_EMPLOYEES: '/offboarding_employees',
  OFFBOARDING_EMPLOYEES_STATS: '/offboarding_employees/stats',
  OFFBOARDING_TASKS: '/offboarding_tasks',
  OFFBOARDING_TASK_TOGGLE: '/offboarding_tasks/{id}/toggle',
  
  // ATS
  CANDIDATES: '/candidates',
  
  // File Upload
  UPLOAD: '/uploads',
  
  // Assets
  ASSETS: '/assets',

  // Roles
  ROLES: '/roles',
  ROLE_PERMISSIONS_MATRIX: '/roles/{id}/permissions_matrix',
  ROLE_TOGGLE_PERMISSION: '/roles/{id}/toggle_permission',
  ROLE_ADD_PERMISSION: '/roles/{id}/add_permission',
  ROLE_ADD_DEFAULTS: '/roles/{id}/add_default_module_permissions',
} as const;

/**
 * Get API URL for a specific endpoint
 * @param endpoint - The endpoint key from API_ENDPOINTS
 * @returns The complete API URL
 */
export const getEndpointUrl = (endpoint: keyof typeof API_ENDPOINTS): string => {
  const endpointPath = API_ENDPOINTS[endpoint];
  if (!endpointPath) {
    console.error(`Endpoint '${endpoint}' not found in API_ENDPOINTS`);
    return API_BASE_URL;
  }
  return getApiUrl(endpointPath);
};

export default {
  getApiUrl,
  getEndpointUrl,
  API_ENDPOINTS,
  API_BASE_URL,
};
