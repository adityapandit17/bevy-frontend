# Environment Setup Guide

## API Configuration

Your HRMS frontend application now uses environment variables for API configuration instead of hardcoded URLs.

### Environment Variables

Create a `.env.local` file in your project root with the following content:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### For Different Environments

#### Development
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

#### Production
```bash
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
```

#### Staging
```bash
NEXT_PUBLIC_API_BASE_URL=https://staging-api.your-domain.com
```

### How It Works

1. **Centralized Configuration**: All API URLs are now managed through `/lib/api.ts`
2. **Environment Variables**: The base URL is configurable via `NEXT_PUBLIC_API_BASE_URL`
3. **Type Safety**: All endpoints are defined as constants in the API configuration
4. **Easy Maintenance**: Change the API URL in one place (environment variable) to update the entire application

### API Endpoints

The following endpoints are now configurable:
- Dashboard stats
- Employees
- Departments
- Job openings
- Interviews
- Attendance records
- Leave requests
- Payroll
- Salary structures
- Company settings
- Onboarding
- ATS (Applicant Tracking System)
- Assets

### Usage in Code

Instead of hardcoded URLs like:
```javascript
fetch("http://localhost:3000/employees")
```

Use the centralized API functions:
```javascript
import { getEndpointUrl, getApiUrl } from "@/lib/api"

// For predefined endpoints
fetch(getEndpointUrl('EMPLOYEES'))

// For custom endpoints
fetch(getApiUrl('employees/123'))
```

### Next Steps

1. Create your `.env.local` file with the appropriate API URL
2. Restart your development server
3. Your application will now use the configured API URL
