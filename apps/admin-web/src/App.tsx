declare global {
  interface Window {
    __forceSessionExpired?: () => void;
  }
}

import ControlPanelPage from "@/features/admin/pages/ControlPanelPage";
import AdminConfigPage from "@/features/admin/pages/UniversitiesPage";
import UsersPage from "@/features/admin/pages/UsersPage";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import AuthCallback from "@/features/auth/pages/AuthCallback";
import ForgotPassword from "@/features/auth/pages/ForgotPassword";
import Login from "@/features/auth/pages/Login";
import Logout from "@/features/auth/pages/Logout";
import ResetPassword from "@/features/auth/pages/ResetPassword";
import FunFactsPage from "@/features/manager/pages/FunFactsPage";
import InstructionsPage from "@/features/manager/pages/InstructionsPage";
import MetricsPage from "@/features/manager/pages/MetricsPage";
import { useEffect, useState } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import AppLoadingScreen from "./shared/components/AppLoadingScreen";
import Header from "./shared/components/Header";
import TitleSetter from "./shared/components/TittleSetter";
import { UserProvider, useUser } from "./shared/context/UserContext";
import SessionExpiredModal from "./shared/modals/SessionExpiredModal";

function RootEntry() {
  const { account, loading } = useUser();

  if (loading) return <AppLoadingScreen />;
  if (!account) return <Navigate to="/login" replace />;

  const role = (account.role ?? "").toUpperCase();
  if (role === "ADMIN") return <Navigate to="/config/users" replace />;
  if (role === "MANAGER") return <Navigate to="/metrics" replace />;

  return <Navigate to="/logout?reason=unauthorized" replace />;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { account, loading } = useUser();

  if (loading) return <AppLoadingScreen />;

  if (account) return <Navigate to="/" replace />;

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

          <Route element={<ProtectedRoute allowedRoles={["MANAGER"]} />}>
            <Route path="/metrics" element={<MetricsPage />} />
            <Route path="/fun-facts" element={<FunFactsPage />} />
            <Route path="/instructions" element={<InstructionsPage />} />
            <Route path="/recycling-points" element={<InstructionsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/config/users" element={<UsersPage />} />
            <Route path="/config/universities" element={<AdminConfigPage />} />
          </Route>
          <Route path="/control-panel" element={<ControlPanelPage />} />

          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/unauthorized" element={<Navigate to="/logout" replace />} />
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