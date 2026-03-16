/**
 * Protected Admin Route
 * Only allows access to users with admin privileges
 */

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ShieldX } from 'lucide-react';

// Admin email whitelist - add your admin emails here
// In production, you might want to store this in Firestore or use Firebase custom claims
const ADMIN_EMAILS = [
  'andrewfights@gmail.com',
  'admin@historybytes.com',
  'andrew@historybytes.com',
];

// Also allow access in development mode for easier testing
const isDevelopment = import.meta.env.DEV;

/**
 * Check if a user email is an admin
 */
export function isAdminUser(email: string | null | undefined): boolean {
  if (!email) return false;

  // In development, allow all authenticated users
  if (isDevelopment) {
    console.log('[AdminRoute] Development mode - allowing admin access for:', email);
    return true;
  }

  return ADMIN_EMAILS.includes(email.toLowerCase());
}

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading, isConfigured } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Firebase not configured - allow access in dev for testing
  if (!isConfigured) {
    if (isDevelopment) {
      console.log('[AdminRoute] Firebase not configured, but allowing in dev mode');
      return <>{children}</>;
    }
    return <Navigate to="/" replace />;
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <ShieldX className="mx-auto mb-4 text-destructive" size={48} />
          <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in with an admin account to access this area.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (!isAdminUser(user.email)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <ShieldX className="mx-auto mb-4 text-destructive" size={48} />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-2">
            Your account ({user.email}) does not have admin privileges.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Contact support if you believe this is an error.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  // User is admin - render children
  return <>{children}</>;
}
