import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireOrganization?: boolean;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles,
  requireOrganization = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, profile, organization } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Lade...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = 
      profile.is_super_admin === true || 
      profile.role === 'super_admin' ||
      allowedRoles.includes(profile.role);

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check organization requirement
  if (requireOrganization && !organization) {
    return <Navigate to="/no-organization" replace />;
  }

  return <>{children}</>;
}

// Convenience components for common role requirements
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'org_admin']}>
      {children}
    </ProtectedRoute>
  );
}

export function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['super_admin']}>
      {children}
    </ProtectedRoute>
  );
}

export function EmployeeRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'org_admin', 'employee']}>
      {children}
    </ProtectedRoute>
  );
}
