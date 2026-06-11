import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "@/shared/context/UserContext";
import AppLoadingScreen from "@/shared/components/AppLoadingScreen";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { account, loading } = useUser();

  if (loading) return <AppLoadingScreen />;
  if (!account) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(account.role ?? "")) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
