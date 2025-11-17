import { AUTH_CONFIG } from '@/config/auth.config';
import { toast } from '@/hooks/use-toast';
/**
 * API Configuration Utility
 * Centralized configuration for API endpoints
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

/**
 * Get JWT token from localStorage
 */
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_CONFIG.tokenKey);
};

/**
 * Make authenticated API request
 * Automatically includes JWT token in Authorization header
 * NOTE: This function ALWAYS sends the token if available (except for login requests which use AuthService)
 */
export const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // ALWAYS add JWT token if available (this ensures all requests send token)
  const token = getToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  } else {
    // Log warning if token is missing (except for login)
    console.warn('API request made without authentication token:', url);
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      // Get content type to check if response is HTML (like Rails error pages)
      const contentType = response.headers.get('content-type') || '';
      const isHTML = contentType.includes('text/html');
      
      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401) {
        // Clear invalid token
        localStorage.removeItem(AUTH_CONFIG.tokenKey);
        localStorage.removeItem(AUTH_CONFIG.userKey);
        
        // Show toast notification for authorization failure
        toast({
          title: "Authentication Failed",
          description: "Your session has expired. Please login again.",
          variant: "destructive",
        });
        
        // Redirect to login page after a short delay
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
        
        throw new Error('Authentication failed. Please login again.');
      }

      // Try to parse error response
      let errorMessage = `Request failed with status ${response.status}`;
      
      if (isHTML) {
        // If response is HTML (like Rails error pages), extract meaningful message
        const errorText = await response.text();
        // Try to extract error message from HTML
        const match = errorText.match(/<h2[^>]*>([^<]+)<\/h2>/i) || 
                      errorText.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (match && match[1]) {
          errorMessage = match[1].trim();
        } else {
          errorMessage = `Server error (${response.status}). The requested resource was not found.`;
        }
      } else {
        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.message || errorJson.error || errorJson.errors?.join(', ') || errorMessage;
            } catch {
              // If not JSON, use the text directly (but truncate if too long)
              errorMessage = errorText.length > 200 ? errorText.substring(0, 200) + '...' : errorText;
            }
          }
        } catch {
          // If we can't parse the error, use default message
        }
      }

      // Show toast notification for errors
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      // Create error and mark it as having shown toast (to prevent duplicate logging)
      const error = new Error(errorMessage);
      (error as any).toastShown = true;
      (error as any).statusCode = response.status;
      throw error;
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text);
  } catch (error) {
    // Only show toast for errors that weren't already handled above
    // (Network errors, JSON parse errors, etc.)
    if (error instanceof Error) {
      // Skip if toast was already shown (401 or other HTTP errors)
      if ((error as any).toastShown || error.message.includes('Authentication failed')) {
        // Don't log to console if we've already shown a toast to the user
        // The error is still thrown so calling code can handle it if needed
        throw error;
      }
      
      // Check if it's a network error
      if (error.message.includes('fetch') || error.message.includes('Network') || error instanceof TypeError) {
        toast({
          title: "Network Error",
          description: "Unable to connect to the server. Please check your internet connection.",
          variant: "destructive",
        });
        (error as any).toastShown = true;
      } else {
        // Show generic error toast for unexpected errors
        toast({
          title: "Error",
          description: error.message || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
        (error as any).toastShown = true;
      }
    }
    
    // Only log to console if we haven't shown a toast (for debugging purposes)
    // Errors that have shown toasts are still thrown for calling code to handle
    if (!(error instanceof Error) || !(error as any).toastShown) {
      console.error('API request error:', error);
    }
    
    throw error;
  }
};

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

/**
 * Get document URL for uploaded files
 * @param documentPath - The document path from the database
 * @param download - Whether to force download (adds download=true parameter)
 * @returns The complete URL for accessing the document
 */
export const getDocumentUrl = (documentPath: string, download: boolean = false): string => {
  if (!documentPath) return ""

  // If it's already a full URL, return as is
  if (documentPath.startsWith('http')) {
    return documentPath
  }

  let baseUrl: string

  // If the path already includes 'uploads/', don't add it again
  if (documentPath.startsWith('uploads/')) {
    baseUrl = getApiUrl(documentPath)
  } else {
    // Construct the proper URL for uploaded files
    baseUrl = getApiUrl(`uploads/${documentPath}`)
  }

  // Add download parameter if needed
  if (download) {
    const separator = baseUrl.includes('?') ? '&' : '?'
    return `${baseUrl}${separator}download=true`
  }

  return baseUrl
}

/**
 * Get file type from filename
 * @param filename - The filename
 * @returns The file type/extension
 */
export const getFileType = (filename: string): string => {
  if (!filename) return "pdf"
  const extension = filename.split('.').pop()?.toLowerCase()
  return extension || "pdf"
}

/**
 * Get display name from filename
 * @param filename - The filename
 * @param defaultName - Default name if filename is invalid
 * @returns The display name
 */
export const getDisplayName = (filename: string, defaultName: string): string => {
  if (!filename) return defaultName
  if (filename.includes('/')) {
    return filename.split('/').pop() || defaultName
  }
  return filename
}

export default {
  getApiUrl,
  getEndpointUrl,
  apiRequest,
  getDocumentUrl,
  getFileType,
  getDisplayName,
  API_ENDPOINTS,
  API_BASE_URL,
};
