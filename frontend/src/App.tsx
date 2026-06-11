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
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import TitleSetter from "./shared/components/TittleSetter";
import Header from "./shared/components/Header";
import SessionExpiredModal from "./shared/modals/SessionExpiredModal";
import AppLoadingScreen from "./shared/components/AppLoadingScreen";
import Login from "./shared/pages/Login";
import Logout from "./shared/pages/Logout";
import AuthCallback from "./shared/pages/AuthCallback";
import ForgotPassword from "./shared/pages/ForgotPassword";
import ResetPassword from "./shared/pages/ResetPassword";
import MetricsDashboard from "./shared/pages/MetricsDashboard";
import FunFactsPage from "./shared/pages/FunFactsPage";
import InstructionsPage from "./shared/pages/InstructionsPage";
import UserPage from "./shared/pages/UserPage";

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

          <Route path="/metrics" element={<Navigate to="/metricas" replace />} />
          <Route path="/instructions" element={<Navigate to="/instrucciones" replace />} />
          <Route path="/admin" element={<Navigate to="/metricas" replace />} />
          <Route path="/manager" element={<Navigate to="/metricas" replace />} />
          <Route path="/viewer" element={<Navigate to="/metricas" replace />} />
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
