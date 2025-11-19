# Role-Based UI Implementation Plan

## 🎯 Goal
Create role-specific dashboards and navigation for SuperAdmin, Admin, Manager, and Guest users.

**Backend:** No changes needed - authorization already in place  
**Frontend:** Full role-based UI implementation

---

## 📋 Implementation Tasks

### **Phase 1: Auth Store Enhancement** ✅

Add role helper methods to `authStore.ts`:

```typescript
// Already exists:
hasRole: (role: string) => boolean
hasAnyRole: (roles: string[]) => boolean

// Add these:
isSuperAdmin: () => boolean
isAdmin: () => boolean
isManager: () => boolean
isGuest: () => boolean
```

---

### **Phase 2: Permission Hook**

Create `hooks/usePermissions.ts`:

```typescript
export const usePermissions = () => {
  const { user, hasRole } = useAuthStore();
  
  return {
    // Role checks
    isSuperAdmin: hasRole('SuperAdmin'),
    isAdmin: hasRole('Admin'),
    isManager: hasRole('Manager'),
    isGuest: hasRole('Guest'),
    
    // Feature permissions
    canManageUsers: hasRole('SuperAdmin'),
    canCreateHotels: hasRole('SuperAdmin') || hasRole('Admin'),
    canEditHotels: hasRole('SuperAdmin') || hasRole('Admin'),
    canManageRooms: hasRole('SuperAdmin') || hasRole('Admin') || hasRole('Manager'),
    canManageReservations: hasRole('SuperAdmin') || hasRole('Admin') || hasRole('Manager'),
    canViewGuests: hasRole('SuperAdmin') || hasRole('Admin') || hasRole('Manager'),
  };
};
```

---

### **Phase 3: Dashboard Router**

Update `app/dashboard/page.tsx` to redirect based on role:

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!user) {
      router.push('/login');
      return;
    }

    // Redirect based on role
    if (user.roles.includes('SuperAdmin')) {
      router.push('/dashboard/admin');
    } else if (user.roles.includes('Admin')) {
      router.push('/dashboard/admin');
    } else if (user.roles.includes('Manager')) {
      router.push('/dashboard/operations');
    } else if (user.roles.includes('Guest')) {
      router.push('/dashboard/guest');
    } else {
      router.push('/dashboard/admin'); // Default
    }
  }, [user, _hasHydrated, router]);

  return <div>Loading...</div>;
}
```

---

### **Phase 4: Role-Specific Dashboards**

Create three main dashboard types:

#### **1. Admin Dashboard** (`app/dashboard/admin/page.tsx`)

**For:** SuperAdmin, Admin, Manager

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import { Hotel, Users, Bed, Calendar } from 'lucide-react';

export default function AdminDashboard() {
  const permissions = usePermissions();
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {permissions.canManageUsers && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Hotels</CardTitle>
            <Hotel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
        
        {/* More cards... */}
      </div>
      
      {/* SuperAdmin-specific: User Management */}
      {permissions.canManageUsers && (
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            {/* User table component */}
          </CardContent>
        </Card>
      )}
      
      {/* Hotel Owner: Hotel Stats */}
      {permissions.canManageRooms && (
        <Card>
          <CardHeader>
            <CardTitle>Hotel Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Occupancy chart, recent reservations */}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

#### **2. Operations Dashboard** (`app/dashboard/operations/page.tsx`)

**For:** Manager (optional, or reuse admin dashboard)

```typescript
// Focus on today's operations
export default function OperationsDashboard() {
  return (
    <div className="space-y-6">
      <h2>Today's Operations</h2>
      
      {/* Check-ins Today */}
      <Card>
        <CardHeader>
          <CardTitle>Check-ins Today</CardTitle>
        </CardHeader>
        <CardContent>
          {/* List of today's check-ins */}
        </CardContent>
      </Card>
      
      {/* Check-outs Today */}
      {/* Room Status */}
    </div>
  );
}
```

#### **3. Guest Dashboard** (`app/dashboard/guest/page.tsx`)

**For:** Guest users

```typescript
'use client';

export default function GuestDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">My Reservations</h2>
      
      {/* Upcoming Reservations */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Stays</CardTitle>
        </CardHeader>
        <CardContent>
          {/* List of upcoming reservations */}
        </CardContent>
      </Card>
      
      {/* Search Available Rooms */}
      <Card>
        <CardHeader>
          <CardTitle>Book a Room</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search form */}
        </CardContent>
      </Card>
      
      {/* Past Reservations */}
      <Card>
        <CardHeader>
          <CardTitle>Past Stays</CardTitle>
        </CardHeader>
        <CardContent>
          {/* History */}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### **Phase 5: Navigation Component**

Update navigation to show role-appropriate items:

```typescript
// components/layout/Sidebar.tsx or Navigation.tsx

const getNavigationItems = (permissions: ReturnType<typeof usePermissions>) => {
  const items = [];
  
  // Dashboard (all roles)
  items.push({ 
    label: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard 
  });
  
  // SuperAdmin only
  if (permissions.canManageUsers) {
    items.push({ 
      label: 'Users', 
      href: '/dashboard/users', 
      icon: Users 
    });
  }
  
  // Admin/Manager
  if (permissions.canEditHotels || permissions.canManageRooms) {
    items.push({ 
      label: 'Hotels', 
      href: '/dashboard/hotels', 
      icon: Hotel 
    });
  }
  
  if (permissions.canManageRooms) {
    items.push({ 
      label: 'Rooms', 
      href: '/dashboard/rooms', 
      icon: Bed 
    });
  }
  
  if (permissions.canManageReservations) {
    items.push({ 
      label: 'Reservations', 
      href: '/dashboard/reservations', 
      icon: Calendar 
    });
    
    items.push({ 
      label: 'Guests', 
      href: '/dashboard/guests', 
      icon: Users 
    });
  }
  
  // Guest only
  if (permissions.isGuest) {
    items.push({ 
      label: 'My Reservations', 
      href: '/dashboard/guest/reservations', 
      icon: Calendar 
    });
    
    items.push({ 
      label: 'Search Hotels', 
      href: '/dashboard/guest/search', 
      icon: Search 
    });
  }
  
  return items;
};
```

