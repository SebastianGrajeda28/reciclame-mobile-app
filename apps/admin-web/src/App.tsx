declare global {
  interface Window {
    __forceSessionExpired?: () => void;
  }
}

import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { UserProvider } from "./shared/context/UserContext";
import { useUser } from "./shared/context/UserContext";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import TitleSetter from "./shared/components/TittleSetter";
import Header from "./shared/components/Header";
import SessionExpiredModal from "./shared/modals/SessionExpiredModal";
import AppLoadingScreen from "./shared/components/AppLoadingScreen";
import Login from "@/features/auth/pages/Login";
import Logout from "@/features/auth/pages/Logout";
import AuthCallback from "@/features/auth/pages/AuthCallback";
import ForgotPassword from "@/features/auth/pages/ForgotPassword";
import ResetPassword from "@/features/auth/pages/ResetPassword";
import MetricsDashboard from "@/features/dashboard/pages/MetricsDashboard";
import FunFactsPage from "@/features/content/pages/FunFactsPage";
import InstructionsPage from "@/features/content/pages/InstructionsPage";
import UserPage from "@/features/account/pages/UserPage";
import AdminPanel from "@/features/admin/pages/AdminPanel";
import ManagerPanel from "@/features/admin/pages/ManagerPanel";
import ViewerPanel from "@/features/admin/pages/ViewerPanel";
import UsersPage from "@/features/admin/pages/UsersPage";
import AdminConfigPage from "@/features/admin/pages/AdminConfigPage";

function RootEntry() {
  const { account, loading } = useUser();

  if (loading) return <AppLoadingScreen />;
  if (!account) return <Navigate to="/login" replace />;
  return <Navigate to="/metricas" replace />;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { account, loading } = useUser();

  if (loading) return <AppLoadingScreen />;
  if (account) return <Navigate to="/metricas" replace />;
  return <>{children}</>;
}

function AppShell() {
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    window.__forceSessionExpired = () => setSessionExpired(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f8f6] text-slate-900">
      <SessionExpiredModal open={sessionExpired} />
      <TitleSetter />
      <Header />
      <main className="min-h-screen pt-20">
        <Routes>
          <Route path="/" element={<RootEntry />} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
          <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />

          <Route element={<ProtectedRoute />}>
            <Route path="/metricas" element={<MetricsDashboard />} />
            <Route path="/fun-facts" element={<FunFactsPage />} />
            <Route path="/instrucciones" element={<InstructionsPage />} />
            <Route path="/mi-cuenta" element={<UserPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["VIEWER"]} />}>
            <Route path="/viewer" element={<ViewerPanel />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]} />}>
            <Route path="/manager" element={<ManagerPanel />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/accounts" element={<UsersPage />} />
            <Route path="/admin/fun-facts" element={<Navigate to="/fun-facts" replace />} />
            <Route path="/admin/config" element={<AdminConfigPage />} />
          </Route>
          <Route path="/metrics" element={<Navigate to="/metricas" replace />} />
          <Route path="/instructions" element={<Navigate to="/instrucciones" replace />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/unauthorized" element={<Navigate to="/metricas" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <Router>
        <AppShell />
      </Router>
      <Toaster richColors />
    </UserProvider>
  );
}
