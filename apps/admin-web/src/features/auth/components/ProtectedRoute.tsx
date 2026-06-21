import AppLoadingScreen from "@/shared/components/AppLoadingScreen";
import { useUser } from "@/shared/context/UserContext";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { account, loading } = useUser();

  if (loading) return <AppLoadingScreen />;

  if (!account) return <Navigate to="/login" replace />;

  if (!account.role || account.isActive !== true) {
    return <Navigate to="/logout?reason=unauthorized" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(account.role.toUpperCase())) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}