---

### **Phase 6: Conditional UI Components**

Create wrapper components for permission-based rendering:

```typescript
// components/auth/PermissionGuard.tsx

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermission?: keyof ReturnType<typeof usePermissions>;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ 
  children, 
  requiredRoles, 
  requiredPermission,
  fallback = null 
}: PermissionGuardProps) {
  const { user } = useAuthStore();
  const permissions = usePermissions();
  
  // Check roles
  if (requiredRoles) {
    const hasRole = requiredRoles.some(role => 
      user?.roles.includes(role)
    );
    if (!hasRole) return <>{fallback}</>;
  }
  
  // Check permission
  if (requiredPermission) {
    if (!permissions[requiredPermission]) return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// Usage:
<PermissionGuard requiredRoles={['SuperAdmin']}>
  <Button>Manage Users</Button>
</PermissionGuard>

<PermissionGuard requiredPermission="canCreateHotels">
  <Button>Create Hotel</Button>
</PermissionGuard>
```

---

### **Phase 7: Route Protection**

Create middleware for protected routes:

```typescript
// middleware.ts (root level)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-storage')?.value;
  
  // Check if trying to access dashboard without auth
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Add role-based route protection here if needed
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};
```

---

## 🎨 UI/UX Guidelines

### **SuperAdmin Dashboard Focus:**
- Clean, administrative interface
- User management table
- Hotel list (with owners shown)
- System-wide stats
- Minimal operational details

### **Admin Dashboard Focus:**
- Hotel-centric view
- If multiple hotels: dropdown selector
- Occupancy charts
- Revenue tracking
- Operational management

### **Manager Dashboard Focus:**
- Operations-focused
- Today's check-ins/check-outs
- Room status at a glance
- Quick actions

### **Guest Dashboard Focus:**
- Consumer-friendly
- My reservations front and center
- Easy search/booking flow
- Simple, clean interface

---

## 📱 Responsive Considerations

- Mobile: Simplified navigation
- Tablet: Full navigation but compact
- Desktop: Full featured

---

## 🔄 Redirect Logic

**On Login:**
```
SuperAdmin → /dashboard/admin (with user management visible)
Admin → /dashboard/admin (hotel management visible)
Manager → /dashboard/admin (operations visible)
Guest → /dashboard/guest
```

**On Direct URL Access:**
- Check permissions
- Redirect if unauthorized
- Show 403 page if persistent

---

## ✅ Implementation Checklist

### **Week 1: Foundation**
- [ ] Add role helper methods to authStore
- [ ] Create usePermissions hook
- [ ] Create PermissionGuard component
- [ ] Update dashboard router (redirect logic)

### **Week 2: Dashboards**
- [ ] Create admin dashboard layout
- [ ] Add SuperAdmin-specific sections (user management)
- [ ] Add Admin-specific sections (hotel stats)
- [ ] Create guest dashboard

### **Week 3: Navigation & Routes**
- [ ] Update navigation component with role-based items
- [ ] Add route protection middleware
- [ ] Test all role redirects

### **Week 4: Polish & Testing**
- [ ] Test each role end-to-end
- [ ] Responsive testing
- [ ] Add loading states
- [ ] Error handling
- [ ] Documentation

---

## 🧪 Testing Scenarios

**Test as SuperAdmin:**
- [ ] Can see user management
- [ ] Can see all hotels (list)
- [ ] Navigation shows: Dashboard, Users, Hotels

**Test as Admin:**
- [ ] Can create hotels
- [ ] Can see own hotels only
- [ ] Can manage rooms and reservations
- [ ] Navigation shows: Dashboard, Hotels, Rooms, Reservations, Guests

**Test as Manager:**
- [ ] Cannot create hotels
- [ ] Can manage rooms and reservations
- [ ] Same navigation as Admin

**Test as Guest:**
- [ ] Can only see own reservations
- [ ] Can search and book
- [ ] Navigation shows: Dashboard, My Reservations, Search Hotels

---

## 📂 File Structure

```
app/
├── dashboard/
│   ├── page.tsx (router/redirect)
│   ├── admin/
│   │   └── page.tsx (SuperAdmin/Admin/Manager dashboard)
│   ├── guest/
│   │   └── page.tsx (Guest dashboard)
│   ├── hotels/ (existing, add permission checks)
│   ├── rooms/ (existing, add permission checks)
│   ├── reservations/ (existing, add permission checks)
│   └── users/ (new, SuperAdmin only)
│       └── page.tsx

components/
├── auth/
│   ├── PermissionGuard.tsx
│   └── RoleGuard.tsx
├── dashboard/
│   ├── AdminDashboard.tsx
│   ├── GuestDashboard.tsx
│   └── StatsCard.tsx
└── layout/
    └── Navigation.tsx (updated with role-based items)

hooks/
└── usePermissions.ts

store/
└── authStore.ts (enhanced)
```

---

## 🚀 Next Steps

1. **Start with Phase 1**: Enhance authStore
2. **Then Phase 2**: Create usePermissions hook
3. **Phase 3**: Dashboard router
4. **Phase 4**: Build dashboards
5. **Phase 5**: Update navigation
6. **Phase 6**: Add PermissionGuard
7. **Test thoroughly**

---

Ready to start? Let's begin with Phase 1! 🎯
