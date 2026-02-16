# Role Permissions Management UI

## Overview

A comprehensive, modern UI for managing user roles and permissions in the BevyHR system. This interface allows administrators to create, edit, and manage role-based access control (RBAC) with granular permission settings.

## Features

### 🎯 Core Functionality
- **Role Management**: Create, view, and edit user roles
- **Permission Control**: Granular permission toggles for each role
- **Module-based Organization**: Permissions grouped by system modules
- **Visual Feedback**: Clear indicators for granted/denied permissions
- **Search & Filter**: Find roles and filter permissions by module

### 🎨 User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional interface using shadcn/ui components
- **Interactive Elements**: Smooth animations and hover effects
- **Accessibility**: Proper ARIA labels and keyboard navigation

### 🔧 Technical Features
- **TypeScript**: Fully typed for better development experience
- **State Management**: Local state with React hooks
- **Mock Data**: Ready-to-use sample data for development
- **API Ready**: Structured for easy backend integration

## Navigation Path

```
Settings → Users → "Manage Roles & Permissions" → Role Permissions Editor
```

## File Structure

```
frontend/
├── components/
│   └── role-permissions-editor.tsx     # Main component
├── app/
│   ├── settings/
│   │   ├── page.tsx                    # Updated settings page
│   │   └── role-permissions/
│   │       └── page.tsx                # Dedicated role permissions page
│   └── demo/
│       └── role-permissions/
│           └── page.tsx                # Demo page for testing
```

## Usage

### 1. Access the Interface

Navigate to **Settings → Users** and click **"Manage Roles & Permissions"** or use the direct URL:
```
/settings/role-permissions
```

### 2. Role Management

- **Select a Role**: Click on any role from the left sidebar
- **View Permissions**: See all permissions organized by module
- **Edit Mode**: Click "Edit Permissions" to enable editing
- **Toggle Permissions**: Use switches to grant/deny specific permissions
- **Save Changes**: Click "Save Changes" to persist modifications

### 3. Create New Roles

- Click **"Create Role"** button
- Enter role name and description
- New role starts with no permissions (can be edited after creation)

### 4. Filter and Search

- **Search Roles**: Use the search bar to find specific roles
- **Filter Permissions**: Select a module to show only related permissions
- **Permission Summary**: View granted vs total permissions at a glance

## Available Roles (Mock Data)

| Role | Users | Description | Access Level |
|------|-------|-------------|--------------|
| Super Admin | 2 | Full system access with all permissions | 100% |
| HR Manager | 5 | Human resources management and employee oversight | ~75% |
| Department Head | 12 | Team management and department oversight | ~50% |
| Employee | 229 | Basic employee access and self-service portal | ~10% |

## Permission Modules

The system includes permissions for the following modules:

- 👥 **Employee Management** - Employee CRUD operations
- 💰 **Payroll** - Payroll processing and management
- ⏰ **Attendance** - Attendance tracking and approval
- 🏖️ **Leave Management** - Leave requests and approvals
- 🎯 **Recruitment** - Candidate management
- 💼 **Interviews** - Interview scheduling and management
- 📊 **Performance** - Performance reviews and goals
- 🏢 **Asset Management** - Company asset tracking
- 📈 **Reports** - System reports and analytics
- 👤 **User Management** - User account management
- 🔐 **Role Management** - Role and permission management
- ⚙️ **Permissions** - Permission configuration
- 🔧 **System Settings** - System configuration

## Backend Integration

### API Endpoints (To Be Implemented)

```typescript
// Get all roles
GET /api/roles

// Get role with permissions
GET /api/roles/:id

// Update role permissions
PATCH /api/roles/:id/permissions

// Create new role
POST /api/roles

// Get all permissions
GET /api/permissions
```

### Authentication

The UI expects JWT authentication. Include the token in API requests:

```typescript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Data Structure

```typescript
interface Role {
  id: number
  name: string
  description: string
  userCount: number
  permissions: Permission[]
}

interface Permission {
  id: number
  name: string
  resource: string
  action: string
  description: string
  granted: boolean
}
```

## Demo Mode

Access the interactive demo at:
```
/demo/role-permissions
```

The demo includes:
- Full functionality with mock data
- Interactive permission toggles
- Role creation simulation
- Visual feedback and animations

## Customization

### Styling
- Uses Tailwind CSS for styling
- shadcn/ui components for consistent design
- Customizable color scheme and spacing

### Adding New Modules
1. Add module info to `permissionModules` array
2. Include corresponding permissions in mock data
3. Update backend to provide new permissions

### Extending Functionality
- Add bulk permission operations
- Implement permission templates
- Add role inheritance
- Include audit logging

## Development Notes

- **Mock Data**: Currently uses static data for development
- **State Management**: Local React state (consider Redux for complex scenarios)
- **Error Handling**: Basic error handling with toast notifications
- **Loading States**: Simulated loading states for API calls
- **Responsive**: Mobile-first responsive design

## Next Steps

1. **Backend Integration**: Connect to actual API endpoints
2. **Authentication**: Implement JWT token management
3. **Error Handling**: Add comprehensive error handling
4. **Testing**: Add unit and integration tests
5. **Documentation**: Add inline code documentation
6. **Performance**: Optimize for large datasets
7. **Accessibility**: Enhance accessibility features

## Support

For questions or issues with the Role Permissions UI, please refer to the component documentation or contact the development team.
